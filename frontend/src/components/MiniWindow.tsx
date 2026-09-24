import React from 'react';
import { Maximize2, Cpu, Zap, HardDrive, Wifi, ShieldAlert, AlertTriangle, CheckCircle2, XCircle, Pin, Sun, Moon } from 'lucide-react';
import { Sparkline } from './Sparkline';
import { EndProcessModal } from './EndProcessModal';
import { ProcessItem, TelemetrySnapshot } from '../types';

interface MiniWindowProps {
  telemetry: TelemetrySnapshot | null;
  history: { cpu: number[]; gpu: number[]; net: number[] };
  themeMode: 'dark' | 'light';
  timerActive: boolean;
  processes: ProcessItem[];
  targetProcess: ProcessItem | null;
  toggleThemeMode: () => void;
  switchViewMode: (mode: 'full' | 'mini' | 'hud') => void;
  handleToggleTimer: () => void;
  setTargetProcess: (process: ProcessItem | null) => void;
  handleKillProcess: (pid: number) => Promise<void>;
}

export const MiniWindow: React.FC<MiniWindowProps> = ({
  telemetry, history, themeMode, timerActive, processes, targetProcess,
  toggleThemeMode, switchViewMode, handleToggleTimer, setTargetProcess,
  handleKillProcess,
}) => {
  const cpuVal = telemetry ? Math.round(telemetry.cpuPercent) : null;
  const gpuVal = telemetry?.gpu.isAvailable ? Math.round(telemetry.gpu.coreUtilization) : null;
  const ramVal = telemetry ? Math.round(telemetry.ramPercent) : null;
  const netInVal = telemetry ? telemetry.netInKb : null;
  const formatSpeed = (kb: number) => kb >= 1024 ? `${(kb / 1024).toFixed(1)} MB/s` : `${Math.round(kb)} KB/s`;

    return (
      <div className="h-screen w-screen bg-background text-textPrimary flex flex-col justify-between p-3 select-none font-sans rounded-xl overflow-hidden transition-colors duration-150 border border-border">
        <div className="flex items-center justify-between pb-2 border-b border-border draggable">
          <div className="flex items-center space-x-2 non-draggable">
            <div className="w-6 h-6 rounded-full overflow-hidden bg-surfaceSubtle border border-border flex items-center justify-center">
              <img src="/logo.png" alt="logo" className="w-full h-full object-cover scale-110" />
            </div>
            <div>
              <span className="font-semibold text-xs text-textPrimary block leading-tight">budwin</span>
              <span className="text-[9px] text-textTertiary font-mono">Companion</span>
            </div>
          </div>

          <div className="flex items-center space-x-1 non-draggable">
            <button
              onClick={toggleThemeMode}
              className="p-1 rounded-lg hover:bg-surfaceSubtle text-textSecondary hover:text-textPrimary transition-colors"
              title="Toggle theme"
              aria-label="Toggle theme"
            >
              {themeMode === 'dark' ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
            </button>
            <button
              onClick={() => switchViewMode('hud')}
              className="p-1 rounded-lg hover:bg-surfaceSubtle text-textSecondary hover:text-textPrimary transition-colors"
              title="Pin overlay"
              aria-label="Pin overlay"
            >
              <Pin className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => switchViewMode('full')}
              className="flex items-center space-x-1 px-2 py-0.5 rounded-lg bg-surface hover:bg-surfaceHover border border-border text-textPrimary text-[11px] font-medium transition-colors"
              title="Expand"
            >
              <span>Expand</span>
              <Maximize2 className="w-3 h-3" />
            </button>
            <button
              onClick={() => window.runtime?.WindowHide?.()}
              className="w-6 h-6 rounded-lg flex items-center justify-center text-textSecondary hover:text-textPrimary hover:bg-surfaceHover transition-colors text-xs"
              title="Close to tray"
              aria-label="Close to tray"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 my-2">
          <div className="glass-card rounded-xl p-2.5 flex flex-col justify-between">
            <div className="flex justify-between items-center text-xs">
              <span className="flex items-center space-x-1 font-medium text-textSecondary text-[11px]">
                <Cpu className="w-3 h-3" />
                <span>CPU</span>
              </span>
              <span className="font-mono font-semibold text-textPrimary text-xs">{cpuVal === null ? '—' : `${cpuVal}%`}</span>
            </div>
            <div className="my-1">
              <Sparkline data={history.cpu} max={100} gradientId="miniCpu" height={24} />
            </div>
            <span className="text-[9px] font-mono text-textTertiary">60s Trend</span>
          </div>

          <div className="glass-card rounded-xl p-2.5 flex flex-col justify-between">
            <div className="flex justify-between items-center text-xs">
              <span className="flex items-center space-x-1 font-medium text-textSecondary text-[11px]">
                <Zap className="w-3 h-3" />
                <span>GPU</span>
              </span>
              <span className="font-mono font-semibold text-textPrimary text-xs">
                {telemetry?.gpu.isAvailable ? `${gpuVal}%` : '—'}
              </span>
            </div>
            <div className="my-1">
              <Sparkline data={history.gpu} max={100} gradientId="miniGpu" height={24} />
            </div>
            <span className="text-[9px] font-mono text-textTertiary">
              {telemetry?.gpu.isAvailable ? `${telemetry.gpu.temperatureC}°C` : 'Inactive'}
            </span>
          </div>

          <div className="glass-card rounded-xl p-2.5 flex flex-col justify-between">
            <div className="flex justify-between items-center text-xs">
              <span className="flex items-center space-x-1 font-medium text-textSecondary text-[11px]">
                <HardDrive className="w-3 h-3" />
                <span>RAM</span>
              </span>
              <span className="font-mono font-semibold text-textPrimary text-xs">{ramVal === null ? '—' : `${ramVal}%`}</span>
            </div>
            <div className="w-full bg-surfaceSubtle h-1 rounded-full overflow-hidden my-1.5 border border-border">
              <div className="bg-textSecondary h-full rounded-full" style={{ width: `${ramVal ?? 0}%` }} />
            </div>
            <span className="text-[9px] font-mono text-textTertiary truncate">
              {telemetry ? `${telemetry.ramUsedGb.toFixed(1)} / ${telemetry.ramTotalGb.toFixed(0)} GB` : '—'}
            </span>
          </div>

          <div className="glass-card rounded-xl p-2.5 flex flex-col justify-between">
            <div className="flex justify-between items-center text-xs">
              <span className="flex items-center space-x-1 font-medium text-textSecondary text-[11px]">
                <Wifi className="w-3 h-3" />
                <span>NET</span>
              </span>
              <span className="font-mono font-semibold text-textPrimary text-[11px] truncate">{netInVal === null ? '—' : formatSpeed(netInVal)}</span>
            </div>
            <div className="my-1">
              <Sparkline data={history.net} max={3000} gradientId="miniNet" height={24} />
            </div>
            <span className="text-[9px] font-mono text-textTertiary">Bandwidth</span>
          </div>
        </div>

        <div className="bg-surfaceSubtle rounded-xl p-2 flex items-center justify-between text-xs">
          <div className="flex items-center space-x-2">
            <Zap className="w-3.5 h-3.5 text-textSecondary" />
            <span className="text-[11px] font-medium text-textPrimary">Kernel Timer: {timerActive ? '1.0ms' : '15.6ms'}</span>
          </div>
          <button
            onClick={handleToggleTimer}
            className={`px-2 py-0.5 rounded text-[10px] font-mono font-medium transition-colors ${
              timerActive
                ? 'bg-surface text-textPrimary'
                : 'bg-transparent text-textTertiary hover:text-textPrimary'
            }`}
          >
            {timerActive ? 'ACTIVE' : 'OFF'}
          </button>
        </div>

        <div className="bg-surface rounded-xl p-2.5 flex-1 flex flex-col justify-between overflow-hidden my-2">
          <div className="text-[9px] font-medium text-textTertiary uppercase tracking-wider mb-1">
            Active Applications
          </div>

          <div className="space-y-1 overflow-y-auto">
            {processes.slice(0, 3).map((proc) => {
              const isProtected = proc.category === 'protected';
              const isBackground = proc.category === 'background';

              return (
                <div key={proc.pid} className="flex items-center justify-between p-1.5 rounded-lg bg-surfaceSubtle text-xs">
                  <div className="flex items-center space-x-2 truncate">
                    <span className="shrink-0 text-textSecondary">
                      {isProtected ? (
                        <ShieldAlert className="w-3.5 h-3.5" />
                      ) : isBackground ? (
                        <AlertTriangle className="w-3.5 h-3.5" />
                      ) : (
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      )}
                    </span>
                    <span className="text-textPrimary font-medium truncate text-[11px]">{proc.name}</span>
                  </div>

                  <div className="flex items-center space-x-2 shrink-0">
                    <span className="font-mono text-textTertiary text-[10px]">{proc.memoryMb.toFixed(0)} MB</span>
                    <button
                      onClick={() => setTargetProcess(proc)}
                      disabled={isProtected}
                      aria-label={`End process ${proc.name}`}
                      className={`p-0.5 rounded ${
                        isProtected ? 'text-textTertiary opacity-30 cursor-not-allowed' : 'text-textSecondary hover:text-textPrimary'
                      }`}
                    >
                      <XCircle className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <button
            onClick={() => switchViewMode('full')}
            className="w-full mt-1.5 py-1.5 rounded-lg bg-surfaceSubtle hover:bg-surfaceHover text-center text-xs font-medium text-textPrimary transition-colors"
          >
            Open Full Dashboard ↗
          </button>
        </div>

        <EndProcessModal
          process={targetProcess}
          onClose={() => setTargetProcess(null)}
          onConfirm={handleKillProcess}
        />
      </div>
    );
};
