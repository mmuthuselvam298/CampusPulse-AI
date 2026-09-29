import React, { useState, useEffect } from 'react';
import { 
  Inbox, 
  Layers, 
  Mail, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  ChevronDown, 
  ChevronUp,
  ArrowRight
} from 'lucide-react';
import { NotificationDigestGroup } from '../../types';
import { ApiService } from '../../services/api';
import { useApp } from '../../context/AppContext';

export const DigestPage: React.FC = () => {
  const { openEmailById } = useApp();
  const [digests, setDigests] = useState<NotificationDigestGroup[]>([]);
  const [expandedTopic, setExpandedTopic] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDigests();
  }, []);

  const loadDigests = async () => {
    try {
      setLoading(true);
      const res = await ApiService.getNotificationDigests();
      setDigests(res);
    } catch (err) {
      console.error('Failed to load notification digests:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = (key: string) => {
    setExpandedTopic(expandedTopic === key ? null : key);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center gap-2 text-indigo-600 text-xs font-bold uppercase tracking-wider mb-1">
          <Inbox className="w-4 h-4" />
          <span>Notification Condensation</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-heading">
          Smart Notification Digest
        </h1>
        <p className="text-sm text-slate-500 mt-1 max-w-2xl">
          Stops notification fatigue. Repetitive follow-ups and reminder circulars on the same subject are aggregated into single, digestable intelligence summaries with actionable links.
        </p>
      </div>

      {/* Digests List */}
      <div className="space-y-4">
        {digests.map(item => {
          const isExpanded = expandedTopic === item.topicKey;

          return (
            <div 
              key={item.topicKey}
              className="bg-white rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all p-6 overflow-hidden"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 uppercase tracking-wider">
                    {item.category}
                  </span>
                  <span className="text-xs font-extrabold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                    {item.condensedHeadline}
                  </span>
                </div>
                <span className="text-xs text-slate-400 font-medium">
                  Last updated: {item.lastUpdated}
                </span>
              </div>

              <h2 className="text-lg font-bold text-slate-900 mb-2">
                {item.topicTitle}
              </h2>

              <p className="text-xs text-slate-600 mb-4 leading-relaxed">
                {item.summary}
              </p>

              {/* Action Banner if present */}
              {item.primaryAction && (
                <div className="mb-4 p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 text-slate-800">
                    <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />
                    <span className="font-semibold">{item.primaryAction.title}</span>
                  </div>
                  <span className="text-indigo-600 font-bold text-[11px] shrink-0 ml-2">
                    {item.primaryAction.deadline || 'Action Item'}
                  </span>
                </div>
              )}

              {/* Expand Toggle */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <button
                  onClick={() => toggleExpand(item.topicKey)}
                  className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
                >
                  <span>{isExpanded ? 'Hide' : 'Inspect'} {item.totalNotificationsCount} Condensed Messages</span>
                  {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>
              </div>

              {/* Expanded Email List */}
              {isExpanded && (
                <div className="mt-4 pt-4 border-t border-slate-100 space-y-2.5 animate-in fade-in duration-200">
                  {item.emails.map(email => (
                    <div 
                      key={email.id}
                      className="p-3.5 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200/70 transition-colors flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="space-y-0.5 truncate">
                        <span className="font-bold text-slate-900 block truncate">{email.subject}</span>
                        <span className="text-slate-500 text-[11px] block">{email.senderName} · {email.dateFormatted}</span>
                      </div>
                      <button
                        onClick={() => openEmailById(email.id)}
                        className="px-3 py-1 rounded-lg bg-white border border-slate-200 font-bold text-slate-700 hover:text-indigo-600 text-[11px] shrink-0 cursor-pointer shadow-xs"
                      >
                        Read
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
