"use server";

import { generateAdventureFromPrompt } from "@/ai/flows/generate-adventure-from-prompt";
import { generateNextScene } from "@/ai/flows/dynamic-narrative";
import { generateSceneImage } from "@/ai/flows/generate-scene-image";
import { systemChat } from "@/ai/flows/system-chat-flow";
import type { SystemChatOutput } from "@/ai/flows/system-chat-flow";
import { z } from "zod";
import { fromZodError } from "zod-validation-error";

const startAdventureSchema = z.object({
  prompt: z.string().min(10, "Mô tả phải có ít nhất 10 ký tự."),
});

export async function startAdventure(data: { prompt: string }) {
  try {
    const validatedData = startAdventureSchema.parse(data);
    const result = await generateAdventureFromPrompt({ prompt: validatedData.prompt });
    
    const adventureText = result.adventureText;
    // The initial scene description for the image is the first paragraph.
    const sceneDescription = adventureText[0] || "";
        
    const imageResult = await generateSceneImage({ sceneDescription });

    return { success: true, sceneDescription: adventureText, imageUrl: imageResult.imageUrl, questTitle: result.questTitle, questObjective: result.questObjective, initialSkills: result.initialSkills };
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return { success: false, error: fromZodError(error).toString() };
    }
    console.error("Lỗi khi bắt đầu cuộc phiêu lưu:", error);
    return { success: false, error: "Không thể bắt đầu cuộc phiêu lưu. Vui lòng thử lại." };
  }
}

// Helper function to be called from the main page when system chat wants to reset the story
export async function startNewAdventureFromSystem(data: { prompt: string }) {
   return startAdventure(data);
}


const progressAdventureSchema = z.object({
  previousScene: z.string(),
  playerChoice: z.string(),
  inventory: z.string(),
  hp: z.number(),
  skills: z.string(),
  score: z.number(),
  questTitle: z.string(),
  questObjective: z.string(),
});

export async function progressAdventure(data: {
  previousScene: string;
  playerChoice: string;
  inventory: string;
  hp: number;
  skills: string;
  score: number;
  questTitle: string;
  questObjective: string;
}) {
  try {
    const validatedData = progressAdventureSchema.parse(data);
    const result = await generateNextScene(validatedData);

    if (!result.sceneDescription || result.sceneDescription.length === 0) {
       return { success: false, error: "AI không thể tạo cảnh tiếp theo." };
    }
    
    // Use the first paragraph of the new scene to generate the image
    const imageResult = await generateSceneImage({ sceneDescription: result.sceneDescription[0] });
    
    return { success: true, ...result, imageUrl: imageResult.imageUrl };
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return { success: false, error: fromZodError(error).toString() };
    }
    console.error("Lỗi khi tiếp tục cuộc phiêu lưu:", error);
    return { success: false, error: "Không thể tiếp tục cuộc phiêu lưu. Vui lòng thử lại." };
  }
}


const systemChatSchema = z.object({
    userMessage: z.string(),
    hp: z.number(),
    skills: z.string(),
    inventory: z.string(),
    score: z.number(),
    questTitle: z.string(),
    questObjective: z.string(),
    sceneDescription: z.string(),
});

export async function chatWithSystem(data: {
    userMessage: string;
    hp: number;
    skills: string;
    inventory: string;
    score: number;
    questTitle: string;
    questObjective: string;
    sceneDescription: string;
}): Promise<{ success: true; response: string; stateUpdates?: SystemChatOutput['stateUpdates'] } | { success: false; error: string }> {
    try {
        const validatedData = systemChatSchema.parse(data);
        const result = await systemChat(validatedData);
        return { success: true, response: result.response, stateUpdates: result.stateUpdates };
    } catch (error: any) {
        if (error instanceof z.ZodError) {
            return { success: false, error: fromZodError(error).toString() };
        }
        console.error("Lỗi khi trò chuyện với hệ thống:", error);
        return { success: false, error: "Không thể trò chuyện với hệ thống. Vui lòng thử lại sau." };
    }
}
