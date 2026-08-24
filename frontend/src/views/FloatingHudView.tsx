import React, { useState } from 'react';
import { Cpu, Zap, HardDrive, Maximize2, X, MoveUpLeft, MoveUpRight, LayoutGrid, StretchHorizontal } from 'lucide-react';
import { TelemetrySnapshot } from '../types';

interface FloatingHudViewProps {
  telemetry: TelemetrySnapshot | null;
  timerActive: boolean;
  onExpand: () => void;
  onClose: () => void;
  onSnap: (corner: string) => void;
  onToggleType: (type: 'pill' | 'card') => void;
  hudType: 'pill' | 'card';
}

export const FloatingHudView: React.FC<FloatingHudViewProps> = ({
  telemetry,
  timerActive,
  onExpand,
  onClose,
  onSnap,
  onToggleType,
  hudType,
}) => {
  const [opacity, setOpacity] = useState<number>(0.75);

  const cpuPercent = telemetry ? Math.round(telemetry.cpuPercent) : 0;
  const ramPercent = telemetry ? Math.round(telemetry.ramPercent) : 0;
  const gpuPercent = telemetry?.gpu.isAvailable ? Math.round(telemetry.gpu.coreUtilization) : 0;
  const gpuTemp = telemetry?.gpu.isAvailable ? telemetry.gpu.temperatureC : 0;

  // 1. SLIM HORIZONTAL SEE-THROUGH GLASS PILL (360x48)
  if (hudType === 'pill') {
    return (
      <div
        className="h-full w-full flex items-center justify-between px-3 select-none font-sans text-gray-100 draggable rounded-full overflow-hidden transition-all duration-200"
        style={{
          backgroundColor: `rgba(11, 14, 20, ${opacity})`,
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          border: '1px solid rgba(255, 255, 255, 0.14)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.6)',
        }}
      >
        {/* Mascot & Timer Badge */}
        <div className="flex items-center space-x-2 non-draggable">
          <div className="w-6 h-6 rounded-full overflow-hidden border border-accent-lime/60 shrink-0 bg-surface/80">
            <img src="/logo.png" alt="budwin" className="w-full h-full object-cover scale-110" />
          </div>
          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-accent-lime/20 text-accent-lime border border-accent-lime/40 font-mono">
            {timerActive ? '1ms' : '15ms'}
          </span>
        </div>

        {/* Live Hardware Stats */}
        <div className="flex items-center space-x-3 non-draggable text-xs">
          {/* CPU */}
          <div className="flex items-center space-x-1 font-mono">
            <Cpu className="w-3.5 h-3.5 text-sky-400" />
            <span className="font-bold text-white text-[11px]">{cpuPercent}%</span>
          </div>

          {/* GPU */}
          <div className="flex items-center space-x-1 font-mono">
            <Zap className="w-3.5 h-3.5 text-emerald-400" />
            <span className="font-bold text-white text-[11px]">{gpuPercent}%</span>
            {gpuTemp > 0 && <span className="text-[9px] text-gray-400">{gpuTemp}°</span>}
          </div>

          {/* RAM */}
          <div className="flex items-center space-x-1 font-mono">
            <HardDrive className="w-3.5 h-3.5 text-purple-400" />
            <span className="font-bold text-white text-[11px]">{ramPercent}%</span>
          </div>
        </div>

        {/* Snapping & Controls */}
        <div className="flex items-center space-x-1 non-draggable text-gray-400">
          <button
            onClick={() => onSnap('top-left')}
            className="p-1 rounded hover:bg-white/10 hover:text-white transition-colors"
            title="Snap Top-Left"
          >
            <MoveUpLeft className="w-3 h-3" />
          </button>
          <button
            onClick={() => onSnap('top-right')}
            className="p-1 rounded hover:bg-white/10 hover:text-white transition-colors"
            title="Snap Top-Right"
          >
            <MoveUpRight className="w-3 h-3" />
          </button>
          <button
            onClick={() => onToggleType('card')}
            className="p-1 rounded hover:bg-white/10 hover:text-accent-lime transition-colors"
            title="Switch to Glass Card"
          >
            <LayoutGrid className="w-3 h-3" />
          </button>
          <button
            onClick={onExpand}
            className="p-1 rounded hover:bg-white/10 text-accent-lime transition-colors"
            title="Open Full Dashboard"
          >
            <Maximize2 className="w-3 h-3" />
          </button>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-rose-500/30 text-gray-400 hover:text-rose-400 transition-colors"
            title="Close to Tray"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      </div>
    );
  }

  // 2. VERTICAL SEE-THROUGH GLASS CARD (220x180)
  return (
    <div
      className="h-full w-full flex flex-col justify-between p-3 select-none font-sans text-gray-100 draggable rounded-2xl overflow-hidden"
      style={{
        backgroundColor: `rgba(11, 14, 20, ${opacity})`,
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        border: '1px solid rgba(255, 255, 255, 0.14)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.6)',
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between pb-1.5 border-b border-white/10 non-draggable">
        <div className="flex items-center space-x-2">
          <div className="w-5 h-5 rounded-full overflow-hidden border border-accent-lime/60 bg-surface">
            <img src="/logo.png" alt="budwin" className="w-full h-full object-cover scale-110" />
          </div>
          <span className="text-xs font-bold text-white">HUD Glass</span>
        </div>

        <div className="flex items-center space-x-1">
          <button
            onClick={() => onToggleType('pill')}
            className="p-1 rounded hover:bg-white/10 text-gray-400 hover:text-accent-lime transition-colors"
            title="Switch to Slim Pill"
          >
            <StretchHorizontal className="w-3 h-3" />
          </button>
          <button
            onClick={onExpand}
            className="p-1 rounded hover:bg-white/10 text-accent-lime transition-colors"
            title="Open Full Dashboard"
          >
            <Maximize2 className="w-3 h-3" />
          </button>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-rose-500/30 text-gray-400 hover:text-rose-400 transition-colors"
            title="Close to Tray"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* 3 Metric Rows */}
      <div className="space-y-1.5 my-1 non-draggable text-xs font-mono">
        <div className="flex items-center justify-between p-1 rounded-lg bg-white/5">
          <span className="flex items-center space-x-1.5 text-sky-400">
            <Cpu className="w-3.5 h-3.5" />
            <span>CPU</span>
          </span>
          <span className="font-bold text-white">{cpuPercent}%</span>
        </div>

        <div className="flex items-center justify-between p-1 rounded-lg bg-white/5">
          <span className="flex items-center space-x-1.5 text-emerald-400">
            <Zap className="w-3.5 h-3.5" />
            <span>GPU</span>
          </span>
          <span className="font-bold text-white">
            {gpuPercent}% {gpuTemp > 0 && <span className="text-[10px] text-gray-400 font-normal">({gpuTemp}°C)</span>}
          </span>
        </div>

        <div className="flex items-center justify-between p-1 rounded-lg bg-white/5">
          <span className="flex items-center space-x-1.5 text-purple-400">
            <HardDrive className="w-3.5 h-3.5" />
            <span>RAM</span>
          </span>
          <span className="font-bold text-white">{ramPercent}%</span>
        </div>
      </div>

      {/* Snap & Opacity Footer */}
      <div className="flex items-center justify-between pt-1 border-t border-white/10 non-draggable text-[10px] text-gray-400">
        <div className="flex items-center space-x-1">
          <button
            onClick={() => onSnap('top-left')}
            className="px-1.5 py-0.5 rounded bg-white/5 hover:bg-white/10 hover:text-white"
            title="Snap Top-Left"
          >
            ↖ Left
          </button>
          <button
            onClick={() => onSnap('top-right')}
            className="px-1.5 py-0.5 rounded bg-white/5 hover:bg-white/10 hover:text-white"
            title="Snap Top-Right"
          >
            Right ↗
          </button>
        </div>

        <button
          onClick={() => setOpacity(opacity === 0.75 ? 0.45 : opacity === 0.45 ? 0.95 : 0.75)}
          className="text-accent-lime font-bold hover:underline"
        >
          {Math.round(opacity * 100)}% Glass
        </button>
      </div>
    </div>
  );
};
