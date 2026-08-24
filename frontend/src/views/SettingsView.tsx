import React from 'react';
import { ShieldAlert, Zap, Github, Check, Flame, Sliders } from 'lucide-react';
import { ThemeAccent } from '../types';

interface SettingsViewProps {
  themeAccent: ThemeAccent;
  setThemeAccent: (accent: ThemeAccent) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ themeAccent, setThemeAccent }) => {
  const themes: { id: ThemeAccent; label: string; color: string; desc: string }[] = [
    { id: 'rose', label: 'Neon Rose', color: '#F43F5E', desc: 'Vibrant neon cyberpunk pink' },
    { id: 'lime', label: 'Raccoon Lime', color: '#D4F63D', desc: 'High-contrast signature neon lime' },
    { id: 'cyan', label: 'Cyberpunk Cyan', color: '#38BDF8', desc: 'Electric sky blue aesthetic' },
    { id: 'blurple', label: 'Discord Blurple', color: '#5865F2', desc: 'Classic Discord voice & chat theme' },
    { id: 'amber', label: 'Solar Amber', color: '#FB923C', desc: 'Warm overclocking & thermal glow' },
    { id: 'emerald', label: 'Matrix Emerald', color: '#22C55E', desc: 'Terminal clean matrix green' },
  ];

  return (
    <div className="p-6 space-y-6 max-h-[calc(100vh-2.5rem)] overflow-y-auto font-sans">
      {/* Header */}
      <div>
        <h2 className="text-base font-bold text-white flex items-center space-x-2">
          <Sliders className="w-5 h-5 text-accent-theme" />
          <span>Preferences & Theme Customizer</span>
        </h2>
        <p className="text-xs text-neutral-400 mt-0.5 font-normal">
          Personalize theme accent glow, hardware safeguards, and auto-boost behavior
        </p>
      </div>

      {/* 1. THEME ACCENT PICKER (Raycast Classy Row Card) */}
      <div className="glass-card rounded-2xl overflow-hidden border border-border shadow-xl">
        <div className="raycast-row">
          <div>
            <span className="text-xs font-bold text-white block">Accent Glow Palette</span>
            <span className="text-[11px] text-neutral-400">Choose your theme accent across cards, buttons, and HUD</span>
          </div>

          <span className="text-xs font-bold text-accent-theme uppercase tracking-wider">
            {themeAccent}
          </span>
        </div>

        <div className="p-4 grid grid-cols-2 md:grid-cols-3 gap-2.5 bg-sidebar/40">
          {themes.map((t) => {
            const isSelected = themeAccent === t.id;
            return (
              <button
                key={t.id}
                onClick={() => {
                  setThemeAccent(t.id);
                  localStorage.setItem('budwin_theme', t.id);
                }}
                className={`p-3 rounded-xl border text-left transition-all relative flex flex-col justify-between ${
                  isSelected
                    ? 'bg-surfaceActive border-white/30 shadow-md'
                    : 'bg-surface border-border hover:bg-surfaceHover'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center space-x-2">
                    <span
                      className="w-3.5 h-3.5 rounded-full shadow-sm"
                      style={{ backgroundColor: t.color, boxShadow: `0 0 8px ${t.color}90` }}
                    />
                    <span className="font-bold text-xs text-white">{t.label}</span>
                  </div>
                  {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
                </div>
                <span className="text-[10px] text-neutral-400 font-normal">{t.desc}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. SMART HARDWARE SAFEGUARDS (Raycast List Rows) */}
      <div className="glass-card rounded-2xl overflow-hidden border border-border shadow-xl">
        <div className="px-4 py-3 border-b border-border/80 bg-sidebar/50">
          <span className="text-xs font-bold text-white">Hardware Protection & Watchdog</span>
        </div>

        {/* Row 1: Thermal Protection */}
        <div className="raycast-row">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-rose-500/10 text-rose-400 flex items-center justify-center">
              <Flame className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-bold text-white block">GPU Overheat Protection Alert</span>
              <span className="text-[11px] text-neutral-400">Triggers desktop & in-app warning if GPU exceeds 83°C</span>
            </div>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            ACTIVE (83°C)
          </span>
        </div>

        {/* Row 2: Rogue CPU Watchdog */}
        <div className="raycast-row">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-bold text-white block">Rogue Process CPU Hog Watchdog</span>
              <span className="text-[11px] text-neutral-400">Flags hidden background leeches taking heavy CPU</span>
            </div>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            MONITORING
          </span>
        </div>

        {/* Row 3: 1.0ms Timer Auto-Lock */}
        <div className="raycast-row">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-accent-theme/10 text-accent-theme flex items-center justify-center">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-bold text-white block">1.0ms Kernel Timer Auto-Lock</span>
              <span className="text-[11px] text-neutral-400">Enforces 1000 Hz kernel clock for sub-millisecond mouse responsiveness</span>
            </div>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-accent-theme/10 text-accent-theme border border-accent-theme/20">
            ENABLED
          </span>
        </div>
      </div>

      {/* 3. ABOUT BUDWIN (Raycast Footer Card) */}
      <div className="glass-card rounded-2xl p-4 border border-border flex items-center justify-between shadow-xl">
        <div className="flex items-center space-x-3.5">
          <div className="w-10 h-10 rounded-xl overflow-hidden border border-accent-theme/40 bg-surface">
            <img src="/logo.png" alt="budwin" className="w-full h-full object-cover scale-110" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-xs font-bold text-white">budwin System & Latency Monitor</h3>
              <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-accent-theme/10 text-accent-theme border border-accent-theme/20">
                v1.6.0
              </span>
            </div>
            <p className="text-[11px] text-neutral-400 mt-0.5">Built with Go, React & Wails in Raycast Matte Obsidian theme.</p>
          </div>
        </div>

        <a
          href="https://github.com/Iiviavs/budwin"
          target="_blank"
          rel="noopener noreferrer"
          className="px-3 py-1.5 rounded-lg bg-surfaceHover hover:bg-border border border-border text-xs font-semibold text-white flex items-center space-x-2 transition-colors"
        >
          <Github className="w-3.5 h-3.5" />
          <span>GitHub</span>
        </a>
      </div>
    </div>
  );
};
