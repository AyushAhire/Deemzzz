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
}

export default function DreamCapsule({ dream, onLike, onEncourage }: DreamCapsuleProps) {
  const [message, setMessage] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);

  const handleEncourage = () => {
    if (message.trim()) {
      onEncourage(message);
      setMessage("");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      className="relative"
    >
      <Card 
        className={`
          backdrop-blur-xl bg-white/10 border-white/20 text-white
          overflow-hidden transition-all duration-300
          ${isExpanded ? 'h-auto' : 'h-48'}
        `}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="font-semibold text-lg">
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
                className="text-white/60 hover:text-white"
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
                className="text-white/60 hover:text-white"
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
                className="bg-white/5 border-white/20 text-white"
              />
              <Button onClick={handleEncourage}>Send</Button>
            </div>
          )}
        </div>
      </Card>
    </motion.div>
  );
}
