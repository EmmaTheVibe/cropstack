import { useEffect, useState } from "react";
import { FolderArchive } from "lucide-react";
import type { ExportedCrop } from "../lib/types";
import {
  downloadAsZip,
  downloadSingle,
  findDuplicateFilenames,
} from "../lib/zipDownload";
import {
  isFolderSaveSupported,
  pickSaveFolder,
  saveToFolder,
} from "../lib/saveToFolder";

interface Props {
  results: ExportedCrop[] | null;
  onRename: (id: string, filename: string) => void;
  onDelete: (id: string) => void;
  onClearAll: () => void;
}

const NAME_PATTERN = /^\d{10}$/;
// const NAME_PATTERN = /^.{1,30}$/;


function baseName(filename: string): string {
  return filename.replace(/\.jpg$/i, "");
}

function isValidName(filename: string): boolean {
  return NAME_PATTERN.test(baseName(filename));
}

export default function ExportPanel({
  results,
  onRename,
  onDelete,
  onClearAll,
}: Props) {
  const [isSavingToFolder, setIsSavingToFolder] = useState(false);

  useEffect(() => {
    return () => {
      results?.forEach((r) => URL.revokeObjectURL(r.previewUrl));
    };
  }, [results]);

  if (!results || results.length === 0) return null;

  const duplicates = new Set(findDuplicateFilenames(results));
  const invalidCount = results.filter((r) => !isValidName(r.filename)).length;
  const hasBlockingIssues = duplicates.size > 0 || invalidCount > 0;

  async function handleDownloadAll() {
    try {
      await downloadAsZip(results!);
    } catch (err) {
      alert(err instanceof Error ? err.message : String(err));
    }
  }

  async function handleSaveToFolder() {
    setIsSavingToFolder(true);
    try {
      const dirHandle = await pickSaveFolder();
      await saveToFolder(dirHandle, results!);
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") return;
      alert(err instanceof Error ? err.message : String(err));
    } finally {
      setIsSavingToFolder(false);
    }
  }

  return (
    <section className="export-panel">
      <div className="export-panel-header">
        <h2>Exported ({results.length})</h2>
        <div className="export-panel-actions">
          <button
            type="button"
            className="w-fit icon-text-button"
            onClick={handleDownloadAll}
            disabled={hasBlockingIssues}
            title={
              hasBlockingIssues
                ? "Fix duplicate or invalid filenames before downloading"
                : "Download All (.zip)"
            }
          >
            <FolderArchive size={16} />
            Zip
          </button>
          {isFolderSaveSupported() && (
            <button
              type="button"
              className="w-fit"
              onClick={handleSaveToFolder}
              disabled={hasBlockingIssues || isSavingToFolder}
              title={
                hasBlockingIssues
                  ? "Fix duplicate or invalid filenames before saving"
                  : undefined
              }
            >
              {isSavingToFolder ? "Saving…" : "Save to Folder"}
            </button>
          )}
          <button type="button" className="w-fit" onClick={onClearAll}>
            Clear
          </button>
        </div>
      </div>
      {duplicates.size > 0 && (
        <p className="export-warning">
          Duplicate filenames: {[...duplicates].join(", ")} — rename before
          exporting.
        </p>
      )}
      {invalidCount > 0 && (
        <p className="export-warning">
          {invalidCount} name{invalidCount === 1 ? "" : "s"} must be exactly
          10 digits before exporting.
        </p>
      )}
      <div className="export-grid">
        {results.map((r) => {
          const invalid = !isValidName(r.filename);
          return (
            <div key={r.id} className="export-thumb">
              <button
                type="button"
                className="export-thumb-delete"
                onClick={() => onDelete(r.id)}
                aria-label={`Remove ${r.filename}`}
              >
                ×
              </button>
              <img src={r.previewUrl} alt={r.filename} />
              <div className="export-thumb-footer">
                <div className="export-thumb-name">
                  <input
                    type="text"
                    className={
                      invalid || duplicates.has(r.filename) ? "invalid" : undefined
                    }
                    value={baseName(r.filename)}
                    onChange={(e) => onRename(r.id, `${e.target.value}.jpg`)}
                  />
                  <span>.jpg</span>
                </div>
                <button
                  type="button"
                  onClick={() => downloadSingle(r.blob, r.filename)}
                  disabled={invalid}
                >
                  Download
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
