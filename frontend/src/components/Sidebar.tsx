import React from 'react';
import { Activity, Cpu, HardDrive, Sparkles, Power, Settings, Pin, Trophy } from 'lucide-react';

export type TabType = 'overview' | 'processes' | 'storage' | 'optimizer' | 'startup' | 'benchmark' | 'settings';

interface SidebarProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  onToggleHud: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, onToggleHud }) => {
  const items = [
    { id: 'overview', label: 'Dashboard', icon: <Activity className="w-4 h-4" /> },
    { id: 'processes', label: 'Processes', icon: <Cpu className="w-4 h-4" /> },
    { id: 'storage', label: 'Storage', icon: <HardDrive className="w-4 h-4" /> },
    { id: 'optimizer', label: 'Optimizer', icon: <Sparkles className="w-4 h-4" /> },
    { id: 'startup', label: 'Startup Apps', icon: <Power className="w-4 h-4" /> },
    { id: 'benchmark', label: 'Benchmark', icon: <Trophy className="w-4 h-4" /> },
    { id: 'settings', label: 'Preferences', icon: <Settings className="w-4 h-4" /> },
  ];

  return (
    <aside className="w-52 bg-[#111215] flex flex-col justify-between p-2.5 select-none font-sans border-r border-white/[0.04]">
      <div className="space-y-3">
        {/* Raycast Navigation Item List */}
        <div className="space-y-0.5 pt-1">
          {items.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as TabType)}
                className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-xs transition-colors duration-150 ${
                  isActive
                    ? 'bg-[#24252A] text-white font-semibold'
                    : 'text-neutral-400 hover:text-neutral-200 hover:bg-[#18191E] font-medium'
                }`}
              >
                <span className={isActive ? 'text-white' : 'text-neutral-400'}>
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Discord Game Overlay Toggle Button */}
        <div className="pt-2 border-t border-white/[0.04]">
          <button
            onClick={onToggleHud}
            className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-[#18191E] hover:bg-[#202127] text-xs font-medium text-neutral-300 transition-colors"
            title="Launch Discord Game Overlay"
          >
            <div className="flex items-center space-x-2">
              <Pin className="w-3.5 h-3.5 text-accent-theme" />
              <span>Game Overlay</span>
            </div>
            <span className="text-[10px] font-mono font-bold text-accent-theme bg-accent-theme/15 px-1.5 py-0.5 rounded">
              PIN
            </span>
          </button>
        </div>
      </div>

      {/* Mascot Card at bottom of sidebar */}
      <div className="bg-[#18191E] rounded-xl p-2.5 flex items-center space-x-2.5">
        <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 bg-[#111215]">
          <img src="/logo.png" alt="budwin mascot" className="w-full h-full object-cover scale-110" />
        </div>
        <div className="overflow-hidden">
          <span className="font-bold text-xs text-white block truncate leading-tight">Buddy Companion</span>
          <span className="text-[10px] text-neutral-400 font-medium">Ready & Protecting</span>
        </div>
      </div>
    </aside>
  );
};
