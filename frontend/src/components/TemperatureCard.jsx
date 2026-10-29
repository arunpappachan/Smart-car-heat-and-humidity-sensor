import React from 'react';
import { Thermometer, Flame, AlertTriangle, CheckCircle2 } from 'lucide-react';

export default function TemperatureCard({
  temperature = 0,
  status = 'NORMAL',
  isOnline = true,
  minTemp = null,
  maxTemp = null,
  avgTemp = null,
}) {
  const tempVal = typeof temperature === 'number' ? temperature : parseFloat(temperature) || 0;

  // Colors & theme according to status
  let themeColor = 'emerald';
  let badgeText = 'Normal';
  let icon = <CheckCircle2 className="w-5 h-5 text-emerald-400" />;
  let glowClass = 'shadow-glow-green/20';

  if (!isOnline) {
    themeColor = 'slate';
    badgeText = 'Offline';
    icon = <Thermometer className="w-5 h-5 text-slate-500" />;
    glowClass = '';
  } else if (status === 'HIGH' || tempVal >= 35.0) {
    themeColor = 'red';
    badgeText = 'High Alert';
    icon = <Flame className="w-5 h-5 text-red-400 animate-pulse" />;
    glowClass = 'shadow-glow-red/40 border-red-500/40';
  } else if (status === 'WARNING' || tempVal >= 30.0) {
    themeColor = 'amber';
    badgeText = 'Warning';
    icon = <AlertTriangle className="w-5 h-5 text-amber-400" />;
    glowClass = 'shadow-glow-yellow/30 border-amber-500/40';
  }

  // Calculate percentage along 15°C - 50°C range for gauge
  const minRange = 15;
  const maxRange = 50;
  const gaugePercent = Math.min(Math.max(((tempVal - minRange) / (maxRange - minRange)) * 100, 0), 100);

  return (
    <div className={`glass-panel rounded-2xl p-6 transition-all duration-300 relative overflow-hidden ${glowClass}`}>
      {/* Background radial glow */}
      {status === 'HIGH' && isOnline && (
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />
      )}

      {/* Card Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2.5">
          <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 text-slate-300">
            <Thermometer className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <h2 className="text-xs uppercase tracking-wider text-slate-400 font-semibold">
              Cabin Temperature
            </h2>
            <span className="text-[11px] text-slate-500">Sensor: DHT22 (GPIO 4)</span>
          </div>
        </div>

        <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-slate-900/80 border border-slate-700/60 text-xs font-semibold">
          {icon}
          <span
            className={
              themeColor === 'red'
                ? 'text-red-400'
                : themeColor === 'amber'
                ? 'text-amber-400'
                : themeColor === 'emerald'
                ? 'text-emerald-400'
                : 'text-slate-400'
            }
          >
            {badgeText}
          </span>
        </div>
      </div>

      {/* Prominent Temperature Readout */}
      <div className="my-5 flex items-baseline justify-between">
        <div className="flex items-baseline">
          <span
            className={`text-5xl sm:text-6xl font-black font-heading tracking-tight transition-colors ${
              !isOnline
                ? 'text-slate-500'
                : themeColor === 'red'
                ? 'text-red-400'
                : themeColor === 'amber'
                ? 'text-amber-300'
                : 'text-emerald-300'
            }`}
          >
            {isOnline ? tempVal.toFixed(1) : '--.-'}
          </span>
          <span className="text-2xl sm:text-3xl font-bold ml-1.5 text-slate-400">°C</span>
        </div>

        <div className="text-right">
          <div className="text-xs text-slate-400 font-mono">
            {isOnline ? ((tempVal * 9) / 5 + 32).toFixed(1) : '--.-'} °F
          </div>
          <div className="text-[10px] text-slate-500 uppercase tracking-wider mt-0.5">
            Fahrenheit Eq.
          </div>
        </div>
      </div>

      {/* 3-Level Temperature Gauge Bar */}
      <div className="space-y-2 mt-4">
        <div className="flex justify-between text-[11px] font-medium text-slate-400">
          <span>15°C</span>
          <span className="text-emerald-400 font-semibold">Normal &lt; 30°C</span>
          <span className="text-amber-400 font-semibold">Caution 30-35°C</span>
          <span className="text-red-400 font-semibold">High &ge; 35°C</span>
          <span>50°C</span>
        </div>

        {/* Gauge Track */}
        <div className="h-3 w-full bg-slate-900 rounded-full overflow-hidden p-0.5 border border-slate-800 relative">
          {/* Color zones background */}
          <div className="absolute inset-0 flex rounded-full opacity-30">
            <div className="h-full bg-emerald-500" style={{ width: '42.8%' }} />
            <div className="h-full bg-amber-500" style={{ width: '14.3%' }} />
            <div className="h-full bg-red-500 flex-1" />
          </div>

          {/* Value pointer indicator */}
          <div
            className={`h-full rounded-full transition-all duration-700 ease-out relative z-10 ${
              themeColor === 'red'
                ? 'bg-gradient-to-r from-amber-500 to-red-500 shadow-glow-red'
                : themeColor === 'amber'
                ? 'bg-gradient-to-r from-emerald-500 to-amber-500 shadow-glow-yellow'
                : 'bg-emerald-400 shadow-glow-green'
            }`}
            style={{ width: `${gaugePercent}%` }}
          />
        </div>
      </div>

      {/* Summary Footer: Min, Avg, Max */}
      <div className="grid grid-cols-3 gap-2 mt-5 pt-4 border-t border-slate-800/80 text-center">
        <div className="bg-slate-900/50 rounded-lg py-1.5 px-2">
          <div className="text-[10px] text-slate-500 uppercase font-semibold">Min (24h)</div>
          <div className="text-xs font-mono font-bold text-slate-300">
            {minTemp != null ? `${parseFloat(minTemp).toFixed(1)}°C` : '--'}
          </div>
        </div>
        <div className="bg-slate-900/50 rounded-lg py-1.5 px-2">
          <div className="text-[10px] text-slate-500 uppercase font-semibold">Avg (24h)</div>
          <div className="text-xs font-mono font-bold text-cyan-300">
            {avgTemp != null ? `${parseFloat(avgTemp).toFixed(1)}°C` : '--'}
          </div>
        </div>
        <div className="bg-slate-900/50 rounded-lg py-1.5 px-2">
          <div className="text-[10px] text-slate-500 uppercase font-semibold">Max (24h)</div>
          <div className="text-xs font-mono font-bold text-red-400">
            {maxTemp != null ? `${parseFloat(maxTemp).toFixed(1)}°C` : '--'}
          </div>
        </div>
      </div>
    </div>
  );
}
