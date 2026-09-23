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
    <div className="p-6 space-y-4 max-h-[calc(100vh-2.5rem)] flex flex-col h-full font-sans">
      {/* Search & Filter Header (Raycast Style) */}
      <div className="flex items-center justify-between gap-3">
        {/* Search Bar */}
        <div className="relative flex-1">
          <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search processes by name or PID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#18191E] rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:bg-[#202127] transition-colors"
          />
        </div>

        {/* Category Filters (Raycast Selector Pills) */}
        <div className="flex items-center space-x-1 bg-[#18191E] p-1 rounded-xl">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
              selectedCategory === 'all' ? 'bg-[#282A33] text-white' : 'text-neutral-400 hover:text-white'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setSelectedCategory('safe')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
              selectedCategory === 'safe' ? 'bg-[#282A33] text-sky-400' : 'text-neutral-400 hover:text-white'
            }`}
          >
            User Apps
          </button>
          <button
            onClick={() => setSelectedCategory('background')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
              selectedCategory === 'background' ? 'bg-[#282A33] text-amber-400' : 'text-neutral-400 hover:text-white'
            }`}
          >
            Background
          </button>
          <button
            onClick={() => setSelectedCategory('protected')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
              selectedCategory === 'protected' ? 'bg-[#282A33] text-rose-400' : 'text-neutral-400 hover:text-white'
            }`}
          >
            Protected
          </button>
        </div>

        {/* Refresh button */}
        <button
          onClick={onRefresh}
          className="p-2 rounded-xl bg-[#18191E] hover:bg-[#202127] text-neutral-300 transition-colors"
          title="Refresh Processes"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Process Table (Raycast List Card) */}
      <div className="glass-card rounded-2xl flex-1 overflow-hidden flex flex-col shadow-xl">
        <div className="grid grid-cols-12 gap-2 px-4 py-2.5 bg-[#141518] text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
          <div className="col-span-4">Process Name</div>
          <div className="col-span-4">Description & Role</div>
          <div className="col-span-2 text-right">RAM (MB)</div>
          <div className="col-span-1 text-center">Safety</div>
          <div className="col-span-1 text-right">Action</div>
        </div>

        <div className="overflow-y-auto flex-1 divide-y divide-white/[0.04]">
          {filteredProcesses.map((proc) => {
            const isProtected = proc.category === 'protected';
            const isBackground = proc.category === 'background';

            return (
              <div
                key={proc.pid}
                className="grid grid-cols-12 gap-2 px-4 py-2.5 items-center hover:bg-white/[0.02] transition-colors text-xs"
              >
                {/* Name & PID */}
                <div className="col-span-4 flex items-center space-x-2 truncate">
                  <span className="font-semibold text-white truncate">{proc.name}</span>
                  <span className="text-[10px] text-neutral-500 font-mono">#{proc.pid}</span>
                </div>

                {/* Description */}
                <div className="col-span-4 text-neutral-400 text-[11px] truncate font-normal">
                  {proc.description || 'Application Process'}
                </div>

                {/* RAM */}
                <div className="col-span-2 text-right font-mono font-medium text-neutral-200">
                  {proc.memoryMb.toFixed(1)} MB
                </div>

                {/* Safety Badge */}
                <div className="col-span-1 flex justify-center">
                  {isProtected ? (
                    <span className="flex items-center space-x-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-500/10 text-rose-400" title="Protected System Process">
                      <ShieldAlert className="w-3 h-3" />
                    </span>
                  ) : isBackground ? (
                    <span className="flex items-center space-x-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-500/10 text-amber-400" title="Background Helper">
                      <AlertTriangle className="w-3 h-3" />
                    </span>
                  ) : (
                    <span className="flex items-center space-x-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-500/10 text-emerald-400" title="User Application (Safe to End)">
                      <CheckCircle2 className="w-3 h-3" />
                    </span>
                  )}
                </div>

                {/* Action Button */}
                <div className="col-span-1 flex justify-end">
                  <button
                    onClick={() => setTargetProcess(proc)}
                    className={`p-1 rounded-md transition-colors ${
                      isProtected
                        ? 'text-neutral-600 cursor-not-allowed'
                        : 'text-neutral-400 hover:text-rose-400 hover:bg-rose-500/10'
                    }`}
                    title={isProtected ? 'Protected System Process' : 'End Process'}
                  >
                    <XCircle className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}

          {filteredProcesses.length === 0 && (
            <div className="p-8 text-center text-xs text-neutral-500">
              No processes match your filter.
            </div>
          )}
        </div>
      </div>

      {/* Confirmation Modal */}
      <EndProcessModal
        process={targetProcess}
        onClose={() => setTargetProcess(null)}
        onConfirm={onKillProcess}
      />
    </div>
  );
};
