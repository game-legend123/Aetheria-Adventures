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
  adventureText: z.string().describe('The generated adventure text based on the prompt. This should be the opening scene.'),
});
export type GenerateAdventureFromPromptOutput = z.infer<typeof GenerateAdventureFromPromptOutputSchema>;

export async function generateAdventureFromPrompt(input: GenerateAdventureFromPromptInput): Promise<GenerateAdventureFromPromptOutput> {
  return generateAdventureFromPromptFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateAdventureFromPromptPrompt',
  input: {schema: GenerateAdventureFromPromptInputSchema},
  output: {schema: GenerateAdventureFromPromptOutputSchema},
  prompt: `Bạn là một quản trò bậc thầy, người sẽ tạo ra một cuộc phiêu lưu hấp dẫn dựa trên mô tả của người dùng. TOÀN BỘ PHẢN HỒI CỦA BẠN PHẢI BẰNG TIẾNG VIỆT.

Lời nhắc của người dùng: {{{prompt}}}

Tạo ra một đoạn mở đầu hấp dẫn cho một trò chơi phiêu lưu dựa trên văn bản. Đoạn văn này phải thiết lập bối cảnh, giới thiệu nhân vật người chơi (dựa trên lời nhắc), và đưa ra một mục tiêu hoặc tình huống ban đầu.

Quan trọng: KHÔNG cung cấp cho người chơi các lựa chọn hành động. Thay vào đó, kết thúc mô tả của bạn bằng một câu hỏi mở như "Bây giờ bạn sẽ làm gì?" để khuyến khích người chơi tự nhập hành động của họ.
`,
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
