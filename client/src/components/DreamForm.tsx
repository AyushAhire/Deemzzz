import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { insertDreamSchema, type InsertDream } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

export default function DreamForm() {
  const { toast } = useToast();

  const form = useForm<InsertDream>({
    resolver: zodResolver(insertDreamSchema),
    defaultValues: {
      description: "",
      email: "",
      targetDate: new Date().toISOString().split('T')[0],
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: InsertDream) => {
      const res = await fetch("/api/dreams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: 'include',
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error?.message || "Failed to create dream");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/dreams"] });
      form.reset();
      toast({
        title: "Dream submitted!",
        description: "Your dream capsule is now floating in space.",
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    },
  });

  return (
    <div className="max-w-lg mx-auto backdrop-blur-lg bg-white/10 rounded-lg p-6 shadow-lg">
      <h2 className="text-2xl font-bold text-white mb-6">Submit Your Dream</h2>

      <Form {...form}>
        <form onSubmit={form.handleSubmit((data) => mutation.mutate(data))} className="space-y-6">
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-white">Your Dream</FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    placeholder="Share your dream..."
                    className="bg-white/5 border-white/20 text-white"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-white">Email</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="email"
                    placeholder="your@email.com"
                    className="bg-white/5 border-white/20 text-white"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="targetDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-white">Target Date</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="date"
                    min={new Date().toISOString().split('T')[0]}
                    className="bg-white/5 border-white/20 text-white"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            disabled={mutation.isPending}
            className="w-full bg-primary/80 hover:bg-primary"
          >
            {mutation.isPending ? "Submitting..." : "Launch Dream Capsule"}
          </Button>
        </form>
      </Form>
    </div>
  );
}