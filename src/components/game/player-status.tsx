import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Heart, Sparkles, Backpack, Star, ScrollText } from "lucide-react";

type PlayerStatusProps = {
  hp: number;
  skills: string;
  inventory: string;
  score: number;
  questTitle: string;
  questObjective: string;
};

export function PlayerStatus({ hp, skills, inventory, score, questTitle, questObjective }: PlayerStatusProps) {
  return (
    <Card className="bg-secondary/40 border-primary/20 backdrop-blur-sm sticky top-4">
      <CardHeader>
        <CardTitle className="text-lg font-headline text-accent">Trạng thái người chơi</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 text-foreground">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Heart className="w-5 h-5 text-destructive" />
              <p className="font-semibold">Máu</p>
            </div>
            <span className="font-bold text-lg">{hp} / 100</span>
          </div>
          <Progress value={hp} className="h-3 [&>div]:bg-destructive" />
        </div>
        <div className="flex items-start gap-3">
          <Sparkles className="w-5 h-5 text-accent mt-1" />
          <div>
            <p className="font-semibold">Kỹ năng</p>
            <p className="text-sm text-muted-foreground italic">{skills}</p>
          </div>
        </div>
         <div className="flex items-center gap-3">
          <Star className="w-5 h-5 text-yellow-400" />
          <p className="font-semibold">Điểm số</p>
          <span className="font-bold text-lg ml-auto">{score}</span>
        </div>
        <div className="flex items-start gap-3">
          <Backpack className="w-5 h-5 text-muted-foreground mt-1" />
          <div>
            <p className="font-semibold">Hành trang</p>
            <p className="text-sm text-muted-foreground italic">{inventory}</p>
          </div>
        </div>
        
        <Separator className="bg-primary/20" />

        <div className="flex items-start gap-3">
          <ScrollText className="w-5 h-5 text-yellow-500 mt-1" />
           <div>
            <p className="font-semibold text-yellow-400">{questTitle}</p>
            <p className="text-sm text-muted-foreground">{questObjective}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
