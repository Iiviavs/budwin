import React from 'react';
import { Sparkline } from './Sparkline';

interface MetricCardProps {
  title: string;
  value: string;
  subValue?: string;
  icon: React.ReactNode;
  accentColor: string;
  gradientId: string;
  history: number[];
  maxHistory?: number;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subValue,
  icon,
  accentColor,
  gradientId,
  history,
  maxHistory = 100,
}) => {
  return (
    <div className="glass-card rounded-2xl p-4 flex flex-col justify-between shadow-xl">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2 text-xs font-semibold text-neutral-300">
          <span style={{ color: accentColor }}>{icon}</span>
          <span>{title}</span>
        </div>
        <div className="text-right">
          <span className="text-lg font-bold text-white tracking-tight">{value}</span>
        </div>
      </div>

      <div className="my-1.5">
        <Sparkline
          data={history}
          max={maxHistory}
          color={accentColor}
          gradientId={gradientId}
          height={44}
        />
      </div>

      {subValue && (
        <div className="text-[11px] text-neutral-400 font-normal truncate pt-1.5 border-t border-white/[0.04]">
          {subValue}
        </div>
      )}
    </div>
  );
};
