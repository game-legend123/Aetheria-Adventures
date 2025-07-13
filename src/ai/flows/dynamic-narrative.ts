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
  playerChoice: z.string().describe("The action the player decided to take, as free-form text."),
  inventory: z.string().describe('The current player inventory.'),
  hp: z.number().describe('The current player health points.'),
  skills: z.string().describe('The current player skills. This is a list of abilities the player possesses.'),
  score: z.number().describe('The current player score.'),
  questTitle: z.string().describe('The title of the current quest.'),
  questObjective: z.string().describe('The objective of the current quest.'),
});
export type GenerateNextSceneInput = z.infer<typeof GenerateNextSceneInputSchema>;

const GenerateNextSceneOutputSchema = z.object({
  sceneDescription: z.string().describe("The description of the next scene. This should narrate the outcome of the player's action and set up the new situation. If the player was awarded creativity points, mention it briefly here."),
  updatedInventory: z.string().describe('The updated player inventory after the action.'),
  updatedHp: z.number().describe('The updated player health points after the action. If this reaches 0, the game is over.'),
  updatedSkills: z.string().describe('The updated player skills. Usually this remains the same unless a quest is completed.'),
  updatedScore: z.number().describe('The updated player score after the recent action.'),
  questCompleted: z.boolean().describe("Set to true if the player's action has successfully completed the current quest."),
  newQuestTitle: z.string().optional().describe('If the previous quest was completed, provide the title for the next quest. If the game is won, this can be a title like "Chiến thắng!".'),
  newQuestObjective: z.string().optional().describe('If the previous quest was completed, provide the objective for the next quest. If the game is won, this can be a description of the victory.'),
  newSkills: z.string().optional().describe('If the previous quest was completed, provide a comma-separated list of new skills for the next quest.'),
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

Trò chơi có tên là Cuộc phiêu lưu ở Aetheria, và lấy bối cảnh ở lục địa ma thuật Aetheria.

CƠ CHẾ TRÒ CHƠI CỐT LÕI:
1.  **XÚC XẮC VÔ HÌNH VÀ KỸ NĂNG:** Đối với mọi hành động của người chơi, bạn phải bí mật "tung một con xúc xắc 20 mặt (d20) vô hình" để xác định kết quả. **Nếu hành động của người chơi vận dụng một trong các kỹ năng hiện có của họ, hãy coi như họ được cộng thêm 5 điểm vào kết quả tung xúc xắc.** Đừng bao giờ nói cho người chơi biết kết quả của cú tung. Thay vào đó, hãy sử dụng nó để định hình câu chuyện.
    *   **Thành công vang dội (Kết quả 18-20+):** Hành động thành công một cách ngoạn mục, có thể có thêm lợi ích bất ngờ.
    *   **Thành công (Kết quả 11-17):** Hành động thành công như dự định.
    *   **Thất bại một phần / Thành công với giá phải trả (Kết quả 6-10):** Người chơi có thể đạt được mục tiêu nhưng gặp phải một hậu quả tiêu cực (ví dụ: gây ra tiếng động, làm rơi một vật phẩm, bị thương nhẹ).
    *   **Thất bại (Kết quả 2-5):** Hành động không thành công.
    *   **Thất bại thảm hại (Kết quả 1):** Hành động thất bại hoàn toàn và gây ra một hậu quả tiêu cực lớn.

2.  **TÍNH ĐIỂM SÁNG TẠO:** Đánh giá hành động của người chơi về sự sáng tạo, chi tiết và trí tưởng tượng. Nếu hành động của họ đặc biệt thông minh hoặc có tính nhập vai cao, hãy thưởng thêm điểm.

QUY TẮC CHIẾN THẮNG, THẤT BẠI, NHIỆM VỤ VÀ TÍNH ĐIỂM:
-   **Nhiệm vụ:** Người chơi luôn có một nhiệm vụ. Hãy đánh giá xem hành động của người chơi có hoàn thành mục tiêu nhiệm vụ hiện tại không.
-   **Hoàn thành nhiệm vụ:** Khi mục tiêu được hoàn thành, đặt questCompleted thành true. Trong sceneDescription, hãy mô tả sự thành công đó. Thưởng cho người chơi 100 điểm. Sau đó, BẮT BUỘC phải tạo ra một nhiệm vụ tiếp theo (newQuestTitle và newQuestObjective) VÀ một bộ kỹ năng mới (newSkills) cho nhiệm vụ đó để câu chuyện tiếp tục, trừ khi người chơi đã thắng cả trò chơi.
-   **Chiến thắng:** Người chơi thắng khi hoàn thành nhiệm vụ cuối cùng (ví dụ: "Đánh bại Chúa tể Bóng tối và phục hồi Trái tim Bình minh"). Khi điều này xảy ra, hãy mô tả cảnh chiến thắng huy hoàng, đặt gameHasEnded thành true, isVictory thành true, và questCompleted thành true.
-   **Thất bại:** Người chơi thua khi Máu (HP) của họ giảm xuống 0 hoặc thấp hơn. Mô tả cảnh thất bại, đặt gameHasEnded thành true và isVictory thành false.
-   **Tính điểm:**
    *   Hoàn thành nhiệm vụ: +100 điểm.
    *   Thành công vang dội: +20 điểm.
    *   Thành công: +10 điểm.
    *   Thành công với giá phải trả: +5 điểm.
    *   Điểm sáng tạo/nhập vai: +5 đến +20 điểm (cộng thêm vào điểm hành động).
    *   Thất bại hoặc thất bại thảm hại: 0 điểm.

Bối cảnh hiện tại:
-   Cảnh trước đó: {{{previousScene}}}
-   Nhiệm vụ hiện tại: {{{questTitle}}}
-   Mục tiêu: {{{questObjective}}}
-   Hành động của người chơi: {{{playerChoice}}}
-   Trạng thái người chơi:
    -   Máu: {{{hp}}}
    -   Kỹ năng: {{{skills}}}
    -   Hành trang: {{{inventory}}}
    -   Điểm số: {{{score}}}

NHIỆM VỤ CỦA BẠN:
1.  **Phân tích hành động của người chơi ({{{playerChoice}}})**. Đánh giá xem nó có sử dụng kỹ năng nào trong {{{skills}}} không và mức độ sáng tạo của nó.
2.  **"Tung xúc xắc d20 vô hình"** và cộng thêm điểm thưởng nếu kỹ năng được sử dụng để quyết định kết quả.
3.  **Kiểm tra việc hoàn thành nhiệm vụ:** Dựa trên hành động và kết quả, xác định xem người chơi đã hoàn thành mục tiêu nhiệm vụ chưa. Nếu có, đặt questCompleted là true.
4.  **Dệt nên câu chuyện:** Viết một mô tả cảnh tiếp theo hấp dẫn. Hãy chia các đoạn văn dài thành các đoạn nhỏ hơn (cách nhau bằng dấu xuống dòng) để dễ đọc. Nếu thưởng điểm sáng tạo, hãy đề cập ngắn gọn trong mô tả (ví dụ: "Vì sự lanh lợi của bạn...").
5.  **Cập nhật trạng thái người chơi:** Dựa trên kết quả, cập nhật Máu, Điểm số (bao gồm cả điểm hành động và điểm sáng tạo), và Hành trang. Kỹ năng chỉ thay đổi khi hoàn thành nhiệm vụ. Đặt 'updatedSkills' thành giá trị của 'newSkills' nếu nhiệm vụ hoàn thành, nếu không thì giữ nguyên kỹ năng cũ.
6.  **Tạo nhiệm vụ và kỹ năng mới:** Nếu questCompleted là true, hãy tạo ra một newQuestTitle, newQuestObjective, và newSkills hợp lý.
7.  **Kiểm tra điều kiện kết thúc:** Nếu người chơi đã thắng hoặc thua, hãy đặt gameHasEnded và isVictory cho phù hợp.

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
        updatedSkills: input.skills,
        updatedScore: input.score,
        questCompleted: false,
        gameHasEnded: true,
        isVictory: false,
      };
    }
  
    const {output} = await prompt(input);

    // If a new quest is generated, the new skills become the current skills.
    if (output!.questCompleted && output!.newSkills) {
        output!.updatedSkills = output!.newSkills;
    } else {
        output!.updatedSkills = input.skills;
    }


    return output!;
  }
);
