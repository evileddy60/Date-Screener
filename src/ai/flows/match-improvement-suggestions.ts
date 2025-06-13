'use server';

/**
 * @fileOverview An AI agent that analyzes user and recommender profiles and match feedback to suggest tags of advice for improving matches.
 *
 * - getMatchImprovementSuggestions - A function that handles the match improvement suggestion process.
 * - MatchImprovementSuggestionsInput - The input type for the getMatchImprovementSuggestions function.
 * - MatchImprovementSuggestionsOutput - The return type for the getMatchImprovementSuggestions function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const MatchImprovementSuggestionsInputSchema = z.object({
  userProfile: z.string().describe('The profile of the user seeking a match.'),
  recommenderProfile: z.string().describe('The profile of the recommending family member or friend.'),
  matchFeedback: z.string().describe('Feedback on previous match attempts, including reasons for rejection or acceptance.'),
});
export type MatchImprovementSuggestionsInput = z.infer<typeof MatchImprovementSuggestionsInputSchema>;

const MatchImprovementSuggestionsOutputSchema = z.object({
  adviceTags: z.array(z.string()).describe('A list of advice tags for the recommender to improve future match suggestions.'),
});
export type MatchImprovementSuggestionsOutput = z.infer<typeof MatchImprovementSuggestionsOutputSchema>;

export async function getMatchImprovementSuggestions(input: MatchImprovementSuggestionsInput): Promise<MatchImprovementSuggestionsOutput> {
  return matchImprovementSuggestionsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'matchImprovementSuggestionsPrompt',
  input: {schema: MatchImprovementSuggestionsInputSchema},
  output: {schema: MatchImprovementSuggestionsOutputSchema},
  prompt: `You are an expert matchmaker, skilled at analyzing profiles and feedback to provide actionable advice.

  Based on the user profile, recommender profile, and match feedback, suggest a list of advice tags for the recommender to improve future match suggestions.

  User Profile: {{{userProfile}}}
  Recommender Profile: {{{recommenderProfile}}}
  Match Feedback: {{{matchFeedback}}}

  Consider factors such as shared interests, relationship goals, communication styles, and any specific preferences mentioned.
  Provide concise and specific advice tags that the recommender can easily understand and implement.
  Format your response as a JSON array of strings.
  `,
});

const matchImprovementSuggestionsFlow = ai.defineFlow(
  {
    name: 'matchImprovementSuggestionsFlow',
    inputSchema: MatchImprovementSuggestionsInputSchema,
    outputSchema: MatchImprovementSuggestionsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
