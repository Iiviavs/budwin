import React from 'react';
import { Cpu, Zap, HardDrive, Maximize2, X } from 'lucide-react';
import { TelemetrySnapshot } from '../types';
import { BuddyMascot } from '../components/BuddyMascot';

interface FloatingHudViewProps {
  telemetry: TelemetrySnapshot | null;
  timerActive: boolean;
  onExpand: () => void;
  onClose: () => void;
  onQuickPurge?: () => Promise<void>;
}

export const FloatingHudView: React.FC<FloatingHudViewProps> = ({
  telemetry,
  timerActive,
  onExpand,
  onClose,
  onQuickPurge,
}) => {
  const cpuPercent = telemetry ? Math.round(telemetry.cpuPercent) : 0;
  const ramPercent = telemetry ? Math.round(telemetry.ramPercent) : 0;
  const gpuPercent = telemetry?.gpu.isAvailable ? Math.round(telemetry.gpu.coreUtilization) : 0;
  const gpuTemp = telemetry?.gpu.isAvailable ? telemetry.gpu.temperatureC : 0;

  return (
    <div
      onDoubleClick={onExpand}
      className="w-full h-full flex items-center justify-between px-2.5 select-none font-sans text-textPrimary rounded-full overflow-hidden draggable bg-surface/95 border border-border shadow-md backdrop-blur-md"
      title="Double-click to expand to full app"
    >
      <div className="flex items-center space-x-1.5 non-draggable shrink-0">
        <BuddyMascot
          telemetry={telemetry}
          gameBoostActive={timerActive}
          onQuickPurge={onQuickPurge}
          compact={true}
        />

        <span className="text-[9px] font-mono px-1.5 py-0.5 rounded-full bg-surfaceSubtle text-textSecondary border border-border">
          {timerActive ? '1.0ms' : '15ms'}
        </span>
      </div>

      <div className="flex items-center space-x-2 non-draggable text-[11px] font-mono shrink-0">
        <div className="flex items-center space-x-1 text-textSecondary">
          <Cpu className="w-3 h-3" />
          <span className="font-medium text-textPrimary text-[11px]">{cpuPercent}%</span>
        </div>

        <div className="flex items-center space-x-1 text-textSecondary">
          <Zap className="w-3 h-3" />
          <span className="font-medium text-textPrimary text-[11px]">{gpuPercent}%</span>
          {gpuTemp > 0 && <span className="text-[9px] text-textTertiary font-normal">({gpuTemp}°)</span>}
        </div>

        <div className="flex items-center space-x-1 text-textSecondary">
          <HardDrive className="w-3 h-3" />
          <span className="font-medium text-textPrimary text-[11px]">{ramPercent}%</span>
        </div>
      </div>

      <div className="flex items-center space-x-1 non-draggable shrink-0 pl-1">
        <button
          onClick={onExpand}
          className="w-5 h-5 rounded-full flex items-center justify-center bg-surfaceSubtle hover:bg-surfaceHover text-textSecondary hover:text-textPrimary transition-all active:scale-90 border border-border"
          title="Maximize to Full Dashboard"
          aria-label="Maximize to Full Dashboard"
        >
          <Maximize2 className="w-3 h-3" />
        </button>
        <button
          onClick={onClose}
          className="w-5 h-5 rounded-full flex items-center justify-center bg-surfaceSubtle hover:bg-surfaceHover text-textSecondary hover:text-textPrimary transition-all active:scale-90 border border-border"
          title="Close to Tray"
          aria-label="Close to tray"
        >
          <X className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};
