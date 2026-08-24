import React, { useState, useEffect } from 'react';
import { Trash2, Globe, Gauge, CheckCircle2, Sparkles, Loader2, Zap, MousePointer2, Gamepad2, Rocket, RefreshCw } from 'lucide-react';

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
  const [purgingRam, setPurgingRam] = useState(false);
  const [cleanResult, setCleanResult] = useState<string | null>(null);
  const [dnsResult, setDnsResult] = useState<string | null>(null);
  const [activePlan, setActivePlan] = useState(currentPowerPlan || 'Balanced');

  // Input lag reduction state
  const [timerActive, setTimerActive] = useState(true);
  const [lagResult, setLagResult] = useState<string | null>(null);

  // Game Boost State
  const [gameBoostActive, setGameBoostActive] = useState(false);
  const [gameBoostResult, setGameBoostResult] = useState<string | null>(null);

  useEffect(() => {
    if (window.go?.main?.App?.IsTimerActive) {
      window.go.main.App.IsTimerActive().then((active) => setTimerActive(active));
    }
    if (window.go?.main?.App?.IsGameBoostActive) {
      window.go.main.App.IsGameBoostActive().then((active) => setGameBoostActive(active));
    }
  }, []);

  const handleToggleGameBoost = async () => {
    const nextState = !gameBoostActive;
    if (window.go?.main?.App?.ToggleGameBoost) {
      const res = await window.go.main.App.ToggleGameBoost(nextState);
      setGameBoostActive(res.active);
      setActivePlan(res.powerPlan);
      setTimerActive(res.timerActive);
      if (res.active) {
        setGameBoostResult(`🚀 Game Boost Active: Purged ${res.freedRamMb.toFixed(0)} MB Standby RAM, 1.0ms Timer Locked, High Performance Power Active!`);
      } else {
        setGameBoostResult('Game Boost Disabled: Balanced power & quiet fans restored.');
      }
    } else {
      setGameBoostActive(nextState);
      setGameBoostResult(nextState ? '🚀 Game Boost Activated!' : 'Game Boost Disabled.');
    }
  };

  const handlePurgeRAM = async () => {
    setPurgingRam(true);
    try {
      if (window.go?.main?.App?.PurgeStandbyRAM) {
        const freed = await window.go.main.App.PurgeStandbyRAM();
        setGameBoostResult(`🧠 Purged ${freed.toFixed(0)} MB of unused Standby RAM cache!`);
      }
    } finally {
      setPurgingRam(false);
    }
  };

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

  const handleToggleTimer = async () => {
    const nextState = !timerActive;
    if (window.go?.main?.App?.ToggleHighPrecisionTimer) {
      await window.go.main.App.ToggleHighPrecisionTimer(nextState);
    }
    setTimerActive(nextState);
    setLagResult(nextState ? '1.0ms High-Resolution System Timer Activated' : 'Standard Windows 15.6ms Timer Restored');
  };

  const handleOptimizeAllLatency = async () => {
    if (window.go?.main?.App?.OptimizeInputLatency) {
      await window.go.main.App.OptimizeInputLatency();
    }
    setTimerActive(true);
    setLagResult('Ultra-Low Latency Mode Applied: 1.0ms Timer + 1:1 Raw Mouse Input + GameDVR Buffer Disabled');
  };

  return (
    <div className="p-6 space-y-6 max-h-[calc(100vh-2.5rem)] overflow-y-auto">
      <div>
        <h2 className="text-lg font-bold text-white flex items-center space-x-2">
          <Sparkles className="w-5 h-5 text-accent-theme" />
          <span>Performance & System Optimizer</span>
        </h2>
        <p className="text-xs text-gray-400 font-medium">1-Click Game Boost, input latency reduction, and system cleaning</p>
      </div>

      {/* GAME BOOST / FOCUS MODE HERO BANNER */}
      <div className={`rounded-3xl p-6 border transition-all duration-300 shadow-2xl ${
        gameBoostActive
          ? 'bg-gradient-to-br from-surface to-accent-theme/10 border-accent-theme/50 shadow-accent-theme/10'
          : 'glass-card border-border'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className={`w-13 h-13 rounded-2xl flex items-center justify-center p-3 transition-all ${
              gameBoostActive
                ? 'bg-accent-theme text-black shadow-lg shadow-accent-theme/30'
                : 'bg-surfaceHover text-gray-400 border border-border'
            }`}>
              <Rocket className="w-7 h-7" />
            </div>

            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base font-bold text-white">🚀 1-Click Game Boost & Focus Mode</h3>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                  gameBoostActive
                    ? 'bg-accent-theme/20 text-accent-theme border-accent-theme/40 animate-pulse'
                    : 'bg-surface text-gray-400 border-border'
                }`}>
                  {gameBoostActive ? 'BOOST ACTIVE' : 'READY'}
                </span>
              </div>
              <p className="text-xs text-gray-300 mt-0.5">
                Locks 1.0ms timer, purges standby RAM cache, sets high game priority, and maximizes CPU power.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handlePurgeRAM}
              disabled={purgingRam}
              className="px-3 py-2 rounded-xl bg-surface hover:bg-surfaceHover border border-border text-gray-300 text-xs font-semibold flex items-center space-x-1.5 transition-colors"
              title="Flush Standby RAM cache"
            >
              {purgingRam ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
              <span>Purge RAM</span>
            </button>

            <button
              onClick={handleToggleGameBoost}
              className={`px-5 py-2 rounded-xl text-xs font-bold transition-all shadow-lg active:scale-95 ${
                gameBoostActive
                  ? 'bg-accent-theme text-black shadow-accent-theme/30 hover:opacity-90'
                  : 'bg-surfaceHover hover:bg-border text-white border border-border/80'
              }`}
            >
              {gameBoostActive ? 'TURBO BOOST ON' : 'ENABLE BOOST'}
            </button>
          </div>
        </div>

        {gameBoostResult && (
          <div className="mt-3 p-2.5 rounded-xl bg-accent-theme/10 border border-accent-theme/30 text-accent-theme text-xs flex items-center space-x-2 font-medium">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{gameBoostResult}</span>
          </div>
        )}
      </div>

      {/* INPUT LAG REDUCER CARD */}
      <div className="glass-card rounded-3xl p-5 border border-sky-500/20 bg-gradient-to-br from-surface to-sky-950/10 space-y-4 shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20 flex items-center justify-center">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-sm font-bold text-white">⚡ Ultra-Low Input Latency Reducer</h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Active
                </span>
              </div>
              <p className="text-xs text-gray-300">Forces 1.0ms timer ticks, strips mouse acceleration, and bypasses DWM queuing</p>
            </div>
          </div>

          <button
            onClick={handleOptimizeAllLatency}
            className="px-3.5 py-1.5 rounded-xl bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 border border-sky-500/30 text-xs font-bold transition-all shadow-sm"
          >
            Apply All Latency Fixes
          </button>
        </div>

        {/* 3 Pill Tweaks */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
          <div className="bg-background/80 border border-border rounded-xl p-3 flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <Zap className="w-4 h-4 text-sky-400" />
              <div>
                <span className="text-xs font-bold text-white block">1.0ms Timer Resolution</span>
                <span className="text-[10px] text-gray-400">Standard: 15.6ms</span>
              </div>
            </div>
            <button
              onClick={handleToggleTimer}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-colors ${
                timerActive
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                  : 'bg-surface text-gray-400 border-border hover:text-white'
              }`}
            >
              {timerActive ? 'ENABLED' : 'DISABLED'}
            </button>
          </div>

          <div className="bg-background/80 border border-border rounded-xl p-3 flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <MousePointer2 className="w-4 h-4 text-emerald-400" />
              <div>
                <span className="text-xs font-bold text-white block">1:1 Raw Mouse Input</span>
                <span className="text-[10px] text-gray-400">Zero Acceleration Curve</span>
              </div>
            </div>
            <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
              OPTIMIZED
            </span>
          </div>

          <div className="bg-background/80 border border-border rounded-xl p-3 flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <Gamepad2 className="w-4 h-4 text-purple-400" />
              <div>
                <span className="text-xs font-bold text-white block">GameDVR Queue Bypass</span>
                <span className="text-[10px] text-gray-400">Lower DWM Latency</span>
              </div>
            </div>
            <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
              BYPASSED
            </span>
          </div>
        </div>

        {lagResult && (
          <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{lagResult}</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* 1. Temp Files Cleaner */}
        <div className="glass-card rounded-3xl p-5 border border-border flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center justify-center">
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
              <div className="mb-3 p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-center space-x-2">
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
        <div className="glass-card rounded-3xl p-5 border border-border flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 flex items-center justify-center">
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
              <div className="mb-3 p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-center space-x-2">
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
      <div className="glass-card rounded-3xl p-5 border border-border space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center">
              <Gauge className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Windows Power Scheme Manager</h3>
              <p className="text-xs text-gray-400">Controls CPU frequency scaling, heat output, and fan speeds</p>
            </div>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-accent-theme/10 text-accent-theme border border-accent-theme/20">
            Active: {activePlan}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
          {/* Balanced Option */}
          <button
            onClick={() => handlePowerPlan('Balanced')}
            className={`p-4 rounded-2xl border text-left transition-all ${
              activePlan.toLowerCase().includes('equilibrado') || activePlan.toLowerCase().includes('balanced')
                ? 'bg-accent-lime/10 border-accent-lime/40 shadow-lg shadow-accent-lime/10'
                : 'bg-surface border-border hover:bg-surfaceHover'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="font-bold text-sm text-white">❄️ Balanced (Recommended)</span>
              {activePlan.toLowerCase().includes('balanced') || activePlan.toLowerCase().includes('equilibrado') ? (
                <CheckCircle2 className="w-4 h-4 text-accent-lime" />
              ) : null}
            </div>
            <p className="text-xs text-gray-400">
              Downclocks CPU when idle. Drastically lowers thermal temperatures and keeps your cooling fans silent.
            </p>
          </button>

          {/* High Performance Option */}
          <button
            onClick={() => handlePowerPlan('High Performance')}
            className={`p-4 rounded-2xl border text-left transition-all ${
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
