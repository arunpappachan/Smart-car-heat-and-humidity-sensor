import React from 'react';
import { Droplets, Wind, Waves } from 'lucide-react';

export default function HumidityCard({
  humidity = 0,
  temperature = 25,
  isOnline = true,
  minHum = null,
  maxHum = null,
  avgHum = null,
}) {
  const humVal = typeof humidity === 'number' ? humidity : parseFloat(humidity) || 0;
  const tempVal = typeof temperature === 'number' ? temperature : parseFloat(temperature) || 25;

  // Calculate approximate Dew Point: Td = T - ((100 - RH) / 5)
  const dewPoint = (tempVal - (100 - humVal) / 5).toFixed(1);

  // Determine comfort category
  let comfortStatus = 'Optimal';
  let comfortColor = 'text-sky-700';
  let comfortBg = 'bg-sky-50 border-sky-300';

  if (!isOnline) {
    comfortStatus = 'Offline';
    comfortColor = 'text-slate-400';
    comfortBg = 'bg-slate-100 border-slate-200';
  } else if (humVal < 30) {
    comfortStatus = 'Dry Air';
    comfortColor = 'text-amber-700';
    comfortBg = 'bg-amber-50 border-amber-300';
  } else if (humVal > 70) {
    comfortStatus = 'High Humidity';
    comfortColor = 'text-blue-700';
    comfortBg = 'bg-blue-50 border-blue-300';
  }

  // Circular gauge calculations (SVG circumference)
  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (Math.min(Math.max(humVal, 0), 100) / 100) * circumference;

  return (
    <div className="glass-panel rounded-2xl p-6 transition-all duration-300 relative overflow-hidden bg-white/95 border-slate-200 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2.5">
          <div className="p-2.5 rounded-xl bg-sky-50 border border-sky-200 text-sky-600 shadow-2xs">
            <Droplets className="w-5 h-5 text-sky-600" />
          </div>
          <div>
            <h2 className="text-xs uppercase tracking-wider text-slate-500 font-bold">
              Cabin Humidity
            </h2>
            <span className="text-[11px] font-mono text-slate-400">Relative Humidity (%RH)</span>
          </div>
        </div>

        <div className={`px-3 py-1 rounded-full border text-xs font-bold ${comfortBg} ${comfortColor}`}>
          {comfortStatus}
        </div>
      </div>

      {/* Main Content: Radial Ring Gauge + Value */}
      <div className="my-3 flex items-center justify-between">
        {/* Left: Value & Description */}
        <div>
          <div className="flex items-baseline">
            <span className="text-5xl sm:text-6xl font-black font-heading tracking-tight text-slate-900">
              {isOnline ? humVal.toFixed(1) : '--.-'}
            </span>
            <span className="text-2xl sm:text-3xl font-bold ml-1.5 text-slate-400">%</span>
          </div>
          <div className="flex items-center space-x-1.5 text-xs text-slate-600 mt-2 font-medium">
            <Waves className="w-3.5 h-3.5 text-sky-600" />
            <span>Dew Point: <strong className="text-slate-800 font-mono">{isOnline ? `${dewPoint}°C` : '--'}</strong></span>
          </div>
          <div className="flex items-center space-x-1.5 text-[11px] text-slate-400 mt-1">
            <Wind className="w-3 h-3 text-sky-500" />
            <span>Optimal Range: 40% – 60% RH</span>
          </div>
        </div>

        {/* Right: Modern SVG Circular Ring Meter */}
        <div className="relative w-24 h-24 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 90 90">
            {/* Background ring */}
            <circle
              cx="45"
              cy="45"
              r={radius}
              className="text-slate-100"
              strokeWidth="7"
              stroke="currentColor"
              fill="transparent"
            />
            {/* Value fill ring */}
            <circle
              cx="45"
              cy="45"
              r={radius}
              className="text-sky-500 transition-all duration-700 ease-out"
              strokeWidth="7"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              stroke="currentColor"
              fill="transparent"
            />
          </svg>
          <div className="absolute flex flex-col items-center justify-center text-center">
            <Droplets className="w-4 h-4 text-sky-600 mb-0.5" />
            <span className="text-xs font-mono font-black text-slate-800">
              {isOnline ? `${Math.round(humVal)}%` : '--'}
            </span>
          </div>
        </div>
      </div>

      {/* Summary Footer */}
      <div className="grid grid-cols-3 gap-2 mt-5 pt-4 border-t border-slate-100 text-center">
        <div className="bg-slate-50 rounded-xl py-2 px-2 border border-slate-200">
          <div className="text-[10px] text-slate-500 uppercase font-bold">Min (24h)</div>
          <div className="text-xs font-mono font-bold text-slate-800 mt-0.5">
            {minHum != null ? `${parseFloat(minHum).toFixed(1)}%` : '--'}
          </div>
        </div>
        <div className="bg-slate-50 rounded-xl py-2 px-2 border border-slate-200">
          <div className="text-[10px] text-slate-500 uppercase font-bold">Avg (24h)</div>
          <div className="text-xs font-mono font-bold text-sky-700 mt-0.5">
            {avgHum != null ? `${parseFloat(avgHum).toFixed(1)}%` : '--'}
          </div>
        </div>
        <div className="bg-slate-50 rounded-xl py-2 px-2 border border-slate-200">
          <div className="text-[10px] text-slate-500 uppercase font-bold">Max (24h)</div>
          <div className="text-xs font-mono font-bold text-blue-700 mt-0.5">
            {maxHum != null ? `${parseFloat(maxHum).toFixed(1)}%` : '--'}
          </div>
        </div>
      </div>
    </div>
  );
}
