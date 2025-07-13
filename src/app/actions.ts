"use server";

import { generateAdventureFromPrompt } from "@/ai/flows/generate-adventure-from-prompt";
import { generateNextScene } from "@/ai/flows/dynamic-narrative";
import { z } from "zod";
import { fromZodError } from "zod-validation-error";

const startAdventureSchema = z.object({
  prompt: z.string().min(10, "Prompt must be at least 10 characters long."),
});

export async function startAdventure(data: { prompt: string }) {
  try {
    const validatedData = startAdventureSchema.parse(data);
    const result = await generateAdventureFromPrompt({ prompt: validatedData.prompt });
    
    const adventureText = result.adventureText;
    const lines = adventureText.split('\n');
    const sceneDescription = lines.filter(line => !/^\s*\d\./.test(line)).join('\n').trim();
    const choices = lines.filter(line => /^\s*\d\./.test(line)).map(line => line.replace(/^\s*\d\.\s*/, '').trim());
    
    if (choices.length === 0) {
      return { success: false, error: "The AI failed to provide choices. Please try a different prompt." };
    }

    return { success: true, sceneDescription, choices };
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return { success: false, error: fromZodError(error).toString() };
    }
    console.error("Error starting adventure:", error);
    return { success: false, error: "Failed to start adventure. Please try again." };
  }
}

const progressAdventureSchema = z.object({
  previousScene: z.string(),
  playerChoice: z.string(),
  inventory: z.string(),
  hp: z.number(),
  skillPoints: z.number(),
});

export async function progressAdventure(data: {
  previousScene: string;
  playerChoice: string;
  inventory: string;
  hp: number;
  skillPoints: number;
}) {
  try {
    const validatedData = progressAdventureSchema.parse(data);
    const result = await generateNextScene(validatedData);
    return { success: true, ...result };
  } catch (error: any) {
     if (error instanceof z.ZodError) {
      return { success: false, error: fromZodError(error).toString() };
    }
    console.error("Error progressing adventure:", error);
    return { success: false, error: "Failed to progress adventure. Please try again." };
  }
}
