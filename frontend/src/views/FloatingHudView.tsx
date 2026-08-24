import React, { useState } from 'react';
import { Cpu, Zap, HardDrive, Maximize2, X, Lock, Unlock } from 'lucide-react';
import { TelemetrySnapshot } from '../types';

interface FloatingHudViewProps {
  telemetry: TelemetrySnapshot | null;
  timerActive: boolean;
  onExpand: () => void;
  onClose: () => void;
}

export const FloatingHudView: React.FC<FloatingHudViewProps> = ({
  telemetry,
  timerActive,
  onExpand,
  onClose,
}) => {
  const [isLocked, setIsLocked] = useState(false);

  const cpuPercent = telemetry ? Math.round(telemetry.cpuPercent) : 0;
  const ramPercent = telemetry ? Math.round(telemetry.ramPercent) : 0;
  const gpuPercent = telemetry?.gpu.isAvailable ? Math.round(telemetry.gpu.coreUtilization) : 0;
  const gpuTemp = telemetry?.gpu.isAvailable ? telemetry.gpu.temperatureC : 0;

  return (
    <div
      className={`w-full h-full flex items-center justify-between px-3 py-1.5 select-none font-sans text-gray-100 rounded-2xl overflow-hidden transition-all duration-200 ${
        isLocked ? 'non-draggable' : 'draggable'
      }`}
      style={{
        backgroundColor: 'rgba(20, 22, 28, 0.70)', // Discord in-game overlay dark glass
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        border: '1px solid rgba(255, 255, 255, 0.12)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
      }}
    >
      {/* Discord-style Avatar with Active Green Voice/Status Ring */}
      <div className="flex items-center space-x-2 non-draggable shrink-0">
        <div className="relative w-6 h-6 rounded-full bg-[#111214] p-0.5 shadow-md">
          <img src="/logo.png" alt="budwin" className="w-full h-full object-cover rounded-full" />
          {/* Discord Online / 1.0ms Active Green Dot */}
          <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-[#23a55a] border-2 border-[#111214]" />
        </div>

        <div className="flex items-center space-x-1">
          <span className="text-[10px] font-bold font-mono px-1.5 py-0.2 rounded bg-[#23a55a]/20 text-[#23a55a] border border-[#23a55a]/30">
            {timerActive ? '1.0ms' : '15ms'}
          </span>
        </div>
      </div>

      {/* Live Hardware Telemetry Badges (Discord In-Game Style) */}
      <div className="flex items-center space-x-3 non-draggable text-xs font-mono">
        {/* CPU */}
        <div className="flex items-center space-x-1 text-[#5865F2]">
          <Cpu className="w-3.5 h-3.5" />
          <span className="font-bold text-white text-[11px]">{cpuPercent}%</span>
        </div>

        {/* GPU */}
        <div className="flex items-center space-x-1 text-[#23a55a]">
          <Zap className="w-3.5 h-3.5" />
          <span className="font-bold text-white text-[11px]">{gpuPercent}%</span>
          {gpuTemp > 0 && <span className="text-[9px] text-gray-400 font-normal">({gpuTemp}°)</span>}
        </div>

        {/* RAM */}
        <div className="flex items-center space-x-1 text-[#eb459e]">
          <HardDrive className="w-3.5 h-3.5" />
          <span className="font-bold text-white text-[11px]">{ramPercent}%</span>
        </div>
      </div>

      {/* Discord Overlay Controls */}
      <div className="flex items-center space-x-1 non-draggable text-gray-400 shrink-0">
        {/* Lock Overlay Toggle */}
        <button
          onClick={() => setIsLocked(!isLocked)}
          className={`p-1 rounded-lg transition-colors ${
            isLocked ? 'text-accent-lime bg-white/10' : 'hover:bg-white/10 hover:text-white'
          }`}
          title={isLocked ? 'Overlay Locked (Click to Unlock Drag)' : 'Lock Overlay in Place'}
        >
          {isLocked ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
        </button>

        {/* Expand to Full Dashboard */}
        <button
          onClick={onExpand}
          className="p-1 rounded-lg hover:bg-white/10 text-gray-300 hover:text-accent-lime transition-colors"
          title="Open Full Dashboard"
        >
          <Maximize2 className="w-3 h-3" />
        </button>

        {/* Close to Tray */}
        <button
          onClick={onClose}
          className="p-1 rounded-lg hover:bg-rose-500/40 text-gray-400 hover:text-rose-400 transition-colors"
          title="Close to Tray"
        >
          <X className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};
