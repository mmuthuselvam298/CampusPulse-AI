import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  CheckCircle2, 
  HelpCircle, 
  BookOpen, 
  Mail, 
  ArrowRight,
  ShieldCheck,
  Cpu
} from 'lucide-react';
import { AIDecisionExplanation } from '../../types';
import { ApiService } from '../../services/api';
import { useApp } from '../../context/AppContext';

export const ExplainDecisionPage: React.FC = () => {
  const { openEmailById } = useApp();
  const [selectedId, setSelectedId] = useState<string>('email-srm-003');
  const [explanation, setExplanation] = useState<AIDecisionExplanation | null>(null);
  const [loading, setLoading] = useState(true);

  const sampleDecisions = [
    { id: 'email-srm-003', label: 'CSE 204 Exam Venue Relocation (Critical)' },
    { id: 'email-srm-004', label: 'Attendance Shortage Condonation Warning (High)' },
    { id: 'unified-robotics-workshop', label: 'Robotics Workshop Time Conflict (High)' },
    { id: 'srm-work-213-quiz', label: 'CSE 213 AI Tools Club Quiz (Critical)' }
  ];

  useEffect(() => {
    loadExplanation(selectedId);
  }, [selectedId]);

  const loadExplanation = async (id: string) => {
    try {
      setLoading(true);
      const res = await ApiService.getAIDecisionExplanation(id);
      setExplanation(res);
    } catch (err) {
      console.error('Failed to load explanation:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center gap-2 text-indigo-600 text-xs font-bold uppercase tracking-wider mb-1">
          <Sparkles className="w-4 h-4 text-purple-600" />
          <span>Transparent AI Explainability</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-heading">
          Explain AI Decision
        </h1>
        <p className="text-sm text-slate-500 mt-1 max-w-2xl">
          Auditable AI decision logic. Shows concise, evidence-based citations for every priority score, category classification, and conflict flag without exposing raw chain-of-thought.
        </p>

        {/* Decision Selector Pills */}
        <div className="flex items-center gap-2 mt-5 overflow-x-auto pb-1">
          {sampleDecisions.map(item => (
            <button
              key={item.id}
              onClick={() => setSelectedId(item.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                selectedId === item.id
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Explanation Details */}
      {explanation && (
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
            <div>
              <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-700 border border-purple-200 uppercase tracking-wider">
                {explanation.decisionType} CLASSIFICATION
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mt-2">
                {explanation.itemTitle}
              </h2>
            </div>
            <div className="text-right shrink-0">
              <span className="text-xs text-slate-400 block font-medium">Outcome Rating</span>
              <span className="text-lg font-extrabold text-rose-600">{explanation.outcome}</span>
            </div>
          </div>

          {/* Reasons */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Deterministic Evidence Factors:
            </h3>

            <div className="space-y-2.5">
              {explanation.reasons.map((reason, idx) => (
                <div key={idx} className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-100 text-xs text-slate-800">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span className="leading-relaxed font-medium">{reason}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Supporting Evidence Sources */}
          {explanation.evidenceSources.length > 0 && (
            <div className="space-y-3 pt-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Cited Source Records:
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {explanation.evidenceSources.map((src, idx) => (
                  <div key={idx} className="p-4 rounded-2xl bg-indigo-50/50 border border-indigo-100 text-xs">
                    <div className="flex items-center justify-between font-bold text-indigo-900 mb-1">
                      <span>{src.source}</span>
                      {src.timestamp && <span className="text-[11px] text-indigo-600">{src.timestamp}</span>}
                    </div>
                    <div className="font-semibold text-slate-900 mb-1">{src.title}</div>
                    <p className="text-slate-600 italic">"{src.snippet}"</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
