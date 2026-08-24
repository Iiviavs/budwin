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
      {/* Brand */}
      <div className="flex items-center space-x-3">
        <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-sky-500 to-emerald-400 flex items-center justify-center text-white font-bold text-sm shadow-md shadow-sky-500/20">
          ⚡
        </div>
        <div className="flex items-center space-x-2">
          <span className="font-bold text-base text-white tracking-tight">budwin</span>
          <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-sky-500/10 text-sky-400 border border-sky-500/20">
            v1.1
          </span>
        </div>
      </div>

      {/* Tabs */}
      <nav className="flex items-center space-x-1 bg-background/60 p-1 rounded-lg border border-border/50">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-150 ${
                isActive
                  ? 'bg-surface text-white shadow-sm border border-border/80'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-surfaceHover/50'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Window Controls */}
      <div className="flex items-center space-x-1">
        {onMinimize && (
          <button
            onClick={onMinimize}
            className="w-7 h-7 rounded hover:bg-surfaceHover flex items-center justify-center text-gray-400 hover:text-white transition-colors"
          >
            <Minimize2 className="w-3.5 h-3.5" />
          </button>
        )}
        {onClose && (
          <button
            onClick={onClose}
            className="w-7 h-7 rounded hover:bg-rose-500/20 hover:text-rose-400 flex items-center justify-center text-gray-400 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </header>
  );
};
