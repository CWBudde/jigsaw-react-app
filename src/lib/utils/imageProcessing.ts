export function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

export function getImageData(
  canvas: HTMLCanvasElement,
  x: number,
  y: number,
  width: number,
  height: number
): ImageData | null {
  try {
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    return ctx.getImageData(x, y, width, height);
  } catch (error) {
    console.error('Failed to get image data:', error);
    return null;
  }
}

export function isPointInImageData(
  imageData: ImageData,
  localX: number,
  localY: number
): boolean {
  if (
    localX < 0 ||
    localY < 0 ||
    localX >= imageData.width ||
    localY >= imageData.height
  ) {
    return false;
  }

  const x = Math.floor(localX);
  const y = Math.floor(localY);
  const index = (y * imageData.width + x) * 4;
  const alpha = imageData.data[index + 3];

  return alpha > 128; // Consider pixel opaque if alpha > 50%
}
