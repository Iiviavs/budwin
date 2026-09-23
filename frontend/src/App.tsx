import { useState, useEffect, useRef } from 'react';
import { Titlebar } from './components/Titlebar';
import { Sidebar, TabType } from './components/Sidebar';
import { AlertBanner } from './components/AlertBanner';
import { OverviewView } from './views/OverviewView';
import { ProcessesView } from './views/ProcessesView';
import { StorageView } from './views/StorageView';
import { OptimizerView } from './views/OptimizerView';
import { StartupView } from './views/StartupView';
import { BenchmarkView } from './views/BenchmarkView';
import { LatencyTesterView } from './views/LatencyTesterView';
import { SettingsView } from './views/SettingsView';
import { FloatingHudView } from './views/FloatingHudView';
import { TelemetrySnapshot, ProcessItem, DriveItem, StartupItem, AlertItem, ThemeAccent, AutoBoostStatus, MonitorInfo, MultiMonitorSettings, UpdateInfo } from './types';
import { Sparkline } from './components/Sparkline';
import { EndProcessModal } from './components/EndProcessModal';
import { Maximize2, Cpu, Zap, HardDrive, Wifi, ShieldAlert, AlertTriangle, CheckCircle2, XCircle, Pin } from 'lucide-react';

export function App() {
  const [viewMode, setViewMode] = useState<'full' | 'mini' | 'hud'>('full');
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [themeAccent, setThemeAccent] = useState<ThemeAccent>(() => {
    return (localStorage.getItem('budwin_theme') as ThemeAccent) || 'rose';
  });

  // Apply theme dynamically to document root
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', themeAccent);
  }, [themeAccent]);

  // Listen to Tray Open Events
  useEffect(() => {
    if (window.runtime?.EventsOn) {
      const onTrayOpenMini = () => {
        switchViewMode('mini');
      };
      const onTrayOpenFull = () => {
        switchViewMode('full');
      };
      window.runtime.EventsOn('tray-open-mini', onTrayOpenMini);
      window.runtime.EventsOn('tray-open-full', onTrayOpenFull);

      return () => {
        window.runtime?.EventsOff?.('tray-open-mini', onTrayOpenMini);
        window.runtime?.EventsOff?.('tray-open-full', onTrayOpenFull);
      };
    }
  }, []);

  const [telemetry, setTelemetry] = useState<TelemetrySnapshot | null>(null);
  const [processes, setProcesses] = useState<ProcessItem[]>([]);
  const [startupItems, setStartupItems] = useState<StartupItem[]>([]);
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [autoBoostStatus, setAutoBoostStatus] = useState<AutoBoostStatus | null>(null);
  const [monitors, setMonitors] = useState<MonitorInfo[]>([]);
  const [updateInfo, setUpdateInfo] = useState<UpdateInfo | null>(null);
  const [multiMonitorSettings, setMultiMonitorSettings] = useState<MultiMonitorSettings>({
    dimSecondaryMonitors: false,
    autoDimOnGameLaunch: true,
  });

  // Background GitHub Release Update Check on app start
  useEffect(() => {
    if (window.go?.main?.App?.CheckForUpdates) {
      window.go.main.App.CheckForUpdates().then((res) => {
        if (res) setUpdateInfo(res);
      });
    }
  }, []);

  const [drives, setDrives] = useState<DriveItem[]>([]);
  const [powerPlan, setPowerPlan] = useState('Balanced');
  const [targetProcess, setTargetProcess] = useState<ProcessItem | null>(null);
  const [timerActive, setTimerActive] = useState(true);
  const telemetryInFlight = useRef(false);

  // 60-point history buffers
  const [history, setHistory] = useState<{
    cpu: number[];
    gpu: number[];
    ram: number[];
    net: number[];
  }>({
    cpu: [],
    gpu: [],
    ram: [],
    net: [],
  });

  const switchViewMode = (mode: 'full' | 'mini' | 'hud') => {
    setViewMode(mode);
    if (mode === 'hud') {
      if (window.go?.main?.App?.SetHudMode) {
        window.go.main.App.SetHudMode(true);
      } else {
        window.runtime?.WindowSetSize?.(345, 36);
        window.runtime?.WindowSetAlwaysOnTop?.(true);
      }
    } else if (mode === 'mini') {
      if (window.go?.main?.App?.SetMiniMode) {
        window.go.main.App.SetMiniMode(true);
      } else {
        window.runtime?.WindowSetSize?.(380, 580);
        window.runtime?.WindowSetAlwaysOnTop?.(false);
      }
    } else {
      if (window.go?.main?.App?.SetMiniMode) {
        window.go.main.App.SetMiniMode(false);
      } else {
        window.runtime?.WindowSetSize?.(1060, 700);
        window.runtime?.WindowSetAlwaysOnTop?.(false);
      }
    }
  };

  // Telemetry & Alerts loop
  useEffect(() => {
    const fetchTelemetry = async () => {
      if (telemetryInFlight.current) return;
      telemetryInFlight.current = true;

      if (window.go?.main?.App?.GetTelemetry) {
        try {
          const telem = await window.go.main.App.GetTelemetry();
          setTelemetry(telem);

          setHistory((prev) => ({
            cpu: [...prev.cpu.slice(1), telem.cpuPercent],
            gpu: [...prev.gpu.slice(1), telem.gpu?.isAvailable ? telem.gpu.coreUtilization : 0],
            ram: [...prev.ram.slice(1), telem.ramPercent],
            net: [...prev.net.slice(1), telem.netInKb],
          }));

          // Fetch active hardware alerts
          if (window.go?.main?.App?.GetActiveAlerts) {
            const activeAlerts = await window.go.main.App.GetActiveAlerts();
            setAlerts(activeAlerts || []);
          }

          // Fetch auto-boost status
          if (window.go?.main?.App?.GetAutoBoostStatus) {
            const ab = await window.go.main.App.GetAutoBoostStatus();
            setAutoBoostStatus(ab);
          }
        } catch (error) {
          console.error('Failed to refresh telemetry', error);
        } finally {
          telemetryInFlight.current = false;
        }
      } else {
        setTelemetry(null);
        telemetryInFlight.current = false;
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
      } catch (error) {
        console.error('Failed to load processes', error);
      }
    } else {
      setProcesses([]);
    }
  };

  const loadStartupItems = async () => {
    if (window.go?.main?.App?.GetStartupItems) {
      try {
        const list = await window.go.main.App.GetStartupItems();
        setStartupItems(list);
      } catch (error) {
        console.error('Failed to load startup items', error);
      }
    } else {
      setStartupItems([]);
    }
  };

  const loadDrives = async () => {
    if (window.go?.main?.App?.GetDrives) {
      try {
        const d = await window.go.main.App.GetDrives();
        setDrives(d);
      } catch (error) {
        console.error('Failed to load drives', error);
      }
    }
  };

  const loadMonitors = async () => {
    if (window.go?.main?.App?.GetMonitors) {
      try {
        const m = await window.go.main.App.GetMonitors();
        setMonitors(m || []);
      } catch (error) {
        console.error('Failed to load monitors', error);
      }
    } else {
      setMonitors([]);
    }
  };

  useEffect(() => {
    loadProcesses();
    loadStartupItems();
    loadDrives();
    loadMonitors();
    if (window.go?.main?.App?.GetActivePowerPlan) {
      window.go.main.App.GetActivePowerPlan()
        .then((p) => setPowerPlan(p))
        .catch((error) => console.error('Failed to load active power plan', error));
    }
    if (window.go?.main?.App?.IsTimerActive) {
      window.go.main.App.IsTimerActive()
        .then((t) => setTimerActive(t))
        .catch((error) => console.error('Failed to load timer state', error));
    }
  }, []);

  const handleKillProcess = async (pid: number) => {
    if (window.go?.main?.App?.KillProcess) {
      await window.go.main.App.KillProcess(pid);
      loadProcesses();
    }
  };

  const handleToggleStartupItem = async (name: string, location: string, enable: boolean): Promise<boolean> => {
    if (window.go?.main?.App?.ToggleStartupItem) {
      const success = await window.go.main.App.ToggleStartupItem(name, location, enable);
      if (!success) return false;
    }
    setStartupItems((prev) =>
      prev.map((i) => (i.name === name && i.location === location ? { ...i, enabled: enable } : i))
    );
    return true;
  };

  const handleToggleAutoBoost = async (enable: boolean): Promise<boolean> => {
    if (window.go?.main?.App?.SetAutoBoostEnabled) {
      const success = await window.go.main.App.SetAutoBoostEnabled(enable);
      if (!success) return false;
    }
    setAutoBoostStatus((prev) => prev ? { ...prev, autoBoostEnabled: enable } : null);
    return true;
  };

  const handleUpdateMonitorSettings = async (settings: MultiMonitorSettings) => {
    setMultiMonitorSettings(settings);
    if (window.go?.main?.App?.SetMultiMonitorSettings) {
      await window.go.main.App.SetMultiMonitorSettings(settings);
    }
  };

  const handleQuickPurge = async () => {
    if (window.go?.main?.App?.PurgeStandbyRAM) {
      await window.go.main.App.PurgeStandbyRAM();
    }
  };

  const handleDismissAlert = async (id: string) => {
    if (window.go?.main?.App?.DismissAlert) {
      await window.go.main.App.DismissAlert(id);
    }
    setAlerts((prev) => prev.filter((a) => a.id !== id));
  };

  const handleResolveAlert = async (id: string, type: string, targetPid?: number) => {
    if (window.go?.main?.App?.ResolveAlert) {
      await window.go.main.App.ResolveAlert(id, type, targetPid || 0);
    }
    setAlerts((prev) => prev.filter((a) => a.id !== id));
    loadProcesses();
  };

  const handleCleanTemp = async (): Promise<number> => {
    if (!window.go?.main?.App?.CleanTempFiles) return 0;
    return await window.go.main.App.CleanTempFiles();
  };

  const handleFlushDNS = async (): Promise<boolean> => {
    if (!window.go?.main?.App?.FlushDNS) return false;
    return await window.go.main.App.FlushDNS();
  };

  const handleSetPowerPlan = async (plan: string): Promise<boolean> => {
    if (window.go?.main?.App?.SetPowerPlan) {
      const success = await window.go.main.App.SetPowerPlan(plan);
      if (success) setPowerPlan(plan);
      return success;
    }
    return false;
  };

  const handleToggleTimer = async () => {
    if (!window.go?.main?.App?.ToggleHighPrecisionTimer) return;
    const nextState = !timerActive;
    const success = await window.go.main.App.ToggleHighPrecisionTimer(nextState);
    if (success) setTimerActive(nextState);
  };

  const formatSpeed = (kb: number) => {
    if (kb >= 1024) return `${(kb / 1024).toFixed(1)} MB/s`;
    return `${Math.round(kb)} KB/s`;
  };

  // 1. DISCORD GAME OVERLAY VIEW (With Maximize & Close buttons)
  if (viewMode === 'hud') {
    return (
      <div data-theme={themeAccent} className="w-full h-full">
        <FloatingHudView
          telemetry={telemetry}
          timerActive={timerActive}
          onExpand={() => switchViewMode('full')}
          onClose={() => window.runtime?.WindowHide?.()}
          onQuickPurge={handleQuickPurge}
        />
      </div>
    );
  }

  // 2. MINI TRAY COMPANION VIEW (Borderless Raycast)
  if (viewMode === 'mini') {
    const cpuVal = telemetry ? Math.round(telemetry.cpuPercent) : null;
    const gpuVal = telemetry?.gpu.isAvailable ? Math.round(telemetry.gpu.coreUtilization) : null;
    const ramVal = telemetry ? Math.round(telemetry.ramPercent) : null;
    const netInVal = telemetry ? telemetry.netInKb : null;

    return (
      <div data-theme={themeAccent} className="h-screen w-screen bg-[#0E0F12] flex flex-col justify-between p-3 select-none font-sans text-gray-100 rounded-2xl overflow-hidden shadow-2xl">
        {/* Header with Mascot */}
        <div className="flex items-center justify-between pb-2 border-b border-white/[0.04] draggable">
          <div className="flex items-center space-x-2.5 non-draggable">
            <div className="w-7 h-7 rounded-full overflow-hidden bg-[#18191E]">
              <img src="/logo.png" alt="budwin mascot" className="w-full h-full object-cover scale-110" />
            </div>
            <div>
              <span className="font-bold text-xs text-white block leading-tight">budwin</span>
              <span className="text-[9px] text-neutral-400 font-medium">Mini Companion</span>
            </div>
          </div>

          <div className="flex items-center space-x-1.5 non-draggable">
            <button
              onClick={() => switchViewMode('hud')}
              className="p-1 rounded hover:bg-[#18191E] text-neutral-400 hover:text-accent-theme transition-colors"
              title="Pin as Discord Game Overlay"
            >
              <Pin className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => switchViewMode('full')}
              className="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-[#24252A] hover:bg-[#2E3038] text-white text-[11px] font-semibold transition-all shadow-sm"
              title="Maximize to Full Dashboard"
            >
              <span>See More</span>
              <Maximize2 className="w-3 h-3 text-accent-theme" />
            </button>
            <button
              onClick={() => window.runtime?.WindowHide?.()}
              className="w-6 h-6 rounded flex items-center justify-center text-neutral-400 hover:text-white hover:bg-rose-500/80 transition-colors text-xs"
              title="Close to Tray"
            >
              ✕
            </button>
          </div>
        </div>

        {/* 2x2 Mini Metrics Grid */}
        <div className="grid grid-cols-2 gap-2 my-2">
          {/* CPU Card */}
          <div className="glass-card rounded-xl p-3 flex flex-col justify-between">
            <div className="flex justify-between items-center text-xs">
              <span className="flex items-center space-x-1 font-bold text-sky-400">
                <Cpu className="w-3.5 h-3.5" />
                <span>CPU</span>
              </span>
              <span className="font-bold text-white text-sm">{cpuVal === null ? 'N/A' : `${cpuVal}%`}</span>
            </div>
            <div className="my-1.5">
              <Sparkline data={history.cpu} max={100} color="#38bdf8" gradientId="miniCpu" height={28} />
            </div>
            <span className="text-[9px] text-neutral-400">60s Trend</span>
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
              <Sparkline data={history.gpu} max={100} color="#22c55e" gradientId="miniGpu" height={28} />
            </div>
            <span className="text-[9px] text-neutral-400">
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
              <span className="font-bold text-white text-sm">{ramVal === null ? 'N/A' : `${ramVal}%`}</span>
            </div>
            <div className="w-full bg-[#111215] h-1.5 rounded-full overflow-hidden my-2">
              <div className="bg-purple-500 h-full rounded-full" style={{ width: `${ramVal ?? 0}%` }} />
            </div>
            <span className="text-[9px] text-neutral-400 truncate">
              {telemetry ? `${telemetry.ramUsedGb.toFixed(1)} / ${telemetry.ramTotalGb.toFixed(0)} GB` : 'Unavailable'}
            </span>
          </div>

          {/* Net Card */}
          <div className="glass-card rounded-xl p-3 flex flex-col justify-between">
            <div className="flex justify-between items-center text-xs">
              <span className="flex items-center space-x-1 font-bold text-cyan-400">
                <Wifi className="w-3.5 h-3.5" />
                <span>NET</span>
              </span>
              <span className="font-bold text-white text-xs truncate">{netInVal === null ? 'N/A' : formatSpeed(netInVal)}</span>
            </div>
            <div className="my-1.5">
              <Sparkline data={history.net} max={3000} color="#22d3ee" gradientId="miniNet" height={28} />
            </div>
            <span className="text-[9px] text-neutral-400">Bandwidth</span>
          </div>
        </div>

        {/* Input Lag 1-Click Status Badge */}
        <div className="bg-[#18191E] rounded-xl p-2 flex items-center justify-between text-xs">
          <div className="flex items-center space-x-2">
            <Zap className="w-3.5 h-3.5 text-accent-theme" />
            <span className="text-[11px] font-semibold text-neutral-200">1.0ms Low Latency</span>
          </div>
          <button
            onClick={handleToggleTimer}
            className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold transition-colors ${
              timerActive
                ? 'bg-accent-theme/15 text-accent-theme'
                : 'bg-[#24252A] text-neutral-400 hover:text-white'
            }`}
          >
            {timerActive ? 'ACTIVE' : 'OFF'}
          </button>
        </div>

        {/* Top Apps Leaderboard */}
        <div className="glass-card rounded-xl p-2.5 flex-1 flex flex-col justify-between overflow-hidden my-2">
          <div className="text-[9px] font-bold text-neutral-400 uppercase tracking-wider mb-1">
            Top Apps (Safety Shields)
          </div>

          <div className="space-y-1 overflow-y-auto">
            {processes.slice(0, 3).map((proc) => {
              const isProtected = proc.category === 'protected';
              const isBackground = proc.category === 'background';

              return (
                <div key={proc.pid} className="flex items-center justify-between p-1.5 rounded-lg bg-[#111215] text-xs">
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
                    <span className="text-white font-medium truncate text-[11px]">{proc.name}</span>
                  </div>

                  <div className="flex items-center space-x-2 shrink-0">
                    <span className="font-mono text-neutral-400 text-[10px]">{proc.memoryMb.toFixed(0)} MB</span>
                    <button
                      onClick={() => setTargetProcess(proc)}
                      className={`p-0.5 rounded ${
                        isProtected ? 'text-neutral-600 cursor-not-allowed' : 'text-neutral-400 hover:text-rose-400 hover:bg-rose-500/10'
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
            onClick={() => switchViewMode('full')}
            className="w-full mt-1.5 py-1.5 rounded-lg bg-[#24252A] hover:bg-[#2E3038] text-center text-xs font-bold text-white transition-all"
          >
            Open Full Dashboard ↗
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

  // 3. FULL SIZED LUXURY RAYCAST MATTE OBSIDIAN APP VIEW (100% Borderless)
  return (
    <div data-theme={themeAccent} className="h-screen w-screen bg-[#0E0F12] flex flex-col select-none text-gray-100 font-sans overflow-hidden rounded-2xl shadow-2xl">
      {/* Raycast Style Frameless Titlebar */}
      <Titlebar
        timerActive={timerActive}
        powerPlan={powerPlan}
        isMiniMode={false}
        onToggleMini={() => switchViewMode('mini')}
        onMinimize={() => window.runtime?.WindowMinimise?.()}
        onMaximize={() => window.runtime?.WindowToggleMaximise?.()}
        onClose={() => window.runtime?.WindowHide?.()}
      />

      {/* Hardware Thermal & Watchdog Alert Banners */}
      <AlertBanner
        alerts={alerts}
        onDismiss={handleDismissAlert}
        onResolve={handleResolveAlert}
      />

      {/* Main App Layout with Left Sidebar + View Container */}
      <div className="flex-1 flex overflow-hidden">
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onToggleHud={() => switchViewMode('hud')}
          telemetry={telemetry}
          gameBoostActive={autoBoostStatus?.isBoosting || false}
          activeGameName={autoBoostStatus?.activeGameName}
          onQuickPurge={handleQuickPurge}
          updateInfo={updateInfo}
        />

        <main className="flex-1 h-full overflow-y-auto bg-[#0E0F12]">
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
          {activeTab === 'startup' && (
            <StartupView
              items={startupItems}
              onRefresh={loadStartupItems}
              onToggle={handleToggleStartupItem}
            />
          )}
          {activeTab === 'benchmark' && (
            <BenchmarkView
              autoBoostStatus={autoBoostStatus}
              onToggleAutoBoost={handleToggleAutoBoost}
            />
          )}
          {activeTab === 'inputlab' && (
            <LatencyTesterView
              monitors={monitors}
              multiMonitorSettings={multiMonitorSettings}
              onUpdateMonitorSettings={handleUpdateMonitorSettings}
            />
          )}
          {activeTab === 'settings' && (
            <SettingsView
              themeAccent={themeAccent}
              setThemeAccent={setThemeAccent}
              updateInfo={updateInfo}
              onRefreshUpdate={async () => {
                if (window.go?.main?.App?.CheckForUpdates) {
                  const res = await window.go.main.App.CheckForUpdates();
                  setUpdateInfo(res);
                }
              }}
            />
          )}
        </main>
      </div>
    </div>
  );
}

export default App;
