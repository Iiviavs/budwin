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
    verdict: 'No active session. Click Start Benchmark before launching intensive workloads.',
    samplesCount: 0,
  });

  const [timer, setTimer] = useState(0);
  const benchmarkAvailable = Boolean(window.go?.main?.App?.StartBenchmark && window.go?.main?.App?.StopBenchmark);

  useEffect(() => {
    const fetchStatus = async () => {
      if (window.go?.main?.App?.GetBenchmarkStatus) {
        try {
          const s = await window.go.main.App.GetBenchmarkStatus();
          setBenchmark(s);
          if (s.isRunning) {
            setTimer(s.durationSeconds);
          }
        } catch (error) {
          console.error('Failed to load benchmark status', error);
        }
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
    }
  };

  const handleStop = async () => {
    if (window.go?.main?.App?.StopBenchmark) {
      const res = await window.go.main.App.StopBenchmark();
      setBenchmark(res);
    }
  };

  const formatDuration = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="p-6 md:p-8 space-y-6 pb-24 font-sans max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-medium tracking-tight text-textPrimary flex items-center space-x-2">
            <Trophy className="w-5 h-5 text-textPrimary" />
            <span>Benchmark</span>
          </h2>
          <p className="text-xs text-textSecondary mt-1 font-normal">
            Profile GPU heat, CPU load, and stability scores across active workloads
          </p>
        </div>

        <div>
          {benchmark.isRunning ? (
            <button
              onClick={handleStop}
              disabled={!benchmarkAvailable}
              className="px-4 py-2 rounded-xl bg-surface hover:bg-surfaceHover text-textPrimary text-xs font-medium flex items-center space-x-2 transition-all active:scale-[0.96]"
            >
              <Square className="w-3.5 h-3.5 fill-current" />
              <span>Stop Session ({formatDuration(timer)})</span>
            </button>
          ) : (
            <button
              onClick={handleStart}
              disabled={!benchmarkAvailable}
              className="px-4 py-2 rounded-xl bg-textPrimary text-background text-xs font-medium flex items-center space-x-2 transition-all active:scale-[0.96] hover:opacity-90"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Start Benchmark Session</span>
            </button>
          )}
        </div>
      </div>

      <div className="bg-surface rounded-2xl overflow-hidden">
        <div className="list-row">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-surfaceSubtle flex items-center justify-center text-textSecondary">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-medium text-textPrimary block">Automatic Workload Detection</span>
              <span className="text-[11px] text-textTertiary">
                Engages 1.0ms timer and purges standby cache when foreground games launch
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {autoBoostStatus?.activeGameName ? (
              <span className="px-2.5 py-1 rounded-xl bg-surfaceSubtle text-textPrimary text-xs font-mono flex items-center space-x-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-textPrimary" />
                <span>Active: {autoBoostStatus.activeGameName}</span>
              </span>
            ) : (
              <span className="px-2.5 py-1 rounded-xl bg-surfaceSubtle text-textTertiary text-xs font-mono">
                Monitoring Host Tasks
              </span>
            )}

            <button
              type="button"
              role="switch"
              aria-checked={Boolean(autoBoostStatus?.autoBoostEnabled)}
              onClick={() => onToggleAutoBoost(!autoBoostStatus?.autoBoostEnabled)}
              className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out focus:outline-none ${
                autoBoostStatus?.autoBoostEnabled ? 'bg-textPrimary' : 'bg-surfaceSubtle'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-4 w-4 transform rounded-full transition duration-200 ease-in-out mt-0.5 ml-0.5 ${
                  autoBoostStatus?.autoBoostEnabled ? 'translate-x-4 bg-background' : 'translate-x-0 bg-textSecondary'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      <div className="bg-surface rounded-2xl p-5 space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3.5">
            <div className="w-10 h-10 rounded-xl bg-surfaceSubtle text-textSecondary flex items-center justify-center">
              <Gauge className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-mono text-textTertiary uppercase tracking-wider block">
                Session Performance Verdict
              </span>
              <h3 className="text-sm font-medium text-textPrimary mt-0.5">{benchmark.verdict}</h3>
              <p className="text-xs text-textTertiary mt-0.5 font-mono">
                Duration: {formatDuration(benchmark.durationSeconds)} • {benchmark.samplesCount} telemetry samples
              </p>
            </div>
          </div>

          <div className="text-right bg-surfaceSubtle px-3 py-2 rounded-xl">
            <span className="text-[10px] text-textTertiary font-mono block uppercase tracking-wider">
              Stability Score
            </span>
            <span className="text-lg font-medium text-textPrimary font-mono tabular-nums">
              {benchmark.samplesCount > 0 ? `${benchmark.stabilityScore}%` : '—'}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 pt-2">
          <div className="bg-surfaceSubtle rounded-xl p-3">
            <div className="flex items-center space-x-1.5 text-textSecondary mb-1">
              <Cpu className="w-3.5 h-3.5" />
              <span className="text-[11px] font-medium">CPU Load</span>
            </div>
            <span className="text-base font-medium text-textPrimary block font-mono tabular-nums">
              {benchmark.samplesCount > 0 ? `${benchmark.avgCpuPercent.toFixed(1)}% Avg` : '—'}
            </span>
            <span className="text-[10px] text-textTertiary font-mono">
              Peak: {benchmark.samplesCount > 0 ? `${benchmark.maxCpuPercent.toFixed(1)}%` : '—'}
            </span>
          </div>

          <div className="bg-surfaceSubtle rounded-xl p-3">
            <div className="flex items-center space-x-1.5 text-textSecondary mb-1">
              <Flame className="w-3.5 h-3.5" />
              <span className="text-[11px] font-medium">GPU Thermal</span>
            </div>
            <span className="text-base font-medium text-textPrimary block font-mono tabular-nums">
              {benchmark.samplesCount > 0 && benchmark.maxGpuTemp > 0 ? `${benchmark.maxGpuTemp}°C Peak` : '—'}
            </span>
            <span className="text-[10px] text-textTertiary font-mono">
              {benchmark.samplesCount > 0 ? 'Logged' : 'Standby'}
            </span>
          </div>

          <div className="bg-surfaceSubtle rounded-xl p-3">
            <div className="flex items-center space-x-1.5 text-textSecondary mb-1">
              <HardDrive className="w-3.5 h-3.5" />
              <span className="text-[11px] font-medium">RAM Allocation</span>
            </div>
            <span className="text-base font-medium text-textPrimary block font-mono tabular-nums">
              {benchmark.samplesCount > 0 ? `${benchmark.avgRamPercent.toFixed(1)}% Avg` : '—'}
            </span>
            <span className="text-[10px] text-textTertiary font-mono">
              Peak: {benchmark.samplesCount > 0 ? `${benchmark.maxRamPercent.toFixed(1)}%` : '—'}
            </span>
          </div>

        </div>
      </div>
    </div>
  );
};
