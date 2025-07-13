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
  prompt: `Bạn là một chatbot kể chuyện sẽ tạo ra một cuộc phiêu lưu dựa trên mô tả do người dùng cung cấp. TOÀN BỘ PHẢN HỒI CỦA BẠN PHẢI BẰNG TIẾNG VIỆT.\nLời nhắc của người dùng: {{{prompt}}}\n\nTạo phần đầu của một trò chơi phiêu lưu dựa trên văn bản dựa trên lời nhắc của người dùng. Cuộc phiêu lưu phải bao gồm mô tả về bối cảnh, nhân vật người chơi và một nhiệm vụ hoặc mục tiêu ban đầu. Cung cấp cuộc phiêu lưu ở định dạng hội thoại, trong đó chatbot mô tả cảnh và sau đó cung cấp cho người chơi 3-4 lựa chọn cho hành động tiếp theo của họ. Đảm bảo nội dung được tạo ra hấp dẫn và lôi cuốn, tạo tiền đề cho trải nghiệm trò chơi năng động và được cá nhân hóa.`,
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
