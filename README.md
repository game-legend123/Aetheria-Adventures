
# Cuộc phiêu lưu ở Aetheria

**Một Game Nhập Vai Phiêu Lưu Bằng Chữ Do AI Điều Khiển**

Chào mừng bạn đến với Aetheria, một thế giới ma thuật nơi mọi quyết định của bạn đều định hình nên số phận. Đây không phải là một trò chơi thông thường với những lựa chọn có sẵn. Tại đây, bạn là người viết nên câu chuyện của chính mình. Hãy mô tả hành động, nói lên suy nghĩ, và một Quản trò AI (Game Master) thông minh sẽ dệt nên một cuộc phiêu lưu độc nhất dành riêng cho bạn.

![Giao diện trò chơi](https://placehold.co/800x450.png)
*Giao diện chính của trò chơi, nơi cuộc phiêu lưu của bạn diễn ra.*

## Tính năng nổi bật

*   **AI Quản Trò (Game Master) Thông Minh:** Một AI tiên tiến đóng vai trò người dẫn chuyện, tạo ra các tình huống, nhân vật và diễn biến câu chuyện một cách linh hoạt dựa trên hành động của bạn.
*   **Lối Chơi Hoàn Toàn Tự Do:** Không có nút bấm lựa chọn. Bạn chỉ cần nhập những gì bạn muốn làm, từ việc "rút thanh kiếm sáng loáng và tấn công con quái vật" cho đến "cố gắng thuyết phục người lính gác bằng một câu chuyện bịa đặt".
*   **Hệ thống "Xúc xắc Vô hình":** Mọi hành động hợp lý đều được quyết định bởi một lần tung xúc xắc 20 mặt (d20) ẩn. Kỹ năng của bạn có thể tăng cơ hội thành công, nhưng may mắn vẫn là một phần của cuộc chơi.
*   **Khen thưởng Sự Sáng tạo:** Những hành động thông minh, chi tiết và có tính nhập vai cao sẽ được thưởng thêm điểm. Hãy suy nghĩ vượt ra ngoài khuôn khổ!
*   **Can thiệp vào Thực tại:** Trò chuyện với "AI Hệ thống" để thay đổi cốt truyện, hồi máu, mua kỹ năng mới, hoặc thậm chí bắt đầu một cuộc phiêu lưu hoàn toàn mới nếu bạn muốn. Nhưng hãy cẩn thận, sức mạnh này có cái giá của nó!

## Cách chơi

1.  **Kiến tạo Huyền thoại của bạn:** Trò chơi bắt đầu bằng việc bạn mô tả nhân vật, bối cảnh, hoặc nhiệm vụ mà bạn muốn. AI sẽ dựa vào đó để tạo ra cảnh mở đầu, nhiệm vụ đầu tiên và bộ kỹ năng ban đầu cho bạn.
2.  **Hành động:** Đọc mô tả của Quản trò và quyết định bạn sẽ làm gì tiếp theo. Hãy nhập hành động của bạn vào ô nhập liệu.
3.  **Quan sát & Thích ứng:** AI sẽ mô tả kết quả hành động của bạn. Hãy chú ý đến các chi tiết và manh mối trong lời kể, chúng có thể là chìa khóa cho nhiệm vụ của bạn.
4.  **Sử dụng Kỹ năng:** Mỗi nhiệm vụ sẽ cung cấp cho bạn một bộ kỹ năng. Vận dụng chúng trong hành động sẽ làm tăng đáng kể cơ hội thành công.
5.  **Cần trợ giúp?** Nhấn nút "Can thiệp vào Câu chuyện" để nói chuyện với AI Hệ thống. Nhưng hãy nhớ, mỗi lần như vậy sẽ tiêu tốn một ít Máu (HP) của bạn.
6.  **Chinh phục & Khám phá:** Hoàn thành các nhiệm vụ để nhận điểm, nhận kỹ năng mới và khám phá những chương tiếp theo trong câu chuyện của bạn cho đến khi đạt được chiến thắng cuối cùng!

*Để hiểu sâu hơn về các cơ chế, hãy nhấn vào nút **Hướng dẫn** trong game.*

## Cài đặt & Chạy dự án

Dự án này được xây dựng bằng Next.js, Genkit và Tailwind CSS.

### Yêu cầu

*   Node.js (phiên bản 20 trở lên)
*   npm hoặc yarn

### Các bước cài đặt

1.  **Clone repository:**
    ```bash
    git clone <URL_CUA_REPOSITORY>
    cd <TEN_THU_MUC_DU_AN>
    ```

2.  **Cài đặt các dependency:**
    ```bash
    npm install
    ```

3.  **Thiết lập Biến môi trường:**
    Tạo một tệp `.env.local` ở thư mục gốc của dự án và thêm khóa API của bạn từ Google AI Studio:
    ```
    GOOGLE_API_KEY=YOUR_GOOGLE_API_KEY
    ```

4.  **Chạy Genkit và ứng dụng Next.js:**
    Dự án cần chạy hai tiến trình song song: máy chủ Genkit cho AI và máy chủ Next.js cho giao diện người dùng.

    *   **Trong terminal thứ nhất, khởi động Genkit:**
        ```bash
        npm run genkit:watch
        ```
        Lệnh này sẽ khởi động máy chủ Genkit và tự động tải lại khi có thay đổi trong các tệp flow.

    *   **Trong terminal thứ hai, khởi động ứng dụng Next.js:**
        ```bash
        npm run dev
        ```

5.  **Mở ứng dụng:**
    Truy cập [http://localhost:9002](http://localhost:9002) (hoặc cổng mà bạn đã cấu hình) trong trình duyệt của bạn và bắt đầu cuộc phiêu lưu!
```
