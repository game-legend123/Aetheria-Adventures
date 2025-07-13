'use client';

import { useState, useRef, useEffect } from "react";
import Image from 'next/image';
import { useToast } from "@/hooks/use-toast";
import { startAdventure, progressAdventure, chatWithSystem } from "@/app/actions";
import { PlayerStatus } from "@/components/game/player-status";
import { AdventureLog } from "@/components/game/adventure-log";
import { ActionInput } from "@/components/game/action-input";
import { PromptScreen } from "@/components/game/prompt-screen";
import { GameOverScreen } from "@/components/game/game-over-screen";
import { SystemChat } from "@/components/game/system-chat";
import { Button } from "@/components/ui/button";
import { Bot } from "lucide-react";


export type Message = {
  sender: "bot" | "player" | "system";
  text: string;
};

type GameState = "prompt" | "loading" | "playing" | "gameover";

export default function HomePage() {
  const [gameState, setGameState] = useState<GameState>("prompt");
  const [messages, setMessages] = useState<Message[]>([]);
  const [hp, setHp] = useState(100);
  const [skillPoints, setSkillPoints] = useState(10);
  const [inventory, setInventory] = useState("Một chiếc áo choàng cũ, một con dao găm và vài đồng xu.");
  const [score, setScore] = useState(0);
  const [sceneImageUrl, setSceneImageUrl] = useState<string | null>(null);
  const [isVictory, setIsVictory] = useState(false);
  const [questTitle, setQuestTitle] = useState("");
  const [questObjective, setQuestObjective] = useState("");
  const [isSystemChatOpen, setSystemChatOpen] = useState(false);
  
  const { toast } = useToast();
  const lastSceneRef = useRef("");

  useEffect(() => {
    if (hp <= 0 && gameState === "playing") {
      setGameState("gameover");
      setIsVictory(false);
    }
  }, [hp, gameState]);

  const handleStartAdventure = async (data: { prompt: string }) => {
    setGameState("loading");
    setMessages([{ sender: "player", text: `Hãy bắt đầu với: ${data.prompt}` }]);
    setHp(100);
    setScore(0);
    setSkillPoints(10);
    setInventory("Một chiếc áo choàng cũ, một con dao găm và vài đồng xu.");
    setSceneImageUrl(null);
    setIsVictory(false);
    setQuestTitle("");
    setQuestObjective("");


    const result = await startAdventure(data);

    if (result.success && result.sceneDescription && result.questTitle && result.questObjective) {
      setMessages(prev => [...prev, { sender: "bot", text: result.sceneDescription }]);
      lastSceneRef.current = result.sceneDescription;
      setSceneImageUrl(result.imageUrl || null);
      setQuestTitle(result.questTitle);
      setQuestObjective(result.questObjective);
      setGameState("playing");
    } else {
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: result.error || "Không thể bắt đầu cuộc phiêu lưu.",
      });
      setGameState("prompt");
      setMessages([]);
    }
  };

  const handlePlayerChoice = async (choice: string) => {
    setGameState("loading");
    setMessages(prev => [...prev, { sender: "player", text: choice }]);
    setSceneImageUrl(null);

    const currentQuestTitle = questTitle;

    const result = await progressAdventure({
      previousScene: lastSceneRef.current,
      playerChoice: choice,
      inventory,
      hp,
      skillPoints,
      score,
      questTitle,
      questObjective,
    });

    if (result.success && result.sceneDescription) {
      const newMessages: Message[] = [...messages, { sender: "player", text: choice }];
      
      if (result.questCompleted) {
        newMessages.push({ sender: "system", text: `Nhiệm vụ hoàn thành: ${currentQuestTitle} (+100 Điểm)` });
      }

      newMessages.push({ sender: "bot", text: result.sceneDescription });
      setMessages(newMessages);

      setHp(result.updatedHp!);
      setSkillPoints(result.updatedSkillPoints!);
      setInventory(result.updatedInventory!);
      setScore(result.updatedScore!);
      setSceneImageUrl(result.imageUrl || null);
      lastSceneRef.current = result.sceneDescription;
      
      if (result.questCompleted && result.newQuestTitle && result.newQuestObjective) {
        setQuestTitle(result.newQuestTitle);
        setQuestObjective(result.newQuestObjective);
      }

      if (result.gameHasEnded) {
        setIsVictory(result.isVictory || false);
        setGameState("gameover");
      } else {
        setGameState("playing");
      }

    } else {
      toast({
        variant: "destructive",
        title: "Một sự nhiễu loạn ma thuật!",
        description: result.error || "Số phận đang bị rối loạn. Vui lòng thử lại lựa chọn đó.",
      });
      setMessages(prev => prev.slice(0, -1)); // remove player's choice message
      setSceneImageUrl(null); // Or restore previous image if you store it
      setGameState("playing");
    }
  };

  const handleRestart = () => {
    setGameState("prompt");
    setMessages([]);
  }

  const handleSystemChat = async (message: string) => {
    const result = await chatWithSystem({
      userMessage: message,
      hp,
      skillPoints,
      inventory,
      score,
      questTitle,
      questObjective,
    });

    if (result.success) {
      if (result.stateUpdates) {
        setHp(result.stateUpdates.hp);
        setSkillPoints(result.stateUpdates.skillPoints);
        setInventory(result.stateUpdates.inventory);
        setScore(result.stateUpdates.score);
        toast({
            title: "Hệ thống đã cập nhật chỉ số",
            description: "Trạng thái của bạn đã được thay đổi.",
        });
      }
      return result.response;
    } else {
      toast({
        variant: "destructive",
        title: "Lỗi Hệ thống",
        description: result.error,
      });
      return "Hệ thống hiện đang gặp sự cố, vui lòng thử lại sau.";
    }
  }
  
  if (gameState === 'prompt' || (gameState === 'loading' && messages.length === 0)) {
    return <PromptScreen onStartAdventure={handleStartAdventure} isLoading={gameState === 'loading'} />;
  }

  if (gameState === 'gameover') {
    return <GameOverScreen isVictory={isVictory} score={score} onRestart={handleRestart} />;
  }
  
  return (
    <main className="relative h-screen overflow-hidden bg-cover bg-center bg-no-repeat" style={{backgroundImage: "url('/background.jpg')"}} data-ai-hint="fantasy landscape">
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" />
        <div className="relative grid md:grid-cols-[1fr_320px] lg:grid-cols-[1fr_400px] h-screen gap-4 p-4">
            <div className="flex flex-col h-full max-h-screen">
                {sceneImageUrl ? (
                    <Image src={sceneImageUrl} alt="Cảnh hiện tại" width={800} height={450} className="w-full h-1/3 object-cover rounded-lg border-2 border-primary/50 shadow-lg mb-4" />
                ) : (
                    <div className="w-full h-1/3 bg-black/30 rounded-lg border-2 border-primary/50 shadow-lg mb-4 flex items-center justify-center">
                      <p className="text-muted-foreground">Đang tạo hình ảnh cảnh...</p>
                    </div>
                )}
                <AdventureLog messages={messages} isLoading={gameState === 'loading'} />
                <ActionInput onAction={handlePlayerChoice} isLoading={gameState === 'loading'} />
            </div>
            <div className="hidden md:flex flex-col h-full overflow-y-auto pr-2 gap-4">
                <PlayerStatus hp={hp} skillPoints={skillPoints} inventory={inventory} score={score} questTitle={questTitle} questObjective={questObjective} />
                 <Button onClick={() => setSystemChatOpen(true)} className="w-full" variant="outline">
                    <Bot className="mr-2 h-4 w-4"/>
                    Trò chuyện với Hệ thống
                </Button>
            </div>
        </div>
        <SystemChat 
            isOpen={isSystemChatOpen}
            onClose={() => setSystemChatOpen(false)}
            onSendMessage={handleSystemChat}
        />
    </main>
  );
}
