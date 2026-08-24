import React from 'react';
import { Activity, Cpu, HardDrive, Sparkles } from 'lucide-react';
import { TabType } from './Navbar';

interface SidebarProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const items = [
    { id: 'overview', label: 'Dashboard', icon: <Activity className="w-4 h-4" /> },
    { id: 'processes', label: 'Processes', icon: <Cpu className="w-4 h-4" /> },
    { id: 'storage', label: 'Storage', icon: <HardDrive className="w-4 h-4" /> },
    { id: 'optimizer', label: 'Optimizer', icon: <Sparkles className="w-4 h-4" /> },
  ];

  return (
    <aside className="w-56 bg-sidebar border-r border-border flex flex-col justify-between p-3 select-none">
      <div className="space-y-6">
        {/* Navigation list */}
        <div className="space-y-1.5 pt-2">
          {items.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as TabType)}
                className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 ${
                  isActive
                    ? 'bg-surfaceActive text-white border border-border shadow-md shadow-black/20'
                    : 'text-gray-400 hover:text-gray-200 hover:bg-surfaceHover/60'
                }`}
              >
                <span className={isActive ? 'text-accent-lime' : 'text-gray-400'}>
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Mascot Card at bottom of sidebar */}
      <div className="bg-surface/90 border border-border rounded-2xl p-3 flex items-center space-x-3">
        <div className="w-9 h-9 rounded-full overflow-hidden border border-accent-lime/40 shrink-0 bg-background shadow-sm">
          <img src="/logo.png" alt="budwin mascot" className="w-full h-full object-cover scale-110" />
        </div>
        <div className="overflow-hidden">
          <span className="font-bold text-xs text-white block truncate leading-tight">Buddy Companion</span>
          <span className="text-[10px] text-accent-lime font-medium">Ready & Protecting</span>
        </div>
      </div>
    </aside>
  );
};
