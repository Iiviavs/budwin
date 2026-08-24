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
    <div className="glass-card rounded-xl p-4 flex flex-col justify-between hover:border-border transition-colors duration-200">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2 text-sm font-semibold text-gray-300">
          <span style={{ color: accentColor }}>{icon}</span>
          <span>{title}</span>
        </div>
        <div className="text-right">
          <span className="text-xl font-bold text-white tracking-tight">{value}</span>
        </div>
      </div>

      <div className="my-2">
        <Sparkline
          data={history}
          max={maxHistory}
          color={accentColor}
          gradientId={gradientId}
          height={48}
        />
      </div>

      {subValue && (
        <div className="text-xs text-gray-400 font-medium truncate pt-1 border-t border-border/50">
          {subValue}
        </div>
      )}
    </div>
  );
};
