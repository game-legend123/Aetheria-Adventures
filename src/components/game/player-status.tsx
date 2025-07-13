import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Heart, Sparkles, Backpack, Star } from "lucide-react";

type PlayerStatusProps = {
  hp: number;
  skillPoints: number;
  inventory: string;
  score: number;
};

export function PlayerStatus({ hp, skillPoints, inventory, score }: PlayerStatusProps) {
  return (
    <Card className="bg-secondary/40 border-primary/20 backdrop-blur-sm sticky top-4">
      <CardHeader>
        <CardTitle className="text-lg font-headline text-accent">Player Status</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 text-foreground">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Heart className="w-5 h-5 text-destructive" />
              <p className="font-semibold">Health</p>
            </div>
            <span className="font-bold text-lg">{hp} / 100</span>
          </div>
          <Progress value={hp} className="h-3 [&>div]:bg-destructive" />
        </div>
        <div className="flex items-center gap-3">
          <Sparkles className="w-5 h-5 text-accent" />
          <p className="font-semibold">Skill Points</p>
          <span className="font-bold text-lg ml-auto">{skillPoints}</span>
        </div>
         <div className="flex items-center gap-3">
          <Star className="w-5 h-5 text-yellow-400" />
          <p className="font-semibold">Score</p>
          <span className="font-bold text-lg ml-auto">{score}</span>
        </div>
        <div className="flex items-start gap-3">
          <Backpack className="w-5 h-5 text-muted-foreground mt-1" />
          <div>
            <p className="font-semibold">Inventory</p>
            <p className="text-sm text-muted-foreground italic">{inventory}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
