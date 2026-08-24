import React from 'react';
import { Cpu, Zap, HardDrive, Maximize2, X, MoveUpLeft, MoveUpRight } from 'lucide-react';
import { TelemetrySnapshot } from '../types';

interface FloatingHudViewProps {
  telemetry: TelemetrySnapshot | null;
  timerActive: boolean;
  onExpand: () => void;
  onClose: () => void;
  onSnap: (corner: string) => void;
}

export const FloatingHudView: React.FC<FloatingHudViewProps> = ({
  telemetry,
  timerActive,
  onExpand,
  onClose,
  onSnap,
}) => {
  const cpuPercent = telemetry ? Math.round(telemetry.cpuPercent) : 0;
  const ramPercent = telemetry ? Math.round(telemetry.ramPercent) : 0;
  const gpuPercent = telemetry?.gpu.isAvailable ? Math.round(telemetry.gpu.coreUtilization) : 0;
  const gpuTemp = telemetry?.gpu.isAvailable ? telemetry.gpu.temperatureC : 0;

  return (
    <div
      className="w-full h-full flex flex-col justify-center px-3 py-1.5 select-none font-sans text-gray-100 draggable rounded-2xl overflow-hidden transition-all"
      style={{
        backgroundColor: 'rgba(8, 12, 20, 0.20)', // Ultra-clear crystal see-through
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.22)',
        boxShadow: '0 4px 24px rgba(0, 0, 0, 0.20)',
      }}
    >
      <div className="flex items-center justify-between w-full h-full">
        {/* Mascot Logo & Timer */}
        <div className="flex items-center space-x-1.5 non-draggable shrink-0">
          <div className="w-5 h-5 rounded-full overflow-hidden border border-accent-lime/60 bg-black/20">
            <img src="/logo.png" alt="budwin" className="w-full h-full object-cover scale-110" />
          </div>
          <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-accent-lime/30 text-accent-lime border border-accent-lime/50 font-mono shadow-sm">
            {timerActive ? '1ms' : '15ms'}
          </span>
        </div>

        {/* Live Hardware Stats */}
        <div className="flex items-center space-x-3 non-draggable text-[11px]">
          {/* CPU */}
          <div className="flex items-center space-x-1 font-mono">
            <Cpu className="w-3.5 h-3.5 text-sky-400" />
            <span className="font-bold text-white drop-shadow-sm">{cpuPercent}%</span>
          </div>

          {/* GPU */}
          <div className="flex items-center space-x-1 font-mono">
            <Zap className="w-3.5 h-3.5 text-emerald-400" />
            <span className="font-bold text-white drop-shadow-sm">{gpuPercent}%</span>
            {gpuTemp > 0 && <span className="text-[9px] text-gray-300 font-normal">({gpuTemp}°)</span>}
          </div>

          {/* RAM */}
          <div className="flex items-center space-x-1 font-mono">
            <HardDrive className="w-3.5 h-3.5 text-purple-400" />
            <span className="font-bold text-white drop-shadow-sm">{ramPercent}%</span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-1 non-draggable text-gray-300 shrink-0">
          <button
            onClick={() => onSnap('top-left')}
            className="p-1 rounded hover:bg-white/20 hover:text-white transition-colors"
            title="Snap Top-Left"
          >
            <MoveUpLeft className="w-3 h-3" />
          </button>
          <button
            onClick={() => onSnap('top-right')}
            className="p-1 rounded hover:bg-white/20 hover:text-white transition-colors"
            title="Snap Top-Right"
          >
            <MoveUpRight className="w-3 h-3" />
          </button>
          <button
            onClick={onExpand}
            className="p-1 rounded hover:bg-white/20 text-accent-lime transition-colors"
            title="Expand to Full View"
          >
            <Maximize2 className="w-3 h-3" />
          </button>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-rose-500/50 text-gray-300 hover:text-rose-300 transition-colors"
            title="Close to Tray"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
};
