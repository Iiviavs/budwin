import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Search, RotateCw, ArrowUp, ArrowDown, X, ShieldAlert } from 'lucide-react';
import { ProcessItem } from '../types';
import { EndProcessModal } from '../components/EndProcessModal';

interface ProcessesViewProps {
  processes: ProcessItem[];
  onRefresh: () => void;
  onKillProcess: (pid: number) => void;
}

type SortField = 'name' | 'memoryMb' | 'pid' | 'category';
type SortOrder = 'asc' | 'desc';

export const ProcessesView: React.FC<ProcessesViewProps> = ({
  processes,
  onRefresh,
  onKillProcess,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'safe' | 'background' | 'protected'>('all');
  const [selectedPid, setSelectedPid] = useState<number | null>(null);
  const [modalProcess, setModalProcess] = useState<ProcessItem | null>(null);
  const [sortField, setSortField] = useState<SortField>('memoryMb');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const handleRefresh = () => {
    setIsRefreshing(true);
    onRefresh();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder(field === 'name' ? 'asc' : 'desc');
    }
  };

  const totalMem = useMemo(
    () => processes.reduce((total, process) => total + process.memoryMb, 0),
    [processes]
  );

  const filteredAndSorted = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();

    return processes
      .filter((proc) => {
        if (categoryFilter !== 'all' && proc.category !== categoryFilter) {
          return false;
        }
        if (!q) return true;
        return (
          proc.name.toLowerCase().includes(q) ||
          proc.description.toLowerCase().includes(q) ||
          proc.pid.toString().includes(q)
        );
      })
      .sort((a, b) => {
        let diff = 0;
        if (sortField === 'name') {
          diff = a.name.localeCompare(b.name);
        } else if (sortField === 'memoryMb') {
          diff = a.memoryMb - b.memoryMb;
        } else if (sortField === 'pid') {
          diff = a.pid - b.pid;
        } else if (sortField === 'category') {
          diff = a.category.localeCompare(b.category);
        }
        return sortOrder === 'asc' ? diff : -diff;
      });
  }, [processes, searchTerm, categoryFilter, sortField, sortOrder]);

  const selectedProcess = useMemo(() => {
    if (selectedPid === null) return null;
    return processes.find((p) => p.pid === selectedPid) || null;
  }, [processes, selectedPid]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isInputActive = document.activeElement === searchInputRef.current;

      if (e.key === '/' && !isInputActive) {
        e.preventDefault();
        searchInputRef.current?.focus();
        return;
      }

      if (e.key === 'Escape') {
        if (isInputActive) {
          searchInputRef.current?.blur();
        } else {
          setSelectedPid(null);
        }
        return;
      }

      if (isInputActive) return;

      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        if (filteredAndSorted.length === 0) return;

        const currentIndex = filteredAndSorted.findIndex((p) => p.pid === selectedPid);
        let nextIndex = 0;

        if (currentIndex === -1) {
          nextIndex = e.key === 'ArrowDown' ? 0 : filteredAndSorted.length - 1;
        } else {
          if (e.key === 'ArrowDown') {
            nextIndex = Math.min(filteredAndSorted.length - 1, currentIndex + 1);
          } else {
            nextIndex = Math.max(0, currentIndex - 1);
          }
        }

        setSelectedPid(filteredAndSorted[nextIndex].pid);
      }

      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedProcess && selectedProcess.category !== 'protected') {
        setModalProcess(selectedProcess);
      }

      if (e.key === 'Enter' && selectedProcess && selectedProcess.category !== 'protected') {
        setModalProcess(selectedProcess);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [filteredAndSorted, selectedPid, selectedProcess]);

  const formatMemory = (mb: number) => {
    if (mb >= 1024) {
      return `${(mb / 1024).toFixed(2)} GB`;
    }
    return `${mb.toFixed(0)} MB`;
  };

  return (
    <div className="p-6 md:p-8 space-y-4 font-sans max-w-6xl mx-auto flex flex-col h-[calc(100vh-2.5rem)] select-none">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
        <div>
          <div className="flex items-center space-x-2.5">
            <h1 className="text-xl font-medium tracking-tight text-textPrimary">
              Processes
            </h1>
            <span className="text-[11px] font-mono text-textTertiary bg-surface px-2 py-0.5 rounded-md">
              {filteredAndSorted.length} of {processes.length}
            </span>
          </div>
          <p className="text-[11px] text-textTertiary font-mono mt-0.5">
            {(totalMem / 1024).toFixed(1)} GB Total Working Set
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-textTertiary absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search ( / )"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-surface rounded-lg pl-8 pr-7 py-1.5 text-xs text-textPrimary placeholder:text-textTertiary focus:outline-none focus-visible:ring-2 focus-visible:ring-textSecondary transition-colors w-48 sm:w-56"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-textTertiary hover:text-textPrimary p-0.5"
                aria-label="Clear search"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          <div className="flex items-center bg-surface p-0.5 rounded-lg text-[11px]">
            <button
              onClick={() => setCategoryFilter('all')}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                categoryFilter === 'all'
                  ? 'bg-surfaceSubtle text-textPrimary font-medium'
                  : 'text-textSecondary hover:text-textPrimary'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setCategoryFilter('safe')}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                categoryFilter === 'safe'
                  ? 'bg-surfaceSubtle text-textPrimary font-medium'
                  : 'text-textSecondary hover:text-textPrimary'
              }`}
            >
              Apps
            </button>
            <button
              onClick={() => setCategoryFilter('background')}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                categoryFilter === 'background'
                  ? 'bg-surfaceSubtle text-textPrimary font-medium'
                  : 'text-textSecondary hover:text-textPrimary'
              }`}
            >
              Background
            </button>
            <button
              onClick={() => setCategoryFilter('protected')}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                categoryFilter === 'protected'
                  ? 'bg-surfaceSubtle text-textPrimary font-medium'
                  : 'text-textSecondary hover:text-textPrimary'
              }`}
            >
              System
            </button>
          </div>

          <button
            onClick={handleRefresh}
            className="p-2 rounded-lg bg-surface hover:bg-surfaceHover text-textSecondary hover:text-textPrimary transition-colors active:scale-95"
            title="Refresh snapshot"
            aria-label="Refresh processes"
          >
            <RotateCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      <div className="flex-1 bg-surface rounded-2xl overflow-hidden flex flex-col min-h-0">
        <div className="grid grid-cols-12 gap-3 px-4 py-2 bg-surfaceSubtle/60 text-[11px] font-medium text-textTertiary tracking-tight shrink-0 select-none">
          <button
            onClick={() => handleSort('name')}
            className="col-span-5 sm:col-span-4 flex items-center space-x-1.5 text-left hover:text-textPrimary transition-colors"
          >
            <span>Process Name</span>
            {sortField === 'name' && (
              sortOrder === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />
            )}
          </button>

          <button
            onClick={() => handleSort('pid')}
            className="col-span-2 sm:col-span-2 flex items-center space-x-1.5 text-left hover:text-textPrimary transition-colors font-mono"
          >
            <span>PID</span>
            {sortField === 'pid' && (
              sortOrder === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />
            )}
          </button>

          <button
            onClick={() => handleSort('memoryMb')}
            className="col-span-5 sm:col-span-2 flex items-center justify-end space-x-1.5 hover:text-textPrimary transition-colors text-right"
          >
            <span>Memory</span>
            {sortField === 'memoryMb' && (
              sortOrder === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />
            )}
          </button>

          <button
            onClick={() => handleSort('category')}
            className="hidden sm:flex col-span-2 items-center space-x-1.5 text-left hover:text-textPrimary transition-colors"
          >
            <span>Class</span>
            {sortField === 'category' && (
              sortOrder === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />
            )}
          </button>

          <div className="hidden sm:block col-span-2 text-left truncate">
            Description
          </div>
        </div>

        <div className="overflow-y-auto flex-1 divide-y divide-white/[0.015] focus:outline-none">
          {filteredAndSorted.map((proc) => {
            const isSelected = selectedPid === proc.pid;
            const isProtected = proc.category === 'protected';
            const isBackground = proc.category === 'background';

            return (
              <div
                key={proc.pid}
                onClick={() => setSelectedPid(proc.pid)}
                onDoubleClick={() => {
                  if (!isProtected) setModalProcess(proc);
                }}
                className={`grid grid-cols-12 gap-3 px-4 py-2 items-center text-xs transition-colors cursor-pointer ${
                  isSelected
                    ? 'bg-surfaceSubtle text-textPrimary'
                    : 'hover:bg-surfaceHover/60 text-textSecondary'
                }`}
              >
                <div className="col-span-5 sm:col-span-4 flex items-center space-x-2 min-w-0">
                  <span
                    className={`truncate font-medium text-[13px] tracking-tight ${
                      isSelected ? 'text-textPrimary' : 'text-textPrimary'
                    }`}
                  >
                    {proc.name}
                  </span>
                </div>

                <div className="col-span-2 sm:col-span-2 font-mono text-[11px] text-textTertiary tabular-nums">
                  {proc.pid}
                </div>

                <div className="col-span-5 sm:col-span-2 text-right font-mono font-medium text-textPrimary tabular-nums text-xs">
                  {formatMemory(proc.memoryMb)}
                </div>

                <div className="hidden sm:flex col-span-2 items-center">
                  <span className="text-[11px] font-mono text-textTertiary">
                    {isProtected ? 'System' : isBackground ? 'Background' : 'Application'}
                  </span>
                </div>

                <div className="hidden sm:block col-span-2 text-textTertiary text-[11px] truncate font-normal">
                  {proc.description || '—'}
                </div>
              </div>
            );
          })}

          {filteredAndSorted.length === 0 && (
            <div className="p-12 text-center text-xs text-textTertiary font-mono">
              No processes match the query.
            </div>
          )}
        </div>

        <div className="px-4 py-2.5 bg-surfaceSubtle/40 flex items-center justify-between text-xs shrink-0 select-none">
          <div className="flex items-center space-x-3 text-textTertiary text-[11px] font-mono">
            {selectedProcess ? (
              <div className="flex items-center space-x-2 text-textSecondary">
                <span className="w-1.5 h-1.5 rounded-full bg-textPrimary" />
                <span className="text-textPrimary font-medium">{selectedProcess.name}</span>
                <span>(PID: {selectedProcess.pid})</span>
                <span>•</span>
                <span>{formatMemory(selectedProcess.memoryMb)}</span>
              </div>
            ) : (
              <span>Select a process to inspect or terminate</span>
            )}
          </div>

          <div className="flex items-center space-x-2">
            {selectedProcess && (
              <>
                {selectedProcess.category === 'protected' ? (
                  <span className="flex items-center space-x-1.5 text-[11px] font-mono text-textTertiary px-2.5 py-1 rounded-lg bg-surface">
                    <ShieldAlert className="w-3.5 h-3.5" />
                    <span>Protected Component</span>
                  </span>
                ) : (
                  <button
                    onClick={() => setModalProcess(selectedProcess)}
                    className="px-3 py-1 rounded-lg bg-textPrimary text-background text-xs font-medium transition-all active:scale-95 hover:opacity-90"
                  >
                    End Process
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      <EndProcessModal
        process={modalProcess}
        onClose={() => setModalProcess(null)}
        onConfirm={onKillProcess}
      />
    </div>
  );
};
