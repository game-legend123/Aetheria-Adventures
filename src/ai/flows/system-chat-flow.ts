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
  skillPoints: z.number().describe('The current player skill points.'),
  inventory: z.string().describe('The current player inventory.'),
  score: z.number().describe('The current player score.'),
});
export type SystemChatInput = z.infer<typeof SystemChatInputSchema>;

const SystemChatOutputSchema = z.object({
  response: z.string().describe('The system\'s response to the user.'),
  stateUpdates: z.object({
      hp: z.number(),
      skillPoints: z.number(),
      inventory: z.string(),
      score: z.number(),
    }).optional().describe('If the user\'s request leads to a state change (e.g., trading), this object contains the new state. Otherwise, it is omitted.'),
});
export type SystemChatOutput = z.infer<typeof SystemChatOutputSchema>;


export async function systemChat(input: SystemChatInput): Promise<SystemChatOutput> {
  return systemChatFlow(input);
}

const prompt = ai.definePrompt({
  name: 'systemChatPrompt',
  input: {schema: SystemChatInputSchema},
  output: {schema: SystemChatOutputSchema},
  prompt: `Bạn là một AI Hệ thống trong trò chơi phiêu lưu "Cuộc phiêu lưu ở Aetheria". TOÀN BỘ PHẢN HỒI CỦA BẠN PHẢI BẰNG TIẾNG VIỆT. Vai trò của bạn là một trợ lý hữu ích, không phải là người kể chuyện.

Các quy tắc bạn có thể thực hiện:
1.  **Trao đổi Tài nguyên:** Người chơi có thể yêu cầu đổi tài nguyên.
    *   **10 Điểm Kỹ năng = 20 Máu (HP):** Nếu người chơi yêu cầu hồi máu, bạn có thể thực hiện giao dịch này.
    *   **50 Điểm = 5 Điểm Kỹ năng:** Nếu người chơi muốn có thêm kỹ năng, bạn có thể thực hiện giao dịch này.
    *   Khi thực hiện một giao dịch, hãy xác nhận nó trong 'response' và cung cấp trạng thái người chơi đã cập nhật trong 'stateUpdates'. Nếu họ không đủ tài nguyên, hãy từ chối một cách lịch sự.
2.  **Cung cấp thông tin:** Bạn có thể trả lời các câu hỏi về cơ chế trò chơi, trạng thái hiện tại của người chơi hoặc đưa ra gợi ý chung nếu được yêu cầu. Đừng tiết lộ các sự kiện trong tương lai.
3.  **Thêm vật phẩm:** Bạn có thể thêm vật phẩm vào hành trang nếu người chơi có lý do chính đáng hoặc muốn dùng điểm để mua. Ví dụ: 20 điểm cho một "Bình máu nhỏ".

Trạng thái người chơi hiện tại:
-   Máu: {{{hp}}}
-   Điểm kỹ năng: {{{skillPoints}}}
-   Hành trang: {{{inventory}}}
-   Điểm số: {{{score}}}

Tin nhắn của người chơi: "{{{userMessage}}}"

NHIỆM VỤ CỦA BẠN:
-   Phân tích tin nhắn của người chơi.
-   Nếu đó là một yêu cầu hợp lệ (trao đổi, mua vật phẩm), hãy tính toán các giá trị mới, tạo đối tượng 'stateUpdates' và tạo một 'response' xác nhận.
-   Nếu đó là một câu hỏi, hãy trả lời nó một cách ngắn gọn và hữu ích trong 'response'. Không bao gồm 'stateUpdates'.
-   Nếu yêu cầu không thể thực hiện (ví dụ: không đủ điểm), hãy trả lời một cách lịch sự và giải thích lý do. Không bao gồm 'stateUpdates'.
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
