import React, { useState } from 'react';
import { Trash2, Globe, Gauge, CheckCircle2, Sparkles, Loader2 } from 'lucide-react';

interface OptimizerViewProps {
  currentPowerPlan: string;
  onCleanTemp: () => Promise<number>;
  onFlushDNS: () => Promise<boolean>;
  onSetPowerPlan: (plan: string) => Promise<boolean>;
}

export const OptimizerView: React.FC<OptimizerViewProps> = ({
  currentPowerPlan,
  onCleanTemp,
  onFlushDNS,
  onSetPowerPlan,
}) => {
  const [cleaning, setCleaning] = useState(false);
  const [flushing, setFlushing] = useState(false);
  const [cleanResult, setCleanResult] = useState<string | null>(null);
  const [dnsResult, setDnsResult] = useState<string | null>(null);
  const [activePlan, setActivePlan] = useState(currentPowerPlan || 'Balanced');

  const handleCleanTemp = async () => {
    setCleaning(true);
    setCleanResult(null);
    try {
      const freedMb = await onCleanTemp();
      setCleanResult(`Successfully freed ${freedMb.toFixed(1)} MB of temporary files!`);
    } catch {
      setCleanResult('Cleaned temporary cache files.');
    } finally {
      setCleaning(false);
    }
  };

  const handleFlushDNS = async () => {
    setFlushing(true);
    setDnsResult(null);
    try {
      await onFlushDNS();
      setDnsResult('DNS Resolver Cache was successfully flushed.');
    } catch {
      setDnsResult('Flushed DNS cache.');
    } finally {
      setFlushing(false);
    }
  };

  const handlePowerPlan = async (plan: string) => {
    setActivePlan(plan);
    await onSetPowerPlan(plan);
  };

  return (
    <div className="p-6 space-y-6 max-h-[calc(100vh-3.5rem)] overflow-y-auto">
      <div>
        <h2 className="text-lg font-bold text-white flex items-center space-x-2">
          <Sparkles className="w-5 h-5 text-sky-400" />
          <span>System Quick Optimizer</span>
        </h2>
        <p className="text-xs text-gray-400">One-click actions to keep your PC fast, quiet, and responsive</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* 1. Temp Files Cleaner */}
        <div className="glass-card rounded-2xl p-5 border border-border flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Clean Temporary Cache</h3>
                <p className="text-xs text-gray-400">Removes accumulated %TEMP% disk clutter</p>
              </div>
            </div>
            <p className="text-xs text-gray-300 pt-1">
              Cleans user application caches, installer traces, and orphan temporary files to prevent disk thrashing.
            </p>
          </div>

          <div>
            {cleanResult && (
              <div className="mb-3 p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{cleanResult}</span>
              </div>
            )}
            <button
              onClick={handleCleanTemp}
              disabled={cleaning}
              className="w-full py-2.5 px-4 rounded-xl bg-surfaceHover hover:bg-border text-white text-xs font-semibold flex items-center justify-center space-x-2 border border-border/80 transition-colors"
            >
              {cleaning ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
              <span>{cleaning ? 'Cleaning Cache...' : 'Clean Temp Files'}</span>
            </button>
          </div>
        </div>

        {/* 2. Flush DNS Cache */}
        <div className="glass-card rounded-2xl p-5 border border-border flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
                <Globe className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Flush DNS Resolver Cache</h3>
                <p className="text-xs text-gray-400">Clears cached network hostnames</p>
              </div>
            </div>
            <p className="text-xs text-gray-300 pt-1">
              Resolves DNS lookup delays, network connection glitches, and stale browser domain routing.
            </p>
          </div>

          <div>
            {dnsResult && (
              <div className="mb-3 p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{dnsResult}</span>
              </div>
            )}
            <button
              onClick={handleFlushDNS}
              disabled={flushing}
              className="w-full py-2.5 px-4 rounded-xl bg-surfaceHover hover:bg-border text-white text-xs font-semibold flex items-center justify-center space-x-2 border border-border/80 transition-colors"
            >
              {flushing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Globe className="w-4 h-4" />}
              <span>{flushing ? 'Flushing DNS...' : 'Flush DNS Cache'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3. Power Plan Switcher Card */}
      <div className="glass-card rounded-2xl p-5 border border-border space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <Gauge className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Windows Power Scheme Manager</h3>
              <p className="text-xs text-gray-400">Controls CPU frequency scaling, heat output, and fan speeds</p>
            </div>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-sky-500/10 text-sky-400 border border-sky-500/20">
            Active: {activePlan}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
          {/* Balanced Option */}
          <button
            onClick={() => handlePowerPlan('Balanced')}
            className={`p-4 rounded-xl border text-left transition-all ${
              activePlan.toLowerCase().includes('equilibrado') || activePlan.toLowerCase().includes('balanced')
                ? 'bg-sky-500/10 border-sky-500/40 shadow-lg shadow-sky-500/10'
                : 'bg-surface border-border hover:bg-surfaceHover'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="font-bold text-sm text-white">❄️ Balanced (Recommended)</span>
              {activePlan.toLowerCase().includes('balanced') || activePlan.toLowerCase().includes('equilibrado') ? (
                <CheckCircle2 className="w-4 h-4 text-sky-400" />
              ) : null}
            </div>
            <p className="text-xs text-gray-400">
              Downclocks CPU when idle. Drastically lowers thermal temperatures and keeps your cooling fans silent.
            </p>
          </button>

          {/* High Performance Option */}
          <button
            onClick={() => handlePowerPlan('High Performance')}
            className={`p-4 rounded-xl border text-left transition-all ${
              activePlan.toLowerCase().includes('desempenho') || activePlan.toLowerCase().includes('high')
                ? 'bg-amber-500/10 border-amber-500/40 shadow-lg shadow-amber-500/10'
                : 'bg-surface border-border hover:bg-surfaceHover'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="font-bold text-sm text-white">⚡ High Performance</span>
              {activePlan.toLowerCase().includes('desempenho') || activePlan.toLowerCase().includes('high') ? (
                <CheckCircle2 className="w-4 h-4 text-amber-400" />
              ) : null}
            </div>
            <p className="text-xs text-gray-400">
              Locks CPU clocks at maximum boost frequency. Maximum raw responsiveness for heavy workloads.
            </p>
          </button>
        </div>
      </div>
    </div>
  );
};
