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
    <div className="p-6 md:p-8 space-y-4 max-h-[calc(100vh-2.5rem)] flex flex-col h-full overflow-hidden font-sans max-w-5xl mx-auto">
      <div className="bg-surface rounded-2xl p-5 flex items-center justify-between">
        <div className="flex items-center space-x-3.5">
          <div className="w-10 h-10 rounded-xl bg-surfaceSubtle flex items-center justify-center text-textSecondary">
            <Power className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-sm font-semibold text-textPrimary">Boot Applications</h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-surfaceSubtle text-textSecondary">
                {enabledCount} Active
              </span>
            </div>
            <p className="text-xs text-textSecondary mt-0.5 font-normal">
              Control background processes initialized on boot to minimize memory usage
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="text-right">
            <span className="text-[10px] text-textTertiary block font-mono">High Impact Load</span>
            <span className="text-xs font-mono font-medium block text-textPrimary">
              {highImpactCount} Heavy Tasks
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-3.5 h-3.5 text-textTertiary absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search boot apps..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-surface rounded-xl pl-9 pr-4 py-2 text-xs text-textPrimary placeholder:text-textTertiary focus:outline-none focus-visible:ring-2 focus-visible:ring-borderFocus transition-colors"
          />
        </div>

        <div className="flex items-center space-x-1 bg-surface p-1 rounded-xl">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all active:scale-[0.96] ${
              filter === 'all'
                ? 'bg-surfaceSubtle text-textPrimary'
                : 'text-textSecondary hover:text-textPrimary'
            }`}
          >
            All ({items.length})
          </button>
          <button
            onClick={() => setFilter('high')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all active:scale-[0.96] ${
              filter === 'high'
                ? 'bg-surfaceSubtle text-textPrimary'
                : 'text-textSecondary hover:text-textPrimary'
            }`}
          >
            High Impact
          </button>
          <button
            onClick={() => setFilter('enabled')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all active:scale-[0.96] ${
              filter === 'enabled'
                ? 'bg-surfaceSubtle text-textPrimary'
                : 'text-textSecondary hover:text-textPrimary'
            }`}
          >
            Enabled
          </button>
        </div>

        <button
          onClick={onRefresh}
          className="p-2 rounded-xl bg-surface hover:bg-surfaceHover text-textSecondary hover:text-textPrimary transition-all active:scale-[0.96]"
          title="Refresh Startup Entries"
          aria-label="Refresh startup entries"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      <div className="bg-surface rounded-2xl flex-1 overflow-hidden flex flex-col">
        <div className="grid grid-cols-12 gap-3 px-5 py-2.5 bg-surfaceSubtle text-[10px] font-medium text-textTertiary uppercase tracking-wider">
          <div className="col-span-4">Application</div>
          <div className="col-span-4">Command</div>
          <div className="col-span-2 text-center">Impact</div>
          <div className="col-span-2 text-right">State</div>
        </div>

        <div className="overflow-y-auto flex-1">
          {filteredItems.map((item) => {
            return (
              <div
                key={item.name + item.location}
                className="grid grid-cols-12 gap-3 px-5 py-3 items-center hover:bg-surfaceHover transition-colors text-xs"
              >
                <div className="col-span-4 flex items-center space-x-2.5 truncate">
                  <div className="truncate">
                    <span className="font-medium text-textPrimary block truncate">{item.name}</span>
                    <span className="text-[10px] text-textTertiary font-mono block">{item.location}</span>
                  </div>
                </div>

                <div className="col-span-4 truncate text-textSecondary font-normal text-[11px]">
                  <span className="block truncate text-textPrimary">{item.description || item.name}</span>
                  <span className="block truncate text-[10px] text-textTertiary font-mono">{item.command}</span>
                </div>

                <div className="col-span-2 flex justify-center">
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-surfaceSubtle text-textSecondary">
                    {item.impact}
                  </span>
                </div>

                <div className="col-span-2 flex justify-end">
                  <button
                    onClick={() => onToggle(item.name, item.location, !item.enabled)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all active:scale-[0.96] ${
                      item.enabled
                        ? 'bg-surfaceSubtle text-textPrimary'
                        : 'bg-transparent text-textTertiary hover:text-textPrimary'
                    }`}
                  >
                    {item.enabled ? 'ENABLED' : 'DISABLED'}
                  </button>
                </div>
              </div>
            );
          })}

          {filteredItems.length === 0 && (
            <div className="p-8 text-center text-xs text-textTertiary flex flex-col items-center justify-center space-y-2 font-mono">
              <ShieldCheck className="w-8 h-8 text-textTertiary" />
              <span>No startup applications match the filter.</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
