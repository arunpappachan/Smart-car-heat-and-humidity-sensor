import React from 'react';
import { AlertOctagon, AlertTriangle, ShieldCheck, WifiOff, Wind, SunMedium, CheckCircle2 } from 'lucide-react';

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
            ? 'bg-rose-50/90 border-rose-300 shadow-sm'
            : effectiveState === 'WARNING'
            ? 'bg-amber-50/90 border-amber-300 shadow-sm'
            : effectiveState === 'NORMAL'
            ? 'bg-emerald-50/80 border-emerald-300/80 shadow-sm'
            : 'bg-slate-50 border-slate-200'
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3.5 sm:space-x-4">
            <div
              className={`w-13 h-13 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center border shadow-sm transition-all ${
                effectiveState === 'HIGH TEMPERATURE'
                  ? 'bg-rose-100 border-rose-300 text-rose-600 animate-pulse'
                  : effectiveState === 'WARNING'
                  ? 'bg-amber-100 border-amber-300 text-amber-600'
                  : effectiveState === 'NORMAL'
                  ? 'bg-emerald-100 border-emerald-300 text-emerald-600'
                  : 'bg-slate-200 border-slate-300 text-slate-500'
              }`}
            >
              {effectiveState === 'HIGH TEMPERATURE' && <AlertOctagon className="w-8 h-8" />}
              {effectiveState === 'WARNING' && <AlertTriangle className="w-8 h-8" />}
              {effectiveState === 'NORMAL' && <ShieldCheck className="w-8 h-8" />}
              {effectiveState === 'SENSOR OFFLINE' && <WifiOff className="w-8 h-8" />}
            </div>

            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Vehicle Cabin Safety Status
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                <span className="text-[11px] font-mono text-sky-700 font-bold">
                  {effectiveState === 'NORMAL' ? 'NOMINAL' : effectiveState}
                </span>
              </div>
              <h2
                className={`text-xl sm:text-2xl font-black font-heading tracking-wide mt-0.5 ${
                  effectiveState === 'HIGH TEMPERATURE'
                    ? 'text-rose-700'
                    : effectiveState === 'WARNING'
                    ? 'text-amber-700'
                    : effectiveState === 'NORMAL'
                    ? 'text-emerald-800'
                    : 'text-slate-700'
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
              className={`px-4 py-1.5 rounded-full text-xs font-extrabold uppercase tracking-widest border transition-all shadow-sm ${
                effectiveState === 'HIGH TEMPERATURE'
                  ? 'bg-rose-600 text-white border-rose-600 animate-pulse'
                  : effectiveState === 'WARNING'
                  ? 'bg-amber-500 text-white border-amber-500'
                  : effectiveState === 'NORMAL'
                  ? 'bg-emerald-600 text-white border-emerald-600'
                  : 'bg-slate-200 text-slate-600 border-slate-300'
              }`}
            >
              {effectiveState}
            </span>
          </div>
        </div>

        {/* Action Recommendation when High Temperature is Detected */}
        {effectiveState === 'HIGH TEMPERATURE' && (
          <div className="mt-4 p-4 rounded-xl bg-rose-100/80 border border-rose-300 flex items-start space-x-3 text-rose-900 shadow-sm">
            <Wind className="w-5 h-5 text-rose-600 shrink-0 mt-0.5 animate-pulse" />
            <div className="flex-1">
              <div className="text-xs font-bold uppercase tracking-wider text-rose-700 flex items-center justify-between">
                <span>Immediate Safety Action Required</span>
                <span className="font-mono text-[11px] text-rose-700">&ge; 35.0°C Threshold Exceeded</span>
              </div>
              <p className="text-sm font-semibold mt-1 text-rose-950">
                Ventilate the vehicle cabin immediately and activate air conditioning to prevent severe thermal buildup.
              </p>
              <div className="mt-2 text-xs text-rose-800">
                Never leave occupants, children, or pets unattended in an enclosed vehicle under elevated heat.
              </div>
            </div>
          </div>
        )}

        {/* Advisory for Warning Stage */}
        {effectiveState === 'WARNING' && (
          <div className="mt-4 p-3.5 rounded-xl bg-amber-100/70 border border-amber-300 flex items-start space-x-3 text-amber-900 shadow-sm">
            <SunMedium className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <div className="text-xs font-bold uppercase tracking-wide text-amber-800">
                Solar Radiation Accumulation Advisory
              </div>
              <p className="text-xs font-medium mt-0.5 leading-relaxed text-amber-950">
                Vehicle interior is absorbing direct solar heat (30.0°C – 34.9°C). Crack windows or initiate remote cabin pre-cooling prior to passenger boarding.
              </p>
            </div>
          </div>
        )}

        {/* Safe Stage Comfort Pill */}
        {effectiveState === 'NORMAL' && (
          <div className="mt-4 p-3 rounded-xl bg-emerald-100/60 border border-emerald-200 flex items-center justify-between text-xs text-emerald-900">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Cabin thermal parameters are within safe biological and comfort margins (&lt; 30.0°C).</span>
            </div>
            <span className="text-[11px] font-mono text-emerald-700 font-bold hidden md:inline-block">
              GREEN LED ACTIVE
            </span>
          </div>
        )}

        {/* Offline Warning Notice */}
        {effectiveState === 'SENSOR OFFLINE' && (
          <div className="mt-4 p-3.5 rounded-xl bg-slate-100 border border-slate-200 flex items-start space-x-3 text-slate-600">
            <WifiOff className="w-5 h-5 text-slate-500 shrink-0 mt-0.5" />
            <p className="text-xs leading-relaxed">
              ESP32 telemetry stream is currently waiting for microcontroller data packet. Real-time updates will resume immediately when the device transmits over Wi-Fi.
            </p>
          </div>
        )}
      </div>

      {/* Safety System Overview Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="px-4 py-3 rounded-xl bg-white border border-slate-200 shadow-xs flex items-center space-x-3">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <div className="text-xs text-slate-600">
            <span className="font-bold text-slate-800">Safe Range:</span> &lt; 30.0°C (Normal)
          </div>
        </div>
        <div className="px-4 py-3 rounded-xl bg-white border border-slate-200 shadow-xs flex items-center space-x-3">
          <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
          <div className="text-xs text-slate-600">
            <span className="font-bold text-slate-800">Caution Range:</span> 30.0°C – 34.9°C
          </div>
        </div>
        <div className="px-4 py-3 rounded-xl bg-white border border-slate-200 shadow-xs flex items-center space-x-3">
          <div className="w-2.5 h-2.5 rounded-full bg-rose-500" />
          <div className="text-xs text-slate-600">
            <span className="font-bold text-slate-800">Critical Alert:</span> &ge; 35.0°C (Alarm)
          </div>
        </div>
      </div>
    </div>
  );
}
