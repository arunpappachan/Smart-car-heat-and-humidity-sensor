import React, { useState, useEffect } from 'react';
import {
  X,
  Play,
  Square,
  SunMedium,
  Wind,
  RotateCw,
  Sliders,
  CheckCircle,
  Activity,
} from 'lucide-react';
import {
  getSimulationStatus,
  startSimulation,
  stopSimulation,
  setSimulationScenario,
} from '../services/api';

export default function SimulationModal({ isOpen, onClose }) {
  const [status, setStatus] = useState({ isRunning: false, currentTemp: 27.5, mode: 'auto' });
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState('');

  const refreshStatus = async () => {
    try {
      const res = await getSimulationStatus();
      if (res.success) {
        setStatus(res.simulation);
      }
    } catch {
      // Ignore if offline
    }
  };

  useEffect(() => {
    if (isOpen) {
      refreshStatus();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleStart = async (mode = 'auto') => {
    setLoading(true);
    try {
      const res = await startSimulation(mode, 'CAR_001');
      setStatus(res.simulation);
      setFeedback(`Calibration sequence active: ${mode.toUpperCase()} profile.`);
      setTimeout(() => setFeedback(''), 3000);
    } catch {
      setFeedback('Error: Failed to initiate test sequence.');
    } finally {
      setLoading(false);
    }
  };

  const handleStop = async () => {
    setLoading(true);
    try {
      const res = await stopSimulation();
      setStatus(res.simulation);
      setFeedback('Diagnostic test concluded.');
      setTimeout(() => setFeedback(''), 3000);
    } catch {
      setFeedback('Error: Failed to halt test.');
    } finally {
      setLoading(false);
    }
  };

  const handleScenario = async (scenario) => {
    setLoading(true);
    try {
      if (!status.isRunning) {
        await startSimulation(scenario, 'CAR_001');
      } else {
        await setSimulationScenario(scenario);
      }
      await refreshStatus();
      setFeedback(`Activated test profile: ${scenario.toUpperCase()}`);
      setTimeout(() => setFeedback(''), 3000);
    } catch {
      setFeedback('Error initiating scenario profile.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="glass-panel w-full max-w-lg rounded-2xl p-6 border border-slate-700 shadow-2xl relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center space-x-3 mb-5">
          <div className="p-3 rounded-xl bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 shadow-glow-cyan/20">
            <Sliders className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white font-heading">
              Vehicle Diagnostics & Calibration
            </h2>
            <p className="text-xs text-slate-400">
              Stress-test cabin thermal parameters and safety alert thresholds
            </p>
          </div>
        </div>

        {/* Status Callout */}
        <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between mb-5">
          <div className="flex items-center space-x-2.5">
            <span
              className={`w-3 h-3 rounded-full ${
                status.isRunning ? 'bg-emerald-400 animate-ping' : 'bg-slate-600'
              }`}
            />
            <span className="text-xs font-semibold text-slate-300">
              Diagnostic State: {status.isRunning ? 'RUNNING TEST SEQUENCE' : 'STANDBY (ESP32 LIVE)'}
            </span>
          </div>

          <div className="text-xs font-mono">
            Profile: <span className="text-cyan-400 uppercase font-bold">{status.mode}</span>
          </div>
        </div>

        {feedback && (
          <div className="mb-4 p-2.5 rounded-xl bg-cyan-950/40 border border-cyan-500/40 text-xs text-cyan-300 flex items-center space-x-2">
            <CheckCircle className="w-4 h-4 shrink-0" />
            <span>{feedback}</span>
          </div>
        )}

        {/* Calibration Profile Buttons */}
        <div className="space-y-3 mb-6">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
            <span>Environmental Test Profiles</span>
            <Activity className="w-3.5 h-3.5 text-slate-500" />
          </div>

          {/* Scenario 1: Extreme Solar Heat Soak */}
          <button
            onClick={() => handleScenario('heatwave')}
            disabled={loading}
            className="w-full p-3 rounded-xl bg-red-950/30 hover:bg-red-900/40 border border-red-500/30 text-left flex items-center justify-between group transition-all"
          >
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-red-500/20 text-red-400 group-hover:scale-105 transition-transform">
                <SunMedium className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-red-200">
                  Profile A: Solar Heat Soak (Rapid Heatup)
                </div>
                <div className="text-[11px] text-slate-400">
                  Simulates solar thermal buildup past 35°C &rarr; triggers Red LED & Overheat Alert
                </div>
              </div>
            </div>
          </button>

          {/* Scenario 2: Ventilation & AC */}
          <button
            onClick={() => handleScenario('cooldown')}
            disabled={loading}
            className="w-full p-3 rounded-xl bg-emerald-950/30 hover:bg-emerald-900/40 border border-emerald-500/30 text-left flex items-center justify-between group transition-all"
          >
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400 group-hover:scale-105 transition-transform">
                <Wind className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-emerald-200">
                  Profile B: Active Cabin Ventilation & AC Purge
                </div>
                <div className="text-[11px] text-slate-400">
                  Simulates rapid ventilation & cooling airflow &rarr; restores cabin to Green LED Safe
                </div>
              </div>
            </div>
          </button>

          {/* Scenario 3: Auto Loop */}
          <button
            onClick={() => handleScenario('auto')}
            disabled={loading}
            className="w-full p-3 rounded-xl bg-slate-900 hover:bg-slate-800/80 border border-slate-700 text-left flex items-center justify-between group transition-all"
          >
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-cyan-500/20 text-cyan-400 group-hover:scale-105 transition-transform">
                <RotateCw className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-200">
                  Profile C: Natural Diurnal Driving Cycle
                </div>
                <div className="text-[11px] text-slate-400">
                  Cycles between shaded ambient conditions and direct solar exposure
                </div>
              </div>
            </div>
          </button>
        </div>

        {/* Global Controls */}
        <div className="flex items-center space-x-3 pt-3 border-t border-slate-800">
          {status.isRunning ? (
            <button
              onClick={handleStop}
              disabled={loading}
              className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs flex items-center justify-center space-x-2 transition-all shadow-glow-red active:scale-95"
            >
              <Square className="w-4 h-4 fill-white" />
              <span>Conclude Test Sequence</span>
            </button>
          ) : (
            <button
              onClick={() => handleStart('auto')}
              disabled={loading}
              className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs flex items-center justify-center space-x-2 transition-all shadow-glow-cyan active:scale-95"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>Initiate Test Profile</span>
            </button>
          )}

          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 hover:border-slate-600 text-xs text-slate-300 font-semibold transition-all"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
