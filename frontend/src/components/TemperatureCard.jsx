import React, { useState } from 'react';
import { Thermometer, Flame, AlertTriangle, CheckCircle2 } from 'lucide-react';

export default function TemperatureCard({
  temperature = 0,
  status = 'NORMAL',
  isOnline = true,
  minTemp = null,
  maxTemp = null,
  avgTemp = null,
}) {
  const [unit, setUnit] = useState('C'); // 'C' or 'F'
  const tempVal = typeof temperature === 'number' ? temperature : parseFloat(temperature) || 0;

  // Colors & theme according to status
  let themeColor = 'emerald';
  let badgeText = 'Normal';
  let icon = <CheckCircle2 className="w-4 h-4 text-emerald-600" />;
  let badgeClass = 'bg-emerald-50 text-emerald-700 border-emerald-300';

  if (!isOnline) {
    themeColor = 'slate';
    badgeText = 'Offline';
    icon = <Thermometer className="w-4 h-4 text-slate-400" />;
    badgeClass = 'bg-slate-100 text-slate-600 border-slate-200';
  } else if (status === 'HIGH' || tempVal >= 35.0) {
    themeColor = 'red';
    badgeText = 'Critical Overheat';
    icon = <Flame className="w-4 h-4 text-rose-600 animate-pulse" />;
    badgeClass = 'bg-rose-50 text-rose-700 border-rose-300';
  } else if (status === 'WARNING' || tempVal >= 30.0) {
    themeColor = 'amber';
    badgeText = 'Elevated Heat';
    icon = <AlertTriangle className="w-4 h-4 text-amber-600" />;
    badgeClass = 'bg-amber-50 text-amber-700 border-amber-300';
  }

  // Calculate percentage along 15°C - 50°C range for gauge
  const minRange = 15;
  const maxRange = 50;
  const gaugePercent = Math.min(Math.max(((tempVal - minRange) / (maxRange - minRange)) * 100, 0), 100);

  // Conversion helper
  const displayTemp = (valInC) => {
    if (valInC == null) return '--';
    const c = typeof valInC === 'number' ? valInC : parseFloat(valInC);
    if (isNaN(c)) return '--';
    if (unit === 'F') {
      return ((c * 9) / 5 + 32).toFixed(1);
    }
    return c.toFixed(1);
  };

  return (
    <div className="glass-panel rounded-2xl p-6 transition-all duration-300 relative overflow-hidden bg-white/95 border-slate-200 shadow-sm">
      {/* Card Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2.5">
          <div className="p-2.5 rounded-xl bg-sky-50 border border-sky-200 text-sky-600 shadow-2xs">
            <Thermometer className="w-5 h-5 text-sky-600" />
          </div>
          <div>
            <h2 className="text-xs uppercase tracking-wider text-slate-500 font-bold">
              Cabin Temperature
            </h2>
            <span className="text-[11px] font-mono text-slate-400">DHT22 Probe • Pin GPIO 4</span>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {/* Unit Toggle */}
          <div className="bg-slate-100 border border-slate-200 rounded-lg p-0.5 flex text-[10px] font-bold">
            <button
              onClick={() => setUnit('C')}
              className={`px-2 py-0.5 rounded transition-all ${
                unit === 'C' ? 'bg-white text-sky-700 shadow-xs font-black' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              °C
            </button>
            <button
              onClick={() => setUnit('F')}
              className={`px-2 py-0.5 rounded transition-all ${
                unit === 'F' ? 'bg-white text-sky-700 shadow-xs font-black' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              °F
            </button>
          </div>

          {/* Status Badge */}
          <div className={`flex items-center space-x-1.5 px-3 py-1 rounded-full border text-xs font-bold ${badgeClass}`}>
            {icon}
            <span>{badgeText}</span>
          </div>
        </div>
      </div>

      {/* Prominent Temperature Readout */}
      <div className="my-5 flex items-baseline justify-between">
        <div className="flex items-baseline">
          <span
            className={`text-5xl sm:text-6xl font-black font-heading tracking-tight transition-colors ${
              !isOnline
                ? 'text-slate-400'
                : themeColor === 'red'
                ? 'text-rose-600'
                : themeColor === 'amber'
                ? 'text-amber-600'
                : 'text-slate-900'
            }`}
          >
            {isOnline ? displayTemp(tempVal) : '--.-'}
          </span>
          <span className="text-2xl sm:text-3xl font-bold ml-1.5 text-slate-400">°{unit}</span>
        </div>

        <div className="text-right">
          <div className="text-xs text-slate-600 font-mono font-bold">
            {isOnline
              ? unit === 'C'
                ? `${((tempVal * 9) / 5 + 32).toFixed(1)} °F`
                : `${tempVal.toFixed(1)} °C`
              : '--.-'}
          </div>
          <div className="text-[10px] text-slate-400 uppercase tracking-wider mt-0.5">
            {unit === 'C' ? 'Fahrenheit' : 'Celsius'} Eq.
          </div>
        </div>
      </div>

      {/* 3-Level Speedometer-Style Temperature Gauge */}
      <div className="space-y-2 mt-4">
        <div className="flex justify-between text-[11px] font-semibold text-slate-500">
          <span>15°C</span>
          <span className="text-emerald-600">&lt; 30°C Safe</span>
          <span className="text-amber-600">30-35°C Caution</span>
          <span className="text-rose-600">&ge; 35°C Alert</span>
          <span>50°C</span>
        </div>

        {/* Gauge Track */}
        <div className="h-3.5 w-full bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200 relative">
          {/* Color zones background */}
          <div className="absolute inset-0 flex rounded-full opacity-35">
            <div className="h-full bg-emerald-400" style={{ width: '42.8%' }} />
            <div className="h-full bg-amber-400" style={{ width: '14.3%' }} />
            <div className="h-full bg-rose-400 flex-1" />
          </div>

          {/* Value pointer indicator */}
          <div
            className={`h-full rounded-full transition-all duration-700 ease-out relative z-10 ${
              themeColor === 'red'
                ? 'bg-gradient-to-r from-amber-500 via-orange-500 to-rose-600 shadow-sm'
                : themeColor === 'amber'
                ? 'bg-gradient-to-r from-emerald-500 to-amber-500 shadow-sm'
                : 'bg-emerald-500 shadow-sm'
            }`}
            style={{ width: `${gaugePercent}%` }}
          />
        </div>
      </div>

      {/* Summary Footer: Min, Avg, Max (24h) */}
      <div className="grid grid-cols-3 gap-2 mt-5 pt-4 border-t border-slate-100 text-center">
        <div className="bg-slate-50 rounded-xl py-2 px-2 border border-slate-200">
          <div className="text-[10px] text-slate-500 uppercase font-bold">Min (24h)</div>
          <div className="text-xs font-mono font-bold text-slate-800 mt-0.5">
            {minTemp != null ? `${displayTemp(minTemp)}°${unit}` : '--'}
          </div>
        </div>
        <div className="bg-slate-50 rounded-xl py-2 px-2 border border-slate-200">
          <div className="text-[10px] text-slate-500 uppercase font-bold">Avg (24h)</div>
          <div className="text-xs font-mono font-bold text-sky-700 mt-0.5">
            {avgTemp != null ? `${displayTemp(avgTemp)}°${unit}` : '--'}
          </div>
        </div>
        <div className="bg-slate-50 rounded-xl py-2 px-2 border border-slate-200">
          <div className="text-[10px] text-slate-500 uppercase font-bold">Max (24h)</div>
          <div className="text-xs font-mono font-bold text-rose-600 mt-0.5">
            {maxTemp != null ? `${displayTemp(maxTemp)}°${unit}` : '--'}
          </div>
        </div>
      </div>
    </div>
  );
}
