import React from 'react';
import { Cpu, Zap, HardDrive, Wifi, ArrowDown, ArrowUp } from 'lucide-react';
import { TelemetrySnapshot } from '../../types';
import { Sparkline } from '../Sparkline';

interface DashboardTelemetryHeroProps {
  telemetry: TelemetrySnapshot | null;
  history: {
    cpu: number[];
    gpu: number[];
    ram: number[];
    net: number[];
  };
}

export const DashboardTelemetryHero: React.FC<DashboardTelemetryHeroProps> = ({
  telemetry,
  history,
}) => {
  const cpuPercent = telemetry ? Math.round(telemetry.cpuPercent) : null;
  const ramPercent = telemetry ? Math.round(telemetry.ramPercent) : null;
  const gpuPercent = telemetry?.gpu?.isAvailable ? Math.round(telemetry.gpu.coreUtilization) : null;
  const netIn = telemetry ? telemetry.netInKb : 0;
  const netOut = telemetry ? telemetry.netOutKb : 0;
  const netTotal = netIn + netOut;

  const formatSpeed = (kb: number) => {
    if (kb >= 1024) return `${(kb / 1024).toFixed(1)} MB/s`;
    return `${Math.round(kb)} KB/s`;
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between px-1">
        <span className="tracking-wide uppercase text-[11px] font-medium text-textTertiary/80 select-none">
          Live Telemetry
        </span>
        {telemetry && (
          <span className="text-[11px] text-textTertiary font-mono">
            {telemetry.cpuCores} Cores • {telemetry.ramTotalGb.toFixed(0)} GB Memory
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 animate-fade-in">
        <div className="bg-surface hover:bg-surfaceHover/70 rounded-2xl p-5 flex flex-col justify-between space-y-4 transition-all duration-150">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="w-7 h-7 rounded-lg bg-surfaceSubtle flex items-center justify-center text-textSecondary">
                <Cpu className="w-3.5 h-3.5" />
              </div>
              <span className="text-[13px] font-medium text-textPrimary tracking-tight">Processor</span>
            </div>
            <span className="text-[11px] font-mono text-textTertiary">
              {telemetry ? `${telemetry.cpuCores} Cores` : '—'}
            </span>
          </div>

          <div>
            <div className="text-3xl font-semibold text-textPrimary tracking-tight font-mono tabular-nums">
              {cpuPercent === null ? '—' : `${cpuPercent}%`}
            </div>
            <span className="text-[11px] font-mono text-textTertiary block mt-0.5">
              Core utilization
            </span>
          </div>

          <div className="pt-1">
            <Sparkline
              data={history.cpu}
              max={100}
              gradientId="dashHeroCpu"
              height={34}
            />
          </div>

          <div className="text-[11px] text-textTertiary font-mono flex items-center justify-between pt-1">
            <span>Load</span>
            <span className="text-textSecondary">{telemetry ? `${telemetry.cpuPercent.toFixed(1)}%` : '—'}</span>
          </div>
        </div>

        <div className="bg-surface hover:bg-surfaceHover/70 rounded-2xl p-5 flex flex-col justify-between space-y-4 transition-all duration-150">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="w-7 h-7 rounded-lg bg-surfaceSubtle flex items-center justify-center text-textSecondary">
                <Zap className="w-3.5 h-3.5" />
              </div>
              <span className="text-[13px] font-medium text-textPrimary tracking-tight">Graphics</span>
            </div>
            <span className="text-[11px] font-mono text-textTertiary">
              {telemetry?.gpu?.isAvailable ? `${telemetry.gpu.temperatureC}°C` : '—'}
            </span>
          </div>

          <div>
            <div className="text-3xl font-semibold text-textPrimary tracking-tight font-mono tabular-nums">
              {gpuPercent === null ? '—' : `${gpuPercent}%`}
            </div>
            <span className="text-[11px] font-mono text-textTertiary block mt-0.5">
              {telemetry?.gpu?.isAvailable ? telemetry.gpu.name || 'GPU Engine' : 'Integrated Graphics'}
            </span>
          </div>

          <div className="pt-1">
            <Sparkline
              data={history.gpu}
              max={100}
              gradientId="dashHeroGpu"
              height={34}
            />
          </div>

          <div className="text-[11px] text-textTertiary font-mono flex items-center justify-between pt-1">
            <span>VRAM</span>
            <span className="text-textSecondary">
              {telemetry?.gpu?.isAvailable
                ? `${(telemetry.gpu.vramUsedMb / 1024).toFixed(1)} GB`
                : 'Unified'}
            </span>
          </div>
        </div>

        <div className="bg-surface hover:bg-surfaceHover/70 rounded-2xl p-5 flex flex-col justify-between space-y-4 transition-all duration-150">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="w-7 h-7 rounded-lg bg-surfaceSubtle flex items-center justify-center text-textSecondary">
                <HardDrive className="w-3.5 h-3.5" />
              </div>
              <span className="text-[13px] font-medium text-textPrimary tracking-tight">Memory</span>
            </div>
            <span className="text-[11px] font-mono text-textTertiary">
              {telemetry ? `${telemetry.ramTotalGb.toFixed(0)} GB Total` : '—'}
            </span>
          </div>

          <div>
            <div className="text-3xl font-semibold text-textPrimary tracking-tight font-mono tabular-nums">
              {ramPercent === null ? '—' : `${ramPercent}%`}
            </div>
            <span className="text-[11px] font-mono text-textTertiary block mt-0.5">
              {telemetry ? `${telemetry.ramUsedGb.toFixed(1)} GB in use` : 'Standby memory'}
            </span>
          </div>

          <div className="pt-1">
            <Sparkline
              data={history.ram}
              max={100}
              gradientId="dashHeroRam"
              height={34}
            />
          </div>

          <div className="text-[11px] text-textTertiary font-mono flex items-center justify-between pt-1">
            <span>Available</span>
            <span className="text-textSecondary">
              {telemetry
                ? `${(telemetry.ramTotalGb - telemetry.ramUsedGb).toFixed(1)} GB`
                : '—'}
            </span>
          </div>
        </div>

        <div className="bg-surface hover:bg-surfaceHover/70 rounded-2xl p-5 flex flex-col justify-between space-y-4 transition-all duration-150">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="w-7 h-7 rounded-lg bg-surfaceSubtle flex items-center justify-center text-textSecondary">
                <Wifi className="w-3.5 h-3.5" />
              </div>
              <span className="text-[13px] font-medium text-textPrimary tracking-tight">Network</span>
            </div>
            <span className="text-[11px] font-mono text-textTertiary">
              {formatSpeed(netTotal)}
            </span>
          </div>

          <div>
            <div className="text-3xl font-semibold text-textPrimary tracking-tight font-mono tabular-nums">
              {telemetry ? formatSpeed(netIn) : '—'}
            </div>
            <span className="text-[11px] font-mono text-textTertiary block mt-0.5">
              Inbound throughput
            </span>
          </div>

          <div className="pt-1">
            <Sparkline
              data={history.net}
              max={Math.max(1024, ...history.net)}
              gradientId="dashHeroNet"
              height={34}
            />
          </div>

          <div className="text-[11px] text-textTertiary font-mono flex items-center justify-between pt-1">
            <div className="flex items-center space-x-1">
              <ArrowDown className="w-3 h-3 text-textTertiary" />
              <span className="text-textSecondary">{formatSpeed(netIn)}</span>
            </div>
            <div className="flex items-center space-x-1">
              <ArrowUp className="w-3 h-3 text-textTertiary" />
              <span className="text-textSecondary">{formatSpeed(netOut)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
