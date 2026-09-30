import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Sparkles, 
  Activity, 
  Lock, 
  CheckCircle2, 
  Database,
  Unlink
} from 'lucide-react';
import { ApiService } from '../services/api';
import { useApp } from '../context/AppContext';
import { 
  CommunicationHealthMetrics, 
  AIDecisionExplanation 
} from '../types';

export const TrustPrivacyPage: React.FC = () => {
  const { emails, addToast, setCurrentTab } = useApp();
  const [activeTab, setActiveTab] = useState<'privacy' | 'health' | 'explain'>('privacy');
  const [healthMetrics, setHealthMetrics] = useState<CommunicationHealthMetrics | null>(null);
  const [selectedEmailId, setSelectedEmailId] = useState<string>(emails[0]?.id || '');
  const [explanation, setExplanation] = useState<AIDecisionExplanation | null>(null);
  const [isExplaining, setIsExplaining] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);

  useEffect(() => {
    loadTrustData();
  }, []);

  const loadTrustData = async () => {
    try {
      const health = await ApiService.getCommunicationHealth();
      setHealthMetrics(health);
      if (emails.length > 0) {
        handleExplain(emails[0].id);
      }
    } catch (err) {
      console.error('Failed to load health metrics:', err);
    }
  };

  const handleExplain = async (id: string) => {
    setSelectedEmailId(id);
    setIsExplaining(true);
    try {
      const exp = await ApiService.getAIDecisionExplanation(id);
      setExplanation(exp);
    } catch (err) {
      console.error('Failed to explain decision:', err);
    } finally {
      setIsExplaining(false);
    }
  };

  const handleDisconnect = async () => {
    setIsDisconnecting(true);
    try {
      await ApiService.disconnectGoogle();
      addToast({
        title: "🔒 Disconnected",
        message: "Google OAuth tokens securely removed from server.",
        priority: "LOW"
      });
      setCurrentTab('connections');
    } catch (err) {
      addToast({
        title: "❌ Error",
        message: "Failed to disconnect Google account.",
        priority: "HIGH"
      });
    } finally {
      setIsDisconnecting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 animate-in fade-in duration-200">
      {/* Hero Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl bg-gradient-to-r from-teal-950 via-slate-900 to-slate-900 text-white shadow-xl border border-teal-800/40 relative overflow-hidden">
        <div className="relative z-10 space-y-1.5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 border border-teal-400/30 text-xs font-semibold">
            <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
            <span>Verifiable AI Governance & Data Ethics</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-heading">
            Trust & Privacy Center
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
            Full transparency into AI prioritization rationale, live communication health telemetry, and strict read-only Google permission enforcement.
          </p>
        </div>

        {/* View Switcher Tabs */}
        <div className="relative z-10 flex flex-wrap gap-1.5 bg-white/10 backdrop-blur-md p-1.5 rounded-2xl border border-white/15 self-start md:self-auto">
          {[
            { id: 'privacy', label: 'Privacy & Permissions' },
            { id: 'health', label: 'Communication Health' },
            { id: 'explain', label: 'Explain AI Reasoning' }
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-teal-600 text-white shadow-md scale-102'
                    : 'text-slate-300 hover:text-white hover:bg-white/10'
                }`}
              >
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* SECTION 1: PRIVACY & PERMISSIONS */}
      {activeTab === 'privacy' && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-white border border-[#E7EAF3] shadow-xs space-y-6">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 font-heading">
                Zero-Modification Privacy Model
              </h3>
              <p className="text-xs text-slate-500">
                CampusPulse operates with strict read-only privileges and client confirmation guardrails.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Allowed Privileges */}
              <div className="p-5 rounded-2xl bg-emerald-50/60 border border-emerald-200/80 space-y-3">
                <div className="flex items-center gap-2 text-emerald-800 font-bold text-xs">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>WHAT CAMPUSPULSE CAN ACCESS</span>
                </div>
                <ul className="space-y-2 text-xs text-slate-700">
                  <li className="flex items-start gap-2">
                    <span className="font-bold text-emerald-600">✓</span>
                    <span><strong>Gmail:</strong> Read-only ingestion (<code className="text-emerald-800 bg-white px-1 rounded">gmail.readonly</code>) of university communications</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-bold text-emerald-600">✓</span>
                    <span><strong>Classroom:</strong> Read-only inspection (<code className="text-emerald-800 bg-white px-1 rounded">classroom.courses.readonly</code>) of coursework & announcements</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-bold text-emerald-600">✓</span>
                    <span><strong>Calendar:</strong> Read scheduled time slots to detect overlaps</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-bold text-emerald-600">✓</span>
                    <span><strong>Explicit Confirmation:</strong> Insert events only after student manually clicks [Add to Calendar]</span>
                  </li>
                </ul>
              </div>

              {/* Forbidden Actions */}
              <div className="p-5 rounded-2xl bg-red-50/60 border border-red-200/80 space-y-3">
                <div className="flex items-center gap-2 text-red-800 font-bold text-xs">
                  <Lock className="w-4 h-4 text-red-600" />
                  <span>FORBIDDEN & TECHNICALLY IMPOSSIBLE</span>
                </div>
                <ul className="space-y-2 text-xs text-slate-700">
                  <li className="flex items-start gap-2">
                    <span className="font-bold text-red-600">✗</span>
                    <span>Cannot send emails, reply, or compose messages</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-bold text-red-600">✗</span>
                    <span>Cannot delete or modify existing inbox messages</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-bold text-red-600">✗</span>
                    <span>Cannot submit or modify Classroom assignments</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-bold text-red-600">✗</span>
                    <span>Cannot silently alter Google Calendar schedules without consent</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Storage Transparency */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-2">
              <span className="font-bold text-slate-900 flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5 text-indigo-600" />
                <span>Local SQLite Data Persistence</span>
              </span>
              <p className="text-slate-600 leading-relaxed">
                All parsed notices, extracted actions, calendar mappings, and detected conflict states are stored in your private local SQLite database (<code className="font-mono text-slate-800 bg-white px-1.5 py-0.5 rounded border border-slate-200">data/campuspulse.sqlite</code>). Refresh tokens are stored strictly server-side.
              </p>
            </div>

            {/* Disconnect Action */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <div>
                <h4 className="text-xs font-bold text-slate-900">Revoke Google Authorization</h4>
                <p className="text-[11px] text-slate-500">Deletes access and refresh tokens from local SQLite immediately.</p>
              </div>
              <button
                onClick={handleDisconnect}
                disabled={isDisconnecting}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-50 text-red-700 hover:bg-red-100 text-xs font-bold transition-all cursor-pointer disabled:opacity-50"
              >
                <Unlink className="w-3.5 h-3.5" />
                <span>{isDisconnecting ? 'Disconnecting...' : 'Disconnect Google Account'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 2: COMMUNICATION HEALTH */}
      {activeTab === 'health' && healthMetrics && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-white border border-[#E7EAF3] shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 font-heading">
                  University Communication Health Telemetry
                </h3>
                <p className="text-xs text-slate-500">
                  Calculated dynamically from real persistent SQLite records.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 font-semibold uppercase block">Health Grade</span>
                  <span className="text-2xl font-extrabold text-indigo-600 font-heading">{healthMetrics.grade}</span>
                </div>
                <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-xl font-extrabold text-indigo-700 font-heading">
                  {healthMetrics.overallHealthScore}%
                </div>
              </div>
            </div>

            {/* Metric Bars */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <span className="text-2xl font-extrabold text-slate-900 font-heading block">
                  {healthMetrics.totalCommunications}
                </span>
                <span className="text-xs text-slate-500 font-medium">Total Messages Analyzed</span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <span className="text-2xl font-extrabold text-amber-600 font-heading block">
                  {healthMetrics.duplicatePercentage}%
                </span>
                <span className="text-xs text-slate-500 font-medium">Duplicate / Follow-Up Rate</span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <span className="text-2xl font-extrabold text-emerald-600 font-heading block">
                  {healthMetrics.withDeadlinesPercentage}%
                </span>
                <span className="text-xs text-slate-500 font-medium">Explicit Deadlines Included</span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <span className="text-2xl font-extrabold text-indigo-600 font-heading block">
                  {healthMetrics.conflictingInfoCount}
                </span>
                <span className="text-xs text-slate-500 font-medium">Contradictions Detected</span>
              </div>
            </div>

            {/* Insights */}
            <div className="space-y-3 pt-2">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Audited Communication Quality Observations
              </h4>
              <div className="space-y-2">
                {healthMetrics.topInsights.map((insight, idx) => (
                  <div key={idx} className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-700 leading-relaxed flex items-start gap-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 mt-1.5 shrink-0" />
                    <span>{insight}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 3: EXPLAIN AI DECISION */}
      {activeTab === 'explain' && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-white border border-[#E7EAF3] shadow-xs space-y-6">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 font-heading flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-600" />
                <span>Explainable AI Decision Audit</span>
              </h3>
              <p className="text-xs text-slate-500">
                Select any incoming circular to inspect the mathematical and evidence-based rationale behind priority and category scores.
              </p>
            </div>

            {/* Email Picker */}
            <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto p-1">
              {emails.slice(0, 10).map((e) => (
                <button
                  key={e.id}
                  onClick={() => handleExplain(e.id)}
                  className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer text-left ${
                    selectedEmailId === e.id
                      ? 'bg-purple-50 text-purple-800 border-purple-300 ring-2 ring-purple-100'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <span className="font-bold block truncate max-w-[240px]">{e.subject}</span>
                  <span className="text-[10px] text-slate-400">{e.category} · Priority {e.priorityScore}</span>
                </button>
              ))}
            </div>

            {isExplaining && (
              <div className="text-center py-8 text-xs text-slate-400">
                Evaluating evidence and citations...
              </div>
            )}

            {/* Explanation Results */}
            {explanation && !isExplaining && (
              <div className="p-5 rounded-2xl bg-purple-50/40 border border-purple-200 space-y-4 animate-in fade-in duration-150">
                <div className="flex items-center justify-between pb-3 border-b border-purple-100">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">{explanation.itemTitle}</h4>
                    <span className="text-xs text-purple-700 font-medium">Outcome: {explanation.outcome}</span>
                  </div>
                  <span className="px-2.5 py-0.5 rounded text-xs font-bold bg-purple-100 text-purple-800">
                    {explanation.decisionType}
                  </span>
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <span className="font-bold text-slate-700 uppercase text-[10px] tracking-wider block">Decision Rationale</span>
                    <ul className="list-disc pl-4 space-y-1 text-slate-800 mt-1">
                      {explanation.reasons.map((r, i) => (
                        <li key={i}>{r}</li>
                      ))}
                    </ul>
                  </div>

                  {explanation.evidenceSources && explanation.evidenceSources.length > 0 && (
                    <div className="space-y-1.5">
                      <span className="font-bold text-slate-700 uppercase text-[10px] tracking-wider block">Grounding Evidence Sources</span>
                      <div className="space-y-1.5">
                        {explanation.evidenceSources.map((ev, i) => (
                          <div key={i} className="p-2.5 rounded-xl bg-white border border-purple-200 text-xs">
                            <span className="font-bold text-indigo-700">{ev.source}: {ev.title}</span>
                            <p className="text-slate-600 italic mt-0.5">"{ev.snippet}"</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
