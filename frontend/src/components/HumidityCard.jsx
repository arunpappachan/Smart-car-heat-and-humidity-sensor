import React from 'react';
import { Droplets, Wind } from 'lucide-react';

export default function HumidityCard({
  humidity = 0,
  isOnline = true,
  minHum = null,
  maxHum = null,
  avgHum = null,
}) {
  const humVal = typeof humidity === 'number' ? humidity : parseFloat(humidity) || 0;

  // Determine comfort category
  let comfortStatus = 'Comfortable';
  let comfortColor = 'text-cyan-400';
  let comfortBg = 'bg-cyan-500/10 border-cyan-500/30';

  if (!isOnline) {
    comfortStatus = 'Offline';
    comfortColor = 'text-slate-500';
    comfortBg = 'bg-slate-900 border-slate-800';
  } else if (humVal < 30) {
    comfortStatus = 'Dry Air';
    comfortColor = 'text-amber-400';
    comfortBg = 'bg-amber-500/10 border-amber-500/30';
  } else if (humVal > 70) {
    comfortStatus = 'High Humidity';
    comfortColor = 'text-blue-400';
    comfortBg = 'bg-blue-500/10 border-blue-500/30';
  }

  // Circular gauge calculations (SVG circumference)
  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (Math.min(Math.max(humVal, 0), 100) / 100) * circumference;

  return (
    <div className="glass-panel rounded-2xl p-6 transition-all duration-300 relative overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2.5">
          <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 text-slate-300">
            <Droplets className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <h2 className="text-xs uppercase tracking-wider text-slate-400 font-semibold">
              Cabin Humidity
            </h2>
            <span className="text-[11px] text-slate-500">Relative Humidity (%RH)</span>
          </div>
        </div>

        <div className={`px-2.5 py-1 rounded-full border text-xs font-semibold ${comfortBg} ${comfortColor}`}>
          {comfortStatus}
        </div>
      </div>

      {/* Main Content: Radial Ring Gauge + Value */}
      <div className="my-3 flex items-center justify-between">
        {/* Left: Value & Description */}
        <div>
          <div className="flex items-baseline">
            <span className="text-5xl sm:text-6xl font-black font-heading tracking-tight text-cyan-300">
              {isOnline ? humVal.toFixed(1) : '--.-'}
            </span>
            <span className="text-2xl sm:text-3xl font-bold ml-1.5 text-slate-400">%</span>
          </div>
          <div className="flex items-center space-x-1.5 text-xs text-slate-400 mt-2">
            <Wind className="w-3.5 h-3.5 text-cyan-400" />
            <span>Optimal Cabin Range: 40% – 60%</span>
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
              className="text-slate-800"
              strokeWidth="7"
              stroke="currentColor"
              fill="transparent"
            />
            {/* Value fill ring */}
            <circle
              cx="45"
              cy="45"
              r={radius}
              className="text-cyan-400 transition-all duration-700 ease-out"
              strokeWidth="7"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              stroke="currentColor"
              fill="transparent"
            />
          </svg>
          <div className="absolute flex flex-col items-center justify-center text-center">
            <Droplets className="w-4 h-4 text-cyan-400 mb-0.5" />
            <span className="text-[10px] font-mono font-bold text-slate-300">
              {isOnline ? `${Math.round(humVal)}%` : '--'}
            </span>
          </div>
        </div>
      </div>

      {/* Summary Footer */}
      <div className="grid grid-cols-3 gap-2 mt-5 pt-4 border-t border-slate-800/80 text-center">
        <div className="bg-slate-900/50 rounded-lg py-1.5 px-2">
          <div className="text-[10px] text-slate-500 uppercase font-semibold">Min (24h)</div>
          <div className="text-xs font-mono font-bold text-slate-300">
            {minHum != null ? `${parseFloat(minHum).toFixed(1)}%` : '--'}
          </div>
        </div>
        <div className="bg-slate-900/50 rounded-lg py-1.5 px-2">
          <div className="text-[10px] text-slate-500 uppercase font-semibold">Avg (24h)</div>
          <div className="text-xs font-mono font-bold text-cyan-300">
            {avgHum != null ? `${parseFloat(avgHum).toFixed(1)}%` : '--'}
          </div>
        </div>
        <div className="bg-slate-900/50 rounded-lg py-1.5 px-2">
          <div className="text-[10px] text-slate-500 uppercase font-semibold">Max (24h)</div>
          <div className="text-xs font-mono font-bold text-blue-400">
            {maxHum != null ? `${parseFloat(maxHum).toFixed(1)}%` : '--'}
          </div>
        </div>
      </div>
    </div>
  );
}
