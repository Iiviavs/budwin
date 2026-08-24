export interface GpuTelemetry {
  isAvailable: boolean;
  name: string;
  coreUtilization: number;
  memoryUtilization: number;
  vramTotalMb: number;
  vramUsedMb: number;
  temperatureC: number;
  fanSpeedPercent: number;
  powerWatts: number;
}

export interface TelemetrySnapshot {
  cpuPercent: number;
  cpuCores: number;
  cpuModel: string;
  ramPercent: number;
  ramUsedGb: number;
  ramTotalGb: number;
  netInKb: number;
  netOutKb: number;
  diskReadMb: number;
  diskWriteMb: number;
  gpu: GpuTelemetry;
}

export interface ProcessItem {
  pid: number;
  name: string;
  description: string;
  memoryMb: number;
  cpuPercent: number;
  category: 'safe' | 'background' | 'protected';
  categoryLabel: string;
}

export interface DriveItem {
  letter: string;
  name: string;
  totalGb: number;
  freeGb: number;
  usedGb: number;
  percentUsed: number;
}

export interface GameBoostResult {
  active: boolean;
  freedRamMb: number;
  timerActive: boolean;
  powerPlan: string;
}

export interface AutoBoostStatus {
  autoBoostEnabled: boolean;
  activeGameName: string;
  activeGamePid: number;
  isBoosting: boolean;
}

export interface BenchmarkSummary {
  isRunning: boolean;
  durationSeconds: number;
  avgCpuPercent: number;
  maxCpuPercent: number;
  avgRamPercent: number;
  maxRamPercent: number;
  maxGpuTemp: number;
  avgGpuLoad: number;
  stabilityScore: number;
  verdict: string;
  samplesCount: number;
}

export interface StartupItem {
  name: string;
  command: string;
  location: string;
  enabled: boolean;
  impact: 'High' | 'Medium' | 'Low';
  description: string;
}

export interface AlertItem {
  id: string;
  type: string;
  severity: string;
  title: string;
  description: string;
  actionLabel: string;
  targetPid?: number;
  timestamp: string;
}

export type ThemeAccent = 'lime' | 'cyan' | 'blurple' | 'amber' | 'rose' | 'emerald';

declare global {
  interface Window {
    go?: {
      main?: {
        App?: {
          GetTelemetry?: () => Promise<TelemetrySnapshot>;
          GetProcesses?: () => Promise<ProcessItem[]>;
          GetDrives?: () => Promise<DriveItem[]>;
          KillProcess?: (pid: number) => Promise<boolean>;
          CleanTempFiles?: () => Promise<number>;
          FlushDNS?: () => Promise<boolean>;
          SetPowerPlan?: (plan: string) => Promise<boolean>;
          GetActivePowerPlan?: () => Promise<string>;
          ToggleHighPrecisionTimer?: (enable: boolean) => Promise<boolean>;
          IsTimerActive?: () => Promise<boolean>;
          OptimizeInputLatency?: () => Promise<boolean>;
          ToggleGameBoost?: (enable: boolean) => Promise<GameBoostResult>;
          IsGameBoostActive?: () => Promise<boolean>;
          PurgeStandbyRAM?: () => Promise<number>;
          GetAutoBoostStatus?: () => Promise<AutoBoostStatus>;
          SetAutoBoostEnabled?: (enable: boolean) => Promise<boolean>;
          StartBenchmark?: () => Promise<BenchmarkSummary>;
          StopBenchmark?: () => Promise<BenchmarkSummary>;
          GetBenchmarkStatus?: () => Promise<BenchmarkSummary>;
          GetStartupItems?: () => Promise<StartupItem[]>;
          ToggleStartupItem?: (name: string, location: string, enable: boolean) => Promise<boolean>;
          GetActiveAlerts?: () => Promise<AlertItem[]>;
          DismissAlert?: (id: string) => Promise<void>;
          ResolveAlert?: (id: string, alertType: string, targetPid: number) => Promise<boolean>;
          SetAlwaysOnTop?: (onTop: boolean) => Promise<void>;
          SetHudMode?: (isHud: boolean) => Promise<void>;
          HideWindow?: () => Promise<void>;
          ShowWindow?: () => Promise<void>;
        };
      };
    };
    runtime?: {
      WindowMinimise?: () => void;
      WindowToggleMaximise?: () => void;
      WindowSetSize?: (width: number, height: number) => void;
      WindowSetAlwaysOnTop?: (onTop: boolean) => void;
      WindowHide?: () => void;
      Quit?: () => void;
    };
  }
}
