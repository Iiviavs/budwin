import React from 'react';
import { Minus, Square, X, Zap } from 'lucide-react';

interface TitlebarProps {
  timerActive: boolean;
  powerPlan: string;
  isMiniMode: boolean;
  onToggleMini: () => void;
  onMinimize: () => void;
  onMaximize: () => void;
  onClose: () => void;
}

export const Titlebar: React.FC<TitlebarProps> = ({
  timerActive,
  powerPlan,
  isMiniMode,
  onToggleMini,
  onMinimize,
  onMaximize,
  onClose,
}) => {
  return (
    <div className="h-10 bg-sidebar border-b border-border/80 flex items-center justify-between px-3.5 select-none draggable text-xs">
      {/* Brand & Mascot */}
      <div className="flex items-center space-x-2.5 non-draggable">
        <div className="w-6 h-6 rounded-full overflow-hidden border border-accent-theme/40 shadow-sm bg-surface">
          <img src="/logo.png" alt="budwin logo" className="w-full h-full object-cover scale-110" />
        </div>
        <span className="font-bold text-sm tracking-tight text-white">budwin</span>
        <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-accent-theme/10 text-accent-theme border border-accent-theme/20">
          v1.5.0
        </span>
      </div>

      {/* Center Status Badges */}
      <div className="hidden md:flex items-center space-x-2 non-draggable">
        <div className="flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-surface border border-border text-[11px]">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-gray-300 font-medium">Power:</span>
          <span className="font-bold text-white">{powerPlan}</span>
        </div>

        <div className="flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-accent-theme/10 border border-accent-theme/30 text-[11px] text-accent-theme font-bold">
          <Zap className="w-3 h-3" />
          <span>{timerActive ? '1.0ms Latency: ON' : '15.6ms Timer'}</span>
        </div>
      </div>

      {/* Window Controls (Discord Style) */}
      <div className="flex items-center space-x-1 non-draggable">
        <button
          onClick={onToggleMini}
          className="px-2 py-1 rounded text-[11px] font-semibold text-gray-400 hover:text-white hover:bg-surfaceHover transition-colors mr-1"
          title="Toggle Mini Companion View"
        >
          {isMiniMode ? 'Full View ↗' : 'Mini Mode ↘'}
        </button>

        {/* Minimize */}
        <button
          onClick={onMinimize}
          className="w-7 h-7 rounded flex items-center justify-center text-gray-400 hover:text-white hover:bg-surfaceHover transition-colors"
          title="Minimize"
        >
          <Minus className="w-3.5 h-3.5" />
        </button>

        {/* Maximize */}
        <button
          onClick={onMaximize}
          className="w-7 h-7 rounded flex items-center justify-center text-gray-400 hover:text-white hover:bg-surfaceHover transition-colors"
          title="Maximize"
        >
          <Square className="w-3 h-3" />
        </button>

        {/* Close to Tray */}
        <button
          onClick={onClose}
          className="w-7 h-7 rounded flex items-center justify-center text-gray-400 hover:text-white hover:bg-rose-500/80 transition-colors"
          title="Close to System Tray"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
