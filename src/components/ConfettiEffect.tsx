import Confetti from 'react-confetti';
import { usePuzzleStore } from '@store/puzzleStore';
import { useEffect, useState } from 'react';

export function ConfettiEffect() {
  const { isComplete } = usePuzzleStore();
  const [dimensions, setDimensions] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (isComplete) {
      setShowConfetti(true);
    } else {
      setShowConfetti(false);
    }
  }, [isComplete]);

  if (!showConfetti) return null;

  return (
    <Confetti
      width={dimensions.width}
      height={dimensions.height}
      recycle={true}
      numberOfPieces={200}
    />
  );
}
