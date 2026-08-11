import type { TargetSize } from '../lib/types';
import type { AppState } from './types';

export const DEFAULT_TARGET_SIZE: TargetSize = { width: 275, height: 314 };

export const initialAppState: AppState = {
  sheets: [],
  activeSheetId: null,
  targetSize: DEFAULT_TARGET_SIZE,
  exportedResults: null,
};
