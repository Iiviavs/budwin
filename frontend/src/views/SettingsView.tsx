import React from 'react';
import { Palette, ShieldAlert, Zap, Github, Check, Bell, Flame } from 'lucide-react';
import { ThemeAccent } from '../types';

interface SettingsViewProps {
  themeAccent: ThemeAccent;
  setThemeAccent: (accent: ThemeAccent) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ themeAccent, setThemeAccent }) => {
  const themes: { id: ThemeAccent; label: string; color: string; desc: string }[] = [
    { id: 'lime', label: 'Raccoon Lime', color: '#D4F63D', desc: 'Signature high-contrast neon lime' },
    { id: 'cyan', label: 'Cyberpunk Cyan', color: '#38BDF8', desc: 'Electric sky blue aesthetic' },
    { id: 'blurple', label: 'Discord Blurple', color: '#5865F2', desc: 'Classic Discord voice & chat theme' },
    { id: 'amber', label: 'Solar Amber', color: '#FB923C', desc: 'Warm overclocking & thermal glow' },
    { id: 'rose', label: 'Neon Rose', color: '#F43F5E', desc: 'Vibrant neon cyberpunk pink' },
    { id: 'emerald', label: 'Matrix Emerald', color: '#22C55E', desc: 'Terminal clean matrix green' },
  ];

  return (
    <div className="p-6 space-y-6 max-h-[calc(100vh-2.5rem)] overflow-y-auto">
      <div>
        <h2 className="text-lg font-bold text-white flex items-center space-x-2">
          <Palette className="w-5 h-5 text-accent-lime" />
          <span>App Settings & Theme Customizer</span>
        </h2>
        <p className="text-xs text-gray-400 font-medium">Personalize theme glow, hardware safeguards, and alert thresholds</p>
      </div>

      {/* 1. THEME ACCENT PICKER */}
      <div className="glass-card rounded-3xl p-5 border border-border space-y-4 shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-accent-lime/10 text-accent-lime border border-accent-lime/20 flex items-center justify-center">
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Accent Glow Color</h3>
              <p className="text-xs text-gray-400">Choose your favorite glowing accent across dashboard, sidebar, and HUD</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
          {themes.map((t) => {
            const isSelected = themeAccent === t.id;
            return (
              <button
                key={t.id}
                onClick={() => {
                  setThemeAccent(t.id);
                  localStorage.setItem('budwin_theme', t.id);
                }}
                className={`p-3.5 rounded-2xl border text-left transition-all relative flex flex-col justify-between ${
                  isSelected
                    ? 'bg-surfaceActive border-white/40 shadow-lg shadow-black/40'
                    : 'bg-surface border-border hover:bg-surfaceHover'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <span
                      className="w-4 h-4 rounded-full shadow-md"
                      style={{ backgroundColor: t.color, boxShadow: `0 0 10px ${t.color}80` }}
                    />
                    <span className="font-bold text-xs text-white">{t.label}</span>
                  </div>
                  {isSelected && <Check className="w-4 h-4 text-white" />}
                </div>
                <span className="text-[10px] text-gray-400 font-medium">{t.desc}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. SMART HARDWARE SAFEGUARDS */}
      <div className="glass-card rounded-3xl p-5 border border-border space-y-4 shadow-xl">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center justify-center">
            <Bell className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Smart Hardware Safeguard Watchdog</h3>
            <p className="text-xs text-gray-400">Automatic detection of thermal spikes and runaway background processes</p>
          </div>
        </div>

        <div className="space-y-3 pt-1">
          {/* Safeguard 1 */}
          <div className="p-3.5 rounded-2xl bg-surface border border-border flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Flame className="w-4 h-4 text-rose-400" />
              <div>
                <span className="text-xs font-bold text-white block">GPU Overheat Protection Alert</span>
                <span className="text-[10px] text-gray-400">Warns and offers 1-click cool down if GPU exceeds 83°C</span>
              </div>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              ACTIVE (83°C)
            </span>
          </div>

          {/* Safeguard 2 */}
          <div className="p-3.5 rounded-2xl bg-surface border border-border flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <ShieldAlert className="w-4 h-4 text-amber-400" />
              <div>
                <span className="text-xs font-bold text-white block">Rogue Process CPU Hog Watchdog</span>
                <span className="text-[10px] text-gray-400">Detects background leeches running at excessive CPU load</span>
              </div>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              MONITORING
            </span>
          </div>

          {/* Safeguard 3 */}
          <div className="p-3.5 rounded-2xl bg-surface border border-border flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <Zap className="w-4 h-4 text-accent-lime" />
              <div>
                <span className="text-xs font-bold text-white block">1.0ms Low Latency Timer Auto-Lock</span>
                <span className="text-[10px] text-gray-400">Keeps 1000 Hz kernel resolution active in background</span>
              </div>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-accent-lime/10 text-accent-lime border border-accent-lime/20">
              ENABLED
            </span>
          </div>
        </div>
      </div>

      {/* 3. ABOUT BUDWIN */}
      <div className="glass-card rounded-3xl p-5 border border-border flex items-center justify-between">
        <div className="flex items-center space-x-3.5">
          <div className="w-11 h-11 rounded-2xl overflow-hidden border border-accent-lime/50 bg-surface">
            <img src="/logo.png" alt="budwin" className="w-full h-full object-cover scale-110" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-sm font-bold text-white">budwin System & Latency Monitor</h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-accent-lime/10 text-accent-lime border border-accent-lime/20">
                v1.5.0
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-0.5">Built with Go, React, TypeScript & Wails. Open source on GitHub.</p>
          </div>
        </div>

        <a
          href="https://github.com/Iiviavs/budwin"
          target="_blank"
          rel="noopener noreferrer"
          className="px-3.5 py-2 rounded-xl bg-surface hover:bg-surfaceHover border border-border text-xs font-bold text-white flex items-center space-x-2 transition-colors"
        >
          <Github className="w-4 h-4" />
          <span>GitHub Repo</span>
        </a>
      </div>
    </div>
  );
};
