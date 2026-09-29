import React, { useState, useEffect } from 'react';
import { 
  Compass, 
  Eye, 
  EyeOff, 
  AlertTriangle, 
  Clock, 
  CheckSquare, 
  Info,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { AttentionBudgetData } from '../../types';
import { ApiService } from '../../services/api';
import { useApp } from '../../context/AppContext';

export const AttentionBudgetPage: React.FC = () => {
  const { openEmailById, setCurrentTab } = useApp();
  const [budget, setBudget] = useState<AttentionBudgetData | null>(null);
  const [loading, setLoading] = useState(true);
  const [focusMode, setFocusMode] = useState<boolean>(true);

  useEffect(() => {
    loadBudget();
  }, []);

  const loadBudget = async () => {
    try {
      setLoading(true);
      const res = await ApiService.getAttentionBudget();
      setBudget(res);
    } catch (err) {
      console.error('Failed to load attention budget:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-indigo-600 text-xs font-bold uppercase tracking-wider mb-1">
            <Compass className="w-4 h-4" />
            <span>Cognitive Load Management</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-heading">
            Attention Budget
          </h1>
          <p className="text-sm text-slate-500 mt-1 max-w-2xl">
            Tackle email exhaustion. Instead of wading through 50 notifications, CampusPulse partitions communications into 3 priority attention tiers so you only focus on what requires action today.
          </p>
        </div>

        {/* Focus Mode Toggle */}
        <button
          onClick={() => setFocusMode(!focusMode)}
          className={`px-4 py-2.5 rounded-2xl font-bold text-xs transition-all flex items-center gap-2 shadow-xs cursor-pointer shrink-0 ${
            focusMode 
              ? 'bg-indigo-600 text-white shadow-indigo-200 hover:bg-indigo-700' 
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          {focusMode ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
          <span>{focusMode ? 'Focus Mode (Active)' : 'Show All Communications'}</span>
        </button>
      </div>

      {budget && (
        <div className="space-y-6">
          {/* TIER 1: IMMEDIATE ATTENTION (< 24 HOURS) */}
          <section className="bg-rose-50/50 border border-rose-200 rounded-3xl p-6 sm:p-8 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="w-3.5 h-3.5 rounded-full bg-rose-500 animate-pulse"></span>
                <h2 className="text-base font-extrabold text-rose-950 uppercase tracking-wide">
                  🔴 Immediate Attention: {budget.immediate.count} Items
                </h2>
              </div>
              <span className="text-xs font-bold text-rose-700 bg-rose-100 px-2.5 py-0.5 rounded-full">
                Action Required Today
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {budget.immediate.items.map(item => (
                <div 
                  key={item.id}
                  className="bg-white p-4 rounded-2xl border border-rose-100 shadow-xs flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between text-[11px] mb-1.5 font-bold">
                      <span className="text-rose-600 uppercase">{item.category}</span>
                      <span className="text-rose-700 bg-rose-50 px-2 py-0.5 rounded">{item.deadline || 'Today'}</span>
                    </div>
                    <h3 className="text-sm font-bold text-slate-900">{item.title}</h3>
                    <p className="text-xs text-slate-600 mt-1">{item.reason}</p>
                  </div>
                  <div className="mt-3 pt-2 border-t border-slate-100 flex justify-end">
                    <button
                      onClick={() => openEmailById(item.id)}
                      className="text-xs font-bold text-rose-600 hover:text-rose-800 flex items-center gap-1 cursor-pointer"
                    >
                      <span>Act Now</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* TIER 2: ACTION THIS WEEK (2-7 DAYS) */}
          <section className="bg-amber-50/50 border border-amber-200 rounded-3xl p-6 sm:p-8 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="w-3.5 h-3.5 rounded-full bg-amber-500"></span>
                <h2 className="text-base font-extrabold text-amber-950 uppercase tracking-wide">
                  🟠 Action This Week: {budget.thisWeek.count} Items
                </h2>
              </div>
              <span className="text-xs font-bold text-amber-700 bg-amber-100 px-2.5 py-0.5 rounded-full">
                Target Within 7 Days
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
              {budget.thisWeek.items.map(item => (
                <div 
                  key={item.id}
                  className="bg-white p-4 rounded-2xl border border-amber-100 shadow-xs flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between text-[11px] mb-1.5 font-bold">
                      <span className="text-amber-600 uppercase">{item.category}</span>
                      <span className="text-slate-500 font-semibold">{item.deadline || 'This Week'}</span>
                    </div>
                    <h3 className="text-xs font-bold text-slate-900 line-clamp-2">{item.title}</h3>
                  </div>
                  <div className="mt-3 pt-2 border-t border-slate-100 flex justify-end">
                    <button
                      onClick={() => openEmailById(item.id)}
                      className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 cursor-pointer"
                    >
                      View Notice
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* TIER 3: INFORMATIONAL UPDATES (HIDDEN IN FOCUS MODE) */}
          {!focusMode && (
            <section className="bg-blue-50/50 border border-blue-200 rounded-3xl p-6 sm:p-8 space-y-4 animate-in fade-in duration-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="w-3.5 h-3.5 rounded-full bg-blue-500"></span>
                  <h2 className="text-base font-extrabold text-blue-950 uppercase tracking-wide">
                    🔵 Informational Notices: {budget.informational.count} Items
                  </h2>
                </div>
                <span className="text-xs font-bold text-blue-700 bg-blue-100 px-2.5 py-0.5 rounded-full">
                  Routine Reading
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                {budget.informational.items.map(item => (
                  <div 
                    key={item.id}
                    className="bg-white p-3.5 rounded-2xl border border-blue-100 shadow-xs flex flex-col justify-between"
                  >
                    <div>
                      <span className="text-[10px] font-bold text-blue-600 uppercase block mb-1">{item.category}</span>
                      <h4 className="text-xs font-semibold text-slate-800 line-clamp-2">{item.title}</h4>
                    </div>
                    <button
                      onClick={() => openEmailById(item.id)}
                      className="mt-2 text-[10px] font-bold text-slate-400 hover:text-slate-600 text-right cursor-pointer"
                    >
                      Read
                    </button>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
};
