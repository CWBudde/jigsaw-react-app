import { useEffect, useRef } from 'react';
import { usePuzzleStore } from '@store/puzzleStore';
import { loadImage } from '@lib/utils/imageProcessing';
import { downscaleImage } from '@lib/utils/canvas';

export function PuzzlePreview() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { imageUrl } = usePuzzleStore();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let cancelled = false;

    const drawPreview = async () => {
      try {
        const image = await loadImage(imageUrl);
        if (cancelled) return;

        const size = Math.min(window.innerWidth, window.innerHeight) * 0.16;
        canvas.width = size;
        canvas.height = size;

        const previewCanvas = downscaleImage(image, size);
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(previewCanvas, 0, 0);
        }
      } catch (error) {
        console.error('Failed to load preview image:', error);
      }
    };

    drawPreview();

    return () => {
      cancelled = true;
    };
  }, [imageUrl]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: '8px',
        right: '8px',
        borderRadius: '8px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
        pointerEvents: 'none',
      }}
    />
  );
}
