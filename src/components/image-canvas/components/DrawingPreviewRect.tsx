import { Rect } from 'react-konva';
import type { CropBox } from '../../../lib/types';

interface Props {
  box: CropBox;
  stageScale: number;
}

export default function DrawingPreviewRect({ box, stageScale }: Props) {
  return (
    <Rect
      x={box.x}
      y={box.y}
      width={box.width}
      height={box.height}
      stroke="#2563eb"
      strokeWidth={3 / stageScale}
      dash={[6 / stageScale, 4 / stageScale]}
      listening={false}
    />
  );
}
