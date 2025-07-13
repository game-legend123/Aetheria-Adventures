'use client';

import { useState, useRef } from "react";
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
  const [inventory, setInventory] = useState("A tattered map and a piece of bread.");
  
  const { toast } = useToast();
  const lastSceneRef = useRef("");
  const currentChoicesRef = useRef<string[]>([]);

  const handleStartAdventure = async (data: { prompt: string }) => {
    setGameState("loading");
    setMessages([{ sender: "player", text: `Let's start with this: ${data.prompt}` }]);
    const result = await startAdventure(data);

    if (result.success && result.sceneDescription && result.choices) {
      setMessages(prev => [...prev, { sender: "bot", text: result.sceneDescription }]);
      setChoices(result.choices);
      lastSceneRef.current = result.sceneDescription;
      currentChoicesRef.current = result.choices;
      setGameState("playing");
    } else {
      toast({
        variant: "destructive",
        title: "Error",
        description: result.error || "Could not start the adventure.",
      });
      setGameState("prompt");
      setMessages([]);
    }
  };

  const handlePlayerChoice = async (choice: string) => {
    setGameState("loading");
    setMessages(prev => [...prev, { sender: "player", text: choice }]);
    setChoices([]);

    const result = await progressAdventure({
      previousScene: lastSceneRef.current,
      playerChoice: choice,
      inventory,
      hp,
      skillPoints,
    });

    if (result.success && result.sceneDescription && result.actionChoices) {
      setMessages(prev => [...prev, { sender: "bot", text: result.sceneDescription }]);
      setChoices(result.actionChoices);
      setHp(result.updatedHp!);
      setSkillPoints(result.updatedSkillPoints!);
      setInventory(result.updatedInventory!);
      lastSceneRef.current = result.sceneDescription;
      currentChoicesRef.current = result.actionChoices;
      setGameState("playing");
    } else {
      toast({
        variant: "destructive",
        title: "A magical interference!",
        description: result.error || "The weave of fate is tangled. Please try that choice again.",
      });
      setMessages(prev => prev.slice(0, -1)); // remove player's choice message
      setChoices(currentChoicesRef.current); // restore previous choices
      setGameState("playing");
    }
  };
  
  if (gameState === 'prompt' || (gameState === 'loading' && messages.length === 0)) {
    return <PromptScreen onStartAdventure={handleStartAdventure} isLoading={gameState === 'loading'} />;
  }
  
  return (
    <main className="relative h-screen overflow-hidden bg-cover bg-center bg-no-repeat" style={{backgroundImage: "url('https://placehold.co/1920x1080.png')", backgroundAttachment: 'fixed'}} data-ai-hint="fantasy landscape">
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" />
        <div className="relative grid md:grid-cols-[1fr_320px] lg:grid-cols-[1fr_400px] h-screen gap-4 p-4">
            <div className="flex flex-col h-full max-h-screen">
                <AdventureLog messages={messages} isLoading={gameState === 'loading'} />
                <ActionChoices choices={choices} onChoice={handlePlayerChoice} isLoading={gameState === 'loading'} />
            </div>
            <div className="hidden md:block h-full overflow-y-auto pr-2">
                <PlayerStatus hp={hp} skillPoints={skillPoints} inventory={inventory} />
            </div>
        </div>
    </main>
  );
}
