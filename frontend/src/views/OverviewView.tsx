import React from 'react';
import { Cpu, Zap, HardDrive, Wifi, ArrowDown, ArrowUp } from 'lucide-react';
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
    <div className="space-y-4 p-6 overflow-y-auto max-h-[calc(100vh-3.5rem)]">
      {/* System Status Banner */}
      <div className="glass-card rounded-2xl p-5 border border-border/80 flex items-center justify-between">
        <div>
          <div className="text-xs font-semibold text-sky-400 uppercase tracking-wider mb-1">
            System Telemetry Active
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            {telemetry?.cpuModel || '11th Gen Intel(R) Core(TM) i5-11400F'}
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">
            {telemetry?.cpuCores || 12} Logical Cores • {telemetry?.gpu.name || 'NVIDIA GeForce RTX 3060'}
          </p>
        </div>

        <div className="flex items-center space-x-6">
          <div className="text-right">
            <span className="text-xs text-gray-400">Total RAM</span>
            <div className="text-lg font-bold text-white">{telemetry?.ramTotalGb || 16} GB</div>
          </div>
          <div className="text-right">
            <span className="text-xs text-gray-400">GPU VRAM</span>
            <div className="text-lg font-bold text-white">
              {telemetry?.gpu.isAvailable ? `${(telemetry.gpu.vramTotalMb / 1024).toFixed(0)} GB` : 'N/A'}
            </div>
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
          title="NVIDIA GPU"
          value={telemetry?.gpu.isAvailable ? `${gpuPercent}%` : 'N/A'}
          subValue={
            telemetry?.gpu.isAvailable
              ? `Temp: ${telemetry.gpu.temperatureC}°C • VRAM: ${(telemetry.gpu.vramUsedMb / 1024).toFixed(1)} GB`
              : 'NVIDIA GPU Not Detected'
          }
          icon={<Zap className="w-4 h-4" />}
          accentColor="#4ade80"
          gradientId="gpuGrad"
          history={history.gpu}
        />

        {/* RAM Card */}
        <MetricCard
          title="MEMORY USAGE"
          value={`${ramPercent}%`}
          subValue={`Used: ${telemetry?.ramUsedGb.toFixed(1) || 0} / ${telemetry?.ramTotalGb.toFixed(1) || 16} GB`}
          icon={<HardDrive className="w-4 h-4" />}
          accentColor="#c084fc"
          gradientId="ramGrad"
          history={history.ram}
        />

        {/* Network Card */}
        <MetricCard
          title="NETWORK ACTIVITY"
          value={formatSpeed(netIn)}
          subValue={`↓ ${formatSpeed(netIn)}  •  ↑ ${formatSpeed(netOut)}`}
          icon={<Wifi className="w-4 h-4" />}
          accentColor="#22d3ee"
          gradientId="netGrad"
          history={history.net}
          maxHistory={5000}
        />
      </div>

      {/* Live Bandwidth & Disk IO Strip */}
      <div className="grid grid-cols-2 gap-4">
        <div className="glass-card rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
              <ArrowDown className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-gray-400">Download Rate</div>
              <div className="text-base font-bold text-white">{formatSpeed(netIn)}</div>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-lg bg-sky-500/10 text-sky-400 flex items-center justify-center">
              <ArrowUp className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-gray-400">Upload Rate</div>
              <div className="text-base font-bold text-white">{formatSpeed(netOut)}</div>
            </div>
          </div>
        </div>

        <div className="glass-card rounded-xl p-4 flex items-center justify-between">
          <div>
            <div className="text-xs text-gray-400">Disk Read Activity</div>
            <div className="text-base font-bold text-white">{telemetry?.diskReadMb.toFixed(1) || 0} MB/s</div>
          </div>
          <div className="text-right">
            <div className="text-xs text-gray-400">Disk Write Activity</div>
            <div className="text-base font-bold text-white">{telemetry?.diskWriteMb.toFixed(1) || 0} MB/s</div>
          </div>
        </div>
      </div>
    </div>
  );
};
