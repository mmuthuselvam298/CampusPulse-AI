import React, { useState, useEffect } from 'react';
import { 
  AlertTriangle, 
  Calendar, 
  Mail, 
  CheckCircle2, 
  HelpCircle, 
  ShieldAlert, 
  Clock, 
  ExternalLink,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { InformationConflict } from '../../types';
import { ApiService } from '../../services/api';
import { useApp } from '../../context/AppContext';

export const ConflictDetectorPage: React.FC = () => {
  const { setCurrentTab, openEmailById } = useApp();
  const [conflicts, setConflicts] = useState<InformationConflict[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadConflicts();
  }, []);

  const loadConflicts = async () => {
    try {
      setLoading(true);
      const res = await ApiService.getConflicts();
      setConflicts(res);
    } catch (err) {
      console.error('Failed to load conflicts:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Flagship Header Banner */}
      <div className="bg-gradient-to-r from-amber-950 via-slate-900 to-slate-900 p-8 rounded-3xl text-white border border-amber-500/30 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/30 text-amber-300 text-xs font-semibold uppercase tracking-wider mb-3">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
            Flagship PS02 Architecture · Cross-System Contradictions
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight font-heading">
            Cross-System Information Conflict Detector
          </h1>
          <p className="mt-2 text-sm text-slate-300 leading-relaxed">
            When university communications conflict with Google Calendar bookings or Classroom instructions, CampusPulse cross-references source timestamps and latest circulars to synthesize verified truth.
          </p>
        </div>
      </div>

      {/* Discrepancy Cards List */}
      <div className="space-y-5">
        {conflicts.map((conflict) => (
          <div 
            key={conflict.id}
            className="bg-white rounded-3xl border border-slate-200/90 shadow-xs hover:shadow-md transition-all p-6 sm:p-8"
          >
            {/* Top row */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4 mb-6">
              <div>
                <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200 uppercase tracking-wider">
                  ⚠️ {conflict.field} CONTRADICTION DETECTED
                </span>
                <h2 className="text-xl font-bold text-slate-900 mt-1.5">
                  {conflict.eventTitle}
                </h2>
              </div>
              <div className="text-right shrink-0">
                <span className="text-xs font-medium text-slate-400">
                  Detected: {new Date(conflict.detectedAt).toLocaleDateString()}
                </span>
              </div>
            </div>

            {/* Side-by-Side Contradicting Sources */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {/* Source A */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-red-500" />
                    <span className="text-xs font-bold text-slate-800 uppercase">
                      Source A: {conflict.sourceA.sourceName}
                    </span>
                  </div>
                  {conflict.sourceA.recordId && (
                    <button
                      onClick={() => openEmailById(conflict.sourceA.recordId)}
                      className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
                    >
                      <span>View Message</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  )}
                </div>
                <div className="text-base font-extrabold text-slate-900 mb-1">
                  "{conflict.sourceA.value}"
                </div>
                <p className="text-xs text-slate-600 italic bg-white p-2.5 rounded-xl border border-slate-100">
                  "{conflict.sourceA.excerpt}"
                </p>
              </div>

              {/* Source B */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-blue-500" />
                    <span className="text-xs font-bold text-slate-800 uppercase">
                      Source B: {conflict.sourceB.sourceName}
                    </span>
                  </div>
                  <button
                    onClick={() => setCurrentTab('calendar')}
                    className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
                  >
                    <span>View Calendar</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
                <div className="text-base font-extrabold text-slate-900 mb-1">
                  "{conflict.sourceB.value}"
                </div>
                <p className="text-xs text-slate-600 italic bg-white p-2.5 rounded-xl border border-slate-100">
                  "{conflict.sourceB.excerpt}"
                </p>
              </div>
            </div>

            {/* Evidence-Based Resolution Banner */}
            <div className={`p-4 rounded-2xl border mb-6 ${
              conflict.hasAuthoritativeResolution 
                ? 'bg-emerald-50/80 border-emerald-200 text-emerald-950'
                : 'bg-amber-50/80 border-amber-200 text-amber-950'
            }`}>
              <div className="flex items-start gap-3">
                {conflict.hasAuthoritativeResolution ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <HelpCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                )}
                <div>
                  <h4 className="text-xs font-extrabold uppercase tracking-wide">
                    {conflict.hasAuthoritativeResolution ? 'CURRENT KNOWN STATE (EVIDENCE-SUPPORTED)' : 'UNDETERMINED STATE'}
                  </h4>
                  <p className="text-sm font-bold mt-0.5">
                    {conflict.currentKnownState}
                  </p>
                  <p className="text-xs mt-1 text-slate-700 leading-relaxed">
                    {conflict.resolutionExplanation}
                  </p>
                </div>
              </div>
            </div>

            {/* Action Bar */}
            <div className="pt-2 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                {conflict.sourceA.recordId && (
                  <button
                    onClick={() => openEmailById(conflict.sourceA.recordId)}
                    className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <Mail className="w-3.5 h-3.5 text-slate-500" />
                    <span>View Sources</span>
                  </button>
                )}
                <button
                  onClick={() => setCurrentTab('truth-resolution')}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <ShieldAlert className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Truth Resolution View</span>
                </button>
              </div>

              <button
                onClick={() => setCurrentTab('calendar')}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition-all shadow-xs flex items-center gap-2 cursor-pointer"
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>Review Google Calendar</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
