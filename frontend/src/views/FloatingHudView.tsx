import React from 'react';
import { Cpu, Zap, HardDrive, X } from 'lucide-react';
import { TelemetrySnapshot } from '../types';

interface FloatingHudViewProps {
  telemetry: TelemetrySnapshot | null;
  timerActive: boolean;
  onClose: () => void;
}

export const FloatingHudView: React.FC<FloatingHudViewProps> = ({
  telemetry,
  timerActive,
  onClose,
}) => {
  const cpuPercent = telemetry ? Math.round(telemetry.cpuPercent) : 0;
  const ramPercent = telemetry ? Math.round(telemetry.ramPercent) : 0;
  const gpuPercent = telemetry?.gpu.isAvailable ? Math.round(telemetry.gpu.coreUtilization) : 0;
  const gpuTemp = telemetry?.gpu.isAvailable ? telemetry.gpu.temperatureC : 0;

  return (
    <div
      className="w-full h-full flex items-center justify-between px-3 select-none font-sans text-gray-100 rounded-full overflow-hidden draggable"
      style={{
        backgroundColor: 'rgba(20, 22, 28, 0.85)', // Discord overlay solid glass
        border: '1px solid rgba(255, 255, 255, 0.12)',
        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.4)',
      }}
    >
      {/* Discord-style Avatar with Active Green Voice/Status Ring */}
      <div className="flex items-center space-x-2 non-draggable shrink-0">
        <div className="relative w-5 h-5 rounded-full bg-[#111214] p-0.5 shadow-md">
          <img src="/logo.png" alt="budwin" className="w-full h-full object-cover rounded-full" />
          <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-[#23a55a] border-2 border-[#111214]" />
        </div>

        <div className="flex items-center space-x-1">
          <span className="text-[9px] font-bold font-mono px-1.5 py-0.2 rounded-full bg-[#23a55a]/20 text-[#23a55a] border border-[#23a55a]/30">
            {timerActive ? '1.0ms' : '15ms'}
          </span>
        </div>
      </div>

      {/* Live Hardware Telemetry Badges (Discord In-Game Style) */}
      <div className="flex items-center space-x-2.5 non-draggable text-[11px] font-mono">
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

      {/* Close button only (No expand arrows) */}
      <div className="flex items-center space-x-0.5 non-draggable text-gray-400 shrink-0">
        <button
          onClick={onClose}
          className="p-1 rounded-full hover:bg-rose-500/50 text-gray-400 hover:text-white transition-colors"
          title="Close Overlay"
        >
          <X className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};
