import type { Direction, JigsawOutline, Vector2D } from '@/types';

export interface TileConfig {
  tileX: number;
  tileY: number;
  tileSize: Vector2D;
  baseInset: number;
}

export interface OutlineInfo {
  outline: JigsawOutline | null;
  inverted: boolean;
}

export type OutlinesMap = Record<Direction, OutlineInfo>;
