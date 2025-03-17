import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import type { Dream } from "@shared/schema";

interface StatsPanelProps {
  dreams: Dream[];
}

export default function StatsPanel({ dreams }: StatsPanelProps) {
  const totalDreams = dreams.length;
  const dreamsExpiringToday = dreams.filter(
    (dream) => 
      new Date(dream.targetDate).toDateString() === new Date().toDateString()
  ).length;
  const totalEncouragements = dreams.reduce(
    (sum, dream) => sum + dream.encouragements,
    0
  );
  const mostLikedDream = dreams.reduce(
    (max, dream) => (dream.likes > (max?.likes || 0) ? dream : max),
    dreams[0]
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed top-4 right-4 z-20"
    >
      <Card className="backdrop-blur-xl bg-white/10 border-white/20 text-white p-4 w-64">
        <h3 className="font-semibold mb-3">Dream Universe Stats</h3>
        
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span>Total Dreams:</span>
            <span className="font-medium">{totalDreams}</span>
          </div>
          
          <div className="flex justify-between">
            <span>Expiring Today:</span>
            <span className="font-medium">{dreamsExpiringToday}</span>
          </div>
          
          <div className="flex justify-between">
            <span>Encouragements:</span>
            <span className="font-medium">{totalEncouragements}</span>
          </div>
          
          {mostLikedDream && (
            <div className="pt-2 border-t border-white/10">
              <p className="text-xs text-white/60">Most Liked Dream:</p>
              <p className="text-sm line-clamp-1">{mostLikedDream.description}</p>
              <p className="text-xs text-white/60">
                {mostLikedDream.likes} likes
              </p>
            </div>
          )}
        </div>
      </Card>
    </motion.div>
  );
}
