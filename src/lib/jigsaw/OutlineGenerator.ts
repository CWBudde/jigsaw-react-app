import type { JigsawOutline } from '@/types';

/**
 * Generates random bezier curve outlines for jigsaw piece edges.
 * Based on the original Pascal implementation.
 *
 * Outline format:
 * [0] = direction (1 for tab, -1 for blank)
 * [1-7] = variance values for bezier curve control points
 */
export class OutlineGenerator {
  /**
   * Generate a random outline for a jigsaw piece edge
   * @returns Array of 8 numbers: [direction, var1, var2, var3, var4, var5, var6, var7]
   */
  static generateOutline(): JigsawOutline {
    const variance = 0.1;

    // Randomly choose tab (1) or blank (-1)
    const direction = Math.random() > 0.5 ? 1 : -1;

    // Generate 7 random variance values between -variance and +variance
    return [
      direction,
      variance * (2 * Math.random() - 1),
      variance * (2 * Math.random() - 1),
      variance * (2 * Math.random() - 1),
      variance * (2 * Math.random() - 1),
      variance * (2 * Math.random() - 1),
      variance * (2 * Math.random() - 1),
      variance * (2 * Math.random() - 1),
    ];
  }

  /**
   * Generate a set of outlines for a puzzle grid
   * This is called during shuffle, not during construction
   * @param countX - Number of horizontal pieces
   * @param countY - Number of vertical pieces
   * @returns Object containing horizontal and vertical outlines
   */
  static generateOutlines(
    countX: number,
    countY: number
  ): {
    horizontal: JigsawOutline[];
    vertical: JigsawOutline[];
  } {
    const horizontal: JigsawOutline[] = [];
    const vertical: JigsawOutline[] = [];

    // Generate horizontal outlines (between rows)
    for (let y = 0; y < countY - 1; y++) {
      for (let x = 0; x < countX; x++) {
        horizontal.push(this.generateOutline());
      }
    }

    // Generate vertical outlines (between columns)
    for (let y = 0; y < countY; y++) {
      for (let x = 0; x < countX - 1; x++) {
        vertical.push(this.generateOutline());
      }
    }

    return { horizontal, vertical };
  }

  /**
   * Get a specific outline from the outlines array
   */
  static getHorizontalOutline(
    outlines: JigsawOutline[],
    countX: number,
    x: number,
    y: number
  ): JigsawOutline | null {
    if (y < 0 || x < 0 || x >= countX) return null;
    const index = y * countX + x;
    return outlines[index] || null;
  }

  static getVerticalOutline(
    outlines: JigsawOutline[],
    countX: number,
    x: number,
    y: number
  ): JigsawOutline | null {
    if (x < 0 || y < 0 || x >= countX - 1) return null;
    const index = y * (countX - 1) + x;
    return outlines[index] || null;
  }
}
