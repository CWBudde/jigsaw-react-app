export function createCanvas(width: number, height: number): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  return canvas;
}

export function getContext2D(canvas: HTMLCanvasElement): CanvasRenderingContext2D {
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Failed to get 2D context');
  }
  return ctx;
}

export function clearCanvas(canvas: HTMLCanvasElement): void {
  const ctx = getContext2D(canvas);
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}

export function downscaleImage(
  image: HTMLImageElement,
  targetSize: number
): HTMLCanvasElement {
  const size = Math.min(image.naturalWidth, image.naturalHeight);
  if (size === 0) {
    return createCanvas(targetSize, targetSize);
  }

  const ratio = targetSize / size;
  const canvas = createCanvas(targetSize, targetSize);
  const ctx = getContext2D(canvas);

  // Use step-down approach for better quality
  if (ratio < 0.5) {
    // Create intermediate canvas
    const tempCanvas = createCanvas(
      Math.ceil(image.naturalWidth * 0.5),
      Math.ceil(image.naturalHeight * 0.5)
    );
    const tempCtx = getContext2D(tempCanvas);
    tempCtx.drawImage(image, 0, 0, tempCanvas.width, tempCanvas.height);

    // Draw final
    ctx.drawImage(tempCanvas, 0, 0, targetSize, targetSize);
  } else {
    ctx.drawImage(image, 0, 0, Math.ceil(image.naturalWidth * ratio), Math.ceil(image.naturalHeight * ratio));
  }

  return canvas;
}

export function resizeCanvas(canvas: HTMLCanvasElement, width: number, height: number): void {
  if (canvas.width !== width || canvas.height !== height) {
    canvas.width = width;
    canvas.height = height;
  }
}
