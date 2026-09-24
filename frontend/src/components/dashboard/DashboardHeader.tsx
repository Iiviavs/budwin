import React from 'react';
import { TelemetrySnapshot } from '../../types';

interface DashboardHeaderProps {
  telemetry: TelemetrySnapshot | null;
  searchQuery?: string;
  onSearchChange?: (q: string) => void;
  themeMode?: 'dark' | 'light';
  onToggleThemeMode?: () => void;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  telemetry,
}) => {
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return 'Good morning';
    if (hour >= 12 && hour < 18) return 'Good afternoon';
    if (hour >= 18 && hour < 22) return 'Good evening';
    return 'Good night';
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-1">
      <div>
        <h1 className="text-3xl font-medium tracking-tight text-textPrimary">
          {getGreeting()}
        </h1>
        {telemetry ? (
          <div className="flex flex-wrap items-center gap-2 mt-2">
            <span className="text-[11px] font-mono text-textSecondary bg-surface px-2.5 py-1 rounded-lg">
              {telemetry.cpuModel}
            </span>
            <span className="text-[11px] font-mono text-textSecondary bg-surface px-2.5 py-1 rounded-lg">
              {telemetry.cpuCores} Cores
            </span>
            {telemetry.gpu?.isAvailable && telemetry.gpu.name && (
              <span className="text-[11px] font-mono text-textSecondary bg-surface px-2.5 py-1 rounded-lg">
                {telemetry.gpu.name}
              </span>
            )}
          </div>
        ) : (
          <p className="text-xs text-textTertiary mt-1 font-normal">
            Awaiting system telemetry link
          </p>
        )}
      </div>

      <div className="flex items-center space-x-2 shrink-0">
        <div className="flex items-center space-x-2 px-3 py-1.5 rounded-full bg-surface text-[11px] font-mono text-textSecondary">
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              telemetry ? 'bg-textPrimary' : 'bg-textTertiary'
            }`}
          />
          <span>{telemetry ? 'Live Telemetry' : 'Connecting...'}</span>
        </div>
      </div>
    </div>
  );
};
