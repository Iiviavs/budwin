import React from 'react';

interface SparklineProps {
  data: number[];
  max?: number;
  color?: string;
  gradientId: string;
  height?: number;
}

export const Sparkline: React.FC<SparklineProps> = ({
  data,
  max = 100,
  color = 'var(--sparkline-stroke)',
  gradientId,
  height = 44,
}) => {
  if (!data || data.length < 2) {
    return <div className="w-full bg-surfaceSubtle rounded" style={{ height }} />;
  }

  const width = 300;
  const step = width / (data.length - 1);
  const effectiveMax = Math.max(1, max);

  const points = data.map((val, idx) => {
    const clamped = Math.min(effectiveMax, Math.max(0, val));
    const y = height - (clamped / effectiveMax) * (height - 6) - 3;
    return `${idx * step},${y}`;
  });

  const linePath = `M ${points.join(' L ')}`;
  const fillPath = `${linePath} L ${width},${height} L 0,${height} Z`;

  return (
    <div className="w-full overflow-hidden" style={{ height }}>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="none"
        className="w-full h-full"
      >
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="currentColor" stopOpacity="0.12" />
            <stop offset="100%" stopColor="currentColor" stopOpacity="0.0" />
          </linearGradient>
        </defs>
        <path d={fillPath} fill={`url(#${gradientId})`} className="text-textSecondary" />
        <path
          d={linePath}
          fill="none"
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
};
