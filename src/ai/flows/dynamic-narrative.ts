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
  prompt: `Bạn là một quản trò phiêu lưu năng động, có kỹ năng tạo ra những câu chuyện lôi cuốn dựa trên hành động của người chơi. TOÀN BỘ PHẢN HỒI CỦA BẠN PHẢI BẰNG TIẾNG VIỆT.

Trò chơi có tên là Cuộc phiêu lưu ở Aetheria, và lấy bối cảnh ở lục địa ma thuật Aetheria, chứa đầy ma thuật, quái vật và kho báu cổ đại.
Nhiệm vụ chính của người chơi là đánh bại Chúa tể Bóng tối và phục hồi Trái tim Bình minh.

QUY TẮC TRÒ CHƠI:
- Chiến thắng: Người chơi thắng khi đánh bại Chúa tể Bóng tối và phục hồi Trái tim Bình minh. Khi điều này xảy ra, hãy mô tả cảnh chiến thắng huy hoàng và đặt gameHasEnded thành true và isVictory thành true.
- Thất bại: Người chơi thua khi Máu (HP) của họ giảm xuống 0 hoặc thấp hơn. Khi điều này xảy ra, hãy mô tả cảnh thất bại và đặt gameHasEnded thành true và isVictory thành false.
- Tính điểm:
  - Hành động rất thành công, thông minh hoặc sáng tạo: +20 điểm.
  - Hành động thành công vừa phải: +10 điểm.
  - Hành động có kết quả trung tính hoặc hỗn hợp: +5 điểm.
  - Hành động thất bại hoặc có hậu quả tiêu cực: 0 điểm.
- Chiến đấu: Sử dụng hệ thống chiến đấu theo lượt đơn giản. Đánh giá hành động của người chơi (ví dụ: "tấn công bằng kiếm", "niệm chú lửa", "né sang một bên") và xác định kết quả. Mô tả kết quả trong cảnh tiếp theo và cập nhật HP của người chơi và kẻ thù.

Bối cảnh hiện tại:
- Cảnh trước đó: {{{previousScene}}}
- Hành động của người chơi: {{{playerChoice}}}
- Trạng thái người chơi:
  - Máu: {{{hp}}}
  - Điểm kỹ năng: {{{skillPoints}}}
  - Hành trang: {{{inventory}}}
  - Điểm số: {{{score}}}

NHIỆM VỤ CỦA BẠN:
Dựa trên hành động của người chơi và bối cảnh hiện tại, hãy tạo ra cảnh tiếp theo.

1.  **Phân tích hành động của người chơi ({{{playerChoice}}}):** Nó có hợp lý không? Có sáng tạo không? Nó thành công hay thất bại?
2.  **Cập nhật trạng thái người chơi:** Dựa trên kết quả hành động, hãy cập nhật Máu, Điểm kỹ năng, Hành trang và Điểm số.
3.  **Viết mô tả cảnh tiếp theo:** Mô tả một cách sinh động kết quả hành động của người chơi và tình huống mới mà họ gặp phải.
4.  **Kiểm tra điều kiện kết thúc:** Nếu người chơi đã thắng hoặc thua, hãy đặt gameHasEnded và isVictory cho phù hợp. Nếu không, hãy để gameHasEnded là false.

Đừng cung cấp các lựa chọn cho người chơi. Hãy để họ tự quyết định phải làm gì tiếp theo dựa trên mô tả cảnh của bạn.
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
