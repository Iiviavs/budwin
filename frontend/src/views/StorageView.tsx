import React, { useCallback, useEffect, useRef, useState } from 'react';
import { DriveItem, GameHunterScanResult, StorageScanResult } from '../types';
import { StorageCleanupPanel } from '../components/storage/StorageCleanupPanel';
import { StorageDrivePanel } from '../components/storage/StorageDrivePanel';

type FilterTab = 'all' | 'system' | 'games';

interface CleanFeedback {
  message: string;
  tone: 'success' | 'error';
}

const emptyStorageScan: StorageScanResult = { totalCleanableMb: 0, categories: [] };
const emptyGameScan: GameHunterScanResult = { totalDuplicateMb: 0, items: [] };

const formatSize = (mb: number) => {
  if (mb >= 1024) return `${(mb / 1024).toFixed(2)} GB`;
  return `${mb.toFixed(0)} MB`;
};

export const StorageView: React.FC<{ drives: DriveItem[] }> = ({ drives }) => {
  const [scanResult, setScanResult] = useState<StorageScanResult>(emptyStorageScan);
  const [gameDuplicates, setGameDuplicates] = useState<GameHunterScanResult>(emptyGameScan);
  const [selectedDriveLetter, setSelectedDriveLetter] = useState<string | null>(drives[0]?.letter ?? null);
  const [scanning, setScanning] = useState(true);
  const [scanUnavailable, setScanUnavailable] = useState(false);
  const [gameScanUnavailable, setGameScanUnavailable] = useState(false);
  const [cleaningId, setCleaningId] = useState<string | null>(null);
  const [cleaningAll, setCleaningAll] = useState(false);
  const [purgingGameId, setPurgingGameId] = useState<string | null>(null);
  const [cleanFeedback, setCleanFeedback] = useState<CleanFeedback | null>(null);
  const [filterTab, setFilterTab] = useState<FilterTab>('all');
  const scanRequestRef = useRef(0);
  const feedbackTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mountedRef = useRef(true);

  const selectedDrive = drives.find((drive) => drive.letter === selectedDriveLetter) ?? drives[0] ?? null;

  const showFeedback = useCallback((feedback: CleanFeedback, duration = 3500) => {
    if (!mountedRef.current) return;
    if (feedbackTimeoutRef.current) clearTimeout(feedbackTimeoutRef.current);
    setCleanFeedback(feedback);
    feedbackTimeoutRef.current = setTimeout(() => {
      setCleanFeedback(null);
      feedbackTimeoutRef.current = null;
    }, duration);
  }, []);

  const loadStorageScan = useCallback(async () => {
    if (!mountedRef.current) return;
    const requestId = ++scanRequestRef.current;
    const isCurrentRequest = () => mountedRef.current && requestId === scanRequestRef.current;
    setScanning(true);
    setScanUnavailable(false);
    setGameScanUnavailable(false);

    const app = window.go?.main?.App;
    const loadSystemStorage = async () => {
      if (!app?.ScanCleanableStorage) {
        if (isCurrentRequest()) {
          setScanResult(emptyStorageScan);
          setScanUnavailable(true);
        }
        return;
      }

      try {
        const result = await app.ScanCleanableStorage();
        if (isCurrentRequest()) {
          setScanResult(result);
          setScanUnavailable(false);
        }
      } catch (error) {
        console.error('Failed to scan cleanable storage', error);
        if (isCurrentRequest()) {
          setScanResult(emptyStorageScan);
          setScanUnavailable(true);
        }
      }
    };

    const loadGameStorage = async () => {
      if (!app?.ScanGameDuplicates) {
        if (isCurrentRequest()) {
          setGameDuplicates(emptyGameScan);
          setGameScanUnavailable(true);
        }
        return;
      }

      try {
        const result = await app.ScanGameDuplicates();
        if (isCurrentRequest()) {
          setGameDuplicates(result);
          setGameScanUnavailable(false);
        }
      } catch (error) {
        console.error('Failed to scan game directories', error);
        if (isCurrentRequest()) {
          setGameDuplicates(emptyGameScan);
          setGameScanUnavailable(true);
        }
      }
    };

    try {
      await Promise.all([loadSystemStorage(), loadGameStorage()]);
    } finally {
      if (isCurrentRequest()) setScanning(false);
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    void loadStorageScan();
    return () => {
      mountedRef.current = false;
      scanRequestRef.current += 1;
      if (feedbackTimeoutRef.current) clearTimeout(feedbackTimeoutRef.current);
    };
  }, [loadStorageScan]);

  const handleCleanCategory = async (id: string, name: string) => {
    setCleaningId(id);
    try {
      const cleanCategory = window.go?.main?.App?.CleanStorageCategory;
      if (!cleanCategory) throw new Error('Storage cleanup is unavailable');

      const freedMb = await cleanCategory(id);
      await loadStorageScan();
      showFeedback(
        freedMb > 0
          ? { message: `Cleaned ${formatSize(freedMb)} from ${name}.`, tone: 'success' }
          : { message: `No space was reclaimed from ${name}; some files may be in use.`, tone: 'error' }
      );
    } catch (error) {
      console.error(`Failed to clean ${name}`, error);
      await loadStorageScan();
      showFeedback({ message: `Could not clean ${name}. Rescan and try again.`, tone: 'error' });
    } finally {
      if (mountedRef.current) setCleaningId(null);
    }
  };

  const handlePurgeGameDuplicate = async (id: string, name: string) => {
    setPurgingGameId(id);
    try {
      const purgeGameFiles = window.go?.main?.App?.PurgeGameDuplicates;
      if (!purgeGameFiles) throw new Error('Game package cleanup is unavailable');

      const freedMb = await purgeGameFiles(id);
      await loadStorageScan();
      showFeedback(
        freedMb > 0
          ? { message: `Purged ${formatSize(freedMb)} from ${name}.`, tone: 'success' }
          : { message: `No files were removed for ${name}; they may be in use.`, tone: 'error' }
      );
    } catch (error) {
      console.error(`Failed to purge files for ${name}`, error);
      await loadStorageScan();
      showFeedback({ message: `Could not purge files for ${name}. Rescan and try again.`, tone: 'error' });
    } finally {
      if (mountedRef.current) setPurgingGameId(null);
    }
  };

  const handleCleanEverything = async () => {
    const cleanSystemStorage = window.go?.main?.App?.CleanStorageCategory;
    const purgeGameFiles = window.go?.main?.App?.PurgeGameDuplicates;
    const cleanSystem = scanResult.totalCleanableMb > 0.1;
    const cleanGames = gameDuplicates.totalDuplicateMb > 0.1;
    let totalFreedMb = 0;
    const failedSources: string[] = [];

    setCleaningAll(true);
    try {
      if (cleanSystem) {
        if (!cleanSystemStorage) {
          failedSources.push('system caches');
        } else {
          try {
            totalFreedMb += await cleanSystemStorage('all');
          } catch (error) {
            console.error('Failed to clean system storage', error);
            failedSources.push('system caches');
          }
        }
      }

      if (cleanGames) {
        if (!purgeGameFiles) {
          failedSources.push('game packages');
        } else {
          try {
            totalFreedMb += await purgeGameFiles('all');
          } catch (error) {
            console.error('Failed to purge game package files', error);
            failedSources.push('game packages');
          }
        }
      }

      await loadStorageScan();
      if (failedSources.length > 0 && totalFreedMb > 0) {
        showFeedback({
          message: `Reclaimed ${formatSize(totalFreedMb)}, but some ${failedSources.join(' and ')} could not be cleaned.`,
          tone: 'error',
        });
      } else if (failedSources.length > 0) {
        showFeedback({
          message: `Could not clean ${failedSources.join(' or ')}. Rescan and try again.`,
          tone: 'error',
        });
      } else if (totalFreedMb > 0) {
        showFeedback({ message: `Reclaimed ${formatSize(totalFreedMb)} of disk space.`, tone: 'success' });
      } else {
        showFeedback({
          message: 'No disk space was reclaimed; some files may be in use or already removed.',
          tone: 'error',
        });
      }
    } catch (error) {
      console.error('Failed to refresh storage after cleanup', error);
      showFeedback({ message: 'Cleanup finished, but storage could not be refreshed. Rescan to verify.', tone: 'error' });
    } finally {
      if (mountedRef.current) setCleaningAll(false);
    }
  };

  const hasBusyOperation = cleaningAll || cleaningId !== null || purgingGameId !== null;

  return (
    <div className="p-6 md:p-8 space-y-6 pb-24 font-sans max-w-5xl mx-auto select-none">
      <StorageDrivePanel
        drives={drives}
        selectedDrive={selectedDrive}
        scanning={scanning}
        onSelectDrive={setSelectedDriveLetter}
        onRescan={() => void loadStorageScan()}
      />
      <StorageCleanupPanel
        scanResult={scanResult}
        gameDuplicates={gameDuplicates}
        scanUnavailable={scanUnavailable}
        gameScanUnavailable={gameScanUnavailable}
        scanning={scanning}
        cleaningId={cleaningId}
        cleaningAll={cleaningAll}
        purgingGameId={purgingGameId}
        cleanFeedback={cleanFeedback}
        filterTab={filterTab}
        onFilterChange={setFilterTab}
        onCleanEverything={() => void handleCleanEverything()}
        onCleanCategory={(id, name) => void handleCleanCategory(id, name)}
        onPurgeGameDuplicate={(id, name) => void handlePurgeGameDuplicate(id, name)}
      />
      <span className="sr-only" aria-live="polite">
        {hasBusyOperation ? 'Storage cleanup in progress' : ''}
      </span>
    </div>
  );
};
