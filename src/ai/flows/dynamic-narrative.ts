'use server';

/**
 * @fileOverview A dynamic narrative AI agent that adapts the story based on player choices.
 *
 * - generateNextScene - A function that generates the next scene in the adventure.
 * - GenerateNextSceneInput - The input type for the generateNextScene function.
 * - GenerateNextSceneOutput - The return type for the generateNextScene function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateNextSceneInputSchema = z.object({
  previousScene: z
    .string()
    .describe('The description of the previous scene.'),
  playerChoice: z.string().describe('The player choice for the current scene.'),
  inventory: z.string().describe('The current player inventory.'),
  hp: z.number().describe('The current player health points.'),
  skillPoints: z.number().describe('The current player skill points.'),
});
export type GenerateNextSceneInput = z.infer<typeof GenerateNextSceneInputSchema>;

const GenerateNextSceneOutputSchema = z.object({
  sceneDescription: z.string().describe('The description of the next scene.'),
  actionChoices: z.array(z.string()).describe('The available action choices for the player.'),
  updatedInventory: z.string().describe('The updated player inventory.'),
  updatedHp: z.number().describe('The updated player health points.'),
  updatedSkillPoints: z.number().describe('The updated player skill points.'),
});
export type GenerateNextSceneOutput = z.infer<typeof GenerateNextSceneOutputSchema>;

export async function generateNextScene(input: GenerateNextSceneInput): Promise<GenerateNextSceneOutput> {
  return generateNextSceneFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateNextScenePrompt',
  input: {schema: GenerateNextSceneInputSchema},
  output: {schema: GenerateNextSceneOutputSchema},
  prompt: `You are a dynamic adventure game master, skilled at creating immersive and branching narratives.

  Previous Scene: {{{previousScene}}}
  Player Choice: {{{playerChoice}}}
  Current Inventory: {{{inventory}}}
  Current HP: {{{hp}}}
  Current Skill Points: {{{skillPoints}}}

  Based on the player's previous scene, their choice, and their current stats, generate the next scene description and 3-4 possible action choices.
  Also determine the consequences of that action and update the player's inventory, hp, and skill points.

  Ensure that the scene description is engaging and sets the stage for the next set of choices.  The game is called Aetheria Adventures, and is set in the magical continent of Aetheria, filled with magic, monsters and ancient treasure.
  The player is on a mission to defeat the Shadow Lord and recover the Heart of Dawn.
  The available action choices should be clear and distinct, offering different paths for the player to take. Make the action choices adventurous and suited to the situation presented in the Scene Description.
  Each element of the output should be a string, except for the updatedHp and updatedSkillPoints, which should be numerical.
  Updated inventory should reflect the items the player has based on their actions. Only change it if something happens in the scene that affects the player's inventory.
  If the scene involves combat, be sure to describe the results of the combat in the sceneDescription, and update the player's HP accordingly.
  The game uses a turn-based combat system. Assume a rock-paper-scissors system for simplicity.

  Follow this format:
  Scene Description: [A vivid description of the next scene]
  Action Choices: ["Choice 1", "Choice 2", "Choice 3", "Choice 4"]
  Updated Inventory: [A description of the player's updated inventory, if applicable]
  Updated HP: [The player's updated health points]
  Updated Skill Points: [The player's updated skill points]

  Output:
  `,
});

const generateNextSceneFlow = ai.defineFlow(
  {
    name: 'generateNextSceneFlow',
    inputSchema: GenerateNextSceneInputSchema,
    outputSchema: GenerateNextSceneOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
