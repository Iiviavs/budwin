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
    <div className="h-10 bg-[#111215] border-b border-white/[0.04] flex items-center justify-between px-3 select-none draggable text-xs">
      {/* Brand & Mascot */}
      <div className="flex items-center space-x-2.5 non-draggable">
        <div className="w-5 h-5 rounded-full overflow-hidden bg-[#18191E]">
          <img src="/logo.png" alt="budwin logo" className="w-full h-full object-cover scale-110" />
        </div>
        <span className="font-bold text-xs tracking-tight text-white">budwin</span>
        <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded bg-white/10 text-neutral-300">
          v1.6.0
        </span>
      </div>

      {/* Center Status Badges */}
      <div className="hidden md:flex items-center space-x-2 non-draggable">
        <div className="flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-[#18191E] text-[11px]">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          <span className="text-neutral-400 font-medium">Power:</span>
          <span className="font-semibold text-white">{powerPlan}</span>
        </div>

        <div className="flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-[#18191E] text-[11px] text-accent-theme font-medium">
          <Zap className="w-3 h-3" />
          <span>{timerActive ? '1.0ms' : '15.6ms'}</span>
        </div>
      </div>

      {/* Window Controls (Raycast / Discord Style) */}
      <div className="flex items-center space-x-1 non-draggable">
        <button
          onClick={onToggleMini}
          className="px-2 py-1 rounded text-[11px] font-medium text-neutral-400 hover:text-white hover:bg-[#18191E] transition-colors mr-1"
          title="Toggle Mini Companion View"
        >
          {isMiniMode ? 'Full ↗' : 'Mini ↘'}
        </button>

        {/* Minimize */}
        <button
          onClick={onMinimize}
          className="w-7 h-7 rounded flex items-center justify-center text-neutral-400 hover:text-white hover:bg-[#18191E] transition-colors"
          title="Minimize"
        >
          <Minus className="w-3.5 h-3.5" />
        </button>

        {/* Maximize */}
        <button
          onClick={onMaximize}
          className="w-7 h-7 rounded flex items-center justify-center text-neutral-400 hover:text-white hover:bg-[#18191E] transition-colors"
          title="Maximize"
        >
          <Square className="w-3 h-3" />
        </button>

        {/* Close to Tray */}
        <button
          onClick={onClose}
          className="w-7 h-7 rounded flex items-center justify-center text-neutral-400 hover:text-white hover:bg-rose-500/80 transition-colors"
          title="Close to System Tray"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
