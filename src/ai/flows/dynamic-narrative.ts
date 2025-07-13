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
  playerChoice: z.string().describe('The action the player decided to take, as free-form text.'),
  inventory: z.string().describe('The current player inventory.'),
  hp: z.number().describe('The current player health points.'),
  skillPoints: z.number().describe('The current player skill points.'),
  score: z.number().describe('The current player score.'),
});
export type GenerateNextSceneInput = z.infer<typeof GenerateNextSceneInputSchema>;

const GenerateNextSceneOutputSchema = z.object({
  sceneDescription: z.string().describe('The description of the next scene. This should narrate the outcome of the player\'s action and set up the new situation.'),
  updatedInventory: z.string().describe('The updated player inventory after the action.'),
  updatedHp: z.number().describe('The updated player health points after the action. If this reaches 0, the game is over.'),
  updatedSkillPoints: z.number().describe('The updated player skill points after the action.'),
  updatedScore: z.number().describe('The updated player score after the recent action.'),
  gameHasEnded: z.boolean().describe('Set to true only if the player has won or lost the game.'),
  isVictory: z.boolean().describe('If gameHasEnded is true, set this to true for a win and false for a loss (e.g., HP is 0).'),
});
export type GenerateNextSceneOutput = z.infer<typeof GenerateNextSceneOutputSchema>;

export async function generateNextScene(input: GenerateNextSceneInput): Promise<GenerateNextSceneOutput> {
  return generateNextSceneFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateNextScenePrompt',
  input: {schema: GenerateNextSceneInputSchema},
  output: {schema: GenerateNextSceneOutputSchema},
  prompt: `Bạn là một Quản trò (Game Master) chuyên nghiệp, dẫn dắt một trò chơi phiêu lưu dựa trên văn bản. TOÀN BỘ PHẢN HỒI CỦA BẠN PHẢI BẰNG TIẾNG VIỆT.

Trò chơi có tên là Cuộc phiêu lưu ở Aetheria, và lấy bối cảnh ở lục địa ma thuật Aetheria. Nhiệm vụ chính của người chơi là đánh bại Chúa tể Bóng tối và phục hồi Trái tim Bình minh.

CƠ CHẾ TRÒ CHƠI CỐT LÕI: XÚC XẮC VÔ HÌNH
Đối với mọi hành động của người chơi, bạn phải bí mật "tung một con xúc xắc 20 mặt (d20) vô hình" để xác định kết quả. Đừng bao giờ nói cho người chơi biết kết quả của cú tung. Thay vào đó, hãy sử dụng nó để định hình câu chuyện.
-   **Thành công vang dội (Tung được 18-20):** Hành động thành công một cách ngoạn mục, có thể có thêm lợi ích bất ngờ.
-   **Thành công (Tung được 11-17):** Hành động thành công như dự định.
-   **Thất bại một phần / Thành công với giá phải trả (Tung được 6-10):** Người chơi có thể đạt được mục tiêu nhưng gặp phải một hậu quả tiêu cực (ví dụ: gây ra tiếng động, làm rơi một vật phẩm, bị thương nhẹ).
-   **Thất bại (Tung được 2-5):** Hành động không thành công.
-   **Thất bại thảm hại (Tung được 1):** Hành động thất bại hoàn toàn và gây ra một hậu quả tiêu cực lớn.

QUY TẮC CHIẾN THẮNG, THẤT BẠI VÀ TÍNH ĐIỂM:
-   **Chiến thắng:** Người chơi thắng khi đánh bại Chúa tể Bóng tối và phục hồi Trái tim Bình minh. Khi điều này xảy ra, hãy mô tả cảnh chiến thắng huy hoàng, đặt gameHasEnded thành true và isVictory thành true.
-   **Thất bại:** Người chơi thua khi Máu (HP) của họ giảm xuống 0 hoặc thấp hơn. Mô tả cảnh thất bại, đặt gameHasEnded thành true và isVictory thành false.
-   **Tính điểm:**
    -   Hành động thành công vang dội hoặc giải pháp rất thông minh: +20 điểm.
    -   Hành động thành công: +10 điểm.
    -   Thành công với giá phải trả: +5 điểm.
    -   Thất bại hoặc thất bại thảm hại: 0 điểm.

Bối cảnh hiện tại:
-   Cảnh trước đó: {{{previousScene}}}
-   Hành động của người chơi: {{{playerChoice}}}
-   Trạng thái người chơi:
    -   Máu: {{{hp}}}
    -   Điểm kỹ năng: {{{skillPoints}}}
    -   Hành trang: {{{inventory}}}
    -   Điểm số: {{{score}}}

NHIỆM VỤ CỦA BẠN:
1.  **Phân tích hành động của người chơi ({{{playerChoice}}}).**
2.  **"Tung xúc xắc d20 vô hình"** để quyết định kết quả dựa trên cơ chế đã nêu.
3.  **Dệt nên câu chuyện:** Dựa trên kết quả tung xúc xắc và sự hợp lý của hành động, hãy viết một mô tả cảnh tiếp theo hấp dẫn. Mô tả kết quả một cách tự nhiên trong câu chuyện mà không đề cập đến việc "tung xúc xắc".
4.  **Cập nhật trạng thái người chơi:** Dựa trên kết quả, cập nhật Máu, Điểm kỹ năng, Hành trang và Điểm số.
5.  **Kiểm tra điều kiện kết thúc:** Nếu người chơi đã thắng hoặc thua, hãy đặt gameHasEnded và isVictory cho phù hợp.

Tuyệt đối không cung cấp các lựa chọn cho người chơi. Hãy để họ tự quyết định phải làm gì tiếp theo.
`,
});

const generateNextSceneFlow = ai.defineFlow(
  {
    name: 'generateNextSceneFlow',
    inputSchema: GenerateNextSceneInputSchema,
    outputSchema: GenerateNextSceneOutputSchema,
  },
  async input => {
    // Ensure HP doesn't go below 0 in the input for the prompt
    if (input.hp <= 0) {
      return {
        sceneDescription: "Bạn đã gục ngã. Cuộc phiêu lưu của bạn đã kết thúc.",
        updatedHp: 0,
        updatedInventory: input.inventory,
        updatedSkillPoints: input.skillPoints,
        updatedScore: input.score,
        gameHasEnded: true,
        isVictory: false,
      };
    }
  
    const {output} = await prompt(input);
    return output!;
  }
);
