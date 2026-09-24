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
  const [currentHz, setCurrentHz] = useState(0);
  const [peakHz, setPeakHz] = useState(0);
  const [avgHz, setAvgHz] = useState(0);
  const [samplesCount, setSamplesCount] = useState(0);
  const [clickCount, setClickCount] = useState(0);

  const [connectedGamepad, setConnectedGamepad] = useState<Gamepad | null>(null);
  const [gamepadButtons, setGamepadButtons] = useState<number[]>([]);
  const [gamepadAxes, setGamepadAxes] = useState<number[]>([]);

  const prevTimeRef = useRef<number>(0);
  const hzSamplesRef = useRef<number[]>([]);

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
    <div className="p-6 md:p-8 space-y-6 pb-24 font-sans max-w-5xl mx-auto">
      <div>
        <h2 className="text-xl font-medium tracking-tight text-textPrimary flex items-center space-x-2">
          <Activity className="w-5 h-5 text-textPrimary" />
          <span>Input Lab</span>
        </h2>
        <p className="text-xs text-textSecondary mt-1 font-normal">
          Measure mouse polling rate in real-time and inspect controller mapping
        </p>
      </div>

      <div className="bg-surface rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-surfaceSubtle flex items-center justify-center text-textSecondary">
              <MousePointer2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-textPrimary">Mouse Polling Rate (Hz)</h3>
              <p className="text-[11px] text-textSecondary">Move cursor rapidly inside the arena to test reporting frequency</p>
            </div>
          </div>

          <button
            onClick={handleResetMouse}
            className="px-3 py-1.5 rounded-xl bg-surfaceSubtle hover:bg-surfaceHover text-textSecondary hover:text-textPrimary text-xs font-medium flex items-center space-x-1.5 transition-all active:scale-[0.96]"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
          <div className="bg-surfaceSubtle rounded-xl p-3">
            <span className="text-[10px] text-textTertiary font-mono block uppercase">Current Polling</span>
            <span className="text-xl font-medium text-textPrimary font-mono mt-0.5 block tabular-nums">{currentHz} Hz</span>
          </div>

          <div className="bg-surfaceSubtle rounded-xl p-3">
            <span className="text-[10px] text-textTertiary font-mono block uppercase">Peak Recorded</span>
            <span className="text-xl font-medium text-textPrimary font-mono mt-0.5 block tabular-nums">{peakHz} Hz</span>
          </div>

          <div className="bg-surfaceSubtle rounded-xl p-3">
            <span className="text-[10px] text-textTertiary font-mono block uppercase">Average Rate</span>
            <span className="text-xl font-medium text-textPrimary font-mono mt-0.5 block tabular-nums">{avgHz} Hz</span>
          </div>

          <div className="bg-surfaceSubtle rounded-xl p-3">
            <span className="text-[10px] text-textTertiary font-mono block uppercase">Delay Per Tick</span>
            <span className="text-xl font-medium text-textPrimary font-mono mt-0.5 block tabular-nums">
              {currentHz > 0 ? `${(1000 / currentHz).toFixed(2)} ms` : '0.00 ms'}
            </span>
          </div>
        </div>

        <div
          onMouseMove={handleMouseMove}
          onClick={handleMouseClick}
          className="w-full h-32 rounded-xl bg-surfaceSubtle hover:bg-surface flex flex-col items-center justify-center cursor-crosshair select-none transition-colors"
        >
          <span className="text-xs font-medium text-textSecondary pointer-events-none">
            Move mouse continuously inside this area to benchmark polling rate
          </span>
          <span className="text-[11px] text-textTertiary font-mono mt-1 pointer-events-none">
            Clicks recorded: {clickCount} • Samples: {samplesCount}
          </span>
        </div>
      </div>

      <div className="bg-surface rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-surfaceSubtle flex items-center justify-center text-textSecondary">
              <Gamepad2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-textPrimary">Gamepad Inspector</h3>
              <p className="text-[11px] text-textSecondary">High-precision controller input bus</p>
            </div>
          </div>

          <div>
            {connectedGamepad ? (
              <span className="px-2.5 py-1 rounded-xl bg-surfaceSubtle text-textPrimary text-xs font-mono flex items-center space-x-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-textPrimary" />
                <span>Connected: {connectedGamepad.id.slice(0, 24)}...</span>
              </span>
            ) : (
              <span className="px-2.5 py-1 rounded-xl bg-surfaceSubtle text-textTertiary text-xs font-mono">
                Connect a Controller to Test
              </span>
            )}
          </div>
        </div>

        {connectedGamepad ? (
          <div className="space-y-3">
            <div>
              <span className="text-[10px] font-mono text-textTertiary block mb-1.5 uppercase tracking-wider">
                Digital & Analog Buttons ({gamepadButtons.length})
              </span>
              <div className="flex flex-wrap gap-1.5">
                {gamepadButtons.map((val, i) => (
                  <span
                    key={i}
                    className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-all ${
                      val > 0.1
                        ? 'bg-textPrimary text-background'
                        : 'bg-surfaceSubtle text-textTertiary'
                    }`}
                  >
                    B{i}: {val > 0.1 ? val.toFixed(1) : 0}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <span className="text-[10px] font-mono text-textTertiary block mb-1.5 uppercase tracking-wider">
                Analog Thumbstick Axes ({gamepadAxes.length})
              </span>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {gamepadAxes.map((axis, i) => (
                  <div key={i} className="bg-surfaceSubtle rounded-xl p-2 flex justify-between items-center text-xs">
                    <span className="text-textSecondary font-mono">Axis {i}</span>
                    <span className={`font-mono font-medium ${Math.abs(axis) > 0.1 ? 'text-textPrimary' : 'text-textTertiary'}`}>
                      {axis.toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="p-6 bg-surfaceSubtle rounded-xl text-center text-xs text-textTertiary font-mono">
            Press any button on your connected controller to begin testing.
          </div>
        )}
      </div>

      <div className="bg-surface rounded-2xl p-5 space-y-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-surfaceSubtle flex items-center justify-center text-textSecondary">
              <Monitor className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-textPrimary">Display Profiles</h3>
              <p className="text-[11px] text-textSecondary">
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
            className={`px-3 py-1.5 rounded-xl text-xs font-mono transition-all active:scale-[0.96] ${
              multiMonitorSettings.dimSecondaryMonitors
                ? 'bg-surfaceSubtle text-textPrimary'
                : 'bg-transparent text-textTertiary hover:text-textPrimary'
            }`}
          >
            {multiMonitorSettings.dimSecondaryMonitors ? 'ACTIVE' : 'OFF'}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 pt-1">
          {monitors.map((m) => (
            <div key={m.index} className="bg-surfaceSubtle rounded-xl p-3 flex items-center justify-between">
              <div>
                <span className="text-xs font-medium text-textPrimary block">
                  Display #{m.index + 1} {m.isPrimary && '(Primary)'}
                </span>
                <span className="text-[11px] text-textTertiary font-mono">
                  Resolution: {m.width} x {m.height}
                </span>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-surface text-textSecondary">
                {m.isPrimary ? 'PRIMARY' : 'SECONDARY'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
