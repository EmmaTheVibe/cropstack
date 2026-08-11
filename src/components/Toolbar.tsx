import type { ChangeEvent } from "react";
import type { CropBox, TargetSize } from "../lib/types";

interface Props {
  className?: string;
  hasImage: boolean;
  targetSize: TargetSize;
  boxCount: number;
  hasAnySheetBoxes: boolean;
  selectedBox: CropBox | null;
  isExporting: boolean;
  hasExported: boolean;
  onTargetSizeChange: (width: number, height: number) => void;
  onAddBox: () => void;
  onDuplicateSelected: () => void;
  onDeleteSelected: () => void;
  onUpdateSelectedBox: (
    changes: Partial<Pick<CropBox, "width" | "height">>,
  ) => void;
  onClearSheetBoxes: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onFitToScreen: () => void;
  onCropThisSheet: () => void;
  onCropAllSheets: () => void;
  onReset: () => void;
}

export default function Toolbar({
  className,
  hasImage,
  targetSize,
  boxCount,
  hasAnySheetBoxes,
  selectedBox,
  isExporting,
  hasExported,
  onTargetSizeChange,
  onAddBox,
  onDuplicateSelected,
  onDeleteSelected,
  onUpdateSelectedBox,
  onClearSheetBoxes,
  onZoomIn,
  onZoomOut,
  onFitToScreen,
  onCropThisSheet,
  onCropAllSheets,
  onReset,
}: Props) {
  function handleWidthChange(e: ChangeEvent<HTMLInputElement>) {
    const width = Number(e.target.value);
    if (width > 0) onTargetSizeChange(width, targetSize.height);
  }

  function handleHeightChange(e: ChangeEvent<HTMLInputElement>) {
    const height = Number(e.target.value);
    if (height > 0) onTargetSizeChange(targetSize.width, height);
  }

  return (
    <aside className={`toolbar${className ? ` ${className}` : ''}`}>
      <div className="toolbar-section">
        <h3>Target Output Size</h3>
        <div className="input-row">
          <label>
            W
            <input
              type="number"
              min={1}
              value={targetSize.width}
              onChange={handleWidthChange}
            />
          </label>
          <label>
            H
            <input
              type="number"
              min={1}
              value={targetSize.height}
              onChange={handleHeightChange}
            />
          </label>
        </div>
      </div>

      <div className="toolbar-section">
        <h3>Boxes ({boxCount})</h3>
        <div className="button-row">
          <button type="button" onClick={onAddBox} disabled={!hasImage}>
            Add
          </button>
          <button
            type="button"
            onClick={onDuplicateSelected}
            disabled={!selectedBox}
          >
            Duplicate
          </button>
          <button
            type="button"
            onClick={onDeleteSelected}
            disabled={!selectedBox}
          >
            Delete
          </button>
        </div>
        <button
          type="button"
          className="clear-boxes-button"
          onClick={onClearSheetBoxes}
          disabled={boxCount === 0}
        >
          Clear All Boxes
        </button>
        {selectedBox && (
          <div className="input-row">
            <label>
              W
              <input
                type="number"
                min={1}
                value={Math.round(selectedBox.width)}
                onChange={(e) => {
                  const width = Number(e.target.value);
                  if (width > 0) onUpdateSelectedBox({ width });
                }}
              />
            </label>
            <label>
              H
              <input
                type="number"
                min={1}
                value={Math.round(selectedBox.height)}
                onChange={(e) => {
                  const height = Number(e.target.value);
                  if (height > 0) onUpdateSelectedBox({ height });
                }}
              />
            </label>
          </div>
        )}
      </div>

      <div className="toolbar-section">
        <h3>Zoom</h3>
        <div className="button-row">
          <button type="button" onClick={onZoomOut} disabled={!hasImage}>
            −
          </button>
          <button type="button" onClick={onFitToScreen} disabled={!hasImage}>
            Fit
          </button>
          <button type="button" onClick={onZoomIn} disabled={!hasImage}>
            +
          </button>
        </div>
      </div>

      <div className="toolbar-section toolbar-section-bottom">
        <button
          type="button"
          className="primary"
          onClick={onCropThisSheet}
          disabled={boxCount === 0 || isExporting || hasExported}
        >
          {isExporting ? "Cropping…" : "Crop This Sheet"}
        </button>
        <button
          type="button"
          onClick={onCropAllSheets}
          disabled={!hasAnySheetBoxes || isExporting || hasExported}
        >
          {isExporting ? "Cropping…" : "Crop All Sheets"}
        </button>
        <button type="button" onClick={onReset} disabled={!hasImage}>
          Reset
        </button>
      </div>
    </aside>
  );
}
