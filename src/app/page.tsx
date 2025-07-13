'use client';

import { useState, useRef } from "react";
import Image from 'next/image';
import { useToast } from "@/hooks/use-toast";
import { startAdventure, progressAdventure } from "@/app/actions";
import { PlayerStatus } from "@/components/game/player-status";
import { AdventureLog } from "@/components/game/adventure-log";
import { ActionChoices } from "@/components/game/action-choices";
import { PromptScreen } from "@/components/game/prompt-screen";

export type Message = {
  sender: "bot" | "player";
  text: string;
};

type GameState = "prompt" | "loading" | "playing";

export default function HomePage() {
  const [gameState, setGameState] = useState<GameState>("prompt");
  const [messages, setMessages] = useState<Message[]>([]);
  const [choices, setChoices] = useState<string[]>([]);
  const [hp, setHp] = useState(100);
  const [skillPoints, setSkillPoints] = useState(10);
  const [inventory, setInventory] = useState("Một tấm bản đồ rách và một mẩu bánh mì.");
  const [score, setScore] = useState(0);
  const [sceneImageUrl, setSceneImageUrl] = useState<string | null>(null);
  
  const { toast } = useToast();
  const lastSceneRef = useRef("");
  const currentChoicesRef = useRef<string[]>([]);

  const handleStartAdventure = async (data: { prompt: string }) => {
    setGameState("loading");
    setMessages([{ sender: "player", text: `Hãy bắt đầu với: ${data.prompt}` }]);
    const result = await startAdventure(data);

    if (result.success && result.sceneDescription && result.choices) {
      setMessages(prev => [...prev, { sender: "bot", text: result.sceneDescription }]);
      setChoices(result.choices);
      lastSceneRef.current = result.sceneDescription;
      currentChoicesRef.current = result.choices;
      setSceneImageUrl(result.imageUrl || null);
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
    setChoices([]);
    setSceneImageUrl(null);

    const result = await progressAdventure({
      previousScene: lastSceneRef.current,
      playerChoice: choice,
      inventory,
      hp,
      skillPoints,
      score,
    });

    if (result.success && result.sceneDescription && result.actionChoices) {
      setMessages(prev => [...prev, { sender: "bot", text: result.sceneDescription }]);
      setChoices(result.actionChoices);
      setHp(result.updatedHp!);
      setSkillPoints(result.updatedSkillPoints!);
      setInventory(result.updatedInventory!);
      setScore(result.updatedScore!);
      setSceneImageUrl(result.imageUrl || null);
      lastSceneRef.current = result.sceneDescription;
      currentChoicesRef.current = result.actionChoices;
      setGameState("playing");
    } else {
      toast({
        variant: "destructive",
        title: "Một sự nhiễu loạn ma thuật!",
        description: result.error || "Số phận đang bị rối loạn. Vui lòng thử lại lựa chọn đó.",
      });
      setMessages(prev => prev.slice(0, -1)); // remove player's choice message
      setChoices(currentChoicesRef.current); // restore previous choices
      setSceneImageUrl(null); // Or restore previous image if you store it
      setGameState("playing");
    }
  };
  
  if (gameState === 'prompt' || (gameState === 'loading' && messages.length === 0)) {
    return <PromptScreen onStartAdventure={handleStartAdventure} isLoading={gameState === 'loading'} />;
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
                <ActionChoices choices={choices} onChoice={handlePlayerChoice} isLoading={gameState === 'loading'} />
            </div>
            <div className="hidden md:block h-full overflow-y-auto pr-2">
                <PlayerStatus hp={hp} skillPoints={skillPoints} inventory={inventory} score={score} />
            </div>
        </div>
    </main>
  );
}
