import React, { useState, useEffect } from 'react';
import { 
  GitCompare, 
  Clock, 
  MapPin, 
  AlertTriangle, 
  Calendar, 
  CheckCircle2, 
  ArrowRight,
  TrendingDown,
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { ScheduleChangeItem } from '../../types';
import { ApiService } from '../../services/api';
import { useApp } from '../../context/AppContext';

export const ChangesRadarPage: React.FC = () => {
  const { setCurrentTab, openEmailById } = useApp();
  const [changes, setChanges] = useState<ScheduleChangeItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadChanges();
  }, []);

  const loadChanges = async () => {
    try {
      setLoading(true);
      const res = await ApiService.getWhatChangedRadar();
      setChanges(res);
    } catch (err) {
      console.error('Failed to load changes:', err);
    } finally {
      setLoading(false);
    }
  };

  const getChangeBadge = (type: ScheduleChangeItem['changeType']) => {
    switch (type) {
      case 'LOCATION':
        return { label: 'ROOM RELOCATION', color: 'bg-indigo-100 text-indigo-700 border-indigo-200' };
      case 'TIMING':
        return { label: 'TIMING ADJUSTMENT', color: 'bg-amber-100 text-amber-700 border-amber-200' };
      case 'DEADLINE':
        return { label: 'DEADLINE SHIFT', color: 'bg-purple-100 text-purple-700 border-purple-200' };
      case 'CANCELLATION':
        return { label: 'POSTPONEMENT / CANCEL', color: 'bg-rose-100 text-rose-700 border-rose-200' };
      default:
        return { label: 'SCHEDULE SHIFT', color: 'bg-slate-100 text-slate-700 border-slate-200' };
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center gap-2 text-indigo-600 text-xs font-bold uppercase tracking-wider mb-1">
          <GitCompare className="w-4 h-4" />
          <span>Real-Time Disruption Monitoring</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-heading">
          What Changed Radar
        </h1>
        <p className="text-sm text-slate-500 mt-1 max-w-2xl">
          Autonomous change detection engine comparing previous university notices against latest circulars. Highlights critical venue shifts, postponed deadlines, and emergency operational adjustments.
        </p>
      </div>

      {/* Grid of Change Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {changes.map((item, idx) => {
          const badge = getChangeBadge(item.changeType);
          const affectsCalendar = item.topic.toLowerCase().includes('robotics') || item.topic.toLowerCase().includes('exam') || item.topic.toLowerCase().includes('startup');

          return (
            <div 
              key={idx}
              className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                {/* Header row */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border uppercase tracking-wider ${badge.color}`}>
                    {badge.label}
                  </span>
                  <span className="text-xs text-slate-400 font-medium">
                    When detected: Today
                  </span>
                </div>

                <h3 className="text-lg font-bold text-slate-900 mb-3">
                  {item.topic}
                </h3>

                {/* BEFORE vs AFTER side-by-side cards */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="p-3 rounded-2xl bg-rose-50/60 border border-rose-100">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-rose-600 block mb-1">
                      BEFORE
                    </span>
                    <span className="text-xs font-medium text-slate-800 line-through decoration-rose-400">
                      {item.previousValue}
                    </span>
                  </div>

                  <div className="p-3 rounded-2xl bg-emerald-50/80 border border-emerald-100">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-700 block mb-1">
                      AFTER (ACTIVE)
                    </span>
                    <span className="text-xs font-bold text-emerald-950">
                      {item.newValue}
                    </span>
                  </div>
                </div>

                {/* Why It Matters */}
                {item.whyItMatters && (
                  <div className="mb-4 p-3 rounded-2xl bg-slate-50 border border-slate-100 text-xs">
                    <span className="font-bold text-slate-800 block mb-0.5">WHY IT MATTERS</span>
                    <p className="text-slate-600 leading-relaxed">{item.whyItMatters}</p>
                  </div>
                )}

                {/* Action instruction */}
                {item.whatYouNeedToDo && (
                  <div className="mb-4 p-3 rounded-2xl bg-indigo-50/70 border border-indigo-100 text-xs flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-indigo-900 block mb-0.5">RECOMMENDED ACTION</span>
                      <p className="text-indigo-800">{item.whatYouNeedToDo}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Footer CTA */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                <button
                  onClick={() => openEmailById(item.emailId)}
                  className="text-xs font-bold text-slate-600 hover:text-indigo-600 transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <span>Source Message</span>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {affectsCalendar ? (
                  <button
                    onClick={() => setCurrentTab('calendar')}
                    className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Review Calendar</span>
                  </button>
                ) : (
                  <button
                    onClick={() => setCurrentTab('actions')}
                    className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>View Actions</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
