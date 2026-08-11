import { forwardRef, useImperativeHandle, useRef } from 'react';
import type Konva from 'konva';
import { Stage, Layer, Image as KonvaImage, Transformer } from 'react-konva';
import type { CropBox, Sheet, TargetSize } from '../../lib/types';
import { createBoundBoxFunc } from './geometry';
import { useContainerSize } from './hooks/useContainerSize';
import { useStageZoom } from './hooks/useStageZoom';
import { useBoxDrawing } from './hooks/useBoxDrawing';
import { useTransformerSelection } from './hooks/useTransformerSelection';
import { useDeleteShortcut } from './hooks/useDeleteShortcut';
import CropBoxRect from './components/CropBoxRect';
import DrawingPreviewRect from './components/DrawingPreviewRect';

export interface ImageCanvasHandle {
  zoomIn: () => void;
  zoomOut: () => void;
  fitToScreen: () => void;
}

interface Props {
  sheet: Sheet;
  targetSize: TargetSize;
  onSelectBox: (id: string | null) => void;
  onAddBox: (box: CropBox) => void;
  onUpdateBox: (id: string, changes: Partial<Pick<CropBox, 'x' | 'y' | 'width' | 'height'>>) => void;
  onDeleteBox: (id: string) => void;
  onStageTransform: (scale: number, pos: { x: number; y: number }) => void;
}

const ImageCanvas = forwardRef<ImageCanvasHandle, Props>(function ImageCanvas(
  { sheet, targetSize, onSelectBox, onAddBox, onUpdateBox, onDeleteBox, onStageTransform },
  ref,
) {
  const {
    image: sourceImage,
    naturalWidth: imageNaturalWidth,
    naturalHeight: imageNaturalHeight,
    stageScale,
    stagePos,
    boxes,
    selectedBoxId,
  } = sheet;

  const stageRef = useRef<Konva.Stage>(null);
  const layerRef = useRef<Konva.Layer>(null);
  const transformerRef = useRef<Konva.Transformer>(null);
  const { containerRef, containerSize } = useContainerSize<HTMLDivElement>();

  const ratio = targetSize.width / targetSize.height;

  const { fitToScreen, zoomIn, zoomOut, handleWheel } = useStageZoom({
    stageRef,
    containerSize,
    imageNaturalWidth,
    imageNaturalHeight,
    stageScale,
    stagePos,
    sourceImage,
    hasBoxes: boxes.length > 0,
    onStageTransform,
  });

  const { drawingBox, handleStageMouseDown, handleStageMouseMove, handleStageMouseUp } =
    useBoxDrawing({ stageRef, sourceImage, onAddBox, onSelectBox });

  useTransformerSelection({ layerRef, transformerRef, selectedBoxId, boxes });
  useDeleteShortcut({ selectedBoxId, onDeleteBox, onSelectBox });

  useImperativeHandle(ref, () => ({ zoomIn, zoomOut, fitToScreen }));

  const boundBoxFunc = createBoundBoxFunc({
    stageScale,
    stagePos,
    ratio,
    imageNaturalWidth,
    imageNaturalHeight,
  });

  return (
    <div ref={containerRef} className="canvas-viewport">
      <Stage
        ref={stageRef}
        width={containerSize.width}
        height={containerSize.height}
        scaleX={stageScale}
        scaleY={stageScale}
        x={stagePos.x}
        y={stagePos.y}
        onWheel={handleWheel}
        onMouseDown={handleStageMouseDown}
        onMouseMove={handleStageMouseMove}
        onMouseUp={handleStageMouseUp}
      >
        <Layer ref={layerRef}>
          <KonvaImage
            image={sourceImage}
            x={0}
            y={0}
            width={imageNaturalWidth}
            height={imageNaturalHeight}
            listening={false}
          />
          {boxes.map((box) => (
            <CropBoxRect
              key={box.id}
              box={box}
              isSelected={box.id === selectedBoxId}
              stageScale={stageScale}
              onSelect={onSelectBox}
              onUpdate={onUpdateBox}
            />
          ))}
          {drawingBox && <DrawingPreviewRect box={drawingBox} stageScale={stageScale} />}
          <Transformer
            ref={transformerRef}
            keepRatio
            rotateEnabled={false}
            enabledAnchors={['top-left', 'top-right', 'bottom-left', 'bottom-right']}
            boundBoxFunc={boundBoxFunc}
          />
        </Layer>
      </Stage>
    </div>
  );
});

export default ImageCanvas;
