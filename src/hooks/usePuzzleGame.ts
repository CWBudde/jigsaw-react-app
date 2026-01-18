import { useState, useEffect, useRef, useCallback } from 'react';
import { Jigsaw } from '@lib/jigsaw/Jigsaw';
import { loadImage } from '@lib/utils/imageProcessing';
import { OUTLINE_FADE_DURATION_SECONDS, PUZZLE_SIZE_RATIO, SHUFFLE_ANIMATION_SPEED } from '@lib/constants';
import { usePuzzleStore } from '@store/puzzleStore';

export function usePuzzleGame(
  canvasWidth: number,
  canvasHeight: number
) {
  const [jigsaw, setJigsaw] = useState<Jigsaw | null>(null);
  const [shuffleProgress, setShuffleProgress] = useState<number>(0);
  const [needsRedraw, setNeedsRedraw] = useState(false);
  const [outlineAlpha, setOutlineAlpha] = useState(1);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const outlineFadeElapsedRef = useRef(0);
  const dimensionsRef = useRef({ width: canvasWidth, height: canvasHeight });

  // Keep dimensions ref updated
  dimensionsRef.current = { width: canvasWidth, height: canvasHeight };

  const {
    imageUrl,
    tileCount,
    isComplete,
    startTime,
    setComplete,
    setStartTime,
    setDuration,
    setShowVictory,
  } = usePuzzleStore();

  const invalidate = useCallback(() => {
    setNeedsRedraw(true);
  }, []);

  // Initialize puzzle (only when imageUrl or tileCount changes)
  useEffect(() => {
    let cancelled = false;

    const initPuzzle = async () => {
      try {
        const image = await loadImage(imageUrl);
        if (cancelled) return;

        imageRef.current = image;

        const newJigsaw = new Jigsaw(tileCount, tileCount);
        const width = dimensionsRef.current.width * PUZZLE_SIZE_RATIO;
        const height = dimensionsRef.current.height * PUZZLE_SIZE_RATIO;

        newJigsaw.setSize(width, height);
        newJigsaw.setImageElement(image);

        setJigsaw(newJigsaw);
        setShuffleProgress(0);
        setOutlineAlpha(1);
        outlineFadeElapsedRef.current = 0;
        setStartTime(Date.now());

        // Start shuffle animation
        newJigsaw.shuffle(false); // allowRotation = false for now
        invalidate();
      } catch (error) {
        console.error('Failed to load puzzle image:', error);
      }
    };

    initPuzzle();

    return () => {
      cancelled = true;
    };
  }, [imageUrl, tileCount, setStartTime, invalidate]);

  // Handle resize (update jigsaw size without recreating)
  useEffect(() => {
    if (!jigsaw || !imageRef.current) return;
    if (canvasWidth === 0 || canvasHeight === 0) return;

    const width = canvasWidth * PUZZLE_SIZE_RATIO;
    const height = canvasHeight * PUZZLE_SIZE_RATIO;

    jigsaw.setSize(width, height);
    jigsaw.setImageElement(imageRef.current);
    invalidate();
  }, [jigsaw, canvasWidth, canvasHeight, invalidate]);

  // Reset outline fade when leaving completion state
  useEffect(() => {
    if (!isComplete) {
      setOutlineAlpha(1);
      outlineFadeElapsedRef.current = 0;
    }
  }, [isComplete]);

  // Advance shuffle animation
  const advanceShuffleAnimation = useCallback((deltaTime: number) => {
    if (!jigsaw || shuffleProgress >= 1) return;

    const newProgress = Math.min(1, shuffleProgress + SHUFFLE_ANIMATION_SPEED * deltaTime);
    setShuffleProgress(newProgress);

    const ratio = newProgress ** 4; // Ease-in-out
    for (const tile of jigsaw.getTiles()) {
      tile.advanceShuffling(ratio);
    }

    invalidate();
  }, [jigsaw, shuffleProgress, invalidate]);

  // Advance completion animation
  const advanceCompletionAnimation = useCallback((deltaTime: number) => {
    if (!jigsaw || !isComplete) return;

    // Fade out contour/outline as completion starts
    outlineFadeElapsedRef.current += deltaTime;
    const t = Math.min(1, outlineFadeElapsedRef.current / OUTLINE_FADE_DURATION_SECONDS);
    const eased = t * t * (3 - 2 * t); // smoothstep
    const nextOutlineAlpha = 1 - eased;
    setOutlineAlpha((prev) => (Math.abs(prev - nextOutlineAlpha) < 0.01 ? prev : nextOutlineAlpha));

    const linkedTiles = jigsaw.getTiles();
    if (linkedTiles.length === 0) return;

    // Calculate center of all tiles
    let centerX = 0;
    let centerY = 0;
    for (const tile of linkedTiles) {
      const pos = tile.getPosition();
      centerX += pos.x;
      centerY += pos.y;
    }
    centerX /= linkedTiles.length;
    centerY /= linkedTiles.length;

    // Move towards canvas center
    const targetX = canvasWidth / 2;
    const targetY = canvasHeight / 2;
    const moveX = (targetX - centerX) * deltaTime;
    const moveY = (targetY - centerY) * deltaTime;

    if (Math.abs(moveX) > 0.1 || Math.abs(moveY) > 0.1) {
      for (const tile of linkedTiles) {
        tile.move({ x: moveX, y: moveY });
      }
      invalidate();
    }
  }, [jigsaw, isComplete, canvasWidth, canvasHeight, invalidate]);

  // Check completion
  const checkCompletion = useCallback(() => {
    if (!jigsaw || isComplete) return;

    if (jigsaw.isComplete()) {
      setComplete(true);
      if (startTime) {
        const duration = (Date.now() - startTime) / 1000; // in seconds
        setDuration(duration);
      }

      // Show victory after a short delay
      setTimeout(() => {
        setShowVictory(true);
      }, 1000);
    }
  }, [jigsaw, isComplete, startTime, setComplete, setDuration, setShowVictory]);

  return {
    jigsaw,
    shuffleProgress,
    outlineAlpha,
    needsRedraw,
    setNeedsRedraw,
    invalidate,
    advanceShuffleAnimation,
    advanceCompletionAnimation,
    checkCompletion,
  };
}
