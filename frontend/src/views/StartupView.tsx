import React, { useState } from 'react';
import { Power, Search, RefreshCw, ShieldCheck } from 'lucide-react';
import { StartupItem } from '../types';

interface StartupViewProps {
  items: StartupItem[];
  onRefresh: () => void;
  onToggle: (name: string, location: string, enable: boolean) => Promise<boolean>;
}

export const StartupView: React.FC<StartupViewProps> = ({ items, onRefresh, onToggle }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'all' | 'high' | 'enabled' | 'disabled'>('all');

  const filteredItems = items.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.command.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    if (filter === 'high') return item.impact === 'High';
    if (filter === 'enabled') return item.enabled;
    if (filter === 'disabled') return !item.enabled;
    return true;
  });

  const enabledCount = items.filter((i) => i.enabled).length;
  const highImpactCount = items.filter((i) => i.enabled && i.impact === 'High').length;

  return (
    <div className="p-6 space-y-5 max-h-[calc(100vh-2.5rem)] flex flex-col h-full overflow-hidden">
      {/* Header Banner */}
      <div className="glass-card rounded-3xl p-5 border border-border flex items-center justify-between shadow-xl">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center">
            <Power className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-base font-bold text-white">Windows Startup Apps Optimizer</h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-accent-lime/10 text-accent-lime border border-accent-lime/20">
                {enabledCount} Active at Boot
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-0.5">
              Control apps that launch with Windows to drastically cut boot time and free idle memory.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="text-right">
            <span className="text-[11px] text-gray-400 block font-medium">High Impact Load</span>
            <span className={`text-sm font-bold block ${highImpactCount > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
              {highImpactCount} Heavy Apps
            </span>
          </div>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="flex items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search startup programs, services, or publishers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-surface border border-border rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-accent-lime transition-colors"
          />
        </div>

        <div className="flex items-center space-x-1 bg-surface p-1 rounded-xl border border-border">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
              filter === 'all' ? 'bg-surfaceActive text-white' : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            All ({items.length})
          </button>
          <button
            onClick={() => setFilter('high')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
              filter === 'high' ? 'bg-rose-500/20 text-rose-400' : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            High Impact
          </button>
          <button
            onClick={() => setFilter('enabled')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
              filter === 'enabled' ? 'bg-emerald-500/20 text-emerald-400' : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            Enabled
          </button>
        </div>

        <button
          onClick={onRefresh}
          className="p-2 rounded-xl bg-surface border border-border hover:bg-surfaceHover text-gray-300 transition-colors"
          title="Refresh Startup Entries"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Startup Table */}
      <div className="glass-card rounded-2xl border border-border flex-1 overflow-hidden flex flex-col">
        <div className="grid grid-cols-12 gap-3 px-5 py-3 bg-surface border-b border-border/80 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
          <div className="col-span-4">Application Name</div>
          <div className="col-span-4">Description & Command</div>
          <div className="col-span-2 text-center">Boot Impact</div>
          <div className="col-span-2 text-right">Startup State</div>
        </div>

        <div className="overflow-y-auto flex-1 divide-y divide-border/40">
          {filteredItems.map((item) => {
            const isHigh = item.impact === 'High';
            const isMedium = item.impact === 'Medium';

            return (
              <div
                key={item.name + item.location}
                className="grid grid-cols-12 gap-3 px-5 py-3 items-center hover:bg-surfaceHover/50 transition-colors text-xs"
              >
                {/* Name */}
                <div className="col-span-4 flex items-center space-x-2.5 truncate">
                  <div className="w-7 h-7 rounded-lg bg-surfaceActive flex items-center justify-center text-accent-lime font-bold text-xs shrink-0">
                    ⚡
                  </div>
                  <div className="truncate">
                    <span className="font-bold text-white block truncate">{item.name}</span>
                    <span className="text-[10px] text-gray-500 font-mono block">{item.location}</span>
                  </div>
                </div>

                {/* Description */}
                <div className="col-span-4 truncate text-gray-300 font-medium text-[11px]">
                  <span className="block truncate text-white">{item.description}</span>
                  <span className="block truncate text-[10px] text-gray-500 font-mono">{item.command}</span>
                </div>

                {/* Impact */}
                <div className="col-span-2 flex justify-center">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                      isHigh
                        ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                        : isMedium
                        ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                        : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                    }`}
                  >
                    {item.impact} Impact
                  </span>
                </div>

                {/* Toggle Button */}
                <div className="col-span-2 flex justify-end">
                  <button
                    onClick={() => onToggle(item.name, item.location, !item.enabled)}
                    className={`px-3 py-1 rounded-xl text-xs font-bold border transition-all ${
                      item.enabled
                        ? 'bg-accent-lime/10 text-accent-lime border-accent-lime/40 shadow-sm'
                        : 'bg-surface text-gray-500 border-border hover:text-gray-300'
                    }`}
                  >
                    {item.enabled ? 'ENABLED' : 'DISABLED'}
                  </button>
                </div>
              </div>
            );
          })}

          {filteredItems.length === 0 && (
            <div className="p-8 text-center text-xs text-gray-500 flex flex-col items-center justify-center space-y-2">
              <ShieldCheck className="w-8 h-8 text-accent-lime/40" />
              <span>No startup applications match your filter.</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
