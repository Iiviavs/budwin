import { useState, useEffect } from 'react';
import { Navbar, TabType } from './components/Navbar';
import { OverviewView } from './views/OverviewView';
import { ProcessesView } from './views/ProcessesView';
import { StorageView } from './views/StorageView';
import { OptimizerView } from './views/OptimizerView';
import { TelemetrySnapshot, ProcessItem, DriveItem } from './types';
import { Sparkline } from './components/Sparkline';
import { EndProcessModal } from './components/EndProcessModal';
import { Maximize2, Cpu, Zap, HardDrive, Wifi, ShieldAlert, AlertTriangle, CheckCircle2, XCircle } from 'lucide-react';

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
      WindowSetSize?: (width: number, height: number) => void;
      Quit?: () => void;
    };
  }
}

export function App() {
  const [isMiniMode, setIsMiniMode] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [telemetry, setTelemetry] = useState<TelemetrySnapshot | null>(null);
  const [processes, setProcesses] = useState<ProcessItem[]>([]);
  const [drives, setDrives] = useState<DriveItem[]>([
    { letter: 'C', name: 'System', totalGb: 444.7, usedGb: 313.2, freeGb: 131.5, percentUsed: 70.4 },
    { letter: 'D', name: 'Games & Data', totalGb: 931.5, usedGb: 543.6, freeGb: 387.9, percentUsed: 58.4 },
  ]);
  const [powerPlan, setPowerPlan] = useState('Balanced');
  const [targetProcess, setTargetProcess] = useState<ProcessItem | null>(null);

  // 60-point history buffers
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

  const toggleMiniMode = (toMini: boolean) => {
    setIsMiniMode(toMini);
    if (toMini) {
      window.runtime?.WindowSetSize?.(380, 580);
    } else {
      window.runtime?.WindowSetSize?.(960, 680);
    }
  };

  // Telemetry loop
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
        const mockCpu = Math.floor(Math.random() * 20) + 12;
        const mockGpu = Math.floor(Math.random() * 10) + 4;
        const mockRam = 72.8;
        const mockNetIn = Math.floor(Math.random() * 300) + 50;

        setTelemetry({
          cpuPercent: mockCpu,
          cpuCores: 12,
          cpuModel: '11th Gen Intel(R) Core(TM) i5-11400F @ 2.60GHz',
          ramPercent: mockRam,
          ramUsedGb: 11.6,
          ramTotalGb: 15.8,
          netInKb: mockNetIn,
          netOutKb: 32,
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

  const formatSpeed = (kb: number) => {
    if (kb >= 1024) return `${(kb / 1024).toFixed(1)} MB/s`;
    return `${Math.round(kb)} KB/s`;
  };

  // MINI TRAY COMPANION VIEW
  if (isMiniMode) {
    const cpuVal = telemetry ? Math.round(telemetry.cpuPercent) : 0;
    const gpuVal = telemetry?.gpu.isAvailable ? Math.round(telemetry.gpu.coreUtilization) : 0;
    const ramVal = telemetry ? Math.round(telemetry.ramPercent) : 0;
    const netInVal = telemetry ? telemetry.netInKb : 0;

    return (
      <div className="h-screen w-screen bg-background border border-border/80 flex flex-col justify-between p-4 select-none font-sans text-gray-100">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-border/60">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 rounded bg-gradient-to-tr from-sky-500 to-emerald-400 flex items-center justify-center text-xs font-bold text-white">
              ⚡
            </div>
            <span className="font-bold text-sm text-white">budwin</span>
            <span className="text-[10px] text-gray-400">Mini Tray View</span>
          </div>

          <button
            onClick={() => toggleMiniMode(false)}
            className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 border border-sky-500/20 text-xs font-bold transition-all shadow-sm"
          >
            <span>See More</span>
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* 2x2 Mini Metrics Grid */}
        <div className="grid grid-cols-2 gap-2.5 my-3">
          {/* CPU Card */}
          <div className="glass-card rounded-xl p-3 flex flex-col justify-between">
            <div className="flex justify-between items-center text-xs">
              <span className="flex items-center space-x-1 font-bold text-sky-400">
                <Cpu className="w-3.5 h-3.5" />
                <span>CPU</span>
              </span>
              <span className="font-bold text-white text-sm">{cpuVal}%</span>
            </div>
            <div className="my-1.5">
              <Sparkline data={history.cpu} max={100} color="#38bdf8" gradientId="miniCpu" height={32} />
            </div>
            <span className="text-[10px] text-gray-400">60s Trend</span>
          </div>

          {/* GPU Card */}
          <div className="glass-card rounded-xl p-3 flex flex-col justify-between">
            <div className="flex justify-between items-center text-xs">
              <span className="flex items-center space-x-1 font-bold text-emerald-400">
                <Zap className="w-3.5 h-3.5" />
                <span>GPU</span>
              </span>
              <span className="font-bold text-white text-sm">
                {telemetry?.gpu.isAvailable ? `${gpuVal}%` : 'N/A'}
              </span>
            </div>
            <div className="my-1.5">
              <Sparkline data={history.gpu} max={100} color="#4ade80" gradientId="miniGpu" height={32} />
            </div>
            <span className="text-[10px] text-gray-400">
              {telemetry?.gpu.isAvailable ? `${telemetry.gpu.temperatureC}°C Temp` : 'NVIDIA'}
            </span>
          </div>

          {/* RAM Card */}
          <div className="glass-card rounded-xl p-3 flex flex-col justify-between">
            <div className="flex justify-between items-center text-xs">
              <span className="flex items-center space-x-1 font-bold text-purple-400">
                <HardDrive className="w-3.5 h-3.5" />
                <span>RAM</span>
              </span>
              <span className="font-bold text-white text-sm">{ramVal}%</span>
            </div>
            <div className="w-full bg-surfaceHover h-1.5 rounded-full overflow-hidden my-2">
              <div className="bg-purple-500 h-full rounded-full" style={{ width: `${ramVal}%` }} />
            </div>
            <span className="text-[10px] text-gray-400 truncate">
              {telemetry?.ramUsedGb.toFixed(1)} / {telemetry?.ramTotalGb.toFixed(0)} GB
            </span>
          </div>

          {/* Net Card */}
          <div className="glass-card rounded-xl p-3 flex flex-col justify-between">
            <div className="flex justify-between items-center text-xs">
              <span className="flex items-center space-x-1 font-bold text-cyan-400">
                <Wifi className="w-3.5 h-3.5" />
                <span>NET</span>
              </span>
              <span className="font-bold text-white text-xs truncate">{formatSpeed(netInVal)}</span>
            </div>
            <div className="my-1.5">
              <Sparkline data={history.net} max={3000} color="#22d3ee" gradientId="miniNet" height={32} />
            </div>
            <span className="text-[10px] text-gray-400">Download Speed</span>
          </div>
        </div>

        {/* Top 3 Apps Leaderboard */}
        <div className="glass-card rounded-xl p-3 flex-1 flex flex-col justify-between overflow-hidden">
          <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">
            Top Apps (With Safety Shields)
          </div>

          <div className="space-y-1.5 overflow-y-auto">
            {processes.slice(0, 4).map((proc) => {
              const isProtected = proc.category === 'protected';
              const isBackground = proc.category === 'background';

              return (
                <div key={proc.pid} className="flex items-center justify-between p-1.5 rounded-lg bg-surface/50 text-xs">
                  <div className="flex items-center space-x-2 truncate">
                    <span className="shrink-0">
                      {isProtected ? (
                        <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
                      ) : isBackground ? (
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                      ) : (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      )}
                    </span>
                    <span className="text-white font-medium truncate">{proc.name}</span>
                  </div>

                  <div className="flex items-center space-x-2 shrink-0">
                    <span className="font-mono text-gray-300 text-[11px]">{proc.memoryMb.toFixed(0)} MB</span>
                    <button
                      onClick={() => setTargetProcess(proc)}
                      className={`p-1 rounded ${
                        isProtected ? 'text-gray-600 cursor-not-allowed' : 'text-gray-400 hover:text-rose-400 hover:bg-rose-500/10'
                      }`}
                    >
                      <XCircle className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* See More Banner */}
          <button
            onClick={() => toggleMiniMode(false)}
            className="w-full mt-2 py-1.5 rounded-lg bg-surfaceHover hover:bg-border text-center text-xs font-semibold text-sky-400 transition-colors"
          >
            Open Full Dashboard & Optimizer ↗
          </button>
        </div>

        <EndProcessModal
          process={targetProcess}
          onClose={() => setTargetProcess(null)}
          onConfirm={handleKillProcess}
        />
      </div>
    );
  }

  // FULL SIZED APP VIEW (960x680)
  return (
    <div className="h-screen w-screen bg-background flex flex-col select-none text-gray-100 font-sans">
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onMinimize={() => toggleMiniMode(true)}
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
