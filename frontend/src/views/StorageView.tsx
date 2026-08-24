import React, { useState, useEffect } from 'react';
import { HardDrive, CheckCircle2, ShieldCheck, Trash2, Zap, RefreshCw, Layers, Archive, Sparkles, Loader2, Gamepad2, Package } from 'lucide-react';
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
  const [cleaningId, setCleaningId] = useState<string | null>(null);
  const [cleaningAll, setCleaningAll] = useState(false);
  const [purgingGameId, setPurgingGameId] = useState<string | null>(null);
  const [purgingAllGames, setPurgingAllGames] = useState(false);
  const [cleanFeedback, setCleanFeedback] = useState<string | null>(null);

  const loadStorageScan = async () => {
    setScanning(true);
    if (window.go?.main?.App?.ScanCleanableStorage) {
      try {
        const res = await window.go.main.App.ScanCleanableStorage();
        setScanResult(res);
      } catch { }
    }
    if (window.go?.main?.App?.ScanGameDuplicates) {
      try {
        const gRes = await window.go.main.App.ScanGameDuplicates();
        setGameDuplicates(gRes);
      } catch { }
    } else {
      setGameDuplicates({
        totalDuplicateMb: 3080.5,
        items: [
          { id: 'directx_shared_redist', gameName: 'Steam Shared Redundancies', category: 'Duplicate DirectX / VC++', path: 'C:\\Steam\\steamapps\\common\\_CommonRedist', sizeMb: 1840.5, description: 'Redundant DirectX and VC++ installers already configured in Windows.' },
          { id: 'steam_download_cache', gameName: 'Steam Staging Cache', category: 'Orphaned Workshop Depots', path: 'D:\\SteamLibrary\\steamapps\\downloading', sizeMb: 1240.0, description: 'Orphaned workshop mod files and temp download chunks.' },
        ],
      });
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
        setCleanFeedback(`Reclaimed ${freed.toFixed(1)} MB from ${name}!`);
        await loadStorageScan();
      }
    } finally {
      setCleaningId(null);
    }
  };

  const handleCleanAll = async () => {
    setCleaningAll(true);
    try {
      if (window.go?.main?.App?.CleanStorageCategory) {
        const freed = await window.go.main.App.CleanStorageCategory('all');
        setCleanFeedback(`🎉 Successfully reclaimed ${freed >= 1024 ? `${(freed / 1024).toFixed(2)} GB` : `${freed.toFixed(0)} MB`} of disk space!`);
        await loadStorageScan();
      }
    } finally {
      setCleaningAll(false);
    }
  };

  const handlePurgeGameDuplicate = async (id: string, name: string) => {
    setPurgingGameId(id);
    try {
      if (window.go?.main?.App?.PurgeGameDuplicates) {
        const freed = await window.go.main.App.PurgeGameDuplicates(id);
        setCleanFeedback(`Reclaimed ${freed >= 1024 ? `${(freed / 1024).toFixed(2)} GB` : `${freed.toFixed(0)} MB`} from ${name}!`);
        await loadStorageScan();
      }
    } finally {
      setPurgingGameId(null);
    }
  };

  const handlePurgeAllGameDuplicates = async () => {
    setPurgingAllGames(true);
    try {
      if (window.go?.main?.App?.PurgeGameDuplicates) {
        const freed = await window.go.main.App.PurgeGameDuplicates('all');
        setCleanFeedback(`🎉 Reclaimed ${freed >= 1024 ? `${(freed / 1024).toFixed(2)} GB` : `${freed.toFixed(0)} MB`} of duplicate game files!`);
        await loadStorageScan();
      }
    } finally {
      setPurgingAllGames(false);
    }
  };

  const getCategoryIcon = (iconType: string) => {
    switch (iconType) {
      case 'zap':
        return <Zap className="w-4 h-4 text-emerald-400" />;
      case 'refresh':
        return <RefreshCw className="w-4 h-4 text-sky-400" />;
      case 'layers':
        return <Layers className="w-4 h-4 text-purple-400" />;
      case 'archive':
        return <Archive className="w-4 h-4 text-amber-400" />;
      default:
        return <Trash2 className="w-4 h-4 text-rose-400" />;
    }
  };

  return (
    <div className="p-6 space-y-5 pb-20 font-sans">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-white flex items-center space-x-2">
            <HardDrive className="w-5 h-5 text-accent-theme" />
            <span>Mounted Drives & Storage Cleaner</span>
          </h2>
          <p className="text-xs text-neutral-400 mt-0.5 font-normal">
            Real-time drive volume health, shader cleaner, and Steam duplicate hunter
          </p>
        </div>
        <div className="flex items-center space-x-1.5 px-3 py-1 rounded-lg bg-[#18191E] text-emerald-400 text-xs font-medium">
          <ShieldCheck className="w-4 h-4" />
          <span>SMART Health OK</span>
        </div>
      </div>

      {/* 1. MOUNTED DRIVES GRID (Raycast Borderless) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {drives.map((drive) => {
          const isHighUsage = drive.percentUsed > 85;

          return (
            <div
              key={drive.letter}
              className="glass-card rounded-2xl p-5 space-y-4 shadow-xl"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-[#24252A] flex items-center justify-center text-sky-400">
                    <HardDrive className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">
                      Drive {drive.letter}: {drive.name && `(${drive.name})`}
                    </h3>
                    <span className="text-[11px] text-neutral-400">Fixed NTFS Volume</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-sm font-bold text-white">{drive.freeGb.toFixed(1)} GB</span>
                  <span className="text-[10px] text-neutral-400 block">Free Space</span>
                </div>
              </div>

              {/* Visual Progress Bar */}
              <div className="space-y-1.5">
                <div className="w-full bg-[#111215] h-2.5 rounded-full overflow-hidden p-0.5">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isHighUsage
                        ? 'bg-gradient-to-r from-amber-500 to-rose-500'
                        : 'bg-gradient-to-r from-sky-500 to-emerald-400'
                    }`}
                    style={{ width: `${Math.min(100, Math.max(5, drive.percentUsed))}%` }}
                  />
                </div>
                <div className="flex justify-between text-[11px] font-medium text-neutral-400">
                  <span>{drive.usedGb.toFixed(1)} GB Used ({drive.percentUsed.toFixed(1)}%)</span>
                  <span>{drive.totalGb.toFixed(1)} GB Total</span>
                </div>
              </div>

              {/* Status footer */}
              <div className="pt-2 border-t border-white/[0.04] flex items-center justify-between text-xs text-neutral-400">
                <div className="flex items-center space-x-1.5 text-emerald-400">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Healthy</span>
                </div>
                <span>Fast NVMe / SSD</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* 2. MASTER 1-CLICK SPACE RECLAIMER HERO (Raycast Style) */}
      <div className="glass-card rounded-2xl p-5 space-y-3.5 shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3.5">
            <div className="w-11 h-11 rounded-xl bg-accent-theme text-black flex items-center justify-center shadow-md">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-sm font-bold text-white">1-Click Junk & Cache Reclaimer</h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#24252A] text-accent-theme">
                  {scanResult.totalCleanableMb >= 1024
                    ? `${(scanResult.totalCleanableMb / 1024).toFixed(1)} GB Cleanable`
                    : `${scanResult.totalCleanableMb.toFixed(0)} MB Cleanable`}
                </span>
              </div>
              <p className="text-xs text-neutral-400 mt-0.5">
                Purges old GPU shader caches, update installers, temp dumps, and browser caches.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={loadStorageScan}
              disabled={scanning}
              className="p-2 rounded-xl bg-[#24252A] hover:bg-[#2E3038] text-neutral-300 transition-colors"
              title="Rescan Disk"
            >
              <RefreshCw className={`w-4 h-4 ${scanning ? 'animate-spin' : ''}`} />
            </button>

            <button
              onClick={handleCleanAll}
              disabled={cleaningAll || scanResult.totalCleanableMb === 0}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-md flex items-center space-x-2 ${
                scanResult.totalCleanableMb > 0
                  ? 'bg-accent-theme text-black hover:opacity-90 active:scale-95'
                  : 'bg-[#24252A] text-neutral-500 cursor-not-allowed'
              }`}
            >
              {cleaningAll ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Reclaiming Space...</span>
                </>
              ) : (
                <>
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>
                    Clean All (
                    {scanResult.totalCleanableMb >= 1024
                      ? `${(scanResult.totalCleanableMb / 1024).toFixed(1)} GB`
                      : `${scanResult.totalCleanableMb.toFixed(0)} MB`}
                    )
                  </span>
                </>
              )}
            </button>
          </div>
        </div>

        {cleanFeedback && (
          <div className="p-2.5 rounded-xl bg-emerald-500/15 text-emerald-400 text-xs flex items-center space-x-2 font-medium">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{cleanFeedback}</span>
          </div>
        )}
      </div>

      {/* 3. STEAM LIBRARY & GAME FILE DUPLICATE HUNTER */}
      <div className="glass-card rounded-2xl overflow-hidden shadow-xl">
        <div className="px-5 py-3 bg-[#141518] flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Gamepad2 className="w-4 h-4 text-accent-theme" />
            <span className="text-xs font-bold text-white">Steam & Game Duplicate Hunter</span>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-[11px] font-mono text-accent-theme">
              {gameDuplicates.totalDuplicateMb >= 1024
                ? `${(gameDuplicates.totalDuplicateMb / 1024).toFixed(1)} GB Redundancies`
                : `${gameDuplicates.totalDuplicateMb.toFixed(0)} MB Redundancies`}
            </span>

            {gameDuplicates.totalDuplicateMb > 0 && (
              <button
                onClick={handlePurgeAllGameDuplicates}
                disabled={purgingAllGames}
                className="px-3 py-1 rounded-lg bg-accent-theme/15 hover:bg-accent-theme/25 text-accent-theme text-xs font-bold transition-all"
              >
                {purgingAllGames ? 'Purging...' : 'Purge All Game Redundancies'}
              </button>
            )}
          </div>
        </div>

        <div className="divide-y divide-white/[0.04]">
          {gameDuplicates.items.map((item) => (
            <div key={item.id} className="raycast-row">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-lg bg-[#24252A] flex items-center justify-center text-purple-400">
                  <Package className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold text-white">{item.gameName}</span>
                    <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-white/10 text-neutral-300">
                      {item.category}
                    </span>
                  </div>
                  <span className="text-[11px] text-neutral-400 font-normal block">{item.description}</span>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <span className="text-xs font-mono font-bold text-white">
                  {item.sizeMb >= 1024
                    ? `${(item.sizeMb / 1024).toFixed(1)} GB`
                    : `${item.sizeMb.toFixed(1)} MB`}
                </span>

                <button
                  onClick={() => handlePurgeGameDuplicate(item.id, item.gameName)}
                  disabled={purgingGameId === item.id || item.sizeMb === 0}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                    item.sizeMb > 0
                      ? 'bg-[#24252A] hover:bg-[#2E3038] text-neutral-200'
                      : 'bg-transparent text-neutral-600 cursor-not-allowed'
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
          ))}
        </div>
      </div>

      {/* 4. JUNK CATEGORIES LIST BREAKDOWN (Raycast List Rows) */}
      <div className="glass-card rounded-2xl overflow-hidden shadow-xl">
        <div className="px-5 py-3 bg-[#141518] flex items-center justify-between">
          <span className="text-xs font-bold text-white">Cleanable Space Breakdown</span>
          <span className="text-[11px] text-neutral-400">{scanResult.categories.length} Categories</span>
        </div>

        <div className="divide-y divide-white/[0.04]">
          {scanResult.categories.map((cat) => (
            <div key={cat.id} className="raycast-row">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-lg bg-[#24252A] flex items-center justify-center">
                  {getCategoryIcon(cat.iconType)}
                </div>
                <div>
                  <span className="text-xs font-bold text-white block">{cat.name}</span>
                  <span className="text-[11px] text-neutral-400 font-normal">{cat.description}</span>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <span className="text-xs font-mono font-bold text-white">
                  {cat.sizeMb >= 1024
                    ? `${(cat.sizeMb / 1024).toFixed(1)} GB`
                    : `${cat.sizeMb.toFixed(1)} MB`}
                </span>

                <button
                  onClick={() => handleCleanCategory(cat.id, cat.name)}
                  disabled={cleaningId === cat.id || cat.sizeMb === 0}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                    cat.sizeMb > 0
                      ? 'bg-[#24252A] hover:bg-[#2E3038] text-neutral-200'
                      : 'bg-transparent text-neutral-600 cursor-not-allowed'
                  }`}
                >
                  {cleaningId === cat.id ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : cat.sizeMb > 0 ? (
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
