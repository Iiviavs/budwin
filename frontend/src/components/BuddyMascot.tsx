import React, { useState } from 'react';
import { Sparkles, Heart } from 'lucide-react';
import { TelemetrySnapshot } from '../types';

interface BuddyMascotProps {
  telemetry: TelemetrySnapshot | null;
  gameBoostActive: boolean;
  activeGameName?: string;
  onQuickPurge?: () => Promise<void>;
  compact?: boolean;
}

export const BuddyMascot: React.FC<BuddyMascotProps> = ({
  telemetry,
  gameBoostActive,
  activeGameName,
  onQuickPurge,
  compact = false,
}) => {
  const [petted, setPetted] = useState(false);
  const [bubbleText, setBubbleText] = useState<string | null>(null);

  const cpu = telemetry ? telemetry.cpuPercent : 15;
  const gpuTemp = telemetry?.gpu.isAvailable ? telemetry.gpu.temperatureC : 50;

  // Determine emotional state
  let emoji = '🦝';
  let title = 'Buddy Companion';
  let subtitle = 'Ready & Protecting';

  if (gameBoostActive || activeGameName) {
    emoji = '🥽';
    title = activeGameName ? `In ${activeGameName}` : 'Turbo Gamer';
    subtitle = 'Locked In • 1.0ms';
  } else if (gpuTemp >= 80 || cpu >= 85) {
    emoji = '🥵';
    title = 'High Thermal Load';
    subtitle = `${gpuTemp}°C • Cooling`;
  } else if (cpu < 20 && gpuTemp < 55) {
    emoji = '😴';
    title = 'Chilling & Idle';
    subtitle = 'Zzz... System Cool';
  }

  const handleClick = async () => {
    setPetted(true);
    const compliments = [
      'Purged Standby RAM! 🚀',
      '1.0ms Timer Locked! ⚡',
      'Smoother FPS incoming! 🎮',
      'You are awesome! ❤️',
    ];
    const picked = compliments[Math.floor(Math.random() * compliments.length)];
    setBubbleText(picked);

    if (onQuickPurge) {
      await onQuickPurge();
    }

    setTimeout(() => {
      setPetted(false);
      setBubbleText(null);
    }, 2800);
  };

  if (compact) {
    return (
      <div
        onClick={handleClick}
        className="relative cursor-pointer group flex items-center space-x-1.5"
        title="Click to interact with Buddy"
      >
        <div className={`relative w-6 h-6 rounded-full overflow-hidden bg-[#18191E] transition-transform ${petted ? 'scale-125 rotate-6' : 'group-hover:scale-110'}`}>
          <img src="/logo.png" alt="budwin" className="w-full h-full object-cover scale-110" />
        </div>
        <span className="text-[10px]">{emoji}</span>
      </div>
    );
  }

  return (
    <div
      onClick={handleClick}
      className="relative bg-[#18191E] hover:bg-[#202127] rounded-xl p-2.5 flex items-center space-x-3 cursor-pointer group transition-all duration-200 shadow-md"
      title="Click Buddy to cheer him up & optimize memory!"
    >
      {/* Speech Bubble Tooltip */}
      {bubbleText && (
        <div className="absolute -top-9 left-2 bg-[#282A33] text-white text-[10px] font-bold px-2.5 py-1 rounded-lg shadow-xl border border-white/10 animate-bounce flex items-center space-x-1 z-50 whitespace-nowrap">
          <span>{bubbleText}</span>
          <Sparkles className="w-3 h-3 text-accent-theme inline" />
        </div>
      )}

      {/* Avatar Container with Animated Emoji Badge */}
      <div className="relative shrink-0">
        <div className={`w-9 h-9 rounded-full overflow-hidden bg-[#111215] transition-transform duration-200 ${petted ? 'scale-125 rotate-12' : 'group-hover:scale-105'}`}>
          <img src="/logo.png" alt="budwin mascot" className="w-full h-full object-cover scale-110" />
        </div>
        {/* Mood Mini Emoji Pill */}
        <span className="absolute -bottom-1 -right-1 text-[11px] leading-none bg-[#111215] rounded-full p-0.5 shadow-sm">
          {petted ? '❤️' : emoji}
        </span>
      </div>

      <div className="overflow-hidden flex-1">
        <div className="flex items-center space-x-1">
          <span className="font-bold text-xs text-white block truncate leading-tight">{title}</span>
          {petted && <Heart className="w-3 h-3 text-rose-400 fill-current inline animate-pulse" />}
        </div>
        <span className="text-[10px] text-accent-theme font-medium block truncate mt-0.5">
          {petted ? 'Standby RAM Freed!' : subtitle}
        </span>
      </div>
    </div>
  );
};
