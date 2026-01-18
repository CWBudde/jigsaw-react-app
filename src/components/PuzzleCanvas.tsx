import { useCallback, useEffect } from 'react';
import { useCanvas } from '@hooks/useCanvas';
import { useAnimation } from '@hooks/useAnimation';
import { useDragAndDrop } from '@hooks/useDragAndDrop';
import { usePuzzleGame } from '@hooks/usePuzzleGame';
import { usePuzzleStore } from '@store/puzzleStore';

export function PuzzleCanvas() {
  const { canvasRef, context, dimensions } = useCanvas();
  const { isComplete } = usePuzzleStore();

  const canvasWidth = dimensions.width;
  const canvasHeight = dimensions.height;

  const {
    jigsaw,
    shuffleProgress,
    outlineAlpha,
    needsRedraw,
    setNeedsRedraw,
    invalidate,
    advanceShuffleAnimation,
    advanceCompletionAnimation,
    checkCompletion,
  } = usePuzzleGame(canvasWidth, canvasHeight);

  // Drag and drop handlers
  const dragCallbacks = {
    onTileSelected: useCallback(() => {
      invalidate();
    }, [invalidate]),
    onTileMoved: useCallback(() => {
      invalidate();
    }, [invalidate]),
    onTileReleased: useCallback(() => {
      checkCompletion();
      invalidate();
    }, [checkCompletion, invalidate]),
    onInvalidate: invalidate,
  };

  useDragAndDrop(canvasRef, jigsaw, isComplete, shuffleProgress, dragCallbacks);

  // Animation loop
  const animate = useCallback(
    (deltaTime: number) => {
      if (!context || !jigsaw) return;

      // Advance shuffle animation
      advanceShuffleAnimation(deltaTime);

      // Advance completion animation
      advanceCompletionAnimation(deltaTime);

      // Draw if needed
      if (needsRedraw || isComplete) {
        // Clear canvas
        context.clearRect(0, 0, canvasWidth, canvasHeight);

        // Set global alpha for shuffle animation
        if (shuffleProgress < 1) {
          context.globalAlpha = shuffleProgress ** 4;
        } else {
          context.globalAlpha = 1;
        }

        // Draw jigsaw
        jigsaw.drawToContext(context, { outlineAlpha });

        context.globalAlpha = 1;
        setNeedsRedraw(false);
      }
    },
    [
      context,
      jigsaw,
      needsRedraw,
      isComplete,
      shuffleProgress,
      canvasWidth,
      canvasHeight,
      advanceShuffleAnimation,
      advanceCompletionAnimation,
      setNeedsRedraw,
      outlineAlpha,
    ]
  );

  useAnimation(animate, true);

  // Invalidate on resize
  useEffect(() => {
    invalidate();
  }, [canvasWidth, canvasHeight, invalidate]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        display: 'block',
        touchAction: 'none',
        width: '100%',
        height: '100%',
      }}
    />
  );
}
