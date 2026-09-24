import React from 'react';
import { TelemetrySnapshot, DriveItem } from '../types';
import { TabType } from '../components/Sidebar';
import { DashboardHeader } from '../components/dashboard/DashboardHeader';
import { DashboardTelemetryHero } from '../components/dashboard/DashboardTelemetryHero';
import { DashboardModulesGrid } from '../components/dashboard/DashboardModulesGrid';
import { DashboardAssistantCard } from '../components/dashboard/DashboardAssistantCard';

interface OverviewViewProps {
  telemetry: TelemetrySnapshot | null;
  history: {
    cpu: number[];
    gpu: number[];
    ram: number[];
    net: number[];
  };
  drives?: DriveItem[];
  timerActive?: boolean;
  powerPlan?: string;
  themeMode?: 'dark' | 'light';
  onToggleThemeMode?: () => void;
  onToggleTimer?: () => Promise<boolean>;
  onPurgeStandby?: () => Promise<number | null>;
  onNavigateTab?: (tab: TabType) => void;
}

export const OverviewView: React.FC<OverviewViewProps> = ({
  telemetry,
  history,
  drives = [],
  timerActive = true,
  onToggleTimer = async () => false,
  onPurgeStandby,
  onNavigateTab = () => {},
}) => {
  return (
    <div className="p-6 md:p-8 space-y-6 pb-24 font-sans max-w-5xl mx-auto">
      <DashboardHeader telemetry={telemetry} />

      <DashboardTelemetryHero
        telemetry={telemetry}
        history={history}
      />

      <DashboardModulesGrid
        telemetry={telemetry}
        drives={drives}
        onNavigateTab={onNavigateTab}
      />

      <DashboardAssistantCard
        telemetry={telemetry}
        timerActive={timerActive}
        onToggleTimer={onToggleTimer}
        onPurgeStandby={onPurgeStandby}
        onNavigateTab={onNavigateTab}
      />
    </div>
  );
};
