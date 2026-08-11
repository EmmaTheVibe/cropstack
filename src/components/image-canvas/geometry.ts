import type { Box as TransformerBox } from 'konva/lib/shapes/Transformer';
import { MIN_BOX_SIZE } from '../../state';

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function computeFitScale(vw: number, vh: number, iw: number, ih: number): number {
  if (iw <= 0 || ih <= 0 || vw <= 0 || vh <= 0) return 1;
  return Math.min(vw / iw, vh / ih);
}

interface BoundBoxParams {
  stageScale: number;
  stagePos: { x: number; y: number };
  ratio: number;
  imageNaturalWidth: number;
  imageNaturalHeight: number;
}

export function createBoundBoxFunc({
  stageScale,
  stagePos,
  ratio,
  imageNaturalWidth,
  imageNaturalHeight,
}: BoundBoxParams) {
  return function boundBoxFunc(oldBox: TransformerBox, newBox: TransformerBox): TransformerBox {
    const toImage = (b: TransformerBox) => ({
      x: (b.x - stagePos.x) / stageScale,
      y: (b.y - stagePos.y) / stageScale,
      width: b.width / stageScale,
      height: b.height / stageScale,
    });
    const oldImg = toImage(oldBox);
    const newImg = toImage(newBox);

    const widthDelta = Math.abs(newImg.width - oldImg.width);
    const heightDelta = Math.abs(newImg.height - oldImg.height);
    let { x, y, width, height } = newImg;
    if (widthDelta >= heightDelta) {
      height = width / ratio;
    } else {
      width = height * ratio;
    }
    if (width < MIN_BOX_SIZE || height < MIN_BOX_SIZE) return oldBox;

    if (x < 0) {
      width += x;
      x = 0;
    }
    if (y < 0) {
      height += y;
      y = 0;
    }
    if (x + width > imageNaturalWidth) width = imageNaturalWidth - x;
    if (y + height > imageNaturalHeight) height = imageNaturalHeight - y;
    if (width / height > ratio) width = height * ratio;
    else height = width / ratio;
    if (width < MIN_BOX_SIZE || height < MIN_BOX_SIZE) return oldBox;

    return {
      x: x * stageScale + stagePos.x,
      y: y * stageScale + stagePos.y,
      width: width * stageScale,
      height: height * stageScale,
      rotation: 0,
    };
  };
}
