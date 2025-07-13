'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { BookOpen, Wand2, Star, Dices, BrainCircuit, Goal, ShieldQuestion } from 'lucide-react';

type GameGuideProps = {
    isOpen: boolean;
    onClose: () => void;
};

const GuideSection = ({ icon, title, children }: { icon: React.ReactNode, title: string, children: React.ReactNode }) => (
    <AccordionItem value={title}>
        <AccordionTrigger>
            <div className="flex items-center gap-3 text-lg">
                {icon}
                <span>{title}</span>
            </div>
        </AccordionTrigger>
        <AccordionContent className="prose prose-invert prose-sm text-muted-foreground pl-10">
            {children}
        </AccordionContent>
    </AccordionItem>
);


export function GameGuide({ isOpen, onClose }: GameGuideProps) {
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px] md:max-w-[600px] lg:max-w-[800px] h-[80vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-3 text-2xl">
                        <BookOpen className="h-7 w-7" />
                        Hướng dẫn chơi "Cuộc phiêu lưu ở Aetheria"
                    </DialogTitle>
                    <DialogDescription>
                        Chào mừng nhà thám hiểm! Đây là mọi thứ bạn cần biết để bắt đầu hành trình của mình.
                    </DialogDescription>
                </DialogHeader>
                <ScrollArea className="flex-1 p-4 border rounded-md my-4 bg-background/50">
                    <Accordion type="single" collapsible className="w-full">
                        <GuideSection icon={<BrainCircuit className="h-6 w-6 text-accent" />} title="Khái niệm Cốt lõi">
                            <p>Đây là một trò chơi phiêu lưu dựa trên văn bản, được điều khiển bởi một Quản trò AI (Game Master). Bạn không chọn từ các tùy chọn có sẵn; thay vào đó, bạn mô tả hành động của mình bằng lời, và AI sẽ kể cho bạn nghe về kết quả.</p>
                        </GuideSection>
                        
                        <GuideSection icon={<Dices className="h-6 w-6 text-accent" />} title="Cơ chế Trò chơi: Xúc xắc Vô hình">
                            <p>Mỗi hành động bạn thực hiện đều có một yếu tố may rủi. Đằng sau câu chuyện, Quản trò AI sẽ "tung một con xúc xắc 20 mặt (d20) vô hình" để quyết định mức độ thành công của bạn.</p>
                            <ul className="list-disc pl-5">
                                <li><strong>Thành công vang dội:</strong> Hành động thành công ngoài mong đợi, có thể mang lại lợi ích bất ngờ.</li>
                                <li><strong>Thành công:</strong> Hành động diễn ra như bạn dự định.</li>
                                <li><strong>Thành công với giá phải trả:</strong> Bạn đạt được mục tiêu nhưng gặp phải một trở ngại nhỏ (ví dụ: gây ra tiếng động, làm rơi vật phẩm).</li>
                                <li><strong>Thất bại:</strong> Hành động không thành công.</li>
                                <li><strong>Thất bại thảm hại:</strong> Hành động thất bại nặng nề và gây ra hậu quả tiêu cực lớn.</li>
                            </ul>
                        </GuideSection>

                        <GuideSection icon={<Goal className="h-6 w-6 text-accent" />} title="Kỹ năng & Nhiệm vụ">
                            <p>Mỗi nhiệm vụ sẽ cung cấp cho bạn một bộ kỹ năng riêng. Hãy mô tả hành động của bạn sao cho vận dụng được các kỹ năng này.</p>
                            <p><strong>Lợi ích:</strong> Khi hành động của bạn phù hợp với một kỹ năng đang có, bạn sẽ được cộng thêm điểm vào kết quả tung xúc xắc, làm tăng đáng kể cơ hội thành công!</p>
                            <p>Hoàn thành nhiệm vụ sẽ mang lại cho bạn điểm thưởng lớn và mở ra một nhiệm vụ mới với bộ kỹ năng mới.</p>
                        </GuideSection>

                        <GuideSection icon={<Star className="h-6 w-6 text-accent" />} title="Điểm Sáng tạo & Nhập vai">
                            <p>Trò chơi không chỉ về thành công hay thất bại. Những hành động thông minh, chi tiết, hoặc có tính nhập vai cao sẽ được thưởng thêm điểm, bất kể kết quả tung xúc xắc. Hãy mô tả hành động của bạn một cách sống động!</p>
                            <p>Ví dụ, thay vì nói "Tôi tấn công con quái vật", hãy thử: "Tôi lách người sang một bên để né cú vung của nó, đồng thời vung con dao găm của mình nhắm vào kẽ hở trên lớp giáp của nó."</p>
                        </GuideSection>

                        <GuideSection icon={<Wand2 className="h-6 w-6 text-accent" />} title="Can thiệp vào Câu chuyện (Hệ thống Chat)">
                            <p>Nút "Can thiệp vào Câu chuyện" sẽ mở một cuộc trò chuyện trực tiếp với AI Hệ thống, một thực thể quyền năng có thể thay đổi thực tại của trò chơi. Bạn có thể:</p>
                            <ul className="list-disc pl-5">
                                <li><strong>Hỏi thông tin:</strong> Kiểm tra lại nhiệm vụ, HP, kỹ năng, vật phẩm, và điểm số của bạn.</li>
                                <li><strong>Trao đổi tài nguyên:</strong> Dùng điểm để hồi máu hoặc mua một kỹ năng mới.</li>
                                <li><strong>Thay đổi nhỏ:</strong> Yêu cầu thêm các chi tiết vào cảnh hiện tại (ví dụ: "Tôi muốn tìm một manh mối trong phòng này"). AI sẽ không thay đổi trực tiếp mà sẽ đưa ra gợi ý để bạn hành động.</li>
                                <li><strong>Đặt lại câu chuyện:</strong> Nếu bạn muốn một khởi đầu hoàn toàn mới, hãy nói với Hệ thống. Nó sẽ hỏi bạn về nhân vật và bối cảnh bạn mong muốn, sau đó tạo ra một cuộc phiêu lưu mới cho bạn.</li>
                                <li><strong>Gợi ý cốt truyện:</strong> Nếu bạn bí ý tưởng, hãy hỏi Hệ thống để có một vài gợi ý khởi đầu.</li>
                            </ul>
                        </GuideSection>
                        
                        <GuideSection icon={<ShieldQuestion className="h-6 w-6 text-accent" />} title="Thắng & Thua">
                            <ul className="list-disc pl-5">
                                <li><strong>Thắng:</strong> Bạn chiến thắng bằng cách hoàn thành chuỗi nhiệm vụ và đạt được mục tiêu cuối cùng của câu chuyện.</li>
                                <li><strong>Thua:</strong> Cuộc phiêu lưu của bạn kết thúc nếu HP của bạn giảm xuống 0.</li>
                            </ul>
                        </GuideSection>
                    </Accordion>
                </ScrollArea>
            </DialogContent>
        </Dialog>
    );
}
