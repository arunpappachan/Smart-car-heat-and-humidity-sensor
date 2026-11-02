import React, { useMemo } from 'react';
import {
  Car,
  Fan,
  Sun,
  ShieldAlert,
  ShieldCheck,
  ThermometerSnowflake,
  Activity,
  Flame,
  Gauge,
} from 'lucide-react';

export default function VehicleCabinVisualizer({
  temperature = 0,
  humidity = 0,
  status = 'NORMAL',
  isOnline = true,
  onOpenDiagnostics,
}) {
  const tempVal = typeof temperature === 'number' ? temperature : parseFloat(temperature) || 0;
  const humVal = typeof humidity === 'number' ? humidity : parseFloat(humidity) || 0;

  // Calculate NOAA Heat Index ("Feels Like")
  const feelsLike = useMemo(() => {
    if (!tempVal) return 0;
    // Simplified Rothfusz regression / Steadman formula for heat index
    const T = tempVal;
    const R = humVal;
    if (T < 27) return T; // Heat index only applies meaningfully above ~27°C
    const c1 = -8.78469475556;
    const c2 = 1.61139411;
    const c3 = 2.33854883889;
    const c4 = -0.14611605;
    const c5 = -0.012308094;
    const c6 = -0.0164248277778;
    const c7 = 0.002211732;
    const c8 = 0.00072546;
    const c9 = -0.000003582;
    const hi =
      c1 +
      c2 * T +
      c3 * R +
      c4 * T * R +
      c5 * T * T +
      c6 * R * R +
      c7 * T * T * R +
      c8 * T * R * R +
      c9 * T * T * R * R;
    return Math.max(hi, T);
  }, [tempVal, humVal]);

  const isOverheating = isOnline && (status === 'HIGH' || tempVal >= 35.0);
  const isWarning = isOnline && !isOverheating && (status === 'WARNING' || tempVal >= 30.0);
  const isSafe = isOnline && !isOverheating && !isWarning;

  // Thermal state colors & descriptions
  const cabinMood = isOverheating
    ? {
        theme: 'red',
        bgGlow: 'rgba(239, 68, 68, 0.25)',
        halo: 'rgba(239, 68, 68, 0.4)',
        borderColor: 'border-red-500/50',
        textColor: 'text-red-400',
        badge: 'CRITICAL SOLAR OVERHEAT',
        action: 'EMERGENCY CABIN VENTILATION ACTIVE',
      }
    : isWarning
    ? {
        theme: 'amber',
        bgGlow: 'rgba(245, 158, 11, 0.2)',
        halo: 'rgba(245, 158, 11, 0.35)',
        borderColor: 'border-amber-500/50',
        textColor: 'text-amber-300',
        badge: 'SOLAR HEAT ACCUMULATION',
        action: 'PRE-COOLING & WINDOW VENT RECOMMENDED',
      }
    : {
        theme: 'emerald',
        bgGlow: 'rgba(16, 185, 129, 0.15)',
        halo: 'rgba(6, 182, 212, 0.25)',
        borderColor: 'border-cyan-500/40',
        textColor: 'text-emerald-300',
        badge: 'CABIN CLIMATE OPTIMAL',
        action: 'CABIN OVERHEAT PROTECTION: ARMED',
      };

  return (
    <div className={`glass-panel rounded-2xl p-5 sm:p-6 relative overflow-hidden transition-all duration-500 border ${cabinMood.borderColor}`}>
      {/* Background radial thermal gradient */}
      <div
        className="absolute inset-0 pointer-events-none transition-all duration-700 opacity-40 blur-3xl"
        style={{
          background: `radial-gradient(circle at 50% 50%, ${cabinMood.bgGlow} 0%, transparent 70%)`,
        }}
      />

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 relative z-10">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 text-cyan-400 shadow-glow-cyan/20">
            <Car className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-sm font-bold uppercase tracking-wider text-white">
                Vehicle Cabin Thermography & Architecture
              </h2>
              <span className="hidden sm:inline-block px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-slate-900 border border-slate-700 text-slate-300">
                Tesla / EV Spec
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Multi-zone thermal distribution & cabin overheat defense
            </p>
          </div>
        </div>

        {/* Live Protection Badge */}
        <div className="flex items-center space-x-2 self-start sm:self-auto">
          <span
            className={`flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase border transition-all ${
              isOverheating
                ? 'bg-red-500/20 text-red-300 border-red-500/50 animate-pulse'
                : isWarning
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
            }`}
          >
            {isOverheating ? (
              <ShieldAlert className="w-3.5 h-3.5 text-red-400" />
            ) : isWarning ? (
              <Flame className="w-3.5 h-3.5 text-amber-400" />
            ) : (
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            )}
            <span>{cabinMood.badge}</span>
          </span>
        </div>
      </div>

      {/* Main Grid: Blueprint Car Silhouette + Cabin Thermal Telemetry */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center relative z-10">
        {/* Left: Interactive Car Silhouette Graphic (7 cols) */}
        <div className="lg:col-span-7 flex flex-col items-center justify-center p-4 rounded-xl bg-slate-950/70 border border-slate-800/80 relative">
          {/* Subtle Grid Blueprint Backdrop */}
          <div
            className="absolute inset-0 rounded-xl opacity-20 pointer-events-none"
            style={{
              backgroundImage: `linear-gradient(to right, #334155 1px, transparent 1px), linear-gradient(to bottom, #334155 1px, transparent 1px)`,
              backgroundSize: '20px 20px',
            }}
          />

          {/* SVG Vehicle Top-down Blueprint */}
          <div className="relative w-full max-w-[420px] aspect-[2.1/1] py-2 flex items-center justify-center">
            <svg
              viewBox="0 0 520 250"
              className="w-full h-auto drop-shadow-[0_0_20px_rgba(6,182,212,0.15)]"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                {/* Heatmap Gradient for Cabin */}
                <radialGradient id="cabinHeatGrad" cx="50%" cy="50%" r="50%">
                  <stop
                    offset="0%"
                    stopColor={
                      isOverheating ? '#ef4444' : isWarning ? '#f59e0b' : '#06b6d4'
                    }
                    stopOpacity={isOverheating ? 0.75 : isWarning ? 0.55 : 0.35}
                  />
                  <stop
                    offset="60%"
                    stopColor={
                      isOverheating ? '#b91c1c' : isWarning ? '#d97706' : '#10b981'
                    }
                    stopOpacity={0.2}
                  />
                  <stop offset="100%" stopColor="#0f172a" stopOpacity="0" />
                </radialGradient>

                {/* Glass Roof Reflection */}
                <linearGradient id="glassRoof" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.25" />
                  <stop offset="40%" stopColor="#0284c7" stopOpacity="0.08" />
                  <stop offset="100%" stopColor="#0f172a" stopOpacity="0.3" />
                </linearGradient>

                {/* Headlight beam */}
                <linearGradient id="headlightBeam" x1="0%" y1="50%" x2="100%" y2="50%">
                  <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.6" />
                  <stop offset="100%" stopColor="#38bdf8" stopOpacity="0" />
                </linearGradient>
              </defs>

              {/* Headlight Beams */}
              <polygon points="500,45 540,25 540,65" fill="url(#headlightBeam)" opacity="0.6" />
              <polygon points="500,205 540,185 540,225" fill="url(#headlightBeam)" opacity="0.6" />

              {/* Car Body Outer Shell (Streamlined Modern EV Silhouette) */}
              <path
                d="M 60,65 
                   C 100,55 170,48 260,48 
                   C 360,48 430,58 480,72 
                   C 505,80 515,95 515,125 
                   C 515,155 505,170 480,178 
                   C 430,192 360,202 260,202 
                   C 170,202 100,195 60,185 
                   C 30,178 18,160 18,125 
                   C 18,90 30,72 60,65 Z"
                fill="#0A1120"
                stroke={isOverheating ? '#ef4444' : isWarning ? '#f59e0b' : '#38bdf8'}
                strokeWidth="2.5"
                className="transition-colors duration-500"
              />

              {/* Front Windshield */}
              <path
                d="M 330,62 L 375,72 C 385,100 385,150 375,178 L 330,188 C 342,150 342,100 330,62 Z"
                fill="url(#glassRoof)"
                stroke="#64748b"
                strokeWidth="1.5"
              />

              {/* Panoramic Glass Roof / Interior Cabin Zone */}
              <rect
                x="180"
                y="65"
                width="155"
                height="120"
                rx="18"
                fill="url(#cabinHeatGrad)"
                stroke={isOverheating ? '#ef4444' : '#334155'}
                strokeWidth="1.5"
                className="transition-all duration-700"
              />

              {/* Rear Windshield */}
              <path
                d="M 125,75 L 175,68 C 170,105 170,145 175,182 L 125,175 C 120,145 120,105 125,75 Z"
                fill="url(#glassRoof)"
                stroke="#64748b"
                strokeWidth="1.5"
              />

              {/* Wheels / Brake Rotors */}
              <rect x="90" y="32" width="55" height="18" rx="4" fill="#1e293b" stroke="#475569" strokeWidth="1.5" />
              <rect x="90" y="200" width="55" height="18" rx="4" fill="#1e293b" stroke="#475569" strokeWidth="1.5" />
              <rect x="390" y="32" width="55" height="18" rx="4" fill="#1e293b" stroke="#475569" strokeWidth="1.5" />
              <rect x="390" y="200" width="55" height="18" rx="4" fill="#1e293b" stroke="#475569" strokeWidth="1.5" />

              {/* Front Cabin Seats */}
              {/* Driver Seat */}
              <rect x="270" y="76" width="36" height="32" rx="6" fill="#1e293b" stroke="#334155" strokeWidth="1" />
              <rect x="298" y="80" width="10" height="24" rx="3" fill="#334155" />
              {/* Front Passenger Seat */}
              <rect x="270" y="142" width="36" height="32" rx="6" fill="#1e293b" stroke="#334155" strokeWidth="1" />
              <rect x="298" y="146" width="10" height="24" rx="3" fill="#334155" />

              {/* Rear Seats (Child Seat / Passenger Zone) */}
              <rect x="195" y="78" width="34" height="94" rx="6" fill="#1e293b" stroke="#334155" strokeWidth="1" />
              <line x1="195" y1="125" x2="229" y2="125" stroke="#334155" strokeWidth="1" />

              {/* Central IoT Telemetry Node / DHT22 Sensor Location */}
              <circle
                cx="255"
                cy="125"
                r="10"
                fill={isOverheating ? '#ef4444' : isWarning ? '#f59e0b' : '#06b6d4'}
                className="animate-pulse"
              />
              <circle
                cx="255"
                cy="125"
                r="18"
                stroke={isOverheating ? '#ef4444' : isWarning ? '#f59e0b' : '#06b6d4'}
                strokeWidth="1.5"
                strokeDasharray="4 2"
                opacity="0.8"
                className="animate-spin-slow"
              />

              {/* Sensor Node Tag */}
              <text x="255" y="102" textAnchor="middle" fill="#94a3b8" fontSize="9" fontWeight="600" fontFamily="sans-serif">
                DHT22 SENSOR
              </text>
              <text x="255" y="152" textAnchor="middle" fill="#e2e8f0" fontSize="11" fontWeight="800" fontFamily="monospace">
                {isOnline ? `${tempVal.toFixed(1)}°C` : '--'}
              </text>

              {/* HVAC Airflow Animation Indicators */}
              <g opacity={isOverheating || isWarning ? '0.9' : '0.4'}>
                <path
                  d="M 330,95 Q 310,95 295,95"
                  stroke="#38bdf8"
                  strokeWidth="2"
                  strokeDasharray="4 3"
                  className={isOverheating ? 'animate-pulse' : ''}
                />
                <path
                  d="M 330,155 Q 310,155 295,155"
                  stroke="#38bdf8"
                  strokeWidth="2"
                  strokeDasharray="4 3"
                  className={isOverheating ? 'animate-pulse' : ''}
                />
              </g>
            </svg>

            {/* Floating Live Heat Indicator on Car */}
            <div className="absolute bottom-2 left-3 px-2 py-1 rounded bg-slate-900/90 border border-slate-700/80 text-[10px] font-mono text-slate-300 flex items-center space-x-1.5">
              <span className={`w-2 h-2 rounded-full ${isOverheating ? 'bg-red-400 animate-ping' : isWarning ? 'bg-amber-400' : 'bg-emerald-400'}`} />
              <span>Zone: Central Cabin (GPIO 4)</span>
            </div>
          </div>
        </div>

        {/* Right: Real-Time Cockpit Safety Telemetry Panel (5 cols) */}
        <div className="lg:col-span-5 space-y-3.5">
          {/* Card 1: Heat Index / Feels Like */}
          <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-orange-500/10 border border-orange-500/30 text-orange-400">
                <Sun className="w-5 h-5" />
              </div>
              <div>
                <div className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">
                  Interior Heat Index (Feels Like)
                </div>
                <div className="text-xs text-slate-400 mt-0.5">
                  NOAA Thermal Humidity Factor
                </div>
              </div>
            </div>
            <div className="text-right">
              <span className="text-2xl font-black font-heading text-white">
                {isOnline ? `${feelsLike.toFixed(1)}` : '--.-'}
              </span>
              <span className="text-sm font-bold text-slate-400 ml-1">°C</span>
            </div>
          </div>

          {/* Card 2: Cabin Protection Protocol */}
          <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
                <Fan className={`w-5 h-5 ${isOverheating ? 'animate-spin' : ''}`} />
              </div>
              <div>
                <div className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">
                  Cabin Overheat Defense
                </div>
                <div className="text-xs font-semibold text-slate-300 mt-0.5">
                  {isOverheating
                    ? 'Automated Venting Activated'
                    : isWarning
                    ? 'Solar Pre-Cooling Standby'
                    : 'System Armed & Normal'}
                </div>
              </div>
            </div>
            <span
              className={`text-[10px] font-mono px-2 py-1 rounded font-bold uppercase ${
                isOverheating
                  ? 'bg-red-500/20 text-red-300 border border-red-500/40'
                  : 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30'
              }`}
            >
              {isOverheating ? 'VENTING' : 'READY'}
            </span>
          </div>

          {/* Card 3: Occupant Safety Threshold Status */}
          <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/30 text-blue-400">
                <ThermometerSnowflake className="w-5 h-5" />
              </div>
              <div>
                <div className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">
                  Child & Pet Thermal Margin
                </div>
                <div className="text-xs text-slate-400 mt-0.5">
                  {isOverheating
                    ? 'DANGER: Cabin exceeds safe biological limit!'
                    : isWarning
                    ? 'CAUTION: Rising cabin thermal load'
                    : 'SAFE: Comfortable ambient range'}
                </div>
              </div>
            </div>
            <span
              className={`text-[10px] font-bold px-2 py-1 rounded uppercase ${
                isOverheating
                  ? 'bg-red-950 text-red-300 border border-red-500/50'
                  : isWarning
                  ? 'bg-amber-950 text-amber-300 border border-amber-500/40'
                  : 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
              }`}
            >
              {isOverheating ? 'HAZARD' : isWarning ? 'ELEVATED' : 'SAFE'}
            </span>
          </div>

          {/* Interactive Diagnostic calibration trigger */}
          <div className="pt-1 flex items-center justify-between">
            <div className="text-[11px] text-slate-400 flex items-center space-x-1.5">
              <Activity className="w-3.5 h-3.5 text-cyan-400" />
              <span>Telemetry Sample: 2 sec interval via ESP32</span>
            </div>
            {onOpenDiagnostics && (
              <button
                onClick={onOpenDiagnostics}
                className="text-xs text-cyan-400 hover:text-cyan-300 font-medium flex items-center space-x-1 underline underline-offset-4"
              >
                <span>Diagnostic Suite &rarr;</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
