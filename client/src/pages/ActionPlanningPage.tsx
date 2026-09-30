import React, { useState, useEffect } from 'react';
import { 
  CheckSquare, 
  CalendarDays, 
  Clock, 
  Compass, 
  Sparkles, 
  AlertTriangle, 
  Plus, 
  CheckCircle2, 
  ExternalLink,
  Flame
} from 'lucide-react';
import { ApiService } from '../services/api';
import { useApp } from '../context/AppContext';
import { 
  AttentionBudgetData, 
  DeadlineRiskItem, 
  AICalendarPlan 
} from '../types';

export const ActionPlanningPage: React.FC = () => {
  const { actions, toggleAction, openEmailById, setCurrentTab, addToast } = useApp();
  const [activeTab, setActiveTab] = useState<'attention' | 'planner' | 'risks' | 'tasks'>('attention');
  const [budget, setBudget] = useState<AttentionBudgetData | null>(null);
  const [risks, setRisks] = useState<DeadlineRiskItem[]>([]);
  const [calendarPlan, setCalendarPlan] = useState<AICalendarPlan | null>(null);
  const [isPlanning, setIsPlanning] = useState(false);
  const [filterPriority, setFilterPriority] = useState<string>('ALL');

  useEffect(() => {
    loadPlanningData();
  }, []);

  const loadPlanningData = async () => {
    try {
      const [budgetRes, risksRes, planRes] = await Promise.all([
        ApiService.getAttentionBudget(),
        ApiService.getDeadlineRisks(),
        ApiService.getCalendarPlan('2026-09-30')
      ]);
      setBudget(budgetRes);
      setRisks(risksRes);
      setCalendarPlan(planRes);
    } catch (err) {
      console.error('Failed to load action planning data:', err);
    }
  };

  const handleOrganizeDay = async () => {
    setIsPlanning(true);
    try {
      const plan = await ApiService.getCalendarPlan('2026-09-30');
      setCalendarPlan(plan);
      addToast({
        title: "✨ Schedule Optimized",
        message: `Plan generated with ${plan.schedule.length} optimized focus slots.`,
        priority: "LOW"
      });
    } finally {
      setIsPlanning(false);
    }
  };

  const handleAddSlotToCalendar = async (slot: any) => {
    try {
      const result = await ApiService.createCalendarEvent({
        title: slot.title,
        startTime: `2026-09-30T${slot.startTime}:00.000Z`,
        endTime: `2026-09-30T${slot.endTime}:00.000Z`,
        location: slot.location
      });
      if (result.success) {
        addToast({
          title: "📅 Added to Calendar",
          message: `${slot.title} added successfully.`,
          priority: "LOW"
        });
        loadPlanningData();
      }
    } catch (err) {
      addToast({
        title: "❌ Failed",
        message: "Could not add event to Google Calendar.",
        priority: "HIGH"
      });
    }
  };

  const filteredActions = actions.filter(a => {
    if (filterPriority === 'ALL') return true;
    if (filterPriority === 'COMPLETED') return a.completed;
    if (filterPriority === 'PENDING') return !a.completed;
    return a.priority === filterPriority;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 animate-in fade-in duration-200">
      {/* Hero Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl bg-gradient-to-r from-emerald-950 via-slate-900 to-slate-900 text-white shadow-xl border border-emerald-800/40 relative overflow-hidden">
        <div className="relative z-10 space-y-1.5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-xs font-semibold">
            <Compass className="w-3.5 h-3.5" />
            <span>Attention & Schedule Intelligence</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-heading">
            Action & Planning
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
            Protecting student focus by dividing notifications into cognitive buckets, ranking assignment deadline risks, and offering conflict-free day planning.
          </p>
        </div>

        {/* View Switcher Tabs */}
        <div className="relative z-10 flex flex-wrap gap-1.5 bg-white/10 backdrop-blur-md p-1.5 rounded-2xl border border-white/15 self-start md:self-auto">
          {[
            { id: 'attention', label: "Today's Attention" },
            { id: 'planner', label: 'AI Day Planner' },
            { id: 'risks', label: `Deadline Risks (${risks.length})` },
            { id: 'tasks', label: `All Tasks (${actions.length})` }
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-md scale-102'
                    : 'text-slate-300 hover:text-white hover:bg-white/10'
                }`}
              >
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* SECTION 1: ATTENTION BUDGET */}
      {activeTab === 'attention' && budget && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Immediate Attention Bucket */}
            <div className="p-6 rounded-3xl bg-white border border-red-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-red-100">
                <div className="flex items-center gap-2">
                  <Flame className="w-5 h-5 text-red-500" />
                  <h3 className="text-sm font-extrabold text-slate-900 font-heading">
                    Immediate Attention
                  </h3>
                </div>
                <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-700">
                  {budget.immediate.count}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Critical university deadlines and immediate action requirements.
              </p>

              <div className="space-y-2.5">
                {budget.immediate.items.map((item, idx) => (
                  <div
                    key={idx}
                    onClick={() => item.id && openEmailById(item.id)}
                    className="p-3 rounded-xl bg-red-50/50 hover:bg-red-50 border border-red-100 transition-all cursor-pointer space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900 truncate max-w-[200px]">{item.title}</span>
                      <span className="text-[10px] font-bold text-red-600">{item.priority}</span>
                    </div>
                    <p className="text-[11px] text-slate-600 line-clamp-1">{item.reason}</p>
                    {item.deadline && (
                      <span className="text-[10px] font-medium text-slate-400 block">⏰ {item.deadline}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* This Week Bucket */}
            <div className="p-6 rounded-3xl bg-white border border-amber-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-amber-100">
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-amber-500" />
                  <h3 className="text-sm font-extrabold text-slate-900 font-heading">
                    Action This Week
                  </h3>
                </div>
                <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-700">
                  {budget.thisWeek.count}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Scheduled lab tasks, quizzes, and assignments due within 7 days.
              </p>

              <div className="space-y-2.5">
                {budget.thisWeek.items.map((item, idx) => (
                  <div
                    key={idx}
                    onClick={() => item.id && openEmailById(item.id)}
                    className="p-3 rounded-xl bg-amber-50/40 hover:bg-amber-50 border border-amber-100 transition-all cursor-pointer space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900 truncate max-w-[200px]">{item.title}</span>
                      <span className="text-[10px] font-bold text-amber-600">This Week</span>
                    </div>
                    <p className="text-[11px] text-slate-600 line-clamp-1">{item.reason}</p>
                    {item.deadline && (
                      <span className="text-[10px] font-medium text-slate-400 block">⏰ {item.deadline}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Informational Bucket */}
            <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Compass className="w-5 h-5 text-blue-500" />
                  <h3 className="text-sm font-extrabold text-slate-900 font-heading">
                    Informational Only
                  </h3>
                </div>
                <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700">
                  {budget.informational.count}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Campus circulars, hostel advisories, and student club notices.
              </p>

              <div className="space-y-2.5">
                {budget.informational.items.map((item, idx) => (
                  <div
                    key={idx}
                    onClick={() => item.id && openEmailById(item.id)}
                    className="p-3 rounded-xl bg-slate-50 hover:bg-slate-100/70 border border-slate-100 transition-all cursor-pointer space-y-1"
                  >
                    <span className="text-xs font-semibold text-slate-800 line-clamp-1">{item.title}</span>
                    <span className="text-[10px] text-slate-400">{item.category}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 2: AI CALENDAR PLANNER */}
      {activeTab === 'planner' && calendarPlan && (
        <div className="p-6 rounded-3xl bg-white border border-[#E7EAF3] shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 font-heading flex items-center gap-2">
                <CalendarDays className="w-4 h-4 text-indigo-600" />
                <span>AI Calendar Planner (Day Optimizer)</span>
              </h3>
              <p className="text-xs text-slate-500">
                Assembles university class slots, workshop deadlines, and study blocks without silent additions.
              </p>
            </div>

            <button
              onClick={handleOrganizeDay}
              disabled={isPlanning}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-200" />
              <span>{isPlanning ? 'Organizing Day...' : 'Organize My Day'}</span>
            </button>
          </div>

          <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-100 flex items-center justify-between text-xs">
            <span className="font-semibold text-indigo-900">
              Productivity Score: <span className="font-extrabold text-indigo-700">{calendarPlan.productivityScore}%</span>
            </span>
            <span className="text-slate-500 font-medium">
              Target Date: Wednesday, Sep 30, 2026
            </span>
          </div>

          <div className="divide-y divide-slate-100">
            {calendarPlan.schedule.map((slot, i) => (
              <div key={i} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="font-mono text-xs font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-lg">
                    {slot.startTime} – {slot.endTime}
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-slate-900">{slot.title}</h5>
                    <p className="text-[11px] text-slate-500">{slot.location || 'Campus'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto">
                  {slot.isAlreadyInCalendar ? (
                    <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>On Calendar</span>
                    </span>
                  ) : (
                    <button
                      onClick={() => handleAddSlotToCalendar(slot)}
                      className="flex items-center gap-1 text-[11px] font-bold text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-3 py-1 rounded-lg transition-all cursor-pointer"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Confirm & Add to Calendar</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECTION 3: DEADLINE RISK DETECTOR */}
      {activeTab === 'risks' && (
        <div className="p-6 rounded-3xl bg-white border border-[#E7EAF3] shadow-xs space-y-4">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 font-heading flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-500" />
              <span>Approaching Deadline Risks</span>
            </h3>
            <p className="text-xs text-slate-500">
              Evaluated based on days remaining, submission status, weight, and course requirements.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {risks.map((risk) => (
              <div
                key={risk.id}
                className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-red-300 shadow-xs space-y-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      {risk.sourceType}
                    </span>
                    <h4 className="text-sm font-bold text-slate-900">{risk.title}</h4>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold ${
                    risk.riskLevel === 'HIGH RISK' ? 'bg-red-100 text-red-700' :
                    risk.riskLevel === 'MEDIUM RISK' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-700'
                  }`}>
                    {risk.riskLevel} · Score {risk.riskScore}
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs space-y-1">
                  <div className="flex justify-between text-slate-600">
                    <span>Deadline:</span>
                    <span className="font-semibold text-slate-900">{risk.dueDate} ({Math.max(0, Math.round(risk.hoursRemaining / 24))}d left)</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Submission Status:</span>
                    <span className="font-semibold text-slate-900">{risk.submissionStatus}</span>
                  </div>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">
                  {risk.riskReasons ? risk.riskReasons.join(' ') : 'Approaching academic deadline requiring review.'}
                </p>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-indigo-700 font-semibold text-[11px]">
                    💡 {risk.suggestedAction}
                  </span>
                  {risk.sourceId && (
                    <button
                      onClick={() => openEmailById(risk.sourceId)}
                      className="text-indigo-600 hover:underline font-bold text-[11px]"
                    >
                      View Notice
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECTION 4: TASK LIST */}
      {activeTab === 'tasks' && (
        <div className="p-6 rounded-3xl bg-white border border-[#E7EAF3] shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 font-heading">
                All Extracted Actions ({filteredActions.length})
              </h3>
              <p className="text-xs text-slate-500">
                Actionable student items extracted from official announcements and assignments.
              </p>
            </div>

            <div className="flex gap-1">
              {['ALL', 'CRITICAL', 'HIGH', 'PENDING', 'COMPLETED'].map((p) => (
                <button
                  key={p}
                  onClick={() => setFilterPriority(p)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer ${
                    filterPriority === p
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          <div className="divide-y divide-slate-100">
            {filteredActions.map((action) => (
              <div
                key={action.id}
                className="py-3 flex items-center justify-between gap-3 group"
              >
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => toggleAction(action.id)}
                    className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all cursor-pointer ${
                      action.completed
                        ? 'bg-emerald-600 border-emerald-600 text-white'
                        : 'border-slate-300 hover:border-indigo-500'
                    }`}
                  >
                    {action.completed && <CheckCircle2 className="w-3.5 h-3.5" />}
                  </button>
                  <div>
                    <h5 className={`text-xs font-bold ${
                      action.completed ? 'text-slate-400 line-through' : 'text-slate-800'
                    }`}>
                      {action.title}
                    </h5>
                    <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                      <span>⏰ {action.deadline || 'No deadline'}</span>
                      {action.location && <span>· 📍 {action.location}</span>}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    action.priority === 'CRITICAL' ? 'bg-red-100 text-red-700' :
                    action.priority === 'HIGH' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-700'
                  }`}>
                    {action.priority}
                  </span>
                  {action.emailId && (
                    <button
                      onClick={() => openEmailById(action.emailId)}
                      className="p-1.5 text-slate-400 hover:text-indigo-600 rounded cursor-pointer"
                      title="View source email"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
