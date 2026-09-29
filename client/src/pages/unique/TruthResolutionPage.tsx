import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  CheckCircle2, 
  AlertTriangle, 
  HelpCircle, 
  Layers, 
  Mail, 
  Calendar, 
  BookOpen,
  ArrowRight,
  ExternalLink
} from 'lucide-react';
import { TruthResolutionItem } from '../../types';
import { ApiService } from '../../services/api';
import { useApp } from '../../context/AppContext';

export const TruthResolutionPage: React.FC = () => {
  const { setCurrentTab } = useApp();
  const [selectedEventId, setSelectedEventId] = useState<string>('unified-robotics-workshop');
  const [truth, setTruth] = useState<TruthResolutionItem | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTruth(selectedEventId);
  }, [selectedEventId]);

  const loadTruth = async (id: string) => {
    try {
      setLoading(true);
      const res = await ApiService.getTruthResolution(id);
      setTruth(res);
    } catch (err) {
      console.error('Failed to load truth resolution:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: TruthResolutionItem['overallStatus']) => {
    switch (status) {
      case 'Confirmed':
        return { label: 'CONFIRMED TRUTH', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' };
      case 'Supported':
        return { label: 'SUPPORTED BY EVIDENCE', color: 'bg-indigo-100 text-indigo-800 border-indigo-200' };
      case 'Conflicting':
        return { label: 'CONFLICTING CLAIMS', color: 'bg-amber-100 text-amber-800 border-amber-300' };
      default:
        return { label: 'UNKNOWN / UNVERIFIED', color: 'bg-slate-100 text-slate-700 border-slate-200' };
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center gap-2 text-indigo-600 text-xs font-bold uppercase tracking-wider mb-1">
          <ShieldCheck className="w-4 h-4" />
          <span>Cross-Source Truth Synthesis</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-heading">
          Information Truth / Resolution View
        </h1>
        <p className="text-sm text-slate-500 mt-1 max-w-2xl">
          Deconstructs critical university events into verified discrete facts. Never invents certainty: every title, timing, and room number is tagged as Confirmed, Supported, or Conflicting with cited source trails.
        </p>

        {/* Event Selector Pill Tabs */}
        <div className="flex items-center gap-2 mt-5 overflow-x-auto pb-1">
          {[
            { id: 'unified-robotics-workshop', label: 'Robotics Workshop (IIT Bombay)' },
            { id: 'unified-cse204-exam', label: 'CSE 204 Algorithms Exam' },
            { id: 'unified-cse213-quiz', label: 'CSE 213 AI Tools Quiz' },
            { id: 'unified-rain-closure', label: 'Rain Closure & Working Day' }
          ].map(item => (
            <button
              key={item.id}
              onClick={() => setSelectedEventId(item.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                selectedEventId === item.id
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Truth Card */}
      {truth && (
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-8 space-y-6">
          {/* Header Summary */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border uppercase tracking-wider ${getStatusBadge(truth.overallStatus).color}`}>
                  {getStatusBadge(truth.overallStatus).label}
                </span>
                <span className="text-xs text-slate-400 font-medium">
                  Verified: {new Date(truth.lastVerifiedAt).toLocaleDateString()}
                </span>
              </div>
              <h2 className="text-2xl font-bold text-slate-900">
                {truth.title}
              </h2>
            </div>

            {/* Sources Checked Chips */}
            <div className="flex items-center gap-2 shrink-0 bg-slate-50 p-2.5 rounded-2xl border border-slate-100 text-xs">
              <span className="font-semibold text-slate-600 text-[11px] mr-1">Sources Audited:</span>
              <span className={`px-2 py-0.5 rounded-md font-bold text-[11px] flex items-center gap-1 ${truth.sourcesCovered.gmail ? 'bg-red-100 text-red-700' : 'bg-slate-200 text-slate-400'}`}>
                <Mail className="w-3 h-3" /> Gmail
              </span>
              <span className={`px-2 py-0.5 rounded-md font-bold text-[11px] flex items-center gap-1 ${truth.sourcesCovered.classroom ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-400'}`}>
                <BookOpen className="w-3 h-3" /> Classroom
              </span>
              <span className={`px-2 py-0.5 rounded-md font-bold text-[11px] flex items-center gap-1 ${truth.sourcesCovered.calendar ? 'bg-blue-100 text-blue-700' : 'bg-slate-200 text-slate-400'}`}>
                <Calendar className="w-3 h-3" /> Calendar
              </span>
            </div>
          </div>

          {/* Discrete Field Breakdown Table */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Discrete Fact Fields & Supporting Evidence
            </h3>

            <div className="grid grid-cols-1 gap-4">
              {truth.fields.map((f, idx) => {
                const isConflict = f.status === 'Conflicting';
                const isConfirmed = f.status === 'Confirmed';

                return (
                  <div 
                    key={idx}
                    className={`p-4 sm:p-5 rounded-2xl border transition-all ${
                      isConflict 
                        ? 'bg-amber-50/50 border-amber-200 shadow-xs' 
                        : isConfirmed 
                        ? 'bg-emerald-50/30 border-emerald-100'
                        : 'bg-slate-50/60 border-slate-200/80'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-xs text-slate-500 uppercase tracking-wide w-20">
                          {f.field}:
                        </span>
                        <span className="text-base font-extrabold text-slate-900">
                          {f.value}
                        </span>
                      </div>

                      <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border uppercase tracking-wider w-fit ${
                        isConflict ? 'bg-amber-100 text-amber-800 border-amber-300' :
                        isConfirmed ? 'bg-emerald-100 text-emerald-800 border-emerald-200' :
                        'bg-slate-100 text-slate-700 border-slate-200'
                      }`}>
                        {f.status}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 mb-3 pl-0 sm:pl-22">
                      {f.authoritativeReason}
                    </p>

                    {/* Source Evidence Pills */}
                    <div className="flex flex-wrap gap-2 pl-0 sm:pl-22">
                      {f.sources.map((src, sIdx) => (
                        <div key={sIdx} className="text-[11px] bg-white border border-slate-200 px-3 py-1 rounded-xl text-slate-700 shadow-xs">
                          <span className="font-bold text-slate-900 mr-1.5">{src.source}:</span>
                          <span>"{src.value}"</span>
                          <span className="text-slate-400 mx-1">·</span>
                          <span className="text-slate-500 italic">{src.evidence}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Footer Action */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-500">
              Confidence levels calculated autonomously across university records.
            </span>
            <button
              onClick={() => setCurrentTab('conflicts')}
              className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <span>View Conflict Detector</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
