import { useEffect } from 'react';
import type Konva from 'konva';
import type { RefObject } from 'react';
import type { CropBox } from '../../../lib/types';

interface Params {
  layerRef: RefObject<Konva.Layer | null>;
  transformerRef: RefObject<Konva.Transformer | null>;
  selectedBoxId: string | null;
  boxes: CropBox[];
}

export function useTransformerSelection({ layerRef, transformerRef, selectedBoxId, boxes }: Params) {
  useEffect(() => {
    const transformer = transformerRef.current;
    const layer = layerRef.current;
    if (!transformer || !layer) return;
    if (!selectedBoxId) {
      transformer.nodes([]);
      layer.batchDraw();
      return;
    }
    const node = layer.findOne(`#box-${selectedBoxId}`);
    transformer.nodes(node ? [node] : []);
    layer.batchDraw();
  }, [layerRef, transformerRef, selectedBoxId, boxes]);
}
