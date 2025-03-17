import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import type { Dream } from '@shared/schema';

interface DreamConnectionsProps {
  dreams: Dream[];
  containerRef: React.RefObject<HTMLDivElement>;
}

export default function DreamConnections({ dreams, containerRef }: DreamConnectionsProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!containerRef.current || !svgRef.current || dreams.length < 2) return;

    const capsules = containerRef.current.getElementsByClassName('dream-capsule');
    const svg = svgRef.current;
    svg.setAttribute('width', containerRef.current.offsetWidth.toString());
    svg.setAttribute('height', containerRef.current.offsetHeight.toString());

    // Clear existing lines
    while (svg.firstChild) {
      svg.removeChild(svg.firstChild);
    }

    // Create connections between capsules
    for (let i = 0; i < capsules.length; i++) {
      for (let j = i + 1; j < capsules.length; j++) {
        const capsule1 = capsules[i].getBoundingClientRect();
        const capsule2 = capsules[j].getBoundingClientRect();
        const containerRect = containerRef.current.getBoundingClientRect();

        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', (capsule1.left + capsule1.width/2 - containerRect.left).toString());
        line.setAttribute('y1', (capsule1.top + capsule1.height/2 - containerRect.top).toString());
        line.setAttribute('x2', (capsule2.left + capsule2.width/2 - containerRect.left).toString());
        line.setAttribute('y2', (capsule2.top + capsule2.height/2 - containerRect.top).toString());
        line.setAttribute('stroke', 'rgba(255, 255, 255, 0.1)');
        line.setAttribute('stroke-width', '1');
        svg.appendChild(line);
      }
    }
  }, [dreams, containerRef]);

  return (
    <svg
      ref={svgRef}
      className="absolute top-0 left-0 pointer-events-none z-0"
      style={{ filter: 'blur(0.5px)' }}
    />
  );
}
