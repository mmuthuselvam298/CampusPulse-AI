import React, { useState, useEffect } from 'react';
import { 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  ShieldAlert, 
  BookOpen, 
  Mail, 
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { DeadlineRiskItem } from '../../types';
import { ApiService } from '../../services/api';
import { useApp } from '../../context/AppContext';

export const DeadlineRiskPage: React.FC = () => {
  const { setCurrentTab, openEmailById } = useApp();
  const [risks, setRisks] = useState<DeadlineRiskItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRisks();
  }, []);

  const loadRisks = async () => {
    try {
      setLoading(true);
      const res = await ApiService.getDeadlineRisks();
      setRisks(res);
    } catch (err) {
      console.error('Failed to load deadline risks:', err);
    } finally {
      setLoading(false);
    }
  };

  const getRiskBadge = (level: DeadlineRiskItem['riskLevel']) => {
    switch (level) {
      case 'HIGH RISK':
        return { label: 'HIGH RISK', color: 'bg-rose-100 text-rose-700 border-rose-200 animate-pulse' };
      case 'MEDIUM RISK':
        return { label: 'MEDIUM RISK', color: 'bg-amber-100 text-amber-700 border-amber-200' };
      default:
        return { label: 'LOW RISK', color: 'bg-emerald-100 text-emerald-700 border-emerald-200' };
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center gap-2 text-indigo-600 text-xs font-bold uppercase tracking-wider mb-1">
          <Clock className="w-4 h-4" />
          <span>Predictive Assignment Evaluation</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-heading">
          Deadline Risk Detector
        </h1>
        <p className="text-sm text-slate-500 mt-1 max-w-2xl">
          Analyzes upcoming assignment deadlines by combining portal time limits, Google Classroom submission states, reminder frequency, and syllabus weightings to prevent missed marks.
        </p>
      </div>

      {/* Risk Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {risks.map((item) => {
          const badge = getRiskBadge(item.riskLevel);

          return (
            <div 
              key={item.id}
              className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                {/* Header row */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border uppercase tracking-wider ${badge.color}`}>
                    {badge.label} · SCORE {item.riskScore}/100
                  </span>
                  <div className="flex items-center gap-1.5 text-xs text-slate-500">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span className="font-bold text-slate-800">{item.hoursRemaining}h remaining</span>
                  </div>
                </div>

                <h3 className="text-lg font-bold text-slate-900 mb-1">
                  {item.title}
                </h3>
                {item.courseName && (
                  <p className="text-xs text-indigo-600 font-semibold mb-3">
                    {item.courseName}
                  </p>
                )}

                {/* Known Information Grid */}
                <div className="grid grid-cols-2 gap-2 mb-4 text-xs bg-slate-50 p-3 rounded-2xl border border-slate-100">
                  <div>
                    <span className="text-slate-500 block text-[11px]">Due Date:</span>
                    <span className="font-bold text-slate-800">{item.dueDate} ({item.dueTimeFormatted || '23:59'})</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[11px]">Submission State:</span>
                    <span className="font-bold text-slate-800 capitalize">{item.submissionStatus}</span>
                  </div>
                </div>

                {/* Risk Reasons */}
                <div className="space-y-1.5 mb-4">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                    Calculated Risk Factors:
                  </span>
                  {item.riskReasons.map((reason, rIdx) => (
                    <div key={rIdx} className="flex items-start gap-2 text-xs text-slate-700">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0 mt-1.5"></span>
                      <span>{reason}</span>
                    </div>
                  ))}
                </div>

                {/* Suggested Action */}
                <div className="p-3 rounded-2xl bg-indigo-50/70 border border-indigo-100 text-xs">
                  <span className="font-bold text-indigo-900 block mb-0.5">SUGGESTED ACTION</span>
                  <p className="text-indigo-800">{item.suggestedAction}</p>
                </div>
              </div>

              {/* Footer */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-2 mt-4">
                <span className="text-xs text-slate-400 capitalize">
                  Source: {item.sourceType}
                </span>

                {item.sourceType === 'classroom' ? (
                  <button
                    onClick={() => setCurrentTab('classroom')}
                    className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Open in Classroom</span>
                  </button>
                ) : (
                  <button
                    onClick={() => openEmailById(item.sourceId)}
                    className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <Mail className="w-3.5 h-3.5" />
                    <span>View Circular</span>
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
