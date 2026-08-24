import { useState, type ChangeEvent } from "react";
import type { CropBox, TargetSize } from "../lib/types";

interface Props {
  className?: string;
  hasImage: boolean;
  targetSize: TargetSize;
  boxCount: number;
  sheetCount: number;
  hasAnySheetBoxes: boolean;
  selectedBox: CropBox | null;
  isExporting: boolean;
  hasExported: boolean;
  onTargetSizeChange: (width: number, height: number) => void;
  onAddBox: () => void;
  onDeleteSelected: () => void;
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
  sheetCount,
  hasAnySheetBoxes,
  selectedBox,
  isExporting,
  hasExported,
  onTargetSizeChange,
  onAddBox,
  onDeleteSelected,
  onClearSheetBoxes,
  onZoomIn,
  onZoomOut,
  onFitToScreen,
  onCropThisSheet,
  onCropAllSheets,
  onReset,
}: Props) {
  const [isCropMenuOpen, setIsCropMenuOpen] = useState(false);

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
            W (px)
            <input
              type="number"
              min={1}
              value={targetSize.width}
              onChange={handleWidthChange}
            />
          </label>
          <label>
            H (px)
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
        <div className="crop-menu-wrapper">
          <button
            type="button"
            className="primary"
            onClick={() => {
              if (sheetCount > 1) {
                setIsCropMenuOpen((open) => !open);
              } else {
                onCropThisSheet();
              }
            }}
            disabled={!hasAnySheetBoxes || isExporting || hasExported}
          >
            {isExporting ? "Cropping…" : "Crop"}
          </button>
          {isCropMenuOpen && sheetCount > 1 && (
            <>
              <div
                className="crop-menu-backdrop"
                onClick={() => setIsCropMenuOpen(false)}
              />
              <div className="crop-menu">
                <button
                  type="button"
                  onClick={() => {
                    setIsCropMenuOpen(false);
                    onCropThisSheet();
                  }}
                  disabled={boxCount === 0}
                >
                  Crop This Sheet
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsCropMenuOpen(false);
                    onCropAllSheets();
                  }}
                  disabled={!hasAnySheetBoxes}
                >
                  Crop All Sheets
                </button>
              </div>
            </>
          )}
        </div>
        <button type="button" onClick={onReset} disabled={!hasImage}>
          Reset
        </button>
      </div>
    </aside>
  );
}
