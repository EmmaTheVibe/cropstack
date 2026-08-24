import { useReducer, useRef, useState } from 'react';
import type { ImageCanvasHandle } from '../components/image-canvas/ImageCanvas';
import { appReducer, getActiveSheet, initialAppState } from '../state';
import { cropAllSheets, cropSheetBoxes } from '../lib/cropExport';
import type { CropBox, ExportedCrop, Sheet } from '../lib/types';

function revokeResults(results: ExportedCrop[] | null | undefined) {
  results?.forEach((r) => URL.revokeObjectURL(r.previewUrl));
}

function loadImage(file: File): Promise<{ image: HTMLImageElement; imageUrl: string }> {
  return new Promise((resolve, reject) => {
    const imageUrl = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => resolve({ image, imageUrl });
    image.onerror = () => reject(new Error('Could not load image'));
    image.src = imageUrl;
  });
}

export function useAppController() {
  const [state, dispatch] = useReducer(appReducer, initialAppState);
  const canvasRef = useRef<ImageCanvasHandle>(null);
  const [isExporting, setIsExporting] = useState(false);

  const activeSheet = getActiveSheet(state);
  const selectedBox = activeSheet?.boxes.find((b) => b.id === activeSheet.selectedBoxId) ?? null;

  async function handleUpload(files: FileList | File[]) {
    const fileList = Array.from(files);
    if (fileList.length === 0) return;
    const baseIndex = state.sheets.length;
    const loaded = await Promise.all(fileList.map(loadImage));
    const sheets: Sheet[] = loaded.map(({ image, imageUrl }, i) => ({
      id: crypto.randomUUID(),
      name: `Sheet ${baseIndex + i + 1}`,
      image,
      imageUrl,
      naturalWidth: image.naturalWidth,
      naturalHeight: image.naturalHeight,
      stageScale: 1,
      stagePos: { x: 0, y: 0 },
      boxes: [],
      selectedBoxId: null,
    }));
    dispatch({ type: 'ADD_SHEETS', sheets });
  }

  function handleRemoveSheet(id: string) {
    const sheet = state.sheets.find((s) => s.id === id);
    if (sheet) URL.revokeObjectURL(sheet.imageUrl);
    dispatch({ type: 'REMOVE_SHEET', id });
  }

  function handleSelectSheet(id: string) {
    dispatch({ type: 'SELECT_SHEET', id });
  }

  function handleTargetSizeChange(width: number, height: number) {
    dispatch({ type: 'SET_TARGET_SIZE', width, height });
  }

  function handleAddBox() {
    if (!activeSheet) return;
    const { width, height } = state.targetSize;
    const box: CropBox = {
      id: crypto.randomUUID(),
      x: (activeSheet.naturalWidth - width) / 2,
      y: (activeSheet.naturalHeight - height) / 2,
      width,
      height,
    };
    dispatch({ type: 'ADD_BOX', box });
  }

  function handleRenameResult(id: string, filename: string) {
    dispatch({ type: 'RENAME_EXPORT_RESULT', id, filename });
  }

  function handleClearSheetBoxes() {
    if (!activeSheet) return;
    const clearedIds = new Set(activeSheet.boxes.map((b) => b.id));
    const toRevoke = state.exportedResults?.filter((r) => clearedIds.has(r.id));
    revokeResults(toRevoke);
    dispatch({ type: 'CLEAR_SHEET_BOXES' });
  }

  function handleDeleteResult(id: string) {
    const result = state.exportedResults?.find((r) => r.id === id);
    if (result) URL.revokeObjectURL(result.previewUrl);
    dispatch({ type: 'DELETE_EXPORT_RESULT', id });
  }

  function handleClearResults() {
    revokeResults(state.exportedResults);
    dispatch({ type: 'CLEAR_EXPORT_RESULTS' });
  }

  function handleReset() {
    revokeResults(state.exportedResults);
    state.sheets.forEach((s) => URL.revokeObjectURL(s.imageUrl));
    dispatch({ type: 'RESET_ALL' });
  }

  async function handleCropThisSheet() {
    if (!activeSheet || activeSheet.boxes.length === 0) return;
    setIsExporting(true);
    try {
      revokeResults(state.exportedResults);
      const results = await cropSheetBoxes(activeSheet.image, activeSheet.boxes, state.targetSize);
      const withPreviews = results.map((r) => ({ ...r, previewUrl: URL.createObjectURL(r.blob) }));
      dispatch({ type: 'SET_EXPORT_RESULTS', results: withPreviews });
    } finally {
      setIsExporting(false);
    }
  }

  async function handleCropAllSheets() {
    if (state.sheets.every((s) => s.boxes.length === 0)) return;
    setIsExporting(true);
    try {
      revokeResults(state.exportedResults);
      const results = await cropAllSheets(state.sheets, state.targetSize);
      const withPreviews = results.map((r) => ({ ...r, previewUrl: URL.createObjectURL(r.blob) }));
      dispatch({ type: 'SET_EXPORT_RESULTS', results: withPreviews });
    } finally {
      setIsExporting(false);
    }
  }

  return {
    state,
    dispatch,
    activeSheet,
    selectedBox,
    isExporting,
    canvasRef,
    handleUpload,
    handleRemoveSheet,
    handleSelectSheet,
    handleTargetSizeChange,
    handleAddBox,
    handleRenameResult,
    handleClearSheetBoxes,
    handleDeleteResult,
    handleClearResults,
    handleReset,
    handleCropThisSheet,
    handleCropAllSheets,
  };
}
