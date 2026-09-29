import React, { useState, useEffect } from 'react';
import { 
  LayoutGrid, 
  AlertTriangle, 
  GitCompare, 
  Clock, 
  Award, 
  CheckSquare, 
  Calendar, 
  Sparkles, 
  ArrowRight,
  TrendingUp,
  ShieldAlert,
  Compass
} from 'lucide-react';
import { 
  AttentionBudgetData, 
  DeadlineRiskItem, 
  InformationConflict, 
  ScheduleChangeItem,
  OpportunityItem,
  ActionItem,
  UnifiedEvent
} from '../../types';
import { ApiService } from '../../services/api';
import { useApp } from '../../context/AppContext';

export const CommandCenterPage: React.FC = () => {
  const { setCurrentTab, toggleAction, openEmailById } = useApp();
  const [budget, setBudget] = useState<AttentionBudgetData | null>(null);
  const [risks, setRisks] = useState<DeadlineRiskItem[]>([]);
  const [conflicts, setConflicts] = useState<InformationConflict[]>([]);
  const [changes, setChanges] = useState<ScheduleChangeItem[]>([]);
  const [opportunities, setOpportunities] = useState<OpportunityItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    try {
      setLoading(true);
      const [b, r, c, ch, opp] = await Promise.all([
        ApiService.getAttentionBudget(),
        ApiService.getDeadlineRisks(),
        ApiService.getConflicts(),
        ApiService.getWhatChangedRadar(),
        ApiService.getOpportunities()
      ]);
      setBudget(b);
      setRisks(r);
      setConflicts(c);
      setChanges(ch);
      setOpportunities(opp);
    } catch (err) {
      console.error('Failed to load command center data:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Cockpit Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-8 rounded-3xl text-white border border-indigo-500/30 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-semibold uppercase tracking-wider mb-3">
            <LayoutGrid className="w-3.5 h-3.5 text-indigo-400" />
            Consolidated Student Intelligence Cockpit
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight font-heading">
            Student Command Center
          </h1>
          <p className="mt-2 text-sm text-slate-300 max-w-xl leading-relaxed">
            Real-time synthesis uniting immediate attention tasks, cross-system contradictions, deadline risks, and technical opportunities into one focused mission dashboard.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <button
            onClick={() => setCurrentTab('chaos-simulator')}
            className="px-4 py-2.5 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition-all shadow-md shadow-rose-600/30 cursor-pointer"
          >
            Chaos Simulator
          </button>
          <button
            onClick={() => setCurrentTab('knowledge-graph')}
            className="px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-xs transition-all cursor-pointer"
          >
            Knowledge Graph
          </button>
        </div>
      </div>

      {/* High-Impact Alert Bar: Cross-System Conflicts */}
      {conflicts.length > 0 && (
        <div className="bg-amber-500/10 border-2 border-amber-500/40 rounded-3xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500 flex items-center justify-center text-white shrink-0 shadow-sm">
              <AlertTriangle className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-amber-950">
                {conflicts.length} Cross-System Contradiction{conflicts.length > 1 ? 's' : ''} Detected
              </h3>
              <p className="text-xs text-amber-800 mt-0.5">
                {conflicts[0].eventTitle}: {conflicts[0].currentKnownState}
              </p>
            </div>
          </div>

          <button
            onClick={() => setCurrentTab('conflicts')}
            className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs transition-colors shrink-0 cursor-pointer shadow-xs"
          >
            Review Discrepancy
          </button>
        </div>
      )}

      {/* Main Command Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Attention Budget & Deadline Risk (2 Columns wide on lg) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Section 1: Immediate Attention Budget */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Compass className="w-4 h-4 text-rose-500" />
                <h2 className="text-sm font-extrabold uppercase tracking-wider text-slate-900">
                  Immediate Attention (Next 24 Hours)
                </h2>
              </div>
              <button
                onClick={() => setCurrentTab('attention-budget')}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-800 cursor-pointer"
              >
                Full Budget →
              </button>
            </div>

            <div className="space-y-3">
              {budget?.immediate.items.slice(0, 4).map(item => (
                <div 
                  key={item.id}
                  className="p-4 rounded-2xl bg-rose-50/40 border border-rose-100 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-bold text-rose-600 uppercase">{item.category} · {item.deadline || 'Today'}</span>
                    <h3 className="font-bold text-slate-900 text-sm">{item.title}</h3>
                    <p className="text-slate-500">{item.reason}</p>
                  </div>
                  <button
                    onClick={() => openEmailById(item.id)}
                    className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shrink-0 cursor-pointer shadow-xs"
                  >
                    Act
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Section 2: Deadline Risk Radar */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-purple-600" />
                <h2 className="text-sm font-extrabold uppercase tracking-wider text-slate-900">
                  Approaching Coursework Risks
                </h2>
              </div>
              <button
                onClick={() => setCurrentTab('deadline-risk')}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-800 cursor-pointer"
              >
                All Risks →
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {risks.slice(0, 4).map(r => (
                <div key={r.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col justify-between text-xs">
                  <div>
                    <div className="flex items-center justify-between text-[11px] mb-1 font-bold">
                      <span className="text-indigo-600">{r.courseName}</span>
                      <span className="text-rose-600 font-extrabold">{r.riskLevel}</span>
                    </div>
                    <h4 className="font-bold text-slate-900">{r.title}</h4>
                    <p className="text-slate-500 text-[11px] mt-1">Due {r.dueDate} · {r.hoursRemaining}h left</p>
                  </div>
                  <div className="mt-3 pt-2 border-t border-slate-200/60 flex justify-end">
                    <button
                      onClick={() => setCurrentTab('classroom')}
                      className="text-xs font-bold text-indigo-600 hover:text-indigo-800 cursor-pointer"
                    >
                      Classroom Portal
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Disruptions & Matched Opportunities */}
        <div className="space-y-6">
          {/* Section 3: What Changed Radar Highlights */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <GitCompare className="w-4 h-4 text-emerald-600" />
                <h2 className="text-sm font-extrabold uppercase tracking-wider text-slate-900">
                  Schedule Shifts
                </h2>
              </div>
              <button
                onClick={() => setCurrentTab('changes-radar')}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-800 cursor-pointer"
              >
                View All →
              </button>
            </div>

            <div className="space-y-3">
              {changes.slice(0, 3).map((ch, idx) => (
                <div key={idx} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 text-xs space-y-1">
                  <div className="flex items-center justify-between text-[10px] font-bold text-slate-400">
                    <span className="uppercase text-indigo-600">{ch.changeType}</span>
                    <span>Today</span>
                  </div>
                  <h4 className="font-bold text-slate-900">{ch.topic}</h4>
                  <div className="text-[11px] text-emerald-700 font-semibold">{ch.newValue}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 4: Opportunities Preview */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-500" />
                <h2 className="text-sm font-extrabold uppercase tracking-wider text-slate-900">
                  Recommended Opportunities
                </h2>
              </div>
              <button
                onClick={() => setCurrentTab('opportunities')}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-800 cursor-pointer"
              >
                Explore →
              </button>
            </div>

            <div className="space-y-3">
              {opportunities.slice(0, 3).map(opp => (
                <div key={opp.id} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 text-xs space-y-1">
                  <div className="flex items-center justify-between text-[10px] font-bold">
                    <span className="text-purple-600 uppercase">{opp.type}</span>
                    <span className="text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded font-extrabold">{opp.relevanceScore}% Match</span>
                  </div>
                  <h4 className="font-bold text-slate-900 line-clamp-1">{opp.title}</h4>
                  <p className="text-[11px] text-slate-500">{opp.organizer}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
