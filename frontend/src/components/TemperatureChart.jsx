import React, { useState } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
} from 'recharts';
import { TrendingUp, Clock } from 'lucide-react';

export default function TemperatureChart({ data = [], currentRange = '1h', onRangeChange }) {
  const [activeRange, setActiveRange] = useState(currentRange);

  const handleRange = (range) => {
    setActiveRange(range);
    if (onRangeChange) onRangeChange(range);
  };

  // Format data for chart display
  const chartData = [...data]
    .reverse()
    .map((item) => {
      const date = new Date(item.recorded_at);
      const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      return {
        ...item,
        time: timeStr,
        temp: parseFloat(item.temperature),
      };
    });

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const dataPoint = payload[0].payload;
      return (
        <div className="bg-slate-900 border border-slate-700/80 p-3 rounded-xl shadow-2xl text-xs space-y-1">
          <div className="font-mono text-slate-400">{dataPoint.time}</div>
          <div className="text-sm font-bold text-white flex items-center space-x-1.5">
            <span>Temperature:</span>
            <span
              className={
                dataPoint.temp >= 35
                  ? 'text-red-400'
                  : dataPoint.temp >= 30
                  ? 'text-amber-400'
                  : 'text-emerald-400'
              }
            >
              {dataPoint.temp.toFixed(1)}°C
            </span>
          </div>
          <div className="text-[11px] text-slate-400">
            Status:{' '}
            <span className="font-semibold text-slate-200">{dataPoint.status}</span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="glass-panel rounded-2xl p-6 transition-all duration-300">
      {/* Chart Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div className="flex items-center space-x-2.5">
          <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 text-slate-300">
            <TrendingUp className="w-5 h-5 text-red-400" />
          </div>
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-white">
              Temperature History
            </h2>
            <p className="text-xs text-slate-400">Thermal progression & threshold levels</p>
          </div>
        </div>

        {/* Time Range Filter Buttons */}
        <div className="flex items-center space-x-1 bg-slate-900/90 border border-slate-800 p-1 rounded-xl self-start sm:self-auto text-xs font-medium">
          <Clock className="w-3.5 h-3.5 text-slate-400 ml-2 mr-1" />
          {['15m', '1h', '24h'].map((range) => (
            <button
              key={range}
              onClick={() => handleRange(range)}
              className={`px-3 py-1 rounded-lg transition-all ${
                activeRange === range
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {range === '15m' ? '15 Min' : range === '1h' ? '1 Hour' : '24 Hours'}
            </button>
          ))}
        </div>
      </div>

      {/* Recharts Area Chart */}
      <div className="h-64 w-full">
        {chartData.length === 0 ? (
          <div className="h-full flex items-center justify-center text-slate-500 text-xs">
            No temperature readings recorded in this range.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="tempGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.6} />
                  <stop offset="50%" stopColor="#f59e0b" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.6} />
              <XAxis dataKey="time" stroke="#64748b" tick={{ fontSize: 10 }} />
              <YAxis
                stroke="#64748b"
                tick={{ fontSize: 10 }}
                domain={[(dataMin) => Math.floor(dataMin - 2), (dataMax) => Math.ceil(dataMax + 2)]}
                unit="°C"
              />
              <Tooltip content={<CustomTooltip />} />
              {/* Threshold Reference Lines */}
              <ReferenceLine
                y={35}
                stroke="#ef4444"
                strokeDasharray="4 4"
                label={{ value: '35°C High', fill: '#ef4444', fontSize: 10, position: 'insideTopRight' }}
              />
              <ReferenceLine
                y={30}
                stroke="#f59e0b"
                strokeDasharray="4 4"
                label={{ value: '30°C Warning', fill: '#f59e0b', fontSize: 10, position: 'insideTopRight' }}
              />
              <Area
                type="monotone"
                dataKey="temp"
                stroke="#f59e0b"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#tempGradient)"
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
