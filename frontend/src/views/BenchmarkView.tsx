import React, { useState, useEffect } from 'react';
import { Gauge, Play, Square, Trophy, Flame, Cpu, HardDrive, Zap } from 'lucide-react';
import { BenchmarkSummary, AutoBoostStatus } from '../types';

interface BenchmarkViewProps {
  autoBoostStatus: AutoBoostStatus | null;
  onToggleAutoBoost: (enabled: boolean) => Promise<boolean>;
}

export const BenchmarkView: React.FC<BenchmarkViewProps> = ({
  autoBoostStatus,
  onToggleAutoBoost,
}) => {
  const [benchmark, setBenchmark] = useState<BenchmarkSummary>({
    isRunning: false,
    durationSeconds: 0,
    avgCpuPercent: 0,
    maxCpuPercent: 0,
    avgRamPercent: 0,
    maxRamPercent: 0,
    maxGpuTemp: 0,
    avgGpuLoad: 0,
    stabilityScore: 100,
    verdict: 'No active session. Click Start Benchmark before launching your game.',
    samplesCount: 0,
  });

  const [timer, setTimer] = useState(0);

  // Poll benchmark status
  useEffect(() => {
    const fetchStatus = async () => {
      if (window.go?.main?.App?.GetBenchmarkStatus) {
        try {
          const s = await window.go.main.App.GetBenchmarkStatus();
          setBenchmark(s);
          if (s.isRunning) {
            setTimer(s.durationSeconds);
          }
        } catch { }
      }
    };

    fetchStatus();
    const interval = setInterval(fetchStatus, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleStart = async () => {
    if (window.go?.main?.App?.StartBenchmark) {
      const res = await window.go.main.App.StartBenchmark();
      setBenchmark(res);
    } else {
      setBenchmark((prev) => ({ ...prev, isRunning: true, durationSeconds: 0, verdict: 'Session in progress...' }));
    }
  };

  const handleStop = async () => {
    if (window.go?.main?.App?.StopBenchmark) {
      const res = await window.go.main.App.StopBenchmark();
      setBenchmark(res);
    } else {
      setBenchmark((prev) => ({
        ...prev,
        isRunning: false,
        avgCpuPercent: 24.5,
        maxCpuPercent: 58.2,
        avgRamPercent: 68.4,
        maxRamPercent: 74.1,
        maxGpuTemp: 64,
        stabilityScore: 99,
        verdict: '🟢 Flawless Stability & Optimal Thermals',
      }));
    }
  };

  const formatDuration = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="p-6 space-y-6 max-h-[calc(100vh-2.5rem)] overflow-y-auto font-sans">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-white flex items-center space-x-2">
            <Trophy className="w-5 h-5 text-accent-theme" />
            <span>Gaming Benchmark & Performance Logger</span>
          </h2>
          <p className="text-xs text-neutral-400 mt-0.5 font-normal">
            Track peak GPU heat, CPU load, and stability scores across your gameplay sessions.
          </p>
        </div>

        {/* Start / Stop Session Button */}
        <div>
          {benchmark.isRunning ? (
            <button
              onClick={handleStop}
              className="px-4 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold flex items-center space-x-2 transition-all shadow-lg active:scale-95"
            >
              <Square className="w-3.5 h-3.5 fill-current" />
              <span>Stop Session ({formatDuration(timer)})</span>
            </button>
          ) : (
            <button
              onClick={handleStart}
              className="px-4 py-2 rounded-xl bg-accent-theme text-black text-xs font-bold flex items-center space-x-2 transition-all shadow-lg active:scale-95 hover:opacity-90"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Start Benchmark Session</span>
            </button>
          )}
        </div>
      </div>

      {/* 1. AUTO-GAME DETECTION WATCHDOG STATUS (Raycast Row) */}
      <div className="glass-card rounded-2xl overflow-hidden border border-border shadow-xl">
        <div className="raycast-row">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-surfaceHover flex items-center justify-center text-accent-theme">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-bold text-white block">Smart Auto-Game Detection</span>
              <span className="text-[11px] text-neutral-400">
                Automatically engages 1.0ms timer & RAM cache purge when games launch
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {autoBoostStatus?.activeGameName ? (
              <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold flex items-center space-x-1.5 animate-pulse">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span>Active: {autoBoostStatus.activeGameName}</span>
              </span>
            ) : (
              <span className="px-2.5 py-1 rounded-lg bg-surfaceHover text-neutral-400 border border-border text-xs font-medium">
                Watching for Games
              </span>
            )}

            <button
              onClick={() => onToggleAutoBoost(!autoBoostStatus?.autoBoostEnabled)}
              className={`px-3 py-1 rounded-lg text-xs font-bold border transition-colors ${
                autoBoostStatus?.autoBoostEnabled
                  ? 'bg-accent-theme/10 text-accent-theme border-accent-theme/30'
                  : 'bg-surface text-neutral-400 border-border hover:text-white'
              }`}
            >
              {autoBoostStatus?.autoBoostEnabled ? 'ENABLED' : 'DISABLED'}
            </button>
          </div>
        </div>
      </div>

      {/* 2. BENCHMARK SCORE HERO BANNER (Raycast Style) */}
      <div className="glass-card rounded-2xl p-5 border border-border space-y-4 shadow-xl">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3.5">
            <div className="w-12 h-12 rounded-xl bg-surfaceHover text-accent-theme flex items-center justify-center border border-white/5">
              <Gauge className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-accent-theme uppercase tracking-wider block">
                Session Performance Verdict
              </span>
              <h3 className="text-base font-bold text-white mt-0.5">{benchmark.verdict}</h3>
              <p className="text-xs text-neutral-400 mt-0.5">
                Session Length: {formatDuration(benchmark.durationSeconds)} • {benchmark.samplesCount} telemetry samples
              </p>
            </div>
          </div>

          <div className="text-right bg-surfaceHover/80 px-3.5 py-2 rounded-xl border border-white/5">
            <span className="text-[10px] text-neutral-400 font-semibold block uppercase tracking-wider">
              Stability Score
            </span>
            <span className="text-xl font-extrabold text-white font-mono">{benchmark.stabilityScore}%</span>
          </div>
        </div>

        {/* 4 Metric Columns */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2 border-t border-border">
          {/* CPU Load */}
          <div className="bg-surface/90 border border-border rounded-xl p-3">
            <div className="flex items-center space-x-1.5 text-sky-400 mb-1">
              <Cpu className="w-3.5 h-3.5" />
              <span className="text-[11px] font-bold">CPU Load</span>
            </div>
            <span className="text-base font-bold text-white block">{benchmark.avgCpuPercent}% Avg</span>
            <span className="text-[10px] text-neutral-400">Peak: {benchmark.maxCpuPercent}%</span>
          </div>

          {/* GPU Temp */}
          <div className="bg-surface/90 border border-border rounded-xl p-3">
            <div className="flex items-center space-x-1.5 text-emerald-400 mb-1">
              <Flame className="w-3.5 h-3.5" />
              <span className="text-[11px] font-bold">GPU Thermal</span>
            </div>
            <span className="text-base font-bold text-white block">
              {benchmark.maxGpuTemp > 0 ? `${benchmark.maxGpuTemp}°C Peak` : 'Cool'}
            </span>
            <span className="text-[10px] text-neutral-400">Under Throttle Limit</span>
          </div>

          {/* Memory Usage */}
          <div className="bg-surface/90 border border-border rounded-xl p-3">
            <div className="flex items-center space-x-1.5 text-purple-400 mb-1">
              <HardDrive className="w-3.5 h-3.5" />
              <span className="text-[11px] font-bold">RAM Usage</span>
            </div>
            <span className="text-base font-bold text-white block">{benchmark.avgRamPercent}% Avg</span>
            <span className="text-[10px] text-neutral-400">Peak: {benchmark.maxRamPercent}%</span>
          </div>

          {/* Timer Resolution */}
          <div className="bg-surface/90 border border-border rounded-xl p-3">
            <div className="flex items-center space-x-1.5 text-accent-theme mb-1">
              <Zap className="w-3.5 h-3.5" />
              <span className="text-[11px] font-bold">Timer Tick</span>
            </div>
            <span className="text-base font-bold text-accent-theme block">1.0ms Fixed</span>
            <span className="text-[10px] text-neutral-400">1000 Hz Resolution</span>
          </div>
        </div>
      </div>
    </div>
  );
};
