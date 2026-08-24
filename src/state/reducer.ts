import type { CropBox, Sheet } from '../lib/types';
import { clampBoxToImage, reflowBoxToRatio } from './geometry';
import { initialAppState } from './initialState';
import type { Action, AppState } from './types';

function getActiveSheet(state: AppState): Sheet | undefined {
  return state.sheets.find((s) => s.id === state.activeSheetId);
}

function updateActiveSheet(state: AppState, updater: (sheet: Sheet) => Sheet): AppState {
  if (!state.activeSheetId) return state;
  return {
    ...state,
    sheets: state.sheets.map((s) => (s.id === state.activeSheetId ? updater(s) : s)),
  };
}

export function appReducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'ADD_SHEETS':
      if (action.sheets.length === 0) return state;
      return {
        ...state,
        sheets: [...state.sheets, ...action.sheets],
        activeSheetId: action.sheets[0].id,
      };

    case 'REMOVE_SHEET': {
      const sheets = state.sheets.filter((s) => s.id !== action.id);
      const activeSheetId =
        state.activeSheetId === action.id
          ? (sheets[0]?.id ?? null)
          : state.activeSheetId;
      return { ...state, sheets, activeSheetId };
    }

    case 'SELECT_SHEET':
      return { ...state, activeSheetId: action.id };

    case 'ADD_BOX':
      return updateActiveSheet(state, (sheet) => {
        const box = clampBoxToImage(action.box, sheet.naturalWidth, sheet.naturalHeight);
        return {
          ...sheet,
          boxes: [...sheet.boxes, box],
          selectedBoxId: box.id,
        };
      });

    case 'UPDATE_BOX':
      return updateActiveSheet(state, (sheet) => ({
        ...sheet,
        boxes: sheet.boxes.map((b) =>
          b.id === action.id
            ? clampBoxToImage({ ...b, ...action.changes }, sheet.naturalWidth, sheet.naturalHeight)
            : b,
        ),
      }));

    case 'DELETE_BOX':
      return updateActiveSheet(state, (sheet) => ({
        ...sheet,
        boxes: sheet.boxes.filter((b) => b.id !== action.id),
        selectedBoxId: sheet.selectedBoxId === action.id ? null : sheet.selectedBoxId,
      }));

    case 'CLEAR_SHEET_BOXES': {
      const active = getActiveSheet(state);
      if (!active) return state;
      const clearedIds = new Set(active.boxes.map((b) => b.id));
      const sheets = state.sheets.map((s) =>
        s.id === active.id ? { ...s, boxes: [], selectedBoxId: null } : s,
      );
      const remaining = state.exportedResults?.filter((r) => !clearedIds.has(r.id)) ?? null;
      return {
        ...state,
        sheets,
        exportedResults: remaining && remaining.length > 0 ? remaining : null,
      };
    }

    case 'ROTATE_SHEET':
      return updateActiveSheet(state, (sheet) => ({
        ...sheet,
        image: action.image,
        imageUrl: action.imageUrl,
        naturalWidth: action.naturalWidth,
        naturalHeight: action.naturalHeight,
        boxes: action.boxes,
      }));

    case 'DELETE_EXPORT_RESULT': {
      const remaining = state.exportedResults?.filter((r) => r.id !== action.id) ?? null;
      const sheets = state.sheets.map((s) => ({
        ...s,
        boxes: s.boxes.filter((b) => b.id !== action.id),
        selectedBoxId: s.selectedBoxId === action.id ? null : s.selectedBoxId,
      }));
      return {
        ...state,
        sheets,
        exportedResults: remaining && remaining.length > 0 ? remaining : null,
      };
    }

    case 'CLEAR_EXPORT_RESULTS': {
      if (!state.exportedResults) return state;
      const clearedIds = new Set(state.exportedResults.map((r) => r.id));
      const sheets = state.sheets.map((s) => ({
        ...s,
        boxes: s.boxes.filter((b) => !clearedIds.has(b.id)),
        selectedBoxId: s.selectedBoxId && clearedIds.has(s.selectedBoxId) ? null : s.selectedBoxId,
      }));
      return { ...state, sheets, exportedResults: null };
    }

    case 'SELECT_BOX':
      return updateActiveSheet(state, (sheet) => ({ ...sheet, selectedBoxId: action.id }));

    case 'SET_TARGET_SIZE': {
      const ratio = action.width / action.height;
      const sheets = state.sheets.map((sheet) => ({
        ...sheet,
        boxes: sheet.boxes.map((b: CropBox) =>
          reflowBoxToRatio(b, ratio, sheet.naturalWidth, sheet.naturalHeight),
        ),
      }));
      return { ...state, targetSize: { width: action.width, height: action.height }, sheets };
    }

    case 'SET_STAGE_TRANSFORM':
      return updateActiveSheet(state, (sheet) => ({
        ...sheet,
        stageScale: action.scale,
        stagePos: action.pos,
      }));

    case 'SET_EXPORT_RESULTS':
      return { ...state, exportedResults: action.results };

    case 'RENAME_EXPORT_RESULT':
      return {
        ...state,
        exportedResults:
          state.exportedResults?.map((r) =>
            r.id === action.id ? { ...r, filename: action.filename } : r,
          ) ?? null,
      };

    case 'RESET_ALL':
      return { ...initialAppState };

    default:
      return state;
  }
}

export { getActiveSheet };
