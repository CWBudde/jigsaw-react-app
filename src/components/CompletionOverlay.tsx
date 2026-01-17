import { usePuzzleStore } from '@store/puzzleStore';

export function CompletionOverlay() {
  const { duration } = usePuzzleStore();

  if (duration === null) return null;

  const minutes = Math.floor(duration / 60);
  const seconds = Math.floor(duration % 60);

  return (
    <div
      style={{
        position: 'fixed',
        top: '8px',
        left: '8px',
        padding: '12px 20px',
        background: 'rgba(0, 0, 0, 0.7)',
        color: 'white',
        borderRadius: '8px',
        fontFamily: 'sans-serif',
        fontSize: '18px',
        pointerEvents: 'none',
      }}
    >
      Time: {minutes}:{seconds.toString().padStart(2, '0')}
    </div>
  );
}
