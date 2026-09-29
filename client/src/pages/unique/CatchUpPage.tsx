import React, { useState, useEffect } from 'react';
import { 
  Radio, 
  Sparkles, 
  Clock, 
  CheckSquare, 
  GitCompare, 
  AlertTriangle, 
  ArrowRight,
  Calendar
} from 'lucide-react';
import { CatchUpSummary } from '../../types';
import { ApiService } from '../../services/api';
import { useApp } from '../../context/AppContext';

export const CatchUpPage: React.FC = () => {
  const { setCurrentTab, toggleAction } = useApp();
  const [timeframe, setTimeframe] = useState<CatchUpSummary['timeframe']>('since_yesterday');
  const [report, setReport] = useState<CatchUpSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCatchUp(timeframe);
  }, [timeframe]);

  const loadCatchUp = async (tf: CatchUpSummary['timeframe']) => {
    try {
      setLoading(true);
      const res = await ApiService.getCatchUpSummary(tf);
      setReport(res);
    } catch (err) {
      console.error('Failed to load catch up summary:', err);
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
            <Radio className="w-4 h-4" />
            <span>Time-Filtered Intelligence Digest</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-heading">
            What Did I Miss?
          </h1>
          <p className="text-sm text-slate-500 mt-1 max-w-2xl">
            Choose your absence timeframe to generate a noise-filtered catch-up briefing. Highlights only real schedule shifts, critical action items, and new campus opportunities.
          </p>
        </div>

        {/* Timeframe Selector Pills */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1.5 rounded-2xl border border-slate-200 shrink-0">
          {(['today', 'since_yesterday', 'last_3_days', 'last_week'] as const).map(tf => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all capitalize cursor-pointer ${
                timeframe === tf
                  ? 'bg-white text-indigo-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {tf.replace(/_/g, ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Summary KPI Badges */}
      {report && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-5 rounded-3xl bg-rose-50/70 border border-rose-100 flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 flex items-center justify-center text-rose-600 shrink-0">
              <GitCompare className="w-6 h-6" />
            </div>
            <div>
              <span className="text-2xl font-extrabold text-rose-950">{report.counts.importantChanges}</span>
              <span className="text-xs font-bold text-rose-700 block uppercase tracking-wider">Important Changes</span>
            </div>
          </div>

          <div className="p-5 rounded-3xl bg-amber-50/70 border border-amber-100 flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 flex items-center justify-center text-amber-600 shrink-0">
              <CheckSquare className="w-6 h-6" />
            </div>
            <div>
              <span className="text-2xl font-extrabold text-amber-950">{report.counts.newActions}</span>
              <span className="text-xs font-bold text-amber-700 block uppercase tracking-wider">New Action Items</span>
            </div>
          </div>

          <div className="p-5 rounded-3xl bg-blue-50/70 border border-blue-100 flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-100 flex items-center justify-center text-blue-600 shrink-0">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <span className="text-2xl font-extrabold text-blue-950">{report.counts.informationalUpdates}</span>
              <span className="text-xs font-bold text-blue-700 block uppercase tracking-wider">Routine Updates</span>
            </div>
          </div>
        </div>
      )}

      {/* Key Highlights List */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500">
          Critical Changes Since {report?.analyzedSince}
        </h2>

        <div className="space-y-3">
          {report?.highlights.map((item, idx) => (
            <div 
              key={idx}
              className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-start justify-between gap-4"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md uppercase tracking-wider ${
                    item.type === 'CHANGE' ? 'bg-rose-100 text-rose-700' :
                    item.type === 'ACTION' ? 'bg-amber-100 text-amber-700' :
                    'bg-blue-100 text-blue-700'
                  }`}>
                    {item.type}
                  </span>
                  <span className="text-xs font-semibold text-slate-400">{item.sourceType}</span>
                </div>
                <h3 className="text-sm font-bold text-slate-900">{item.title}</h3>
                <p className="text-xs text-slate-600">{item.summary}</p>
              </div>

              <button
                onClick={() => setCurrentTab('changes-radar')}
                className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-bold text-indigo-600 hover:bg-indigo-50 transition-colors shrink-0 cursor-pointer"
              >
                Inspect
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Top Actions to Execute */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500">
          Top Actions to Execute Right Now
        </h2>

        <div className="space-y-2.5">
          {report?.topActions.map((act, idx) => (
            <div
              key={act.id}
              className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200/70 flex items-center justify-between gap-4"
            >
              <div className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold flex items-center justify-center shrink-0">
                  {idx + 1}
                </span>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">{act.title}</h4>
                  <span className="text-[11px] text-slate-500">{act.deadline || 'Pending'} · {act.sourceSender}</span>
                </div>
              </div>

              <button
                onClick={() => toggleAction(act.id)}
                className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-xs transition-colors shrink-0 cursor-pointer"
              >
                Done
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
