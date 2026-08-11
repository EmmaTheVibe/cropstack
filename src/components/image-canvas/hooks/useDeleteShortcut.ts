import { useEffect } from 'react';

interface Params {
  selectedBoxId: string | null;
  onDeleteBox: (id: string) => void;
  onSelectBox: (id: string | null) => void;
}

export function useDeleteShortcut({ selectedBoxId, onDeleteBox, onSelectBox }: Params) {
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (!selectedBoxId) return;
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;
      if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault();
        onDeleteBox(selectedBoxId);
      } else if (e.key === 'Escape') {
        onSelectBox(null);
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedBoxId, onDeleteBox, onSelectBox]);
}
