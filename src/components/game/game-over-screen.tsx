'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, Skull } from "lucide-react";

type GameOverScreenProps = {
  isVictory: boolean;
  score: number;
  onRestart: () => void;
};

export function GameOverScreen({ isVictory, score, onRestart }: GameOverScreenProps) {
  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-grid-primary/10" style={{backgroundImage: "url('https://placehold.co/1920x1080.png')", backgroundSize: 'cover', backgroundPosition: 'center'}} data-ai-hint="dark fantasy landscape">
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" />
      <Card className="z-10 w-full max-w-md bg-secondary/50 border-primary/20 shadow-2xl shadow-primary/10 backdrop-blur-md animate-in fade-in-0 zoom-in-95 duration-500">
        <CardHeader className="text-center items-center">
          {isVictory ? (
            <Trophy className="w-16 h-16 text-yellow-400" />
          ) : (
            <Skull className="w-16 h-16 text-destructive" />
          )}
          <CardTitle className={`text-4xl font-headline ${isVictory ? 'text-yellow-400' : 'text-destructive'}`}>
            {isVictory ? "Chiến thắng!" : "Trò chơi kết thúc"}
          </CardTitle>
          <CardDescription className="text-lg text-muted-foreground pt-2">
            {isVictory ? "Bạn đã hoàn thành nhiệm vụ và trở thành một huyền thoại ở Aetheria." : "Cuộc phiêu lưu của bạn đã kết thúc trong bi kịch."}
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
            <p className="text-lg">Điểm cuối cùng của bạn:</p>
            <p className="text-5xl font-bold text-accent">{score}</p>
        </CardContent>
        <CardFooter>
            <Button onClick={onRestart} size="lg" className="w-full text-lg">
                Chơi lại
            </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
