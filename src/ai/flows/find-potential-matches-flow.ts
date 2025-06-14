
'use server';
/**
 * @fileOverview An AI agent that finds potential matches between Profile Cards.
 *
 * - findPotentialMatches - A function that takes a target ProfileCard ID and finds suitable matches from other ProfileCards.
 * - FindPotentialMatchesInput - The input type for the findPotentialMatches function.
 * - FindPotentialMatchesOutput - The return type for the findPotentialMatches function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { mockProfileCards, mockPotentialMatches, mockUserProfiles } from '@/lib/mockData';
import type { ProfileCard, PotentialMatch } from '@/types';

// Simplified ProfileCard for prompt context, to avoid overly large prompts if many cards exist
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
});
type ProfileCardPrompt = z.infer<typeof ProfileCardPromptSchema>;


export const FindPotentialMatchesInputSchema = z.object({
  targetProfileCardId: z.string().describe("The ID of the Profile Card for which to find matches."),
  requestingMatcherId: z.string().describe("The ID of the matcher requesting these matches."),
});
export type FindPotentialMatchesInput = z.infer<typeof FindPotentialMatchesInputSchema>;

const AISuggestedMatchSchema = z.object({
  matchedProfileCardId: z.string().describe("The ID of the candidate Profile Card that is a good match."),
  compatibilityScore: z.number().min(0).max(100).describe("A score from 0 to 100 indicating compatibility."),
  compatibilityReason: z.string().describe("A brief (1-2 sentences) explanation for why these two profiles are a good match."),
});

const AIOutputSchema = z.object({
  suggestions: z.array(AISuggestedMatchSchema).describe("An array of suggested matches. Should be the top 3-5 matches, or empty if no good matches found."),
});

export const FindPotentialMatchesOutputSchema = z.object({
  createdPotentialMatchIds: z.array(z.string()).describe("An array of IDs of the PotentialMatch objects created and stored."),
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
  prompt: `You are an expert matchmaking AI. Your task is to find the best potential matches for a 'targetProfileCard' from a list of 'candidateProfileCards'.

  Target Profile Card:
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

  Analyze the target card and compare it against each candidate card. Consider shared interests, complementary personalities (inferred from bios), alignment in 'seeking' preferences, age range compatibility, gender preferences, and location proximity.

  Identify the top 3-5 best potential matches from the candidate list. For each identified match:
  1. Provide the 'matchedProfileCardId' (the ID of the candidate card).
  2. Assign a 'compatibilityScore' between 0 and 100 (100 being a perfect match).
  3. Write a concise 'compatibilityReason' (1-2 sentences) explaining the key factors that make them a good match.

  If no suitable matches are found, return an empty array for 'suggestions'.
  Do not suggest a card if it is the same as the target card.
  Return your response as a JSON object matching the defined output schema.
  `,
});

const findPotentialMatchesFlow = ai.defineFlow(
  {
    name: 'findPotentialMatchesFlow',
    inputSchema: FindPotentialMatchesInputSchema,
    outputSchema: FindPotentialMatchesOutputSchema,
  },
  async (input) => {
    const targetCardFull = mockProfileCards.find(pc => pc.id === input.targetProfileCardId);
    if (!targetCardFull) {
      throw new Error(`Target profile card with ID ${input.targetProfileCardId} not found.`);
    }

    // Filter out the target card itself and cards created by the same matcher (to avoid self-matching of own cards, for now)
    // Or, allow matching between own cards if desired. For now, let's exclude cards by the same matcher.
    // Update: Let's allow matching with any card not the target card itself. Cross-matcher connections are primary but internal suggestions can also be useful.
    const candidateCardsFull = mockProfileCards.filter(
      pc => pc.id !== input.targetProfileCardId
    );

    if (candidateCardsFull.length === 0) {
      return { createdPotentialMatchIds: [] }; // No candidates to match against
    }
    
    // Transform full cards to simplified prompt schema
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
      const matchedCardFull = mockProfileCards.find(pc => pc.id === suggestion.matchedProfileCardId);
      if (!matchedCardFull) {
        console.warn(`Suggested matched card ID ${suggestion.matchedProfileCardId} not found in mock data.`);
        continue;
      }
      
      // Avoid creating duplicate PotentialMatch if one already exists (simple check by card IDs)
      const existingMatch = mockPotentialMatches.find(pm => 
        (pm.profileCardAId === targetCardFull.id && pm.profileCardBId === matchedCardFull.id) ||
        (pm.profileCardAId === matchedCardFull.id && pm.profileCardBId === targetCardFull.id)
      );

      if (existingMatch) {
        // console.log(`Potential match between ${targetCardFull.id} and ${matchedCardFull.id} already exists (ID: ${existingMatch.id}). Skipping creation.`);
        // Optionally, update existingMatch with new score/reason if AI provides better insight, or just skip.
        // For now, if it exists, we'll just add its ID to the output if it's relevant to the current search.
        // However, the purpose of this flow is to *create new* suggestions. So, if it exists, we probably skip.
        // Let's refine: if it exists and is still pending for the requesting matcher, perhaps we don't create a new one.
        // For simplicity now: if a match record exists, we don't create a new one.
        continue; 
      }


      const newPotentialMatch: PotentialMatch = {
        id: `pm-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        profileCardAId: targetCardFull.id,
        profileCardBId: matchedCardFull.id,
        matcherAId: targetCardFull.createdByMatcherId,
        matcherBId: matchedCardFull.createdByMatcherId,
        compatibilityScore: suggestion.compatibilityScore,
        compatibilityReason: suggestion.compatibilityReason,
        statusMatcherA: 'pending', // Status for the matcher of profileCardAId
        statusMatcherB: 'pending', // Status for the matcher of profileCardBId
        // Friend statuses remain undefined until matchers accept
        createdAt: new Date().toISOString(),
      };

      mockPotentialMatches.push(newPotentialMatch);
      createdPotentialMatchIds.push(newPotentialMatch.id);
    }
    
    return { createdPotentialMatchIds };
  }
);
