import { findDuplicateFilenames } from './zipDownload';

export function isFolderSaveSupported(): boolean {
  return typeof window !== 'undefined' && typeof window.showDirectoryPicker === 'function';
}

export async function pickSaveFolder(): Promise<FileSystemDirectoryHandle> {
  if (!window.showDirectoryPicker) {
    throw new Error('Folder saving is not supported in this browser.');
  }
  return window.showDirectoryPicker({ mode: 'readwrite' });
}

export async function saveToFolder(
  dirHandle: FileSystemDirectoryHandle,
  results: { filename: string; blob: Blob }[],
): Promise<void> {
  const duplicates = findDuplicateFilenames(results);
  if (duplicates.length > 0) {
    throw new Error(`Duplicate filenames: ${duplicates.join(', ')}. Rename them before saving.`);
  }
  for (const { filename, blob } of results) {
    const fileHandle = await dirHandle.getFileHandle(filename, { create: true });
    const writable = await fileHandle.createWritable();
    await writable.write(blob);
    await writable.close();
  }
}
