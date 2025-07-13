'use client';

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight } from "lucide-react";

type ActionInputProps = {
  onAction: (action: string) => void;
  isLoading: boolean;
};

export function ActionInput({ onAction, isLoading }: ActionInputProps) {
  const [inputValue, setInputValue] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim() && !isLoading) {
      onAction(inputValue.trim());
      setInputValue("");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 bg-background/50 backdrop-blur-sm border-t border-primary/20">
      <div className="flex gap-2 max-w-2xl mx-auto">
        <Input
          type="text"
          placeholder="Bạn làm gì tiếp theo?"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          disabled={isLoading}
          className="flex-1 bg-background/70 focus:bg-background"
        />
        <Button type="submit" disabled={isLoading || !inputValue.trim()} size="icon">
          <ArrowRight />
        </Button>
      </div>
    </form>
  );
}
