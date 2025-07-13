import { Button } from "@/components/ui/button";

type ActionChoicesProps = {
  choices: string[];
  onChoice: (choice: string) => void;
  isLoading: boolean;
};

export function ActionChoices({ choices, onChoice, isLoading }: ActionChoicesProps) {
  if (!choices.length && !isLoading) return <div className="h-[124px]"/>;
  if (!choices.length && isLoading) return null;

  return (
    <div className="p-4 bg-background/50 backdrop-blur-sm border-t border-primary/20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
            {choices.map((choice, index) => (
            <Button
                key={index}
                onClick={() => onChoice(choice)}
                disabled={isLoading}
                variant="outline"
                size="lg"
                className="text-base h-auto py-3 justify-center text-center border-accent/50 hover:bg-accent/20 hover:text-accent transition-colors duration-300"
            >
                {choice}
            </Button>
            ))}
        </div>
    </div>
  );
}
