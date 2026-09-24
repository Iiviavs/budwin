import React from 'react';
import { Sparkline } from './Sparkline';

interface MetricCardProps {
  title: string;
  value: string;
  subValue?: string;
  icon: React.ReactNode;
  accentColor?: string;
  gradientId: string;
  history: number[];
  maxHistory?: number;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subValue,
  icon,
  gradientId,
  history,
  maxHistory = 100,
}) => {
  return (
    <div className="bg-surface rounded-2xl p-4 flex flex-col justify-between space-y-2">
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center space-x-2 text-xs font-medium text-textSecondary">
          <span className="text-textTertiary">{icon}</span>
          <span className="tracking-wide uppercase text-[10px] font-medium text-textTertiary">{title}</span>
        </div>
        <div className="text-right">
          <span className="text-xl font-medium text-textPrimary tracking-tight font-mono tabular-nums">{value}</span>
        </div>
      </div>

      <div className="my-1">
        <Sparkline
          data={history}
          max={maxHistory}
          gradientId={gradientId}
          height={36}
        />
      </div>

      {subValue && (
        <div className="text-[11px] text-textTertiary font-mono truncate pt-1">
          {subValue}
        </div>
      )}
    </div>
  );
};
