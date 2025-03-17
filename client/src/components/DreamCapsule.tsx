import { useState } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Heart, MessageCircle } from "lucide-react";
import type { Dream } from "@shared/schema";

interface DreamCapsuleProps {
  dream: Dream;
  onLike: () => void;
  onEncourage: (message: string) => void;
  index: number;
}

export default function DreamCapsule({ dream, onLike, onEncourage, index }: DreamCapsuleProps) {
  const [message, setMessage] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);

  const handleEncourage = () => {
    if (message.trim()) {
      onEncourage(message);
      setMessage("");
    }
  };

  // Create a floating animation that's unique to each capsule
  const floatingAnimation = {
    y: [0, 10, 0],
    transition: {
      duration: 4,
      repeat: Infinity,
      repeatType: "reverse" as const,
      delay: index * 0.2, // Stagger the animations
    }
  };

  return (
    <motion.div
      className="dream-capsule relative"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ 
        opacity: 1, 
        scale: 1,
        ...floatingAnimation
      }}
      whileHover={{ scale: 1.02 }}
    >
      <Card 
        className={`
          backdrop-blur-2xl bg-white/5 border-white/10
          shadow-[0_8px_32px_0_rgba(31,38,135,0.37)]
          overflow-hidden transition-all duration-300 rounded-2xl
          hover:bg-white/10 hover:border-white/20
          ${isExpanded ? 'h-auto' : 'h-48'}
        `}
        style={{
          WebkitBackdropFilter: 'blur(20px)',
          backdropFilter: 'blur(20px)',
        }}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="p-6 relative z-10">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="font-semibold text-lg text-white/90">
                {dream.email.split('@')[0]}...
              </h3>
              <p className="text-sm text-white/60">
                Target: {new Date(dream.targetDate).toLocaleDateString()}
              </p>
            </div>

            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="text-white/60 hover:text-white hover:bg-white/10"
                onClick={(e) => {
                  e.stopPropagation();
                  onLike();
                }}
              >
                <Heart className="w-4 h-4 mr-1" />
                {dream.likes}
              </Button>

              <Button
                variant="ghost"
                size="sm"
                className="text-white/60 hover:text-white hover:bg-white/10"
              >
                <MessageCircle className="w-4 h-4 mr-1" />
                {dream.encouragements}
              </Button>
            </div>
          </div>

          <p className={`text-white/90 ${isExpanded ? '' : 'line-clamp-2'}`}>
            {dream.description}
          </p>

          {isExpanded && (
            <div className="mt-4 flex gap-2" onClick={(e) => e.stopPropagation()}>
              <Input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Send encouragement..."
                className="bg-white/5 border-white/20 text-white placeholder:text-white/40"
              />
              <Button 
                onClick={handleEncourage}
                className="bg-white/10 hover:bg-white/20 text-white"
              >
                Send
              </Button>
            </div>
          )}
        </div>
      </Card>
    </motion.div>
  );
}