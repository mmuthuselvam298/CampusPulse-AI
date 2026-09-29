import React, { useState } from 'react';
import { 
  Radio, 
  Sparkles, 
  Play, 
  RotateCcw, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  MapPin, 
  GitCompare,
  ArrowRight,
  Zap
} from 'lucide-react';
import { ChaosSimulationType, ChaosSimulationResult } from '../../types';
import { ApiService } from '../../services/api';
import { useApp } from '../../context/AppContext';

export const ChaosSimulatorPage: React.FC = () => {
  const { refreshData, addToast, setCurrentTab } = useApp();
  const [running, setRunning] = useState<ChaosSimulationType | null>(null);
  const [result, setResult] = useState<ChaosSimulationResult | null>(null);

  const simulationOptions: { type: ChaosSimulationType; title: string; desc: string; color: string }[] = [
    {
      type: 'ROOM_CHANGE',
      title: 'Simulate Room Change',
      desc: 'Relocates Robotics Workshop from Room S202 to Room S204 SR Block with hardware kit notice.',
      color: 'hover:border-indigo-500 hover:bg-indigo-50/30'
    },
    {
      type: 'TIME_CHANGE',
      title: 'Simulate Time Change',
      desc: 'Shifts event start from 10:00 AM to 11:00 AM to avoid collision with algorithms exam.',
      color: 'hover:border-amber-500 hover:bg-amber-50/30'
    },
    {
      type: 'DEADLINE_CHANGE',
      title: 'Simulate Deadline Change',
      desc: 'Extends CSE 204 Problem Set 2 deadline by 72 hours until October 5.',
      color: 'hover:border-purple-500 hover:bg-purple-50/30'
    },
    {
      type: 'EVENT_POSTPONEMENT',
      title: 'Simulate Event Postponement',
      desc: 'E-Cell circular postpones STARTUP WARS pitching series; slide decks preserved.',
      color: 'hover:border-rose-500 hover:bg-rose-50/30'
    },
    {
      type: 'EVENT_CANCELLATION',
      title: 'Simulate Event Cancellation',
      desc: 'Cancels Friday quantum computing guest talk due to speaker medical emergency.',
      color: 'hover:border-slate-500 hover:bg-slate-50/50'
    },
    {
      type: 'UNIVERSITY_CLOSURE',
      title: 'Simulate University Closure',
      desc: 'Registrar issues emergency cyclone warning; full campus closed tomorrow.',
      color: 'hover:border-red-500 hover:bg-red-50/30'
    },
    {
      type: 'TRANSPORT_DISRUPTION',
      title: 'Simulate Transport Disruption',
      desc: 'Bypass waterlogging diverts Routes 5 & 8 with 30-minute campus arrival delay.',
      color: 'hover:border-teal-500 hover:bg-teal-50/30'
    },
    {
      type: 'CONFLICTING_INFO',
      title: 'Simulate Conflicting Information',
      desc: 'Ingests email claiming 10:00 AM start, directly contradicting existing 11:00 AM calendar booking.',
      color: 'hover:border-amber-600 hover:bg-amber-50/40'
    }
  ];

  const handleSimulate = async (type: ChaosSimulationType) => {
    try {
      setRunning(type);
      const res = await ApiService.simulateChaos(type);
      setResult(res);
      await refreshData();
      addToast({
        title: 'Simulation Dispatched',
        message: res.headline,
        priority: 'CRITICAL'
      });
    } catch (err: any) {
      addToast({
        title: 'Simulation Error',
        message: err.message || 'Simulation pipeline failed.',
        priority: 'HIGH'
      });
    } finally {
      setRunning(null);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="bg-gradient-to-r from-rose-950 via-slate-900 to-slate-900 p-8 rounded-3xl text-white border border-rose-500/30 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-rose-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/20 border border-rose-400/30 text-rose-300 text-xs font-semibold uppercase tracking-wider mb-3">
            <Radio className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
            Live Demonstration Engine · Smart India Hackathon
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight font-heading">
            Campus Chaos Simulator
          </h1>
          <p className="mt-2 text-sm text-slate-300 leading-relaxed">
            Test CampusPulse in real time. Dispatch realistic university disruptions through the live database pipeline. Watch how relationship engines, conflict detectors, and calendar guards react immediately.
          </p>
        </div>
      </div>

      {/* Simulator Options Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {simulationOptions.map(opt => (
          <div 
            key={opt.type}
            className={`bg-white p-5 rounded-3xl border border-slate-200/90 shadow-xs transition-all flex flex-col justify-between ${opt.color}`}
          >
            <div>
              <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-800 mb-3 font-bold">
                <Zap className="w-4 h-4 text-indigo-600" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 mb-1">
                {opt.title}
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                {opt.desc}
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100">
              <button
                onClick={() => handleSimulate(opt.type)}
                disabled={running === opt.type}
                className="w-full py-2 px-3 rounded-xl bg-slate-900 hover:bg-indigo-600 text-white font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Play className="w-3 h-3 fill-current" />
                <span>{running === opt.type ? 'Injecting Chaos...' : 'Run Simulation'}</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Real-Time Simulation Result Panel */}
      {result && (
        <div className="bg-white rounded-3xl border border-indigo-200 shadow-lg p-6 sm:p-8 space-y-6 animate-in slide-in-from-bottom-2 duration-300">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
            <div>
              <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 uppercase tracking-wider">
                ✓ PIPELINE MUTATION COMPLETE
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mt-2">
                {result.headline}
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentTab('changes-radar')}
                className="px-4 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <span>View What Changed</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setCurrentTab('conflicts')}
                className="px-4 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-700 font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <span>Check Conflicts</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Pipeline Updates Checklist */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              System Pipeline Execution Trail:
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {result.summaryOfUpdates.map((update, idx) => (
                <div key={idx} className="flex items-start gap-2.5 p-3 rounded-2xl bg-slate-50 border border-slate-100 text-xs text-slate-800">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>{update}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Ingested Notice Excerpt */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs space-y-1.5">
            <div className="font-bold text-slate-900 flex items-center justify-between">
              <span>Ingested Circular: {result.simulatedEmail.subject}</span>
              <span className="text-[11px] text-slate-400 font-normal">{result.simulatedEmail.senderName}</span>
            </div>
            <p className="text-slate-600 italic">
              "{result.simulatedEmail.summary}"
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
