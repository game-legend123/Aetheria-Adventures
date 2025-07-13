'use server';
/**
 * @fileOverview A Genkit flow for generating an image for a scene.
 *
 * - generateSceneImage - A function that handles the image generation process.
 * - GenerateSceneImageInput - The input type for the generateSceneImage function.
 * - GenerateSceneImageOutput - The return type for the generateSceneImage function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GenerateSceneImageInputSchema = z.object({
  sceneDescription: z.string().describe('A description of the scene to generate an image for.'),
});
export type GenerateSceneImageInput = z.infer<typeof GenerateSceneImageInputSchema>;

const GenerateSceneImageOutputSchema = z.object({
  imageUrl: z.string().describe('The data URI of the generated image.'),
});
export type GenerateSceneImageOutput = z.infer<typeof GenerateSceneImageOutputSchema>;

export async function generateSceneImage(input: GenerateSceneImageInput): Promise<GenerateSceneImageOutput> {
  const { media } = await ai.generate({
    model: 'googleai/gemini-2.0-flash-preview-image-generation',
    prompt: `Generate a digital painting style image for a fantasy text-based adventure game. Scene: ${input.sceneDescription}`,
    config: {
      responseModalities: ['TEXT', 'IMAGE'],
    },
  });

  return { imageUrl: media.url };
}
