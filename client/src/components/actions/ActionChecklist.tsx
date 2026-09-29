import React, { useState } from 'react';
import {
  CheckSquare,
  Square,
  Clock,
  MapPin,
  ExternalLink,
  Plus,
  AlertCircle,
  Sparkles,
  Calendar,
  HelpCircle,
  ShieldAlert,
  ChevronDown,
  ChevronUp,
  Loader2
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useApp } from '../../context/AppContext';
import { ActionItem, ConsequenceAnalysis } from '../../types';
import { ApiService } from '../../services/api';

export const ActionChecklist: React.FC = () => {
  const { actions, toggleAction, openEmailById } = useApp();
  const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'COMPLETED'>('PENDING');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDeadline, setNewDeadline] = useState('');
  const [consequenceMap, setConsequenceMap] = useState<Record<string, ConsequenceAnalysis>>({});
  const [expandedConsequence, setExpandedConsequence] = useState<Record<string, boolean>>({});
  const [loadingConsequence, setLoadingConsequence] = useState<Record<string, boolean>>({});

  const handleFetchConsequence = async (actionId: string) => {
    if (expandedConsequence[actionId]) {
      setExpandedConsequence(prev => ({ ...prev, [actionId]: false }));
      return;
    }

    if (consequenceMap[actionId]) {
      setExpandedConsequence(prev => ({ ...prev, [actionId]: true }));
      return;
    }

    setLoadingConsequence(prev => ({ ...prev, [actionId]: true }));
    try {
      const data = await ApiService.getConsequence(actionId);
      setConsequenceMap(prev => ({ ...prev, [actionId]: data }));
      setExpandedConsequence(prev => ({ ...prev, [actionId]: true }));
    } catch (err) {
      console.error('Failed to fetch consequence', err);
    } finally {
      setLoadingConsequence(prev => ({ ...prev, [actionId]: false }));
    }
  };

  const handleToggle = (id: string, currentlyCompleted: boolean) => {
    if (!currentlyCompleted) {
      // Trigger subtle celebration micro-confetti
      confetti({
        particleCount: 30,
        spread: 45,
        origin: { y: 0.8 },
        colors: ['#4F46E5', '#06B6D4', '#10B981']
      });
    }
    toggleAction(id);
  };

  const filtered = actions.filter(a => {
    if (filter === 'PENDING') return !a.completed;
    if (filter === 'COMPLETED') return a.completed;
    return true;
  });

  const pendingCount = actions.filter(a => !a.completed).length;
  const completedCount = actions.filter(a => a.completed).length;

  return (
    <div className="space-y-4">
      {/* Top Banner & Filter Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white border border-[#E7EAF3] rounded-2xl p-4 shadow-2xs">
        <div>
          <h3 className="text-base font-extrabold text-slate-900 tracking-tight font-heading flex items-center gap-2">
            <CheckSquare className="w-5 h-5 text-indigo-600" />
            <span>What Do I Need To Do?</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Action items synthesized automatically from your university notices.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => setFilter('PENDING')}
            className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              filter === 'PENDING'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Pending ({pendingCount})
          </button>
          <button
            onClick={() => setFilter('COMPLETED')}
            className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              filter === 'COMPLETED'
                ? 'bg-white text-emerald-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Done ({completedCount})
          </button>
          <button
            onClick={() => setFilter('ALL')}
            className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              filter === 'ALL'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All ({actions.length})
          </button>
        </div>
      </div>

      {/* Task Checklist Items */}
      {filtered.length === 0 ? (
        <div className="bg-white border border-[#E7EAF3] rounded-2xl p-12 text-center">
          <Sparkles className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
          <h4 className="text-base font-bold text-slate-800">
            {filter === 'COMPLETED' ? 'No Completed Tasks Yet' : 'All Clear! No Pending Actions'}
          </h4>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            {filter === 'COMPLETED'
              ? 'Complete tasks from your inbox notices to see them here.'
              : 'You have addressed all required campus forms, venue shifts, and deadlines!'}
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {filtered.map((action) => {
            const isCritical = action.priority === 'CRITICAL';
            const isHigh = action.priority === 'HIGH';

            return (
              <div
                key={action.id}
                className={`flex items-start gap-3.5 p-4 rounded-2xl border transition-all duration-200 ${
                  action.completed
                    ? 'bg-slate-50/70 border-slate-200 opacity-60'
                    : isCritical
                    ? 'bg-red-50/40 border-red-200 shadow-xs'
                    : isHigh
                    ? 'bg-orange-50/40 border-orange-200 shadow-xs'
                    : 'bg-white border-slate-200 shadow-2xs hover:border-indigo-200'
                }`}
              >
                {/* Checkbox Button */}
                <button
                  onClick={() => handleToggle(action.id, action.completed)}
                  className="mt-0.5 text-slate-400 hover:text-indigo-600 transition-transform active:scale-90 cursor-pointer shrink-0"
                  aria-label="Toggle task completion"
                >
                  {action.completed ? (
                    <div className="w-5 h-5 rounded-md bg-emerald-500 flex items-center justify-center text-white shadow-xs">
                      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </div>
                  ) : (
                    <Square className="w-5 h-5 text-slate-300 hover:text-indigo-600" />
                  )}
                </button>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span
                      className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                        isCritical
                          ? 'bg-red-500 text-white'
                          : isHigh
                          ? 'bg-orange-500 text-white'
                          : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      {action.priority}
                    </span>

                    <span className="text-[11px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                      {action.category}
                    </span>

                    {action.deadline && (
                      <span className="flex items-center gap-1 text-[11px] font-medium text-slate-500">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span>{action.deadline}</span>
                      </span>
                    )}

                    {action.location && (
                      <span className="flex items-center gap-1 text-[11px] font-medium text-slate-500">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        <span>{action.location}</span>
                      </span>
                    )}
                  </div>

                  <p
                    className={`text-sm font-bold text-slate-900 leading-snug ${
                      action.completed ? 'line-through text-slate-500' : ''
                    }`}
                  >
                    {action.title}
                  </p>

                  {/* Backlink to Source Email & Actions */}
                  <div className="mt-2 flex flex-wrap items-center gap-3">
                    <button
                      onClick={() => openEmailById(action.emailId)}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-700 hover:underline cursor-pointer"
                    >
                      <span>From: {action.sourceEmailSubject}</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>

                    <button
                      onClick={() => handleFetchConsequence(action.id)}
                      disabled={loadingConsequence[action.id]}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg transition-colors cursor-pointer"
                    >
                      {loadingConsequence[action.id] ? (
                        <Loader2 className="w-3 h-3 animate-spin text-amber-600" />
                      ) : (
                        <HelpCircle className="w-3 h-3 text-amber-600" />
                      )}
                      <span>What happens if I ignore this?</span>
                      {expandedConsequence[action.id] ? (
                        <ChevronUp className="w-3 h-3" />
                      ) : (
                        <ChevronDown className="w-3 h-3" />
                      )}
                    </button>
                  </div>

                  {/* Consequence Drawer */}
                  {expandedConsequence[action.id] && consequenceMap[action.id] && (
                    <div className="mt-3 p-3 bg-amber-50/70 border border-amber-200 rounded-xl space-y-2 animate-in fade-in duration-150">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-amber-900 uppercase tracking-wider flex items-center gap-1">
                          <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
                          <span>Estimated Consequence</span>
                        </span>
                        <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                          consequenceMap[action.id].supportedByEvidence
                            ? 'bg-amber-100 text-amber-800 border border-amber-200'
                            : 'bg-slate-100 text-slate-700 border border-slate-200'
                        }`}>
                          {consequenceMap[action.id].supportedByEvidence ? 'GROUNDED EVIDENCE' : 'GENERAL ESTIMATE'}
                        </span>
                      </div>
                      
                      <div className="space-y-1">
                        {consequenceMap[action.id].consequences.map((c: string, idx: number) => (
                          <p key={idx} className="text-xs font-semibold text-amber-950 leading-relaxed">
                            • {c}
                          </p>
                        ))}
                      </div>

                      {consequenceMap[action.id].evidenceSnippet && (
                        <div className="pt-2 border-t border-amber-200/50">
                          <p className="text-[10px] font-bold text-amber-800 mb-0.5">
                            Source ({consequenceMap[action.id].evidenceSource}):
                          </p>
                          <p className="text-[11px] italic text-amber-900 bg-white/60 p-1.5 rounded border border-amber-200/60">
                            "{consequenceMap[action.id].evidenceSnippet}"
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
