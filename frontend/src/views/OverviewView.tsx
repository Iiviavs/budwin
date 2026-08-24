import React from 'react';
import { Cpu, Zap, HardDrive, Wifi, ArrowDown, ArrowUp, ShieldCheck } from 'lucide-react';
import { MetricCard } from '../components/MetricCard';
import { TelemetrySnapshot } from '../types';

interface OverviewViewProps {
  telemetry: TelemetrySnapshot | null;
  history: {
    cpu: number[];
    gpu: number[];
    ram: number[];
    net: number[];
  };
}

export const OverviewView: React.FC<OverviewViewProps> = ({ telemetry, history }) => {
  const cpuPercent = telemetry ? Math.round(telemetry.cpuPercent) : 0;
  const ramPercent = telemetry ? Math.round(telemetry.ramPercent) : 0;
  const gpuPercent = telemetry?.gpu.isAvailable ? Math.round(telemetry.gpu.coreUtilization) : 0;
  const netIn = telemetry ? telemetry.netInKb : 0;
  const netOut = telemetry ? telemetry.netOutKb : 0;

  const formatSpeed = (kb: number) => {
    if (kb >= 1024) return `${(kb / 1024).toFixed(1)} MB/s`;
    return `${Math.round(kb)} KB/s`;
  };

  return (
    <div className="space-y-4 p-6 overflow-y-auto max-h-[calc(100vh-2.5rem)]">
      {/* HERO CARD (Matching Reference Image Style) */}
      <div className="glass-card rounded-3xl p-6 border border-border bg-gradient-to-br from-surface to-sidebar space-y-5 shadow-2xl">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-accent-lime to-emerald-400 p-0.5 shadow-xl shadow-accent-lime/10">
              <div className="w-full h-full bg-surface rounded-2xl flex items-center justify-center overflow-hidden">
                <img src="/logo.png" alt="budwin" className="w-full h-full object-cover scale-110" />
              </div>
            </div>

            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[11px] font-bold text-accent-lime uppercase tracking-wider">
                  Hardware Engine Active
                </span>
                <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/20 font-bold">
                  Telemetry 1Hz
                </span>
              </div>
              <h1 className="text-xl font-bold text-white tracking-tight mt-0.5">
                {telemetry?.cpuModel || '11th Gen Intel(R) Core(TM) i5-11400F'}
              </h1>
              <p className="text-xs text-gray-400 mt-0.5 font-medium">
                {telemetry?.cpuCores || 12} Logical Cores • {telemetry?.gpu.name || 'NVIDIA GeForce RTX 3060'}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <div className="px-3.5 py-1.5 rounded-xl bg-accent-lime/10 border border-accent-lime/30 text-accent-lime text-xs font-bold flex items-center space-x-1.5 shadow-sm">
              <ShieldCheck className="w-4 h-4" />
              <span>System Optimized</span>
            </div>
          </div>
        </div>

        {/* Quick Spec Pills */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-1 border-t border-border/60">
          <div className="bg-background/60 border border-border/80 rounded-xl p-3">
            <span className="text-[11px] text-gray-400 block font-medium">Total Memory</span>
            <span className="text-sm font-bold text-white mt-0.5 block">{telemetry?.ramTotalGb || 16} GB DDR4</span>
          </div>

          <div className="bg-background/60 border border-border/80 rounded-xl p-3">
            <span className="text-[11px] text-gray-400 block font-medium">NVIDIA VRAM</span>
            <span className="text-sm font-bold text-white mt-0.5 block">
              {telemetry?.gpu.isAvailable ? `${(telemetry.gpu.vramTotalMb / 1024).toFixed(0)} GB GDDR6` : 'N/A'}
            </span>
          </div>

          <div className="bg-background/60 border border-border/80 rounded-xl p-3">
            <span className="text-[11px] text-gray-400 block font-medium">GPU Thermal</span>
            <span className="text-sm font-bold text-white mt-0.5 block">
              {telemetry?.gpu.isAvailable ? `${telemetry.gpu.temperatureC}°C (Cool)` : 'N/A'}
            </span>
          </div>

          <div className="bg-background/60 border border-border/80 rounded-xl p-3">
            <span className="text-[11px] text-gray-400 block font-medium">Timer Latency</span>
            <span className="text-sm font-bold text-accent-lime mt-0.5 block">1.0ms Resolution</span>
          </div>
        </div>
      </div>

      {/* Grid of Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* CPU Card */}
        <MetricCard
          title="CPU UTILIZATION"
          value={`${cpuPercent}%`}
          subValue={`Load: ${cpuPercent}% • 60s Trend`}
          icon={<Cpu className="w-4 h-4" />}
          accentColor="#38bdf8"
          gradientId="cpuGrad"
          history={history.cpu}
        />

        {/* GPU Card */}
        <MetricCard
          title="NVIDIA GEFORCE GPU"
          value={telemetry?.gpu.isAvailable ? `${gpuPercent}%` : 'N/A'}
          subValue={
            telemetry?.gpu.isAvailable
              ? `Temp: ${telemetry.gpu.temperatureC}°C • VRAM: ${(telemetry.gpu.vramUsedMb / 1024).toFixed(1)} GB • ${telemetry.gpu.powerWatts}W`
              : 'NVIDIA GPU Not Detected'
          }
          icon={<Zap className="w-4 h-4" />}
          accentColor="#22c55e"
          gradientId="gpuGrad"
          history={history.gpu}
        />

        {/* RAM Card */}
        <MetricCard
          title="MEMORY FOOTPRINT"
          value={`${ramPercent}%`}
          subValue={`Used: ${telemetry?.ramUsedGb.toFixed(1) || 0} / ${telemetry?.ramTotalGb.toFixed(1) || 16} GB`}
          icon={<HardDrive className="w-4 h-4" />}
          accentColor="#c084fc"
          gradientId="ramGrad"
          history={history.ram}
        />

        {/* Network Card */}
        <MetricCard
          title="NETWORK THROUGHPUT"
          value={formatSpeed(netIn)}
          subValue={`↓ ${formatSpeed(netIn)}  •  ↑ ${formatSpeed(netOut)}`}
          icon={<Wifi className="w-4 h-4" />}
          accentColor="#22d3ee"
          gradientId="netGrad"
          history={history.net}
          maxHistory={5000}
        />
      </div>

      {/* Bandwidth & Disk Activity Card */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="glass-card rounded-2xl p-4 flex items-center justify-between border border-border">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
              <ArrowDown className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-gray-400 font-medium">Download Rate</div>
              <div className="text-base font-bold text-white">{formatSpeed(netIn)}</div>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-sky-500/10 text-sky-400 flex items-center justify-center">
              <ArrowUp className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-gray-400 font-medium">Upload Rate</div>
              <div className="text-base font-bold text-white">{formatSpeed(netOut)}</div>
            </div>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-4 flex items-center justify-between border border-border">
          <div>
            <div className="text-xs text-gray-400 font-medium">Disk Read Speed</div>
            <div className="text-base font-bold text-white">{telemetry?.diskReadMb.toFixed(1) || 0} MB/s</div>
          </div>
          <div className="text-right">
            <div className="text-xs text-gray-400 font-medium">Disk Write Speed</div>
            <div className="text-base font-bold text-white">{telemetry?.diskWriteMb.toFixed(1) || 0} MB/s</div>
          </div>
        </div>
      </div>
    </div>
  );
};
