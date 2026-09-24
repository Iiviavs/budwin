import React from 'react';
import { HardDrive, Cpu, Zap } from 'lucide-react';
import { DriveItem, TelemetrySnapshot } from '../../types';

interface DashboardModulesGridProps {
  telemetry: TelemetrySnapshot | null;
  drives: DriveItem[];
  onNavigateTab: (tab: any) => void;
}

export const DashboardModulesGrid: React.FC<DashboardModulesGridProps> = ({
  telemetry,
  drives,
  onNavigateTab,
}) => {
  const realUnits = [
    ...(telemetry?.cpuModel
      ? [
          {
            id: 'unit-cpu',
            title: telemetry.cpuModel,
            subtitle: `${telemetry.cpuCores} Physical Cores`,
            metricLeft: `${Math.round(telemetry.cpuPercent)}% Active`,
            metricRight: `${telemetry.cpuCores} Cores`,
            percent: Math.round(telemetry.cpuPercent),
            icon: <Cpu className="w-4 h-4 text-textSecondary" />,
            targetTab: 'processes',
          },
        ]
      : []),
    ...(telemetry?.gpu?.isAvailable && telemetry.gpu.name
      ? [
          {
            id: 'unit-gpu',
            title: telemetry.gpu.name,
            subtitle: `${(telemetry.gpu.vramTotalMb / 1024).toFixed(0)} GB Graphics VRAM`,
            metricLeft: `${telemetry.gpu.temperatureC}°C Operating`,
            metricRight: `${Math.round(telemetry.gpu.coreUtilization)}% Load`,
            percent: Math.round(telemetry.gpu.coreUtilization),
            icon: <Zap className="w-4 h-4 text-textSecondary" />,
            targetTab: 'overview',
          },
        ]
      : []),
    ...drives.map((d) => ({
      id: `unit-drive-${d.letter}`,
      title: `Disk ${d.letter}: ${d.name ? `(${d.name})` : ''}`,
      subtitle: `${d.freeGb.toFixed(1)} GB Available`,
      metricLeft: `${d.percentUsed.toFixed(0)}% Used`,
      metricRight: `${(d.totalGb - d.freeGb).toFixed(0)} / ${d.totalGb.toFixed(0)} GB`,
      percent: Math.round(d.percentUsed),
      icon: <HardDrive className="w-4 h-4 text-textSecondary" />,
      targetTab: 'storage',
    })),
  ];

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between px-1">
        <span className="tracking-wide uppercase text-[11px] font-medium text-textTertiary/80 select-none">
          Mounted Volumes & Silicon
        </span>
        <span className="text-[11px] text-textTertiary font-mono">
          {realUnits.length} Devices Online
        </span>
      </div>

      {realUnits.length === 0 ? (
        <div className="bg-surface rounded-2xl p-6 text-center text-xs text-textTertiary font-mono">
          Detecting mounted storage partitions and hardware buses...
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 animate-fade-in">
          {realUnits.map((item) => (
            <div
              key={item.id}
              onClick={() => onNavigateTab(item.targetTab)}
              className="group bg-surface hover:bg-surfaceHover/70 rounded-2xl p-5 flex flex-col justify-between transition-all duration-150 cursor-pointer select-none space-y-3.5"
            >
              <div className="flex items-start space-x-3 overflow-hidden">
                <div className="w-9 h-9 rounded-xl bg-surfaceSubtle flex items-center justify-center shrink-0 group-hover:bg-surface transition-colors">
                  {item.icon}
                </div>
                <div className="overflow-hidden flex-1">
                  <span className="font-semibold text-[13px] text-textPrimary truncate block tracking-tight">
                    {item.title}
                  </span>
                  <span className="text-[11px] text-textTertiary font-mono truncate block mt-0.5">
                    {item.subtitle}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="w-full bg-surfaceSubtle rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-textPrimary h-full rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(100, Math.max(0, item.percent))}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-[11px] font-mono text-textTertiary">
                  <span>{item.metricLeft}</span>
                  <span className="text-textSecondary">{item.metricRight}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
