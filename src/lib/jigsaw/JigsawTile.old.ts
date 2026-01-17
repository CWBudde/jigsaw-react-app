import type { Vector2D } from '@/types';
import { Direction } from '@/types';
import type { OutlineInfo, OutlinesMap } from './types';
import { createCanvas, getContext2D } from '@lib/utils/canvas';

export class JigsawTile {
  private canvas: HTMLCanvasElement;
  private context: CanvasRenderingContext2D;
  private position: Vector2D;
  private readonly tilePosition: Vector2D;
  private currentTopDirection: Direction;
  private shufflePosition: Vector2D;
  private readonly tileSize: Vector2D;
  private readonly baseInset: number;
  private readonly outlines: OutlinesMap;
  private readonly linked: Record<Direction, boolean>;
  private imageElement: HTMLImageElement | null = null;
  private invalid: boolean = true;

  constructor(
    tileX: number,
    tileY: number,
    tileSize: Vector2D,
    baseInset: number,
    outlines: OutlinesMap
  ) {
    this.tilePosition = { x: tileX, y: tileY };
    this.tileSize = tileSize;
    this.baseInset = baseInset;
    this.outlines = outlines;
    this.currentTopDirection = Direction.North;

    // Initialize position (will be set properly during setup)
    this.position = { x: 0, y: 0 };
    this.shufflePosition = { x: 0, y: 0 };

    // Create canvas for this tile
    const canvasSize = Math.max(tileSize.x, tileSize.y) * (1 + 2 * baseInset);
    this.canvas = createCanvas(Math.ceil(canvasSize), Math.ceil(canvasSize));
    this.context = getContext2D(this.canvas);

    // Initialize linked state
    this.linked = {
      [Direction.North]: false,
      [Direction.East]: false,
      [Direction.South]: false,
      [Direction.West]: false,
    };
  }

  setImageElement(image: HTMLImageElement): void {
    this.imageElement = image;
    this.invalidate();
  }

  setPosition(pos: Vector2D): void {
    this.position = pos;
  }

  getPosition(): Vector2D {
    return { ...this.position };
  }

  getTilePosition(): Vector2D {
    return { ...this.tilePosition };
  }

  getCurrentTopDirection(): Direction {
    return this.currentTopDirection;
  }

  setShufflePosition(pos: Vector2D): void {
    this.shufflePosition = pos;
  }

  getShufflePosition(): Vector2D {
    return { ...this.shufflePosition };
  }

  isLinked(direction: Direction): boolean {
    return this.linked[direction];
  }

  setLinked(direction: Direction, value: boolean): void {
    this.linked[direction] = value;
  }

  clearLinks(): void {
    this.linked[Direction.North] = false;
    this.linked[Direction.East] = false;
    this.linked[Direction.South] = false;
    this.linked[Direction.West] = false;
  }

  move(delta: Vector2D): void {
    this.position.x += delta.x;
    this.position.y += delta.y;
  }

  rotate(): void {
    this.currentTopDirection = ((this.currentTopDirection + 1) % 4) as Direction;
    this.invalidate();
  }

  invalidate(): void {
    this.invalid = true;
  }

  advanceShuffling(ratio: number): void {
    this.position.x = this.shufflePosition.x * (1 - ratio) + this.position.x * ratio;
    this.position.y = this.shufflePosition.y * (1 - ratio) + this.position.y * ratio;
  }

  private getRotatedOutline(direction: Direction): OutlineInfo {
    const rotatedDirection = (direction - this.currentTopDirection + 4) % 4;
    return this.outlines[rotatedDirection as Direction];
  }

  private drawOutlinePath(
    ctx: CanvasRenderingContext2D,
    direction: Direction,
    oversize: number = 0
  ): void {
    const info = this.getRotatedOutline(direction);
    if (!info.outline) {
      // Straight edge
      switch (direction) {
        case Direction.North:
          ctx.lineTo(this.tileSize.x + oversize, -oversize);
          break;
        case Direction.East:
          ctx.lineTo(this.tileSize.x + oversize, this.tileSize.y + oversize);
          break;
        case Direction.South:
          ctx.lineTo(-oversize, this.tileSize.y + oversize);
          break;
        case Direction.West:
          ctx.lineTo(-oversize, -oversize);
          break;
      }
      return;
    }

    const outline = info.outline;
    const invert = info.inverted ? -1 : 1;

    // Apply bezier curve based on direction
    switch (direction) {
      case Direction.North: {
        const y = -oversize;
        ctx.bezierCurveTo(
          outline[0] * this.tileSize.x,
          y + invert * outline[1] * this.tileSize.y,
          outline[2] * this.tileSize.x,
          y + invert * outline[3] * this.tileSize.y,
          outline[4] * this.tileSize.x,
          y + invert * outline[5] * this.tileSize.y
        );
        ctx.bezierCurveTo(
          outline[4] * this.tileSize.x,
          y + invert * outline[5] * this.tileSize.y,
          outline[6] * this.tileSize.x,
          y + invert * outline[7] * this.tileSize.y,
          this.tileSize.x + oversize,
          y
        );
        break;
      }
      case Direction.East: {
        const x = this.tileSize.x + oversize;
        ctx.bezierCurveTo(
          x - invert * outline[1] * this.tileSize.x,
          outline[0] * this.tileSize.y,
          x - invert * outline[3] * this.tileSize.x,
          outline[2] * this.tileSize.y,
          x - invert * outline[5] * this.tileSize.x,
          outline[4] * this.tileSize.y
        );
        ctx.bezierCurveTo(
          x - invert * outline[5] * this.tileSize.x,
          outline[4] * this.tileSize.y,
          x - invert * outline[7] * this.tileSize.x,
          outline[6] * this.tileSize.y,
          x,
          this.tileSize.y + oversize
        );
        break;
      }
      case Direction.South: {
        const y = this.tileSize.y + oversize;
        ctx.bezierCurveTo(
          this.tileSize.x - outline[0] * this.tileSize.x,
          y - invert * outline[1] * this.tileSize.y,
          this.tileSize.x - outline[2] * this.tileSize.x,
          y - invert * outline[3] * this.tileSize.y,
          this.tileSize.x - outline[4] * this.tileSize.x,
          y - invert * outline[5] * this.tileSize.y
        );
        ctx.bezierCurveTo(
          this.tileSize.x - outline[4] * this.tileSize.x,
          y - invert * outline[5] * this.tileSize.y,
          this.tileSize.x - outline[6] * this.tileSize.x,
          y - invert * outline[7] * this.tileSize.y,
          -oversize,
          y
        );
        break;
      }
      case Direction.West: {
        const x = -oversize;
        ctx.bezierCurveTo(
          x + invert * outline[1] * this.tileSize.x,
          this.tileSize.y - outline[0] * this.tileSize.y,
          x + invert * outline[3] * this.tileSize.x,
          this.tileSize.y - outline[2] * this.tileSize.y,
          x + invert * outline[5] * this.tileSize.x,
          this.tileSize.y - outline[4] * this.tileSize.y
        );
        ctx.bezierCurveTo(
          x + invert * outline[5] * this.tileSize.x,
          this.tileSize.y - outline[4] * this.tileSize.y,
          x + invert * outline[7] * this.tileSize.x,
          this.tileSize.y - outline[6] * this.tileSize.y,
          x,
          -oversize
        );
        break;
      }
    }
  }

  renderToCanvas(): void {
    if (!this.invalid || !this.imageElement) return;
    this.invalid = false;

    const ctx = this.context;
    const centerX = this.canvas.width / 2;
    const centerY = this.canvas.height / 2;

    // Clear canvas
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    ctx.save();

    // Translate to center and rotate
    ctx.translate(centerX, centerY);
    ctx.rotate((this.currentTopDirection * Math.PI) / 2);
    ctx.translate(-this.tileSize.x / 2, -this.tileSize.y / 2);

    // Create clipping path
    ctx.beginPath();
    ctx.moveTo(-this.baseInset * this.tileSize.x, -this.baseInset * this.tileSize.y);
    this.drawOutlinePath(ctx, Direction.North, this.baseInset * this.tileSize.x);
    this.drawOutlinePath(ctx, Direction.East, this.baseInset * this.tileSize.y);
    this.drawOutlinePath(ctx, Direction.South, this.baseInset * this.tileSize.x);
    this.drawOutlinePath(ctx, Direction.West, this.baseInset * this.tileSize.y);
    ctx.closePath();
    ctx.clip();

    // Draw image portion
    const srcX = this.tilePosition.x * this.tileSize.x;
    const srcY = this.tilePosition.y * this.tileSize.y;
    const srcWidth = this.tileSize.x;
    const srcHeight = this.tileSize.y;

    ctx.drawImage(
      this.imageElement,
      srcX,
      srcY,
      srcWidth,
      srcHeight,
      -this.baseInset * this.tileSize.x,
      -this.baseInset * this.tileSize.y,
      this.tileSize.x * (1 + 2 * this.baseInset),
      this.tileSize.y * (1 + 2 * this.baseInset)
    );

    ctx.restore();
  }

  drawToContext(ctx: CanvasRenderingContext2D): void {
    if (this.invalid) {
      this.renderToCanvas();
    }

    ctx.drawImage(
      this.canvas,
      Math.round(this.position.x - this.canvas.width / 2),
      Math.round(this.position.y - this.canvas.height / 2)
    );
  }

  getCanvas(): HTMLCanvasElement {
    return this.canvas;
  }

  hitTest(point: Vector2D): boolean {
    const localX = point.x - (this.position.x - this.canvas.width / 2);
    const localY = point.y - (this.position.y - this.canvas.height / 2);

    if (
      localX < 0 ||
      localY < 0 ||
      localX >= this.canvas.width ||
      localY >= this.canvas.height
    ) {
      return false;
    }

    // Simple bounding box test for now
    // Can be enhanced with ImageData pixel testing
    return true;
  }
}
