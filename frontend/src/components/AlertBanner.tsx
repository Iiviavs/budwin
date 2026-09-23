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
            className={`rounded-2xl p-3.5 border flex items-center justify-between shadow-xl animate-fadeIn ${
              isThermal
                ? 'bg-rose-950/40 border-rose-500/40 text-rose-200'
                : 'bg-surface border-accent-theme/30 text-white shadow-accent-theme/5'
            }`}
          >
            <div className="flex items-center space-x-3">
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                  isThermal ? 'bg-rose-500/20 text-rose-400' : 'bg-accent-theme/15 text-accent-theme'
                }`}
              >
                {isThermal ? <Flame className="w-5 h-5 animate-pulse" /> : <AlertTriangle className="w-5 h-5" />}
              </div>

              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-bold text-white">{alert.title}</span>
                  <span
                    className={`text-[9px] font-bold px-1.5 py-0.2 rounded-md uppercase tracking-wider border ${
                      isThermal
                        ? 'bg-rose-500/20 text-rose-400 border-rose-500/30'
                        : 'bg-accent-theme/15 text-accent-theme border-accent-theme/30'
                    }`}
                  >
                    {alert.severity}
                  </span>
                </div>
                <p className="text-[11px] text-neutral-300 mt-0.5">{alert.description}</p>
              </div>
            </div>

            <div className="flex items-center space-x-2 shrink-0">
              <button
                onClick={() => onResolve(alert.id, alert.type, alert.targetPid)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-md active:scale-95 ${
                  isThermal
                    ? 'bg-rose-500 hover:bg-rose-400 text-white'
                    : 'bg-accent-theme hover:opacity-90 text-black'
                }`}
              >
                {alert.actionLabel}
              </button>
              <button
                onClick={() => onDismiss(alert.id)}
                className="p-1.5 rounded-xl hover:bg-white/10 text-neutral-400 hover:text-white transition-colors"
                title="Dismiss Alert"
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
