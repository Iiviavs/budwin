import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  Search,
  RotateCw,
  X,
  Layers,
  Sparkles,
  ArrowUpDown,
} from 'lucide-react';
import { StartupItem } from '../types';
import { StartupItemRow } from './StartupItemRow';

interface StartupViewProps {
  items: StartupItem[];
  status: 'loading' | 'ready' | 'error';
  onRefresh: () => Promise<void>;
  onToggle: (name: string, location: string, enable: boolean) => Promise<boolean>;
}

type FilterCategory = 'all' | 'user' | 'system' | 'high' | 'enabled';
type SortField = 'name' | 'impact' | 'status';
type SortOrder = 'asc' | 'desc';

export const StartupView: React.FC<StartupViewProps> = ({ items, status, onRefresh, onToggle }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<FilterCategory>('all');
  const [sortField, setSortField] = useState<SortField>('status');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [togglingMap, setTogglingMap] = useState<Record<string, boolean>>({});
  const [expandedKeys, setExpandedKeys] = useState<Record<string, boolean>>({});
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [budwinAutoStart, setBudwinAutoStart] = useState<boolean | null>(null);
  const [togglingBudwin, setTogglingBudwin] = useState(false);
  const [autoStartUnavailable, setAutoStartUnavailable] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const schedule = (callback: () => void, delay: number) => {
    const timer = setTimeout(() => {
      timers.current = timers.current.filter((activeTimer) => activeTimer !== timer);
      callback();
    }, delay);
    timers.current.push(timer);
  };

  useEffect(() => {
    let active = true;
    const app = window.go?.main?.App;
    if (!app?.GetAutoStartEnabled) {
      setAutoStartUnavailable(true);
    } else {
      app.GetAutoStartEnabled()
        .then((res) => { if (active) setBudwinAutoStart(res); })
        .catch((error) => {
          console.error('Failed to load Budwin startup status', error);
          if (active) setAutoStartUnavailable(true);
        });
    }
    return () => {
      active = false;
      timers.current.forEach(clearTimeout);
    };
  }, []);

  const handleToggleBudwin = async () => {
    if (budwinAutoStart === null || !window.go?.main?.App?.SetAutoStartEnabled) return;
    setTogglingBudwin(true);
    const next = !budwinAutoStart;
    try {
      const ok = await window.go.main.App.SetAutoStartEnabled(next);
      if (ok) setBudwinAutoStart(next);
      else setActionError('Unable to update Budwin startup setting.');
    } catch (error) {
      console.error('Failed to update Budwin startup setting', error);
      setActionError('Unable to update Budwin startup setting.');
    } finally {
      setTogglingBudwin(false);
    }
  };

  const handleRefresh = async () => {
    setActionError(null);
    setIsRefreshing(true);
    try {
      await onRefresh();
    } catch (error) {
      console.error('Failed to refresh startup items', error);
      setActionError('Unable to refresh startup items.');
    } finally {
      setIsRefreshing(false);
    }
  };

  const toggleExpand = (key: string) => {
    setExpandedKeys((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleCopyCommand = (key: string, command: string) => {
    if (!navigator.clipboard?.writeText) {
      setActionError('Clipboard access is unavailable.');
      return;
    }
    navigator.clipboard.writeText(command)
      .then(() => {
        setCopiedKey(key);
        schedule(() => setCopiedKey((current) => current === key ? null : current), 1500);
      })
      .catch((error) => {
        console.error('Failed to copy startup command', error);
        setActionError('Unable to copy startup command.');
      });
  };

  const handleToggleItem = async (item: StartupItem) => {
    const key = `${item.name}-${item.location}`;
    setActionError(null);
    setTogglingMap((prev) => ({ ...prev, [key]: true }));
    try {
      const succeeded = await onToggle(item.name, item.location, !item.enabled);
      if (!succeeded) setActionError(`Unable to update ${item.name}.`);
    } catch (error) {
      console.error(`Failed to update startup item ${item.name}`, error);
      setActionError(`Unable to update ${item.name}.`);
    } finally {
      setTogglingMap((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    }
  };

  const stats = useMemo(() => {
    let enabledCount = 0;
    let highImpactCount = 0;
    let disabledCount = 0;
    let userCount = 0;
    let systemCount = 0;

    for (const i of items) {
      if (i.enabled) {
        enabledCount++;
        if (i.impact === 'High') highImpactCount++;
      } else {
        disabledCount++;
      }
      if (i.location === 'HKCU') userCount++;
      if (i.location === 'HKLM') systemCount++;
    }

    return { enabledCount, highImpactCount, disabledCount, userCount, systemCount };
  }, [items]);

  const filteredAndSorted = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();

    return items
      .filter((item) => {
        if (filter === 'user' && item.location !== 'HKCU') return false;
        if (filter === 'system' && item.location !== 'HKLM') return false;
        if (filter === 'high' && item.impact !== 'High') return false;
        if (filter === 'enabled' && !item.enabled) return false;

        if (!q) return true;
        return (
          item.name.toLowerCase().includes(q) ||
          item.description.toLowerCase().includes(q) ||
          item.command.toLowerCase().includes(q) ||
          item.location.toLowerCase().includes(q)
        );
      })
      .sort((a, b) => {
        let diff = 0;
        if (sortField === 'name') {
          diff = a.name.localeCompare(b.name);
        } else if (sortField === 'impact') {
          const impactWeight: Record<string, number> = { High: 3, Medium: 2, Low: 1 };
          diff = (impactWeight[a.impact] || 0) - (impactWeight[b.impact] || 0);
        } else if (sortField === 'status') {
          diff = (a.enabled ? 1 : 0) - (b.enabled ? 1 : 0);
        }
        return sortOrder === 'asc' ? diff : -diff;
      });
  }, [items, searchTerm, filter, sortField, sortOrder]);

  const bootEvaluation = useMemo(() => {
    if (stats.highImpactCount === 0) {
      return { label: 'Low estimated load', description: 'No high-impact entries detected' };
    }
    if (stats.highImpactCount <= 2) {
      return { label: 'Moderate estimated load', description: `${stats.highImpactCount} high-impact entries detected` };
    }
    return { label: 'High estimated load', description: `${stats.highImpactCount} high-impact entries detected` };
  }, [stats.highImpactCount]);

  const userItems = useMemo(
    () => filteredAndSorted.filter((i) => i.location === 'HKCU'),
    [filteredAndSorted]
  );
  const systemItems = useMemo(
    () => filteredAndSorted.filter((i) => i.location === 'HKLM'),
    [filteredAndSorted]
  );

  const shouldGroup = filter === 'all' && !searchTerm.trim() && userItems.length > 0 && systemItems.length > 0;

  const renderItemRow = (item: StartupItem) => {
    const key = `${item.name}-${item.location}`;
    return (
      <StartupItemRow
        key={key}
        item={item}
        toggling={!!togglingMap[key]}
        expanded={!!expandedKeys[key]}
        copied={copiedKey === key}
        onToggle={() => handleToggleItem(item)}
        onExpand={() => toggleExpand(key)}
        onCopy={() => handleCopyCommand(key, item.command)}
      />
    );
  };
  return (
    <div className="p-6 md:p-8 space-y-5 max-h-[calc(100vh-2.5rem)] flex flex-col h-full font-sans max-w-5xl mx-auto select-none">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
        <div>
          <div className="flex items-center space-x-2.5">
            <h1 className="text-xl font-medium tracking-tight text-textPrimary">
              Startup Items
            </h1>
            <span className="text-[11px] font-mono text-textTertiary bg-surface px-2 py-0.5 rounded-md border border-white/[0.03]">
              {status === 'ready' ? `${filteredAndSorted.length} of ${items.length}` : status === 'loading' ? 'Loading' : 'Unavailable'}
            </span>
          </div>
          <p className="text-xs text-textSecondary mt-0.5 font-normal">
            Control applications and background daemons scheduled to launch on Windows login
          </p>
        </div>

        <div className="flex items-center space-x-2.5">
          {budwinAutoStart !== null && (
            <div className="flex items-center space-x-2 bg-surface border border-white/[0.03] px-3 py-1.5 rounded-xl text-xs">
              <span className="text-textSecondary text-[11px]">Start Budwin on Login</span>
              <button
                type="button"
                role="switch"
                aria-label="Start Budwin on login"
                aria-checked={budwinAutoStart}
                disabled={togglingBudwin}
                onClick={handleToggleBudwin}
                className={`relative inline-flex h-4 w-7 shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-textPrimary ${
                  budwinAutoStart ? 'bg-textPrimary' : 'bg-surfaceSubtle'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-3 w-3 transform rounded-full transition duration-200 ease-in-out mt-0.5 ml-0.5 ${
                    budwinAutoStart ? 'translate-x-3 bg-background' : 'translate-x-0 bg-textSecondary'
                  }`}
                />
              </button>
            </div>
          )}
          {autoStartUnavailable && <span className="text-[11px] text-textTertiary">Startup status unavailable</span>}

          <button
            onClick={handleRefresh}
            className="p-2 rounded-xl bg-surface hover:bg-surfaceHover text-textSecondary hover:text-textPrimary transition-colors active:scale-95 border border-white/[0.03]"
            title="Refresh startup items"
            aria-label="Refresh startup items"
          >
            <RotateCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {actionError && <div role="alert" className="text-xs text-textPrimary bg-surface px-3 py-2 rounded-xl">{actionError}</div>}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 shrink-0">
        <div className="bg-surface rounded-2xl p-4 border border-white/[0.03]">
          <div className="flex items-center justify-between text-textTertiary text-xs mb-1">
            <span>Active on Login</span>
            <span className="w-1.5 h-1.5 rounded-full bg-textPrimary" />
          </div>
          <div className="text-2xl font-medium text-textPrimary font-mono tabular-nums">
            {status === 'ready' ? stats.enabledCount : '—'}
          </div>
          <div className="text-[11px] text-textTertiary mt-0.5 font-mono">
            {status === 'ready' ? `${stats.disabledCount} disabled in background` : 'Status unavailable'}
          </div>
        </div>

        <div className="bg-surface rounded-2xl p-4 border border-white/[0.03]">
          <div className="flex items-center justify-between text-textTertiary text-xs mb-1">
            <span>High Impact Load</span>
            <span className="text-[10px] font-mono text-textSecondary bg-surfaceSubtle px-1.5 py-0.5 rounded">
              Estimated
            </span>
          </div>
          <div className="text-2xl font-medium text-textPrimary font-mono tabular-nums">
            {status === 'ready' ? stats.highImpactCount : '—'}
          </div>
          <div className="text-[11px] text-textTertiary mt-0.5 font-mono">
            Impact estimate based on app and command names
          </div>
        </div>

        <div className="bg-surface rounded-2xl p-4 border border-white/[0.03]">
          <div className="flex items-center justify-between text-textTertiary text-xs mb-1">
            <span>Estimated Startup Load</span>
            <Sparkles className="w-3.5 h-3.5 text-textSecondary" />
          </div>
          <div className="text-base font-medium text-textPrimary truncate">
              {status === 'ready' ? bootEvaluation.label : 'Status unavailable'}
          </div>
          <div className="text-[11px] text-textTertiary mt-0.5 font-mono truncate">
              {status === 'ready' ? bootEvaluation.description : 'Load startup items to estimate impact'}
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 shrink-0">
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          <button
            onClick={() => setFilter('all')}
            aria-pressed={filter === 'all'}
            className={`px-3 py-1.5 rounded-xl text-xs transition-colors shrink-0 ${
              filter === 'all'
                ? 'bg-surfaceSubtle text-textPrimary font-medium border border-white/10'
                : 'bg-surface text-textSecondary hover:text-textPrimary border border-white/[0.02]'
            }`}
          >
            All Items ({status === 'ready' ? items.length : '—'})
          </button>
          <button
            onClick={() => setFilter('user')}
            aria-pressed={filter === 'user'}
            className={`px-3 py-1.5 rounded-xl text-xs transition-colors shrink-0 ${
              filter === 'user'
                ? 'bg-surfaceSubtle text-textPrimary font-medium border border-white/10'
                : 'bg-surface text-textSecondary hover:text-textPrimary border border-white/[0.02]'
            }`}
          >
            User Apps ({status === 'ready' ? stats.userCount : '—'})
          </button>
          <button
            onClick={() => setFilter('system')}
            aria-pressed={filter === 'system'}
            className={`px-3 py-1.5 rounded-xl text-xs transition-colors shrink-0 ${
              filter === 'system'
                ? 'bg-surfaceSubtle text-textPrimary font-medium border border-white/10'
                : 'bg-surface text-textSecondary hover:text-textPrimary border border-white/[0.02]'
            }`}
          >
            System Daemons ({status === 'ready' ? stats.systemCount : '—'})
          </button>
          <button
            onClick={() => setFilter('high')}
            aria-pressed={filter === 'high'}
            className={`px-3 py-1.5 rounded-xl text-xs transition-colors shrink-0 ${
              filter === 'high'
                ? 'bg-surfaceSubtle text-textPrimary font-medium border border-white/10'
                : 'bg-surface text-textSecondary hover:text-textPrimary border border-white/[0.02]'
            }`}
          >
            High Impact ({status === 'ready' ? stats.highImpactCount : '—'})
          </button>
          <button
            onClick={() => setFilter('enabled')}
            aria-pressed={filter === 'enabled'}
            className={`px-3 py-1.5 rounded-xl text-xs transition-colors shrink-0 ${
              filter === 'enabled'
                ? 'bg-surfaceSubtle text-textPrimary font-medium border border-white/10'
                : 'bg-surface text-textSecondary hover:text-textPrimary border border-white/[0.02]'
            }`}
          >
            Enabled ({status === 'ready' ? stats.enabledCount : '—'})
          </button>
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          <div className="relative flex-1 sm:flex-initial">
            <Search className="w-3.5 h-3.5 text-textTertiary absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              ref={searchInputRef}
              type="text"
              aria-label="Filter startup apps"
              placeholder="Filter startup apps..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-surface border border-white/[0.03] rounded-xl pl-8 pr-7 py-1.5 text-xs text-textPrimary placeholder:text-textTertiary focus:outline-none focus:border-white/20 transition-colors w-full sm:w-56"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-textTertiary hover:text-textPrimary p-0.5"
                aria-label="Clear filter query"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          <button
            onClick={() => {
              if (sortField === 'name') setSortOrder((o) => (o === 'asc' ? 'desc' : 'asc'));
              else {
                setSortField('name');
                setSortOrder('asc');
              }
            }}
            aria-label={`Sort startup items by name, ${sortField === 'name' && sortOrder === 'asc' ? 'ascending' : 'descending'}`}
            aria-pressed={sortField === 'name'}
            className={`px-2.5 py-1.5 rounded-xl border border-white/[0.03] text-xs flex items-center space-x-1.5 transition-colors ${
              sortField === 'name' ? 'bg-surfaceSubtle text-textPrimary' : 'bg-surface text-textSecondary hover:text-textPrimary'
            }`}
            title="Sort alphabetically"
          >
            <ArrowUpDown className="w-3 h-3" />
            <span className="hidden sm:inline font-mono text-[11px]">Sort</span>
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-4 min-h-0 pr-0.5">
        {status === 'loading' ? (
          <div role="status" className="bg-surface rounded-2xl p-12 text-center text-xs text-textTertiary">Loading startup items…</div>
        ) : status === 'error' ? (
          <div role="alert" className="bg-surface rounded-2xl p-12 text-center text-xs text-textTertiary">Unable to load startup items. Refresh to try again.</div>
        ) : filteredAndSorted.length === 0 ? (
          <div className="bg-surface rounded-2xl p-12 text-center text-xs text-textTertiary font-mono flex flex-col items-center justify-center space-y-2 border border-white/[0.03]">
            <Layers className="w-6 h-6 text-textSecondary" />
            <span className="text-textPrimary font-medium text-sm">No Startup Items Match</span>
            <span>No registered items match the current search query or filter selection.</span>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="mt-2 px-3 py-1.5 rounded-xl bg-surfaceSubtle text-textPrimary hover:bg-surfaceHover transition-colors font-sans"
              >
                Clear Search
              </button>
            )}
          </div>
        ) : shouldGroup ? (
          <>
            {userItems.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between px-1">
                  <span className="text-xs font-medium text-textPrimary tracking-tight">
                    User Applications
                  </span>
                  <span className="text-[11px] font-mono text-textTertiary">
                    {userItems.length} items
                  </span>
                </div>
                <div className="bg-surface rounded-2xl border border-white/[0.03] divide-y divide-white/[0.02] overflow-hidden">
                  {userItems.map(renderItemRow)}
                </div>
              </div>
            )}

            {systemItems.length > 0 && (
              <div className="space-y-2 pt-2">
                <div className="flex items-center justify-between px-1">
                  <span className="text-xs font-medium text-textPrimary tracking-tight">
                    System Services & Daemons
                  </span>
                  <span className="text-[11px] font-mono text-textTertiary">
                    {systemItems.length} items
                  </span>
                </div>
                <div className="bg-surface rounded-2xl border border-white/[0.03] divide-y divide-white/[0.02] overflow-hidden">
                  {systemItems.map(renderItemRow)}
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="bg-surface rounded-2xl border border-white/[0.03] divide-y divide-white/[0.02] overflow-hidden">
            {filteredAndSorted.map(renderItemRow)}
          </div>
        )}
      </div>

      <div className="px-4 py-2.5 bg-surface rounded-2xl border border-white/[0.03] flex items-center justify-between text-xs shrink-0 select-none">
        <div className="text-textTertiary text-[11px] font-mono truncate mr-2">
          Disabling non-essential startup tasks preserves boot speed and background system memory.
        </div>
        <span className="text-[11px] font-mono text-textSecondary shrink-0">
          {status === 'ready' ? `${stats.enabledCount} of ${items.length} Active` : 'Startup status unavailable'}
        </span>
      </div>
    </div>
  );
};
