import React from 'react';
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
    const headers = ['ID', 'Device ID', 'Date', 'Time', 'Temperature (°C)', 'Humidity (%)', 'Status', 'Telemetry Channel'];
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
        r.is_simulated ? 'DIAGNOSTIC' : 'HARDWARE PROBE',
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
    <div className="glass-panel rounded-2xl p-6 transition-all duration-300 bg-white/95 border-slate-200 shadow-sm">
      {/* Header with Title and Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center space-x-2.5">
          <div className="p-2.5 rounded-xl bg-sky-50 border border-sky-200 text-sky-600 shadow-2xs">
            <Database className="w-5 h-5 text-sky-600" />
          </div>
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900">
              Telemetry Log Archive
            </h2>
            <p className="text-xs text-slate-500">PostgreSQL environmental telemetry records ({total} events)</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Status Filter */}
          <div className="flex items-center space-x-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1 text-xs text-slate-700">
            <Filter className="w-3.5 h-3.5 text-slate-500" />
            <select
              value={statusFilter}
              onChange={(e) => onStatusFilterChange(e.target.value)}
              className="bg-transparent text-slate-800 outline-none cursor-pointer font-semibold"
            >
              <option value="ALL">All Statuses</option>
              <option value="NORMAL">Normal (&lt;30°C)</option>
              <option value="WARNING">Caution (30-35°C)</option>
              <option value="HIGH">Alert (&ge;35°C)</option>
            </select>
          </div>

          {/* CSV Export */}
          <button
            onClick={handleExportCSV}
            title="Export Telemetry Log to CSV"
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs font-bold text-slate-700 hover:text-slate-900 transition-colors shadow-2xs"
          >
            <Download className="w-3.5 h-3.5 text-sky-600" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Telemetry Log Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-200">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 border-b border-slate-200 uppercase tracking-wider font-bold text-slate-600">
            <tr>
              <th className="py-3 px-4">Date</th>
              <th className="py-3 px-4">Time</th>
              <th className="py-3 px-4">Temperature</th>
              <th className="py-3 px-4">Humidity</th>
              <th className="py-3 px-4">Thermal Status</th>
              <th className="py-3 px-4 text-right">Channel</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-mono">
            {readings.length === 0 ? (
              <tr>
                <td colSpan="6" className="py-8 text-center text-slate-400 font-sans text-xs">
                  No telemetry logged matching current criteria.
                </td>
              </tr>
            ) : (
              readings.map((reading) => {
                const dateObj = new Date(reading.recorded_at);
                const tempNum = parseFloat(reading.temperature);
                return (
                  <tr key={reading.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-2.5 px-4 text-slate-700">
                      {dateObj.toLocaleDateString()}
                    </td>
                    <td className="py-2.5 px-4 text-slate-500">
                      {dateObj.toLocaleTimeString()}
                    </td>
                    <td className="py-2.5 px-4 font-bold">
                      <span
                        className={
                          tempNum >= 35
                            ? 'text-rose-600 font-extrabold'
                            : tempNum >= 30
                            ? 'text-amber-600 font-extrabold'
                            : 'text-emerald-700 font-extrabold'
                        }
                      >
                        {tempNum.toFixed(1)}°C
                      </span>
                    </td>
                    <td className="py-2.5 px-4 text-sky-700 font-bold">
                      {parseFloat(reading.humidity).toFixed(1)}%
                    </td>
                    <td className="py-2.5 px-4 font-sans">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                          reading.status === 'HIGH'
                            ? 'bg-rose-50 text-rose-700 border-rose-300'
                            : reading.status === 'WARNING'
                            ? 'bg-amber-50 text-amber-700 border-amber-300'
                            : 'bg-emerald-50 text-emerald-700 border-emerald-300'
                        }`}
                      >
                        {reading.status}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 text-right font-sans">
                      {reading.is_simulated ? (
                        <span className="text-[10px] text-sky-700 font-bold bg-sky-50 border border-sky-200 px-2 py-0.5 rounded">
                          DIAGNOSTIC
                        </span>
                      ) : (
                        <span className="text-[10px] text-teal-700 font-bold bg-teal-50 border border-teal-200 px-2 py-0.5 rounded">
                          ESP32 PROBE
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
      <div className="flex items-center justify-between mt-4 text-xs text-slate-500 font-medium">
        <div>
          Showing page <span className="font-bold text-slate-900">{page}</span> of{' '}
          <span className="font-bold text-slate-900">{totalPages}</span>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1}
            className="p-1.5 rounded-lg bg-slate-50 border border-slate-200 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-2xs"
          >
            <ChevronLeft className="w-4 h-4 text-slate-600" />
          </button>
          <button
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages}
            className="p-1.5 rounded-lg bg-slate-50 border border-slate-200 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-2xs"
          >
            <ChevronRight className="w-4 h-4 text-slate-600" />
          </button>
        </div>
      </div>
    </div>
  );
}
