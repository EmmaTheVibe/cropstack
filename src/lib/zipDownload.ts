import JSZip from 'jszip';
import { saveAs } from 'file-saver';

export function findDuplicateFilenames(results: { filename: string }[]): string[] {
  const seen = new Set<string>();
  const duplicates = new Set<string>();
  for (const { filename } of results) {
    if (seen.has(filename)) duplicates.add(filename);
    seen.add(filename);
  }
  return [...duplicates];
}

export async function downloadAsZip(
  results: { filename: string; blob: Blob }[],
  zipFilename = 'cropped_images.zip',
): Promise<void> {
  const duplicates = findDuplicateFilenames(results);
  if (duplicates.length > 0) {
    throw new Error(
      `Duplicate filenames: ${duplicates.join(', ')}. Rename them before downloading.`,
    );
  }
  const zip = new JSZip();
  for (const { filename, blob } of results) {
    zip.file(filename, blob);
  }
  const zipBlob = await zip.generateAsync({ type: 'blob' });
  saveAs(zipBlob, zipFilename);
}

export function downloadSingle(blob: Blob, filename: string): void {
  saveAs(blob, filename);
}
