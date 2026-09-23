import React, { useEffect, useRef, useState } from 'react';
import { Sparkles, Check, Zap } from 'lucide-react';
import { TelemetrySnapshot } from '../types';

interface BuddyMascotProps {
  telemetry: TelemetrySnapshot | null;
  gameBoostActive: boolean;
  activeGameName?: string;
  onQuickPurge?: () => Promise<void>;
  compact?: boolean;
}

export const BuddyMascot: React.FC<BuddyMascotProps> = ({
  telemetry,
  gameBoostActive,
  activeGameName,
  onQuickPurge,
  compact = false,
}) => {
  const [purged, setPurged] = useState(false);
  const [purging, setPurging] = useState(false);
  const feedbackTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mounted = useRef(false);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      if (feedbackTimeout.current) clearTimeout(feedbackTimeout.current);
    };
  }, []);

  const handleClick = async () => {
    if (purging) return;
    setPurging(true);
    setPurged(false);

    if (onQuickPurge) {
      try {
        await onQuickPurge();
      } catch (error) {
        console.error('Failed to purge standby memory', error);
      }
    }

    if (!mounted.current) return;
    setPurging(false);
    setPurged(true);

    if (feedbackTimeout.current) clearTimeout(feedbackTimeout.current);
    feedbackTimeout.current = setTimeout(() => {
      if (mounted.current) {
        setPurged(false);
      }
      feedbackTimeout.current = null;
    }, 2200);
  };

  const title = activeGameName ? activeGameName : 'Companion Engine';
  const subtitle = purged
    ? 'Standby RAM Cleared'
    : purging
    ? 'Purging memory...'
    : gameBoostActive
    ? 'Priority Mode • 1.0ms'
    : 'System Optimal';

  if (compact) {
    return (
      <button
        onClick={handleClick}
        className="relative cursor-pointer flex items-center justify-center p-1 rounded-lg hover:bg-surfaceSubtle transition-colors"
        title="Purge standby RAM"
      >
        <Zap className="w-3.5 h-3.5 text-textSecondary" />
      </button>
    );
  }

  return (
    <div
      onClick={handleClick}
      role="button"
      tabIndex={0}
      className="group relative w-full bg-surface/60 hover:bg-surface border border-white/[0.04] rounded-xl p-2.5 transition-all duration-150 cursor-pointer select-none active:scale-[0.98]"
      title="Click to purge standby RAM"
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center space-x-2 min-w-0">
          <div className="w-5 h-5 rounded-md bg-surfaceSubtle flex items-center justify-center shrink-0">
            {purged ? (
              <Check className="w-3 h-3 text-textPrimary" />
            ) : (
              <Sparkles className="w-3 h-3 text-textSecondary group-hover:text-textPrimary transition-colors" />
            )}
          </div>
          <span className="font-medium text-xs text-textPrimary truncate leading-tight">
            {title}
          </span>
        </div>

        <span className="text-[10px] font-mono text-textTertiary px-1.5 py-0.5 rounded bg-surfaceSubtle shrink-0">
          {purged ? 'FREED' : 'PURGE'}
        </span>
      </div>

      <div className="mt-1.5 flex items-center justify-between text-[11px] text-textTertiary">
        <span className="truncate">{subtitle}</span>
        {telemetry && (
          <span className="font-mono text-[10px] text-textTertiary shrink-0 ml-1">
            {telemetry.ramUsedGb.toFixed(1)}GB
          </span>
        )}
      </div>
    </div>
  );
};
