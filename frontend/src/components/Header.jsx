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
    <header className="glass-panel border-b border-slate-200/90 px-4 sm:px-8 py-4 sm:py-5 mb-6 rounded-2xl shadow-sm relative overflow-hidden bg-white/95">
      {/* Sleek top ambient accent line */}
      <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-sky-400 via-blue-500 to-indigo-400 opacity-90" />

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        {/* Left: Brand & Title */}
        <div className="flex items-center space-x-3.5 sm:space-x-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-sky-50 to-blue-100 border border-sky-200 flex items-center justify-center shadow-sm transform hover:scale-105 transition-transform">
            <Car className="w-6 h-6 text-sky-600" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 font-heading">
                SENTINEL CAR IoT
              </h1>
              <span className="px-2 py-0.5 text-[10px] font-extrabold tracking-widest bg-sky-100 text-sky-700 border border-sky-200 rounded uppercase font-mono">
                COCKPIT TELEMETRY
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 font-medium">
              Real-Time Automotive Cabin Heat & Moisture Sentinel
            </p>
          </div>
        </div>

        {/* Right: Telemetry Status Badges & Controls */}
        <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
          {/* Hardware Device Node ID */}
          <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-xs shadow-2xs">
            <Cpu className="w-3.5 h-3.5 text-sky-600" />
            <span className="text-slate-500">Node:</span>
            <span className="font-mono font-bold text-slate-800">{deviceId}</span>
          </div>

          {/* Connection Status Badge */}
          <div
            className={`flex items-center space-x-2 px-3 py-1.5 rounded-xl border text-xs font-bold tracking-wide transition-all shadow-2xs ${
              isOnline
                ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                : 'bg-slate-100 text-slate-500 border-slate-200'
            }`}
          >
            {isOnline ? (
              <>
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <Radio className="w-3.5 h-3.5 text-emerald-600" />
                <span>ONLINE (2.4GHz)</span>
              </>
            ) : (
              <>
                <WifiOff className="w-3.5 h-3.5 text-slate-400" />
                <span>STANDBY</span>
              </>
            )}
          </div>

          {/* Last Updated Timestamp */}
          <div className="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-xs text-slate-700 shadow-2xs">
            <Clock className="w-3.5 h-3.5 text-slate-500" />
            <span className="text-slate-500">Synced:</span>
            <span className="font-mono text-sky-700 font-bold">{formatTime(lastUpdated)}</span>
          </div>

          {/* Sound Alarm Toggle Button */}
          <button
            onClick={handleToggleSound}
            title={isMuted ? 'Unmute Audio Warning Chime' : 'Mute Audio Warning Chime'}
            className={`p-2 rounded-xl border transition-all shadow-2xs ${
              isMuted
                ? 'bg-slate-100 border-slate-200 text-slate-400 hover:text-slate-600'
                : 'bg-sky-50 border-sky-300 text-sky-700 shadow-sm'
            }`}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>

          {/* Telemetry Refresh Button */}
          <button
            onClick={onRefresh}
            disabled={isLoading}
            title="Refresh Telemetry Stream"
            className="p-2 rounded-xl bg-slate-100 border border-slate-200 hover:border-sky-300 text-slate-600 hover:text-sky-600 transition-all disabled:opacity-50 active:scale-95 shadow-2xs"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-sky-600' : ''}`} />
          </button>

          {/* System Diagnostics Trigger */}
          <button
            onClick={onOpenSimulation}
            className="flex items-center space-x-2 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white font-bold text-xs shadow-md shadow-sky-600/20 transition-all transform active:scale-95"
          >
            <Sliders className="w-4 h-4" />
            <span>Diagnostics</span>
          </button>
        </div>
      </div>
    </header>
  );
}
