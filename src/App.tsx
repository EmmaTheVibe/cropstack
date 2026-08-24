import { useState } from 'react';
import ImageCanvas from './components/image-canvas/ImageCanvas';
import Toolbar from './components/Toolbar';
import ExportPanel from './components/ExportPanel';
import SheetTabs from './components/sheet-tabs/SheetTabs';
import { useAppController } from './hooks/useAppController';
import './App.css';

function App() {
  const [isToolbarOpen, setIsToolbarOpen] = useState(false);
  const {
    state,
    dispatch,
    activeSheet,
    selectedBox,
    isExporting,
    canvasRef,
    handleUpload,
    handleRemoveSheet,
    handleSelectSheet,
    handleTargetSizeChange,
    handleAddBox,
    handleRenameResult,
    handleClearSheetBoxes,
    handleRotateSheet,
    handleDeleteResult,
    handleClearResults,
    handleReset,
    handleCropThisSheet,
    handleCropAllSheets,
  } = useAppController();

  const hasAnySheetBoxes = state.sheets.some((s) => s.boxes.length > 0);

  return (
    <div className="app-shell">
      {isToolbarOpen && (
        <div className="toolbar-backdrop" onClick={() => setIsToolbarOpen(false)} />
      )}
      <Toolbar
        className={isToolbarOpen ? 'open' : undefined}
        hasImage={!!activeSheet}
        targetSize={state.targetSize}
        boxCount={activeSheet?.boxes.length ?? 0}
        sheetCount={state.sheets.length}
        hasAnySheetBoxes={hasAnySheetBoxes}
        selectedBox={selectedBox}
        isExporting={isExporting}
        hasExported={!!state.exportedResults}
        onTargetSizeChange={handleTargetSizeChange}
        onAddBox={handleAddBox}
        onDeleteSelected={() => selectedBox && dispatch({ type: 'DELETE_BOX', id: selectedBox.id })}
        onClearSheetBoxes={handleClearSheetBoxes}
        onZoomIn={() => canvasRef.current?.zoomIn()}
        onZoomOut={() => canvasRef.current?.zoomOut()}
        onFitToScreen={() => canvasRef.current?.fitToScreen()}
        onRotateSheet={handleRotateSheet}
        onCropThisSheet={handleCropThisSheet}
        onCropAllSheets={handleCropAllSheets}
        onReset={handleReset}
      />
      <button
        type="button"
        className="mobile-toolbar-toggle"
        onClick={() => setIsToolbarOpen((open) => !open)}
        aria-label={isToolbarOpen ? 'Close tools' : 'Open tools'}
      >
        {isToolbarOpen ? '×' : '☰'}
      </button>

      <main className="main-area">
        {state.sheets.length > 0 && (
          <SheetTabs
            sheets={state.sheets}
            activeSheetId={state.activeSheetId}
            onSelect={handleSelectSheet}
            onRemove={handleRemoveSheet}
            onUploadMore={handleUpload}
          />
        )}

        {activeSheet ? (
          <ImageCanvas
            key={activeSheet.id}
            ref={canvasRef}
            sheet={activeSheet}
            targetSize={state.targetSize}
            onSelectBox={(id) => dispatch({ type: 'SELECT_BOX', id })}
            onAddBox={(box) => dispatch({ type: 'ADD_BOX', box })}
            onUpdateBox={(id, changes) => dispatch({ type: 'UPDATE_BOX', id, changes })}
            onDeleteBox={(id) => dispatch({ type: 'DELETE_BOX', id })}
            onStageTransform={(scale, pos) => dispatch({ type: 'SET_STAGE_TRANSFORM', scale, pos })}
          />
        ) : (
          <div className="empty-state">
            <label className="upload-button">
              Upload Images
              <input
                type="file"
                accept="image/jpeg,image/png"
                multiple
                onChange={(e) => {
                  if (e.target.files?.length) handleUpload(e.target.files);
                  e.target.value = '';
                }}
              />
            </label>
          </div>
        )}
        <ExportPanel
          results={state.exportedResults}
          onRename={handleRenameResult}
          onDelete={handleDeleteResult}
          onClearAll={handleClearResults}
        />
      </main>
    </div>
  );
}

export default App;
