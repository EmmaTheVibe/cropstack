import type { CropBox, ExportedCrop, Sheet, TargetSize } from '../lib/types';

export interface AppState {
  sheets: Sheet[];
  activeSheetId: string | null;
  targetSize: TargetSize;
  exportedResults: ExportedCrop[] | null;
}

export type Action =
  | { type: 'ADD_SHEETS'; sheets: Sheet[] }
  | { type: 'REMOVE_SHEET'; id: string }
  | { type: 'SELECT_SHEET'; id: string }
  | { type: 'ADD_BOX'; box: CropBox }
  | {
      type: 'UPDATE_BOX';
      id: string;
      changes: Partial<Pick<CropBox, 'x' | 'y' | 'width' | 'height'>>;
    }
  | { type: 'DELETE_BOX'; id: string }
  | { type: 'CLEAR_SHEET_BOXES' }
  | { type: 'DELETE_EXPORT_RESULT'; id: string }
  | { type: 'CLEAR_EXPORT_RESULTS' }
  | { type: 'SELECT_BOX'; id: string | null }
  | { type: 'SET_TARGET_SIZE'; width: number; height: number }
  | { type: 'SET_STAGE_TRANSFORM'; scale: number; pos: { x: number; y: number } }
  | { type: 'SET_EXPORT_RESULTS'; results: ExportedCrop[] | null }
  | { type: 'RENAME_EXPORT_RESULT'; id: string; filename: string }
  | { type: 'RESET_ALL' };
