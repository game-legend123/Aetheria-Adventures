'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArrowRight, Bot, User, Wand2 } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

type ChatMessage = {
    sender: 'user' | 'system';
    text: string;
};

type SystemChatProps = {
    isOpen: boolean;
    onClose: () => void;
    onSendMessage: (message: string) => Promise<string>;
};

export function SystemChat({ isOpen, onClose, onSendMessage }: SystemChatProps) {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const scrollAreaRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (isOpen && messages.length === 0) {
            setMessages([{ sender: 'system', text: 'Chào mừng. Tại đây, bạn có thể thay đổi thực tại của câu chuyện. Bạn muốn điều chỉnh điều gì?' }]);
        }
    }, [isOpen, messages.length]);
    
    useEffect(() => {
        if (scrollAreaRef.current) {
            scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputValue.trim() || isLoading) return;

        const userMessage: ChatMessage = { sender: 'user', text: inputValue };
        setMessages(prev => [...prev, userMessage]);
        setInputValue('');
        setIsLoading(true);

        const responseText = await onSendMessage(userMessage.text);
        
        const systemMessage: ChatMessage = { sender: 'system', text: responseText };
        setMessages(prev => [...prev, systemMessage]);
        setIsLoading(false);
    };
    
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px] md:max-w-[600px] h-[70vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2"><Wand2 /> Can thiệp vào Câu chuyện</DialogTitle>
                    <DialogDescription>
                        Nói chuyện với Quản trò để thay đổi hướng đi của câu chuyện, hỏi thông tin, hoặc trao đổi tài nguyên.
                    </DialogDescription>
                </DialogHeader>
                <ScrollArea ref={scrollAreaRef} className="flex-1 p-4 border rounded-md my-4 bg-background/50">
                     <div className="space-y-4">
                        {messages.map((message, index) => (
                             <div
                                key={index}
                                className={cn(
                                    "flex items-start gap-3",
                                    message.sender === "user" ? "flex-row-reverse" : "flex-row"
                                )}
                            >
                                <Avatar className="border border-primary">
                                    <AvatarFallback>{message.sender === 'system' ? <Bot /> : <User />}</AvatarFallback>
                                </Avatar>
                                <div
                                    className={cn(
                                        "max-w-xs md:max-w-md rounded-lg px-3 py-2 shadow",
                                        message.sender === "system"
                                            ? "bg-secondary text-secondary-foreground"
                                            : "bg-primary text-primary-foreground"
                                    )}
                                >
                                    <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                                </div>
                            </div>
                        ))}
                         {isLoading && (
                            <div className="flex items-start gap-3">
                                <Avatar className="border border-primary">
                                    <AvatarFallback><Bot /></AvatarFallback>
                                </Avatar>
                                <div className="max-w-xs md:max-w-md rounded-lg px-3 py-2 shadow bg-secondary text-secondary-foreground">
                                    <div className="flex items-center space-x-2">
                                        <div className="w-2 h-2 rounded-full bg-accent animate-pulse [animation-delay:0s]"></div>
                                        <div className="w-2 h-2 rounded-full bg-accent animate-pulse [animation-delay:0.2s]"></div>
                                        <div className="w-2 h-2 rounded-full bg-accent animate-pulse [animation-delay:0.4s]"></div>
                                    </div>
                                </div>
                            </div>
                         )}
                    </div>
                </ScrollArea>
                <form onSubmit={handleSendMessage} className="flex gap-2">
                    <Input
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        placeholder="Yêu cầu của bạn là gì?"
                        disabled={isLoading}
                        className="flex-1"
                    />
                    <Button type="submit" disabled={isLoading || !inputValue.trim()} size="icon">
                        <ArrowRight />
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    );
}
