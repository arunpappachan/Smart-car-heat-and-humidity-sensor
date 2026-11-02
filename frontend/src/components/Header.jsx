import React, { useState } from 'react';
import {
  Car,
  Wifi,
  WifiOff,
  Clock,
  Cpu,
  Sliders,
  RefreshCw,
  Volume2,
  VolumeX,
  Radio,
} from 'lucide-react';
import { soundAlertService } from '../services/soundAlerts';

export default function Header({
  deviceId = 'CAR_001',
  isOnline = false,
  lastUpdated = null,
  onOpenSimulation,
  onRefresh,
  isLoading = false,
}) {
  const [isMuted, setIsMuted] = useState(soundAlertService.getMuted());

  const handleToggleSound = () => {
    const muted = soundAlertService.toggleMute();
    setIsMuted(muted);
    if (!muted) {
      soundAlertService.playNormalChime();
    }
  };

  const formatTime = (isoString) => {
    if (!isoString) return 'Connecting...';
    try {
      const date = new Date(isoString);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    } catch {
      return 'Live';
    }
  };

  return (
    <header className="glass-panel border-b border-slate-800/80 px-4 sm:px-8 py-4 sm:py-5 mb-6 rounded-2xl shadow-2xl relative overflow-hidden">
      {/* Sleek top ambient accent line */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-80" />

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        {/* Left: Brand & Title */}
        <div className="flex items-center space-x-3.5 sm:space-x-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500/20 via-blue-600/30 to-indigo-600/20 border border-cyan-500/40 flex items-center justify-center shadow-glow-cyan transform hover:scale-105 transition-transform">
            <Car className="w-6 h-6 text-cyan-400" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white font-heading">
                SENTINEL CAR IoT
              </h1>
              <span className="px-2 py-0.5 text-[10px] font-extrabold tracking-widest bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 rounded uppercase font-mono">
                COCKPIT TELEMETRY
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 font-medium">
              Real-Time Automotive Cabin Heat & Moisture Sentinel
            </p>
          </div>
        </div>

        {/* Right: Telemetry Status Badges & Controls */}
        <div className="flex flex-wrap items-center gap-2.5 sm:gap-3.5">
          {/* Hardware Device Node ID */}
          <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-700/60 text-xs">
            <Cpu className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-slate-400">Node:</span>
            <span className="font-mono font-bold text-slate-200">{deviceId}</span>
          </div>

          {/* Connection Status Badge */}
          <div
            className={`flex items-center space-x-2 px-3 py-1.5 rounded-xl border text-xs font-bold tracking-wide transition-all ${
              isOnline
                ? 'bg-emerald-950/40 text-emerald-300 border-emerald-500/40 shadow-glow-green/30'
                : 'bg-slate-900/60 text-slate-400 border-slate-700/60'
            }`}
          >
            {isOnline ? (
              <>
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <Radio className="w-3.5 h-3.5 text-emerald-400" />
                <span>ONLINE (2.4GHz)</span>
              </>
            ) : (
              <>
                <WifiOff className="w-3.5 h-3.5 text-slate-500" />
                <span>STANDBY</span>
              </>
            )}
          </div>

          {/* Last Updated Timestamp */}
          <div className="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-700/60 text-xs text-slate-300">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-400">Synced:</span>
            <span className="font-mono text-cyan-300 font-semibold">{formatTime(lastUpdated)}</span>
          </div>

          {/* Sound Alarm Toggle Button */}
          <button
            onClick={handleToggleSound}
            title={isMuted ? 'Unmute Audio Warning Chime' : 'Mute Audio Warning Chime'}
            className={`p-2 rounded-xl border transition-all ${
              isMuted
                ? 'bg-slate-900/80 border-slate-700 text-slate-500 hover:text-slate-300'
                : 'bg-cyan-950/40 border-cyan-500/40 text-cyan-400 shadow-glow-cyan/20'
            }`}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>

          {/* Telemetry Refresh Button */}
          <button
            onClick={onRefresh}
            disabled={isLoading}
            title="Refresh Telemetry Stream"
            className="p-2 rounded-xl bg-slate-900/90 border border-slate-700/60 hover:border-cyan-500/50 text-slate-300 hover:text-cyan-400 transition-all disabled:opacity-50 active:scale-95"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-cyan-400' : ''}`} />
          </button>

          {/* System Diagnostics Trigger */}
          <button
            onClick={onOpenSimulation}
            className="flex items-center space-x-2 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-cyan-600 via-sky-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs shadow-glow-cyan transition-all transform active:scale-95"
          >
            <Sliders className="w-4 h-4" />
            <span>Diagnostics</span>
          </button>
        </div>
      </div>
    </header>
  );
}
