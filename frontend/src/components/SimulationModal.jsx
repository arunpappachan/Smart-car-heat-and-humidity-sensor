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
  AlertTriangle,
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
      setFeedback(`Simulator started in ${mode} mode.`);
      setTimeout(() => setFeedback(''), 3000);
    } catch (err) {
      setFeedback('Error: Failed to start simulation.');
    } finally {
      setLoading(false);
    }
  };

  const handleStop = async () => {
    setLoading(true);
    try {
      const res = await stopSimulation();
      setStatus(res.simulation);
      setFeedback('Simulator stopped.');
      setTimeout(() => setFeedback(''), 3000);
    } catch (err) {
      setFeedback('Error: Failed to stop simulation.');
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
      setFeedback(`Triggered: ${scenario.toUpperCase()} scenario.`);
      setTimeout(() => setFeedback(''), 3000);
    } catch (err) {
      setFeedback('Error triggering scenario.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="glass-panel w-full max-w-lg rounded-2xl p-6 border border-slate-700 shadow-2xl relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-3 rounded-xl bg-purple-500/20 border border-purple-500/30 text-purple-400">
            <Sliders className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white font-heading">
              Demonstration & Testing Simulator
            </h2>
            <p className="text-xs text-slate-400">
              Generate realistic car cabin telemetry without physical ESP32
            </p>
          </div>
        </div>

        {/* Status Callout */}
        <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between mb-5">
          <div className="flex items-center space-x-2">
            <span
              className={`w-3 h-3 rounded-full ${
                status.isRunning ? 'bg-emerald-400 animate-ping' : 'bg-slate-600'
              }`}
            />
            <span className="text-xs font-semibold text-slate-300">
              State: {status.isRunning ? 'RUNNING' : 'STOPPED'}
            </span>
          </div>

          <div className="text-xs font-mono">
            Mode: <span className="text-cyan-400 uppercase font-bold">{status.mode}</span>
          </div>
        </div>

        {feedback && (
          <div className="mb-4 p-2.5 rounded-lg bg-cyan-950/40 border border-cyan-500/40 text-xs text-cyan-300 flex items-center space-x-2">
            <CheckCircle className="w-4 h-4 shrink-0" />
            <span>{feedback}</span>
          </div>
        )}

        {/* Simulation Scenario Buttons */}
        <div className="space-y-3 mb-6">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Select Demonstration Scenario
          </div>

          {/* Scenario 1: Sunny Day Heatwave */}
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
                  Scenario A: Sunny Day Heatwave (Heating Up)
                </div>
                <div className="text-[11px] text-slate-400">
                  Simulates rapid solar heating past 35°C &rarr; triggers Red LED & High Alert
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
                  Scenario B: AC Ventilation (Cooling Down)
                </div>
                <div className="text-[11px] text-slate-400">
                  Simulates windows down / AC running &rarr; temperature drops back to safe Green LED
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
                  Scenario C: Continuous Natural Cycle
                </div>
                <div className="text-[11px] text-slate-400">
                  Smoothly transitions between heating in sun and cooling in shade
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
              className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs flex items-center justify-center space-x-2 transition-all shadow-glow-red"
            >
              <Square className="w-4 h-4 fill-white" />
              <span>Stop Simulator</span>
            </button>
          ) : (
            <button
              onClick={() => handleStart('auto')}
              disabled={loading}
              className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs flex items-center justify-center space-x-2 transition-all shadow-glow-cyan"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>Start Simulator</span>
            </button>
          )}

          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 hover:border-slate-600 text-xs text-slate-300 font-semibold transition-all"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
