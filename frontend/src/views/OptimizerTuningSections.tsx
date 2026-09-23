import React from 'react';
import { CheckCircle2, Loader2, Zap, MousePointer2, Gamepad2, Headphones, Wind, VolumeX, MonitorPlay } from 'lucide-react';
import { SilentModeStatus } from '../types';

interface OptimizerTuningSectionsProps {
  silentMode: SilentModeStatus | null;
  silentResult: string | null;
  togglingSilent: boolean;
  onToggleSilentMode: () => Promise<void>;
  fpsResult: string | null;
  applyingFps: boolean;
  onApplyFps: () => Promise<void>;
  timerActive: boolean;
  lagResult: string | null;
  onOptimizeLatency: () => Promise<void>;
  onToggleTimer: () => Promise<void>;
  audioResult: string | null;
  onOptimizeAudio: () => Promise<void>;
}

export const OptimizerTuningSections: React.FC<OptimizerTuningSectionsProps> = (props) => {
  const { silentMode, silentResult, togglingSilent, onToggleSilentMode: handleToggleSilentMode,
    fpsResult, applyingFps, onApplyFps: handleApplyFpsMaxer, timerActive, lagResult,
    onOptimizeLatency: handleOptimizeAllLatency, onToggleTimer: handleToggleTimer,
    audioResult, onOptimizeAudio: handleOptimizeAudio } = props;
  return (
    <>
      <div className="bg-surface rounded-2xl p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3.5">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
              silentMode?.isSilentModeActive
                ? 'bg-textPrimary text-background'
                : 'bg-surfaceSubtle text-textSecondary'
            }`}>
              <Wind className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-sm font-semibold text-textPrimary">Quiet CPU Profile</h3>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded-md ${
                  silentMode?.isSilentModeActive
                    ? 'bg-surfaceSubtle text-textPrimary'
                    : 'bg-surfaceSubtle text-textTertiary'
                }`}>
                  {silentMode ? (silentMode.isSilentModeActive ? 'SILENT ON' : 'OFF') : 'UNKNOWN'}
                </span>
              </div>
              <p className="text-xs text-textSecondary mt-0.5">
                Lowers CPU idle voltages and disables aggressive turbo spikes to eliminate vent noise
              </p>
            </div>
          </div>

          <button
            onClick={handleToggleSilentMode}
            disabled={togglingSilent || !silentMode}
            className={`px-4 py-2 rounded-xl text-xs font-medium transition-all flex items-center space-x-2 active:scale-[0.96] ${
              silentMode?.isSilentModeActive
                ? 'bg-surfaceSubtle text-textPrimary'
                : 'bg-surfaceSubtle hover:bg-surfaceHover text-textPrimary'
            }`}
          >
            {togglingSilent ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : silentMode?.isSilentModeActive ? (
              <VolumeX className="w-3.5 h-3.5" />
            ) : (
              <MonitorPlay className="w-3.5 h-3.5" />
            )}
            <span>{silentMode ? (silentMode.isSilentModeActive ? 'RESTORE TURBO' : 'QUIET VENTS') : 'STATUS UNAVAILABLE'}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 pt-1">
          <div className="bg-surfaceSubtle rounded-xl p-3 flex items-center space-x-2.5">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-textSecondary" />
            <div>
              <span className="text-xs font-medium text-textPrimary block">Acoustic Profile</span>
              <span className="text-[10px] text-textTertiary font-mono">{silentMode ? (silentMode.isSilentModeActive ? 'Quiet Curve' : 'Standard') : 'Unavailable'}</span>
            </div>
          </div>

          <div className="bg-surfaceSubtle rounded-xl p-3 flex items-center space-x-2.5">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-textSecondary" />
            <div>
              <span className="text-xs font-medium text-textPrimary block">Thermal Target</span>
              <span className="text-[10px] text-textTertiary font-mono">{silentMode ? (silentMode.isSilentModeActive ? 'Cooler Profile' : 'Boost Clock') : 'Unavailable'}</span>
            </div>
          </div>

          <div className="bg-surfaceSubtle rounded-xl p-3 flex items-center space-x-2.5">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-textSecondary" />
            <div>
              <span className="text-xs font-medium text-textPrimary block">Encode Engine</span>
              <span className="text-[10px] text-textTertiary font-mono">{silentMode ? (silentMode.isSilentModeActive ? 'Eco Mode' : 'Standard') : 'Unavailable'}</span>
            </div>
          </div>
        </div>

        {silentResult && (
          <div className="p-3 rounded-xl bg-surfaceSubtle text-textPrimary text-xs flex items-center space-x-2 font-mono animate-fade-in">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-textSecondary" />
            <span>{silentResult}</span>
          </div>
        )}
      </div>

      <div className="bg-surface rounded-2xl p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3.5">
            <div className="w-10 h-10 rounded-xl bg-surfaceSubtle flex items-center justify-center text-textSecondary">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-sm font-semibold text-textPrimary">CPU Core Unparker & Scheduling</h3>
              </div>
              <p className="text-xs text-textSecondary mt-0.5">
                Requests Windows power and graphics scheduling changes.
              </p>
            </div>
          </div>

          <button
            onClick={handleApplyFpsMaxer}
            disabled={applyingFps}
            className="px-4 py-2 rounded-xl bg-surfaceSubtle hover:bg-surfaceHover text-textPrimary text-xs font-medium transition-all flex items-center space-x-2 active:scale-[0.96]"
          >
            {applyingFps ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5" />}
            <span>Maximize Compute</span>
          </button>
        </div>

        {fpsResult && (
          <div className="p-3 rounded-xl bg-surfaceSubtle text-textPrimary text-xs flex items-center space-x-2 font-mono animate-fade-in">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-textSecondary" />
            <span>{fpsResult}</span>
          </div>
        )}
      </div>

      <div className="bg-surface rounded-2xl p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3.5">
            <div className="w-10 h-10 rounded-xl bg-surfaceSubtle flex items-center justify-center text-textSecondary">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-sm font-semibold text-textPrimary">Input Latency Reducer</h3>
              </div>
              <p className="text-xs text-textSecondary mt-0.5">
                Requests a high precision timer and raw mouse input settings
              </p>
            </div>
          </div>

          <button
            onClick={handleOptimizeAllLatency}
            className="px-3.5 py-2 rounded-xl bg-surfaceSubtle hover:bg-surfaceHover text-textPrimary text-xs font-medium transition-all active:scale-[0.96]"
          >
            Apply Latency Fixes
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 pt-1">
          <div className="bg-surfaceSubtle rounded-xl p-3 flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <Zap className="w-4 h-4 text-textSecondary" />
              <div>
                <span className="text-xs font-medium text-textPrimary block">Timer Resolution</span>
                <span className="text-[10px] text-textTertiary font-mono">1.0ms or system default</span>
              </div>
            </div>
            <button
              onClick={handleToggleTimer}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-mono transition-all active:scale-[0.96] ${
                timerActive
                  ? 'bg-surface text-textPrimary'
                  : 'bg-transparent text-textTertiary hover:text-textPrimary'
              }`}
            >
              {timerActive ? 'ENABLED' : 'DISABLED'}
            </button>
          </div>

          <div className="bg-surfaceSubtle rounded-xl p-3 flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <MousePointer2 className="w-4 h-4 text-textSecondary" />
              <div>
                <span className="text-xs font-medium text-textPrimary block">Raw Mouse Input</span>
                <span className="text-[10px] text-textTertiary font-mono">Windows mouse settings</span>
              </div>
            </div>
          </div>

          <div className="bg-surfaceSubtle rounded-xl p-3 flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <Gamepad2 className="w-4 h-4 text-textSecondary" />
              <div>
                <span className="text-xs font-medium text-textPrimary block">Queue Bypass</span>
                <span className="text-[10px] text-textTertiary font-mono">Lower Latency</span>
              </div>
            </div>
          </div>
        </div>

        {lagResult && (
          <div className="p-3 rounded-xl bg-surfaceSubtle text-textPrimary text-xs flex items-center space-x-2 font-mono animate-fade-in">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-textSecondary" />
            <span>{lagResult}</span>
          </div>
        )}
      </div>

      <div className="bg-surface rounded-2xl p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3.5">
            <div className="w-10 h-10 rounded-xl bg-surfaceSubtle flex items-center justify-center text-textSecondary">
              <Headphones className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-sm font-semibold text-textPrimary">Audio Latency & Buffer</h3>
              </div>
              <p className="text-xs text-textSecondary mt-0.5">
                Updates Windows MMCSS priority settings.
              </p>
            </div>
          </div>

          <button
            onClick={handleOptimizeAudio}
            className="px-3.5 py-2 rounded-xl bg-surfaceSubtle hover:bg-surfaceHover text-textPrimary text-xs font-medium transition-all active:scale-[0.96]"
          >
            Apply Audio Optimizer
          </button>
        </div>

        {audioResult && (
          <div className="p-3 rounded-xl bg-surfaceSubtle text-textPrimary text-xs flex items-center space-x-2 font-mono animate-fade-in">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-textSecondary" />
            <span>{audioResult}</span>
          </div>
        )}
      </div>
    </>
  );
};
