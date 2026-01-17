import type { Vector2D } from '@/types';
import { Direction } from '@/types';
import { JigsawTile } from './JigsawTile';
import { OutlineGenerator } from './OutlineGenerator';
import { BASE_INSET } from '@lib/constants';

export class Jigsaw {
  private readonly countX: number;
  private readonly countY: number;
  private tiles: JigsawTile[] = [];
  private tileSize: Vector2D = { x: 0, y: 0 };
  private width: number = 0;
  private height: number = 0;
  private readonly baseInset: number = BASE_INSET;
  private linkDistance: number = 0;
  private horizontalOutlines: ReturnType<typeof OutlineGenerator.generateOutlines>['horizontal'] = [];
  private verticalOutlines: ReturnType<typeof OutlineGenerator.generateOutlines>['vertical'] = [];
  private imageElement: HTMLImageElement | null = null;
  private canvasElement: HTMLCanvasElement | null = null;

  constructor(countX: number, countY: number) {
    this.countX = countX;
    this.countY = countY;

    // Outlines will be generated during shuffle
    // Initialize empty arrays with correct lengths
    this.horizontalOutlines = new Array((countY - 1) * countX);
    this.verticalOutlines = new Array(countY * (countX - 1));
  }

  setSize(width: number, height: number): void {
    this.width = width;
    this.height = height;

    // Jigsaw is always square, based on the smaller dimension
    const dimension = Math.min(width, height);

    // Calculate tile size based on square dimension
    this.tileSize = {
      x: dimension / this.countX,
      y: dimension / this.countY,
    };

    // Update link distance based on tile size
    this.linkDistance = 0.15 * (this.tileSize.x + this.tileSize.y);

    // Create or update tiles
    if (this.tiles.length === 0) {
      this.createTiles();
    }
  }

  setImageElement(image: HTMLImageElement): void {
    this.imageElement = image;

    // Create canvas and draw scaled image
    const dimension = Math.min(this.width, this.height);
    if (!this.canvasElement) {
      this.canvasElement = document.createElement('canvas');
    }

    this.canvasElement.width = Math.round(dimension);
    this.canvasElement.height = Math.round(dimension);

    const ctx = this.canvasElement.getContext('2d');
    if (ctx && image.naturalWidth > 0) {
      const size = Math.min(image.naturalWidth, image.naturalHeight);

      ctx.drawImage(
        image,
        0, 0, size, size,
        0, 0, Math.round(dimension), Math.round(dimension)
      );
    }

    // Invalidate all tiles
    for (const tile of this.tiles) {
      tile.invalidate();
    }
  }

  private createTiles(): void {
    this.tiles = [];

    for (let y = 0; y < this.countY; y++) {
      for (let x = 0; x < this.countX; x++) {
        const tile = new JigsawTile(this, x, y);

        // Set initial position (grid layout)
        const pos = this.getTileCorrectPosition(x, y);
        tile.setPosition(pos);

        this.tiles.push(tile);
      }
    }
  }

  private getTileCorrectPosition(x: number, y: number): Vector2D {
    // Center the square jigsaw within the canvas
    return {
      x: (x + 0.5) * this.tileSize.x + 0.5 * (this.width - this.countX * this.tileSize.x),
      y: (y + 0.5) * this.tileSize.y + 0.5 * (this.height - this.countY * this.tileSize.y),
    };
  }

  getTile(x: number, y: number): JigsawTile | null {
    if (x < 0 || y < 0 || x >= this.countX || y >= this.countY) {
      return null;
    }
    // Search through tiles to find the one with matching tile position
    // (tiles array order may be shuffled, so we can't use index formula)
    for (const tile of this.tiles) {
      const tilePos = tile.getTilePosition();
      if (tilePos.x === x && tilePos.y === y) {
        return tile;
      }
    }
    return null;
  }

  getTileAt(position: Vector2D): JigsawTile | null {
    // Search in reverse order (top tiles first)
    for (let i = this.tiles.length - 1; i >= 0; i--) {
      const tile = this.tiles[i];
      if (tile.hitTest(position)) {
        return tile;
      }
    }
    return null;
  }

  bringToFront(tile: JigsawTile): void {
    const index = this.tiles.indexOf(tile);
    if (index > -1 && index < this.tiles.length - 1) {
      this.tiles.splice(index, 1);
      this.tiles.push(tile);
    }
  }

  getLinkedTileList(tile: JigsawTile | null): JigsawTile[] {
    if (!tile) return [];

    const result: JigsawTile[] = [];
    this.linkIterator(tile, result);
    return result;
  }

  private linkIterator(tile: JigsawTile | null, linkedTiles: JigsawTile[]): void {
    // check if tile is assigned at all
    if (!tile) return;

    // check if tile is already on the list
    if (linkedTiles.includes(tile)) return;

    // add tile to linked tiles
    linkedTiles.push(tile);

    // Get neighboring linked tiles
    const tilePos = tile.getTilePosition();

    // North
    if (tile.isLinked(Direction.North)) {
      const neighbor = this.getTile(tilePos.x, tilePos.y - 1);
      this.linkIterator(neighbor, linkedTiles);
    }

    // East
    if (tile.isLinked(Direction.East)) {
      const neighbor = this.getTile(tilePos.x + 1, tilePos.y);
      this.linkIterator(neighbor, linkedTiles);
    }

    // South
    if (tile.isLinked(Direction.South)) {
      const neighbor = this.getTile(tilePos.x, tilePos.y + 1);
      this.linkIterator(neighbor, linkedTiles);
    }

    // West
    if (tile.isLinked(Direction.West)) {
      const neighbor = this.getTile(tilePos.x - 1, tilePos.y);
      this.linkIterator(neighbor, linkedTiles);
    }
  }


  checkLink(tile: JigsawTile): void {
    // Keep trying to link until no more links are made
    let isLinked: boolean;
    do {
      isLinked = false;
      for (const currentTile of this.tiles) {
        if (currentTile !== tile) {
          if (tile.linkTile(currentTile)) {
            isLinked = true;
          }
        }
      }
    } while (isLinked);
  }


  isComplete(): boolean {
    // Check if all tiles are linked together
    // (matching original Pascal implementation)
    if (this.tiles.length === 0) return false;
    const linkedTiles = this.getLinkedTileList(this.tiles[0]);
    return linkedTiles.length === this.tiles.length;
  }

  shuffle(allowRotation: boolean): void {
    // Generate outlines (as per original implementation)
    const outlines = OutlineGenerator.generateOutlines(this.countX, this.countY);
    this.horizontalOutlines = outlines.horizontal;
    this.verticalOutlines = outlines.vertical;

    // Swap tiles randomly a few times
    for (let i = 0; i < 10; i++) {
      const idx1 = Math.floor(Math.random() * this.tiles.length);
      const idx2 = Math.floor(Math.random() * this.tiles.length);
      [this.tiles[idx1], this.tiles[idx2]] = [this.tiles[idx2], this.tiles[idx1]];
    }

    // Shuffle each tile
    for (const tile of this.tiles) {
      this.shuffleTile(tile, allowRotation);
    }
  }

  private shuffleTile(tile: JigsawTile, allowRotation: boolean): void {
    // Set rotation
    if (allowRotation) {
      const rotations = Math.floor(Math.random() * 4);
      for (let i = 0; i < rotations; i++) {
        tile.rotate();
      }
    } else {
      // Reset to north
      while (tile.getCurrentTopDirection() !== Direction.North) {
        tile.rotate();
      }
    }

    // Clear links
    tile.clearLinks();

    // Calculate correct position
    const tilePos = tile.getTilePosition();
    const correctPos = {
      x: (0.5 + tilePos.x) * this.tileSize.x + 0.5 * (this.width - this.countX * this.tileSize.x),
      y: (0.5 + tilePos.y) * this.tileSize.y + 0.5 * (this.height - this.countY * this.tileSize.y),
    };
    tile.setPosition(correctPos);

    // Calculate shuffle position
    let shufflePos: Vector2D;
    if (this.width > this.height) {
      shufflePos = {
        x: 0.5 * this.tileSize.x + 0.1 * this.height + this.tileSize.y + Math.random() * (this.width - 0.1 * this.height - this.tileSize.x),
        y: 0.5 * this.tileSize.y + Math.random() * (this.height - this.tileSize.y),
      };
    } else {
      shufflePos = {
        x: 0.5 * this.tileSize.x + Math.random() * (this.width - this.tileSize.x),
        y: 0.5 * this.tileSize.y + 0.1 * this.width + this.tileSize.x + Math.random() * (this.height - 0.1 * this.width - this.tileSize.y),
      };
    }
    tile.setShufflePosition(shufflePos);
  }

  drawToContext(ctx: CanvasRenderingContext2D): void {
    for (const tile of this.tiles) {
      tile.drawToContext(ctx);
    }
  }

  getTiles(): JigsawTile[] {
    return this.tiles;
  }

  getTileSize(): Vector2D {
    return { ...this.tileSize };
  }

  getCountX(): number {
    return this.countX;
  }

  getCountY(): number {
    return this.countY;
  }

  getBaseInset(): number {
    return this.baseInset;
  }

  getImageElement(): HTMLImageElement | null {
    return this.imageElement;
  }

  getCanvasElement(): HTMLCanvasElement | null {
    return this.canvasElement;
  }

  getHorizontalOutline(x: number, y: number): number[] | null {
    if (y < 0 || x < 0 || x >= this.countX || y >= this.countY - 1) return null;
    const index = y * this.countX + x;
    return this.horizontalOutlines[index] || null;
  }

  getVerticalOutline(x: number, y: number): number[] | null {
    if (x < 0 || y < 0 || x >= this.countX - 1 || y >= this.countY) return null;
    const index = y * (this.countX - 1) + x;
    return this.verticalOutlines[index] || null;
  }

  getLinkDistance(): number {
    return this.linkDistance;
  }
}
