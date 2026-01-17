import { useEffect, useRef } from 'react';
import { usePuzzleStore } from '@store/puzzleStore';

declare global {
  interface Window {
    Vara: any;
  }
}

export function VictoryText() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { showVictory } = usePuzzleStore();

  useEffect(() => {
    if (!showVictory || !containerRef.current) return;

    // Load Vara script if not already loaded
    if (!window.Vara) {
      const script = document.createElement('script');
      script.src = '/vara1.min.js';
      script.onload = () => {
        initVara();
      };
      document.head.appendChild(script);
    } else {
      initVara();
    }

    function initVara() {
      if (containerRef.current && window.Vara) {
        new window.Vara(
          '#victory-text',
          '/fonts/SatisfySL.json',
          [
            {
              text: 'Frohe Weihnachten!',
              strokeWidth: 1.5,
              fontSize: 46,
              color: '#B00',
              x: 8,
              y: 8,
            },
          ]
        );
      }
    }
  }, [showVictory]);

  if (!showVictory) return null;

  return (
    <div
      id="victory-text"
      ref={containerRef}
      style={{
        position: 'fixed',
        bottom: '8px',
        left: '8px',
        pointerEvents: 'none',
      }}
    />
  );
}
