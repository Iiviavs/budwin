import React, { useState } from 'react';
import { Zap, HardDrive, Cpu, Check, Layers, RefreshCw } from 'lucide-react';
import { TelemetrySnapshot } from '../../types';
import type { TabType } from '../Sidebar';

interface DashboardAssistantCardProps {
  telemetry: TelemetrySnapshot | null;
  timerActive: boolean;
  onToggleTimer?: () => Promise<boolean>;
  onPurgeStandby?: () => Promise<number | null>;
  onNavigateTab: (tab: TabType) => void;
}

export const DashboardAssistantCard: React.FC<DashboardAssistantCardProps> = ({
  telemetry,
  timerActive,
  onToggleTimer,
  onPurgeStandby,
  onNavigateTab,
}) => {
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePurge = async () => {
    if (!onPurgeStandby) return;
    setIsProcessing(true);
    try {
      const freedMb = await onPurgeStandby();
      setFeedback(freedMb === null
        ? 'Unable to purge standby memory.'
        : freedMb > 0 ? `${freedMb.toFixed(0)} MB of standby RAM freed.` : 'No standby RAM was freed.');
      setTimeout(() => setFeedback(null), 3000);
    } catch (error) {
      console.error('Failed to purge standby memory', error);
      setFeedback('Unable to purge standby memory.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleToggleTimer = async () => {
    if (!onToggleTimer) return;
    try {
      const changed = await onToggleTimer();
      setFeedback(changed
        ? `Kernel timer changed to ${timerActive ? '15.6ms' : '1.0ms'}.`
        : 'Unable to change kernel timer.');
    } catch (error) {
      console.error('Failed to change kernel timer', error);
      setFeedback('Unable to change kernel timer.');
    }
    setTimeout(() => setFeedback(null), 3000);
  };

  const handleFlushDNS = async () => {
    if (window.go?.main?.App?.FlushDNS) {
      setIsProcessing(true);
      try {
        const succeeded = await window.go.main.App.FlushDNS();
        setFeedback(succeeded ? 'DNS resolver cache flushed' : 'Unable to flush DNS resolver cache');
        setTimeout(() => setFeedback(null), 3000);
      } catch (error) {
        console.error('Failed to flush DNS resolver cache', error);
        setFeedback('Unable to flush DNS resolver cache');
      } finally {
        setIsProcessing(false);
      }
    }
  };

  return (
    <div className="bg-surface rounded-2xl p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-[13px] font-medium text-textPrimary tracking-tight">
            Quick Actions
          </h3>
          <p className="text-[11px] text-textTertiary font-mono mt-0.5">
            Kernel scheduler tuning, memory reclamation, and storage tools
          </p>
        </div>
        {telemetry && (
          <span className="text-[11px] font-mono text-textTertiary">
            {Math.round(telemetry.ramPercent)}% Memory in use
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 pt-0.5">
        <button
          onClick={handlePurge}
          disabled={isProcessing || !onPurgeStandby}
          className="group p-4 rounded-xl bg-surfaceSubtle hover:bg-surfaceHover text-left flex flex-col justify-between space-y-3 active:scale-[0.97] transition-all disabled:opacity-50 select-none"
        >
          <div className="w-8 h-8 rounded-lg bg-surface flex items-center justify-center text-textSecondary group-hover:text-textPrimary transition-colors">
            <HardDrive className="w-4 h-4" />
          </div>
          <div>
            <span className="block font-medium text-[13px] text-textPrimary tracking-tight">
              Purge RAM
            </span>
            <span className="text-[10px] text-textTertiary font-mono block mt-0.5">
              Reclaim standby
            </span>
          </div>
        </button>

        <button
          onClick={handleToggleTimer}
          disabled={!onToggleTimer}
          className="group p-4 rounded-xl bg-surfaceSubtle hover:bg-surfaceHover text-left flex flex-col justify-between space-y-3 active:scale-[0.97] transition-all select-none"
        >
          <div className="w-8 h-8 rounded-lg bg-surface flex items-center justify-center text-textSecondary group-hover:text-textPrimary transition-colors">
            <Zap className="w-4 h-4" />
          </div>
          <div>
            <span className="block font-medium text-[13px] text-textPrimary tracking-tight">
              {timerActive ? '1.0ms Timer' : 'Standard'}
            </span>
            <span className="text-[10px] text-textTertiary font-mono block mt-0.5">
              {timerActive ? 'High resolution' : '15.6ms base'}
            </span>
          </div>
        </button>

        <button
          onClick={handleFlushDNS}
          disabled={isProcessing}
          className="group p-4 rounded-xl bg-surfaceSubtle hover:bg-surfaceHover text-left flex flex-col justify-between space-y-3 active:scale-[0.97] transition-all disabled:opacity-50 select-none"
        >
          <div className="w-8 h-8 rounded-lg bg-surface flex items-center justify-center text-textSecondary group-hover:text-textPrimary transition-colors">
            <RefreshCw className="w-4 h-4" />
          </div>
          <div>
            <span className="block font-medium text-[13px] text-textPrimary tracking-tight">
              Flush DNS
            </span>
            <span className="text-[10px] text-textTertiary font-mono block mt-0.5">
              Reset resolver
            </span>
          </div>
        </button>

        <button
          onClick={() => onNavigateTab('processes')}
          className="group p-4 rounded-xl bg-surfaceSubtle hover:bg-surfaceHover text-left flex flex-col justify-between space-y-3 active:scale-[0.97] transition-all select-none"
        >
          <div className="w-8 h-8 rounded-lg bg-surface flex items-center justify-center text-textSecondary group-hover:text-textPrimary transition-colors">
            <Cpu className="w-4 h-4" />
          </div>
          <div>
            <span className="block font-medium text-[13px] text-textPrimary tracking-tight">
              Processes
            </span>
            <span className="text-[10px] text-textTertiary font-mono block mt-0.5">
              Task manager
            </span>
          </div>
        </button>

        <button
          onClick={() => onNavigateTab('storage')}
          className="group p-4 rounded-xl bg-surfaceSubtle hover:bg-surfaceHover text-left flex flex-col justify-between space-y-3 active:scale-[0.97] transition-all select-none"
        >
          <div className="w-8 h-8 rounded-lg bg-surface flex items-center justify-center text-textSecondary group-hover:text-textPrimary transition-colors">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <span className="block font-medium text-[13px] text-textPrimary tracking-tight">
              Storage Deck
            </span>
            <span className="text-[10px] text-textTertiary font-mono block mt-0.5">
              Clean volumes
            </span>
          </div>
        </button>
      </div>

      {feedback && (
        <div className="text-[11px] font-mono text-textPrimary bg-surfaceSubtle px-3 py-2 rounded-xl flex items-center space-x-2 animate-fade-in">
          <Check className="w-3.5 h-3.5 text-textSecondary" />
          <span>{feedback}</span>
        </div>
      )}
    </div>
  );
};
