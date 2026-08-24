import React from 'react';
import { Cpu, Zap, HardDrive, Maximize2, X } from 'lucide-react';
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
  const cpuPercent = telemetry ? Math.round(telemetry.cpuPercent) : 0;
  const ramPercent = telemetry ? Math.round(telemetry.ramPercent) : 0;
  const gpuPercent = telemetry?.gpu.isAvailable ? Math.round(telemetry.gpu.coreUtilization) : 0;
  const gpuTemp = telemetry?.gpu.isAvailable ? telemetry.gpu.temperatureC : 0;

  return (
    <div className="h-screen w-screen bg-background/95 border border-accent-lime/40 backdrop-blur-xl flex items-center justify-between px-3.5 select-none font-sans text-gray-100 draggable shadow-2xl rounded-2xl overflow-hidden">
      {/* Mascot & Drag handle */}
      <div className="flex items-center space-x-2 non-draggable">
        <div className="w-6 h-6 rounded-full overflow-hidden border border-accent-lime/50 shrink-0 bg-surface">
          <img src="/logo.png" alt="budwin" className="w-full h-full object-cover scale-110" />
        </div>
        <div className="flex items-center space-x-1.5">
          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-accent-lime/20 text-accent-lime border border-accent-lime/30 font-mono">
            {timerActive ? '1.0ms' : '15ms'}
          </span>
        </div>
      </div>

      {/* 3 Live Telemetry Stat Pills */}
      <div className="flex items-center space-x-3 non-draggable text-xs">
        {/* CPU */}
        <div className="flex items-center space-x-1 font-mono">
          <Cpu className="w-3.5 h-3.5 text-sky-400" />
          <span className="font-bold text-white">{cpuPercent}%</span>
        </div>

        {/* GPU */}
        <div className="flex items-center space-x-1 font-mono">
          <Zap className="w-3.5 h-3.5 text-emerald-400" />
          <span className="font-bold text-white">{gpuPercent}%</span>
          {gpuTemp > 0 && <span className="text-[10px] text-gray-400">{gpuTemp}°C</span>}
        </div>

        {/* RAM */}
        <div className="flex items-center space-x-1 font-mono">
          <HardDrive className="w-3.5 h-3.5 text-purple-400" />
          <span className="font-bold text-white">{ramPercent}%</span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center space-x-1 non-draggable">
        <button
          onClick={onExpand}
          className="p-1 rounded hover:bg-surfaceHover text-accent-lime transition-colors"
          title="Expand to Full Dashboard"
        >
          <Maximize2 className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={onClose}
          className="p-1 rounded hover:bg-rose-500/30 text-gray-400 hover:text-rose-400 transition-colors"
          title="Minimize to Tray"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
