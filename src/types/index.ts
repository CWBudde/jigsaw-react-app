export interface Vector2D {
  x: number;
  y: number;
}

export const Direction = {
  North: 0,
  East: 1,
  South: 2,
  West: 3,
} as const;

export type Direction = (typeof Direction)[keyof typeof Direction];

export type JigsawOutline = [number, number, number, number, number, number, number, number];

export interface TileData {
  position: Vector2D;
  tilePosition: Vector2D;
  currentTopDirection: Direction;
  shufflePosition: Vector2D;
  linked: Record<Direction, boolean>;
}

export interface JigsawConfig {
  countX: number;
  countY: number;
  width: number;
  height: number;
  allowRotation: boolean;
}

export interface PuzzleState {
  imageUrl: string;
  tileCount: number;
  isComplete: boolean;
  isShuffling: boolean;
  shuffleProgress: number;
  startTime: number | null;
  duration: number | null;
}

export interface PointerInfo {
  id: number;
  lastPos: Vector2D;
}
