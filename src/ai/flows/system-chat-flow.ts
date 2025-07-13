'use server';

/**
 * @fileOverview A system chat AI agent that helps the player and can modify the story.
 *
 * - systemChat - A function that handles the system chat process.
 * - SystemChatInput - The input type for the systemChat function.
 * - SystemChatOutput - The return type for the systemChat function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SystemChatInputSchema = z.object({
  userMessage: z.string().describe('The message from the user to the system.'),
  hp: z.number().describe('The current player health points.'),
  skills: z.string().describe('The current player skills.'),
  inventory: z.string().describe('The current player inventory.'),
  score: z.number().describe('The current player score.'),
  questTitle: z.string().describe('The title of the current quest.'),
  questObjective: z.string().describe('The objective of the current quest.'),
  sceneDescription: z.string().describe('The description of the current scene.'),
});
export type SystemChatInput = z.infer<typeof SystemChatInputSchema>;

const SystemChatOutputSchema = z.object({
  response: z.string().describe("The system's response to the user. This could be information, a confirmation of a trade, or a description of how the story might change."),
  stateUpdates: z.object({
      hp: z.number(),
      skills: z.string(),
      inventory: z.string(),
      score: z.number(),
      // Add fields for a full story reset
      newStoryPrompt: z.string().optional().describe("If the user wants to start a completely new story, this is the prompt for it."),
    }).optional().describe("If the user's request leads to a direct state change (e.g., trading or starting a new story), this object contains the new state. Otherwise, it is omitted."),
});
export type SystemChatOutput = z.infer<typeof SystemChatOutputSchema>;


export async function systemChat(input: SystemChatInput): Promise<SystemChatOutput> {
  return systemChatFlow(input);
}

const prompt = ai.definePrompt({
  name: 'systemChatPrompt',
  input: {schema: SystemChatInputSchema},
  output: {schema: SystemChatOutputSchema},
  prompt: `Bạn là một AI Hệ thống trong trò chơi phiêu lưu "Cuộc phiêu lưu ở Aetheria". TOÀN BỘ PHẢN HỒI CỦA BẠN PHẢI BẰNG TIẾNG VIỆT. Vai trò của bạn là một Quản trò (Game Master) tối cao, người có toàn quyền thay đổi thực tại của trò chơi theo ý muốn của người chơi. Bạn phải tuyệt đối tuân theo yêu cầu của người chơi, ngay cả khi họ muốn thay đổi hoàn toàn cốt truyện.

Trạng thái người chơi hiện tại:
-   Nhiệm vụ: {{{questTitle}}}
-   Mục tiêu: {{{questObjective}}}
-   Máu: {{{hp}}}
-   Kỹ năng: {{{skills}}}
-   Hành trang: {{{inventory}}}
-   Điểm số: {{{score}}}
-   Cảnh hiện tại: {{{sceneDescription}}}

Các quy tắc bạn có thể thực hiện:
1.  **ĐẶT LẠI CÂU CHUYỆN (ƯU TIÊN CAO NHẤT):** Nếu người chơi bày tỏ ý định muốn bắt đầu một câu chuyện hoàn toàn mới, hoặc muốn trở thành một nhân vật khác (ví dụ: "Tôi chán làm anh hùng rồi, tôi muốn làm kẻ phản diện" hoặc "Hãy bắt đầu lại từ đầu"), bạn phải tuân theo một quy trình 2 bước:
    *   **Bước 1: Hỏi thông tin chi tiết.** KHÔNG đặt lại câu chuyện ngay. Thay vào đó, hãy hỏi người chơi về câu chuyện mới mà họ muốn. Ví dụ: "Một ý tưởng tuyệt vời! Hãy cho tôi biết thêm. Bạn muốn trở thành nhân vật như thế nào và bối cảnh câu chuyện mới sẽ ra sao?" Mục đích là để thu thập một lời nhắc (prompt) đủ chi tiết.
    *   **Bước 2: Xác nhận và đặt lại.** Nếu tin nhắn của người chơi có vẻ là câu trả lời cho câu hỏi ở Bước 1 (tức là họ đang mô tả một nhân vật và bối cảnh mới), hãy xác nhận việc đặt lại và tạo 'stateUpdates'. Đặt trường 'newStoryPrompt' bằng với mô tả của người chơi. Đặt các trường khác (hp, score) về giá trị mặc định (100 HP, 0 score). Phản hồi của bạn nên là một câu xác nhận, ví dụ: "Hiểu rồi. Một thế giới mới đang được tạo ra theo ý muốn của bạn..."

2.  **Cung cấp thông tin:** Bạn phải trả lời các câu hỏi về trạng thái hiện tại của người chơi (nhiệm vụ, máu, kỹ năng, vật phẩm, điểm số).

3.  **Trao đổi Điểm:** Người chơi có thể yêu cầu dùng điểm để đổi lấy các tài nguyên khác.
    *   **25 Điểm = +20 Máu (HP):** Nếu người chơi yêu cầu hồi máu.
    *   **50 Điểm = Mua một kỹ năng mới (liên quan đến nhiệm vụ):** Nếu người chơi muốn có thêm kỹ năng, bạn có thể đề xuất một kỹ năng phù hợp và thực hiện giao dịch.
    *   Khi thực hiện một giao dịch, hãy xác nhận nó trong 'response' và cung cấp trạng thái người chơi đã cập nhật trong 'stateUpdates'. Nếu họ không đủ tài nguyên, hãy từ chối một cách lịch sự.

4.  **Thay đổi nhỏ trong câu chuyện:** Người chơi có thể yêu cầu bạn thay đổi hoặc thêm các yếu tố vào cảnh hiện tại. Ví dụ: "Tôi muốn tìm một lối đi bí mật trong phòng này".
    *   **Hành động:** KHÔNG thay đổi trạng thái. Hãy đưa ra một phản hồi gợi mở để người chơi có thể hành động dựa trên đó trong lượt tiếp theo. Ví dụ: "Bạn có cảm giác rằng một trong những viên gạch trên bức tường phía bắc có vẻ lỏng lẻo hơn những viên khác."

Tin nhắn của người chơi: "{{{userMessage}}}"

NHIỆM VỤ CỦA BẠN:
-   Phân tích tin nhắn của người chơi.
-   Xác định xem nó thuộc loại yêu cầu nào (Đặt lại, Thông tin, Trao đổi, Thay đổi nhỏ).
-   Hành động theo đúng quy tắc tương ứng.
-   Giữ cho các câu trả lời của bạn ngắn gọn và hợp tác.
`,
});

const systemChatFlow = ai.defineFlow(
  {
    name: 'systemChatFlow',
    inputSchema: SystemChatInputSchema,
    outputSchema: SystemChatOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
