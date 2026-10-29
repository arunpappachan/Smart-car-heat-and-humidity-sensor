import React from 'react';
import { Cpu } from 'lucide-react';

export default function LEDIndicator({
  status = 'NORMAL',
  temperature = 0,
  isOnline = true,
}) {
  const tempVal = typeof temperature === 'number' ? temperature : parseFloat(temperature) || 0;

  // Exact ESP32 hardware LED logic: strictly one LED active at a time
  const isRedActive = isOnline && (status === 'HIGH' || tempVal >= 35.0);
  const isYellowActive = isOnline && !isRedActive && (status === 'WARNING' || tempVal >= 30.0);
  const isGreenActive = isOnline && !isRedActive && !isYellowActive;

  return (
    <div className="glass-panel rounded-2xl p-6 transition-all duration-300">
      {/* Title */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2.5">
          <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 text-slate-300">
            <Cpu className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <h2 className="text-xs uppercase tracking-wider text-slate-400 font-semibold">
              Hardware LED Indicators
            </h2>
            <span className="text-[11px] text-slate-500">
              ESP32 GPIO 26 (Red), 25 (Yellow), 27 (Green)
            </span>
          </div>
        </div>
        <div className="text-[11px] font-mono text-slate-500">
          {isOnline ? 'SYNCHRONIZED' : 'OFFLINE'}
        </div>
      </div>

      {/* LED Display Modules */}
      <div className="grid grid-cols-3 gap-3 sm:gap-4 mt-6">
        {/* GREEN LED */}
        <div
          className={`rounded-xl p-4 text-center transition-all duration-300 border ${
            isGreenActive
              ? 'bg-emerald-950/40 border-emerald-500/50 shadow-glow-green/30'
              : 'bg-slate-900/50 border-slate-800/80 opacity-60'
          }`}
        >
          {/* Hardware LED Bulb */}
          <div className="flex justify-center mb-3">
            <div className="w-12 h-12 rounded-full led-housing flex items-center justify-center p-1.5">
              <div
                className={`w-full h-full rounded-full led-bulb transition-all duration-300 ${
                  isGreenActive
                    ? 'bg-emerald-400 shadow-[0_0_22px_#10b981,0_0_35px_rgba(16,185,129,0.7)] animate-pulse'
                    : 'bg-emerald-950 border border-emerald-900/40 opacity-40'
                }`}
              />
            </div>
          </div>
          <div className="font-bold text-xs uppercase tracking-wider text-emerald-400">
            Green LED
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">GPIO 27</div>
          <div className="text-[10px] text-slate-500 mt-1 font-mono">&lt; 30.0°C (Normal)</div>
          <div
            className={`mt-2 text-[10px] font-bold py-0.5 px-2 rounded-full inline-block ${
              isGreenActive ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-800 text-slate-500'
            }`}
          >
            {isGreenActive ? 'ACTIVE (ON)' : 'STANDBY'}
          </div>
        </div>

        {/* YELLOW LED */}
        <div
          className={`rounded-xl p-4 text-center transition-all duration-300 border ${
            isYellowActive
              ? 'bg-amber-950/40 border-amber-500/50 shadow-glow-yellow/30'
              : 'bg-slate-900/50 border-slate-800/80 opacity-60'
          }`}
        >
          {/* Hardware LED Bulb */}
          <div className="flex justify-center mb-3">
            <div className="w-12 h-12 rounded-full led-housing flex items-center justify-center p-1.5">
              <div
                className={`w-full h-full rounded-full led-bulb transition-all duration-300 ${
                  isYellowActive
                    ? 'bg-amber-400 shadow-[0_0_22px_#f59e0b,0_0_35px_rgba(245,158,11,0.7)] animate-pulse'
                    : 'bg-amber-950 border border-amber-900/40 opacity-40'
                }`}
              />
            </div>
          </div>
          <div className="font-bold text-xs uppercase tracking-wider text-amber-400">
            Yellow LED
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">GPIO 25</div>
          <div className="text-[10px] text-slate-500 mt-1 font-mono">30 - 35°C (Caution)</div>
          <div
            className={`mt-2 text-[10px] font-bold py-0.5 px-2 rounded-full inline-block ${
              isYellowActive ? 'bg-amber-500/20 text-amber-300' : 'bg-slate-800 text-slate-500'
            }`}
          >
            {isYellowActive ? 'ACTIVE (ON)' : 'STANDBY'}
          </div>
        </div>

        {/* RED LED */}
        <div
          className={`rounded-xl p-4 text-center transition-all duration-300 border ${
            isRedActive
              ? 'bg-red-950/40 border-red-500/50 shadow-glow-red/40'
              : 'bg-slate-900/50 border-slate-800/80 opacity-60'
          }`}
        >
          {/* Hardware LED Bulb */}
          <div className="flex justify-center mb-3">
            <div className="w-12 h-12 rounded-full led-housing flex items-center justify-center p-1.5">
              <div
                className={`w-full h-full rounded-full led-bulb transition-all duration-300 ${
                  isRedActive
                    ? 'bg-red-500 shadow-[0_0_25px_#ef4444,0_0_40px_rgba(239,68,68,0.8)] animate-pulse'
                    : 'bg-red-950 border border-red-900/40 opacity-40'
                }`}
              />
            </div>
          </div>
          <div className="font-bold text-xs uppercase tracking-wider text-red-400">
            Red LED
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">GPIO 26</div>
          <div className="text-[10px] text-slate-500 mt-1 font-mono">&ge; 35.0°C (Alert)</div>
          <div
            className={`mt-2 text-[10px] font-bold py-0.5 px-2 rounded-full inline-block ${
              isRedActive ? 'bg-red-500/20 text-red-300' : 'bg-slate-800 text-slate-500'
            }`}
          >
            {isRedActive ? 'ACTIVE (ON)' : 'STANDBY'}
          </div>
        </div>
      </div>
    </div>
  );
}
