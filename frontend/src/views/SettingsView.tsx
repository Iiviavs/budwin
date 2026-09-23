import React, { useState, useEffect } from 'react';
import { ShieldAlert, Zap, Github, Check, Flame, Sliders, RefreshCw, Sparkles, Download, Sun, Moon } from 'lucide-react';
import { ThemeAccent, UpdateInfo } from '../types';

interface SettingsViewProps {
  themeAccent?: ThemeAccent;
  setThemeAccent?: (accent: ThemeAccent) => void;
  updateInfo?: UpdateInfo | null;
  onRefreshUpdate?: () => Promise<void>;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  updateInfo: initialUpdateInfo,
}) => {
  const [autoStartEnabled, setAutoStartEnabled] = useState<boolean | null>(null);
  const [timerActive, setTimerActive] = useState<boolean | null>(null);
  const [togglingAutoStart, setTogglingAutoStart] = useState(false);
  const [updateInfo, setUpdateInfo] = useState<UpdateInfo | null>(initialUpdateInfo || null);
  const [checkingUpdate, setCheckingUpdate] = useState(false);
  const [currentMode, setCurrentMode] = useState<'dark' | 'light'>(() => {
    return localStorage.getItem('budwin_color_mode') === 'light' ? 'light' : 'dark';
  });

  useEffect(() => {
    if (window.go?.main?.App?.GetAutoStartEnabled) {
      window.go.main.App.GetAutoStartEnabled()
        .then((res) => setAutoStartEnabled(res))
        .catch((error) => console.error('Failed to load auto-start state', error));
    }
    if (window.go?.main?.App?.IsTimerActive) {
      window.go.main.App.IsTimerActive()
        .then((active) => setTimerActive(active))
        .catch((error) => console.error('Failed to load timer state', error));
    }
    if (!initialUpdateInfo && window.go?.main?.App?.CheckForUpdates) {
      window.go.main.App.CheckForUpdates()
        .then((res) => setUpdateInfo(res))
        .catch((error) => console.error('Failed to check for updates', error));
    }
  }, [initialUpdateInfo]);

  const handleModeChange = (mode: 'dark' | 'light') => {
    setCurrentMode(mode);
    document.documentElement.classList.toggle('dark', mode === 'dark');
    document.documentElement.setAttribute('data-color-mode', mode);
    localStorage.setItem('budwin_color_mode', mode);
  };

  const handleCheckUpdates = async () => {
    setCheckingUpdate(true);
    try {
      if (window.go?.main?.App?.CheckForUpdates) {
        const info = await window.go.main.App.CheckForUpdates();
        setUpdateInfo(info);
      }
    } catch (error) {
      console.error('Failed to check for updates', error);
    } finally {
      setCheckingUpdate(false);
    }
  };

  const handleDownloadUpdate = () => {
    const url = updateInfo?.downloadUrl || 'https://github.com/Iiviavs/budwin/releases';
    if (window.go?.main?.App?.OpenUrlInBrowser) {
      window.go.main.App.OpenUrlInBrowser(url);
    } else {
      window.open(url, '_blank');
    }
  };

  const handleToggleAutoStart = async () => {
    if (autoStartEnabled === null || !window.go?.main?.App?.SetAutoStartEnabled) return;
    setTogglingAutoStart(true);
    const nextState = !autoStartEnabled;
    try {
      const success = await window.go.main.App.SetAutoStartEnabled(nextState);
      if (success) setAutoStartEnabled(nextState);
    } catch (error) {
      console.error('Failed to update auto-start state', error);
    } finally {
      setTogglingAutoStart(false);
    }
  };

  return (
    <div className="p-6 md:p-8 space-y-6 pb-24 font-sans max-w-5xl mx-auto">
      <div>
        <h2 className="text-xl font-medium tracking-tight text-textPrimary flex items-center space-x-2">
          <Sliders className="w-5 h-5 text-textPrimary" />
          <span>Preferences</span>
        </h2>
        <p className="text-xs text-textSecondary mt-1 font-normal">
          Configure interface theme mode, hardware safeguards, and startup behavior
        </p>
      </div>

      <div className="bg-surface rounded-2xl overflow-hidden">
        <div className="list-row">
          <div>
            <span className="text-xs font-medium text-textPrimary block">Appearance Theme</span>
            <span className="text-[11px] text-textTertiary font-normal">
              Dark mode uses minimal warm carbon (#171616)
            </span>
          </div>
          <div className="flex items-center space-x-1.5 bg-surfaceSubtle p-1 rounded-xl">
            <button
              onClick={() => handleModeChange('light')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center space-x-1.5 transition-all active:scale-[0.96] ${
                currentMode === 'light'
                  ? 'bg-surface text-textPrimary'
                  : 'text-textSecondary hover:text-textPrimary'
              }`}
            >
              <Sun className="w-3.5 h-3.5" />
              <span>Light</span>
            </button>
            <button
              onClick={() => handleModeChange('dark')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center space-x-1.5 transition-all active:scale-[0.96] ${
                currentMode === 'dark'
                  ? 'bg-surface text-textPrimary'
                  : 'text-textSecondary hover:text-textPrimary'
              }`}
            >
              <Moon className="w-3.5 h-3.5" />
              <span>Dark (#171616)</span>
            </button>
          </div>
        </div>

        <div className="list-row">
          <div>
            <span className="text-xs font-medium text-textPrimary block">Palette Mode</span>
            <span className="text-[11px] text-textTertiary font-normal">Clean monochromatic surfaces</span>
          </div>
          <span className="text-xs font-mono text-textSecondary px-2 py-0.5 rounded-md bg-surfaceSubtle">
            MONOCHROME
          </span>
        </div>
      </div>

      <div className="bg-surface rounded-2xl overflow-hidden">
        <div className="px-4 py-3 bg-surfaceSubtle">
          <span className="text-xs font-medium text-textPrimary">Hardware Protection</span>
        </div>

        <div className="list-row">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-surfaceSubtle text-textSecondary flex items-center justify-center">
              <Flame className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-medium text-textPrimary block">Graphics Overheat Protection</span>
              <span className="text-[11px] text-textTertiary">Triggers system alert if GPU core exceeds 83°C</span>
            </div>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-surfaceSubtle text-textSecondary">
            ACTIVE (83°C)
          </span>
        </div>

        <div className="list-row">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-surfaceSubtle text-textSecondary flex items-center justify-center">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-medium text-textPrimary block">Process CPU Load Watchdog</span>
              <span className="text-[11px] text-textTertiary">Flags background tasks using unexpected CPU resources</span>
            </div>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-surfaceSubtle text-textSecondary">
            MONITORING
          </span>
        </div>

        <div className="list-row">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-surfaceSubtle text-textSecondary flex items-center justify-center">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-medium text-textPrimary block">1.0ms Kernel Clock Auto-Lock</span>
              <span className="text-[11px] text-textTertiary">Current Windows timer setting</span>
            </div>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-surfaceSubtle text-textSecondary">
            {timerActive === null ? 'UNKNOWN' : timerActive ? 'ENABLED' : 'DISABLED'}
          </span>
        </div>

        <div className="list-row">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-surfaceSubtle text-textSecondary flex items-center justify-center">
              <Check className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-medium text-textPrimary block">Launch on System Boot</span>
              <span className="text-[11px] text-textTertiary">Automatically starts in system tray on user logon</span>
            </div>
          </div>
          <button
            onClick={handleToggleAutoStart}
            disabled={togglingAutoStart || autoStartEnabled === null}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all active:scale-[0.96] ${
              autoStartEnabled
                ? 'bg-surfaceSubtle text-textPrimary'
                : 'bg-transparent text-textTertiary hover:text-textPrimary'
            }`}
          >
            {autoStartEnabled === null ? 'UNKNOWN' : autoStartEnabled ? 'ACTIVE' : 'DISABLED'}
          </button>
        </div>
      </div>

      <div className="bg-surface rounded-2xl overflow-hidden">
        <div className="list-row">
          <div>
            <span className="text-xs font-medium text-textPrimary block">Updates</span>
            <span className="text-[11px] text-textTertiary">Checks repository for new versions</span>
          </div>

          <button
            onClick={handleCheckUpdates}
            disabled={checkingUpdate}
            className="px-3 py-1.5 rounded-xl bg-surfaceSubtle hover:bg-surfaceHover text-xs font-medium text-textPrimary flex items-center space-x-1.5 transition-all active:scale-[0.96]"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${checkingUpdate ? 'animate-spin' : ''}`} />
            <span>{checkingUpdate ? 'Checking...' : 'Check for Updates'}</span>
          </button>
        </div>

        <div className="p-4 bg-surfaceSubtle">
          {updateInfo?.hasUpdate ? (
            <div className="p-4 rounded-xl bg-surface space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2.5">
                  <Sparkles className="w-5 h-5 text-textPrimary" />
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-semibold text-textPrimary">New Version Available</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-surfaceSubtle text-textPrimary">
                        {updateInfo.latestVersion}
                      </span>
                    </div>
                    <span className="text-[11px] text-textTertiary block mt-0.5">{updateInfo.releaseName || 'Latest Release'}</span>
                  </div>
                </div>

                <button
                  onClick={handleDownloadUpdate}
                  className="px-4 py-2 rounded-xl bg-textPrimary text-background active:scale-[0.96] text-xs font-medium transition-all flex items-center space-x-2"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Update</span>
                </button>
              </div>

              {updateInfo.releaseNotes && (
                <div className="text-[11px] text-textSecondary bg-surfaceSubtle p-3 rounded-xl max-h-32 overflow-y-auto whitespace-pre-line font-mono">
                  {updateInfo.releaseNotes}
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-lg bg-surface text-textSecondary flex items-center justify-center">
                  <Check className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-medium text-textPrimary">Software is up to date</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-surface text-textSecondary">
                      {updateInfo?.currentVersion || 'v1.9.4'}
                    </span>
                  </div>
                  <span className="text-[11px] text-textTertiary">Running the latest release with active telemetry optimizations.</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="bg-surface rounded-2xl p-4 flex items-center justify-between">
        <div className="flex items-center space-x-3.5">
          <div className="w-9 h-9 rounded-xl overflow-hidden bg-surfaceSubtle flex items-center justify-center">
            <img src="/logo.png" alt="logo" className="w-full h-full object-cover scale-110" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-xs font-semibold text-textPrimary">budwin</h3>
              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-surfaceSubtle text-textSecondary">
                v1.9.4
              </span>
            </div>
            <p className="text-[11px] text-textTertiary mt-0.5 font-normal">Lightweight desktop latency tuning, process safeguards, and telemetry.</p>
          </div>
        </div>

        <button
          onClick={() => {
            if (window.go?.main?.App?.OpenUrlInBrowser) {
              window.go.main.App.OpenUrlInBrowser('https://github.com/Iiviavs/budwin');
            } else {
              window.open('https://github.com/Iiviavs/budwin', '_blank');
            }
          }}
          className="px-3.5 py-1.5 rounded-xl bg-surfaceSubtle hover:bg-surfaceHover text-xs font-medium text-textPrimary flex items-center space-x-2 transition-all active:scale-[0.96]"
        >
          <Github className="w-3.5 h-3.5" />
          <span>Source</span>
        </button>
      </div>
    </div>
  );
};
