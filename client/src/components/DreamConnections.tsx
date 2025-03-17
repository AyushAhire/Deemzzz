import { useEffect, useRef } from 'react';
import type { Dream } from '@shared/schema';

interface DreamConnectionsProps {
  dreams: Dream[];
  containerRef: React.RefObject<HTMLDivElement>;
}

export default function DreamConnections({ dreams, containerRef }: DreamConnectionsProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const updateTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (!containerRef.current || !svgRef.current || dreams.length < 2) return;

    const updateConnections = () => {
      try {
        const capsules = containerRef.current!.getElementsByClassName('dream-capsule');
        const svg = svgRef.current!;

        // Ensure container dimensions are valid
        if (!containerRef.current.offsetWidth || !containerRef.current.offsetHeight) {
          console.log('Container dimensions not ready');
          return;
        }

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

            // Skip if either capsule's position is invalid
            if (!capsule1 || !capsule2 || 
                !capsule1.width || !capsule2.width ||
                !containerRef.current) {
              console.log('Invalid capsule dimensions, skipping connection');
              continue;
            }

            const containerRect = containerRef.current.getBoundingClientRect();

            // Validate positions are within container bounds
            if (capsule1.left < containerRect.left || capsule1.left > containerRect.right ||
                capsule2.left < containerRect.left || capsule2.left > containerRect.right) {
              continue;
            }

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
      } catch (error) {
        console.error('Error updating connections:', error);
      }
    };

    // Debounce update function
    const debouncedUpdate = () => {
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }
      updateTimeoutRef.current = setTimeout(updateConnections, 50);
    };

    // Initial update with a longer delay to ensure elements are rendered
    const initialUpdateTimeout = setTimeout(updateConnections, 500);

    // Add event listeners for drag updates
    const observer = new MutationObserver(debouncedUpdate);

    observer.observe(containerRef.current, { 
      attributes: true, 
      childList: true, 
      subtree: true,
      attributeFilter: ['style', 'transform'] 
    });

    // Update on window resize
    window.addEventListener('resize', debouncedUpdate);

    return () => {
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }
      clearTimeout(initialUpdateTimeout);
      observer.disconnect();
      window.removeEventListener('resize', debouncedUpdate);
    };
  }, [dreams, containerRef]);

  return (
    <svg
      ref={svgRef}
      className="absolute top-0 left-0 pointer-events-none z-0"
      style={{ filter: 'blur(0.5px)' }}
    />
  );
}