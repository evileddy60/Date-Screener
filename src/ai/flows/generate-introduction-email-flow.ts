
'use server';
/**
 * @fileOverview An AI agent that generates a friendly introductory email for a potential match.
 *
 * - generateIntroductionEmail - A function that takes a PotentialMatch ID and generates email content.
 * - GenerateIntroductionEmailInput - The input type for the function.
 * - GenerateIntroductionEmailOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { getPotentialMatchById, getProfileCardById } from '@/lib/firestoreService';

// Helper schema for the prompt input
const FriendProfileSchema = z.object({
  name: z.string(),
  bio: z.string(),
  interests: z.array(z.string()),
  occupation: z.string().optional(),
  education: z.string().optional(),
  matcherName: z.string().describe("The name of the matchmaker who created this friend's profile."),
});

export const GenerateIntroductionEmailInputSchema = z.object({
  potentialMatchId: z.string().describe("The ID of the PotentialMatch object."),
});
export type GenerateIntroductionEmailInput = z.infer<typeof GenerateIntroductionEmailInputSchema>;

export const GenerateIntroductionEmailOutputSchema = z.object({
  subject: z.string().describe("A friendly and engaging subject line for the introductory email."),
  emailBody: z.string().describe("The personalized email body. Use placeholders like '[Friend's Name]' and '[Other Friend's Name]' which will be replaced."),
});
export type GenerateIntroductionEmailOutput = z.infer<typeof GenerateIntroductionEmailOutputSchema>;

export async function generateIntroductionEmail(input: GenerateIntroductionEmailInput): Promise<GenerateIntroductionEmailOutput> {
  return generateIntroductionEmailFlow(input);
}

const prompt = ai.definePrompt({
    name: 'generateIntroductionEmailPrompt',
    input: { schema: z.object({
        friendA: FriendProfileSchema,
        friendB: FriendProfileSchema,
    }) },
    output: { schema: GenerateIntroductionEmailOutputSchema },
    prompt: `You are a friendly and warm assistant helping two matchmakers, {{{friendA.matcherName}}} and {{{friendB.matcherName}}}, introduce their friends, {{{friendA.name}}} and {{{friendB.name}}}.

Your task is to write a single, engaging, and personalized introductory email body. This email will be sent to both friends. Use placeholders like "[Friend's Name]" and "[Other Friend's Name]" so the application can customize it for each recipient.

The tone should be casual, encouraging, and not overly salesy. It should feel like a genuine introduction from trusted friends.

Here's the information about the two friends:

**Friend 1: {{{friendA.name}}}**
- Bio: {{{friendA.bio}}}
- Interests: {{#each friendA.interests}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}
- Occupation: {{#if friendA.occupation}}{{{friendA.occupation}}}{{else}}Not provided{{/if}}
- Education: {{#if friendA.education}}{{{friendA.education}}}{{else}}Not provided{{/if}}
- Introduced by: {{{friendA.matcherName}}}

**Friend 2: {{{friendB.name}}}**
- Bio: {{{friendB.bio}}}
- Interests: {{#each friendB.interests}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}
- Occupation: {{#if friendB.occupation}}{{{friendB.occupation}}}{{else}}Not provided{{/if}}
- Education: {{#if friendB.education}}{{{friendB.education}}}{{else}}Not provided{{/if}}
- Introduced by: {{{friendB.matcherName}}}

**Instructions for the email body:**
1.  Start with a friendly greeting, like "Hi [Friend's Name],".
2.  Explain that their matchmakers ({{{friendA.matcherName}}} and {{{friendB.matcherName}}}) thought they might get along.
3.  Briefly and positively introduce "[Other Friend's Name]", highlighting a few key commonalities or complementary traits from their bios and interests.
4.  Keep it concise and light-hearted.
5.  End with a call to action. Since this is a simple text email, it should instruct them to reply to their matchmaker to let them know if they're interested in being connected.
6.  Sign off warmly from both matchmakers.

Generate a suitable subject line and the email body.
`,
});

const generateIntroductionEmailFlow = ai.defineFlow(
  {
    name: 'generateIntroductionEmailFlow',
    inputSchema: GenerateIntroductionEmailInputSchema,
    outputSchema: GenerateIntroductionEmailOutputSchema,
  },
  async (input) => {
    const potentialMatch = await getPotentialMatchById(input.potentialMatchId);
    if (!potentialMatch) {
      throw new Error(`Potential Match with ID ${input.potentialMatchId} not found.`);
    }

    const [profileCardA, profileCardB] = await Promise.all([
      getProfileCardById(potentialMatch.profileCardAId),
      getProfileCardById(potentialMatch.profileCardBId),
    ]);

    if (!profileCardA || !profileCardB) {
      throw new Error('Could not fetch one or both profile cards for the match.');
    }

    const friendAData: z.infer<typeof FriendProfileSchema> = {
        name: profileCardA.friendName,
        bio: profileCardA.bio,
        interests: profileCardA.interests,
        occupation: profileCardA.occupation,
        education: profileCardA.educationLevel,
        matcherName: profileCardA.matcherName,
    };

    const friendBData: z.infer<typeof FriendProfileSchema> = {
        name: profileCardB.friendName,
        bio: profileCardB.bio,
        interests: profileCardB.interests,
        occupation: profileCardB.occupation,
        education: profileCardB.educationLevel,
        matcherName: profileCardB.matcherName,
    };

    const { output } = await prompt({
      friendA: friendAData,
      friendB: friendBData,
    });

    if (!output) {
      throw new Error('The system did not generate an email. Please try again.');
    }

    return output;
  }
);
