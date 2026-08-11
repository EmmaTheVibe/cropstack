export interface CropBox {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface TargetSize {
  width: number;
  height: number;
}

export interface ExportedCrop {
  id: string;
  filename: string;
  blob: Blob;
  previewUrl: string;
}

export interface Sheet {
  id: string;
  name: string;
  image: HTMLImageElement;
  imageUrl: string;
  naturalWidth: number;
  naturalHeight: number;
  stageScale: number;
  stagePos: { x: number; y: number };
  boxes: CropBox[];
  selectedBoxId: string | null;
  lastBoxSize: { width: number; height: number } | null;
}
