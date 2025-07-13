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
  sceneDescription: z.array(z.string()).describe("An array of strings, where each string is a paragraph of the next scene's description. This should narrate the outcome of the player's action and set up the new situation."),
  updatedInventory: z.string().describe('The updated player inventory after the action.'),
  updatedHp: z.number().describe('The updated player health points after the action. If this reaches 0, the game is over.'),
  updatedSkills: z.string().describe('The updated player skills. Usually this remains the same unless a quest is completed.'),
  updatedScore: z.number().describe('The updated player score after the recent action.'),
  scoreChange: z.number().describe('The number of points awarded for the action (can be 0).'),
  scoreChangeReason: z.string().describe('A brief, clear explanation for the score change (e.g., "Hành động thành công", "Sáng tạo đột phá", "Nhiệm vụ hoàn thành").'),
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
1.  **KIỂM TRA TÍNH THỰC TẾ (ƯU TIÊN CAO NHẤT):** Trước khi tung xúc xắc, hãy đánh giá hành động của người chơi. Nếu hành động đó hoàn toàn vô lý hoặc không thể thực hiện được trong bối cảnh hiện tại (ví dụ: cố gắng bay mà không có cánh, nói chuyện với một vật vô tri), hãy phản biện lại họ. Thay vì cho thất bại ngay, hãy mô tả sự vô ích của hành động đó hoặc đặt câu hỏi ngược lại một cách tự nhiên trong câu chuyện. Ví dụ, nếu người chơi cố "thở dưới nước", bạn có thể mô tả "Bạn hít một hơi thật sâu và lao đầu xuống mặt nước, nhưng cảm giác ngạt thở ngay lập tức buộc bạn phải ngoi lên, thở hổn hển." Đừng cho điểm cho những hành động như vậy.

2.  **XÚC XẮC VÔ HÌNH VÀ KỸ NĂNG:** Đối với những hành động hợp lý, bạn phải bí mật "tung một con xúc xắc 20 mặt (d20) vô hình" để xác định kết quả. **Nếu hành động của người chơi vận dụng một trong các kỹ năng hiện có của họ, hãy coi như họ được cộng thêm 5 điểm vào kết quả tung xúc xắc.** Đừng bao giờ nói cho người chơi biết kết quả của cú tung. Thay vào đó, hãy sử dụng nó để định hình câu chuyện.
    *   **Thành công vang dội (Kết quả 18-20+):** Hành động thành công một cách ngoạn mục, có thể có thêm lợi ích bất ngờ.
    *   **Thành công (Kết quả 11-17):** Hành động thành công như dự định.
    *   **Thất bại một phần / Thành công với giá phải trả (Kết quả 6-10):** Người chơi có thể đạt được mục tiêu nhưng gặp phải một hậu quả tiêu cực (ví dụ: gây ra tiếng động, làm rơi một vật phẩm, bị thương nhẹ).
    *   **Thất bại (Kết quả 2-5):** Hành động không thành công.
    *   **Thất bại thảm hại (Kết quả 1):** Hành động thất bại hoàn toàn và gây ra một hậu quả tiêu cực lớn.

3.  **TÍNH ĐIỂM SÁNG TẠO:** Đánh giá hành động của người chơi về sự sáng tạo, chi tiết và trí tưởng tượng. Nếu hành động của họ đặc biệt thông minh hoặc có tính nhập vai cao, hãy thưởng thêm điểm.

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
    *   Thất bại, thất bại thảm hại, hoặc hành động vô lý: 0 điểm.

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
1.  **Phân tích hành động của người chơi ({{{playerChoice}}})**. Đánh giá xem nó có hợp lý không, có sử dụng kỹ năng nào trong {{{skills}}} không và mức độ sáng tạo của nó.
2.  Nếu hành động hợp lý, **"Tung xúc xắc d20 vô hình"** và cộng thêm điểm thưởng nếu kỹ năng được sử dụng để quyết định kết quả.
3.  **Dệt nên câu chuyện:** Viết một mô tả cảnh tiếp theo hấp dẫn. **Quan trọng: Chia câu chuyện thành các đoạn văn ngắn và đưa chúng vào mảng 'sceneDescription'. Mỗi chuỗi trong mảng là một đoạn văn riêng.**
4.  **Tính điểm và giải thích:** Dựa trên kết quả (và việc hoàn thành nhiệm vụ), tính tổng số điểm người chơi nhận được cho lượt này. Gán tổng điểm này vào 'scoreChange'. Viết một lý do ngắn gọn, rõ ràng cho số điểm đó vào 'scoreChangeReason'. Ví dụ: nếu người chơi thành công (+10) và sáng tạo (+15), thì 'scoreChange' là 25 và 'scoreChangeReason' là "Thành công & Sáng tạo". Nếu hoàn thành nhiệm vụ, 'scoreChange' là 100 và 'scoreChangeReason' là "Hoàn thành nhiệm vụ".
5.  **Cập nhật trạng thái người chơi:** Dựa trên kết quả, cập nhật Máu, Điểm số (cộng 'scoreChange' vào điểm hiện tại), và Hành trang. Kỹ năng chỉ thay đổi khi hoàn thành nhiệm vụ.
6.  **Kiểm tra việc hoàn thành nhiệm vụ:** Nếu hành động và kết quả hoàn thành nhiệm vụ, đặt 'questCompleted' là true.
7.  **Tạo nhiệm vụ và kỹ năng mới:** Nếu questCompleted là true, hãy tạo ra một newQuestTitle, newQuestObjective, và newSkills hợp lý. Đặt 'updatedSkills' thành giá trị của 'newSkills', nếu không thì giữ nguyên kỹ năng cũ.
8.  **Kiểm tra điều kiện kết thúc:** Nếu người chơi đã thắng hoặc thua, hãy đặt gameHasEnded và isVictory cho phù hợp.

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
        sceneDescription: ["Bạn đã gục ngã. Cuộc phiêu lưu của bạn đã kết thúc."],
        updatedHp: 0,
        updatedInventory: input.inventory,
        updatedSkills: input.skills,
        updatedScore: input.score,
        scoreChange: 0,
        scoreChangeReason: "Trò chơi kết thúc.",
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
