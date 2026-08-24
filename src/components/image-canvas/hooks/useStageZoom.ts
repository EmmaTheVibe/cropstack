import { useEffect } from 'react';
import type Konva from 'konva';
import type { RefObject } from 'react';
import { clamp, computeFitScale } from '../geometry';

const ZOOM_FACTOR = 1.05;
const MIN_ZOOM_MULT = 0.5;
const MAX_ZOOM_MULT = 8;

interface Params {
  stageRef: RefObject<Konva.Stage | null>;
  containerSize: { width: number; height: number };
  imageNaturalWidth: number;
  imageNaturalHeight: number;
  stageScale: number;
  stagePos: { x: number; y: number };
  sourceImage: HTMLImageElement | null;
  hasBoxes: boolean;
  onStageTransform: (scale: number, pos: { x: number; y: number }) => void;
}

export function useStageZoom({
  stageRef,
  containerSize,
  imageNaturalWidth,
  imageNaturalHeight,
  stageScale,
  stagePos,
  sourceImage,
  hasBoxes,
  onStageTransform,
}: Params) {
  function zoomLimits() {
    const fitScale = computeFitScale(
      containerSize.width,
      containerSize.height,
      imageNaturalWidth,
      imageNaturalHeight,
    );
    return { min: fitScale * MIN_ZOOM_MULT, max: fitScale * MAX_ZOOM_MULT };
  }

  function fitToScreen() {
    const fitScale = computeFitScale(
      containerSize.width,
      containerSize.height,
      imageNaturalWidth,
      imageNaturalHeight,
    );
    const pos = {
      x: (containerSize.width - imageNaturalWidth * fitScale) / 2,
      y: (containerSize.height - imageNaturalHeight * fitScale) / 2,
    };
    onStageTransform(fitScale, pos);
  }

  function zoomBy(factor: number) {
    const { min, max } = zoomLimits();
    const newScale = clamp(stageScale * factor, min, max);
    const centerX = containerSize.width / 2;
    const centerY = containerSize.height / 2;
    const imagePoint = {
      x: (centerX - stagePos.x) / stageScale,
      y: (centerY - stagePos.y) / stageScale,
    };
    const newPos = {
      x: centerX - imagePoint.x * newScale,
      y: centerY - imagePoint.y * newScale,
    };
    onStageTransform(newScale, newPos);
  }

  function handleWheel(e: Konva.KonvaEventObject<WheelEvent>) {
    e.evt.preventDefault();

    if (!e.evt.ctrlKey && !e.evt.metaKey) {
      const dx = e.evt.shiftKey && e.evt.deltaX === 0 ? e.evt.deltaY : e.evt.deltaX;
      const dy = e.evt.shiftKey && e.evt.deltaX === 0 ? 0 : e.evt.deltaY;
      onStageTransform(stageScale, { x: stagePos.x - dx, y: stagePos.y - dy });
      return;
    }

    const stage = stageRef.current;
    if (!stage) return;
    const pointer = stage.getPointerPosition();
    if (!pointer) return;
    const { min, max } = zoomLimits();
    const direction = e.evt.deltaY > 0 ? -1 : 1;
    const newScale = clamp(
      direction > 0 ? stageScale * ZOOM_FACTOR : stageScale / ZOOM_FACTOR,
      min,
      max,
    );
    const imagePoint = {
      x: (pointer.x - stagePos.x) / stageScale,
      y: (pointer.y - stagePos.y) / stageScale,
    };
    const newPos = {
      x: pointer.x - imagePoint.x * newScale,
      y: pointer.y - imagePoint.y * newScale,
    };
    onStageTransform(newScale, newPos);
  }

  useEffect(() => {
    if (!sourceImage || containerSize.width === 0 || containerSize.height === 0) return;
    fitToScreen();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sourceImage]);

  useEffect(() => {
    if (!sourceImage || containerSize.width === 0 || containerSize.height === 0) return;
    if (hasBoxes) return;
    fitToScreen();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [containerSize.width, containerSize.height]);

  return {
    fitToScreen,
    zoomIn: () => zoomBy(ZOOM_FACTOR),
    zoomOut: () => zoomBy(1 / ZOOM_FACTOR),
    handleWheel,
  };
}
