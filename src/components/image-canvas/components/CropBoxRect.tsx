import type Konva from 'konva';
import { Rect } from 'react-konva';
import type { CropBox } from '../../../lib/types';

interface Props {
  box: CropBox;
  isSelected: boolean;
  stageScale: number;
  onSelect: (id: string) => void;
  onUpdate: (id: string, changes: Partial<Pick<CropBox, 'x' | 'y' | 'width' | 'height'>>) => void;
}

export default function CropBoxRect({ box, isSelected, stageScale, onSelect, onUpdate }: Props) {
  return (
    <Rect
      id={`box-${box.id}`}
      x={box.x}
      y={box.y}
      width={box.width}
      height={box.height}
      stroke={isSelected ? '#2563eb' : '#60a5fa'}
      strokeWidth={(isSelected ? 3 : 2) / stageScale}
      fill="rgba(0,0,0,0.15)"
      draggable
      onClick={(e) => {
        e.cancelBubble = true;
        onSelect(box.id);
      }}
      onTap={(e) => {
        e.cancelBubble = true;
        onSelect(box.id);
      }}
      onDragMove={(e) => {
        onUpdate(box.id, { x: e.target.x(), y: e.target.y() });
      }}
      onTransform={(e: Konva.KonvaEventObject<Event>) => {
        const node = e.target;
        onUpdate(box.id, {
          x: node.x(),
          y: node.y(),
          width: node.width() * node.scaleX(),
          height: node.height() * node.scaleY(),
        });
        node.scaleX(1);
        node.scaleY(1);
      }}
    />
  );
}
