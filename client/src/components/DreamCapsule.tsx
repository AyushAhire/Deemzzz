import { useState, useEffect } from "react";
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
  const [dragConstraints, setDragConstraints] = useState({ top: 0, left: 0, right: 0, bottom: 0 });

  useEffect(() => {
    const updateConstraints = () => {
      const parentElement = document.querySelector('.container');
      if (parentElement) {
        const rect = parentElement.getBoundingClientRect();
        setDragConstraints({
          top: 0,
          left: 0,
          right: Math.max(0, rect.width - 300), // 300px is capsule width
          bottom: Math.max(0, rect.height - 200), // 200px is approximate capsule height
        });
      }
    };

    window.addEventListener('resize', updateConstraints);
    updateConstraints();

    return () => window.removeEventListener('resize', updateConstraints);
  }, []);

  const handleEncourage = () => {
    if (message.trim()) {
      onEncourage(message);
      setMessage("");
    }
  };

  // Subtle floating animation
  const floatingAnimation = {
    y: [0, 5, 0],
    transition: {
      duration: 3,
      repeat: Infinity,
      repeatType: "reverse" as const,
      delay: index * 0.1,
      ease: "easeInOut"
    }
  };

  return (
    <motion.div
      className="dream-capsule relative"
      initial={{ opacity: 1 }}
      animate={floatingAnimation}
      drag
      dragMomentum={false}
      dragElastic={0.1}
      dragConstraints={dragConstraints}
      whileDrag={{ 
        scale: 1.1, 
        zIndex: 50,
        transition: { duration: 0.2 }
      }}
      whileHover={{ scale: 1.05, transition: { duration: 0.2 } }}
      onDragStart={() => setIsExpanded(false)}
    >
      <Card 
        className={`
          backdrop-blur-2xl bg-white/5 border-white/10
          shadow-[0_8px_32px_0_rgba(31,38,135,0.37)]
          overflow-hidden transition-all duration-300 rounded-xl
          hover:bg-white/10 hover:border-white/20
          cursor-grab active:cursor-grabbing
          ${isExpanded ? 'h-auto' : 'h-36'}
          max-w-[300px]
        `}
        style={{
          WebkitBackdropFilter: 'blur(20px)',
          backdropFilter: 'blur(20px)',
        }}
        onClick={() => !isExpanded && setIsExpanded(true)}
      >
        <div className="p-4 relative z-10">
          <div className="flex justify-between items-start mb-2">
            <div>
              <h3 className="font-semibold text-sm text-white/90">
                {dream.email.split('@')[0]}...
              </h3>
              <p className="text-xs text-white/60">
                {new Date(dream.targetDate).toLocaleDateString()}
              </p>
            </div>

            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-white/60 hover:text-white hover:bg-white/10"
                onClick={(e) => {
                  e.stopPropagation();
                  onLike();
                }}
              >
                <Heart className="w-3 h-3 mr-1" />
                <span className="text-xs">{dream.likes}</span>
              </Button>

              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-white/60 hover:text-white hover:bg-white/10"
              >
                <MessageCircle className="w-3 h-3 mr-1" />
                <span className="text-xs">{dream.encouragements}</span>
              </Button>
            </div>
          </div>

          <p className={`text-sm text-white/90 ${isExpanded ? '' : 'line-clamp-2'}`}>
            {dream.description}
          </p>

          {isExpanded && (
            <div className="mt-3 flex gap-2" onClick={(e) => e.stopPropagation()}>
              <Input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Send encouragement..."
                className="h-8 text-sm bg-white/5 border-white/20 text-white placeholder:text-white/40"
              />
              <Button 
                onClick={handleEncourage}
                size="sm"
                className="h-8 bg-white/10 hover:bg-white/20 text-white"
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