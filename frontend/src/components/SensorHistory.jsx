import React, { useState } from 'react';
import { Database, Filter, ChevronLeft, ChevronRight, Download } from 'lucide-react';

export default function SensorHistory({
  readings = [],
  total = 0,
  page = 1,
  limit = 10,
  onPageChange,
  statusFilter = 'ALL',
  onStatusFilterChange,
}) {
  const totalPages = Math.ceil(total / limit) || 1;

  const handleExportCSV = () => {
    if (!readings || readings.length === 0) return;
    const headers = ['ID', 'Device ID', 'Date', 'Time', 'Temperature (°C)', 'Humidity (%)', 'Status', 'Simulated'];
    const rows = readings.map((r) => {
      const d = new Date(r.recorded_at);
      return [
        r.id,
        r.device_id,
        d.toLocaleDateString(),
        d.toLocaleTimeString(),
        r.temperature,
        r.humidity,
        r.status,
        r.is_simulated ? 'YES' : 'NO',
      ];
    });

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `smart_car_telemetry_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="glass-panel rounded-2xl p-6 transition-all duration-300">
      {/* Header with Title and Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center space-x-2.5">
          <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 text-slate-300">
            <Database className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-white">
              Sensor Reading History
            </h2>
            <p className="text-xs text-slate-400">PostgreSQL stored sensor logs ({total} total records)</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Status Filter */}
          <div className="flex items-center space-x-1.5 bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-1 text-xs">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={statusFilter}
              onChange={(e) => onStatusFilterChange(e.target.value)}
              className="bg-transparent text-slate-200 outline-none cursor-pointer font-medium"
            >
              <option value="ALL" className="bg-slate-900">All Statuses</option>
              <option value="NORMAL" className="bg-slate-900">Normal (&lt;30°C)</option>
              <option value="WARNING" className="bg-slate-900">Warning (30-35°C)</option>
              <option value="HIGH" className="bg-slate-900">High (&ge;35°C)</option>
            </select>
          </div>

          {/* CSV Export */}
          <button
            onClick={handleExportCSV}
            title="Download CSV"
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-xs font-semibold text-slate-300 hover:text-white transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Telemetry Log Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-800/80">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-900/80 border-b border-slate-800 uppercase tracking-wider font-semibold text-slate-400">
            <tr>
              <th className="py-3 px-4">Date</th>
              <th className="py-3 px-4">Time</th>
              <th className="py-3 px-4">Temperature</th>
              <th className="py-3 px-4">Humidity</th>
              <th className="py-3 px-4">Warning Status</th>
              <th className="py-3 px-4 text-right">Source</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/50 font-mono">
            {readings.length === 0 ? (
              <tr>
                <td colSpan="6" className="py-8 text-center text-slate-500 font-sans text-xs">
                  No telemetry logged matching current criteria.
                </td>
              </tr>
            ) : (
              readings.map((reading) => {
                const dateObj = new Date(reading.recorded_at);
                const tempNum = parseFloat(reading.temperature);
                return (
                  <tr key={reading.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-2.5 px-4 text-slate-300">
                      {dateObj.toLocaleDateString()}
                    </td>
                    <td className="py-2.5 px-4 text-slate-400">
                      {dateObj.toLocaleTimeString()}
                    </td>
                    <td className="py-2.5 px-4 font-bold text-white">
                      <span
                        className={
                          tempNum >= 35
                            ? 'text-red-400'
                            : tempNum >= 30
                            ? 'text-amber-400'
                            : 'text-emerald-400'
                        }
                      >
                        {tempNum.toFixed(1)}°C
                      </span>
                    </td>
                    <td className="py-2.5 px-4 text-cyan-300 font-bold">
                      {parseFloat(reading.humidity).toFixed(1)}%
                    </td>
                    <td className="py-2.5 px-4 font-sans">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          reading.status === 'HIGH'
                            ? 'bg-red-500/20 text-red-300 border border-red-500/40'
                            : reading.status === 'WARNING'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                            : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        }`}
                      >
                        {reading.status}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 text-right font-sans">
                      {reading.is_simulated ? (
                        <span className="text-[10px] text-purple-400 font-medium bg-purple-500/10 px-1.5 py-0.5 rounded">
                          SIMULATOR
                        </span>
                      ) : (
                        <span className="text-[10px] text-cyan-400 font-medium bg-cyan-500/10 px-1.5 py-0.5 rounded">
                          ESP32 LIVE
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      <div className="flex items-center justify-between mt-4 text-xs text-slate-400 font-medium">
        <div>
          Showing page <span className="font-bold text-white">{page}</span> of{' '}
          <span className="font-bold text-white">{totalPages}</span>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1}
            className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            <ChevronLeft className="w-4 h-4 text-slate-300" />
          </button>
          <button
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages}
            className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            <ChevronRight className="w-4 h-4 text-slate-300" />
          </button>
        </div>
      </div>
    </div>
  );
}
