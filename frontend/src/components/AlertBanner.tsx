import React from 'react';
import { AlertTriangle, Flame, X } from 'lucide-react';
import { AlertItem } from '../types';

interface AlertBannerProps {
  alerts: AlertItem[];
  onDismiss: (id: string) => void;
  onResolve: (id: string, type: string, targetPid?: number) => void;
}

export const AlertBanner: React.FC<AlertBannerProps> = ({ alerts, onDismiss, onResolve }) => {
  if (!alerts || alerts.length === 0) return null;

  return (
    <div className="px-6 pt-3 space-y-2">
      {alerts.map((alert) => {
        const isThermal = alert.type === 'thermal';

        return (
          <div
            key={alert.id}
            className="rounded-2xl p-3.5 bg-surface text-textPrimary flex items-center justify-between animate-fade-in"
          >
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-lg bg-surfaceSubtle flex items-center justify-center shrink-0 text-textSecondary">
                {isThermal ? <Flame className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
              </div>

              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-semibold text-textPrimary">{alert.title}</span>
                  <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-surfaceSubtle uppercase tracking-wider text-textSecondary">
                    {alert.severity}
                  </span>
                </div>
                <p className="text-[11px] text-textSecondary mt-0.5">{alert.description}</p>
              </div>
            </div>

            <div className="flex items-center space-x-2 shrink-0">
              <button
                onClick={() => onResolve(alert.id, alert.type, alert.targetPid)}
                className="px-3 py-1.5 rounded-xl text-xs font-medium bg-textPrimary text-background active:scale-[0.96] transition-transform"
              >
                {alert.actionLabel}
              </button>
              <button
                onClick={() => onDismiss(alert.id)}
                className="p-1.5 rounded-xl hover:bg-surfaceSubtle text-textTertiary hover:text-textPrimary transition-colors active:scale-[0.9]"
                title="Dismiss Alert"
                aria-label="Dismiss alert"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};
