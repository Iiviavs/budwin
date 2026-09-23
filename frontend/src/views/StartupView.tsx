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
    <div className="p-6 space-y-4 max-h-[calc(100vh-2.5rem)] flex flex-col h-full overflow-hidden font-sans">
      {/* Header Banner (Borderless Raycast) */}
      <div className="glass-card rounded-2xl p-5 flex items-center justify-between shadow-xl">
        <div className="flex items-center space-x-3.5">
          <div className="w-11 h-11 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
            <Power className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-sm font-bold text-white">Windows Startup Apps Optimizer</h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#24252A] text-neutral-300">
                {enabledCount} Active at Boot
              </span>
            </div>
            <p className="text-xs text-neutral-400 mt-0.5">
              Control apps that launch with Windows to cut boot time and free memory.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="text-right">
            <span className="text-[10px] text-neutral-400 block font-medium">High Impact Load</span>
            <span className={`text-xs font-bold block ${highImpactCount > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
              {highImpactCount} Heavy Apps
            </span>
          </div>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="flex items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search startup programs or publishers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#18191E] rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:bg-[#202127] transition-colors"
          />
        </div>

        <div className="flex items-center space-x-1 bg-[#18191E] p-1 rounded-xl">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
              filter === 'all' ? 'bg-[#282A33] text-white' : 'text-neutral-400 hover:text-white'
            }`}
          >
            All ({items.length})
          </button>
          <button
            onClick={() => setFilter('high')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
              filter === 'high' ? 'bg-[#282A33] text-rose-400' : 'text-neutral-400 hover:text-white'
            }`}
          >
            High Impact
          </button>
          <button
            onClick={() => setFilter('enabled')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
              filter === 'enabled' ? 'bg-[#282A33] text-emerald-400' : 'text-neutral-400 hover:text-white'
            }`}
          >
            Enabled
          </button>
        </div>

        <button
          onClick={onRefresh}
          className="p-2 rounded-xl bg-[#18191E] hover:bg-[#202127] text-neutral-300 transition-colors"
          title="Refresh Startup Entries"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Startup Table (Raycast List Card) */}
      <div className="glass-card rounded-2xl flex-1 overflow-hidden flex flex-col shadow-xl">
        <div className="grid grid-cols-12 gap-3 px-5 py-2.5 bg-[#141518] text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
          <div className="col-span-4">Application Name</div>
          <div className="col-span-4">Description & Command</div>
          <div className="col-span-2 text-center">Boot Impact</div>
          <div className="col-span-2 text-right">Startup State</div>
        </div>

        <div className="overflow-y-auto flex-1 divide-y divide-white/[0.04]">
          {filteredItems.map((item) => {
            const isHigh = item.impact === 'High';
            const isMedium = item.impact === 'Medium';

            return (
              <div
                key={item.name + item.location}
                className="grid grid-cols-12 gap-3 px-5 py-3 items-center hover:bg-white/[0.02] transition-colors text-xs"
              >
                {/* Name */}
                <div className="col-span-4 flex items-center space-x-2.5 truncate">
                  <div className="w-7 h-7 rounded-lg bg-[#24252A] flex items-center justify-center text-accent-theme font-bold text-xs shrink-0">
                    ⚡
                  </div>
                  <div className="truncate">
                    <span className="font-semibold text-white block truncate">{item.name}</span>
                    <span className="text-[10px] text-neutral-500 font-mono block">{item.location}</span>
                  </div>
                </div>

                {/* Description */}
                <div className="col-span-4 truncate text-neutral-300 font-normal text-[11px]">
                  <span className="block truncate text-white">{item.description}</span>
                  <span className="block truncate text-[10px] text-neutral-500 font-mono">{item.command}</span>
                </div>

                {/* Impact */}
                <div className="col-span-2 flex justify-center">
                  <span
                    className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold ${
                      isHigh
                        ? 'bg-rose-500/15 text-rose-400'
                        : isMedium
                        ? 'bg-amber-500/15 text-amber-400'
                        : 'bg-emerald-500/15 text-emerald-400'
                    }`}
                  >
                    {item.impact} Impact
                  </span>
                </div>

                {/* Toggle Button */}
                <div className="col-span-2 flex justify-end">
                  <button
                    onClick={() => onToggle(item.name, item.location, !item.enabled)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                      item.enabled
                        ? 'bg-accent-theme/15 text-accent-theme hover:bg-accent-theme/25'
                        : 'bg-[#24252A] text-neutral-400 hover:text-white'
                    }`}
                  >
                    {item.enabled ? 'ENABLED' : 'DISABLED'}
                  </button>
                </div>
              </div>
            );
          })}

          {filteredItems.length === 0 && (
            <div className="p-8 text-center text-xs text-neutral-500 flex flex-col items-center justify-center space-y-2">
              <ShieldCheck className="w-8 h-8 text-neutral-600" />
              <span>No startup applications match your filter.</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
