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
      className="w-full h-full flex items-center justify-between px-2.5 select-none font-sans text-gray-100 rounded-full overflow-hidden draggable"
      style={{
        backgroundColor: 'rgba(16, 18, 24, 0.92)', // Discord overlay dark glass
        border: '1px solid rgba(255, 255, 255, 0.1)',
        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.6)',
      }}
      title="Double-click to expand to full app"
    >
      {/* 1. Left: Mascot Avatar + 1.0ms Badge */}
      <div className="flex items-center space-x-1.5 non-draggable shrink-0">
        <BuddyMascot
          telemetry={telemetry}
          gameBoostActive={timerActive}
          onQuickPurge={onQuickPurge}
          compact={true}
        />

        <span className="text-[9px] font-bold font-mono px-1 py-0.2 rounded bg-emerald-500/20 text-emerald-400">
          {timerActive ? '1.0ms' : '15ms'}
        </span>
      </div>

      {/* 2. Middle: Live Telemetry Badges */}
      <div className="flex items-center space-x-2 non-draggable text-[11px] font-mono shrink-0">
        {/* CPU */}
        <div className="flex items-center space-x-1 text-[#5865F2]">
          <Cpu className="w-3 h-3" />
          <span className="font-bold text-white text-[11px]">{cpuPercent}%</span>
        </div>

        {/* GPU */}
        <div className="flex items-center space-x-1 text-[#23a55a]">
          <Zap className="w-3 h-3" />
          <span className="font-bold text-white text-[11px]">{gpuPercent}%</span>
          {gpuTemp > 0 && <span className="text-[9px] text-neutral-400 font-normal">({gpuTemp}°)</span>}
        </div>

        {/* RAM */}
        <div className="flex items-center space-x-1 text-[#eb459e]">
          <HardDrive className="w-3 h-3" />
          <span className="font-bold text-white text-[11px]">{ramPercent}%</span>
        </div>
      </div>

      {/* 3. Right: Clear Maximize (↗) & Close (✕) Buttons */}
      <div className="flex items-center space-x-1 non-draggable shrink-0 pl-1">
        <button
          onClick={onExpand}
          className="w-5 h-5 rounded flex items-center justify-center bg-white/10 hover:bg-white/20 text-white transition-colors"
          title="Maximize to Full Dashboard"
        >
          <Maximize2 className="w-3 h-3 text-white" />
        </button>
        <button
          onClick={onClose}
          className="w-5 h-5 rounded flex items-center justify-center bg-white/5 hover:bg-rose-500 text-neutral-300 hover:text-white transition-colors"
          title="Close to Tray"
        >
          <X className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};
