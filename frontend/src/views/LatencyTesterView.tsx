import React, { useState, useEffect, useRef } from 'react';
import { MousePointer2, Gamepad2, Activity, RefreshCw, Monitor } from 'lucide-react';
import { MonitorInfo, MultiMonitorSettings } from '../types';

interface LatencyTesterViewProps {
  monitors: MonitorInfo[];
  multiMonitorSettings: MultiMonitorSettings;
  onUpdateMonitorSettings: (settings: MultiMonitorSettings) => void;
}

export const LatencyTesterView: React.FC<LatencyTesterViewProps> = ({
  monitors,
  multiMonitorSettings,
  onUpdateMonitorSettings,
}) => {
  // Mouse Polling State
  const [currentHz, setCurrentHz] = useState(0);
  const [peakHz, setPeakHz] = useState(0);
  const [avgHz, setAvgHz] = useState(0);
  const [samplesCount, setSamplesCount] = useState(0);
  const [clickCount, setClickCount] = useState(0);

  // Controller State
  const [connectedGamepad, setConnectedGamepad] = useState<Gamepad | null>(null);
  const [gamepadButtons, setGamepadButtons] = useState<number[]>([]);
  const [gamepadAxes, setGamepadAxes] = useState<number[]>([]);

  const prevTimeRef = useRef<number>(0);
  const hzSamplesRef = useRef<number[]>([]);

  // Track Mouse Movement inside arena
  const handleMouseMove = () => {
    const now = performance.now();
    if (prevTimeRef.current > 0) {
      const dt = now - prevTimeRef.current;
      if (dt > 0) {
        const hz = Math.round(1000 / dt);
        if (hz <= 10000) {
          setCurrentHz(hz);
          if (hz > peakHz) setPeakHz(hz);

          hzSamplesRef.current.push(hz);
          if (hzSamplesRef.current.length > 50) {
            hzSamplesRef.current.shift();
          }

          const sum = hzSamplesRef.current.reduce((a, b) => a + b, 0);
          setAvgHz(Math.round(sum / hzSamplesRef.current.length));
          setSamplesCount((c) => c + 1);
        }
      }
    }
    prevTimeRef.current = now;
  };

  const handleMouseClick = () => {
    setClickCount((c) => c + 1);
  };

  const handleResetMouse = () => {
    setCurrentHz(0);
    setPeakHz(0);
    setAvgHz(0);
    setSamplesCount(0);
    setClickCount(0);
    hzSamplesRef.current = [];
    prevTimeRef.current = 0;
  };

  // Gamepad Polling Loop
  useEffect(() => {
    let animFrame: number;

    const pollGamepads = () => {
      const gamepads = navigator.getGamepads ? navigator.getGamepads() : [];
      const gp = gamepads[0] || gamepads[1] || gamepads[2] || gamepads[3];

      if (gp) {
        setConnectedGamepad(gp);
        setGamepadButtons(gp.buttons.map((b) => b.value));
        setGamepadAxes(gp.axes.map((a) => Math.round(a * 100) / 100));
      } else {
        setConnectedGamepad(null);
      }

      animFrame = requestAnimationFrame(pollGamepads);
    };

    animFrame = requestAnimationFrame(pollGamepads);
    return () => cancelAnimationFrame(animFrame);
  }, []);

  return (
    <div className="p-6 space-y-5 pb-20 font-sans">
      {/* Header */}
      <div>
        <h2 className="text-base font-bold text-white flex items-center space-x-2">
          <Activity className="w-5 h-5 text-accent-theme" />
          <span>Input Latency Lab & Controller Tester</span>
        </h2>
        <p className="text-xs text-neutral-400 mt-0.5">
          Measure true mouse polling rate (Hz), click response times, and test gamepad inputs.
        </p>
      </div>

      {/* 1. MOUSE POLLING RATE ARENA (Raycast Style) */}
      <div className="glass-card rounded-2xl p-5 space-y-4 shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-[#24252A] flex items-center justify-center text-sky-400">
              <MousePointer2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Mouse Polling Rate (Hz) Arena</h3>
              <p className="text-[11px] text-neutral-400">Move your cursor fast inside the box below to test report rate</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleResetMouse}
              className="px-3 py-1.5 rounded-lg bg-[#24252A] hover:bg-[#2E3038] text-neutral-300 text-xs font-semibold flex items-center space-x-1.5 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          </div>
        </div>

        {/* 4 Stats Badges */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
          <div className="bg-[#111215] rounded-xl p-3">
            <span className="text-[11px] text-neutral-400 block">Current Polling</span>
            <span className="text-lg font-extrabold text-white font-mono mt-0.5 block">{currentHz} Hz</span>
          </div>

          <div className="bg-[#111215] rounded-xl p-3">
            <span className="text-[11px] text-neutral-400 block">Peak Recorded</span>
            <span className="text-lg font-extrabold text-accent-theme font-mono mt-0.5 block">{peakHz} Hz</span>
          </div>

          <div className="bg-[#111215] rounded-xl p-3">
            <span className="text-[11px] text-neutral-400 block">Average Rate</span>
            <span className="text-lg font-extrabold text-sky-400 font-mono mt-0.5 block">{avgHz} Hz</span>
          </div>

          <div className="bg-[#111215] rounded-xl p-3">
            <span className="text-[11px] text-neutral-400 block">Delay Per Tick</span>
            <span className="text-lg font-extrabold text-emerald-400 font-mono mt-0.5 block">
              {currentHz > 0 ? `${(1000 / currentHz).toFixed(2)} ms` : '0.00 ms'}
            </span>
          </div>
        </div>

        {/* Interactive Testing Canvas Box */}
        <div
          onMouseMove={handleMouseMove}
          onClick={handleMouseClick}
          className="w-full h-32 rounded-xl bg-[#111215] hover:bg-[#15161B] flex flex-col items-center justify-center cursor-crosshair select-none transition-colors border-2 border-dashed border-white/5 hover:border-accent-theme/20"
        >
          <span className="text-xs font-semibold text-neutral-300 pointer-events-none">
            Move mouse continuously inside this area to benchmark polling rate
          </span>
          <span className="text-[11px] text-neutral-500 mt-1 pointer-events-none">
            Clicks recorded: {clickCount} • Samples: {samplesCount}
          </span>
        </div>
      </div>

      {/* 2. GAMEPAD / CONTROLLER TESTER (Raycast Style) */}
      <div className="glass-card rounded-2xl p-5 space-y-4 shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-[#24252A] flex items-center justify-center text-purple-400">
              <Gamepad2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Controller & Gamepad Input Inspector</h3>
              <p className="text-[11px] text-neutral-400">Xbox, PlayStation DualSense, and USB controllers</p>
            </div>
          </div>

          <div>
            {connectedGamepad ? (
              <span className="px-2.5 py-1 rounded-lg bg-emerald-500/15 text-emerald-400 text-xs font-bold flex items-center space-x-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Connected: {connectedGamepad.id.slice(0, 24)}...</span>
              </span>
            ) : (
              <span className="px-2.5 py-1 rounded-lg bg-[#111215] text-neutral-400 text-xs font-medium">
                Connect a Controller to Test
              </span>
            )}
          </div>
        </div>

        {connectedGamepad ? (
          <div className="space-y-3">
            {/* Buttons Map */}
            <div>
              <span className="text-[11px] font-bold text-neutral-400 block mb-1.5 uppercase tracking-wider">
                Digital & Analog Buttons ({gamepadButtons.length})
              </span>
              <div className="flex flex-wrap gap-1.5">
                {gamepadButtons.map((val, i) => (
                  <span
                    key={i}
                    className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all ${
                      val > 0.1
                        ? 'bg-accent-theme text-black scale-105'
                        : 'bg-[#111215] text-neutral-400'
                    }`}
                  >
                    B{i}: {val > 0.1 ? val.toFixed(1) : 0}
                  </span>
                ))}
              </div>
            </div>

            {/* Thumbstick Axes Map */}
            <div>
              <span className="text-[11px] font-bold text-neutral-400 block mb-1.5 uppercase tracking-wider">
                Analog Thumbstick Axes ({gamepadAxes.length})
              </span>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {gamepadAxes.map((axis, i) => (
                  <div key={i} className="bg-[#111215] rounded-lg p-2 flex justify-between items-center text-xs">
                    <span className="text-neutral-400 font-mono">Axis {i}</span>
                    <span className={`font-mono font-bold ${Math.abs(axis) > 0.1 ? 'text-white' : 'text-neutral-500'}`}>
                      {axis.toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="p-6 bg-[#111215] rounded-xl text-center text-xs text-neutral-400">
            Press any button on your Xbox or DualSense controller to begin testing.
          </div>
        )}
      </div>

      {/* 3. MULTI-MONITOR GAMING PROFILE (Feature 5) */}
      <div className="glass-card rounded-2xl p-5 space-y-3.5 shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-[#24252A] flex items-center justify-center text-amber-400">
              <Monitor className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Multi-Monitor Gaming Optimization</h3>
              <p className="text-[11px] text-neutral-400">
                {monitors.length} Display{monitors.length > 1 ? 's' : ''} Detected
              </p>
            </div>
          </div>

          <button
            onClick={() =>
              onUpdateMonitorSettings({
                ...multiMonitorSettings,
                dimSecondaryMonitors: !multiMonitorSettings.dimSecondaryMonitors,
              })
            }
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
              multiMonitorSettings.dimSecondaryMonitors
                ? 'bg-accent-theme/15 text-accent-theme'
                : 'bg-[#24252A] text-neutral-400 hover:text-white'
            }`}
          >
            {multiMonitorSettings.dimSecondaryMonitors ? 'ACTIVE' : 'OFF'}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 pt-1">
          {monitors.map((m) => (
            <div key={m.index} className="bg-[#111215] rounded-xl p-3 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-white block">
                  Display #{m.index + 1} {m.isPrimary && '(Primary Gaming Display)'}
                </span>
                <span className="text-[11px] text-neutral-400">
                  Resolution: {m.width} x {m.height}
                </span>
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                m.isPrimary ? 'bg-emerald-500/15 text-emerald-400' : 'bg-[#24252A] text-neutral-400'
              }`}>
                {m.isPrimary ? 'PRIMARY' : 'SECONDARY'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
