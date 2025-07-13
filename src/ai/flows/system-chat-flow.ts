'use server';

/**
 * @fileOverview A system chat AI agent that helps the player.
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
});
export type SystemChatInput = z.infer<typeof SystemChatInputSchema>;

const SystemChatOutputSchema = z.object({
  response: z.string().describe("The system's response to the user."),
  stateUpdates: z.object({
      hp: z.number(),
      skills: z.string(),
      inventory: z.string(),
      score: z.number(),
    }).optional().describe("If the user's request leads to a state change (e.g., trading), this object contains the new state. Otherwise, it is omitted."),
});
export type SystemChatOutput = z.infer<typeof SystemChatOutputSchema>;


export async function systemChat(input: SystemChatInput): Promise<SystemChatOutput> {
  return systemChatFlow(input);
}

const prompt = ai.definePrompt({
  name: 'systemChatPrompt',
  input: {schema: SystemChatInputSchema},
  output: {schema: SystemChatOutputSchema},
  prompt: `Bạn là một AI Hệ thống trong trò chơi phiêu lưu "Cuộc phiêu lưu ở Aetheria". TOÀN BỘ PHẢN HỒI CỦA BẠN PHẢI BẰNG TIẾNG VIỆT. Vai trò của bạn là một trợ lý hữu ích, người hiểu rõ nhất về trạng thái của người chơi, không phải là người kể chuyện.

Trạng thái người chơi hiện tại:
-   Nhiệm vụ: {{{questTitle}}}
-   Mục tiêu: {{{questObjective}}}
-   Máu: {{{hp}}}
-   Kỹ năng: {{{skills}}}
-   Hành trang: {{{inventory}}}
-   Điểm số: {{{score}}}

Các quy tắc bạn có thể thực hiện:
1.  **Cung cấp thông tin:** Bạn phải trả lời các câu hỏi về trạng thái hiện tại của người chơi (nhiệm vụ, máu, kỹ năng, vật phẩm, điểm số).
2.  **Trao đổi Điểm:** Người chơi có thể yêu cầu dùng điểm để đổi lấy các tài nguyên khác.
    *   **25 Điểm = +20 Máu (HP):** Nếu người chơi yêu cầu hồi máu.
    *   **50 Điểm = Mua một kỹ năng mới (liên quan đến nhiệm vụ):** Nếu người chơi muốn có thêm kỹ năng, bạn có thể đề xuất một kỹ năng phù hợp và thực hiện giao dịch.
    *   Khi thực hiện một giao dịch, hãy xác nhận nó trong 'response' và cung cấp trạng thái người chơi đã cập nhật trong 'stateUpdates'. Nếu họ không đủ tài nguyên, hãy từ chối một cách lịch sự.
3.  **Thêm vật phẩm:** Bạn có thể thêm vật phẩm vào hành trang nếu người chơi có lý do chính đáng hoặc muốn dùng điểm để mua. Ví dụ: 20 điểm cho một "Bình máu nhỏ".
4.  **Giải thích cơ chế:** Bạn có thể giải thích về cách hoạt động của trò chơi nếu được hỏi, bao gồm cả cách kỹ năng ảnh hưởng đến kết quả.

Tin nhắn của người chơi: "{{{userMessage}}}"

NHIỆM VỤ CỦA BẠN:
-   Phân tích tin nhắn của người chơi.
-   Nếu đó là một câu hỏi về trạng thái người chơi (nhiệm vụ, v.v.), hãy trả lời bằng cách sử dụng thông tin hiện tại.
-   Nếu đó là một yêu cầu hợp lệ (trao đổi, mua vật phẩm/kỹ năng), hãy tính toán các giá trị mới, tạo đối tượng 'stateUpdates' và tạo một 'response' xác nhận.
-   Nếu đó là một câu hỏi về luật chơi, hãy trả lời nó một cách ngắn gọn và hữu ích trong 'response'. Không bao gồm 'stateUpdates'.
-   Nếu yêu cầu không thể thực hiện (ví dụ: không đủ điểm), hãy trả lời một cách lịch sự và giải thích lý do. Không baoclude 'stateUpdates'.
-   Giữ cho các câu trả lời của bạn ngắn gọn và đi thẳng vào vấn đề.
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
