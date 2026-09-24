import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  Loader2,
  Rocket,
  Wind,
  CheckCircle2,
  Eye,
} from 'lucide-react';
import { SilentModeStatus, AutoBoostStatus, FpsTweakStatus, AudioLatencyStatus } from '../types';
import { OptimizerDetailPanels } from './OptimizerDetailPanels';

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
  const [activePlan, setActivePlan] = useState(currentPowerPlan || 'Balanced');
  const [timerActive, setTimerActive] = useState<boolean | null>(null);
  const [gameBoostActive, setGameBoostActive] = useState<boolean | null>(null);
  const [silentMode, setSilentMode] = useState<SilentModeStatus | null>(null);
  const [togglingSilent, setTogglingSilent] = useState(false);
  const [autoBoost, setAutoBoost] = useState<AutoBoostStatus | null>(null);
  const [fpsStatus, setFpsStatus] = useState<FpsTweakStatus | null>(null);
  const [audioStatus, setAudioStatus] = useState<AudioLatencyStatus | null>(null);
  const [applyingFps, setApplyingFps] = useState(false);
  const [optimizingInput, setOptimizingInput] = useState(false);
  const [optimizingAudio, setOptimizingAudio] = useState(false);
  const [rowStatus, setRowStatus] = useState<Record<string, string>>({});
  const [feedback, setFeedback] = useState<string | null>(null);
  const feedbackTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const rowTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  useEffect(() => () => {
    if (feedbackTimer.current) clearTimeout(feedbackTimer.current);
    Object.values(rowTimers.current).forEach(clearTimeout);
  }, []);

  const triggerRowStatus = (id: string, message: string) => {
    setRowStatus((prev) => ({ ...prev, [id]: message }));
    setFeedback(message);
    if (rowTimers.current[id]) clearTimeout(rowTimers.current[id]);
    if (feedbackTimer.current) clearTimeout(feedbackTimer.current);
    rowTimers.current[id] = setTimeout(() => {
      setRowStatus((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
    }, 3200);
    feedbackTimer.current = setTimeout(() => setFeedback(null), 3200);
  };

  const loadAllStatuses = async () => {
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
    if (window.go?.main?.App?.GetAutoBoostStatus) {
      window.go.main.App.GetAutoBoostStatus()
        .then((ab) => setAutoBoost(ab))
        .catch((error) => console.error('Failed to load auto boost status', error));
    }
    if (window.go?.main?.App?.GetFpsOptimizationStatus) {
      window.go.main.App.GetFpsOptimizationStatus()
        .then((fps) => setFpsStatus(fps))
        .catch((error) => console.error('Failed to load FPS status', error));
    }
    if (window.go?.main?.App?.GetAudioLatencyStatus) {
      window.go.main.App.GetAudioLatencyStatus()
        .then((aud) => setAudioStatus(aud))
        .catch((error) => console.error('Failed to load audio status', error));
    }
  };

  useEffect(() => {
    loadAllStatuses();
  }, []);

  const handleToggleAutoBoost = async () => {
    if (!window.go?.main?.App?.SetAutoBoostEnabled) return;
    const nextState = !autoBoost?.autoBoostEnabled;
    const success = await window.go.main.App.SetAutoBoostEnabled(nextState);
    if (success) {
      setAutoBoost((prev) => (prev ? { ...prev, autoBoostEnabled: nextState } : null));
      triggerRowStatus('autoboost', nextState ? 'Auto-Boost Watchdog enabled' : 'Auto-Boost Watchdog disabled');
    }
  };

  const handleToggleGameBoost = async () => {
    const nextState = !gameBoostActive;
    if (window.go?.main?.App?.ToggleGameBoost) {
      const res = await window.go.main.App.ToggleGameBoost(nextState);
      setGameBoostActive(res.active);
      setActivePlan(res.powerPlan);
      setTimerActive(res.timerActive);
      triggerRowStatus(
        'boost',
        res.active
        ? `Turbo Mode Active • ${res.freedRamMb.toFixed(0)} MB freed`
          : 'Turbo Mode Disabled • Balanced restored'
      );
    }
  };

  const handlePurgeRAM = async () => {
    setPurgingRam(true);
    try {
      if (window.go?.main?.App?.PurgeStandbyRAM) {
        const freed = await window.go.main.App.PurgeStandbyRAM();
        triggerRowStatus('ram', `Purged ${freed.toFixed(0)} MB standby cache`);
      }
    } finally {
      setPurgingRam(false);
    }
  };

  const handleToggleTimer = async () => {
    if (window.go?.main?.App?.ToggleHighPrecisionTimer) {
      const next = !timerActive;
      const succeeded = await window.go.main.App.ToggleHighPrecisionTimer(next);
      if (succeeded) {
        setTimerActive(next);
        triggerRowStatus('timer', next ? 'High-precision timer enabled' : 'System timer restored');
      }
    }
  };

  const handleOptimizeAllLatency = async () => {
    setOptimizingInput(true);
    try {
      const succeeded = await window.go?.main?.App?.OptimizeInputLatency?.();
      if (succeeded) {
        setTimerActive(true);
        triggerRowStatus('input', 'Input latency settings applied');
      }
    } finally {
      setOptimizingInput(false);
    }
  };

  const handleOptimizeAudio = async () => {
    setOptimizingAudio(true);
    try {
      if (window.go?.main?.App?.OptimizeAudioLatency) {
        const res = await window.go.main.App.OptimizeAudioLatency();
        setAudioStatus(res);
        triggerRowStatus('audio', res.isOptimized ? 'Audio scheduling settings applied' : 'Audio settings could not be confirmed');
      }
    } finally {
      setOptimizingAudio(false);
    }
  };

  const handleApplyFpsMaxer = async () => {
    setApplyingFps(true);
    try {
      if (window.go?.main?.App?.ApplyUltimateFpsBoost) {
        const res = await window.go.main.App.ApplyUltimateFpsBoost();
        setFpsStatus(res);
        const plan = await window.go?.main?.App?.GetActivePowerPlan?.();
        const timerEnabled = await window.go?.main?.App?.IsTimerActive?.();
        if (plan) setActivePlan(plan);
        if (timerEnabled !== undefined) setTimerActive(timerEnabled);
        triggerRowStatus('fps', 'FPS optimization settings requested');
      }
    } finally {
      setApplyingFps(false);
    }
  };

  const handleToggleSilentMode = async () => {
    setTogglingSilent(true);
    if (!silentMode || !window.go?.main?.App?.ToggleScreenShareSilentMode) {
      setTogglingSilent(false);
      return;
    }
    const nextState = !silentMode.isSilentModeActive;
    try {
      if (window.go?.main?.App?.ToggleScreenShareSilentMode) {
        const res = await window.go.main.App.ToggleScreenShareSilentMode(nextState);
        setSilentMode(res);
        if (res.isSilentModeActive) {
          triggerRowStatus('silent', 'Quiet CPU acoustic profile active');
          const [plan, timerEnabled] = await Promise.all([
            window.go?.main?.App?.GetActivePowerPlan?.(),
            window.go?.main?.App?.IsTimerActive?.(),
          ]);
          if (plan) setActivePlan(plan);
          if (timerEnabled !== undefined) setTimerActive(timerEnabled);
        } else {
          triggerRowStatus('silent', 'Standard acoustic profile restored');
        }
      }
    } finally {
      setTogglingSilent(false);
    }
  };

  const handleCleanTempFiles = async () => {
    setCleaning(true);
    try {
      const freedMb = await onCleanTemp();
      triggerRowStatus('clean', freedMb > 0 ? `Reclaimed ${freedMb.toFixed(0)} MB of scratch files` : 'No scratch files were reclaimed');
    } finally {
      setCleaning(false);
    }
  };

  const handleFlushDNSCache = async () => {
    setFlushing(true);
    try {
      const succeeded = await onFlushDNS();
      triggerRowStatus('dns', succeeded ? 'DNS resolver cache flushed' : 'Unable to flush DNS resolver');
    } finally {
      setFlushing(false);
    }
  };

  const handlePowerPlan = async (plan: string) => {
    if (await onSetPowerPlan(plan)) {
      setActivePlan(plan);
      triggerRowStatus('plan', `Power plan set to ${plan}`);
    }
  };

  return (
    <div className="p-6 md:p-8 space-y-6 pb-24 font-sans max-w-5xl mx-auto select-none">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-medium tracking-tight text-textPrimary">
            Optimizer
          </h1>
          <p className="text-xs text-textTertiary font-mono mt-1">
            Kernel Scheduler • Latency Engine • Game Watchdog • Power Scheme
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-2 px-3 py-1 rounded-full bg-surface text-[11px] font-mono text-textSecondary">
            <span className="w-1.5 h-1.5 rounded-full bg-textPrimary" />
            <span>{timerActive === null ? 'Timer status unavailable' : timerActive ? 'High-precision timer active' : 'System timer active'}</span>
            <span>•</span>
            <span>{autoBoost ? autoBoost.autoBoostEnabled ? 'Watchdog On' : 'Watchdog Off' : 'Watchdog status unavailable'}</span>
          </div>
        </div>
      </div>

      {feedback && (
        <div className="p-3 rounded-xl bg-surface text-textPrimary text-xs flex items-center space-x-2.5 font-mono animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-textSecondary shrink-0" />
          <span>{feedback}</span>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <button
          onClick={handleToggleGameBoost}
          className={`group p-5 rounded-2xl text-left transition-all active:scale-[0.98] flex flex-col justify-between space-y-4 ${
            gameBoostActive
              ? 'bg-textPrimary text-background'
              : 'bg-surface hover:bg-surfaceHover/70 text-textPrimary'
          }`}
        >
          <div className="flex items-center justify-between w-full">
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${
              gameBoostActive ? 'bg-background text-textPrimary' : 'bg-surfaceSubtle text-textSecondary group-hover:text-textPrimary'
              }`}
            >
              <Rocket className="w-4 h-4" />
            </div>
            <span
              className={`text-[10px] font-mono px-2 py-0.5 rounded-md ${
                gameBoostActive ? 'bg-background/20 text-background' : 'bg-surfaceSubtle text-textTertiary'
              }`}
            >
              {gameBoostActive === null ? 'UNKNOWN' : gameBoostActive ? 'ACTIVE' : 'TURBO'}
            </span>
          </div>

          <div>
            <span className="font-medium text-sm block tracking-tight">Turbo Boost</span>
            <span
              className={`text-[11px] block mt-0.5 ${
                gameBoostActive ? 'text-background/80 font-mono' : 'text-textTertiary font-mono'
              }`}
            >
              High-precision timer & game priority
            </span>
          </div>
        </button>

        <button
          onClick={() => handlePowerPlan('Balanced')}
          className={`group p-5 rounded-2xl text-left transition-all active:scale-[0.98] flex flex-col justify-between space-y-4 ${
            !gameBoostActive && (activePlan.toLowerCase().includes('balanced') || activePlan.toLowerCase().includes('equilibrado'))
              ? 'bg-surface ring-1 ring-white/10 text-textPrimary'
              : 'bg-surface hover:bg-surfaceHover/70 text-textPrimary'
          }`}
        >
          <div className="flex items-center justify-between w-full">
            <div className="w-9 h-9 rounded-xl bg-surfaceSubtle flex items-center justify-center text-textSecondary group-hover:text-textPrimary transition-colors">
              <Sparkles className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-surfaceSubtle text-textTertiary">
              {activePlan.toLowerCase().includes('balanced') || activePlan.toLowerCase().includes('equilibrado') ? 'ACTIVE' : 'DEFAULT'}
            </span>
          </div>

          <div>
            <span className="font-medium text-sm block tracking-tight">Balanced Standard</span>
            <span className="text-[11px] text-textTertiary font-mono block mt-0.5">
              Dynamic clocks & thermal efficiency
            </span>
          </div>
        </button>

        <button
          onClick={handleToggleSilentMode}
          disabled={togglingSilent || !silentMode}
          className={`group p-5 rounded-2xl text-left transition-all active:scale-[0.98] flex flex-col justify-between space-y-4 ${
            silentMode?.isSilentModeActive
              ? 'bg-textPrimary text-background'
              : 'bg-surface hover:bg-surfaceHover/70 text-textPrimary'
          }`}
        >
          <div className="flex items-center justify-between w-full">
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${
                silentMode?.isSilentModeActive ? 'bg-background text-textPrimary' : 'bg-surfaceSubtle text-textSecondary group-hover:text-textPrimary'
              }`}
            >
              {togglingSilent ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wind className="w-4 h-4" />}
            </div>
            <span
              className={`text-[10px] font-mono px-2 py-0.5 rounded-md ${
                silentMode?.isSilentModeActive ? 'bg-background/20 text-background' : 'bg-surfaceSubtle text-textTertiary'
              }`}
            >
              {silentMode?.isSilentModeActive ? 'ACTIVE' : 'ACOUSTIC'}
            </span>
          </div>

          <div>
            <span className="font-medium text-sm block tracking-tight">Quiet Profile</span>
            <span
              className={`text-[11px] block mt-0.5 ${
                silentMode?.isSilentModeActive ? 'text-background/80 font-mono' : 'text-textTertiary font-mono'
              }`}
            >
              Quiet fans & dampened idle spikes
            </span>
          </div>
        </button>
      </div>

      <div className="bg-surface rounded-2xl p-5 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-surfaceSubtle flex items-center justify-center text-textSecondary shrink-0">
              <Eye className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[13px] font-medium text-textPrimary block tracking-tight">
                Auto-Boost Game Watchdog
              </span>
              <span className="text-[11px] text-textTertiary font-mono block">
                {autoBoost?.isBoosting
                  ? `Active: ${autoBoost.activeGameName} (PID #${autoBoost.activeGamePid}) • Prioritized`
                  : autoBoost?.autoBoostEnabled
                  ? 'Background monitor active • Enables high-precision timer on game launch'
                  : autoBoost ? 'Disabled • Turbo Boost requires manual activation' : 'Status unavailable'}
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            <button
              type="button"
              role="switch"
              aria-label="Enable automatic game boost"
              aria-checked={autoBoost?.autoBoostEnabled}
              onClick={handleToggleAutoBoost}
              disabled={!autoBoost}
              className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-textPrimary disabled:cursor-not-allowed ${
                autoBoost?.autoBoostEnabled ? 'bg-textPrimary' : 'bg-surfaceSubtle'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-4 w-4 transform rounded-full transition duration-200 ease-in-out mt-0.5 ml-0.5 ${
                  autoBoost?.autoBoostEnabled ? 'translate-x-4 bg-background' : 'translate-x-0 bg-textSecondary'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      <OptimizerDetailPanels
        rowStatus={rowStatus}
        timerActive={timerActive}
        handleToggleTimer={handleToggleTimer}
        optimizingInput={optimizingInput}
        handleOptimizeAllLatency={handleOptimizeAllLatency}
        optimizingAudio={optimizingAudio}
        audioStatus={audioStatus}
        handleOptimizeAudio={handleOptimizeAudio}
        applyingFps={applyingFps}
        fpsStatus={fpsStatus}
        handleApplyFpsMaxer={handleApplyFpsMaxer}
        purgingRam={purgingRam}
        handlePurgeRAM={handlePurgeRAM}
        cleaning={cleaning}
        handleCleanTempFiles={handleCleanTempFiles}
        flushing={flushing}
        handleFlushDNSCache={handleFlushDNSCache}
        activePlan={activePlan}
        handlePowerPlan={handlePowerPlan}
      />
    </div>
  );
};
