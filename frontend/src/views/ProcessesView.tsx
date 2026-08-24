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
    <div className="p-6 space-y-4 max-h-[calc(100vh-3.5rem)] flex flex-col h-full">
      {/* Search & Filter Header */}
      <div className="flex items-center justify-between gap-4">
        {/* Search Bar */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search processes by name, PID, or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-surface border border-border rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-sky-500 transition-colors"
          />
        </div>

        {/* Category Filters */}
        <div className="flex items-center space-x-1 bg-surface p-1 rounded-xl border border-border">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
              selectedCategory === 'all' ? 'bg-surfaceHover text-white' : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setSelectedCategory('safe')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
              selectedCategory === 'safe' ? 'bg-sky-500/20 text-sky-400' : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            User Apps
          </button>
          <button
            onClick={() => setSelectedCategory('background')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
              selectedCategory === 'background' ? 'bg-amber-500/20 text-amber-400' : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            Background
          </button>
          <button
            onClick={() => setSelectedCategory('protected')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
              selectedCategory === 'protected' ? 'bg-rose-500/20 text-rose-400' : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            Protected
          </button>
        </div>

        {/* Refresh button */}
        <button
          onClick={onRefresh}
          className="p-2 rounded-xl bg-surface border border-border hover:bg-surfaceHover text-gray-300 transition-colors"
          title="Refresh Processes"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Process Table */}
      <div className="glass-card rounded-2xl border border-border/80 flex-1 overflow-hidden flex flex-col">
        <div className="grid grid-cols-12 gap-2 px-4 py-3 bg-surface/80 border-b border-border/60 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
          <div className="col-span-4">Process Name</div>
          <div className="col-span-4">Description & Role</div>
          <div className="col-span-2 text-right">RAM (MB)</div>
          <div className="col-span-1 text-center">Safety</div>
          <div className="col-span-1 text-right">Action</div>
        </div>

        <div className="overflow-y-auto flex-1 divide-y divide-border/30">
          {filteredProcesses.map((proc) => {
            const isProtected = proc.category === 'protected';
            const isBackground = proc.category === 'background';

            return (
              <div
                key={proc.pid}
                className="grid grid-cols-12 gap-2 px-4 py-2.5 items-center hover:bg-surfaceHover/50 transition-colors text-xs"
              >
                {/* Name & PID */}
                <div className="col-span-4 flex items-center space-x-2 truncate">
                  <span className="font-semibold text-white truncate">{proc.name}</span>
                  <span className="text-[10px] text-gray-500 font-mono">#{proc.pid}</span>
                </div>

                {/* Description */}
                <div className="col-span-4 text-gray-400 text-[11px] truncate font-medium">
                  {proc.description || 'Application Process'}
                </div>

                {/* RAM */}
                <div className="col-span-2 text-right font-mono font-semibold text-gray-200">
                  {proc.memoryMb.toFixed(1)} MB
                </div>

                {/* Safety Badge */}
                <div className="col-span-1 flex justify-center">
                  {isProtected ? (
                    <span className="flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20" title="Protected System Process">
                      <ShieldAlert className="w-3 h-3" />
                    </span>
                  ) : isBackground ? (
                    <span className="flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20" title="Background Helper">
                      <AlertTriangle className="w-3 h-3" />
                    </span>
                  ) : (
                    <span className="flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" title="User Application (Safe to End)">
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
                        ? 'text-gray-600 hover:text-gray-400 cursor-not-allowed'
                        : 'text-gray-400 hover:text-rose-400 hover:bg-rose-500/10'
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
            <div className="p-8 text-center text-xs text-gray-500">
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
