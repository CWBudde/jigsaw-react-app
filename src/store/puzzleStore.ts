import { create } from 'zustand';

interface PuzzleStore {
  imageUrl: string;
  tileCount: number;
  isComplete: boolean;
  startTime: number | null;
  duration: number | null;
  showVictory: boolean;

  setImageUrl: (url: string) => void;
  setTileCount: (count: number) => void;
  setComplete: (complete: boolean) => void;
  setStartTime: (time: number) => void;
  setDuration: (duration: number) => void;
  setShowVictory: (show: boolean) => void;
  reset: () => void;
}

export const usePuzzleStore = create<PuzzleStore>((set) => ({
  // Use Vite's BASE_URL so assets resolve on GitHub Pages (repo subpath)
  imageUrl: `${import.meta.env.BASE_URL}images/Motiv1.png`,
  tileCount: 5,
  isComplete: false,
  startTime: null,
  duration: null,
  showVictory: false,

  setImageUrl: (url) => set({ imageUrl: url }),
  setTileCount: (count) => set({ tileCount: count }),
  setComplete: (complete) => set({ isComplete: complete }),
  setStartTime: (time) => set({ startTime: time }),
  setDuration: (duration) => set({ duration: duration }),
  setShowVictory: (show) => set({ showVictory: show }),
  reset: () => set({
    isComplete: false,
    startTime: null,
    duration: null,
    showVictory: false
  }),
}));
