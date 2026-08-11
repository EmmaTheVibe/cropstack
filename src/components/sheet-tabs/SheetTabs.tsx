import type { ChangeEvent } from 'react';
import type { Sheet } from '../../lib/types';

interface Props {
  sheets: Sheet[];
  activeSheetId: string | null;
  onSelect: (id: string) => void;
  onRemove: (id: string) => void;
  onUploadMore: (files: FileList) => void;
}

export default function SheetTabs({ sheets, activeSheetId, onSelect, onRemove, onUploadMore }: Props) {
  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    if (e.target.files?.length) onUploadMore(e.target.files);
    e.target.value = '';
  }

  return (
    <div className="sheet-tabs">
      {sheets.map((sheet) => (
        <div
          key={sheet.id}
          className={`sheet-tab${sheet.id === activeSheetId ? ' active' : ''}`}
          onClick={() => onSelect(sheet.id)}
        >
          <img src={sheet.imageUrl} alt={sheet.name} />
          <span className="sheet-tab-name">{sheet.name}</span>
          <button
            type="button"
            className="sheet-tab-remove"
            onClick={(e) => {
              e.stopPropagation();
              onRemove(sheet.id);
            }}
            aria-label={`Remove ${sheet.name}`}
          >
            ×
          </button>
        </div>
      ))}
      <label className="sheet-tab-add">
        +
        <input type="file" accept="image/jpeg,image/png" multiple onChange={handleFileChange} />
      </label>
    </div>
  );
}
