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
import { TelemetrySnapshot, ProcessItem, DriveItem, StartupItem, AlertItem, AutoBoostStatus, MonitorInfo, MultiMonitorSettings, UpdateInfo } from './types';
import { MiniWindow } from './components/MiniWindow';

export function App() {
  const [viewMode, setViewMode] = useState<'full' | 'mini' | 'hud'>('full');
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [themeMode, setThemeMode] = useState<'dark' | 'light'>(() => {
    return localStorage.getItem('budwin_color_mode') === 'light' ? 'light' : 'dark';
  });

  useEffect(() => {
    document.documentElement.classList.toggle('dark', themeMode === 'dark');
    document.documentElement.setAttribute('data-color-mode', themeMode);
    localStorage.setItem('budwin_color_mode', themeMode);
  }, [themeMode]);

  const toggleThemeMode = () => {
    setThemeMode((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

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

          if (window.go?.main?.App?.GetActiveAlerts) {
            const activeAlerts = await window.go.main.App.GetActiveAlerts();
            setAlerts(activeAlerts || []);
          }

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

    const handleKeyDown = (e: KeyboardEvent) => {
      const activeEl = document.activeElement;
      if (activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA')) {
        return;
      }
      const tabMap: Record<string, TabType> = {
        '1': 'overview',
        '2': 'processes',
        '3': 'storage',
        '4': 'optimizer',
        '5': 'startup',
        '6': 'benchmark',
        '7': 'inputlab',
        '8': 'settings',
      };
      if (tabMap[e.key]) {
        setActiveTab(tabMap[e.key]);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleKillProcess = async (pid: number) => {
    if (window.go?.main?.App?.KillProcess) {
      await window.go.main.App.KillProcess(pid);
      loadProcesses();
    }
  };

  const handleToggleStartupItem = async (name: string, location: string, enable: boolean): Promise<boolean> => {
    if (!window.go?.main?.App?.ToggleStartupItem) return false;
    const success = await window.go.main.App.ToggleStartupItem(name, location, enable);
    if (!success) return false;
    setStartupItems((prev) =>
      prev.map((i) => (i.name === name && i.location === location ? { ...i, enabled: enable } : i))
    );
    return true;
  };

  const handleToggleAutoBoost = async (enable: boolean): Promise<boolean> => {
    if (!window.go?.main?.App?.SetAutoBoostEnabled) return false;
    const success = await window.go.main.App.SetAutoBoostEnabled(enable);
    if (!success) return false;
    if (window.go?.main?.App?.GetAutoBoostStatus) {
      const ab = await window.go.main.App.GetAutoBoostStatus();
      setAutoBoostStatus(ab);
    }
    return true;
  };

  const handleCleanTemp = async (): Promise<number> => {
    if (window.go?.main?.App?.CleanTempFiles) {
      const freed = await window.go.main.App.CleanTempFiles();
      loadDrives();
      return freed;
    }
    return 0;
  };

  const handleFlushDNS = async (): Promise<boolean> => {
    if (window.go?.main?.App?.FlushDNS) {
      return await window.go.main.App.FlushDNS();
    }
    return false;
  };

  const handleSetPowerPlan = async (plan: string): Promise<boolean> => {
    if (window.go?.main?.App?.SetPowerPlan) {
      const success = await window.go.main.App.SetPowerPlan(plan);
      if (success) setPowerPlan(plan);
      return success;
    }
    return false;
  };

  const handleUpdateMonitorSettings = async (settings: MultiMonitorSettings) => {
    setMultiMonitorSettings(settings);
    if (window.go?.main?.App?.SetMultiMonitorSettings) {
      await window.go.main.App.SetMultiMonitorSettings(settings);
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
    if (targetPid) {
      loadProcesses();
    }
    setAlerts((prev) => prev.filter((a) => a.id !== id));
  };

  const handleQuickPurge = async (): Promise<number | null> => {
    if (window.go?.main?.App?.PurgeStandbyRAM) {
      return await window.go.main.App.PurgeStandbyRAM();
    }
    return null;
  };

  const handleToggleTimer = async (): Promise<boolean> => {
    if (!window.go?.main?.App?.ToggleHighPrecisionTimer) return false;
    const nextState = !timerActive;
    const success = await window.go.main.App.ToggleHighPrecisionTimer(nextState);
    if (success) setTimerActive(nextState);
    return success;
  };

  if (viewMode === 'hud') {
    return (
      <div className="w-full h-full">
        <FloatingHudView
          telemetry={telemetry}
          timerActive={timerActive}
          onExpand={() => switchViewMode('full')}
          onClose={() => window.runtime?.WindowHide?.()}
          onQuickPurge={async () => { await handleQuickPurge(); }}
        />
      </div>
    );
  }

  if (viewMode === 'mini') {
    return (
      <MiniWindow telemetry={telemetry} history={history} themeMode={themeMode} timerActive={timerActive}
        processes={processes} targetProcess={targetProcess} toggleThemeMode={toggleThemeMode}
        switchViewMode={switchViewMode} handleToggleTimer={handleToggleTimer}
        setTargetProcess={setTargetProcess} handleKillProcess={handleKillProcess} />
    );
  }

  return (
    <div className="h-screen w-screen bg-background text-textPrimary flex flex-col select-none font-sans overflow-hidden transition-colors duration-150">
      <Titlebar
        timerActive={timerActive}
        powerPlan={powerPlan}
        isMiniMode={false}
        themeMode={themeMode}
        onToggleThemeMode={toggleThemeMode}
        onToggleMini={() => switchViewMode('mini')}
        onMinimize={() => window.runtime?.WindowMinimise?.()}
        onMaximize={() => window.runtime?.WindowToggleMaximise?.()}
        onClose={() => window.runtime?.WindowHide?.()}
      />

      <AlertBanner
        alerts={alerts}
        onDismiss={handleDismissAlert}
        onResolve={handleResolveAlert}
      />

      <div className="flex-1 flex overflow-hidden">
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onToggleHud={() => switchViewMode('hud')}
          telemetry={telemetry}
          gameBoostActive={autoBoostStatus?.isBoosting || false}
          activeGameName={autoBoostStatus?.activeGameName}
          onQuickPurge={async () => { await handleQuickPurge(); }}
          updateInfo={updateInfo}
        />

        <main className="flex-1 h-full overflow-y-auto bg-background transition-colors duration-150">
          {activeTab === 'overview' && (
            <OverviewView
              telemetry={telemetry}
              history={history}
              drives={drives}
              timerActive={timerActive}
              powerPlan={powerPlan}
              themeMode={themeMode}
              onToggleThemeMode={toggleThemeMode}
              onToggleTimer={handleToggleTimer}
              onPurgeStandby={handleQuickPurge}
              onNavigateTab={setActiveTab}
            />
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
