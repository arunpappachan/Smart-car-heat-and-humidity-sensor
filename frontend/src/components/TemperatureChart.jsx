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
        <div className="bg-white border border-slate-200 p-3 rounded-xl shadow-lg text-xs space-y-1">
          <div className="font-mono text-slate-500">{dataPoint.time}</div>
          <div className="text-sm font-bold text-slate-900 flex items-center space-x-1.5">
            <span>Temperature:</span>
            <span
              className={
                dataPoint.temp >= 35
                  ? 'text-rose-600 font-extrabold'
                  : dataPoint.temp >= 30
                  ? 'text-amber-600 font-extrabold'
                  : 'text-emerald-600 font-extrabold'
              }
            >
              {dataPoint.temp.toFixed(1)}°C
            </span>
          </div>
          <div className="text-[11px] text-slate-500">
            Status:{' '}
            <span className="font-bold text-slate-800">{dataPoint.status}</span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="glass-panel rounded-2xl p-6 transition-all duration-300 bg-white/95 border-slate-200 shadow-sm">
      {/* Chart Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div className="flex items-center space-x-2.5">
          <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 shadow-2xs">
            <TrendingUp className="w-5 h-5 text-rose-600" />
          </div>
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900">
              Temperature History
            </h2>
            <p className="text-xs text-slate-500">Thermal progression & threshold levels</p>
          </div>
        </div>

        {/* Time Range Filter Buttons */}
        <div className="flex items-center space-x-1 bg-slate-100 border border-slate-200 p-1 rounded-xl self-start sm:self-auto text-xs font-semibold">
          <Clock className="w-3.5 h-3.5 text-slate-500 ml-2 mr-1" />
          {['15m', '1h', '24h'].map((range) => (
            <button
              key={range}
              onClick={() => handleRange(range)}
              className={`px-3 py-1 rounded-lg transition-all ${
                activeRange === range
                  ? 'bg-sky-600 text-white font-bold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
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
          <div className="h-full flex items-center justify-center text-slate-400 text-xs">
            No temperature readings recorded in this range.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="tempGradientLight" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.4} />
                  <stop offset="50%" stopColor="#f59e0b" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.8} />
              <XAxis dataKey="time" stroke="#64748b" tick={{ fontSize: 10, fill: '#64748b' }} />
              <YAxis
                stroke="#64748b"
                tick={{ fontSize: 10, fill: '#64748b' }}
                domain={[(dataMin) => Math.floor(dataMin - 2), (dataMax) => Math.ceil(dataMax + 2)]}
                unit="°C"
              />
              <Tooltip content={<CustomTooltip />} />
              {/* Threshold Reference Lines */}
              <ReferenceLine
                y={35}
                stroke="#e11d48"
                strokeDasharray="4 4"
                label={{ value: '35°C Alert', fill: '#e11d48', fontSize: 10, position: 'insideTopRight' }}
              />
              <ReferenceLine
                y={30}
                stroke="#d97706"
                strokeDasharray="4 4"
                label={{ value: '30°C Warning', fill: '#d97706', fontSize: 10, position: 'insideTopRight' }}
              />
              <Area
                type="monotone"
                dataKey="temp"
                stroke="#f59e0b"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#tempGradientLight)"
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
