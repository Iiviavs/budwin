import React, { useState, useEffect } from 'react';
import { CheckCircle2, Sparkles, Loader2, Rocket, RefreshCw } from 'lucide-react';
import { SilentModeStatus } from '../types';
import { OptimizerTuningSections } from './OptimizerTuningSections';
import { OptimizerMaintenanceSections } from './OptimizerMaintenanceSections';

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

  const [timerActive, setTimerActive] = useState(true);
  const [lagResult, setLagResult] = useState<string | null>(null);

  const [gameBoostActive, setGameBoostActive] = useState(false);
  const [gameBoostResult, setGameBoostResult] = useState<string | null>(null);

  const [silentMode, setSilentMode] = useState<SilentModeStatus | null>(null);
  const [silentResult, setSilentResult] = useState<string | null>(null);
  const [togglingSilent, setTogglingSilent] = useState(false);

  const [audioResult, setAudioResult] = useState<string | null>(null);

  const [fpsResult, setFpsResult] = useState<string | null>(null);
  const [applyingFps, setApplyingFps] = useState(false);

  useEffect(() => {
    if (window.go?.main?.App?.IsTimerActive) {
      window.go.main.App.IsTimerActive()
        .then((active) => setTimerActive(active))
        .catch((error) => console.error('Failed to load timer state', error));
    }
    if (window.go?.main?.App?.IsGameBoostActive) {
      window.go.main.App.IsGameBoostActive()
        .then((active) => setGameBoostActive(active))
        .catch((error) => console.error('Failed to load game boost state', error));
    }
    if (window.go?.main?.App?.GetSilentModeStatus) {
      window.go.main.App.GetSilentModeStatus()
        .then((s) => setSilentMode(s))
        .catch((error) => console.error('Failed to load silent mode status', error));
    }
  }, []);

  const handleToggleSilentMode = async () => {
    setTogglingSilent(true);
    if (!silentMode || !window.go?.main?.App?.ToggleScreenShareSilentMode) {
      setSilentResult('Quiet mode status is unavailable.');
      setTogglingSilent(false);
      return;
    }
    const nextState = !silentMode.isSilentModeActive;
    try {
      if (window.go?.main?.App?.ToggleScreenShareSilentMode) {
        const res = await window.go.main.App.ToggleScreenShareSilentMode(nextState);
        setSilentMode(res);
        if (res.isSilentModeActive) {
          setSilentResult('Quiet CPU power profile requested.');
          const [activePlan, timerEnabled] = await Promise.all([
            window.go?.main?.App?.GetActivePowerPlan?.(),
            window.go?.main?.App?.IsTimerActive?.(),
          ]);
          if (activePlan) setActivePlan(activePlan);
          if (timerEnabled !== undefined) setTimerActive(timerEnabled);
        } else {
          setSilentResult('Performance power profile requested.');
        }
      }
      setTimeout(() => setSilentResult(null), 3000);
    } finally {
      setTogglingSilent(false);
    }
  };

  const handleApplyFpsMaxer = async () => {
    setApplyingFps(true);
    try {
      if (window.go?.main?.App?.ApplyUltimateFpsBoost) {
        await window.go.main.App.ApplyUltimateFpsBoost();
        const activePlan = await window.go?.main?.App?.GetActivePowerPlan?.();
        const timerEnabled = await window.go?.main?.App?.IsTimerActive?.();
        if (activePlan) setActivePlan(activePlan);
        if (timerEnabled !== undefined) setTimerActive(timerEnabled);
        setFpsResult('Performance settings request completed.');
      }
      setTimeout(() => setFpsResult(null), 3000);
    } finally {
      setApplyingFps(false);
    }
  };

  const handleToggleGameBoost = async () => {
    const nextState = !gameBoostActive;
    if (window.go?.main?.App?.ToggleGameBoost) {
      const res = await window.go.main.App.ToggleGameBoost(nextState);
      setGameBoostActive(res.active);
      setActivePlan(res.powerPlan);
      setTimerActive(res.timerActive);
      if (res.active) {
        setGameBoostResult(`Turbo Boost active. ${res.freedRamMb.toFixed(0)} MB of standby RAM freed. Timer ${res.timerActive ? 'enabled' : 'disabled'}.`);
      } else {
        setGameBoostResult('Turbo Boost Disabled: Balanced power restored.');
      }
    }
    setTimeout(() => setGameBoostResult(null), 3000);
  };

  const handlePurgeRAM = async () => {
    setPurgingRam(true);
    try {
      if (window.go?.main?.App?.PurgeStandbyRAM) {
        const freed = await window.go.main.App.PurgeStandbyRAM();
        setGameBoostResult(`Purged ${freed.toFixed(0)} MB of unused Standby RAM cache.`);
        setTimeout(() => setGameBoostResult(null), 3000);
      }
    } finally {
      setPurgingRam(false);
    }
  };

  const handleOptimizeAudio = async () => {
    if (window.go?.main?.App?.OptimizeAudioLatency) {
      await window.go.main.App.OptimizeAudioLatency();
      setAudioResult('Windows MMCSS settings request completed.');
    }
    setTimeout(() => setAudioResult(null), 3000);
  };

  const handleToggleTimer = async () => {
    if (window.go?.main?.App?.ToggleHighPrecisionTimer) {
      const next = !timerActive;
      const succeeded = await window.go.main.App.ToggleHighPrecisionTimer(next);
      if (succeeded) {
        setTimerActive(next);
        setLagResult(next ? 'Timer resolution set to 1.0ms' : 'Timer set to standard 15.6ms');
        setTimeout(() => setLagResult(null), 3000);
      } else {
        setLagResult('Unable to change timer resolution.');
      }
    }
  };

  const handlePowerPlan = async (plan: string) => {
    if (await onSetPowerPlan(plan)) setActivePlan(plan);
  };

  const handleOptimizeAllLatency = async () => {
    const succeeded = await window.go?.main?.App?.OptimizeInputLatency?.();
    setLagResult(succeeded
      ? 'Input latency settings applied.'
      : 'Unable to apply input latency settings.');
    if (succeeded) setTimerActive(true);
    setTimeout(() => setLagResult(null), 3000);
  };

  const handleCleanTempFiles = async () => {
    setCleaning(true);
    try {
      const freedMb = await onCleanTemp();
      setCleanResult(`Freed ${freedMb > 0 ? `${freedMb.toFixed(0)} MB` : 'cache'} of temporary data`);
      setTimeout(() => setCleanResult(null), 3000);
    } finally {
      setCleaning(false);
    }
  };

  const handleFlushDNSCache = async () => {
    setFlushing(true);
    try {
      const succeeded = await onFlushDNS();
      setDnsResult(succeeded ? 'DNS resolver cache flushed successfully' : 'Unable to flush DNS resolver cache');
      setTimeout(() => setDnsResult(null), 3000);
    } finally {
      setFlushing(false);
    }
  };

  return (
    <div className="p-6 md:p-8 space-y-6 pb-24 font-sans max-w-5xl mx-auto">
      <div>
        <h2 className="text-xl font-medium tracking-tight text-textPrimary flex items-center space-x-2">
          <Sparkles className="w-5 h-5 text-textPrimary" />
          <span>Optimizer</span>
        </h2>
        <p className="text-xs text-textSecondary mt-1 font-normal">
          One-click boost, input and audio latency reduction, and hardware power tuning
        </p>
      </div>

      <div className="bg-surface rounded-2xl p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3.5">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
              gameBoostActive
                ? 'bg-textPrimary text-background'
                : 'bg-surfaceSubtle text-textSecondary'
            }`}>
              <Rocket className="w-5 h-5" />
            </div>

            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-sm font-semibold text-textPrimary">Turbo Boost</h3>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded-md ${
                  gameBoostActive
                    ? 'bg-surfaceSubtle text-textPrimary'
                    : 'bg-surfaceSubtle text-textTertiary'
                }`}>
                  {gameBoostActive ? 'ACTIVE' : 'READY'}
                </span>
              </div>
              <p className="text-xs text-textSecondary mt-0.5">
                Locks 1.0ms timer, purges standby memory, sets high priority, and elevates compute frequency
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handlePurgeRAM}
              disabled={purgingRam}
              className="px-3.5 py-2 rounded-xl bg-surfaceSubtle hover:bg-surfaceHover text-textPrimary text-xs font-medium flex items-center space-x-1.5 transition-all active:scale-[0.96]"
              title="Flush Standby RAM cache"
            >
              {purgingRam ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
              <span>Purge Standby</span>
            </button>

            <button
              onClick={handleToggleGameBoost}
              className={`px-4 py-2 rounded-xl text-xs font-medium transition-all active:scale-[0.96] ${
                gameBoostActive
                  ? 'bg-textPrimary text-background hover:opacity-90'
                  : 'bg-surfaceSubtle hover:bg-surfaceHover text-textPrimary'
              }`}
            >
              {gameBoostActive ? 'TURBO ON' : 'ENABLE BOOST'}
            </button>
          </div>
        </div>

        {gameBoostResult && (
          <div className="p-3 rounded-xl bg-surfaceSubtle text-textPrimary text-xs flex items-center space-x-2 font-mono animate-fade-in">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-textSecondary" />
            <span>{gameBoostResult}</span>
          </div>
        )}
      </div>

      <OptimizerTuningSections
        silentMode={silentMode} silentResult={silentResult} togglingSilent={togglingSilent}
        onToggleSilentMode={handleToggleSilentMode} fpsResult={fpsResult}
        applyingFps={applyingFps} onApplyFps={handleApplyFpsMaxer} timerActive={timerActive}
        lagResult={lagResult} onOptimizeLatency={handleOptimizeAllLatency}
        onToggleTimer={handleToggleTimer} audioResult={audioResult}
        onOptimizeAudio={handleOptimizeAudio}
      />
      <OptimizerMaintenanceSections cleaning={cleaning} cleanResult={cleanResult}
        onCleanTempFiles={handleCleanTempFiles} flushing={flushing} dnsResult={dnsResult}
        onFlushDNSCache={handleFlushDNSCache} activePlan={activePlan} onSelectPowerPlan={handlePowerPlan}
      />
    </div>
  );
};
