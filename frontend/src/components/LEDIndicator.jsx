import React from 'react';
import { Cpu, Zap } from 'lucide-react';

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
    <div className="glass-panel rounded-2xl p-6 transition-all duration-300 bg-white/95 border-slate-200 shadow-sm">
      {/* Title */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2.5">
          <div className="p-2.5 rounded-xl bg-sky-50 border border-sky-200 text-sky-600 shadow-2xs">
            <Cpu className="w-5 h-5 text-sky-600" />
          </div>
          <div>
            <h2 className="text-xs uppercase tracking-wider text-slate-500 font-bold">
              Hardware LED Matrix
            </h2>
            <span className="text-[11px] font-mono text-slate-400">
              ESP32 GPIO 26 / 25 / 27 Logic
            </span>
          </div>
        </div>
        <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-slate-100 border border-slate-200 text-[10px] font-mono text-slate-700 font-bold">
          <Zap className="w-3 h-3 text-sky-600" />
          <span>{isOnline ? 'HARDWARE SYNC' : 'OFFLINE'}</span>
        </div>
      </div>

      {/* LED Display Modules */}
      <div className="grid grid-cols-3 gap-3 sm:gap-4 mt-6">
        {/* GREEN LED */}
        <div
          className={`rounded-xl p-4 text-center transition-all duration-300 border ${
            isGreenActive
              ? 'bg-emerald-50 border-emerald-300 shadow-sm'
              : 'bg-slate-50 border-slate-200 opacity-60'
          }`}
        >
          {/* Hardware LED Bulb */}
          <div className="flex justify-center mb-3">
            <div className="w-13 h-13 rounded-full led-housing flex items-center justify-center p-1.5">
              <div
                className={`w-full h-full rounded-full led-bulb transition-all duration-300 ${
                  isGreenActive
                    ? 'bg-emerald-500 shadow-[0_0_18px_#10b981,0_0_30px_rgba(16,185,129,0.7)] animate-pulse'
                    : 'bg-emerald-900/30 border border-emerald-800/20 opacity-30'
                }`}
              />
            </div>
          </div>
          <div className="font-bold text-xs uppercase tracking-wider text-emerald-800">
            Green LED
          </div>
          <div className="text-[10px] font-mono text-slate-500 mt-0.5">GPIO 27</div>
          <div className="text-[10px] text-slate-500 mt-1 font-mono">&lt; 30.0°C Safe</div>
          <div
            className={`mt-2.5 text-[10px] font-bold py-0.5 px-2 rounded-full inline-block font-mono ${
              isGreenActive ? 'bg-emerald-600 text-white shadow-xs' : 'bg-slate-200 text-slate-500'
            }`}
          >
            {isGreenActive ? '3.3V HIGH' : '0.0V LOW'}
          </div>
        </div>

        {/* YELLOW LED */}
        <div
          className={`rounded-xl p-4 text-center transition-all duration-300 border ${
            isYellowActive
              ? 'bg-amber-50 border-amber-300 shadow-sm'
              : 'bg-slate-50 border-slate-200 opacity-60'
          }`}
        >
          {/* Hardware LED Bulb */}
          <div className="flex justify-center mb-3">
            <div className="w-13 h-13 rounded-full led-housing flex items-center justify-center p-1.5">
              <div
                className={`w-full h-full rounded-full led-bulb transition-all duration-300 ${
                  isYellowActive
                    ? 'bg-amber-400 shadow-[0_0_18px_#f59e0b,0_0_30px_rgba(245,158,11,0.7)] animate-pulse'
                    : 'bg-amber-900/30 border border-amber-800/20 opacity-30'
                }`}
              />
            </div>
          </div>
          <div className="font-bold text-xs uppercase tracking-wider text-amber-800">
            Yellow LED
          </div>
          <div className="text-[10px] font-mono text-slate-500 mt-0.5">GPIO 25</div>
          <div className="text-[10px] text-slate-500 mt-1 font-mono">30 - 35°C Warn</div>
          <div
            className={`mt-2.5 text-[10px] font-bold py-0.5 px-2 rounded-full inline-block font-mono ${
              isYellowActive ? 'bg-amber-500 text-white shadow-xs' : 'bg-slate-200 text-slate-500'
            }`}
          >
            {isYellowActive ? '3.3V HIGH' : '0.0V LOW'}
          </div>
        </div>

        {/* RED LED */}
        <div
          className={`rounded-xl p-4 text-center transition-all duration-300 border ${
            isRedActive
              ? 'bg-rose-50 border-rose-300 shadow-sm'
              : 'bg-slate-50 border-slate-200 opacity-60'
          }`}
        >
          {/* Hardware LED Bulb */}
          <div className="flex justify-center mb-3">
            <div className="w-13 h-13 rounded-full led-housing flex items-center justify-center p-1.5">
              <div
                className={`w-full h-full rounded-full led-bulb transition-all duration-300 ${
                  isRedActive
                    ? 'bg-rose-500 shadow-[0_0_20px_#f43f5e,0_0_35px_rgba(244,63,94,0.8)] animate-pulse'
                    : 'bg-rose-900/30 border border-rose-800/20 opacity-30'
                }`}
              />
            </div>
          </div>
          <div className="font-bold text-xs uppercase tracking-wider text-rose-800">
            Red LED
          </div>
          <div className="text-[10px] font-mono text-slate-500 mt-0.5">GPIO 26</div>
          <div className="text-[10px] text-slate-500 mt-1 font-mono">&ge; 35.0°C Alert</div>
          <div
            className={`mt-2.5 text-[10px] font-bold py-0.5 px-2 rounded-full inline-block font-mono ${
              isRedActive ? 'bg-rose-600 text-white shadow-xs' : 'bg-slate-200 text-slate-500'
            }`}
          >
            {isRedActive ? '3.3V HIGH' : '0.0V LOW'}
          </div>
        </div>
      </div>
    </div>
  );
}
