import React from 'react';
import { Car, Wifi, WifiOff, Clock, Cpu, PlayCircle, RefreshCw } from 'lucide-react';

export default function Header({
  deviceId = 'CAR_001',
  isOnline = false,
  lastUpdated = null,
  isSimulated = false,
  onOpenSimulation,
  onRefresh,
  isLoading = false,
}) {
  const formatTime = (isoString) => {
    if (!isoString) return 'Waiting for data...';
    try {
      const date = new Date(isoString);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    } catch {
      return 'Recent';
    }
  };

  return (
    <header className="glass-panel border-b border-slate-800/80 px-4 sm:px-8 py-4 sm:py-5 mb-6 rounded-2xl shadow-xl">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        {/* Left: Brand & Title */}
        <div className="flex items-center space-x-3 sm:space-x-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-600/30 border border-cyan-500/40 flex items-center justify-center shadow-glow-cyan">
            <Car className="w-6 h-6 text-cyan-400" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white font-heading">
                SMART CAR MONITOR
              </h1>
              {isSimulated && (
                <span className="px-2 py-0.5 text-[10px] font-semibold tracking-wider bg-purple-500/20 text-purple-300 border border-purple-500/30 rounded uppercase">
                  Simulated
                </span>
              )}
            </div>
            <p className="text-xs sm:text-sm text-slate-400 font-medium">
              Real-Time Cabin Temperature & Humidity Monitoring
            </p>
          </div>
        </div>

        {/* Right: Telemetry Status Badges & Controls */}
        <div className="flex flex-wrap items-center gap-2.5 sm:gap-4">
          {/* Device ID Badge */}
          <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-900/80 border border-slate-700/60 text-xs">
            <Cpu className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-slate-400">Device:</span>
            <span className="font-mono font-bold text-slate-200">{deviceId}</span>
          </div>

          {/* Connection Status Badge */}
          <div
            className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg border text-xs font-semibold tracking-wide transition-all ${
              isOnline
                ? 'bg-emerald-950/40 text-emerald-400 border-emerald-500/40 shadow-glow-green/30'
                : 'bg-slate-900/60 text-slate-400 border-slate-700/60'
            }`}
          >
            {isOnline ? (
              <>
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <Wifi className="w-3.5 h-3.5 text-emerald-400" />
                <span>ONLINE</span>
              </>
            ) : (
              <>
                <WifiOff className="w-3.5 h-3.5 text-slate-500" />
                <span>OFFLINE</span>
              </>
            )}
          </div>

          {/* Last Updated Timestamp */}
          <div className="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-900/80 border border-slate-700/60 text-xs text-slate-300">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-400">Updated:</span>
            <span className="font-mono">{formatTime(lastUpdated)}</span>
          </div>

          {/* Refresh Button */}
          <button
            onClick={onRefresh}
            disabled={isLoading}
            title="Refresh Telemetry"
            className="p-2 rounded-lg bg-slate-900/80 border border-slate-700/60 hover:border-cyan-500/50 text-slate-300 hover:text-cyan-400 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-cyan-400' : ''}`} />
          </button>

          {/* Demo Simulation Trigger */}
          <button
            onClick={onOpenSimulation}
            className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-medium text-xs shadow-glow-cyan transition-all transform active:scale-95"
          >
            <PlayCircle className="w-4 h-4" />
            <span>Demo Mode</span>
          </button>
        </div>
      </div>
    </header>
  );
}
