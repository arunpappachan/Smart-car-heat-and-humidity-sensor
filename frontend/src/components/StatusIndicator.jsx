import React from 'react';
import { AlertOctagon, AlertTriangle, ShieldCheck, WifiOff, Wind, ShieldAlert, SunMedium, CheckCircle2 } from 'lucide-react';

export default function StatusIndicator({
  status = 'NORMAL',
  temperature = 0,
  humidity = 0,
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
        className={`glass-panel rounded-2xl p-5 border transition-all duration-300 relative overflow-hidden ${
          effectiveState === 'HIGH TEMPERATURE'
            ? 'bg-red-950/40 border-red-500/60 shadow-glow-red/40'
            : effectiveState === 'WARNING'
            ? 'bg-amber-950/30 border-amber-500/50 shadow-glow-yellow/30'
            : effectiveState === 'NORMAL'
            ? 'bg-emerald-950/20 border-emerald-500/40 shadow-glow-green/20'
            : 'bg-slate-900/60 border-slate-700/60'
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3.5 sm:space-x-4">
            <div
              className={`w-13 h-13 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center border shadow-xl transition-all ${
                effectiveState === 'HIGH TEMPERATURE'
                  ? 'bg-red-500/20 border-red-500/60 text-red-400 animate-pulse shadow-[0_0_25px_rgba(239,68,68,0.5)]'
                  : effectiveState === 'WARNING'
                  ? 'bg-amber-500/20 border-amber-500/50 text-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.4)]'
                  : effectiveState === 'NORMAL'
                  ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.3)]'
                  : 'bg-slate-800 border-slate-700 text-slate-500'
              }`}
            >
              {effectiveState === 'HIGH TEMPERATURE' && <AlertOctagon className="w-8 h-8" />}
              {effectiveState === 'WARNING' && <AlertTriangle className="w-8 h-8" />}
              {effectiveState === 'NORMAL' && <ShieldCheck className="w-8 h-8" />}
              {effectiveState === 'SENSOR OFFLINE' && <WifiOff className="w-8 h-8" />}
            </div>

            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Vehicle Cabin Safety Status
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-slate-600" />
                <span className="text-[11px] font-mono text-cyan-400 font-semibold">
                  {effectiveState === 'NORMAL' ? 'NOMINAL' : effectiveState}
                </span>
              </div>
              <h2
                className={`text-xl sm:text-2xl font-black font-heading tracking-wide mt-0.5 ${
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
                  ? 'CRITICAL CABIN HEAT DETECTED'
                  : effectiveState === 'WARNING'
                  ? 'ELEVATED CABIN TEMPERATURE (WARNING)'
                  : effectiveState === 'NORMAL'
                  ? 'CABIN CLIMATE OPTIMAL & SECURE'
                  : 'SENSOR TELEMETRY OFFLINE'}
              </h2>
            </div>
          </div>

          {/* Status Badge */}
          <div className="self-start sm:self-auto flex items-center space-x-2">
            <span
              className={`px-4 py-1.5 rounded-full text-xs font-extrabold uppercase tracking-widest border transition-all ${
                effectiveState === 'HIGH TEMPERATURE'
                  ? 'bg-red-500/25 text-red-200 border-red-500/60 animate-pulse shadow-glow-red'
                  : effectiveState === 'WARNING'
                  ? 'bg-amber-500/25 text-amber-200 border-amber-500/50 shadow-glow-yellow'
                  : effectiveState === 'NORMAL'
                  ? 'bg-emerald-500/20 text-emerald-200 border-emerald-500/40 shadow-glow-green'
                  : 'bg-slate-800 text-slate-400 border-slate-700'
              }`}
            >
              {effectiveState}
            </span>
          </div>
        </div>

        {/* Action Recommendation when High Temperature is Detected */}
        {effectiveState === 'HIGH TEMPERATURE' && (
          <div className="mt-4 p-4 rounded-xl bg-red-950/40 border border-red-500/40 flex items-start space-x-3 text-red-100 shadow-inner">
            <Wind className="w-5 h-5 text-red-400 shrink-0 mt-0.5 animate-pulse" />
            <div className="flex-1">
              <div className="text-xs font-bold uppercase tracking-wider text-red-300 flex items-center justify-between">
                <span>Immediate Safety Action Required</span>
                <span className="font-mono text-[11px] text-red-400">&ge; 35.0°C Threshold Exceeded</span>
              </div>
              <p className="text-sm font-semibold mt-1 text-white">
                Ventilate the vehicle cabin immediately and activate air conditioning to prevent severe thermal buildup.
              </p>
              <div className="mt-2 text-xs text-red-200/80">
                Never leave occupants, children, or pets unattended in an enclosed vehicle under elevated heat.
              </div>
            </div>
          </div>
        )}

        {/* Advisory for Warning Stage */}
        {effectiveState === 'WARNING' && (
          <div className="mt-4 p-3.5 rounded-xl bg-amber-950/30 border border-amber-500/40 flex items-start space-x-3 text-amber-200">
            <SunMedium className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <div className="text-xs font-bold uppercase tracking-wide text-amber-300">
                Solar Radiation Accumulation Advisory
              </div>
              <p className="text-xs font-medium mt-0.5 leading-relaxed text-amber-100">
                Vehicle interior is absorbing direct solar heat (30.0°C – 34.9°C). Crack windows or initiate remote cabin pre-cooling prior to passenger boarding.
              </p>
            </div>
          </div>
        )}

        {/* Safe Stage Comfort Pill */}
        {effectiveState === 'NORMAL' && (
          <div className="mt-4 p-3 rounded-xl bg-emerald-950/20 border border-emerald-500/30 flex items-center justify-between text-xs text-emerald-200">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Cabin thermal parameters are within safe biological and comfort margins (&lt; 30.0°C).</span>
            </div>
            <span className="text-[11px] font-mono text-emerald-400 font-semibold hidden md:inline-block">
              GREEN LED ACTIVE
            </span>
          </div>
        )}

        {/* Offline Warning Notice */}
        {effectiveState === 'SENSOR OFFLINE' && (
          <div className="mt-4 p-3.5 rounded-xl bg-slate-900/70 border border-slate-700 flex items-start space-x-3 text-slate-400">
            <WifiOff className="w-5 h-5 text-slate-500 shrink-0 mt-0.5" />
            <p className="text-xs leading-relaxed">
              ESP32 telemetry stream is currently waiting for microcontroller data packet. Real-time updates will resume immediately when the device transmits over Wi-Fi.
            </p>
          </div>
        )}
      </div>

      {/* Safety System Overview Strip (Replaced Academic Notice) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="px-4 py-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80 flex items-center space-x-3">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <div className="text-[11px] text-slate-400">
            <span className="font-semibold text-slate-200">Safe Range:</span> &lt; 30.0°C (Normal)
          </div>
        </div>
        <div className="px-4 py-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80 flex items-center space-x-3">
          <div className="w-2 h-2 rounded-full bg-amber-400" />
          <div className="text-[11px] text-slate-400">
            <span className="font-semibold text-slate-200">Caution Range:</span> 30.0°C – 34.9°C
          </div>
        </div>
        <div className="px-4 py-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80 flex items-center space-x-3">
          <div className="w-2 h-2 rounded-full bg-red-400" />
          <div className="text-[11px] text-slate-400">
            <span className="font-semibold text-slate-200">Critical Alert:</span> &ge; 35.0°C (Alarm)
          </div>
        </div>
      </div>
    </div>
  );
}
