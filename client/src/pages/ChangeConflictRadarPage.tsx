import React, { useState, useEffect } from 'react';
import { 
  AlertTriangle, 
  GitCompare, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  Calendar, 
  Mail, 
  ArrowRight, 
  ShieldCheck, 
  HelpCircle,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { ApiService } from '../services/api';
import { useApp } from '../context/AppContext';
import { 
  InformationConflict, 
  ScheduleChangeItem, 
  TruthResolutionItem 
} from '../types';

export const ChangeConflictRadarPage: React.FC = () => {
  const { openEmailById, setCurrentTab } = useApp();
  const [activeTab, setActiveTab] = useState<'all' | 'conflicts' | 'changes' | 'truth'>('all');
  const [conflicts, setConflicts] = useState<InformationConflict[]>([]);
  const [changes, setChanges] = useState<ScheduleChangeItem[]>([]);
  const [truthItems, setTruthItems] = useState<TruthResolutionItem[]>([]);
  const [selectedConflict, setSelectedConflict] = useState<InformationConflict | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRadarData();
  }, []);

  const loadRadarData = async () => {
    try {
      setLoading(true);
      const [confRes, relRes] = await Promise.all([
        ApiService.getConflicts(),
        ApiService.getRelationships()
      ]);
      setConflicts(confRes);
      setChanges(relRes.whatChanged || []);

      // Load truth resolutions for events with conflicts
      const truths: TruthResolutionItem[] = [];
      for (const c of confRes) {
        if (c.eventId) {
          const t = await ApiService.getTruthResolution(c.eventId);
          if (t && !truths.some(item => item.eventId === t.eventId)) {
            truths.push(t);
          }
        }
      }
      setTruthItems(truths);
      if (confRes.length > 0) setSelectedConflict(confRes[0]);
    } catch (err) {
      console.error('Failed to load radar data:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 animate-in fade-in duration-200">
      {/* Hero Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl bg-gradient-to-r from-amber-950 via-slate-900 to-slate-900 text-white shadow-xl border border-amber-800/40 relative overflow-hidden">
        <div className="relative z-10 space-y-1.5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/30 text-xs font-semibold">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
            <span>PS02 Automated Change & Conflict Engine</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-heading">
            Change & Conflict Radar
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
            Continuous reconciliation between Gmail circulars, Google Classroom updates, and Google Calendar appointments to flag contradictions and schedule modifications.
          </p>
        </div>

        {/* View Switcher Tabs */}
        <div className="relative z-10 flex flex-wrap gap-1.5 bg-white/10 backdrop-blur-md p-1.5 rounded-2xl border border-white/15 self-start md:self-auto">
          {[
            { id: 'all', label: 'Overview' },
            { id: 'conflicts', label: `Conflicts (${conflicts.length})` },
            { id: 'changes', label: `Changes (${changes.length})` },
            { id: 'truth', label: 'Truth Resolution' }
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-amber-500 text-white shadow-md scale-102'
                    : 'text-slate-300 hover:text-white hover:bg-white/10'
                }`}
              >
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* METRIC BADGES */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-[#E7EAF3] shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600 shrink-0">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-extrabold text-slate-900 font-heading">{conflicts.length}</div>
            <div className="text-xs text-slate-500 font-medium">Cross-System Contradictions</div>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-[#E7EAF3] shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0">
            <GitCompare className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-extrabold text-slate-900 font-heading">{changes.length}</div>
            <div className="text-xs text-slate-500 font-medium">Detected Modifications</div>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-[#E7EAF3] shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-extrabold text-slate-900 font-heading">
              {conflicts.filter(c => c.hasAuthoritativeResolution).length} of {conflicts.length}
            </div>
            <div className="text-xs text-slate-500 font-medium">Authoritatively Resolved</div>
          </div>
        </div>
      </div>

      {/* SECTION 1: DETECTED INFORMATION CONFLICTS */}
      {(activeTab === 'all' || activeTab === 'conflicts') && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 font-heading flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                <span>Information Conflicts (Cross-System Contradictions)</span>
              </h3>
              <p className="text-xs text-slate-500">
                Differences between official communications and calendar appointments. Both sources are displayed without assumptions.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {conflicts.map((c) => (
              <div
                key={c.id}
                className="p-6 rounded-3xl bg-white border border-amber-200/80 shadow-md space-y-5 relative overflow-hidden"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100">
                  <div className="space-y-1">
                    <span className="inline-block px-2.5 py-0.5 rounded text-[10px] font-extrabold bg-amber-100 text-amber-800 uppercase tracking-wide">
                      {c.field} CONFLICT · {c.severity} SEVERITY
                    </span>
                    <h4 className="text-base font-extrabold text-slate-900">{c.eventTitle}</h4>
                  </div>
                  <span className="text-[11px] font-mono text-slate-400">
                    Detected: {new Date(c.detectedAt).toLocaleDateString()}
                  </span>
                </div>

                {/* Side-by-Side Comparison */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Source A */}
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                        <Mail className="w-3.5 h-3.5 text-indigo-600" />
                        <span>Source 1: {c.sourceA.sourceName}</span>
                      </span>
                      <span className="text-[10px] text-slate-400 font-medium">
                        {c.sourceA.timestamp ? new Date(c.sourceA.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Notice'}
                      </span>
                    </div>
                    <div className="text-base font-bold text-slate-900 bg-white p-2.5 rounded-xl border border-slate-200">
                      {c.sourceA.value}
                    </div>
                    <p className="text-xs text-slate-600 italic">
                      "{c.sourceA.excerpt}"
                    </p>
                    <p className="text-[11px] text-slate-400 truncate">
                      Record: {c.sourceA.recordTitle}
                    </p>
                  </div>

                  {/* Source B */}
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                        <Calendar className="w-3.5 h-3.5 text-purple-600" />
                        <span>Source 2: {c.sourceB.sourceName}</span>
                      </span>
                      <span className="text-[10px] text-slate-400 font-medium">
                        {c.sourceB.timestamp ? new Date(c.sourceB.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Calendar'}
                      </span>
                    </div>
                    <div className="text-base font-bold text-slate-900 bg-white p-2.5 rounded-xl border border-slate-200">
                      {c.sourceB.value}
                    </div>
                    <p className="text-xs text-slate-600 italic">
                      "{c.sourceB.excerpt}"
                    </p>
                    <p className="text-[11px] text-slate-400 truncate">
                      Record: {c.sourceB.recordTitle}
                    </p>
                  </div>
                </div>

                {/* Authoritative Resolution Banner */}
                <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200 text-xs space-y-2">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-amber-700" />
                    <span className="font-bold text-amber-900 uppercase tracking-wider text-[11px]">
                      CampusPulse Analysis & Resolution
                    </span>
                  </div>
                  <p className="font-semibold text-slate-800 leading-relaxed">
                    {c.currentKnownState}
                  </p>
                  <p className="text-slate-600 leading-relaxed">
                    {c.resolutionExplanation}
                  </p>
                </div>

                {/* Actions Bar */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                  <div className="flex items-center gap-2">
                    {c.emailId && (
                      <button
                        onClick={() => openEmailById(c.emailId!)}
                        className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-all cursor-pointer"
                      >
                        Inspect Official Email
                      </button>
                    )}
                    {c.calendarEventId && (
                      <button
                        onClick={() => setCurrentTab('calendar')}
                        className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-all cursor-pointer"
                      >
                        Review on Calendar
                      </button>
                    )}
                  </div>

                  <span className="text-xs font-semibold text-indigo-700">
                    💡 Suggested Action: {c.suggestedAction}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECTION 2: DETECTED IMPORTANT CHANGES */}
      {(activeTab === 'all' || activeTab === 'changes') && (
        <div className="space-y-4">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 font-heading flex items-center gap-2">
              <GitCompare className="w-4 h-4 text-indigo-600" />
              <span>Important Changes Radar</span>
            </h3>
            <p className="text-xs text-slate-500">
              Surfaces venue modifications, reporting time adjustments, deadlines shifted, and transit diversions.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {changes.map((item, idx) => (
              <div
                key={idx}
                className="p-5 rounded-2xl bg-white border border-[#E7EAF3] hover:border-indigo-300 shadow-xs hover:shadow-md transition-all space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    item.changeType === 'LOCATION' ? 'bg-blue-100 text-blue-700' :
                    item.changeType === 'TIMING' ? 'bg-amber-100 text-amber-700' :
                    item.changeType === 'DEADLINE' ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-700'
                  }`}>
                    {item.changeType} CHANGE
                  </span>
                  <span className="text-[10px] font-medium text-slate-400">Verified via Notice</span>
                </div>

                <h4 className="text-sm font-bold text-slate-900">{item.topic}</h4>

                {/* Before vs After */}
                <div className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                  <div className="flex-1">
                    <span className="text-[10px] text-slate-400 block font-medium">Previous</span>
                    <span className="font-semibold text-slate-600 line-through truncate block">
                      {item.previousValue || 'Unspecified'}
                    </span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-indigo-600 shrink-0" />
                  <div className="flex-1">
                    <span className="text-[10px] text-indigo-600 block font-bold">New / Revised</span>
                    <span className="font-bold text-slate-900 truncate block">
                      {item.newValue}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">
                  {item.summary}
                </p>

                {item.emailId && (
                  <button
                    onClick={() => openEmailById(item.emailId!)}
                    className="text-[11px] font-bold text-indigo-600 hover:underline flex items-center gap-1 cursor-pointer pt-1"
                  >
                    <span>View Grounding Circular</span>
                    <ChevronRight className="w-3 h-3" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECTION 3: TRUTH RESOLUTION */}
      {(activeTab === 'all' || activeTab === 'truth') && truthItems.length > 0 && (
        <div className="space-y-4">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 font-heading flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Field-by-Field Truth Resolution</span>
            </h3>
            <p className="text-xs text-slate-500">
              Evaluates individual event attributes against multiple sources with explicit status and evidence.
            </p>
          </div>

          <div className="space-y-4">
            {truthItems.map((item) => (
              <div
                key={item.eventId}
                className="p-6 rounded-3xl bg-white border border-[#E7EAF3] shadow-xs space-y-4"
              >
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <h4 className="text-sm font-extrabold text-slate-900 font-heading">
                    {item.title}
                  </h4>
                  <span className="text-xs font-mono text-slate-400">ID: {item.eventId}</span>
                </div>

                <div className="divide-y divide-slate-100">
                  {item.fields.map((f, i) => (
                    <div key={i} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="space-y-0.5 sm:w-1/4">
                        <span className="text-xs font-bold text-slate-800">{f.field}</span>
                        <span className={`block text-[10px] font-extrabold ${
                          f.status === 'Confirmed' ? 'text-emerald-600' :
                          f.status === 'Conflicting' ? 'text-amber-600' : 'text-blue-600'
                        }`}>
                          ● {f.status}
                        </span>
                      </div>

                      <div className="flex-1 space-y-1">
                        <span className="text-xs font-bold text-slate-900">{f.value}</span>
                        <p className="text-[11px] text-slate-500">{f.authoritativeReason}</p>
                      </div>

                      <div className="flex items-center gap-1 sm:w-1/4 justify-end">
                        {f.sources.map((s, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-600 border border-slate-200"
                            title={s.evidence}
                          >
                            {s.source}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
