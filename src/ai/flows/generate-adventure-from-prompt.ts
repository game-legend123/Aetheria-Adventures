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
  questTitle: z.string().describe('The title of the first quest.'),
  questObjective: z.string().describe('A clear, concise objective for the first quest.'),
  initialSkills: z.string().describe('A comma-separated list of initial skills relevant to the quest. For example: "Thuyết phục, Điều tra, Cảm nhận động cơ".'),
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

Nhiệm vụ của bạn:
1.  **Tạo cảnh mở đầu:** Dựa trên lời nhắc, hãy viết một đoạn văn mở đầu hấp dẫn. Đoạn văn này phải thiết lập bối cảnh, giới thiệu nhân vật người chơi và đưa ra tình huống ban đầu.
2.  **Tạo nhiệm vụ đầu tiên:** Từ cảnh mở đầu, hãy tạo ra một nhiệm vụ đầu tiên cho người chơi. Nhiệm vụ này phải có một 'questTitle' (tiêu đề) và một 'questObjective' (mục tiêu) rõ ràng, có thể thực hiện được.
3.  **Cung cấp kỹ năng ban đầu:** Tạo một danh sách các kỹ năng ban đầu (dạng chuỗi, phân tách bằng dấu phẩy) phù hợp với nhiệm vụ và nhân vật. Ví dụ: "Thuyết phục, Điều tra, Cảm nhận động cơ".
4.  **Tích hợp vào câu chuyện:** Mô tả ngắn gọn nhiệm vụ này trong 'adventureText' để người chơi biết họ cần làm gì.

Ví dụ:
-   **Prompt người dùng:** "Một đạo tặc trẻ tuổi trong một thành phố cảng nhộn nhịp, tìm kiếm một bản đồ kho báu huyền thoại."
-   **Quest Title:** "Bản đồ bị đánh cắp"
-   **Quest Objective:** "Tìm và lấy lại mảnh bản đồ từ tay tên trùm гильдии trộm cắp, 'Bàn tay sắt' Gaspard."
-   **Initial Skills:** "Lẻn lút, Mở khóa, Móc túi"
-   **Adventure Text:** (Mô tả cảnh cảng, sau đó) "... Nhiệm vụ đầu tiên của bạn: Tìm và lấy lại mảnh bản đồ từ tay tên trùm гильдии trộm cắp, 'Bàn tay sắt' Gaspard. Bây giờ bạn sẽ làm gì?"


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
