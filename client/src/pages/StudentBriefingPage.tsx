import React, { useState, useEffect } from 'react';
import { 
  Radio, 
  Sparkles, 
  Award, 
  Clock, 
  Flame, 
  ExternalLink,
  ChevronRight,
  TrendingUp,
  Inbox
} from 'lucide-react';
import { ApiService } from '../services/api';
import { useApp } from '../context/AppContext';
import { 
  CampusBriefingResult, 
  CatchUpSummary, 
  OpportunityItem, 
  NotificationDigestGroup 
} from '../types';

export const StudentBriefingPage: React.FC = () => {
  const { dashboard, openEmailById, setCurrentTab, setIsAssistantOpen } = useApp();
  const [activeTab, setActiveTab] = useState<'briefing' | 'catchup' | 'opportunities' | 'digest'>('briefing');
  const [briefing, setBriefing] = useState<CampusBriefingResult | null>(dashboard?.briefing || null);
  const [catchUpData, setCatchUpData] = useState<CatchUpSummary | null>(null);
  const [catchUpTimeframe, setCatchUpTimeframe] = useState<string>('since_yesterday');
  const [opportunities, setOpportunities] = useState<OpportunityItem[]>([]);
  const [digests, setDigests] = useState<NotificationDigestGroup[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadBriefingData();
  }, [catchUpTimeframe]);

  const loadBriefingData = async () => {
    setLoading(true);
    try {
      const [briefRes, catchRes, oppsRes, digRes] = await Promise.all([
        ApiService.getBriefing(),
        ApiService.getCatchUpSummary(catchUpTimeframe),
        ApiService.getOpportunities(),
        ApiService.getNotificationDigests()
      ]);
      setBriefing(briefRes);
      setCatchUpData(catchRes);
      setOpportunities(oppsRes);
      setDigests(digRes);
    } catch (err) {
      console.error('Failed to load student briefing data:', err);
    } finally {
      setLoading(false);
    }
  };

  const studentName = dashboard?.student?.name ? dashboard.student.name.split(' ')[0] : 'Student';

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 animate-in fade-in duration-200">
      {/* Hero Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 text-white shadow-xl border border-blue-800/40 relative overflow-hidden">
        <div className="relative z-10 space-y-1.5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30 text-xs font-semibold">
            <Radio className="w-3.5 h-3.5" />
            <span>Personalized Student Dispatch</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-heading">
            Student Briefing & Catch-Up
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
            Executive daily dispatch synthesizing upcoming deadlines, campus opportunities, condensed notification digests, and away-from-desk catch-up reports.
          </p>
        </div>

        {/* View Switcher Tabs */}
        <div className="relative z-10 flex flex-wrap gap-1.5 bg-white/10 backdrop-blur-md p-1.5 rounded-2xl border border-white/15 self-start md:self-auto">
          {[
            { id: 'briefing', label: 'Daily Briefing' },
            { id: 'catchup', label: 'What Did I Miss?' },
            { id: 'opportunities', label: `Opportunities (${opportunities.length})` },
            { id: 'digest', label: `Smart Digest (${digests.length})` }
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md scale-102'
                    : 'text-slate-300 hover:text-white hover:bg-white/10'
                }`}
              >
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* SECTION 1: DAILY BRIEFING */}
      {activeTab === 'briefing' && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-white border border-[#E7EAF3] shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="space-y-0.5">
                <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider">
                  Campus Intelligence Synthesis
                </span>
                <h3 className="text-lg font-extrabold text-slate-900 font-heading">
                  Good Morning, {studentName}
                </h3>
              </div>
              <button
                onClick={() => setIsAssistantOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-50 text-purple-700 hover:bg-purple-100 text-xs font-bold transition-all cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                <span>Ask AI Assistant</span>
              </button>
            </div>

            <p className="text-sm text-slate-700 leading-relaxed font-medium">
              {briefing?.headline || "Here is your synchronized morning overview across university channels. Review critical exam changes, coursework deadlines, and your upcoming agenda."}
            </p>

            {/* Quick Action Matrix */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              <div className="p-4 rounded-2xl bg-red-50/60 border border-red-100 space-y-2">
                <span className="text-xs font-bold text-red-900 flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5 text-red-500" />
                  <span>Critical Action ({briefing?.criticalCount || 1})</span>
                </span>
                <p className="text-xs text-slate-600 leading-relaxed">
                  CSE 204 Exam shifted to S202 SR Block (Report by 08:35 AM with physical hall ticket).
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-100 space-y-2">
                <span className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-amber-500" />
                  <span>Upcoming Deadlines ({briefing?.upcomingDeadlinesCount || 3})</span>
                </span>
                <p className="text-xs text-slate-600 leading-relaxed">
                  CSE 204 Assignment 1 (Oct 2) and Surprise Quiz 2 for Digital Systems (Oct 1).
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-100 space-y-2">
                <span className="text-xs font-bold text-indigo-900 flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Academic Updates ({briefing?.academicUpdatesCount || 2})</span>
                </span>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Terrathon 2026 Hackathon & ACM Competitive Coding recruiting active.
                </p>
              </div>
            </div>
          </div>

          {/* Agenda Highlights */}
          {briefing?.summaryBullets && briefing.summaryBullets.length > 0 && (
            <div className="p-6 rounded-3xl bg-white border border-[#E7EAF3] shadow-xs space-y-4">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Today's Core Synthesis
              </h4>
              <div className="divide-y divide-slate-100">
                {briefing.summaryBullets.map((item, i) => (
                  <div key={i} className="py-2.5 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3">
                      <span className="text-base">{item.emoji}</span>
                      <div>
                        <span className="font-bold text-slate-800">{item.title}</span>
                        <p className="text-[11px] text-slate-500">{item.description}</p>
                      </div>
                    </div>
                    {item.emailId && (
                      <button
                        onClick={() => openEmailById(item.emailId!)}
                        className="text-[11px] font-bold text-indigo-600 hover:underline"
                      >
                        View Notice
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* SECTION 2: WHAT DID I MISS (CATCH UP) */}
      {activeTab === 'catchup' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-white border border-[#E7EAF3] shadow-xs">
            <div>
              <h3 className="text-sm font-extrabold text-slate-900 font-heading">
                Time-Window Catch-Up Report
              </h3>
              <p className="text-xs text-slate-500">
                Returns actual communications received since selected departure time.
              </p>
            </div>

            <div className="flex items-center gap-1.5">
              {[
                { id: 'today', label: 'Today' },
                { id: 'since_yesterday', label: 'Since Yesterday' },
                { id: 'last_3_days', label: 'Last 3 Days' },
                { id: 'this_week', label: 'This Week' }
              ].map((tf) => (
                <button
                  key={tf.id}
                  onClick={() => setCatchUpTimeframe(tf.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    catchUpTimeframe === tf.id
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {tf.label}
                </button>
              ))}
            </div>
          </div>

          {catchUpData && (
            <div className="space-y-6">
              {/* Stat Counters */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-4 rounded-2xl bg-white border border-[#E7EAF3] shadow-xs">
                  <span className="text-2xl font-extrabold text-slate-900 font-heading block">
                    {catchUpData.counts.totalNotices}
                  </span>
                  <span className="text-xs text-slate-500 font-medium">New Communications</span>
                </div>
                <div className="p-4 rounded-2xl bg-white border border-[#E7EAF3] shadow-xs">
                  <span className="text-2xl font-extrabold text-red-600 font-heading block">
                    {catchUpData.counts.importantChanges}
                  </span>
                  <span className="text-xs text-slate-500 font-medium">Important Changes</span>
                </div>
                <div className="p-4 rounded-2xl bg-white border border-[#E7EAF3] shadow-xs">
                  <span className="text-2xl font-extrabold text-indigo-600 font-heading block">
                    {catchUpData.counts.newActions}
                  </span>
                  <span className="text-xs text-slate-500 font-medium">New Actions</span>
                </div>
                <div className="p-4 rounded-2xl bg-white border border-[#E7EAF3] shadow-xs">
                  <span className="text-2xl font-extrabold text-amber-600 font-heading block">
                    {catchUpData.counts.informationalUpdates}
                  </span>
                  <span className="text-xs text-slate-500 font-medium">Informational Updates</span>
                </div>
              </div>

              {/* Highlights */}
              <div className="p-6 rounded-3xl bg-white border border-[#E7EAF3] shadow-xs space-y-4">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Key Catch-Up Highlights
                </h4>
                <div className="space-y-3">
                  {catchUpData.highlights.map((h, i) => (
                    <div key={i} className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-3">
                      <span className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                      <div className="space-y-0.5">
                        <span className="font-bold text-xs text-slate-900">{h.title}</span>
                        <p className="text-xs text-slate-700 leading-relaxed">{h.summary}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Top Actions Needed */}
              <div className="p-6 rounded-3xl bg-white border border-[#E7EAF3] shadow-xs space-y-4">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Top Actions To Clear
                </h4>
                <div className="divide-y divide-slate-100">
                  {catchUpData.topActions.map((action, i) => (
                    <div key={i} className="py-2.5 flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-800">{action.title}</span>
                      <span className="text-slate-400">⏰ {action.deadline || 'Pending'}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* SECTION 3: OPPORTUNITY MATCHER */}
      {activeTab === 'opportunities' && (
        <div className="space-y-4">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 font-heading">
              Matched Campus Opportunities ({opportunities.length})
            </h3>
            <p className="text-xs text-slate-500">
              Matched against your SRM AP student profile: B.Tech Computer Science (AI & ML).
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {opportunities.map((opp) => (
              <div
                key={opp.id}
                className="p-6 rounded-3xl bg-white border border-[#E7EAF3] hover:border-indigo-300 shadow-xs hover:shadow-md transition-all space-y-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-700 uppercase">
                      {opp.category}
                    </span>
                    <h4 className="text-sm font-bold text-slate-900 mt-1">{opp.title}</h4>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-xs font-extrabold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                      {opp.relevanceScore}% Match
                    </span>
                  </div>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">
                  {opp.sourceSubject} · {opp.organizer}
                </p>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Why Matched:</span>
                  <ul className="list-disc pl-4 space-y-0.5 text-slate-600 text-[11px]">
                    {opp.whyRelevant.map((r, i) => (
                      <li key={i}>{r}</li>
                    ))}
                  </ul>
                </div>

                <div className="flex items-center justify-between text-xs pt-1">
                  <span className="text-slate-500 font-medium">Deadline: {opp.deadline || 'Check notice'}</span>
                  {opp.sourceId && (
                    <button
                      onClick={() => openEmailById(opp.sourceId)}
                      className="text-indigo-600 hover:underline font-bold text-[11px]"
                    >
                      View Notice →
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECTION 4: SMART DIGEST */}
      {activeTab === 'digest' && (
        <div className="space-y-4">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 font-heading">
              Smart Notification Digest ({digests.length} Clusters)
            </h3>
            <p className="text-xs text-slate-500">
              Repetitive reminders and related department notices condensed into actionable updates.
            </p>
          </div>

          <div className="space-y-4">
            {digests.map((dig) => (
              <div
                key={dig.topicKey}
                className="p-6 rounded-3xl bg-white border border-[#E7EAF3] shadow-xs space-y-4"
              >
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700 uppercase">
                      {dig.topicTitle}
                    </span>
                    <h4 className="text-sm font-bold text-slate-900">{dig.condensedHeadline}</h4>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700">
                    {dig.totalNotificationsCount} notices combined
                  </span>
                </div>

                <p className="text-xs text-slate-700 leading-relaxed">
                  {dig.summary}
                </p>

                <div className="space-y-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Consolidated Items:</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {dig.emails.map((n, idx) => (
                      <div
                        key={idx}
                        onClick={() => openEmailById(n.id)}
                        className="p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-100 text-xs cursor-pointer transition-colors"
                      >
                        <div className="flex justify-between text-[10px] text-slate-400">
                          <span>{n.senderName}</span>
                          <span>{n.dateFormatted}</span>
                        </div>
                        <p className="font-semibold text-slate-800 line-clamp-1">{n.subject}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
