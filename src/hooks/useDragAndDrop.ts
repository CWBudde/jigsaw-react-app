import { useEffect, useRef } from 'react';
import type { Vector2D, PointerInfo } from '@/types';
import type { Jigsaw } from '@lib/jigsaw/Jigsaw';
import type { JigsawTile } from '@lib/jigsaw/JigsawTile';

interface DragAndDropCallbacks {
  onTileSelected: (tile: JigsawTile) => void;
  onTileMoved: (tiles: JigsawTile[]) => void;
  onTileReleased: (tiles: JigsawTile[]) => void;
  onInvalidate: () => void;
}

export function useDragAndDrop(
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
  jigsaw: Jigsaw | null,
  isComplete: boolean,
  shuffleProgress: number,
  callbacks: DragAndDropCallbacks
) {
  const pointersRef = useRef<PointerInfo[]>([]);
  const currentTileRef = useRef<JigsawTile | null>(null);
  const linkedTilesRef = useRef<JigsawTile[]>([]);
  const dragDistanceRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const getPointerPosition = (e: MouseEvent | Touch): Vector2D => {
      const rect = canvas.getBoundingClientRect();
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    };

    const handlePointerDown = (position: Vector2D, pointerId: number) => {
      // Find existing pointer or add new one
      let pointerIndex = pointersRef.current.findIndex(p => p.id === pointerId);

      if (pointerIndex < 0) {
        pointersRef.current.push({ id: pointerId, lastPos: position });
        pointerIndex = pointersRef.current.length - 1;
      } else {
        pointersRef.current[pointerIndex].lastPos = position;
      }

      // Reset drag distance
      dragDistanceRef.current = 0;

      if (isComplete || shuffleProgress < 0.5) return;

      // Only handle first pointer for tile selection
      if (pointerIndex === 0 && jigsaw) {
        currentTileRef.current = jigsaw.getTileAt(position);
        if (currentTileRef.current) {
          linkedTilesRef.current = jigsaw.getLinkedTileList(currentTileRef.current);

          // Bring tiles to front
          for (const tile of linkedTilesRef.current) {
            jigsaw.bringToFront(tile);
          }

          callbacks.onTileSelected(currentTileRef.current);
          callbacks.onInvalidate();
        }
      }
    };

    const handlePointerMove = (position: Vector2D, pointerId: number) => {
      const pointerIndex = pointersRef.current.findIndex(p => p.id === pointerId);
      if (pointerIndex < 0) return;

      const lastPos = pointersRef.current[pointerIndex].lastPos;

      if (!isComplete && currentTileRef.current && pointerIndex === 0) {
        const delta = {
          x: position.x - lastPos.x,
          y: position.y - lastPos.y,
        };

        // Move all linked tiles
        for (const tile of linkedTilesRef.current) {
          tile.move(delta);
        }

        dragDistanceRef.current += Math.sqrt(delta.x ** 2 + delta.y ** 2);
        callbacks.onTileMoved(linkedTilesRef.current);
        callbacks.onInvalidate();
      }

      pointersRef.current[pointerIndex].lastPos = position;
    };

    const handlePointerUp = (_position: Vector2D, pointerId: number) => {
      const pointerIndex = pointersRef.current.findIndex(p => p.id === pointerId);

      if (currentTileRef.current && pointerIndex === 0 && shuffleProgress >= 1 && jigsaw) {
        // Check for tap (rotation)
        // For now, rotation is disabled - can be enabled with an option
        // if (dragDistanceRef.current < TAP_DISTANCE_THRESHOLD) {
        //   currentTileRef.current.rotate();
        // }

        // Check links for all linked tiles
        for (const tile of linkedTilesRef.current) {
          jigsaw.checkLink(tile);
        }

        callbacks.onTileReleased(linkedTilesRef.current);
        callbacks.onInvalidate();

        // Check if puzzle is complete
        if (jigsaw.isComplete()) {
          // Will be handled by parent component
        }
      }

      if (pointerIndex >= 0) {
        pointersRef.current.splice(pointerIndex, 1);
      }
    };

    // Mouse events
    const onMouseDown = (e: MouseEvent) => {
      e.preventDefault();
      handlePointerDown(getPointerPosition(e), 0);
    };

    const onMouseMove = (e: MouseEvent) => {
      if (pointersRef.current.length === 0) return;
      handlePointerMove(getPointerPosition(e), 0);
    };

    const onMouseUp = (e: MouseEvent) => {
      handlePointerUp(getPointerPosition(e), 0);
    };

    // Touch events
    const onTouchStart = (e: TouchEvent) => {
      e.preventDefault();
      for (let i = 0; i < e.changedTouches.length; i++) {
        const touch = e.changedTouches[i];
        handlePointerDown(getPointerPosition(touch), touch.identifier);
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      for (let i = 0; i < e.changedTouches.length; i++) {
        const touch = e.changedTouches[i];
        handlePointerMove(getPointerPosition(touch), touch.identifier);
      }
    };

    const onTouchEnd = (e: TouchEvent) => {
      e.preventDefault();
      for (let i = 0; i < e.changedTouches.length; i++) {
        const touch = e.changedTouches[i];
        handlePointerUp(getPointerPosition(touch), touch.identifier);
      }
    };

    canvas.addEventListener('mousedown', onMouseDown);
    canvas.addEventListener('mousemove', onMouseMove);
    canvas.addEventListener('mouseup', onMouseUp);
    canvas.addEventListener('touchstart', onTouchStart, { passive: false });
    canvas.addEventListener('touchmove', onTouchMove, { passive: false });
    canvas.addEventListener('touchend', onTouchEnd, { passive: false });

    return () => {
      canvas.removeEventListener('mousedown', onMouseDown);
      canvas.removeEventListener('mousemove', onMouseMove);
      canvas.removeEventListener('mouseup', onMouseUp);
      canvas.removeEventListener('touchstart', onTouchStart);
      canvas.removeEventListener('touchmove', onTouchMove);
      canvas.removeEventListener('touchend', onTouchEnd);
    };
  }, [canvasRef, jigsaw, isComplete, shuffleProgress, callbacks]);
}
