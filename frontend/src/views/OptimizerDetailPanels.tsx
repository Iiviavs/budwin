import React from 'react';
import { RefreshCw, Zap, MousePointer2, Headphones, MonitorPlay, Trash2, Globe, Cpu, Loader2 } from 'lucide-react';
import { AudioLatencyStatus, FpsTweakStatus } from '../types';

interface OptimizerDetailPanelsProps {
  rowStatus: Record<string, string>;
  timerActive: boolean | null;
  handleToggleTimer: () => void;
  optimizingInput: boolean;
  handleOptimizeAllLatency: () => void;
  optimizingAudio: boolean;
  audioStatus: AudioLatencyStatus | null;
  handleOptimizeAudio: () => void;
  applyingFps: boolean;
  fpsStatus: FpsTweakStatus | null;
  handleApplyFpsMaxer: () => void;
  purgingRam: boolean;
  handlePurgeRAM: () => void;
  cleaning: boolean;
  handleCleanTempFiles: () => void;
  flushing: boolean;
  handleFlushDNSCache: () => void;
  activePlan: string;
  handlePowerPlan: (plan: string) => void;
}

export const OptimizerDetailPanels: React.FC<OptimizerDetailPanelsProps> = ({
  rowStatus, timerActive, handleToggleTimer, optimizingInput, handleOptimizeAllLatency, optimizingAudio, audioStatus,
  handleOptimizeAudio, applyingFps, fpsStatus, handleApplyFpsMaxer, purgingRam,
  handlePurgeRAM, cleaning, handleCleanTempFiles, flushing, handleFlushDNSCache,
  activePlan, handlePowerPlan,
}) => (      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-surface rounded-2xl p-5 space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[13px] font-medium text-textPrimary tracking-tight">
                Scheduler & Latency
              </span>
              <span className="text-[11px] font-mono text-textTertiary">
                Real-Time Loops
              </span>
            </div>

            <div className="divide-y divide-white/[0.015]">
              <div className="py-3 flex items-center justify-between hover:bg-surfaceHover/40 px-2 rounded-xl transition-colors">
                <div className="flex items-center space-x-3 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-surfaceSubtle flex items-center justify-center text-textSecondary shrink-0">
                    <Zap className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[13px] font-medium text-textPrimary block tracking-tight">
                      High-precision timer
                    </span>
                    <span className="text-[11px] text-textTertiary font-mono block">
                      {timerActive === null ? 'Status unavailable' : timerActive ? 'Enabled' : 'System default'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-2 shrink-0 ml-2">
                  <button
                    type="button"
                    role="switch"
                    aria-label="Enable high-precision timer"
                    aria-checked={timerActive ?? false}
                    onClick={handleToggleTimer}
                    disabled={timerActive === null}
                    className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-textPrimary disabled:cursor-not-allowed ${
                      timerActive ? 'bg-textPrimary' : 'bg-surfaceSubtle'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-4 w-4 transform rounded-full transition duration-200 ease-in-out mt-0.5 ml-0.5 ${
                        timerActive ? 'translate-x-4 bg-background' : 'translate-x-0 bg-textSecondary'
                      }`}
                    />
                  </button>
                </div>
              </div>

              <div className="py-3 flex items-center justify-between hover:bg-surfaceHover/40 px-2 rounded-xl transition-colors">
                <div className="flex items-center space-x-3 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-surfaceSubtle flex items-center justify-center text-textSecondary shrink-0">
                    <MousePointer2 className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[13px] font-medium text-textPrimary block tracking-tight">
                      Input Queue Pacing
                    </span>
                    <span className="text-[11px] text-textTertiary font-mono block">
                      Windows mouse settings and timer resolution
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-2 shrink-0 ml-2">
                  {rowStatus.input ? (
                    <span className="text-[11px] font-mono text-textPrimary px-2 py-0.5 rounded bg-surfaceSubtle">
                      Done ✓
                    </span>
                  ) : (
                    <button
                      onClick={handleOptimizeAllLatency}
                      disabled={optimizingInput}
                      className="px-3 py-1 rounded-lg text-xs font-medium bg-surfaceSubtle hover:bg-surfaceHover text-textPrimary transition-all active:scale-[0.96]"
                    >
                      {optimizingInput ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Calibrate'}
                    </button>
                  )}
                </div>
              </div>

              <div className="py-3 flex items-center justify-between hover:bg-surfaceHover/40 px-2 rounded-xl transition-colors">
                <div className="flex items-center space-x-3 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-surfaceSubtle flex items-center justify-center text-textSecondary shrink-0">
                    <Headphones className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[13px] font-medium text-textPrimary block tracking-tight">
                      Pro Audio (MMCSS)
                    </span>
                    <span className="text-[11px] text-textTertiary font-mono block">
                      {audioStatus ? `MMCSS ${audioStatus.mmcssPriority || 'status unavailable'}${audioStatus.exclusiveMode ? ' • Exclusive mode' : ''}` : 'Status unavailable'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-2 shrink-0 ml-2">
                  {rowStatus.audio ? (
                    <span className="text-[11px] font-mono text-textPrimary px-2 py-0.5 rounded bg-surfaceSubtle">
                      Done ✓
                    </span>
                  ) : (
                    <button
                      onClick={handleOptimizeAudio}
                      disabled={optimizingAudio}
                      className="px-3 py-1 rounded-lg text-xs font-medium bg-surfaceSubtle hover:bg-surfaceHover text-textPrimary transition-all active:scale-[0.96]"
                    >
                      {optimizingAudio ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Calibrate'}
                    </button>
                  )}
                </div>
              </div>

              <div className="py-3 flex items-center justify-between hover:bg-surfaceHover/40 px-2 rounded-xl transition-colors">
                <div className="flex items-center space-x-3 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-surfaceSubtle flex items-center justify-center text-textSecondary shrink-0">
                    <MonitorPlay className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[13px] font-medium text-textPrimary block tracking-tight">
                      Core Unparker & GPU Pacing
                    </span>
                    <span className="text-[11px] text-textTertiary font-mono block">
                      {fpsStatus ? `Core parking ${fpsStatus.cpuCoreParkingDisabled ? 'disabled' : 'enabled'} • GPU scheduling ${fpsStatus.gpuSchedulingUnlocked ? 'configured' : 'unchanged'}` : 'Status unavailable'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-2 shrink-0 ml-2">
                  {rowStatus.fps ? (
                    <span className="text-[11px] font-mono text-textPrimary px-2 py-0.5 rounded bg-surfaceSubtle">
                      Done ✓
                    </span>
                  ) : (
                    <button
                      onClick={handleApplyFpsMaxer}
                      disabled={applyingFps}
                      className="px-3 py-1 rounded-lg text-xs font-medium bg-surfaceSubtle hover:bg-surfaceHover text-textPrimary transition-all active:scale-[0.96]"
                    >
                      {applyingFps ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Calibrate'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-surface rounded-2xl p-5 space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[13px] font-medium text-textPrimary tracking-tight">
                Maintenance & Network
              </span>
              <span className="text-[11px] font-mono text-textTertiary">
                Caches & Resolvers
              </span>
            </div>

            <div className="divide-y divide-white/[0.015]">
              <div className="py-3 flex items-center justify-between hover:bg-surfaceHover/40 px-2 rounded-xl transition-colors">
                <div className="flex items-center space-x-3 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-surfaceSubtle flex items-center justify-center text-textSecondary shrink-0">
                    <RefreshCw className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[13px] font-medium text-textPrimary block tracking-tight">
                      Standby Memory Cache
                    </span>
                    <span className="text-[11px] text-textTertiary font-mono block">
                      Reclaim inactive standby RAM
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-2 shrink-0 ml-2">
                  {rowStatus.ram ? (
                    <span className="text-[11px] font-mono text-textPrimary px-2 py-0.5 rounded bg-surfaceSubtle">
                      Purged ✓
                    </span>
                  ) : (
                    <button
                      onClick={handlePurgeRAM}
                      disabled={purgingRam}
                      className="px-3 py-1 rounded-lg text-xs font-medium bg-surfaceSubtle hover:bg-surfaceHover text-textPrimary transition-all active:scale-[0.96]"
                    >
                      {purgingRam ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Purge'}
                    </button>
                  )}
                </div>
              </div>

              <div className="py-3 flex items-center justify-between hover:bg-surfaceHover/40 px-2 rounded-xl transition-colors">
                <div className="flex items-center space-x-3 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-surfaceSubtle flex items-center justify-center text-textSecondary shrink-0">
                    <Trash2 className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[13px] font-medium text-textPrimary block tracking-tight">
                      Scratch Temp Files
                    </span>
                    <span className="text-[11px] text-textTertiary font-mono block">
                      Installer traces & error dumps
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-2 shrink-0 ml-2">
                  {rowStatus.clean ? (
                    <span className="text-[11px] font-mono text-textPrimary px-2 py-0.5 rounded bg-surfaceSubtle">
                      Cleaned ✓
                    </span>
                  ) : (
                    <button
                      onClick={handleCleanTempFiles}
                      disabled={cleaning}
                      className="px-3 py-1 rounded-lg text-xs font-medium bg-surfaceSubtle hover:bg-surfaceHover text-textPrimary transition-all active:scale-[0.96]"
                    >
                      {cleaning ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Clean'}
                    </button>
                  )}
                </div>
              </div>

              <div className="py-3 flex items-center justify-between hover:bg-surfaceHover/40 px-2 rounded-xl transition-colors">
                <div className="flex items-center space-x-3 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-surfaceSubtle flex items-center justify-center text-textSecondary shrink-0">
                    <Globe className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[13px] font-medium text-textPrimary block tracking-tight">
                      DNS Resolver Cache
                    </span>
                    <span className="text-[11px] text-textTertiary font-mono block">
                      Flush stale hostname mappings
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-2 shrink-0 ml-2">
                  {rowStatus.dns ? (
                    <span className="text-[11px] font-mono text-textPrimary px-2 py-0.5 rounded bg-surfaceSubtle">
                      Flushed ✓
                    </span>
                  ) : (
                    <button
                      onClick={handleFlushDNSCache}
                      disabled={flushing}
                      className="px-3 py-1 rounded-lg text-xs font-medium bg-surfaceSubtle hover:bg-surfaceHover text-textPrimary transition-all active:scale-[0.96]"
                    >
                      {flushing ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Flush'}
                    </button>
                  )}
                </div>
              </div>

              <div className="py-3 flex items-center justify-between hover:bg-surfaceHover/40 px-2 rounded-xl transition-colors">
                <div className="flex items-center space-x-3 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-surfaceSubtle flex items-center justify-center text-textSecondary shrink-0">
                    <Cpu className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[13px] font-medium text-textPrimary block tracking-tight">
                      Power Plan Target
                    </span>
                    <span className="text-[11px] text-textTertiary font-mono block">
                      {activePlan}
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-1 shrink-0 ml-2">
                  <button
                    onClick={() => handlePowerPlan('Balanced')}
                    className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                      activePlan.toLowerCase().includes('balanced') || activePlan.toLowerCase().includes('equilibrado')
                        ? 'bg-textPrimary text-background'
                        : 'bg-surfaceSubtle text-textSecondary hover:text-textPrimary'
                    }`}
                  >
                    Balanced
                  </button>
                  <button
                    onClick={() => handlePowerPlan('High Performance')}
                    className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                      activePlan.toLowerCase().includes('desempenho') || activePlan.toLowerCase().includes('high')
                        ? 'bg-textPrimary text-background'
                        : 'bg-surfaceSubtle text-textSecondary hover:text-textPrimary'
                    }`}
                  >
                    High Perf
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

);
