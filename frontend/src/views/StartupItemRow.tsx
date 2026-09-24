import React from 'react';
import { Box, Terminal, Cpu, ShieldCheck, Gamepad2, Music, MessageSquare, Compass, ChevronDown, ChevronUp, Copy, Check } from 'lucide-react';
import { StartupItem } from '../types';

interface StartupItemRowProps {
  item: StartupItem;
  toggling: boolean;
  expanded: boolean;
  copied: boolean;
  onToggle: () => void;
  onExpand: () => void;
  onCopy: () => void;
}

const getStartupIcon = (name: string, command: string) => {
  const q = `${name} ${command}`.toLowerCase();
  if (['discord', 'slack', 'telegram', 'teams', 'chat', 'signal'].some((value) => q.includes(value))) return MessageSquare;
  if (['steam', 'epic', 'riot', 'game', 'origin', 'ubisoft', 'battle.net'].some((value) => q.includes(value))) return Gamepad2;
  if (['spotify', 'audio', 'sound', 'music', 'realtek'].some((value) => q.includes(value))) return Music;
  if (['chrome', 'edge', 'brave', 'browser', 'firefox', 'opera'].some((value) => q.includes(value))) return Compass;
  if (['nvidia', 'amd', 'intel', 'razer', 'asus', 'armoury', 'driver', 'display'].some((value) => q.includes(value))) return Cpu;
  if (['defender', 'antivirus', 'security', 'protect', 'guard'].some((value) => q.includes(value))) return ShieldCheck;
  if (['.bat', '.cmd', '.ps1', 'powershell', 'cmd.exe'].some((value) => q.includes(value))) return Terminal;
  return Box;
};

const formatLocation = (location: string) => {
  if (location === 'HKCU') return 'User Login';
  if (location === 'HKLM') return 'System Service';
  return location;
};

export const StartupItemRow: React.FC<StartupItemRowProps> = ({
  item, toggling, expanded, copied, onToggle, onExpand, onCopy,
}) => {
  const Icon = getStartupIcon(item.name, item.command);

  return (
    <div className="transition-colors hover:bg-surfaceHover/40">
      <div className="flex items-center justify-between px-4 py-3 gap-3">
        <div className="flex items-center space-x-3.5 min-w-0 flex-1">
          <div className="w-9 h-9 rounded-xl bg-surfaceSubtle border border-white/[0.04] flex items-center justify-center text-textSecondary shrink-0">
            <Icon className="w-4 h-4" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center space-x-2">
              <span className="font-medium text-[13px] text-textPrimary truncate tracking-tight">{item.name}</span>
              <span className="text-[10px] font-mono text-textTertiary bg-surfaceSubtle/80 px-1.5 py-0.5 rounded shrink-0">{formatLocation(item.location)}</span>
            </div>
            <span className="text-[11px] text-textTertiary block truncate mt-0.5 font-normal">{item.description || item.command}</span>
          </div>
        </div>
        <div className="flex items-center space-x-3 shrink-0">
          <span className={`px-2 py-0.5 rounded text-[10px] font-mono tracking-tight ${item.impact === 'High' ? 'bg-white/10 text-textPrimary font-medium border border-white/10' : item.impact === 'Medium' ? 'bg-surfaceSubtle text-textSecondary' : 'text-textTertiary'}`}>
            {item.impact} Load
          </span>
          <button type="button" onClick={onExpand} className="p-1.5 rounded-lg text-textTertiary hover:text-textPrimary hover:bg-surfaceSubtle transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-textPrimary" title="Inspect launch command" aria-label={`Inspect launch command for ${item.name}`} aria-expanded={expanded}>
            {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
          <button type="button" role="switch" aria-label={`Enable ${item.name} at ${formatLocation(item.location)}`} aria-checked={item.enabled} disabled={toggling} onClick={onToggle} className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-textPrimary disabled:opacity-50 ${item.enabled ? 'bg-textPrimary' : 'bg-surfaceSubtle'}`}>
            <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full transition duration-200 ease-in-out mt-0.5 ml-0.5 ${item.enabled ? 'translate-x-4 bg-background' : 'translate-x-0 bg-textSecondary'}`} />
          </button>
        </div>
      </div>
      {expanded && (
        <div className="px-4 pb-3 pt-1 border-t border-white/[0.02] bg-surfaceSubtle/30 space-y-2 text-xs">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <span className="text-[10px] font-mono text-textTertiary uppercase tracking-wider block mb-1">Launch Command</span>
              <div className="font-mono text-[11px] text-textSecondary bg-background/60 p-2.5 rounded-lg border border-white/[0.03] select-all break-all">{item.command}</div>
            </div>
            <button type="button" onClick={onCopy} className="mt-5 px-2.5 py-1.5 rounded-lg bg-surface hover:bg-surfaceHover text-textSecondary hover:text-textPrimary flex items-center space-x-1.5 text-xs font-mono transition-colors shrink-0 focus-visible:outline focus-visible:outline-2 focus-visible:outline-textPrimary">
              {copied ? <><Check className="w-3.5 h-3.5" /><span>Copied</span></> : <><Copy className="w-3.5 h-3.5" /><span>Copy Path</span></>}
            </button>
          </div>
          <div className="flex flex-wrap items-center justify-between text-[11px] text-textTertiary pt-1">
            <span>Registry Hive: {item.location === 'HKCU' ? 'HKEY_CURRENT_USER' : 'HKEY_LOCAL_MACHINE'}\Software\Microsoft\Windows\CurrentVersion\Run</span>
            <span>{item.impact === 'High' ? 'Heavy initialization during boot' : 'Lightweight background process'}</span>
          </div>
        </div>
      )}
    </div>
  );
};
