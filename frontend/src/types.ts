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
