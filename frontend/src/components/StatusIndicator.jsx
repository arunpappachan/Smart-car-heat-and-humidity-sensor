import React from 'react';
import { AlertOctagon, AlertTriangle, ShieldCheck, WifiOff, Wind, Info } from 'lucide-react';

export default function StatusIndicator({
  status = 'NORMAL',
  temperature = 0,
  isOnline = true,
}) {
  const tempVal = typeof temperature === 'number' ? temperature : parseFloat(temperature) || 0;

  // Determine effective display state
  let effectiveState = status;
  if (!isOnline) {
    effectiveState = 'SENSOR OFFLINE';
  } else if (tempVal >= 35.0 || status === 'HIGH') {
    effectiveState = 'HIGH TEMPERATURE';
  } else if (tempVal >= 30.0 || status === 'WARNING') {
    effectiveState = 'WARNING';
  } else {
    effectiveState = 'NORMAL';
  }

  return (
    <div className="space-y-4">
      {/* Primary Safety Status Banner */}
      <div
        className={`glass-panel rounded-2xl p-5 border transition-all duration-300 ${
          effectiveState === 'HIGH TEMPERATURE'
            ? 'bg-red-950/40 border-red-500/50 shadow-glow-red/30'
            : effectiveState === 'WARNING'
            ? 'bg-amber-950/30 border-amber-500/40 shadow-glow-yellow/20'
            : effectiveState === 'NORMAL'
            ? 'bg-emerald-950/20 border-emerald-500/40 shadow-glow-green/10'
            : 'bg-slate-900/60 border-slate-700/60'
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3 sm:space-x-4">
            <div
              className={`w-12 h-12 rounded-xl flex items-center justify-center border shadow-lg ${
                effectiveState === 'HIGH TEMPERATURE'
                  ? 'bg-red-500/20 border-red-500/50 text-red-400 animate-pulse'
                  : effectiveState === 'WARNING'
                  ? 'bg-amber-500/20 border-amber-500/50 text-amber-400'
                  : effectiveState === 'NORMAL'
                  ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400'
                  : 'bg-slate-800 border-slate-700 text-slate-500'
              }`}
            >
              {effectiveState === 'HIGH TEMPERATURE' && <AlertOctagon className="w-7 h-7" />}
              {effectiveState === 'WARNING' && <AlertTriangle className="w-7 h-7" />}
              {effectiveState === 'NORMAL' && <ShieldCheck className="w-7 h-7" />}
              {effectiveState === 'SENSOR OFFLINE' && <WifiOff className="w-7 h-7" />}
            </div>

            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Cabin Environmental Condition
              </div>
              <h2
                className={`text-xl sm:text-2xl font-black font-heading tracking-wide ${
                  effectiveState === 'HIGH TEMPERATURE'
                    ? 'text-red-400'
                    : effectiveState === 'WARNING'
                    ? 'text-amber-300'
                    : effectiveState === 'NORMAL'
                    ? 'text-emerald-300'
                    : 'text-slate-400'
                }`}
              >
                {effectiveState === 'HIGH TEMPERATURE'
                  ? 'HIGH CABIN TEMPERATURE DETECTED'
                  : effectiveState === 'WARNING'
                  ? 'ELEVATED CABIN TEMPERATURE (WARNING)'
                  : effectiveState === 'NORMAL'
                  ? 'CABIN CONDITIONS NORMAL'
                  : 'SENSOR TELEMETRY OFFLINE'}
              </h2>
            </div>
          </div>

          {/* Status Badge */}
          <div className="self-start sm:self-auto">
            <span
              className={`px-3.5 py-1.5 rounded-full text-xs font-extrabold uppercase tracking-widest border ${
                effectiveState === 'HIGH TEMPERATURE'
                  ? 'bg-red-500/20 text-red-300 border-red-500/40 animate-pulse'
                  : effectiveState === 'WARNING'
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                  : effectiveState === 'NORMAL'
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                  : 'bg-slate-800 text-slate-400 border-slate-700'
              }`}
            >
              {effectiveState}
            </span>
          </div>
        </div>

        {/* Action Recommendation when High Temperature is Detected */}
        {effectiveState === 'HIGH TEMPERATURE' && (
          <div className="mt-4 p-3.5 rounded-xl bg-red-900/30 border border-red-500/30 flex items-start space-x-3 text-red-200">
            <Wind className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <div>
              <div className="text-xs font-bold uppercase tracking-wide text-red-300">
                Urgent Driver Action Required
              </div>
              <p className="text-sm font-semibold mt-0.5">
                Ventilate the vehicle and use the air conditioner to cool the cabin.
              </p>
            </div>
          </div>
        )}

        {/* Advisory for Warning Stage */}
        {effectiveState === 'WARNING' && (
          <div className="mt-4 p-3 rounded-xl bg-amber-900/20 border border-amber-500/30 flex items-start space-x-3 text-amber-200">
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <p className="text-xs leading-relaxed">
              Caution: Vehicle interior is accumulating heat from solar exposure. Lower windows or activate pre-cooling before passenger boarding.
            </p>
          </div>
        )}

        {/* Offline Warning Notice */}
        {effectiveState === 'SENSOR OFFLINE' && (
          <div className="mt-4 p-3 rounded-xl bg-slate-900/70 border border-slate-700 flex items-start space-x-3 text-slate-400">
            <WifiOff className="w-5 h-5 text-slate-500 shrink-0 mt-0.5" />
            <p className="text-xs leading-relaxed">
              ESP32 telemetry has timed out. Telemetry will resume automatically as soon as the microcontroller re-establishes Wi-Fi or backend connectivity.
            </p>
          </div>
        )}
      </div>

      {/* Safety & Academic Disclaimer */}
      <div className="px-4 py-2.5 rounded-xl bg-slate-900/50 border border-slate-800 flex items-center space-x-2 text-[11px] text-slate-400">
        <Info className="w-4 h-4 text-cyan-400 shrink-0" />
        <p>
          <strong>Educational Prototype Notice:</strong> This project is an academic IoT monitoring demonstrator. It does not replace automotive safety regulations and does not claim medical certification for cabin safety.
        </p>
      </div>
    </div>
  );
}
