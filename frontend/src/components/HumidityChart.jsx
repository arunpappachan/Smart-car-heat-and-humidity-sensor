import React from 'react';
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
import { Droplets } from 'lucide-react';

export default function HumidityChart({ data = [] }) {
  const chartData = [...data]
    .reverse()
    .map((item) => {
      const date = new Date(item.recorded_at);
      const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      return {
        ...item,
        time: timeStr,
        humidity: parseFloat(item.humidity),
      };
    });

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const dataPoint = payload[0].payload;
      return (
        <div className="bg-slate-900 border border-slate-700/80 p-3 rounded-xl shadow-2xl text-xs space-y-1">
          <div className="font-mono text-slate-400">{dataPoint.time}</div>
          <div className="text-sm font-bold text-cyan-300 flex items-center space-x-1.5">
            <span>Humidity:</span>
            <span>{dataPoint.humidity.toFixed(1)}%</span>
          </div>
          <div className="text-[11px] text-slate-400">
            Cabin status: {dataPoint.humidity >= 40 && dataPoint.humidity <= 60 ? 'Optimal' : 'Unbalanced'}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="glass-panel rounded-2xl p-6 transition-all duration-300">
      {/* Chart Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2.5">
          <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 text-slate-300">
            <Droplets className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-white">
              Humidity Trend
            </h2>
            <p className="text-xs text-slate-400">Cabin moisture level over time</p>
          </div>
        </div>
        <div className="text-xs text-slate-400 font-mono">
          Ideal: 40% – 60%
        </div>
      </div>

      {/* Recharts Area Chart */}
      <div className="h-64 w-full">
        {chartData.length === 0 ? (
          <div className="h-full flex items-center justify-center text-slate-500 text-xs">
            No humidity readings recorded yet.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="humGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.6} />
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.6} />
              <XAxis dataKey="time" stroke="#64748b" tick={{ fontSize: 10 }} />
              <YAxis
                stroke="#64748b"
                tick={{ fontSize: 10 }}
                domain={[20, 90]}
                unit="%"
              />
              <Tooltip content={<CustomTooltip />} />
              <ReferenceLine
                y={60}
                stroke="#0284c7"
                strokeDasharray="3 3"
                label={{ value: '60% Upper Comfort', fill: '#38bdf8', fontSize: 10, position: 'insideTopRight' }}
              />
              <ReferenceLine
                y={40}
                stroke="#0284c7"
                strokeDasharray="3 3"
                label={{ value: '40% Lower Comfort', fill: '#38bdf8', fontSize: 10, position: 'insideBottomRight' }}
              />
              <Area
                type="monotone"
                dataKey="humidity"
                stroke="#22d3ee"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#humGradient)"
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
