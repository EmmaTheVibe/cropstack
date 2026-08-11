import { useState } from "react";
import type Konva from "konva";
import type { RefObject } from "react";
import type { CropBox } from "../../../lib/types";
import { MIN_BOX_SIZE } from "../../../state";

interface Params {
  stageRef: RefObject<Konva.Stage | null>;
  sourceImage: HTMLImageElement | null;
  onAddBox: (box: CropBox) => void;
  onSelectBox: (id: string | null) => void;
}

export function useBoxDrawing({
  stageRef,
  sourceImage,
  onAddBox,
  onSelectBox,
}: Params) {
  const [drawing, setDrawing] = useState<{
    start: { x: number; y: number };
    box: CropBox;
  } | null>(null);

  function handleStageMouseDown(e: Konva.KonvaEventObject<MouseEvent>) {
    const stage = stageRef.current;
    if (!stage || !sourceImage) return;
    if (e.target !== stage) return;
    const pos = stage.getRelativePointerPosition();
    if (!pos) return;
    setDrawing({
      start: pos,
      box: { id: "", x: pos.x, y: pos.y, width: 0, height: 0 },
    });
  }

  function handleStageMouseMove() {
    if (!drawing) return;
    const stage = stageRef.current;
    if (!stage) return;
    const pos = stage.getRelativePointerPosition();
    if (!pos) return;
    const dx = pos.x - drawing.start.x;
    const dy = pos.y - drawing.start.y;
    const width = Math.abs(dx);
    const height = Math.abs(dy);
    const x = dx >= 0 ? drawing.start.x : drawing.start.x - width;
    const y = dy >= 0 ? drawing.start.y : drawing.start.y - height;
    setDrawing({ ...drawing, box: { ...drawing.box, x, y, width, height } });
  }

  function handleStageMouseUp() {
    if (!drawing) return;
    const { box } = drawing;
    setDrawing(null);
    if (box.width >= MIN_BOX_SIZE && box.height >= MIN_BOX_SIZE) {
      onAddBox({ ...box, id: crypto.randomUUID() });
    } else {
      onSelectBox(null);
    }
  }

  return {
    drawingBox: drawing?.box ?? null,
    handleStageMouseDown,
    handleStageMouseMove,
    handleStageMouseUp,
  };
}
