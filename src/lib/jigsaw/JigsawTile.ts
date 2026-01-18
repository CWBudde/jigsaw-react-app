import type { Vector2D } from '@/types';
import { Direction } from '@/types';
import { createCanvas, getContext2D } from '@lib/utils/canvas';
import type { Jigsaw } from './Jigsaw';

export class JigsawTile {
  private canvas: HTMLCanvasElement;
  private context: CanvasRenderingContext2D;
  private position: Vector2D;
  private readonly tilePosition: Vector2D;
  private currentTopDirection: Direction;
  private shufflePosition: Vector2D;
  private readonly jigsaw: Jigsaw;
  private readonly linked: Record<Direction, boolean>;
  private invalid: boolean = true;

  constructor(jigsaw: Jigsaw, x: number, y: number) {
    this.jigsaw = jigsaw;
    this.tilePosition = { x, y };
    this.currentTopDirection = Direction.North;
    this.position = { x: 0, y: 0 };
    this.shufflePosition = { x: 0, y: 0 };

    // Create canvas for this tile
    this.canvas = createCanvas(100, 100); // Will be resized during render
    this.context = getContext2D(this.canvas);

    // Initialize linked state
    this.linked = {
      [Direction.North]: false,
      [Direction.East]: false,
      [Direction.South]: false,
      [Direction.West]: false,
    };
  }

  setPosition(pos: Vector2D): void {
    if (this.position.x === pos.x && this.position.y === pos.y) return;
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
    if (value) {
      this.invalidate();
    }
  }

  clearLinks(): void {
    this.linked[Direction.North] = false;
    this.linked[Direction.East] = false;
    this.linked[Direction.South] = false;
    this.linked[Direction.West] = false;
    this.invalidate();
  }

  move(delta: Vector2D): void {
    this.position.x += delta.x;
    this.position.y += delta.y;
    this.shufflePosition = { ...this.position };
  }

  rotate(): void {
    // Rotate clockwise: North -> East -> South -> West -> North
    const rotationMap = {
      [Direction.North]: Direction.East,
      [Direction.East]: Direction.South,
      [Direction.South]: Direction.West,
      [Direction.West]: Direction.North,
    };
    this.currentTopDirection = rotationMap[this.currentTopDirection];
  }

  invalidate(): void {
    this.invalid = true;
  }

  advanceShuffling(ratio: number): void {
    this.position.x += ratio * (this.shufflePosition.x - this.position.x);
    this.position.y += ratio * (this.shufflePosition.y - this.position.y);
  }

  private tileIsNext(other: JigsawTile, direction: Direction): boolean {
    const tx = this.tilePosition.x;
    const ty = this.tilePosition.y;
    const ox = other.tilePosition.x;
    const oy = other.tilePosition.y;

    switch (direction) {
      case Direction.North:
        return ox === tx && oy === ty - 1;
      case Direction.East:
        return ox === tx + 1 && oy === ty;
      case Direction.South:
        return ox === tx && oy === ty + 1;
      case Direction.West:
        return ox === tx - 1 && oy === ty;
    }
  }

  linkTile(other: JigsawTile): boolean {
    // Check if both tiles have the same rotation
    if (this.currentTopDirection !== other.currentTopDirection) {
      return false;
    }

    const tileSize = this.jigsaw.getTileSize();
    const linkDistance = this.jigsaw.getLinkDistance();

    // Calculate distance between tiles
    const distance = {
      x: other.position.x - this.position.x,
      y: other.position.y - this.position.y,
    };

    let dir: Direction = this.currentTopDirection;
    let offset: Vector2D | null = null;
    let found = false;

    // Check for tile to the left (West)
    if (Math.abs(distance.x + tileSize.x) < linkDistance && Math.abs(distance.y) < linkDistance) {
      dir = ((3 - this.currentTopDirection) % 4) as Direction;
      if (!this.linked[dir] && this.tileIsNext(other, dir)) {
        offset = {
          x: this.position.x - tileSize.x - other.position.x,
          y: this.position.y - other.position.y,
        };
        found = true;
      }
    }
    // Check for tile above (North)
    else if (Math.abs(distance.x) < linkDistance && Math.abs(distance.y + tileSize.y) < linkDistance) {
      dir = ((3 - this.currentTopDirection + 1) % 4) as Direction;
      if (!this.linked[dir] && this.tileIsNext(other, dir)) {
        offset = {
          x: this.position.x - other.position.x,
          y: this.position.y - tileSize.y - other.position.y,
        };
        found = true;
      }
    }
    // Check for tile to the right (East)
    else if (Math.abs(distance.x - tileSize.x) < linkDistance && Math.abs(distance.y) < linkDistance) {
      dir = ((3 - this.currentTopDirection + 2) % 4) as Direction;
      if (!this.linked[dir] && this.tileIsNext(other, dir)) {
        offset = {
          x: this.position.x + tileSize.x - other.position.x,
          y: this.position.y - other.position.y,
        };
        found = true;
      }
    }
    // Check for tile below (South)
    else if (Math.abs(distance.x) < linkDistance && Math.abs(distance.y - tileSize.y) < linkDistance) {
      dir = ((3 - this.currentTopDirection + 3) % 4) as Direction;
      if (!this.linked[dir] && this.tileIsNext(other, dir)) {
        offset = {
          x: this.position.x - other.position.x,
          y: this.position.y + tileSize.y - other.position.y,
        };
        found = true;
      }
    }

    if (found && offset) {
      // Get all tiles linked to the other tile
      const linkedOtherTiles = this.jigsaw.getLinkedTileList(other);

      // Set links
      this.linked[dir] = true;
      const oppositeDir = ((dir + 2) % 4) as Direction;
      other.linked[oppositeDir] = true;

      // Move all linked tiles to snap into place
      for (const tile of linkedOtherTiles) {
        tile.move(offset);
        this.jigsaw.bringToFront(tile);
      }

      return true;
    }

    return false;
  }

  private getOutline(direction: Direction): number[] | null {
    const tx = this.tilePosition.x;
    const ty = this.tilePosition.y;
    const countX = this.jigsaw.getCountX();
    const countY = this.jigsaw.getCountY();

    switch (direction) {
      case Direction.North:
        if (ty === 0) return null;
        return this.jigsaw.getHorizontalOutline(tx, ty - 1);
      case Direction.East:
        if (tx >= countX - 1) return null;
        return this.jigsaw.getVerticalOutline(tx, ty);
      case Direction.South:
        if (ty >= countY - 1) return null;
        return this.jigsaw.getHorizontalOutline(tx, ty);
      case Direction.West:
        if (tx === 0) return null;
        return this.jigsaw.getVerticalOutline(tx - 1, ty);
    }
  }

  private drawOutlinePath(ctx: CanvasRenderingContext2D, direction: Direction, oversize: number): void {
    const outline = this.getOutline(direction);
    const baseInset = this.jigsaw.getBaseInset();

    if (!outline) {
      // Straight edge
      switch (direction) {
        case Direction.North:
          ctx.lineTo(0.5 + oversize, -0.5 - oversize);
          break;
        case Direction.East:
          ctx.lineTo(0.5 + oversize, 0.5 + oversize);
          break;
        case Direction.South:
          ctx.lineTo(-0.5 - oversize, 0.5 + oversize);
          break;
        case Direction.West:
          ctx.lineTo(-0.5 - oversize, -0.5 - oversize);
          break;
      }
      return;
    }

    const calcInset = outline[0] * (0.9 * baseInset);

    // Draw bezier curves based on the original Pascal code
    switch (direction) {
      case Direction.North:
        ctx.bezierCurveTo(
          0.25 + outline[1], -0.5 + outline[2],
          -0.4 + outline[3], -0.5 + (calcInset - outline[7]),
          0, -0.5 + calcInset
        );
        ctx.bezierCurveTo(
          0.4 + outline[4], -0.5 + (calcInset + outline[7]),
          -0.25 + outline[5], -0.5 + outline[6],
          0.5 + oversize, -0.5 - oversize
        );
        break;

      case Direction.East:
        ctx.bezierCurveTo(
          0.5 + outline[1], 0.25 + outline[2],
          0.5 + (calcInset - outline[7]), -0.4 + outline[3],
          0.5 + calcInset, 0
        );
        ctx.bezierCurveTo(
          0.5 + (calcInset + outline[7]), 0.4 + outline[4],
          0.5 + outline[5], -0.25 + outline[6],
          0.5 + oversize, 0.5 + oversize
        );
        break;

      case Direction.South:
        ctx.bezierCurveTo(
          -0.25 + outline[5], 0.5 + outline[6],
          0.4 + outline[4], 0.5 + (calcInset + outline[7]),
          0, 0.5 + calcInset
        );
        ctx.bezierCurveTo(
          -0.4 + outline[3], 0.5 + (calcInset - outline[7]),
          0.25 + outline[1], 0.5 + outline[2],
          -0.5 - oversize, 0.5 + oversize
        );
        break;

      case Direction.West:
        ctx.bezierCurveTo(
          -0.5 + outline[5], -0.25 + outline[6],
          -0.5 + (calcInset + outline[7]), 0.4 + outline[4],
          -0.5 + calcInset, 0
        );
        ctx.bezierCurveTo(
          -0.5 + (calcInset - outline[7]), -0.4 + outline[3],
          -0.5 + outline[1], 0.25 + outline[2],
          -0.5 - oversize, -0.5 - oversize
        );
        break;
    }
  }

  private calculateOutlineUse(): Record<Direction, boolean> {
    const tx = this.tilePosition.x;
    const ty = this.tilePosition.y;
    const countX = this.jigsaw.getCountX();
    const countY = this.jigsaw.getCountY();

    return {
      [Direction.North]: ty > 0 && !this.linked[Direction.North],
      [Direction.East]: tx < countX - 1 && !this.linked[Direction.East],
      [Direction.South]: ty < countY - 1 && !this.linked[Direction.South],
      [Direction.West]: tx > 0 && !this.linked[Direction.West],
    };
  }

  renderToCanvas(): void {
    const tileSize = this.jigsaw.getTileSize();
    const baseInset = this.jigsaw.getBaseInset();
    const imageElement = this.jigsaw.getImageElement();

    if (!imageElement) return;

    this.canvas.width = Math.ceil((1 + 2 * baseInset) * tileSize.x);
    this.canvas.height = Math.ceil((1 + 2 * baseInset) * tileSize.y);

    const ctx = this.context;
    const useOutline = this.calculateOutlineUse();

    // Set up coordinate system
    ctx.save();
    ctx.translate(
      (0.5 + baseInset) * tileSize.x,
      (0.5 + baseInset) * tileSize.y
    );
    ctx.scale(tileSize.x, tileSize.y);

    const oversize = 1 / Math.max(tileSize.x, tileSize.y);

    // Create clipping path
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(-0.5 - oversize, -0.5 - oversize);

    if (useOutline[Direction.North]) {
      this.drawOutlinePath(ctx, Direction.North, oversize);
    } else {
      ctx.lineTo(0.5 + oversize, -0.5 - oversize);
    }

    if (useOutline[Direction.East]) {
      this.drawOutlinePath(ctx, Direction.East, oversize);
    } else {
      ctx.lineTo(0.5 + oversize, 0.5 + oversize);
    }

    if (useOutline[Direction.South]) {
      this.drawOutlinePath(ctx, Direction.South, oversize);
    } else {
      ctx.lineTo(-0.5 - oversize, 0.5 + oversize);
    }

    if (useOutline[Direction.West]) {
      this.drawOutlinePath(ctx, Direction.West, oversize);
    } else {
      ctx.lineTo(-0.5 - oversize, -0.5 - oversize);
    }

    ctx.clip();

    // Draw image portion
    const canvasElement = this.jigsaw.getCanvasElement();
    if (canvasElement) {
      const tx = this.tilePosition.x;
      const ty = this.tilePosition.y;
      const countX = this.jigsaw.getCountX();
      const countY = this.jigsaw.getCountY();

      const xOffset = tx > 0 ? -baseInset : 0;
      const yOffset = ty > 0 ? -baseInset : 0;
      const wix = 1 + baseInset + (tx < countX - 1 ? baseInset : 0);
      const wiy = 1 + baseInset + (ty < countY - 1 ? baseInset : 0);

      ctx.drawImage(
        canvasElement,
        (tx + xOffset) * tileSize.x,
        (ty + yOffset) * tileSize.y,
        wix * tileSize.x,
        wiy * tileSize.y,
        -0.5 + xOffset,
        -0.5 + yOffset,
        wix,
        wiy
      );
    }

    ctx.restore();

    ctx.restore();

    this.invalid = false;
  }

  private drawContourToContext(ctx: CanvasRenderingContext2D, outlineAlpha: number): void {
    if (outlineAlpha <= 0) return;

    const tileSize = this.jigsaw.getTileSize();
    const baseInset = this.jigsaw.getBaseInset();
    const useOutline = this.calculateOutlineUse();
    const oversize = 1 / Math.max(tileSize.x, tileSize.y);

    ctx.save();
    ctx.globalAlpha *= outlineAlpha;

    // Align to this tile's offscreen canvas pixel space
    ctx.translate(this.position.x - this.canvas.width / 2, this.position.y - this.canvas.height / 2);

    // Match the same normalized coordinate system used in renderToCanvas()
    ctx.translate(
      (0.5 + baseInset) * tileSize.x,
      (0.5 + baseInset) * tileSize.y
    );
    ctx.scale(tileSize.x, tileSize.y);

    ctx.lineWidth = 1.7 * oversize;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#888';

    // Draw each edge separately, only for non-linked edges
    if (useOutline[Direction.North]) {
      ctx.beginPath();
      ctx.moveTo(-0.5 - oversize, -0.5 - oversize);
      this.drawOutlinePath(ctx, Direction.North, oversize);
      ctx.stroke();
    }

    if (useOutline[Direction.East]) {
      ctx.beginPath();
      ctx.moveTo(0.5 + oversize, -0.5 - oversize);
      this.drawOutlinePath(ctx, Direction.East, oversize);
      ctx.stroke();
    }

    if (useOutline[Direction.South]) {
      ctx.beginPath();
      ctx.moveTo(0.5 + oversize, 0.5 + oversize);
      this.drawOutlinePath(ctx, Direction.South, oversize);
      ctx.stroke();
    }

    if (useOutline[Direction.West]) {
      ctx.beginPath();
      ctx.moveTo(-0.5 - oversize, 0.5 + oversize);
      this.drawOutlinePath(ctx, Direction.West, oversize);
      ctx.stroke();
    }
    ctx.restore();
  }

  drawToContext(ctx: CanvasRenderingContext2D, outlineAlpha: number = 1): void {
    if (this.invalid) {
      this.renderToCanvas();
    }

    ctx.save();
    ctx.translate(this.position.x, this.position.y);
    ctx.drawImage(
      this.canvas,
      -this.canvas.width / 2,
      -this.canvas.height / 2
    );
    ctx.restore();

    this.drawContourToContext(ctx, outlineAlpha);
  }

  getCanvas(): HTMLCanvasElement {
    return this.canvas;
  }

  hitTest(point: Vector2D): boolean {
    // Calculate local coordinates relative to top-left of canvas
    const localX = point.x - (this.position.x - this.canvas.width / 2);
    const localY = point.y - (this.position.y - this.canvas.height / 2);

    // First check bounding box
    if (
      localX < 0 ||
      localY < 0 ||
      localX >= this.canvas.width ||
      localY >= this.canvas.height
    ) {
      return false;
    }

    // Pixel-perfect hit detection using alpha channel
    try {
      const imageData = this.context.getImageData(
        Math.floor(localX),
        Math.floor(localY),
        1,
        1
      );
      // Check if alpha channel is > 0 (pixel is visible)
      return imageData.data[3] > 0;
    } catch (e) {
      // If getImageData fails, fall back to bounding box test
      return true;
    }
  }
}
