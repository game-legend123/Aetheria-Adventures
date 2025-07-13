'use server';
/**
 * @fileOverview This file defines a Genkit flow for generating an adventure from a prompt.
 *
 * The flow takes a prompt as input and returns a generated adventure as output.
 * - generateAdventureFromPrompt - A function that handles the adventure generation process.
 * - GenerateAdventureFromPromptInput - The input type for the generateAdventureFromPrompt function.
 * - GenerateAdventureFromPromptOutput - The return type for the generateAdventureFromPrompt function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateAdventureFromPromptInputSchema = z.object({
  prompt: z.string().describe('A prompt describing the desired adventure setting, character, or quest.'),
});
export type GenerateAdventureFromPromptInput = z.infer<typeof GenerateAdventureFromPromptInputSchema>;

const GenerateAdventureFromPromptOutputSchema = z.object({
  adventureText: z.string().describe('The generated adventure text based on the prompt.'),
});
export type GenerateAdventureFromPromptOutput = z.infer<typeof GenerateAdventureFromPromptOutputSchema>;

export async function generateAdventureFromPrompt(input: GenerateAdventureFromPromptInput): Promise<GenerateAdventureFromPromptOutput> {
  return generateAdventureFromPromptFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateAdventureFromPromptPrompt',
  input: {schema: GenerateAdventureFromPromptInputSchema},
  output: {schema: GenerateAdventureFromPromptOutputSchema},
  prompt: `You are a storytelling chatbot that will generate an adventure based on the prompt provided by the user.\nUser Prompt: {{{prompt}}}\n\nGenerate the beginning of a text-based adventure game based on the user prompt. The adventure should include a description of the setting, the player character, and an initial quest or goal. Provide the adventure in a conversational format, where the chatbot describes the scene and then offers the player 3-4 choices for their next action. Ensure the generated content is engaging and immersive, setting the stage for a dynamic and personalized game experience.`,
});

const generateAdventureFromPromptFlow = ai.defineFlow(
  {
    name: 'generateAdventureFromPromptFlow',
    inputSchema: GenerateAdventureFromPromptInputSchema,
    outputSchema: GenerateAdventureFromPromptOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
