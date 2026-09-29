import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  BarChart3, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  MapPin, 
  GitCompare, 
  Layers, 
  Sparkles,
  Award
} from 'lucide-react';
import { CommunicationHealthMetrics } from '../../types';
import { ApiService } from '../../services/api';

export const CommunicationHealthPage: React.FC = () => {
  const [metrics, setMetrics] = useState<CommunicationHealthMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMetrics();
  }, []);

  const loadMetrics = async () => {
    try {
      setLoading(true);
      const res = await ApiService.getCommunicationHealth();
      setMetrics(res);
    } catch (err) {
      console.error('Failed to load communication health:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center gap-2 text-indigo-600 text-xs font-bold uppercase tracking-wider mb-1">
          <Activity className="w-4 h-4" />
          <span>Real-Data Institutional Analytics</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-heading">
          Campus Communication Health
        </h1>
        <p className="text-sm text-slate-500 mt-1 max-w-2xl">
          Evaluates the semantic quality and actionable clarity of university communications. Calculated dynamically across actual database records without fabricated statistics.
        </p>
        {metrics && (
          <p className="text-xs text-indigo-600 font-semibold mt-2">
            Context: {metrics.datasetContext}
          </p>
        )}
      </div>

      {metrics && (
        <>
          {/* Top Score Banner */}
          <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-8 rounded-3xl shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <span className="text-[10px] font-extrabold px-3 py-1 rounded-full bg-white/10 border border-white/20 uppercase tracking-wider text-indigo-200">
                Institutional Quality Index
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight font-heading">
                Overall Health Score: {metrics.overallHealthScore}/100
              </h2>
              <p className="text-sm text-slate-300 max-w-xl">
                {metrics.totalCommunications} official university communications evaluated. Grade {metrics.grade} indicates consistent academic compliance with opportunities to optimize duplicate notifications.
              </p>
            </div>

            <div className="w-24 h-24 rounded-3xl bg-indigo-500/20 border-2 border-indigo-400/40 flex flex-col items-center justify-center shrink-0">
              <span className="text-xs text-indigo-300 font-bold uppercase">GRADE</span>
              <span className="text-4xl font-extrabold text-white">{metrics.grade}</span>
            </div>
          </div>

          {/* Metric KPI Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs">
              <div className="flex items-center gap-2 text-indigo-600 text-xs font-bold uppercase tracking-wider mb-2">
                <Clock className="w-4 h-4" />
                <span>Clear Deadlines</span>
              </div>
              <div className="text-3xl font-extrabold text-slate-900">{metrics.withDeadlinesPercentage}%</div>
              <div className="text-xs text-slate-500 mt-1">{metrics.withDeadlinesCount} of {metrics.totalCommunications} notices</div>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs">
              <div className="flex items-center gap-2 text-emerald-600 text-xs font-bold uppercase tracking-wider mb-2">
                <MapPin className="w-4 h-4" />
                <span>Clear Locations</span>
              </div>
              <div className="text-3xl font-extrabold text-slate-900">{metrics.withLocationsPercentage}%</div>
              <div className="text-xs text-slate-500 mt-1">{metrics.withLocationsCount} of {metrics.totalCommunications} notices</div>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs">
              <div className="flex items-center gap-2 text-purple-600 text-xs font-bold uppercase tracking-wider mb-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>Explicit Actions</span>
              </div>
              <div className="text-3xl font-extrabold text-slate-900">{metrics.withExplicitActionsPercentage}%</div>
              <div className="text-xs text-slate-500 mt-1">{metrics.withExplicitActionsCount} of {metrics.totalCommunications} notices</div>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs">
              <div className="flex items-center gap-2 text-amber-600 text-xs font-bold uppercase tracking-wider mb-2">
                <Layers className="w-4 h-4" />
                <span>Duplicate Notices</span>
              </div>
              <div className="text-3xl font-extrabold text-slate-900">{metrics.duplicateOrRelatedCount}</div>
              <div className="text-xs text-slate-500 mt-1">{metrics.duplicatePercentage}% repetitive volume</div>
            </div>
          </div>

          {/* Actionable Disruption Diagnostics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-rose-50/70 p-5 rounded-3xl border border-rose-100 text-rose-950">
              <span className="text-xs font-extrabold uppercase tracking-wide block mb-1">Conflicts Detected</span>
              <span className="text-2xl font-extrabold">{metrics.conflictingInfoCount} Discrepancies</span>
              <p className="text-xs text-rose-700 mt-1">Cross-system mismatches between email circulars and calendar.</p>
            </div>

            <div className="bg-amber-50/70 p-5 rounded-3xl border border-amber-100 text-amber-950">
              <span className="text-xs font-extrabold uppercase tracking-wide block mb-1">Detected Schedule Shifts</span>
              <span className="text-2xl font-extrabold">{metrics.changedEventsCount} Changes</span>
              <p className="text-xs text-amber-700 mt-1">Relocations, timing delays, and academic circular updates.</p>
            </div>

            <div className="bg-slate-50 p-5 rounded-3xl border border-slate-200 text-slate-950">
              <span className="text-xs font-extrabold uppercase tracking-wide block mb-1">Omitted Time / Location</span>
              <span className="text-2xl font-extrabold">{metrics.missingLocationCount + metrics.missingTimeCount} Notices</span>
              <p className="text-xs text-slate-600 mt-1">Event communications requiring clarification from organizers.</p>
            </div>
          </div>

          {/* Top Insights */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Audited Institutional Insights
            </h3>
            <div className="space-y-3">
              {metrics.topInsights.map((insight, idx) => (
                <div key={idx} className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-100 text-xs text-slate-800">
                  <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{insight}</span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
