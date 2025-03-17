import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { insertDreamSchema, type InsertDream } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { PlusCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

export default function DreamForm() {
  const [isOpen, setIsOpen] = useState(false);
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
      setIsOpen(false);
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
    <>
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-8 left-8 z-50 h-auto py-2 px-4"
        variant="outline"
      >
        <PlusCircle className="w-5 h-5 mr-2" />
        <span>Add Dream</span>
      </Button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-24 left-8 z-50 w-96"
          >
            <div className="backdrop-blur-xl bg-white/10 rounded-lg p-6 shadow-lg border border-white/20">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-white">Launch Dream</h2>
                <Button
                  variant="ghost"
                  className="text-white/60 hover:text-white"
                  onClick={() => setIsOpen(false)}
                >
                  ✕
                </Button>
              </div>

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
                            className="bg-white/5 border-white/20 text-white placeholder:text-white/40"
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
                            className="bg-white/5 border-white/20 text-white placeholder:text-white/40"
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
                    className="w-full bg-white/10 hover:bg-white/20 text-white"
                  >
                    {mutation.isPending ? "Launching..." : "Launch Dream"}
                  </Button>
                </form>
              </Form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}