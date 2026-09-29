import React, { useState, useEffect } from 'react';
import { 
  Award, 
  Sparkles, 
  Calendar, 
  MapPin, 
  Clock, 
  ArrowRight,
  GraduationCap,
  ExternalLink,
  Tag
} from 'lucide-react';
import { OpportunityItem } from '../../types';
import { ApiService } from '../../services/api';
import { useApp } from '../../context/AppContext';

export const OpportunityMatcherPage: React.FC = () => {
  const { openEmailById } = useApp();
  const [opportunities, setOpportunities] = useState<OpportunityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<string>('ALL');

  useEffect(() => {
    loadOpportunities();
  }, []);

  const loadOpportunities = async () => {
    try {
      setLoading(true);
      const res = await ApiService.getOpportunities();
      setOpportunities(res);
    } catch (err) {
      console.error('Failed to load opportunities:', err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = opportunities.filter(o => {
    if (filterType === 'ALL') return true;
    return o.type === filterType;
  });

  const getTypeBadge = (type: OpportunityItem['type']) => {
    switch (type) {
      case 'HACKATHON':
        return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'WORKSHOP':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'EXPERT_TALK':
        return 'bg-indigo-100 text-indigo-700 border-indigo-200';
      case 'CLUB_RECRUITMENT':
        return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'COMPETITION':
        return 'bg-amber-100 text-amber-700 border-amber-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center gap-2 text-indigo-600 text-xs font-bold uppercase tracking-wider mb-1">
          <Award className="w-4 h-4" />
          <span>Curricular & Co-Curricular Profiling</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-heading">
          Opportunity Matcher
        </h1>
        <p className="text-sm text-slate-500 mt-1 max-w-2xl">
          Matches national hackathons, technical bootcamps, and faculty research seminars directly to your active academic profile (B.Tech Computer Science & Engineering · AI & ML). Zero unexplained black-box recommendations.
        </p>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 mt-5 overflow-x-auto pb-1">
          {['ALL', 'HACKATHON', 'WORKSHOP', 'EXPERT_TALK', 'CLUB_RECRUITMENT', 'COMPETITION'].map(t => (
            <button
              key={t}
              onClick={() => setFilterType(t)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                filterType === t
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {t.replace(/_/g, ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Opportunities */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filtered.map(opp => (
          <div
            key={opp.id}
            className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              {/* Header */}
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border uppercase tracking-wider ${getTypeBadge(opp.type)}`}>
                  {opp.type.replace(/_/g, ' ')}
                </span>
                <span className="text-xs font-extrabold text-indigo-600 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-md">
                  {opp.relevanceScore}% Match
                </span>
              </div>

              <h3 className="text-lg font-bold text-slate-900 mb-1">
                {opp.title}
              </h3>
              <p className="text-xs text-slate-500 font-medium mb-3">
                Organizer: {opp.organizer}
              </p>

              {/* Date & Location */}
              <div className="space-y-1 text-xs text-slate-600 mb-4 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                {opp.date && (
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>Event Date: {opp.date}</span>
                  </div>
                )}
                {opp.deadline && (
                  <div className="flex items-center gap-2 text-rose-700 font-semibold">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Registration Cutoff: {opp.deadline}</span>
                  </div>
                )}
                {opp.location && (
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>{opp.location}</span>
                  </div>
                )}
              </div>

              {/* Why Relevant Section */}
              <div className="space-y-1.5 mb-4">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                  Why this is relevant to you:
                </span>
                {opp.whyRelevant.map((reason, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-xs text-slate-700">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-500 shrink-0 mt-0.5" />
                    <span>{reason}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-2 mt-2">
              <button
                onClick={() => openEmailById(opp.sourceId)}
                className="text-xs font-bold text-slate-600 hover:text-indigo-600 transition-colors flex items-center gap-1 cursor-pointer"
              >
                <span>View Circular</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => openEmailById(opp.sourceId)}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition-colors cursor-pointer shadow-xs"
              >
                Register / Act
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
