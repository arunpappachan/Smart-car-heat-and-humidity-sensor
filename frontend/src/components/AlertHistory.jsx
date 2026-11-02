import React from 'react';
import { AlertCircle, AlertOctagon, AlertTriangle, CheckCircle, BellRing } from 'lucide-react';

export default function AlertHistory({ alerts = [] }) {
  return (
    <div className="glass-panel rounded-2xl p-6 transition-all duration-300 bg-white/95 border-slate-200 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2.5">
          <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 shadow-2xs">
            <BellRing className="w-5 h-5 text-rose-600" />
          </div>
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900">
              Incident & Threshold Log
            </h2>
            <p className="text-xs text-slate-500">Automated cabin thermal transition history</p>
          </div>
        </div>
        <span className="text-xs px-2.5 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-700 font-mono font-bold">
          {alerts.length} Incidents
        </span>
      </div>

      {/* List of Alerts */}
      <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
        {alerts.length === 0 ? (
          <div className="text-center py-10 text-slate-400 text-xs flex flex-col items-center justify-center space-y-2">
            <CheckCircle className="w-8 h-8 text-emerald-500/50" />
            <span>No thermal warning incidents recorded. Cabin operating in nominal range.</span>
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
                    ? 'bg-rose-50/70 border-rose-200 shadow-2xs'
                    : isWarning
                    ? 'bg-amber-50/70 border-amber-200 shadow-2xs'
                    : 'bg-emerald-50/70 border-emerald-200 shadow-2xs'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center space-x-2">
                    {isHigh && <AlertOctagon className="w-4 h-4 text-rose-600 shrink-0" />}
                    {isWarning && <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />}
                    {!isHigh && !isWarning && <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />}

                    <span
                      className={`text-xs font-bold uppercase tracking-wider ${
                        isHigh ? 'text-rose-700' : isWarning ? 'text-amber-800' : 'text-emerald-800'
                      }`}
                    >
                      {alert.alert_type} THRESHOLD
                    </span>
                  </div>

                  <span className="text-[11px] font-mono text-slate-500">
                    {dateObj.toLocaleDateString()} {dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </span>
                </div>

                <p className="text-xs text-slate-700 mt-2 font-medium leading-relaxed">
                  {alert.message}
                </p>

                <div className="flex items-center space-x-4 mt-2.5 pt-2 border-t border-slate-200/60 text-[11px] font-mono text-slate-600">
                  <div>
                    Temp:{' '}
                    <span className="font-bold text-slate-900">{parseFloat(alert.temperature).toFixed(1)}°C</span>
                  </div>
                  <div>
                    Humidity:{' '}
                    <span className="font-bold text-sky-700">{parseFloat(alert.humidity).toFixed(1)}%</span>
                  </div>
                  <div>
                    Zone: <span className="font-bold text-slate-800">{alert.device_id}</span>
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
