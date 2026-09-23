import React, { useState, useEffect } from 'react';
import { HardDrive, CheckCircle2, Trash2, Zap, RefreshCw, Layers, Archive, Sparkles, Loader2, Gamepad2, Package } from 'lucide-react';
import { DriveItem, StorageScanResult, GameHunterScanResult } from '../types';

interface StorageViewProps {
  drives: DriveItem[];
}

export const StorageView: React.FC<StorageViewProps> = ({ drives }) => {
  const [scanResult, setScanResult] = useState<StorageScanResult>({
    totalCleanableMb: 0,
    categories: [],
  });

  const [gameDuplicates, setGameDuplicates] = useState<GameHunterScanResult>({
    totalDuplicateMb: 0,
    items: [],
  });

  const [scanning, setScanning] = useState(true);
  const [scanUnavailable, setScanUnavailable] = useState(false);
  const [gameScanUnavailable, setGameScanUnavailable] = useState(false);
  const [cleaningId, setCleaningId] = useState<string | null>(null);
  const [cleaningAll, setCleaningAll] = useState(false);
  const [purgingGameId, setPurgingGameId] = useState<string | null>(null);
  const [purgingAllGames, setPurgingAllGames] = useState(false);
  const [cleanFeedback, setCleanFeedback] = useState<string | null>(null);

  const loadStorageScan = async () => {
    setScanning(true);
    setScanUnavailable(false);
    setGameScanUnavailable(false);
    if (window.go?.main?.App?.ScanCleanableStorage) {
      try {
        const res = await window.go.main.App.ScanCleanableStorage();
        setScanResult(res);
      } catch (error) {
        console.error('Failed to scan cleanable storage', error);
        setScanUnavailable(true);
      }
    } else {
      setScanUnavailable(true);
    }
    if (window.go?.main?.App?.ScanGameDuplicates) {
      try {
        const gRes = await window.go.main.App.ScanGameDuplicates();
        setGameDuplicates(gRes);
      } catch (error) {
        console.error('Failed to scan game directories', error);
        setGameScanUnavailable(true);
      }
    } else {
      setGameScanUnavailable(true);
    }
    setScanning(false);
  };

  useEffect(() => {
    loadStorageScan();
  }, []);

  const handleCleanCategory = async (id: string, name: string) => {
    setCleaningId(id);
    try {
      if (window.go?.main?.App?.CleanStorageCategory) {
        const freed = await window.go.main.App.CleanStorageCategory(id);
        setCleanFeedback(`Cleaned ${freed > 0 ? `${freed.toFixed(1)} MB` : 'cache'} from ${name}`);
        setScanResult((prev) => {
          if (!prev) return prev;
          const updatedCategories = prev.categories.map((c) =>
            c.id === id ? { ...c, sizeMb: 0.0 } : c
          );
          const newTotal = updatedCategories.reduce((acc, c) => acc + c.sizeMb, 0);
          return { ...prev, categories: updatedCategories, totalCleanableMb: Math.round(newTotal * 10) / 10 };
        });
      }
      setTimeout(() => setCleanFeedback(null), 3000);
    } finally {
      setCleaningId(null);
    }
  };

  const handleCleanAll = async () => {
    setCleaningAll(true);
    try {
      if (window.go?.main?.App?.CleanStorageCategory) {
        const freed = await window.go.main.App.CleanStorageCategory('all');
        setCleanFeedback(`Reclaimed ${freed >= 1024 ? `${(freed / 1024).toFixed(2)} GB` : `${freed.toFixed(0)} MB`} of storage`);
        setScanResult((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            totalCleanableMb: 0.0,
            categories: prev.categories.map((c) => ({ ...c, sizeMb: 0.0 })),
          };
        });
      }
      setTimeout(() => setCleanFeedback(null), 3000);
    } finally {
      setCleaningAll(false);
    }
  };

  const handlePurgeGameDuplicate = async (id: string, name: string) => {
    setPurgingGameId(id);
    try {
      if (window.go?.main?.App?.PurgeGameDuplicates) {
        await window.go.main.App.PurgeGameDuplicates(id);
        setCleanFeedback(`Purged redundant installer for ${name}`);
        setGameDuplicates((prev) => {
          const updatedItems = prev.items.filter((g) => g.id !== id);
          const newTotal = updatedItems.reduce((acc, g) => acc + g.sizeMb, 0);
          return { totalDuplicateMb: Math.round(newTotal * 10) / 10, items: updatedItems };
        });
      }
      setTimeout(() => setCleanFeedback(null), 3000);
    } finally {
      setPurgingGameId(null);
    }
  };

  const handlePurgeAllGameDuplicates = async () => {
    setPurgingAllGames(true);
    try {
      if (window.go?.main?.App?.PurgeGameDuplicates) {
        const freed = await window.go.main.App.PurgeGameDuplicates('all');
        setCleanFeedback(`Reclaimed ${freed >= 1024 ? `${(freed / 1024).toFixed(2)} GB` : `${freed.toFixed(0)} MB`}`);
        setGameDuplicates({ totalDuplicateMb: 0.0, items: [] });
      }
      setTimeout(() => setCleanFeedback(null), 3000);
    } finally {
      setPurgingAllGames(false);
    }
  };

  const getCategoryIcon = (iconType: string) => {
    switch (iconType) {
      case 'zap':
        return <Zap className="w-4 h-4 text-textSecondary" />;
      case 'refresh':
        return <RefreshCw className="w-4 h-4 text-textSecondary" />;
      case 'layers':
        return <Layers className="w-4 h-4 text-textSecondary" />;
      case 'archive':
        return <Archive className="w-4 h-4 text-textSecondary" />;
      default:
        return <Trash2 className="w-4 h-4 text-textSecondary" />;
    }
  };

  return (
    <div className="p-6 md:p-8 space-y-6 pb-24 font-sans max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-medium tracking-tight text-textPrimary flex items-center space-x-2">
            <HardDrive className="w-5 h-5 text-textPrimary" />
            <span>Storage</span>
          </h2>
          <p className="text-xs text-textSecondary mt-1 font-normal">
            Partition health, shader caches, and redundant package cleaner
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {drives.map((drive) => {
          return (
            <div
              key={drive.letter}
              className="bg-surface rounded-2xl p-4 space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-lg bg-surfaceSubtle flex items-center justify-center text-textSecondary">
                    <HardDrive className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-medium text-textPrimary">
                      Drive {drive.letter}: {drive.name && `(${drive.name})`}
                    </h3>
                    <span className="text-[11px] text-textTertiary font-mono">Fixed Volume</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-mono font-medium text-textPrimary">{drive.freeGb.toFixed(1)} GB Free</span>
                  <span className="text-[10px] text-textTertiary font-mono block">of {drive.totalGb.toFixed(1)} GB</span>
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="w-full bg-surfaceSubtle h-1 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-textPrimary transition-all duration-300"
                    style={{ width: `${Math.min(100, Math.max(2, drive.percentUsed))}%` }}
                  />
                </div>
                <div className="flex justify-between text-[11px] font-mono text-textTertiary">
                  <span>{drive.usedGb.toFixed(1)} GB used ({drive.percentUsed.toFixed(0)}%)</span>
                  <span>{drive.totalGb.toFixed(1)} GB total</span>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between text-xs text-textTertiary">
                <div className="flex items-center space-x-1.5 text-textPrimary">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span className="text-[11px] font-mono">Mounted</span>
                </div>
                <span className="text-[11px] font-mono text-textTertiary">Partition</span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-surface rounded-2xl p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3.5">
            <div className="w-9 h-9 rounded-xl bg-surfaceSubtle text-textSecondary flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-xs font-medium uppercase tracking-wider text-textTertiary">Cleanable Storage</h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-surfaceSubtle text-textSecondary">
              {scanUnavailable ? 'Unavailable' : scanResult.totalCleanableMb >= 1024
                    ? `${(scanResult.totalCleanableMb / 1024).toFixed(1)} GB`
                    : `${scanResult.totalCleanableMb.toFixed(0)} MB`}
                </span>
              </div>
              <p className="text-xs text-textSecondary mt-0.5 font-normal">
                Outdated caches, temporary dumps, and transient files
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={loadStorageScan}
              disabled={scanning}
              className="p-2 rounded-xl bg-surfaceSubtle hover:bg-surfaceHover text-textSecondary hover:text-textPrimary transition-all active:scale-[0.96]"
              title="Rescan Disk"
              aria-label="Rescan disk"
            >
              <RefreshCw className={`w-4 h-4 ${scanning ? 'animate-spin' : ''}`} />
            </button>

            <button
              onClick={handleCleanAll}
              disabled={cleaningAll || scanUnavailable || scanResult.totalCleanableMb === 0}
              className={`px-4 py-2 rounded-xl text-xs font-medium transition-all flex items-center space-x-2 active:scale-[0.96] ${
                scanResult.totalCleanableMb > 0
                  ? 'bg-textPrimary text-background hover:opacity-90'
                  : 'bg-surfaceSubtle text-textTertiary opacity-40 cursor-not-allowed'
              }`}
            >
              {cleaningAll ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Reclaiming...</span>
                </>
              ) : (
                <>
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Clean All</span>
                </>
              )}
            </button>
          </div>
        </div>

        {cleanFeedback && (
          <div className="p-3 rounded-xl bg-surfaceSubtle text-textPrimary text-xs flex items-center space-x-2 font-mono animate-fade-in">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-textSecondary" />
            <span>{cleanFeedback}</span>
          </div>
        )}
      </div>

      <div className="bg-surface rounded-2xl overflow-hidden">
        <div className="px-5 py-3 bg-surfaceSubtle flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Gamepad2 className="w-4 h-4 text-textSecondary" />
            <span className="text-xs font-medium text-textPrimary">Game Redundancies</span>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-[11px] font-mono text-textTertiary">
              {gameScanUnavailable ? 'Unavailable' : gameDuplicates.totalDuplicateMb >= 1024
                ? `${(gameDuplicates.totalDuplicateMb / 1024).toFixed(1)} GB`
                : `${gameDuplicates.totalDuplicateMb.toFixed(0)} MB`}
            </span>

            {gameDuplicates.totalDuplicateMb > 0 && (
              <button
                onClick={handlePurgeAllGameDuplicates}
                disabled={purgingAllGames}
                className="px-3 py-1 rounded-lg bg-surface hover:bg-surfaceHover text-textPrimary text-xs font-medium transition-all active:scale-[0.96]"
              >
                {purgingAllGames ? 'Purging...' : 'Purge All'}
              </button>
            )}
          </div>
        </div>

        <div>
          {gameScanUnavailable ? (
            <div className="p-6 text-center text-xs font-mono text-textTertiary">Game directory scan is unavailable.</div>
          ) : gameDuplicates.items.length === 0 ? (
            <div className="p-6 text-center text-xs flex flex-col items-center justify-center space-y-1.5 font-mono text-textTertiary">
              <CheckCircle2 className="w-5 h-5 text-textSecondary" />
              <span className="font-medium text-textPrimary">No Duplicate Packages Found</span>
              <span className="text-[11px]">Local game directories contain no redundant installers.</span>
            </div>
          ) : (
            gameDuplicates.items.map((item) => (
              <div key={item.id} className="list-row">
                <div className="flex items-center space-x-3">
                  <div className="w-7 h-7 rounded-lg bg-surfaceSubtle flex items-center justify-center text-textSecondary">
                    <Package className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-medium text-textPrimary">{item.gameName}</span>
                      <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-surfaceSubtle text-textSecondary">
                        {item.category}
                      </span>
                    </div>
                    <span className="text-[11px] text-textTertiary font-normal block">{item.description}</span>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <span className="text-xs font-mono text-textPrimary">
                    {item.sizeMb >= 1024
                      ? `${(item.sizeMb / 1024).toFixed(1)} GB`
                      : `${item.sizeMb.toFixed(1)} MB`}
                  </span>

                  <button
                    onClick={() => handlePurgeGameDuplicate(item.id, item.gameName)}
                    disabled={purgingGameId === item.id || item.sizeMb === 0}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all active:scale-[0.96] ${
                      item.sizeMb > 0
                        ? 'bg-surfaceSubtle hover:bg-surfaceHover text-textPrimary'
                        : 'bg-transparent text-textTertiary opacity-40 cursor-not-allowed'
                    }`}
                  >
                    {purgingGameId === item.id ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : item.sizeMb > 0 ? (
                      'Purge'
                    ) : (
                      'Purged'
                    )}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="bg-surface rounded-2xl overflow-hidden">
        <div className="px-5 py-3 bg-surfaceSubtle flex items-center justify-between">
          <span className="text-xs font-medium text-textPrimary">Cleanable Space Breakdown</span>
          <span className="text-[11px] text-textTertiary font-mono">{scanUnavailable ? 'Unavailable' : `${scanResult.categories.length} Categories`}</span>
        </div>

        <div>
          {scanUnavailable ? (
            <div className="p-6 text-center text-xs font-mono text-textTertiary">Storage scan is unavailable.</div>
          ) : scanResult.categories.map((cat) => (
            <div key={cat.id} className="list-row">
              <div className="flex items-center space-x-3">
                <div className="w-7 h-7 rounded-lg bg-surfaceSubtle flex items-center justify-center">
                  {getCategoryIcon(cat.iconType)}
                </div>
                <div>
                  <span className="text-xs font-medium text-textPrimary block">{cat.name}</span>
                  <span className="text-[11px] text-textTertiary font-normal">{cat.description}</span>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <span className="text-xs font-mono text-textPrimary">
                  {cat.sizeMb >= 1024
                    ? `${(cat.sizeMb / 1024).toFixed(1)} GB`
                    : cat.sizeMb > 0.1
                    ? `${cat.sizeMb.toFixed(1)} MB`
                    : '0.0 MB'}
                </span>

                <button
                  onClick={() => handleCleanCategory(cat.id, cat.name)}
                  disabled={cleaningId === cat.id || cat.sizeMb <= 0.1}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all active:scale-[0.96] ${
                    cat.sizeMb > 0.1
                      ? 'bg-surfaceSubtle hover:bg-surfaceHover text-textPrimary'
                      : 'bg-transparent text-textTertiary opacity-40 cursor-not-allowed'
                  }`}
                >
                  {cleaningId === cat.id ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : cat.sizeMb > 0.1 ? (
                    'Clean'
                  ) : (
                    'Cleaned'
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
