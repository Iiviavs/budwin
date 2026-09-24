import React from 'react';
import { Minus, Square, X, Zap, Sun, Moon, PictureInPicture2 } from 'lucide-react';

interface TitlebarProps {
  timerActive: boolean;
  powerPlan: string;
  isMiniMode: boolean;
  themeMode: 'dark' | 'light';
  onToggleThemeMode: () => void;
  onToggleMini: () => void;
  onMinimize: () => void;
  onMaximize: () => void;
  onClose: () => void;
}

export const Titlebar: React.FC<TitlebarProps> = ({
  timerActive,
  powerPlan,
  isMiniMode,
  themeMode,
  onToggleThemeMode,
  onToggleMini,
  onMinimize,
  onMaximize,
  onClose,
}) => {
  return (
    <div className="h-10 bg-sidebar flex items-center justify-between px-3 select-none draggable text-xs transition-colors duration-150 relative">
      <div className="flex items-center space-x-2.5 non-draggable pl-0.5">
        <div className="w-[18px] h-[18px] rounded-[5px] overflow-hidden bg-surfaceSubtle flex items-center justify-center shrink-0">
          <img src="/logo.png" alt="logo" className="w-full h-full object-cover scale-110" />
        </div>
        <div className="flex items-center space-x-1.5">
          <span className="font-medium text-[13px] tracking-tight text-textPrimary">budwin</span>
          <span className="text-[10px] font-mono text-textTertiary opacity-60">
            v1.9.4
          </span>
        </div>
      </div>

      <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 items-center space-x-2.5 px-3 py-1 rounded-full bg-surface/50 text-[11px] non-draggable transition-colors hover:bg-surface cursor-default">
        <span className="w-1.5 h-1.5 rounded-full bg-textPrimary/80 shrink-0" />
        <span className="font-medium text-textPrimary tracking-tight">{powerPlan}</span>
        <span className="w-px h-2.5 bg-textTertiary/20" />
        <span className="flex items-center space-x-1 font-mono text-textSecondary">
          <Zap className="w-3 h-3 text-textTertiary" />
          <span>{timerActive ? '1.0ms' : '15.6ms'}</span>
        </span>
      </div>

      <div className="flex items-center space-x-0.5 non-draggable">
        <button
          onClick={onToggleThemeMode}
          className="w-7 h-7 rounded-lg flex items-center justify-center text-textTertiary hover:text-textPrimary hover:bg-surfaceHover active:scale-95 transition-all"
          title={themeMode === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
          aria-label="Toggle theme"
        >
          {themeMode === 'dark' ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
        </button>

        <button
          onClick={onToggleMini}
          className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all active:scale-95 ${
            isMiniMode
              ? 'text-textPrimary bg-surface font-medium'
              : 'text-textTertiary hover:text-textPrimary hover:bg-surfaceHover'
          }`}
          title={isMiniMode ? 'Switch to full view' : 'Switch to mini companion view'}
          aria-label="Toggle view mode"
        >
          <PictureInPicture2 className="w-3.5 h-3.5" />
        </button>

        <span className="w-px h-3.5 bg-textTertiary/20 mx-1" />

        <button
          onClick={onMinimize}
          className="w-7 h-7 rounded-lg flex items-center justify-center text-textTertiary hover:text-textPrimary hover:bg-surfaceHover active:scale-95 transition-all"
          title="Minimize"
          aria-label="Minimize"
        >
          <Minus className="w-3.5 h-3.5" strokeWidth={1.75} />
        </button>

        <button
          onClick={onMaximize}
          className="w-7 h-7 rounded-lg flex items-center justify-center text-textTertiary hover:text-textPrimary hover:bg-surfaceHover active:scale-95 transition-all"
          title="Maximize"
          aria-label="Maximize"
        >
          <Square className="w-3 h-3" strokeWidth={1.75} />
        </button>

        <button
          onClick={onClose}
          className="w-7 h-7 rounded-lg flex items-center justify-center text-textTertiary hover:text-textPrimary hover:bg-white/[0.08] active:scale-95 transition-all"
          title="Close to system tray"
          aria-label="Close"
        >
          <X className="w-3.5 h-3.5" strokeWidth={1.75} />
        </button>
      </div>
    </div>
  );
};
