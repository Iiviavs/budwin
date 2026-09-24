import React from 'react';
import { AlertTriangle, Archive, Check, CheckCircle2, Layers, Loader2, Package, RefreshCw, Sparkles, Trash2 } from 'lucide-react';
import { GameHunterScanResult, StorageScanResult } from '../../types';

type FilterTab = 'all' | 'system' | 'games';

interface CleanFeedback {
  message: string;
  tone: 'success' | 'error';
}

interface StorageCleanupPanelProps {
  scanResult: StorageScanResult;
  gameDuplicates: GameHunterScanResult;
  scanUnavailable: boolean;
  gameScanUnavailable: boolean;
  scanning: boolean;
  cleaningId: string | null;
  cleaningAll: boolean;
  purgingGameId: string | null;
  cleanFeedback: CleanFeedback | null;
  filterTab: FilterTab;
  onFilterChange: (tab: FilterTab) => void;
  onCleanEverything: () => void;
  onCleanCategory: (id: string, name: string) => void;
  onPurgeGameDuplicate: (id: string, name: string) => void;
}

const formatSize = (mb: number) => {
  if (mb >= 1024) return `${(mb / 1024).toFixed(2)} GB`;
  return `${mb.toFixed(0)} MB`;
};

const getCategoryIcon = (iconType: string) => {
  switch (iconType) {
    case 'zap':
      return <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />;
    case 'refresh':
      return <RefreshCw className="w-3.5 h-3.5" aria-hidden="true" />;
    case 'layers':
      return <Layers className="w-3.5 h-3.5" aria-hidden="true" />;
    case 'archive':
      return <Archive className="w-3.5 h-3.5" aria-hidden="true" />;
    default:
      return <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />;
  }
};

export const StorageCleanupPanel: React.FC<StorageCleanupPanelProps> = ({
  scanResult,
  gameDuplicates,
  scanUnavailable,
  gameScanUnavailable,
  scanning,
  cleaningId,
  cleaningAll,
  purgingGameId,
  cleanFeedback,
  filterTab,
  onFilterChange,
  onCleanEverything,
  onCleanCategory,
  onPurgeGameDuplicate,
}) => {
  const totalCleanableMb = scanResult.totalCleanableMb + gameDuplicates.totalDuplicateMb;
  const hasUnavailableSource = scanUnavailable || gameScanUnavailable;
  const hasCleanableItems = scanResult.categories.some((category) => category.sizeMb > 0.1)
    || gameDuplicates.items.some((item) => item.sizeMb > 0);
  const allSourcesUnavailable = scanUnavailable && gameScanUnavailable;
  const canCleanEverything = !hasUnavailableSource && hasCleanableItems;

  return (
    <section className="bg-surface rounded-2xl p-6 space-y-5" aria-labelledby="reclaimable-storage-heading">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h2 id="reclaimable-storage-heading" className="text-[11px] font-mono uppercase tracking-wider text-textTertiary">
            Reclaimable Storage
          </h2>
          <div className="text-3xl font-semibold text-textPrimary tracking-tight font-mono tabular-nums">
            {scanning ? (
              <span className="text-base font-normal text-textTertiary">Analyzing drives...</span>
            ) : allSourcesUnavailable ? (
              'Unavailable'
            ) : (
              formatSize(totalCleanableMb)
            )}
          </div>
          <p className="text-xs text-textSecondary font-normal">
            Shader caches, system crash logs, temporary files, and duplicate game installers
          </p>
          {!scanning && hasUnavailableSource && !allSourcesUnavailable && (
            <p className="text-xs text-textTertiary" role="status">
              Some scan sources are unavailable; totals may be incomplete.
            </p>
          )}
        </div>

        <button
          type="button"
          onClick={onCleanEverything}
          disabled={cleaningAll || scanning || cleaningId !== null || purgingGameId !== null || !canCleanEverything}
          className={`px-4 py-2.5 rounded-xl text-xs font-medium transition-all flex items-center space-x-2 active:scale-[0.96] select-none disabled:cursor-not-allowed disabled:opacity-40 ${
            canCleanEverything && !cleaningAll
              ? 'bg-textPrimary text-background hover:opacity-90'
              : 'bg-surfaceSubtle text-textTertiary'
          }`}
        >
          {cleaningAll ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" aria-hidden="true" />
              <span>Reclaiming...</span>
            </>
          ) : (
            <>
              <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Clean Everything</span>
            </>
          )}
        </button>
      </div>

      {cleanFeedback && (
        <div
          className="p-3 rounded-xl bg-surfaceSubtle text-textPrimary text-xs flex items-center space-x-2 font-mono animate-fade-in"
          role={cleanFeedback.tone === 'error' ? 'alert' : 'status'}
        >
          {cleanFeedback.tone === 'error' ? (
            <AlertTriangle className="w-4 h-4 text-textSecondary shrink-0" aria-hidden="true" />
          ) : (
            <Check className="w-4 h-4 text-textSecondary shrink-0" aria-hidden="true" />
          )}
          <span>{cleanFeedback.message}</span>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-1 bg-surfaceSubtle p-1 rounded-xl w-fit text-xs" role="group" aria-label="Filter storage items">
        {([
          ['all', 'All Items'],
          ['system', `System Caches (${scanResult.categories.length})`],
          ['games', `Game Packages (${gameDuplicates.items.length})`],
        ] as const).map(([tab, label]) => (
          <button
            key={tab}
            type="button"
            onClick={() => onFilterChange(tab)}
            aria-pressed={filterTab === tab}
            className={`px-3 py-1 rounded-lg transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-textSecondary ${
              filterTab === tab
                ? 'bg-surface text-textPrimary font-medium'
                : 'text-textSecondary hover:text-textPrimary'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="divide-y divide-white/[0.015] border-t border-white/[0.02] pt-1">
        {(filterTab === 'all' || filterTab === 'system') && scanResult.categories.map((category) => (
          <div key={category.id} className="py-3 flex items-center justify-between hover:bg-surfaceHover/50 px-2 rounded-xl transition-colors">
            <div className="flex items-center space-x-3 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-surfaceSubtle flex items-center justify-center text-textSecondary shrink-0">
                {getCategoryIcon(category.iconType)}
              </div>
              <div className="min-w-0 overflow-hidden">
                <span className="text-[13px] font-medium text-textPrimary block truncate tracking-tight">
                  {category.name}
                </span>
                <span className="text-[11px] text-textTertiary font-normal block truncate">
                  {category.description}
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-3 shrink-0 ml-3">
              <span className="text-xs font-mono font-medium text-textPrimary tabular-nums">
                {formatSize(category.sizeMb)}
              </span>
              <button
                type="button"
                onClick={() => onCleanCategory(category.id, category.name)}
                disabled={cleaningAll || scanning || cleaningId !== null || purgingGameId !== null || category.sizeMb <= 0.1 || scanUnavailable}
                aria-label={`Clean ${category.name}`}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all active:scale-[0.96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-textSecondary disabled:cursor-not-allowed disabled:opacity-40 ${
                  category.sizeMb > 0.1 && !scanUnavailable
                    ? 'bg-surfaceSubtle hover:bg-surfaceHover text-textPrimary'
                    : 'bg-transparent text-textTertiary'
                }`}
              >
                {cleaningId === category.id ? (
                  <Loader2 className="w-3 h-3 animate-spin" aria-hidden="true" />
                ) : category.sizeMb > 0.1 ? (
                  'Clean'
                ) : (
                  'Cleaned'
                )}
              </button>
            </div>
          </div>
        ))}

        {(filterTab === 'all' || filterTab === 'games') && gameDuplicates.items.map((item) => (
          <div key={item.id} className="py-3 flex items-center justify-between hover:bg-surfaceHover/50 px-2 rounded-xl transition-colors">
            <div className="flex items-center space-x-3 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-surfaceSubtle flex items-center justify-center text-textSecondary shrink-0">
                <Package className="w-3.5 h-3.5" aria-hidden="true" />
              </div>
              <div className="min-w-0 overflow-hidden">
                <div className="flex items-center space-x-2">
                  <span className="text-[13px] font-medium text-textPrimary tracking-tight truncate">
                    {item.gameName}
                  </span>
                  <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-surfaceSubtle text-textSecondary">
                    {item.category}
                  </span>
                </div>
                <span className="text-[11px] text-textTertiary font-normal block truncate">
                  {item.description}
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-3 shrink-0 ml-3">
              <span className="text-xs font-mono font-medium text-textPrimary tabular-nums">
                {formatSize(item.sizeMb)}
              </span>
              <button
                type="button"
                onClick={() => onPurgeGameDuplicate(item.id, item.gameName)}
                disabled={cleaningAll || scanning || cleaningId !== null || purgingGameId !== null || item.sizeMb <= 0 || gameScanUnavailable}
                aria-label={`Purge ${item.gameName} files`}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all active:scale-[0.96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-textSecondary disabled:cursor-not-allowed disabled:opacity-40 ${
                  item.sizeMb > 0 && !gameScanUnavailable
                    ? 'bg-surfaceSubtle hover:bg-surfaceHover text-textPrimary'
                    : 'bg-transparent text-textTertiary'
                }`}
              >
                {purgingGameId === item.id ? (
                  <Loader2 className="w-3 h-3 animate-spin" aria-hidden="true" />
                ) : item.sizeMb > 0 ? (
                  'Purge'
                ) : (
                  'Purged'
                )}
              </button>
            </div>
          </div>
        ))}

        {!scanning && allSourcesUnavailable && (
          <div className="py-8 text-center text-xs font-mono text-textTertiary" role="status">
            Storage scans are unavailable. Rescan to retry.
          </div>
        )}
        {!scanning && !hasUnavailableSource && !hasCleanableItems && (
          <div className="py-8 text-center text-xs font-mono text-textTertiary flex flex-col items-center justify-center space-y-1">
            <CheckCircle2 className="w-5 h-5 text-textSecondary" aria-hidden="true" />
            <span className="text-textPrimary font-medium">All Clean</span>
            <span>No cleanable caches or duplicate files were found.</span>
          </div>
        )}
      </div>
    </section>
  );
};
