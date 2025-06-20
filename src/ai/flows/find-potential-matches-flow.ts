
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
  // getProfileCardById, // Not directly used in flow logic, but available
  findExistingPotentialMatch, 
  addPotentialMatch 
} from '@/lib/firestoreService';
import type { ProfileCard, PotentialMatch } from '@/types';
import { EDUCATION_LEVEL_OPTIONS } from '@/types';


const ProfileCardPromptSchema = z.object({
  id: z.string(),
  friendName: z.string(),
  friendAge: z.number().optional().describe("The actual age of the friend this profile card represents. May not be present for older cards."),
  friendGender: z.enum(["Man", "Woman", "Other"]).optional().describe("The gender of the friend this profile card represents."),
  friendPostalCode: z.string().optional().describe("The Canadian postal code of the friend (e.g., M5V2T6). This is the reference for their location preference."),
  educationLevel: z.enum(EDUCATION_LEVEL_OPTIONS).optional().describe("The highest education level achieved by the friend."),
  occupation: z.string().optional().describe("The friend's current or most recent occupation or field of work."),
  bio: z.string(),
  interests: z.array(z.string()),
  photoUrl: z.string().optional().describe("An HTTP/HTTPS URL to the friend's photo. This can be used with {{media url=photoUrl}}."),
  preferences: z.object({
    ageRange: z.string().optional().describe("The preferred age range for a match, e.g., '25-35'."),
    seeking: z.string().optional().describe("What the friend is seeking in a match, e.g., 'Long-term relationship, Companionship'."), 
    gender: z.string().optional().describe("The gender the friend is interested in matching with, e.g., 'Men', 'Women', 'Other'."), // This is gender they are *seeking*
    location: z.string().optional().describe("The preferred proximity for a match, as a string like '50 km'. This is relative to their friendPostalCode."),
  }).optional(),
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
  prompt: `You are a matchmaking assistant. Analyze the following profile cards to determine the best matches between friends.
  
  Key matching criteria:
  1.  **Age Compatibility**: The 'friendAge' of one card should ideally fall within the 'ageRange' specified in the preferences of the other card, and vice-versa. If a card's 'friendAge' is not provided, this aspect cannot be strictly assessed for that card. The 'ageRange' preference is a string like "min-max".
  2.  **Gender Compatibility**: The 'friendGender' of one card must align with the 'gender' preference (gender sought) of the other card, and vice-versa. For example, if Target Card's friend is "Woman" and they are seeking "Men", a Candidate Card's friend should be "Man". If a preference or friend's gender is "Other" or not provided, be more flexible but prioritize stated preferences.
  3.  **Location Compatibility**: Each card may have a 'friendPostalCode' (e.g., M5V2T6) and a 'preferences.location' (e.g., 'within 50 km'). The 'preferences.location' indicates a desired search radius FROM THEIR OWN POSTAL CODE. While you cannot calculate exact distances, give higher compatibility if their postal codes and preferred proximities suggest they could realistically meet. For instance, two cards with Toronto postal codes (e.g., 'M5W1E6' and 'M4P2G2') and '20 km' preferences are more compatible location-wise than a Toronto card and a Vancouver card if both have '20 km' preferences. If postal codes are missing, rely on the stated 'preferences.location' more generally, assuming it's from a meaningful (but unspecified) anchor point.
  4.  **Education & Occupation**: Consider the 'educationLevel' and 'occupation' fields. While direct matches aren't always necessary, think about potential for shared experiences, lifestyle alignment, or intellectual compatibility. For example, two individuals with advanced degrees in similar fields might have more in common, or someone in a demanding profession might pair well with someone understanding of such a lifestyle. Do not penalize if this information is not provided.
  5.  **Mutual Preferences**: Consider stated preferences for 'seeking' (relationship goals).
  6.  **Shared Interests & Bio**: Look for common interests and complementary personality traits described in their bios.
  7.  **Visual Impression (If Photo Provided)**: If a photo is provided (via photoUrl, which will be an HTTP/HTTPS URL), consider if it gives a compatible impression with the other profile's description and photo (if available). Use {{media url=photoUrl}} to reference the photo.

  For each potential match, assign a compatibility score out of 100 and explain your reasoning in 2-3 sentences. Present the matches as a ranked list from most to least compatible.

  Target Profile Card:
  ID: {{{targetCard.id}}}
  Name: {{{targetCard.friendName}}}
  Actual Age: {{#if targetCard.friendAge}}{{{targetCard.friendAge}}}{{else}}Not Provided{{/if}}
  Gender: {{#if targetCard.friendGender}}{{{targetCard.friendGender}}}{{else}}Not Provided{{/if}}
  Postal Code: {{#if targetCard.friendPostalCode}}{{{targetCard.friendPostalCode}}}{{else}}Not Provided{{/if}}
  Education: {{#if targetCard.educationLevel}}{{{targetCard.educationLevel}}}{{else}}Not Provided{{/if}}
  Occupation: {{#if targetCard.occupation}}{{{targetCard.occupation}}}{{else}}Not Provided{{/if}}
  Bio: {{{targetCard.bio}}}
  Interests: {{#each targetCard.interests}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}
  {{#if targetCard.photoUrl}}Photo: {{media url=targetCard.photoUrl}} {{/if}}
  Preferences for a Match:
    Preferred Age Range: {{{targetCard.preferences.ageRange}}}
    Seeking: {{{targetCard.preferences.seeking}}}
    Interested in Gender: {{{targetCard.preferences.gender}}}
    Preferred Proximity: {{{targetCard.preferences.location}}}

  Candidate Profile Cards:
  {{#each candidateCards}}
  - Card ID: {{{this.id}}}
    Name: {{{this.friendName}}}
    Actual Age: {{#if this.friendAge}}{{{this.friendAge}}}{{else}}Not Provided{{/if}}
    Gender: {{#if this.friendGender}}{{{this.friendGender}}}{{else}}Not Provided{{/if}}
    Postal Code: {{#if this.friendPostalCode}}{{{this.friendPostalCode}}}{{else}}Not Provided{{/if}}
    Education: {{#if this.educationLevel}}{{{this.educationLevel}}}{{else}}Not Provided{{/if}}
    Occupation: {{#if this.occupation}}{{{this.occupation}}}{{else}}Not Provided{{/if}}
    Bio: {{{this.bio}}}
    Interests: {{#each this.interests}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}
    {{#if this.photoUrl}}Photo: {{media url=this.photoUrl}} {{/if}}
    Preferences for a Match:
      Preferred Age Range: {{{this.preferences.ageRange}}}
      Seeking: {{{this.preferences.seeking}}}
      Interested in Gender: {{{this.preferences.gender}}}
      Preferred Proximity: {{{this.preferences.location}}}
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
      console.log("No candidate cards found after filtering for different matcher and non-target.");
      return { createdPotentialMatchIds: [] }; 
    }
    
    const formatSeekingForPrompt = (seeking: string[] | string | undefined): string | undefined => {
      if (Array.isArray(seeking)) return seeking.join(', ');
      return seeking;
    };

    // Defensive function to ensure only valid HTTP/HTTPS URLs are passed to the prompt's media helper.
    const formatPhotoUrlForPrompt = (url?: string | null): string | undefined => {
        if (typeof url === 'string' && url.trim().startsWith('http')) {
            return url.trim();
        }
        return undefined;
    }

    const targetCardPromptData: ProfileCardPrompt = {
        id: targetCardFull.id,
        friendName: targetCardFull.friendName,
        friendAge: targetCardFull.friendAge,
        friendGender: targetCardFull.friendGender as "Man" | "Woman" | "Other" | undefined,
        friendPostalCode: targetCardFull.friendPostalCode,
        educationLevel: targetCardFull.educationLevel,
        occupation: targetCardFull.occupation,
        bio: targetCardFull.bio,
        interests: targetCardFull.interests,
        photoUrl: formatPhotoUrlForPrompt(targetCardFull.photoUrl),
        preferences: targetCardFull.preferences ? {
            ...targetCardFull.preferences,
            seeking: formatSeekingForPrompt(targetCardFull.preferences.seeking)
        } : undefined
    };
    const candidateCardsPromptData: ProfileCardPrompt[] = candidateCardsFull.map(card => ({
        id: card.id,
        friendName: card.friendName,
        friendAge: card.friendAge,
        friendGender: card.friendGender as "Man" | "Woman" | "Other" | undefined,
        friendPostalCode: card.friendPostalCode,
        educationLevel: card.educationLevel,
        occupation: card.occupation,
        bio: card.bio,
        interests: card.interests,
        photoUrl: formatPhotoUrlForPrompt(card.photoUrl),
        preferences: card.preferences ? {
            ...card.preferences,
            seeking: formatSeekingForPrompt(card.preferences.seeking)
        } : undefined,
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
      if (suggestion.matchedProfileCardId === targetCardFull.id) {
        console.warn(`AI suggested matching target card ID ${targetCardFull.id} with itself. Skipping.`);
        continue; 
      }

      const matchedCardFull = allProfileCardsFromDb.find(pc => pc.id === suggestion.matchedProfileCardId);
      if (!matchedCardFull) {
        console.warn(`Suggested matched card ID ${suggestion.matchedProfileCardId} not found in fetched data. Skipping.`);
        continue;
      }

      if (matchedCardFull.createdByMatcherId === targetCardFull.createdByMatcherId) {
          console.warn(`AI suggested a match with a card from the same matcher (Target: ${targetCardFull.id}, Matched: ${matchedCardFull.id}, Matcher: ${targetCardFull.createdByMatcherId}). Skipping.`);
          continue;
      }
      
      const existingMatch = await findExistingPotentialMatch(targetCardFull.id, matchedCardFull.id);
      if (existingMatch) {
        const isRejectedByMatchers = existingMatch.statusMatcherA === 'rejected' || existingMatch.statusMatcherB === 'rejected';
        const isRejectedByFriends = existingMatch.statusFriendA === 'rejected' || existingMatch.statusFriendB === 'rejected';

        if (!isRejectedByMatchers && !isRejectedByFriends) {
            console.log(`An active or pending potential match already exists between ${targetCardFull.id} and ${matchedCardFull.id}. Skipping.`);
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
        friendEmailSent: false, 
      };

      try {
        const createdMatch = await addPotentialMatch(newPotentialMatchData); 
        createdPotentialMatchIds.push(createdMatch.id);
      } catch(e: any) {
        console.error(`Error creating potential match document for ${targetCardFull.id} and ${matchedCardFull.id}: ${e.message || e}`);
      }
    }

    return { createdPotentialMatchIds };
  }
);
