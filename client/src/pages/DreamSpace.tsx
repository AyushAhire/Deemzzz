import { useEffect, useState, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import SpaceBackground from "@/components/SpaceBackground";
import DreamForm from "@/components/DreamForm";
import DreamCapsule from "@/components/DreamCapsule";
import DreamConnections from "@/components/DreamConnections";
import StatsPanel from "@/components/StatsPanel";
import type { Dream } from "@shared/schema";

export default function DreamSpace() {
  const [ws, setWs] = useState<WebSocket | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const websocket = new WebSocket(`${protocol}//${window.location.host}/ws`);

    websocket.onopen = () => {
      console.log('WebSocket connection established');
    };

    websocket.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    setWs(websocket);

    websocket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'new_dream' || data.type === 'dream_liked' || data.type === 'dream_encouraged') {
        queryClient.invalidateQueries({ queryKey: ['/api/dreams'] });
      }
    };

    return () => {
      if (websocket.readyState === WebSocket.OPEN) {
        websocket.close();
      }
    };
  }, []);

  const { data: dreams = [], isLoading } = useQuery<Dream[]>({
    queryKey: ['/api/dreams'],
  });

  const likeMutation = useMutation({
    mutationFn: (dreamId: number) => 
      fetch(`/api/dreams/${dreamId}/like`, { 
        method: 'POST',
        credentials: 'include'
      }).then(res => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/dreams'] });
    }
  });

  const encourageMutation = useMutation({
    mutationFn: ({ dreamId, message }: { dreamId: number, message: string }) =>
      fetch(`/api/dreams/${dreamId}/encourage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ message })
      }).then(res => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/dreams'] });
    }
  });

  if (isLoading) {
    return <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="animate-spin w-8 h-8 border-4 border-primary rounded-full border-t-transparent" />
    </div>;
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <SpaceBackground />

      <div className="relative z-10" ref={containerRef}>
        <StatsPanel dreams={dreams} />
        <DreamForm />

        <div className="container mx-auto px-4 py-16">
          <DreamConnections dreams={dreams} containerRef={containerRef} />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-8">
            {dreams.map((dream, index) => (
              <DreamCapsule
                key={dream.id}
                dream={dream}
                index={index}
                onLike={() => likeMutation.mutate(dream.id)}
                onEncourage={(message) => 
                  encourageMutation.mutate({ dreamId: dream.id, message })}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}