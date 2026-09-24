import React from 'react';
import { Trash2, Globe, Gauge, CheckCircle2, Loader2 } from 'lucide-react';

interface OptimizerMaintenanceSectionsProps {
  cleaning: boolean;
  cleanResult: string | null;
  onCleanTempFiles: () => Promise<void>;
  flushing: boolean;
  dnsResult: string | null;
  onFlushDNSCache: () => Promise<void>;
  activePlan: string;
  onSelectPowerPlan: (plan: string) => Promise<void>;
}

export const OptimizerMaintenanceSections: React.FC<OptimizerMaintenanceSectionsProps> = ({
  cleaning, cleanResult, onCleanTempFiles: handleCleanTempFiles, flushing, dnsResult,
  onFlushDNSCache: handleFlushDNSCache, activePlan, onSelectPowerPlan: handlePowerPlan,
}) => (
  <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-surface rounded-2xl p-5 flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-surfaceSubtle flex items-center justify-center text-textSecondary">
                <Trash2 className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-semibold text-textPrimary">Clean Temporary Cache</h3>
                <p className="text-[11px] text-textTertiary font-mono">Removes accumulated scratch disk clutter</p>
              </div>
            </div>
            <p className="text-xs text-textSecondary pt-1">
              Cleans user application caches, installer traces, and orphan temporary files
            </p>
          </div>

          <div>
            {cleanResult && (
              <div className="mb-2.5 p-2.5 rounded-xl bg-surfaceSubtle text-textPrimary text-xs flex items-center space-x-2 font-mono animate-fade-in">
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-textSecondary" />
                <span>{cleanResult}</span>
              </div>
            )}
            <button
              onClick={handleCleanTempFiles}
              disabled={cleaning}
              className="w-full py-2.5 px-3 rounded-xl bg-surfaceSubtle hover:bg-surfaceHover text-textPrimary text-xs font-medium flex items-center justify-center space-x-2 transition-all active:scale-[0.98]"
            >
              {cleaning ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
              <span>{cleaning ? 'Cleaning Cache...' : 'Clean Temp Files'}</span>
            </button>
          </div>
        </div>

        <div className="bg-surface rounded-2xl p-5 flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-surfaceSubtle flex items-center justify-center text-textSecondary">
                <Globe className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-semibold text-textPrimary">Flush DNS Resolver Cache</h3>
                <p className="text-[11px] text-textTertiary font-mono">Clears cached network hostnames</p>
              </div>
            </div>
            <p className="text-xs text-textSecondary pt-1">
              Resolves DNS lookup delays, network glitches, and stale browser domain routing
            </p>
          </div>

          <div>
            {dnsResult && (
              <div className="mb-2.5 p-2.5 rounded-xl bg-surfaceSubtle text-textPrimary text-xs flex items-center space-x-2 font-mono animate-fade-in">
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-textSecondary" />
                <span>{dnsResult}</span>
              </div>
            )}
            <button
              onClick={handleFlushDNSCache}
              disabled={flushing}
              className="w-full py-2.5 px-3 rounded-xl bg-surfaceSubtle hover:bg-surfaceHover text-textPrimary text-xs font-medium flex items-center justify-center space-x-2 transition-all active:scale-[0.98]"
            >
              {flushing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Globe className="w-3.5 h-3.5" />}
              <span>{flushing ? 'Flushing DNS...' : 'Flush DNS Cache'}</span>
            </button>
          </div>
        </div>
      </div>

      <div className="bg-surface rounded-2xl p-5 space-y-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-surfaceSubtle flex items-center justify-center text-textSecondary">
              <Gauge className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-semibold text-textPrimary">System Power Scheme</h3>
              <p className="text-[11px] text-textSecondary">Controls frequency scaling and thermal fan profiles</p>
            </div>
          </div>
          <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-lg bg-surfaceSubtle text-textSecondary">
            Active: {activePlan}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
          <button
            onClick={() => handlePowerPlan('Balanced')}
            className={`p-4 rounded-xl text-left transition-all active:scale-[0.98] ${
              activePlan.toLowerCase().includes('equilibrado') || activePlan.toLowerCase().includes('balanced')
                ? 'bg-surfaceSubtle'
                : 'bg-surface hover:bg-surfaceSubtle'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="font-medium text-xs text-textPrimary">Balanced (Recommended)</span>
              {activePlan.toLowerCase().includes('balanced') || activePlan.toLowerCase().includes('equilibrado') ? (
                <CheckCircle2 className="w-4 h-4 text-textPrimary" />
              ) : null}
            </div>
            <p className="text-[11px] text-textSecondary">
              Downclocks CPU when idle. Lowers thermal temperatures and keeps fans quiet.
            </p>
          </button>

          <button
            onClick={() => handlePowerPlan('High Performance')}
            className={`p-4 rounded-xl text-left transition-all active:scale-[0.98] ${
              activePlan.toLowerCase().includes('desempenho') || activePlan.toLowerCase().includes('high')
                ? 'bg-surfaceSubtle'
                : 'bg-surface hover:bg-surfaceSubtle'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="font-medium text-xs text-textPrimary">High Performance</span>
              {activePlan.toLowerCase().includes('desempenho') || activePlan.toLowerCase().includes('high') ? (
                <CheckCircle2 className="w-4 h-4 text-textPrimary" />
              ) : null}
            </div>
            <p className="text-[11px] text-textSecondary">
              Locks CPU clocks at maximum boost frequency for compute responsiveness.
            </p>
          </button>
        </div>
      </div>
  </>
);
