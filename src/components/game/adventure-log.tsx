'use client';

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import type { Message } from "@/app/page";
import { useEffect, useRef } from "react";
import { Bot, User, Award } from "lucide-react";

type AdventureLogProps = {
  messages: Message[];
  isLoading: boolean;
};

export function AdventureLog({ messages, isLoading }: AdventureLogProps) {
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  return (
    <div ref={scrollAreaRef} className="flex-1 space-y-6 overflow-y-auto p-4 rounded-lg bg-black/20">
      {messages.map((message, index) => {
        if(message.sender === 'bot' && index === 0) return null; // Hide initial bot message if needed
        
        if (message.sender === 'system') {
          return (
             <div key={index} className="text-center py-2 animate-in fade-in duration-500">
                <p className="text-sm font-semibold text-yellow-400 bg-yellow-400/10 rounded-full px-4 py-2 inline-flex items-center gap-2">
                  <Award className="w-4 h-4" />
                  {message.text}
                </p>
            </div>
          )
        }
        
        return (
            <div
            key={index}
            className={cn(
                "flex items-start gap-4 animate-in fade-in duration-500",
                message.sender === "player" ? "flex-row-reverse" : "flex-row"
            )}
            >
            <Avatar className="border border-primary">
                {message.sender === "bot" ? (
                <>
                    <AvatarImage src="https://placehold.co/40x40.png" data-ai-hint="wizard storyteller" alt="Quản trò" />
                    <AvatarFallback><Bot /></AvatarFallback>
                </>
                ) : (
                <AvatarFallback><User /></AvatarFallback>
                )}
            </Avatar>
            <div
                className={cn(
                "max-w-xl rounded-lg px-4 py-3 shadow-md",
                message.sender === "bot"
                    ? "bg-secondary text-secondary-foreground"
                    : "bg-primary text-primary-foreground"
                )}
            >
                <p className="whitespace-pre-wrap">{message.text}</p>
            </div>
            </div>
      )}
    )}
      {isLoading && (
        <div className="flex items-start gap-4 justify-start">
          <Avatar className="border border-primary">
            <AvatarImage src="https://placehold.co/40x40.png" data-ai-hint="wizard storyteller" alt="Quản trò" />
            <AvatarFallback><Bot /></AvatarFallback>
          </Avatar>
          <div className="max-w-xl rounded-lg px-4 py-3 shadow-md bg-secondary text-secondary-foreground">
            <div className="flex items-center space-x-2">
              <span className="text-muted-foreground">Câu chuyện đang mở ra...</span>
              <div className="w-2 h-2 rounded-full bg-accent animate-pulse [animation-delay:0s]"></div>
              <div className="w-2 h-2 rounded-full bg-accent animate-pulse [animation-delay:0.2s]"></div>
              <div className="w-2 h-2 rounded-full bg-accent animate-pulse [animation-delay:0.4s]"></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
