'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { BookOpen, Wand2, Star, Dices, BrainCircuit, Goal, ShieldQuestion, ArrowRight } from 'lucide-react';

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
        <AccordionContent className="prose prose-invert prose-sm text-muted-foreground pl-10 leading-relaxed">
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
                    <Accordion type="single" collapsible className="w-full" defaultValue="Khái niệm Cốt lõi">
                        <GuideSection icon={<BrainCircuit className="h-6 w-6 text-accent" />} title="Khái niệm Cốt lõi">
                            <p>Đây là một trò chơi phiêu lưu dựa trên văn bản, được điều khiển bởi một Quản trò AI (Game Master). Bạn không chọn từ các tùy chọn có sẵn; thay vào đó, bạn mô tả hành động của mình bằng lời, và AI sẽ kể cho bạn nghe về kết quả.</p>
                            <p>Mục tiêu là sử dụng trí tưởng tượng của bạn để giải quyết các vấn đề, hoàn thành nhiệm vụ và dệt nên câu chuyện của riêng bạn.</p>
                        </GuideSection>
                        
                        <GuideSection icon={<Dices className="h-6 w-6 text-accent" />} title="Cơ chế Trò chơi: Xúc xắc Vô hình">
                            <p>Mỗi hành động hợp lý bạn thực hiện đều có một yếu tố may rủi. Đằng sau câu chuyện, Quản trò AI sẽ "tung một con xúc xắc 20 mặt (d20) vô hình" để quyết định mức độ thành công của bạn.</p>
                            <ul className="list-disc pl-5 space-y-2">
                                <li><strong>Thành công vang dội:</strong> Hành động thành công ngoài mong đợi, có thể mang lại lợi ích bất ngờ.</li>
                                <li><strong>Thành công:</strong> Hành động diễn ra như bạn dự định.</li>
                                <li><strong>Thành công với giá phải trả:</strong> Bạn đạt được mục tiêu nhưng gặp phải một trở ngại nhỏ (ví dụ: gây ra tiếng động, làm rơi vật phẩm).</li>
                                <li><strong>Thất bại:</strong> Hành động không thành công.</li>
                                <li><strong>Thất bại thảm hại:</strong> Hành động thất bại nặng nề và gây ra hậu quả tiêu cực lớn.</li>
                                <li><strong>Hành động vô lý:</strong> Nếu bạn làm điều gì đó hoàn toàn không thể, AI sẽ phản biện lại bạn một cách hợp lý thay vì tung xúc xắc.</li>
                            </ul>
                             <p className="mt-2">Quản trò AI sẽ luôn cài cắm manh mối vào trong các đoạn mô tả để giúp bạn định hướng hành động tiếp theo.</p>
                        </GuideSection>

                        <GuideSection icon={<Goal className="h-6 w-6 text-accent" />} title="Kỹ năng & Nhiệm vụ">
                            <p>Mỗi nhiệm vụ sẽ cung cấp cho bạn một bộ kỹ năng riêng. Hãy mô tả hành động của bạn sao cho vận dụng được các kỹ năng này.</p>
                            <p><strong>Lợi ích:</strong> Khi hành động của bạn phù hợp với một kỹ năng đang có, bạn sẽ được cộng thêm điểm vào kết quả tung xúc xắc, làm tăng đáng kể cơ hội thành công!</p>
                            <p>Hoàn thành nhiệm vụ sẽ mang lại cho bạn điểm thưởng lớn và mở ra một nhiệm vụ mới với bộ kỹ năng mới để câu chuyện tiếp tục.</p>
                        </GuideSection>

                        <GuideSection icon={<Star className="h-6 w-6 text-accent" />} title="Điểm và Giải thích">
                            <p>Trò chơi không chỉ về thành công hay thất bại. Những hành động thông minh, chi tiết, hoặc có tính nhập vai cao sẽ được thưởng thêm điểm. AI sẽ luôn giải thích lý do bạn nhận được điểm (ví dụ: "+15 Điểm (Thành công & Sáng tạo)").</p>
                            <p>Ví dụ, thay vì nói "Tôi tấn công con quái vật", hãy thử: "Tôi lách người sang một bên để né cú vung của nó, đồng thời vung con dao găm của mình nhắm vào kẽ hở trên lớp giáp của nó."</p>
                        </GuideSection>

                        <GuideSection icon={<Wand2 className="h-6 w-6 text-accent" />} title="Can thiệp vào Câu chuyện (Hệ thống Chat)">
                            <p className="font-bold text-destructive/80">Lưu ý: Mỗi lần gửi tin nhắn cho Hệ thống sẽ tiêu tốn 5 Máu.</p>
                            <p>Nút "Can thiệp vào Câu chuyện" sẽ mở một cuộc trò chuyện trực tiếp với AI Hệ thống, một thực thể quyền năng có thể thay đổi thực tại của trò chơi. Bạn có thể:</p>
                            <ul className="list-disc pl-5 space-y-2">
                                <li><strong>Hỏi thông tin:</strong> Kiểm tra lại nhiệm vụ, HP, kỹ năng, vật phẩm, và điểm số của bạn.</li>
                                <li><strong>Trao đổi tài nguyên:</strong> Dùng điểm để hồi máu hoặc mua một kỹ năng mới (nếu đủ điểm).</li>
                                <li><strong>Thay đổi nhỏ:</strong> Yêu cầu thêm các chi tiết vào cảnh hiện tại (ví dụ: "Tôi muốn tìm một manh mối trong phòng này"). AI sẽ không thay đổi trực tiếp mà sẽ đưa ra gợi ý để bạn hành động.</li>
                                <li><strong>Gợi ý cốt truyện:</strong> Nếu bạn bí ý tưởng, hãy hỏi Hệ thống để có một vài gợi ý khởi đầu.</li>
                                <li><strong>Đặt lại câu chuyện:</strong> Đây là một quy trình 2 bước:
                                    <ul className="list-decimal pl-6 mt-2 space-y-1">
                                         <li><span className="font-bold">Bước 1:</span> Nói với Hệ thống rằng bạn muốn một câu chuyện mới. Nó sẽ hỏi bạn về nhân vật và bối cảnh bạn mong muốn.</li>
                                         <li><span className="font-bold">Bước 2:</span> Mô tả ý tưởng của bạn. Hệ thống sẽ xác nhận và tạo ra một cuộc phiêu lưu hoàn toàn mới cho bạn.</li>
                                    </ul>
                                </li>
                            </ul>
                        </GuideSection>
                        
                        <GuideSection icon={<ShieldQuestion className="h-6 w-6 text-accent" />} title="Thắng & Thua">
                            <ul className="list-disc pl-5 space-y-2">
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
