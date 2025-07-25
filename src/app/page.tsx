'use client';

import { useState, useRef, useEffect } from "react";
import Image from 'next/image';
import { useToast } from "@/hooks/use-toast";
import { startAdventure, progressAdventure, chatWithSystem, startNewAdventureFromSystem } from "@/app/actions";
import { PlayerStatus } from "@/components/game/player-status";
import { AdventureLog } from "@/components/game/adventure-log";
import { ActionInput } from "@/components/game/action-input";
import { PromptScreen } from "@/components/game/prompt-screen";
import { GameOverScreen } from "@/components/game/game-over-screen";
import { SystemChat } from "@/components/game/system-chat";
import { GameGuide } from "@/components/game/game-guide";
import { Button } from "@/components/ui/button";
import { Wand2, BookOpen } from "lucide-react";


export type Message = {
  sender: "bot" | "player" | "system";
  text: string;
};

type GameState = "prompt" | "loading" | "playing" | "gameover";

export default function HomePage() {
  const [gameState, setGameState] = useState<GameState>("prompt");
  const [messages, setMessages] = useState<Message[]>([]);
  const [hp, setHp] = useState(100);
  const [skills, setSkills] = useState("Chưa có kỹ năng nào.");
  const [inventory, setInventory] = useState("Một chiếc áo choàng cũ, một con dao găm và vài đồng xu.");
  const [score, setScore] = useState(0);
  const [sceneImageUrl, setSceneImageUrl] = useState<string | null>(null);
  const [isVictory, setIsVictory] = useState(false);
  const [questTitle, setQuestTitle] = useState("");
  const [questObjective, setQuestObjective] = useState("");
  const [isSystemChatOpen, setSystemChatOpen] = useState(false);
  const [isGuideOpen, setGuideOpen] = useState(false);
  
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
    setSkills("Chưa có kỹ năng nào.");
    setInventory("Một chiếc áo choàng cũ, một con dao găm và vài đồng xu.");
    setSceneImageUrl(null);
    setIsVictory(false);
    setQuestTitle("");
    setQuestObjective("");


    const result = await startAdventure(data);

    if (result.success && result.sceneDescription && result.questTitle && result.questObjective && result.initialSkills) {
      const sceneParagraphs = result.sceneDescription.map(p => ({ sender: "bot" as const, text: p }));
      setMessages(prev => [...prev, ...sceneParagraphs]);
      lastSceneRef.current = result.sceneDescription.join("\n\n");
      setSceneImageUrl(result.imageUrl || null);
      setQuestTitle(result.questTitle);
      setQuestObjective(result.questObjective);
      setSkills(result.initialSkills);
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

    const result = await progressAdventure({
      previousScene: lastSceneRef.current,
      playerChoice: choice,
      inventory,
      hp,
      skills,
      score,
      questTitle,
      questObjective,
    });

    if (result.success && result.sceneDescription) {
      const newMessages: Message[] = [...messages, { sender: "player", text: choice }];
      
      if (result.scoreChange && result.scoreChange > 0 && result.scoreChangeReason) {
        newMessages.push({ sender: "system", text: `+${result.scoreChange} Điểm (${result.scoreChangeReason})` });
      }

      if (result.questCompleted) {
        if(result.newSkills) {
          newMessages.push({ sender: "system", text: `Kỹ năng mới nhận được: ${result.newSkills}` });
        }
      }

      const sceneParagraphs = result.sceneDescription.map(p => ({ sender: "bot" as const, text: p }));
      newMessages.push(...sceneParagraphs);
      setMessages(newMessages);

      setHp(result.updatedHp!);
      setSkills(result.updatedSkills!);
      setInventory(result.updatedInventory!);
      setScore(result.updatedScore!);
      setSceneImageUrl(result.imageUrl || null);
      lastSceneRef.current = result.sceneDescription.join("\n\n");
      
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
     // Apply HP cost for using the system
    const newHp = hp - 5;
    if (newHp <= 0) {
        setHp(0);
        setGameState("gameover");
        setIsVictory(false);
        return "Bạn đã kiệt sức vì thay đổi thực tại. Trò chơi kết thúc.";
    }
    setHp(newHp);
    toast({
        variant: "destructive",
        title: "Can thiệp vào thực tại",
        description: "Bạn đã dùng 5 Máu để nói chuyện với Hệ thống.",
    });

    const result = await chatWithSystem({
      userMessage: message,
      hp: newHp, // Send updated HP to the system
      skills,
      inventory,
      score,
      questTitle,
      questObjective,
      sceneDescription: lastSceneRef.current,
    });

    if (result.success) {
      // Handle story reset
      if (result.stateUpdates?.newStoryPrompt) {
        setGameState("loading");
        setSystemChatOpen(false); // Close the chat window
        setMessages([{sender: "system", text: `Đã đặt lại câu chuyện. Lời nhắc mới: ${result.stateUpdates.newStoryPrompt}`}]);
        
        const newStoryResult = await startNewAdventureFromSystem({ prompt: result.stateUpdates.newStoryPrompt });

        if (newStoryResult.success) {
          setHp(100);
          setScore(0);
          setInventory("Trang bị được làm mới.");
          setSkills(newStoryResult.initialSkills!);
          setQuestTitle(newStoryResult.questTitle!);
          setQuestObjective(newStoryResult.questObjective!);
          setSceneImageUrl(newStoryResult.imageUrl || null);
          const sceneParagraphs = newStoryResult.sceneDescription!.map(p => ({ sender: "bot" as const, text: p }));
          lastSceneRef.current = newStoryResult.sceneDescription!.join("\n\n");
          setMessages(prev => [...prev, ...sceneParagraphs]);
          setGameState("playing");
        } else {
           toast({
            variant: "destructive",
            title: "Lỗi Hệ thống",
            description: "Không thể bắt đầu câu chuyện mới. Vui lòng thử lại.",
          });
          setGameState("playing"); // Or prompt
        }

      // Handle normal state updates from trades, etc.
      } else if (result.stateUpdates) {
        setHp(result.stateUpdates.hp);
        setSkills(result.stateUpdates.skills);
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
                <PlayerStatus hp={hp} skills={skills} inventory={inventory} score={score} questTitle={questTitle} questObjective={questObjective} />
                 <Button onClick={() => setSystemChatOpen(true)} className="w-full bg-primary/80 hover:bg-primary text-primary-foreground shadow-lg" size="lg">
                    <Wand2 className="mr-2 h-5 w-5"/>
                    Can thiệp vào Câu chuyện
                </Button>
            </div>
        </div>
        <SystemChat 
            isOpen={isSystemChatOpen}
            onClose={() => setSystemChatOpen(false)}
            onSendMessage={handleSystemChat}
        />
        <GameGuide isOpen={isGuideOpen} onClose={() => setGuideOpen(false)} />
        <Button 
            onClick={() => setGuideOpen(true)} 
            variant="outline"
            size="lg"
            className="absolute bottom-4 right-4 h-12 rounded-full shadow-lg bg-secondary/50 hover:bg-secondary border-primary/20"
            >
            <BookOpen className="h-6 w-6" />
            <span className="ml-2">Hướng dẫn</span>
        </Button>
    </main>
  );
}
