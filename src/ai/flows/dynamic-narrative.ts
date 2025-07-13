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
  score: z.number().describe('The current player score.'),
});
export type GenerateNextSceneInput = z.infer<typeof GenerateNextSceneInputSchema>;

const GenerateNextSceneOutputSchema = z.object({
  sceneDescription: z.string().describe('The description of the next scene.'),
  actionChoices: z.array(z.string()).describe('The available action choices for the player.'),
  updatedInventory: z.string().describe('The updated player inventory.'),
  updatedHp: z.number().describe('The updated player health points.'),
  updatedSkillPoints: z.number().describe('The updated player skill points.'),
  updatedScore: z.number().describe('The updated player score after the recent action.'),
});
export type GenerateNextSceneOutput = z.infer<typeof GenerateNextSceneOutputSchema>;

export async function generateNextScene(input: GenerateNextSceneInput): Promise<GenerateNextSceneOutput> {
  return generateNextSceneFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateNextScenePrompt',
  input: {schema: GenerateNextSceneInputSchema},
  output: {schema: GenerateNextSceneOutputSchema},
  prompt: `Bạn là một quản trò phiêu lưu năng động, có kỹ năng tạo ra những câu chuyện lôi cuốn và phân nhánh. TOÀN BỘ PHẢN HỒI CỦA BẠN PHẢI BẰNG TIẾNG VIỆT.

  Cảnh trước đó: {{{previousScene}}}
  Lựa chọn của người chơi: {{{playerChoice}}}
  Hành trang hiện tại: {{{inventory}}}
  Máu hiện tại: {{{hp}}}
  Điểm kỹ năng hiện tại: {{{skillPoints}}}
  Điểm số hiện tại: {{{score}}}

  Dựa trên cảnh trước đó của người chơi, lựa chọn của họ và các chỉ số hiện tại của họ, hãy tạo mô tả cảnh tiếp theo và 3-4 lựa chọn hành động khả thi.
  Đồng thời xác định hậu quả của hành động đó và cập nhật hành trang, máu, điểm kỹ năng và điểm số của người chơi.
  Thưởng 10 điểm cho một hành động thành công hoặc thông minh. Thưởng 5 điểm cho một kết quả trung tính. Không thưởng điểm cho một kết quả tiêu cực.

  Đảm bảo rằng mô tả cảnh hấp dẫn và tạo tiền đề cho loạt lựa chọn tiếp theo. Trò chơi có tên là Cuộc phiêu lưu ở Aetheria, và lấy bối cảnh ở lục địa ma thuật Aetheria, chứa đầy ma thuật, quái vật và kho báu cổ đại.
  Người chơi đang thực hiện nhiệm vụ đánh bại Chúa tể Bóng tối và phục hồi Trái tim Bình minh.
  Các lựa chọn hành động có sẵn phải rõ ràng và khác biệt, cung cấp các con đường khác nhau để người chơi lựa chọn. Hãy làm cho các lựa chọn hành động trở nên mạo hiểm và phù hợp với tình huống được trình bày trong Mô tả cảnh.
  Mỗi yếu tố của đầu ra phải là một chuỗi, ngoại trừ updatedHp, updatedSkillPoints và updatedScore, phải là số.
  Hành trang được cập nhật phải phản ánh các vật phẩm mà người chơi có dựa trên hành động của họ. Chỉ thay đổi nó nếu có điều gì đó xảy ra trong cảnh ảnh hưởng đến hành trang của người chơi.
  Nếu cảnh liên quan đến chiến đấu, hãy chắc chắn mô tả kết quả của cuộc chiến trong sceneDescription và cập nhật HP của người chơi cho phù hợp.
  Trò chơi sử dụng hệ thống chiến đấu theo lượt. Giả sử một hệ thống oẳn tù tì cho đơn giản.

  Thực hiện theo định dạng này:
  Mô tả cảnh: [Mô tả sống động về cảnh tiếp theo]
  Lựa chọn hành động: ["Lựa chọn 1", "Lựa chọn 2", "Lựa chọn 3", "Lựa chọn 4"]
  Hành trang đã cập nhật: [Mô tả về hành trang đã cập nhật của người chơi, nếu có]
  HP đã cập nhật: [Điểm máu đã cập nhật của người chơi]
  Điểm kỹ năng đã cập nhật: [Điểm kỹ năng đã cập nhật của người chơi]
  Điểm đã cập nhật: [Điểm đã cập nhật của người chơi]

  Đầu ra:
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
