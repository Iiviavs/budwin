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
          HideWindow?: () => Promise<void>;
          ShowWindow?: () => Promise<void>;
        };
      };
    };
    runtime?: {
      WindowMinimise?: () => void;
      WindowToggleMaximise?: () => void;
      WindowSetSize?: (width: number, height: number) => void;
      WindowHide?: () => void;
      Quit?: () => void;
    };
  }
}
