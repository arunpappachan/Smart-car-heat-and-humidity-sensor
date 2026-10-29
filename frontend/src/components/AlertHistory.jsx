import React from 'react';
import { AlertCircle, AlertOctagon, AlertTriangle, CheckCircle } from 'lucide-react';

export default function AlertHistory({ alerts = [] }) {
  return (
    <div className="glass-panel rounded-2xl p-6 transition-all duration-300">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2.5">
          <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 text-slate-300">
            <AlertCircle className="w-5 h-5 text-red-400" />
          </div>
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-white">
              Warning & Alert History
            </h2>
            <p className="text-xs text-slate-400">Chronological log of threshold transitions</p>
          </div>
        </div>
        <span className="text-xs px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-slate-300 font-semibold">
          {alerts.length} Events Logged
        </span>
      </div>

      {/* List of Alerts */}
      <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
        {alerts.length === 0 ? (
          <div className="text-center py-8 text-slate-500 text-xs">
            No temperature warning incidents recorded. Cabin operating normally.
          </div>
        ) : (
          alerts.map((alert) => {
            const dateObj = new Date(alert.created_at);
            const isHigh = alert.alert_type === 'HIGH';
            const isWarning = alert.alert_type === 'WARNING';

            return (
              <div
                key={alert.id}
                className={`p-3.5 rounded-xl border transition-all ${
                  isHigh
                    ? 'bg-red-950/20 border-red-500/40'
                    : isWarning
                    ? 'bg-amber-950/20 border-amber-500/30'
                    : 'bg-emerald-950/20 border-emerald-500/30'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center space-x-2">
                    {isHigh && <AlertOctagon className="w-4 h-4 text-red-400 shrink-0" />}
                    {isWarning && <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />}
                    {!isHigh && !isWarning && <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />}

                    <span
                      className={`text-xs font-bold uppercase tracking-wider ${
                        isHigh ? 'text-red-400' : isWarning ? 'text-amber-300' : 'text-emerald-400'
                      }`}
                    >
                      {alert.alert_type} ALERT
                    </span>
                  </div>

                  <span className="text-[11px] font-mono text-slate-400">
                    {dateObj.toLocaleDateString()} {dateObj.toLocaleTimeString()}
                  </span>
                </div>

                <p className="text-xs text-slate-300 mt-2 font-medium leading-relaxed">
                  {alert.message}
                </p>

                <div className="flex items-center space-x-4 mt-2.5 pt-2 border-t border-slate-800/60 text-[11px] font-mono text-slate-400">
                  <div>
                    Temp:{' '}
                    <span className="font-bold text-white">{parseFloat(alert.temperature).toFixed(1)}°C</span>
                  </div>
                  <div>
                    Humidity:{' '}
                    <span className="font-bold text-cyan-300">{parseFloat(alert.humidity).toFixed(1)}%</span>
                  </div>
                  <div>
                    Device: <span className="font-bold text-slate-200">{alert.device_id}</span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
