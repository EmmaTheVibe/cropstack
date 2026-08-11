import type { CropBox, TargetSize } from "./types";

const JPEG_QUALITY = 0.92;
const ROW_TOLERANCE_RATIO = 0.5;

export function cropAndResize(
  sourceImage: HTMLImageElement,
  box: CropBox,
  targetSize: TargetSize,
  quality = JPEG_QUALITY,
): Promise<Blob> {
  const canvas = document.createElement("canvas");
  canvas.width = targetSize.width;
  canvas.height = targetSize.height;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    return Promise.reject(new Error("Could not get 2D canvas context"));
  }
  ctx.drawImage(
    sourceImage,
    box.x,
    box.y,
    box.width,
    box.height,
    0,
    0,
    targetSize.width,
    targetSize.height,
  );
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) =>
        blob ? resolve(blob) : reject(new Error("canvas.toBlob failed")),
      "image/jpeg",
      quality,
    );
  });
}

export function sortReadingOrder(boxes: CropBox[]): CropBox[] {
  const sorted = [...boxes].sort((a, b) => a.y - b.y);
  const rows: CropBox[][] = [];

  for (const box of sorted) {
    const row = rows.find((r) => {
      const rowY = r[0].y;
      const tolerance = Math.min(r[0].height, box.height) * ROW_TOLERANCE_RATIO;
      return Math.abs(box.y - rowY) <= tolerance;
    });
    if (row) {
      row.push(box);
    } else {
      rows.push([box]);
    }
  }

  rows.forEach((row) => row.sort((a, b) => a.x - b.x));
  return rows.flat();
}

export function generateFilename(index: number, total: number): string {
  const padLength = Math.max(2, String(total).length);
  return `image_${String(index + 1).padStart(padLength, "0")}.jpg`;
}

function sanitizeForFilename(text: string): string {
  return text
    .trim()
    .replace(/[^a-zA-Z0-9-_ ]/g, "")
    .replace(/\s+/g, "_");
}

export async function cropSheetBoxes(
  sourceImage: HTMLImageElement,
  boxes: CropBox[],
  targetSize: TargetSize,
  filenamePrefix?: string,
): Promise<{ id: string; filename: string; blob: Blob }[]> {
  const ordered = sortReadingOrder(boxes);
  const results: { id: string; filename: string; blob: Blob }[] = [];
  for (let i = 0; i < ordered.length; i++) {
    const blob = await cropAndResize(sourceImage, ordered[i], targetSize);
    const base = generateFilename(i, ordered.length);
    const filename = filenamePrefix ? `${filenamePrefix}_${base}` : base;
    results.push({ id: ordered[i].id, filename, blob });
  }
  return results;
}

export interface SheetToCrop {
  id: string;
  name: string;
  image: HTMLImageElement;
  boxes: CropBox[];
}

export async function cropAllSheets(
  sheets: SheetToCrop[],
  targetSize: TargetSize,
): Promise<{ id: string; filename: string; blob: Blob }[]> {
  const results: { id: string; filename: string; blob: Blob }[] = [];
  for (const sheet of sheets) {
    if (sheet.boxes.length === 0) continue;
    const sheetResults = await cropSheetBoxes(
      sheet.image,
      sheet.boxes,
      targetSize,
      sanitizeForFilename(sheet.name),
    );
    results.push(...sheetResults);
  }
  return results;
}
