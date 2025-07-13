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
  prompt: z.string().min(10, "Mô tả của bạn cần ít nhất 10 ký tự.").max(500, "Mô tả không được vượt quá 500 ký tự."),
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
      prompt: "Một nhà thám hiểm đang tìm kiếm một thương gia bí ẩn tên là Silas, người được cho là đang sở hữu một món đồ cổ có sức mạnh to lớn.",
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
          <CardTitle className="text-4xl font-headline text-accent">Huyền thoại xứ Aetheria</CardTitle>
          <CardDescription className="text-lg text-muted-foreground pt-2">
            Mô tả anh hùng của bạn, bối cảnh, hoặc nhiệm vụ bạn muốn bắt đầu. Quản trò AI sẽ dệt nên câu chuyện của bạn.
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
                    <FormLabel className="sr-only">Mô tả cuộc phiêu lưu</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="VD: Một chiến binh người lùn dày dạn kinh nghiệm tìm kiếm một di vật bị mất trong pháo đài trên núi..."
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
                {isLoading ? "Đang kiến tạo thế giới..." : "Bắt đầu cuộc phiêu lưu"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
