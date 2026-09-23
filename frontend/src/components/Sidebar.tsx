import React from 'react';
import { Activity, Cpu, HardDrive, Sparkles, Power, Settings, Pin, Trophy, MousePointer } from 'lucide-react';
import { BuddyMascot } from './BuddyMascot';
import { TelemetrySnapshot } from '../types';

export type TabType = 'overview' | 'processes' | 'storage' | 'optimizer' | 'startup' | 'benchmark' | 'inputlab' | 'settings';

interface SidebarProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  onToggleHud: () => void;
  telemetry: TelemetrySnapshot | null;
  gameBoostActive: boolean;
  activeGameName?: string;
  onQuickPurge?: () => Promise<void>;
  updateInfo?: { hasUpdate: boolean; latestVersion: string } | null;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  onToggleHud,
  telemetry,
  gameBoostActive,
  activeGameName,
  onQuickPurge,
  updateInfo,
}) => {
  const monitorGroup = [
    { id: 'overview' as TabType, label: 'Dashboard', icon: Activity, shortcut: '1' },
    { id: 'processes' as TabType, label: 'Processes', icon: Cpu, shortcut: '2' },
    { id: 'storage' as TabType, label: 'Storage', icon: HardDrive, shortcut: '3' },
  ];

  const tuningGroup = [
    { id: 'optimizer' as TabType, label: 'Optimizer', icon: Sparkles, shortcut: '4' },
    { id: 'startup' as TabType, label: 'Startup Apps', icon: Power, shortcut: '5' },
    { id: 'benchmark' as TabType, label: 'Benchmark', icon: Trophy, shortcut: '6' },
    { id: 'inputlab' as TabType, label: 'Input Lab', icon: MousePointer, shortcut: '7' },
  ];

  const renderNavItem = (item: { id: TabType; label: string; icon: React.ElementType; shortcut?: string }) => {
    const isActive = activeTab === item.id;
    const Icon = item.icon;
    const hasUpdateBadge = item.id === 'settings' && updateInfo?.hasUpdate;

    return (
      <button
        key={item.id}
        onClick={() => setActiveTab(item.id)}
        className={`w-full group flex items-center justify-between px-2.5 py-1.5 rounded-[10px] text-[13px] transition-all duration-120 select-none active:scale-[0.98] ${
          isActive
            ? 'bg-surface text-textPrimary font-medium'
            : 'text-textSecondary hover:text-textPrimary hover:bg-surfaceHover/70 font-normal'
        }`}
      >
        <div className="flex items-center space-x-2.5 min-w-0">
          <span
            className={`w-5 h-5 flex items-center justify-center shrink-0 transition-colors duration-120 ${
              isActive
                ? 'text-textPrimary'
                : 'text-textTertiary group-hover:text-textSecondary'
            }`}
          >
            <Icon className="w-4 h-4" strokeWidth={isActive ? 2 : 1.75} />
          </span>
          <span className="truncate tracking-[-0.01em]">{item.label}</span>
        </div>

        <div className="flex items-center space-x-1.5 shrink-0 ml-2">
          {hasUpdateBadge && (
            <span className="text-[9px] font-mono font-medium px-1.5 py-0.5 rounded bg-surfaceSubtle text-textSecondary">
              UPDATE
            </span>
          )}
          {item.shortcut && (
            <span
              className={`text-[10px] font-mono transition-opacity duration-100 ${
                isActive
                  ? 'text-textTertiary'
                  : 'text-textTertiary opacity-0 group-hover:opacity-70'
              }`}
            >
              {item.shortcut}
            </span>
          )}
        </div>
      </button>
    );
  };

  return (
    <aside className="w-60 bg-sidebar flex flex-col justify-between p-3 select-none font-sans transition-colors duration-150">
      <div className="space-y-4">
        <div className="space-y-1">
          <div className="text-[11px] font-medium tracking-wide text-textTertiary/80 uppercase px-2.5 pt-1 pb-1 select-none">
            Monitor
          </div>
          <div className="space-y-0.5">
            {monitorGroup.map(renderNavItem)}
          </div>
        </div>

        <div className="space-y-1">
          <div className="text-[11px] font-medium tracking-wide text-textTertiary/80 uppercase px-2.5 pt-1 pb-1 select-none">
            Tuning
          </div>
          <div className="space-y-0.5">
            {tuningGroup.map(renderNavItem)}
          </div>
        </div>

        <div className="space-y-1">
          <div className="text-[11px] font-medium tracking-wide text-textTertiary/80 uppercase px-2.5 pt-1 pb-1 select-none">
            System
          </div>
          <div className="space-y-0.5">
            {renderNavItem({ id: 'settings', label: 'Preferences', icon: Settings, shortcut: '8' })}
            <button
              onClick={onToggleHud}
              className="w-full group flex items-center justify-between px-2.5 py-1.5 rounded-[10px] text-[13px] text-textSecondary hover:text-textPrimary hover:bg-surfaceHover/70 transition-all duration-120 active:scale-[0.98] font-normal"
              title="Mini Overlay"
            >
              <div className="flex items-center space-x-2.5 min-w-0">
                <span className="w-5 h-5 flex items-center justify-center shrink-0 text-textTertiary group-hover:text-textSecondary transition-colors">
                  <Pin className="w-4 h-4" strokeWidth={1.75} />
                </span>
                <span className="truncate tracking-[-0.01em]">Mini Overlay</span>
              </div>
              <span className="text-[10px] font-mono text-textTertiary opacity-0 group-hover:opacity-70 transition-opacity">
                HUD
              </span>
            </button>
          </div>
        </div>
      </div>

      <div className="pt-3">
        <BuddyMascot
          telemetry={telemetry}
          gameBoostActive={gameBoostActive}
          activeGameName={activeGameName}
          onQuickPurge={onQuickPurge}
        />
      </div>
    </aside>
  );
};
