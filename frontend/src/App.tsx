import { useState, useEffect } from 'react';
import { Navbar, TabType } from './components/Navbar';
import { OverviewView } from './views/OverviewView';
import { ProcessesView } from './views/ProcessesView';
import { StorageView } from './views/StorageView';
import { OptimizerView } from './views/OptimizerView';
import { TelemetrySnapshot, ProcessItem, DriveItem } from './types';

// Wails runtime bindings (if running inside Wails desktop window)
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
        };
      };
    };
    runtime?: {
      WindowMinimise?: () => void;
      Quit?: () => void;
    };
  }
}

export function App() {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [telemetry, setTelemetry] = useState<TelemetrySnapshot | null>(null);
  const [processes, setProcesses] = useState<ProcessItem[]>([]);
  const [drives, setDrives] = useState<DriveItem[]>([
    { letter: 'C', name: 'System', totalGb: 444.7, usedGb: 313.2, freeGb: 131.5, percentUsed: 70.4 },
    { letter: 'D', name: 'Games & Data', totalGb: 931.5, usedGb: 543.6, freeGb: 387.9, percentUsed: 58.4 },
  ]);
  const [powerPlan, setPowerPlan] = useState('Balanced');

  // Ring histories for sparkline charts (60 points)
  const [history, setHistory] = useState<{
    cpu: number[];
    gpu: number[];
    ram: number[];
    net: number[];
  }>({
    cpu: Array(60).fill(15),
    gpu: Array(60).fill(5),
    ram: Array(60).fill(72),
    net: Array(60).fill(120),
  });

  // Fetch telemetry every 1 second
  useEffect(() => {
    const fetchTelemetry = async () => {
      if (window.go?.main?.App?.GetTelemetry) {
        try {
          const telem = await window.go.main.App.GetTelemetry();
          setTelemetry(telem);

          setHistory((prev) => ({
            cpu: [...prev.cpu.slice(1), telem.cpuPercent],
            gpu: [...prev.gpu.slice(1), telem.gpu.isAvailable ? telem.gpu.coreUtilization : 0],
            ram: [...prev.ram.slice(1), telem.ramPercent],
            net: [...prev.net.slice(1), telem.netInKb],
          }));
        } catch { }
      } else {
        // Fallback simulation for live preview
        const mockCpu = Math.floor(Math.random() * 20) + 10;
        const mockGpu = Math.floor(Math.random() * 10) + 5;
        const mockRam = 72.4;
        const mockNetIn = Math.floor(Math.random() * 250) + 50;

        setTelemetry({
          cpuPercent: mockCpu,
          cpuCores: 12,
          cpuModel: '11th Gen Intel(R) Core(TM) i5-11400F @ 2.60GHz',
          ramPercent: mockRam,
          ramUsedGb: 11.5,
          ramTotalGb: 15.8,
          netInKb: mockNetIn,
          netOutKb: 24,
          diskReadMb: 0.8,
          diskWriteMb: 0.2,
          gpu: {
            isAvailable: true,
            name: 'NVIDIA GeForce RTX 3060',
            coreUtilization: mockGpu,
            memoryUtilization: 14,
            vramTotalMb: 8192,
            vramUsedMb: 970,
            temperatureC: 54,
            fanSpeedPercent: 0,
            powerWatts: 28,
          },
        });

        setHistory((prev) => ({
          cpu: [...prev.cpu.slice(1), mockCpu],
          gpu: [...prev.gpu.slice(1), mockGpu],
          ram: [...prev.ram.slice(1), mockRam],
          net: [...prev.net.slice(1), mockNetIn],
        }));
      }
    };

    fetchTelemetry();
    const interval = setInterval(fetchTelemetry, 1000);
    return () => clearInterval(interval);
  }, []);

  // Fetch Processes & Drives
  const loadProcesses = async () => {
    if (window.go?.main?.App?.GetProcesses) {
      try {
        const list = await window.go.main.App.GetProcesses();
        setProcesses(list);
      } catch { }
    } else {
      setProcesses([
        { pid: 27004, name: 'chrome.exe', description: 'Google Chrome Web Browser', memoryMb: 1420.5, cpuPercent: 4.2, category: 'safe', categoryLabel: 'User Application' },
        { pid: 17396, name: 'steamwebhelper.exe', description: 'Steam Client Web Helper', memoryMb: 980.2, cpuPercent: 1.1, category: 'safe', categoryLabel: 'User Application' },
        { pid: 24110, name: 'Discord.exe', description: 'Discord Voice & Text Chat', memoryMb: 850.4, cpuPercent: 1.8, category: 'safe', categoryLabel: 'User Application' },
        { pid: 8740, name: 'nvcontainer.exe', description: 'NVIDIA Container Service', memoryMb: 96.0, cpuPercent: 0.2, category: 'background', categoryLabel: 'Background Helper' },
        { pid: 10292, name: 'explorer.exe', description: 'Windows Shell & Taskbar', memoryMb: 227.7, cpuPercent: 0.5, category: 'protected', categoryLabel: 'Critical System' },
        { pid: 5172, name: 'ShellHost.exe', description: 'Windows Shell Host', memoryMb: 110.2, cpuPercent: 0.1, category: 'protected', categoryLabel: 'Critical System' },
        { pid: 12936, name: 'Antigravity.exe', description: 'Antigravity AI Assistant', memoryMb: 860.0, cpuPercent: 2.5, category: 'safe', categoryLabel: 'User Application' },
      ]);
    }
  };

  const loadDrives = async () => {
    if (window.go?.main?.App?.GetDrives) {
      try {
        const d = await window.go.main.App.GetDrives();
        setDrives(d);
      } catch { }
    }
  };

  useEffect(() => {
    loadProcesses();
    loadDrives();
    if (window.go?.main?.App?.GetActivePowerPlan) {
      window.go.main.App.GetActivePowerPlan().then((p) => setPowerPlan(p));
    }
  }, []);

  const handleKillProcess = async (pid: number) => {
    if (window.go?.main?.App?.KillProcess) {
      await window.go.main.App.KillProcess(pid);
      loadProcesses();
    } else {
      setProcesses((prev) => prev.filter((p) => p.pid !== pid));
    }
  };

  const handleCleanTemp = async (): Promise<number> => {
    if (window.go?.main?.App?.CleanTempFiles) {
      return await window.go.main.App.CleanTempFiles();
    }
    return 342.8;
  };

  const handleFlushDNS = async (): Promise<boolean> => {
    if (window.go?.main?.App?.FlushDNS) {
      return await window.go.main.App.FlushDNS();
    }
    return true;
  };

  const handleSetPowerPlan = async (plan: string): Promise<boolean> => {
    setPowerPlan(plan);
    if (window.go?.main?.App?.SetPowerPlan) {
      return await window.go.main.App.SetPowerPlan(plan);
    }
    return true;
  };

  return (
    <div className="h-screen w-screen bg-background flex flex-col select-none text-gray-100 font-sans">
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onMinimize={() => window.runtime?.WindowMinimise?.()}
        onClose={() => window.runtime?.Quit?.()}
      />

      <main className="flex-1 overflow-hidden">
        {activeTab === 'overview' && (
          <OverviewView telemetry={telemetry} history={history} />
        )}
        {activeTab === 'processes' && (
          <ProcessesView
            processes={processes}
            onRefresh={loadProcesses}
            onKillProcess={handleKillProcess}
          />
        )}
        {activeTab === 'storage' && <StorageView drives={drives} />}
        {activeTab === 'optimizer' && (
          <OptimizerView
            currentPowerPlan={powerPlan}
            onCleanTemp={handleCleanTemp}
            onFlushDNS={handleFlushDNS}
            onSetPowerPlan={handleSetPowerPlan}
          />
        )}
      </main>
    </div>
  );
}

export default App;
