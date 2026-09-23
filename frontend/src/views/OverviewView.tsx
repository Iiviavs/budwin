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
  const cpuPercent = telemetry ? Math.round(telemetry.cpuPercent) : null;
  const ramPercent = telemetry ? Math.round(telemetry.ramPercent) : null;
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
                  {telemetry ? 'Hardware telemetry active' : 'Waiting for Windows telemetry'}
                </span>
                <span className="text-[10px] bg-emerald-500/15 text-emerald-400 px-2 py-0.5 rounded-md font-bold">
                  {telemetry ? '1Hz Telemetry' : 'Unavailable'}
                </span>
              </div>
              <h1 className="text-base font-bold text-white tracking-tight mt-0.5">
                {telemetry?.cpuModel || 'CPU details unavailable'}
              </h1>
              <p className="text-xs text-neutral-400 mt-0.5 font-normal">
                {telemetry ? `${telemetry.cpuCores} Cores` : 'Hardware details unavailable'} • {telemetry?.gpu.isAvailable ? telemetry.gpu.name : 'GPU not detected'}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <div className="px-3 py-1.5 rounded-lg bg-[#24252A] text-white text-xs font-semibold flex items-center space-x-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Windows status</span>
            </div>
          </div>
        </div>

        {/* Quick Spec Pills */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 pt-2 border-t border-white/[0.04]">
          <div className="bg-[#111215] rounded-xl p-3">
            <span className="text-[11px] text-neutral-400 block">Total Memory</span>
            <span className="text-xs font-bold text-white mt-0.5 block">{telemetry ? `${telemetry.ramTotalGb.toFixed(1)} GB` : 'N/A'}</span>
          </div>

          <div className="bg-[#111215] rounded-xl p-3">
            <span className="text-[11px] text-neutral-400 block">GPU VRAM</span>
            <span className="text-xs font-bold text-white mt-0.5 block">
              {telemetry?.gpu.isAvailable ? `${(telemetry.gpu.vramTotalMb / 1024).toFixed(0)} GB GDDR6` : 'N/A'}
            </span>
          </div>

          <div className="bg-[#111215] rounded-xl p-3">
            <span className="text-[11px] text-neutral-400 block">GPU Thermal</span>
            <span className="text-xs font-bold text-white mt-0.5 block">
              {telemetry?.gpu.isAvailable ? `${telemetry.gpu.temperatureC}°C` : 'N/A'}
            </span>
          </div>

          <div className="bg-[#111215] rounded-xl p-3">
            <span className="text-[11px] text-neutral-400 block">Telemetry</span>
            <span className="text-xs font-bold text-accent-theme mt-0.5 block">{telemetry ? 'Live' : 'Unavailable'}</span>
          </div>
        </div>
      </div>

      {/* Grid of Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* CPU Card */}
        <MetricCard
          title="CPU UTILIZATION"
          value={cpuPercent === null ? 'N/A' : `${cpuPercent}%`}
          subValue={cpuPercent === null ? 'Waiting for Windows telemetry' : `Load: ${cpuPercent}% • 60s Trend`}
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
          value={ramPercent === null ? 'N/A' : `${ramPercent}%`}
          subValue={telemetry ? `Used: ${telemetry.ramUsedGb.toFixed(1)} / ${telemetry.ramTotalGb.toFixed(1)} GB` : 'Memory telemetry unavailable'}
          icon={<HardDrive className="w-4 h-4" />}
          accentColor="#c084fc"
          gradientId="ramGrad"
          history={history.ram}
        />

        {/* Network Card */}
        <MetricCard
          title="NETWORK THROUGHPUT"
          value={telemetry ? formatSpeed(netIn) : 'N/A'}
          subValue={telemetry ? `↓ ${formatSpeed(netIn)}  •  ↑ ${formatSpeed(netOut)}` : 'Network telemetry unavailable'}
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
            <div className="text-sm font-bold text-white">{telemetry ? `${telemetry.diskReadMb.toFixed(1)} MB/s` : 'N/A'}</div>
          </div>
          <div className="text-right">
            <div className="text-xs text-neutral-400 font-medium">Disk Write Speed</div>
            <div className="text-sm font-bold text-white">{telemetry ? `${telemetry.diskWriteMb.toFixed(1)} MB/s` : 'N/A'}</div>
          </div>
        </div>
      </div>
    </div>
  );
};
