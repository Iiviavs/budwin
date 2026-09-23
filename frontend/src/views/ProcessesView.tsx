import React, { useState } from 'react';
import { Search, ShieldAlert, AlertTriangle, CheckCircle2, XCircle, RefreshCw } from 'lucide-react';
import { ProcessItem } from '../types';
import { EndProcessModal } from '../components/EndProcessModal';

interface ProcessesViewProps {
  processes: ProcessItem[];
  onRefresh: () => void;
  onKillProcess: (pid: number) => void;
}

export const ProcessesView: React.FC<ProcessesViewProps> = ({
  processes,
  onRefresh,
  onKillProcess,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'safe' | 'background' | 'protected'>('all');
  const [targetProcess, setTargetProcess] = useState<ProcessItem | null>(null);

  const filteredProcesses = processes.filter((proc) => {
    const matchesSearch =
      proc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      proc.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      proc.pid.toString().includes(searchTerm);

    const matchesCat =
      selectedCategory === 'all' ? true : proc.category === selectedCategory;

    return matchesSearch && matchesCat;
  });

  return (
    <div className="p-6 md:p-8 space-y-4 max-h-[calc(100vh-2.5rem)] flex flex-col h-full font-sans max-w-5xl mx-auto">
      <div className="flex items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-3.5 h-3.5 text-textTertiary absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search processes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-surface rounded-xl pl-9 pr-4 py-2 text-xs text-textPrimary placeholder:text-textTertiary focus:outline-none focus-visible:ring-2 focus-visible:ring-borderFocus transition-colors"
          />
        </div>

        <div className="flex items-center space-x-1 bg-surface p-1 rounded-xl">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all active:scale-[0.96] ${
              selectedCategory === 'all'
                ? 'bg-surfaceSubtle text-textPrimary'
                : 'text-textSecondary hover:text-textPrimary'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setSelectedCategory('safe')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all active:scale-[0.96] ${
              selectedCategory === 'safe'
                ? 'bg-surfaceSubtle text-textPrimary'
                : 'text-textSecondary hover:text-textPrimary'
            }`}
          >
            Apps
          </button>
          <button
            onClick={() => setSelectedCategory('background')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all active:scale-[0.96] ${
              selectedCategory === 'background'
                ? 'bg-surfaceSubtle text-textPrimary'
                : 'text-textSecondary hover:text-textPrimary'
            }`}
          >
            Background
          </button>
          <button
            onClick={() => setSelectedCategory('protected')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all active:scale-[0.96] ${
              selectedCategory === 'protected'
                ? 'bg-surfaceSubtle text-textPrimary'
                : 'text-textSecondary hover:text-textPrimary'
            }`}
          >
            Protected
          </button>
        </div>

        <button
          onClick={onRefresh}
          className="p-2 rounded-xl bg-surface hover:bg-surfaceHover text-textSecondary hover:text-textPrimary transition-all active:scale-[0.96]"
          title="Refresh Processes"
          aria-label="Refresh processes"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      <div className="bg-surface rounded-2xl flex-1 overflow-hidden flex flex-col">
        <div className="grid grid-cols-12 gap-2 px-4 py-2.5 bg-surfaceSubtle text-[10px] font-medium text-textTertiary uppercase tracking-wider">
          <div className="col-span-4">Process Name</div>
          <div className="col-span-4">Description</div>
          <div className="col-span-2 text-right">RAM (MB)</div>
          <div className="col-span-1 text-center">Class</div>
          <div className="col-span-1 text-right">Action</div>
        </div>

        <div className="overflow-y-auto flex-1">
          {filteredProcesses.map((proc) => {
            const isProtected = proc.category === 'protected';
            const isBackground = proc.category === 'background';

            return (
              <div
                key={proc.pid}
                className="grid grid-cols-12 gap-2 px-4 py-2.5 items-center hover:bg-surfaceHover transition-colors text-xs"
              >
                <div className="col-span-4 flex items-center space-x-2 truncate">
                  <span className="font-medium text-textPrimary truncate">{proc.name}</span>
                  <span className="text-[10px] text-textTertiary font-mono">#{proc.pid}</span>
                </div>

                <div className="col-span-4 text-textSecondary text-[11px] truncate font-normal">
                  {proc.description || 'Active Process'}
                </div>

                <div className="col-span-2 text-right font-mono font-medium text-textPrimary tabular-nums">
                  {proc.memoryMb.toFixed(1)} MB
                </div>

                <div className="col-span-1 flex justify-center">
                  {isProtected ? (
                    <span
                      className="flex items-center space-x-1 px-1.5 py-0.5 rounded text-[10px] font-mono bg-surfaceSubtle text-textTertiary"
                      title="Protected System Process"
                    >
                      <ShieldAlert className="w-3 h-3 text-textTertiary" />
                    </span>
                  ) : isBackground ? (
                    <span
                      className="flex items-center space-x-1 px-1.5 py-0.5 rounded text-[10px] font-mono bg-surfaceSubtle text-textSecondary"
                      title="Background Helper"
                    >
                      <AlertTriangle className="w-3 h-3 text-textSecondary" />
                    </span>
                  ) : (
                    <span
                      className="flex items-center space-x-1 px-1.5 py-0.5 rounded text-[10px] font-mono bg-surfaceSubtle text-textPrimary"
                      title="User Application"
                    >
                      <CheckCircle2 className="w-3 h-3 text-textPrimary" />
                    </span>
                  )}
                </div>

                <div className="col-span-1 flex justify-end">
                  <button
                    onClick={() => setTargetProcess(proc)}
                    disabled={isProtected}
                    className={`p-1 rounded-lg transition-all active:scale-[0.9] ${
                      isProtected
                        ? 'text-textTertiary opacity-25 cursor-not-allowed'
                        : 'text-textSecondary hover:text-textPrimary hover:bg-surfaceSubtle'
                    }`}
                    title={isProtected ? 'Protected' : 'End Process'}
                    aria-label={isProtected ? 'Protected process' : 'End process'}
                  >
                    <XCircle className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}

          {filteredProcesses.length === 0 && (
            <div className="p-8 text-center text-xs text-textTertiary font-mono">
              No processes match the query.
            </div>
          )}
        </div>
      </div>

      <EndProcessModal
        process={targetProcess}
        onClose={() => setTargetProcess(null)}
        onConfirm={onKillProcess}
      />
    </div>
  );
};
