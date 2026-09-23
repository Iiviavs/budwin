import React from 'react';
import { Activity, Cpu, HardDrive, Sparkles, X, Minimize2 } from 'lucide-react';

export type TabType = 'overview' | 'processes' | 'storage' | 'optimizer';

interface NavbarProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  onMinimize?: () => void;
  onClose?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onMinimize,
  onClose,
}) => {
  const tabs = [
    { id: 'overview', label: 'Dashboard', icon: <Activity className="w-4 h-4" /> },
    { id: 'processes', label: 'Processes', icon: <Cpu className="w-4 h-4" /> },
    { id: 'storage', label: 'Storage', icon: <HardDrive className="w-4 h-4" /> },
    { id: 'optimizer', label: 'Optimizer', icon: <Sparkles className="w-4 h-4" /> },
  ];

  return (
    <header className="h-14 border-b border-border bg-surface/80 backdrop-blur-md px-4 flex items-center justify-between select-none">
      <div className="flex items-center space-x-3">
        <div className="w-8 h-8 rounded-full overflow-hidden border border-border shadow-sm bg-surfaceSubtle flex items-center justify-center">
          <img src="/logo.png" alt="logo" className="w-full h-full object-cover scale-110" />
        </div>
        <div className="flex items-center space-x-2">
          <span className="font-semibold text-base text-textPrimary tracking-tight">budwin</span>
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-surfaceSubtle text-textSecondary border border-border">
            v1.6
          </span>
        </div>
      </div>

      <nav className="flex items-center space-x-1 bg-surfaceSubtle p-1 rounded-xl border border-border">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all active:scale-[0.96] ${
                isActive
                  ? 'bg-surface text-textPrimary border border-borderFocus'
                  : 'text-textSecondary hover:text-textPrimary hover:bg-surfaceHover'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="flex items-center space-x-2">
        {onMinimize && (
          <button
            onClick={onMinimize}
            className="flex items-center space-x-1 px-2.5 py-1.5 rounded-xl bg-surface hover:bg-surfaceHover border border-border text-textPrimary text-xs font-medium transition-all active:scale-[0.96]"
            title="Switch to Compact Mini View"
          >
            <Minimize2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Mini View</span>
          </button>
        )}
        {onClose && (
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-xl hover:bg-surfaceSubtle hover:text-textPrimary flex items-center justify-center text-textSecondary transition-all active:scale-[0.9]"
            title="Minimize to Tray"
            aria-label="Close"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </header>
  );
};
