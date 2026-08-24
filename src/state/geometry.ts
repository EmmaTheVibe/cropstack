import type { CropBox } from '../lib/types';

export const MIN_BOX_SIZE = 20; // image-space px

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function clampBoxToImage(box: CropBox, imageW: number, imageH: number): CropBox {
  const width = Math.min(box.width, imageW);
  const height = Math.min(box.height, imageH);
  const x = clamp(box.x, 0, Math.max(0, imageW - width));
  const y = clamp(box.y, 0, Math.max(0, imageH - height));
  return { ...box, x, y, width, height };
}

export function reflowBoxToRatio(
  box: CropBox,
  ratio: number,
  imageW: number,
  imageH: number,
): CropBox {
  const cx = box.x + box.width / 2;
  const cy = box.y + box.height / 2;
  let width = box.width;
  let height = width / ratio;
  if (height > imageH) {
    height = imageH;
    width = height * ratio;
  }
  if (width > imageW) {
    width = imageW;
    height = width / ratio;
  }
  const x = cx - width / 2;
  const y = cy - height / 2;
  return clampBoxToImage({ ...box, x, y, width, height }, imageW, imageH);
}

/** Maps a box through a 90° clockwise rotation of its image (originalImageHeight = pre-rotation image height). */
export function rotateBox90(box: CropBox, originalImageHeight: number): CropBox {
  return {
    ...box,
    x: originalImageHeight - box.y - box.height,
    y: box.x,
    width: box.height,
    height: box.width,
  };
}
