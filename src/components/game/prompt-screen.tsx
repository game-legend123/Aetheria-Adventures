'use client';

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Wand2 } from "lucide-react";

const formSchema = z.object({
  prompt: z.string().min(10, "Your prompt should be at least 10 characters long.").max(500, "Prompt cannot exceed 500 characters."),
});

type PromptFormValues = z.infer<typeof formSchema>;

type PromptScreenProps = {
  onStartAdventure: (values: PromptFormValues) => void;
  isLoading: boolean;
};

export function PromptScreen({ onStartAdventure, isLoading }: PromptScreenProps) {
  const form = useForm<PromptFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      prompt: "A young rogue in a bustling port city, searching for a legendary treasure map.",
    },
  });

  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-grid-primary/10" style={{backgroundImage: "url('https://placehold.co/1920x1080.png')", backgroundSize: 'cover', backgroundPosition: 'center'}} data-ai-hint="dark fantasy landscape">
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" />
      <Card className="z-10 w-full max-w-2xl bg-secondary/50 border-primary/20 shadow-2xl shadow-primary/10 backdrop-blur-md animate-in fade-in-0 zoom-in-95 duration-500">
        <CardHeader className="text-center">
          <div className="mx-auto bg-primary/20 p-4 rounded-full w-fit mb-4">
            <Wand2 className="w-10 h-10 text-accent" />
          </div>
          <CardTitle className="text-4xl font-headline text-accent">Legends of Aetheria</CardTitle>
          <CardDescription className="text-lg text-muted-foreground pt-2">
            Describe your hero, the setting, or the quest you wish to embark on. The AI Game Master will weave your tale.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onStartAdventure)} className="space-y-8">
              <FormField
                control={form.control}
                name="prompt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="sr-only">Adventure Prompt</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="e.g., A grizzled dwarf warrior seeking a lost relic in a mountain fortress..."
                        className="min-h-[120px] text-base bg-background/70 focus:bg-background"
                        disabled={isLoading}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isLoading} size="lg" className="w-full text-lg bg-primary hover:bg-primary/90">
                {isLoading ? "Summoning the world..." : "Begin Your Adventure"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
