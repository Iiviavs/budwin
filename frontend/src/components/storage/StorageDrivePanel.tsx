import React from 'react';
import { HardDrive, RefreshCw } from 'lucide-react';
import { DriveItem } from '../../types';

interface StorageDrivePanelProps {
  drives: DriveItem[];
  selectedDrive: DriveItem | null;
  scanning: boolean;
  onSelectDrive: (letter: string) => void;
  onRescan: () => void;
}

export const StorageDrivePanel: React.FC<StorageDrivePanelProps> = ({
  drives,
  selectedDrive,
  scanning,
  onSelectDrive,
  onRescan,
}) => {
  const totalFreeGb = drives.reduce((total, drive) => total + drive.freeGb, 0);
  const totalCapacityGb = drives.reduce((total, drive) => total + drive.totalGb, 0);
  const usedPercent = selectedDrive
    ? Math.min(100, Math.max(0, selectedDrive.percentUsed))
    : 0;

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-medium tracking-tight text-textPrimary">Storage</h1>
          <p className="text-xs text-textTertiary font-mono mt-1">
            {drives.length} Mounted Volumes • {totalFreeGb.toFixed(0)} GB Free of {totalCapacityGb.toFixed(0)} GB Total
          </p>
        </div>

        <button
          onClick={onRescan}
          disabled={scanning}
          className="px-3 py-1.5 rounded-xl bg-surface hover:bg-surfaceHover text-textSecondary hover:text-textPrimary transition-all active:scale-[0.96] flex items-center space-x-1.5 text-xs font-medium disabled:opacity-50"
          aria-label="Rescan storage"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${scanning ? 'animate-spin' : ''}`} />
          <span>Rescan</span>
        </button>
      </div>

      {selectedDrive && (
        <section className="bg-surface rounded-2xl p-6 space-y-5" aria-label={`Drive ${selectedDrive.letter} storage usage`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center space-x-3.5">
              <div className="w-10 h-10 rounded-xl bg-surfaceSubtle flex items-center justify-center text-textSecondary">
                <HardDrive className="w-5 h-5" aria-hidden="true" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-textPrimary tracking-tight">
                  Drive {selectedDrive.letter}:{selectedDrive.name ? ` — ${selectedDrive.name}` : ''}
                </h2>
                <span className="text-[11px] text-textTertiary font-mono">Storage volume</span>
              </div>
            </div>

            {drives.length > 1 && (
              <div className="flex flex-wrap gap-1 bg-surfaceSubtle p-1 rounded-xl text-xs max-w-full" role="group" aria-label="Select drive">
                {drives.map((drive) => (
                  <button
                    key={drive.letter}
                    type="button"
                    onClick={() => onSelectDrive(drive.letter)}
                    aria-pressed={selectedDrive.letter === drive.letter}
                    className={`px-3 py-1 rounded-lg font-mono transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-textSecondary ${
                      selectedDrive.letter === drive.letter
                        ? 'bg-surface text-textPrimary font-medium'
                        : 'text-textSecondary hover:text-textPrimary'
                    }`}
                  >
                    Drive {drive.letter}:
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-3">
            <div
              className="w-full bg-surfaceSubtle h-3 rounded-full overflow-hidden"
              role="img"
              aria-label={`${usedPercent.toFixed(0)} percent used, ${selectedDrive.freeGb.toFixed(1)} GB free`}
            >
              <div
                className="bg-textSecondary/70 h-full transition-all duration-300"
                style={{ width: `${usedPercent}%` }}
              />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono">
              <div className="flex items-center space-x-4">
                <span className="flex items-center space-x-1.5 text-textSecondary">
                  <span className="w-2 h-2 rounded-full bg-textSecondary/70" aria-hidden="true" />
                  <span>In Use ({selectedDrive.usedGb.toFixed(0)} GB)</span>
                </span>
                <span className="flex items-center space-x-1.5 text-textTertiary">
                  <span className="w-2 h-2 rounded-full bg-surfaceSubtle" aria-hidden="true" />
                  <span>Free ({selectedDrive.freeGb.toFixed(0)} GB)</span>
                </span>
              </div>

              <span className="text-textTertiary">{selectedDrive.totalGb.toFixed(0)} GB Total</span>
            </div>
          </div>
        </section>
      )}
    </>
  );
};
