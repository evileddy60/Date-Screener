
'use server';
/**
 * @fileOverview An AI agent that finds potential matches between Profile Cards stored in Firestore.
 *
 * - findPotentialMatches - A function that takes a target ProfileCard ID and finds suitable matches from other ProfileCards.
 * - FindPotentialMatchesInput - The input type for the findPotentialMatches function.
 * - FindPotentialMatchesOutput - The return type for the findPotentialMatches function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { 
  getAllProfileCards, 
  getProfileCardById, 
  findExistingPotentialMatch, 
  addPotentialMatch 
} from '@/lib/firestoreService';
import type { ProfileCard, PotentialMatch } from '@/types';

// Simplified ProfileCard for prompt context
const ProfileCardPromptSchema = z.object({
  id: z.string(),
  friendName: z.string(),
  bio: z.string(),
  interests: z.array(z.string()),
  preferences: z.object({
    ageRange: z.string().optional(),
    seeking: z.string().optional(),
    gender: z.string().optional(),
    location: z.string().optional(),
  }).optional(),
  // Added for context, though AI might not use it directly unless prompted
  // createdByMatcherId: z.string(), 
});
type ProfileCardPrompt = z.infer<typeof ProfileCardPromptSchema>;


const FindPotentialMatchesInputSchema = z.object({
  targetProfileCardId: z.string().describe("The ID of the Profile Card for which to find matches."),
  requestingMatcherId: z.string().describe("The ID of the matcher requesting these matches."),
});
export type FindPotentialMatchesInput = z.infer<typeof FindPotentialMatchesInputSchema>;

const AISuggestedMatchSchema = z.object({
  matchedProfileCardId: z.string().describe("The ID of the candidate Profile Card that is a good match."),
  compatibilityScore: z.number().min(0).max(100).describe("A score from 0 to 100 indicating compatibility."),
  compatibilityReason: z.string().describe("A brief (2-3 sentences) explanation for why these two profiles are a good match."),
});

const AIOutputSchema = z.object({
  suggestions: z.array(AISuggestedMatchSchema).describe("An array of suggested matches, ranked from most to least compatible. Should be the top 3-5 matches, or empty if no good matches found."),
});

const FindPotentialMatchesOutputSchema = z.object({
  createdPotentialMatchIds: z.array(z.string()).describe("An array of IDs of the PotentialMatch objects created and stored in Firestore."),
});
export type FindPotentialMatchesOutput = z.infer<typeof FindPotentialMatchesOutputSchema>;


export async function findPotentialMatches(input: FindPotentialMatchesInput): Promise<FindPotentialMatchesOutput> {
  return findPotentialMatchesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'findPotentialMatchesPrompt',
  input: { schema: z.object({
    targetCard: ProfileCardPromptSchema,
    candidateCards: z.array(ProfileCardPromptSchema),
  })},
  output: { schema: AIOutputSchema },
  prompt: `You are a matchmaking assistant. Analyze the following profile cards to determine the best matches between friends. Consider matching preferences (age range, gender, location), shared interests, relationship goals, and personality descriptions. For each potential match, assign a compatibility score out of 100 and explain your reasoning in 2-3 sentences. Present the matches as a ranked list from most to least compatible.

  Target Profile Card:
  ID: {{{targetCard.id}}}
  Name: {{{targetCard.friendName}}}
  Bio: {{{targetCard.bio}}}
  Interests: {{#each targetCard.interests}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}
  Preferences:
    Age Range: {{{targetCard.preferences.ageRange}}}
    Seeking: {{{targetCard.preferences.seeking}}}
    Gender: {{{targetCard.preferences.gender}}}
    Location: {{{targetCard.preferences.location}}}

  Candidate Profile Cards:
  {{#each candidateCards}}
  - Card ID: {{{this.id}}}
    Name: {{{this.friendName}}}
    Bio: {{{this.bio}}}
    Interests: {{#each this.interests}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}
    Preferences:
      Age Range: {{{this.preferences.ageRange}}}
      Seeking: {{{this.preferences.seeking}}}
      Gender: {{{this.preferences.gender}}}
      Location: {{{this.preferences.location}}}
  {{/each}}

  Identify the top 3-5 best potential matches from the candidate list.
  Ensure the response is a JSON object matching the defined output schema.
  Do not suggest a card if it is the same as the target card.
  If no suitable matches are found, return an empty array for 'suggestions'.
  `,
});

const findPotentialMatchesFlow = ai.defineFlow(
  {
    name: 'findPotentialMatchesFlow',
    inputSchema: FindPotentialMatchesInputSchema,
    outputSchema: FindPotentialMatchesOutputSchema,
  },
  async (input) => {
    const allProfileCardsFromDb = await getAllProfileCards(); 

    const targetCardFull = allProfileCardsFromDb.find(pc => pc.id === input.targetProfileCardId);
    if (!targetCardFull) {
      throw new Error(`Target profile card with ID ${input.targetProfileCardId} not found.`);
    }

    const candidateCardsFull = allProfileCardsFromDb.filter(
      pc => pc.id !== input.targetProfileCardId && pc.createdByMatcherId !== targetCardFull.createdByMatcherId
    );

    if (candidateCardsFull.length === 0) {
      return { createdPotentialMatchIds: [] }; 
    }

    const targetCardPromptData: ProfileCardPrompt = {
        id: targetCardFull.id,
        friendName: targetCardFull.friendName,
        bio: targetCardFull.bio,
        interests: targetCardFull.interests,
        preferences: targetCardFull.preferences
    };
    const candidateCardsPromptData: ProfileCardPrompt[] = candidateCardsFull.map(card => ({
        id: card.id,
        friendName: card.friendName,
        bio: card.bio,
        interests: card.interests,
        preferences: card.preferences,
    }));

    const {output} = await prompt({
        targetCard: targetCardPromptData,
        candidateCards: candidateCardsPromptData
    });

    if (!output || !output.suggestions) {
      console.warn("AI prompt did not return suggestions or output was null.");
      return { createdPotentialMatchIds: [] };
    }

    const createdPotentialMatchIds: string[] = [];

    for (const suggestion of output.suggestions) {
      const matchedCardFull = allProfileCardsFromDb.find(pc => pc.id === suggestion.matchedProfileCardId);
      if (!matchedCardFull) {
        console.warn(`Suggested matched card ID ${suggestion.matchedProfileCardId} not found in fetched data.`);
        continue;
      }

      const existingMatch = await findExistingPotentialMatch(targetCardFull.id, matchedCardFull.id);
      if (existingMatch) {
        // If a match record exists where both friends haven't rejected, we don't create a new one.
        // Or if statusMatcherA/B are still pending on existing.
        // This logic can be refined: e.g., only skip if the existing match is still 'pending' for both matchers
        // or if it hasn't been definitively rejected by friends.
        // For now, simple "if exists, skip" to avoid duplicate pending matches.
        if (existingMatch.statusFriendA !== 'rejected' && existingMatch.statusFriendB !== 'rejected') {
            continue;
        }
      }

      const newPotentialMatchData: Omit<PotentialMatch, 'id' | 'createdAt'> = {
        profileCardAId: targetCardFull.id,
        profileCardBId: matchedCardFull.id,
        matcherAId: targetCardFull.createdByMatcherId,
        matcherBId: matchedCardFull.createdByMatcherId,
        compatibilityScore: suggestion.compatibilityScore,
        compatibilityReason: suggestion.compatibilityReason,
        statusMatcherA: 'pending',
        statusMatcherB: 'pending',
        statusFriendA: 'pending',
        statusFriendB: 'pending',
        friendEmailSent: false, // Initialize new field
        // createdAt will be set by addPotentialMatch
      };

      const createdMatch = await addPotentialMatch(newPotentialMatchData); 
      createdPotentialMatchIds.push(createdMatch.id);
    }

    return { createdPotentialMatchIds };
  }
);
