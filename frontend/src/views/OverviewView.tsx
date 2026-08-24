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
    <div className="p-6 space-y-5 pb-20 font-sans">
      {/* HERO CARD (Borderless Raycast) */}
      <div className="glass-card rounded-2xl p-6 space-y-4 shadow-xl">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3.5">
            <div className="w-12 h-12 rounded-xl bg-[#24252A] p-0.5 shadow-md flex items-center justify-center overflow-hidden">
              <img src="/logo.png" alt="budwin" className="w-full h-full object-cover scale-110" />
            </div>

            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-bold text-accent-theme uppercase tracking-wider">
                  Hardware Engine Active
                </span>
                <span className="text-[10px] bg-emerald-500/15 text-emerald-400 px-2 py-0.5 rounded-md font-bold">
                  1Hz Telemetry
                </span>
              </div>
              <h1 className="text-base font-bold text-white tracking-tight mt-0.5">
                {telemetry?.cpuModel || '11th Gen Intel(R) Core(TM) i5-11400F'}
              </h1>
              <p className="text-xs text-neutral-400 mt-0.5 font-normal">
                {telemetry?.cpuCores || 12} Logical Cores • {telemetry?.gpu.name || 'NVIDIA GeForce RTX 3060'}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <div className="px-3 py-1.5 rounded-lg bg-[#24252A] text-white text-xs font-semibold flex items-center space-x-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>System Protected</span>
            </div>
          </div>
        </div>

        {/* Quick Spec Pills */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 pt-2 border-t border-white/[0.04]">
          <div className="bg-[#111215] rounded-xl p-3">
            <span className="text-[11px] text-neutral-400 block">Total Memory</span>
            <span className="text-xs font-bold text-white mt-0.5 block">{telemetry?.ramTotalGb || 16} GB DDR4</span>
          </div>

          <div className="bg-[#111215] rounded-xl p-3">
            <span className="text-[11px] text-neutral-400 block">NVIDIA VRAM</span>
            <span className="text-xs font-bold text-white mt-0.5 block">
              {telemetry?.gpu.isAvailable ? `${(telemetry.gpu.vramTotalMb / 1024).toFixed(0)} GB GDDR6` : 'N/A'}
            </span>
          </div>

          <div className="bg-[#111215] rounded-xl p-3">
            <span className="text-[11px] text-neutral-400 block">GPU Thermal</span>
            <span className="text-xs font-bold text-white mt-0.5 block">
              {telemetry?.gpu.isAvailable ? `${telemetry.gpu.temperatureC}°C (Cool)` : 'N/A'}
            </span>
          </div>

          <div className="bg-[#111215] rounded-xl p-3">
            <span className="text-[11px] text-neutral-400 block">Timer Latency</span>
            <span className="text-xs font-bold text-accent-theme mt-0.5 block">1.0ms Resolution</span>
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
        <div className="glass-card rounded-2xl p-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
              <ArrowDown className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs text-neutral-400 font-medium">Download Rate</div>
              <div className="text-sm font-bold text-white">{formatSpeed(netIn)}</div>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-sky-500/10 text-sky-400 flex items-center justify-center">
              <ArrowUp className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs text-neutral-400 font-medium">Upload Rate</div>
              <div className="text-sm font-bold text-white">{formatSpeed(netOut)}</div>
            </div>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-4 flex items-center justify-between">
          <div>
            <div className="text-xs text-neutral-400 font-medium">Disk Read Speed</div>
            <div className="text-sm font-bold text-white">{telemetry?.diskReadMb.toFixed(1) || 0} MB/s</div>
          </div>
          <div className="text-right">
            <div className="text-xs text-neutral-400 font-medium">Disk Write Speed</div>
            <div className="text-sm font-bold text-white">{telemetry?.diskWriteMb.toFixed(1) || 0} MB/s</div>
          </div>
        </div>
      </div>
    </div>
  );
};
