import React, { useState, useEffect } from 'react';
import { 
  Lock, 
  ShieldCheck, 
  CheckCircle2, 
  XCircle, 
  Key, 
  Server, 
  LogOut, 
  AlertCircle,
  EyeOff,
  Database
} from 'lucide-react';
import { GoogleServiceStatus } from '../../types';
import { useApp } from '../../context/AppContext';

export const PrivacyCenterPage: React.FC = () => {
  const { addToast } = useApp();
  const [status, setStatus] = useState<GoogleServiceStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStatus();
  }, []);

  const loadStatus = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/google/status');
      if (res.ok) {
        setStatus(await res.json());
      }
    } catch (err) {
      console.error('Failed to load Google status:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      const res = await fetch('/api/google/disconnect', { method: 'POST' });
      if (res.ok) {
        addToast({
          title: 'Google Account Disconnected',
          message: 'OAuth tokens cleared securely. Switched to pristine Demo Mode.',
          priority: 'HIGH'
        });
        loadStatus();
      }
    } catch (err: any) {
      addToast({
        title: 'Disconnect Error',
        message: err.message || 'Failed to disconnect account.',
        priority: 'CRITICAL'
      });
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-indigo-600 text-xs font-bold uppercase tracking-wider mb-1">
            <Lock className="w-4 h-4" />
            <span>Security & Zero-Exfiltration Architecture</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-heading">
            Privacy Center
          </h1>
          <p className="text-sm text-slate-500 mt-1 max-w-2xl">
            Complete transparency into what CampusPulse can read and what it is architecturally prevented from doing. All tokens and secrets remain strictly isolated on the backend.
          </p>
        </div>

        {status?.connected && (
          <button
            onClick={handleDisconnect}
            className="px-4 py-2.5 rounded-2xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs transition-colors flex items-center gap-2 border border-rose-200 cursor-pointer shrink-0"
          >
            <LogOut className="w-4 h-4" />
            <span>Disconnect Google</span>
          </button>
        )}
      </div>

      {/* Permissions Breakdown Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* What CampusPulse CAN Access */}
        <div className="bg-white rounded-3xl border border-emerald-200/80 p-6 sm:p-8 shadow-xs space-y-4">
          <div className="flex items-center gap-2.5 text-emerald-700 font-bold text-sm uppercase tracking-wide">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            <span>WHAT CAMPUSPULSE CAN ACCESS (READ-ONLY)</span>
          </div>

          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-emerald-50/50 border border-emerald-100 text-xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-slate-900 block">Google Account Identity:</span>
                <span className="text-slate-600">Basic student profile and institutional email verification.</span>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-emerald-50/50 border border-emerald-100 text-xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-slate-900 block">Gmail Read-Only API:</span>
                <span className="text-slate-600">Strictly scans for official university sender notices.</span>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-emerald-50/50 border border-emerald-100 text-xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-slate-900 block">Google Classroom Read-Only API:</span>
                <span className="text-slate-600">Retrieves enrolled course syllabi, assignments, and due dates.</span>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-emerald-50/50 border border-emerald-100 text-xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-slate-900 block">Google Calendar:</span>
                <span className="text-slate-600">Reads scheduled timetable and creates events only upon student manual confirmation.</span>
              </div>
            </div>
          </div>
        </div>

        {/* What CampusPulse CANNOT Do */}
        <div className="bg-white rounded-3xl border border-rose-200/80 p-6 sm:p-8 shadow-xs space-y-4">
          <div className="flex items-center gap-2.5 text-rose-700 font-bold text-sm uppercase tracking-wide">
            <XCircle className="w-5 h-5 text-rose-600" />
            <span>WHAT CAMPUSPULSE CANNOT DO (HARD RESTRICTIONS)</span>
          </div>

          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-rose-50/50 border border-rose-100 text-xs">
              <XCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-slate-900 block">Cannot Send Emails:</span>
                <span className="text-slate-600">No write scope requested. CampusPulse cannot compose or dispatch messages.</span>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-rose-50/50 border border-rose-100 text-xs">
              <XCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-slate-900 block">Cannot Delete Communications:</span>
                <span className="text-slate-600">Trash and deletion APIs are architecturally excluded.</span>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-rose-50/50 border border-rose-100 text-xs">
              <XCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-slate-900 block">Cannot Modify Classroom Grades:</span>
                <span className="text-slate-600">Zero submission modification or coursework alteration permissions.</span>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-rose-50/50 border border-rose-100 text-xs">
              <XCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-slate-900 block">Cannot Auto-Write to Calendar:</span>
                <span className="text-slate-600">Every single calendar write requires explicit student user confirmation.</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Secret Storage & Security Architecture */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-md space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-indigo-400">
          Backend Security Audit
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1">
            <Server className="w-4 h-4 text-indigo-400 mb-1" />
            <span className="font-bold block text-white">Server-Side Tokens</span>
            <span className="text-slate-400">OAuth tokens are stored in backend memory. Never written to localStorage or cookies.</span>
          </div>

          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1">
            <EyeOff className="w-4 h-4 text-emerald-400 mb-1" />
            <span className="font-bold block text-white">Zero Secret Leakage</span>
            <span className="text-slate-400">Client Secret and Gemini API keys are completely inaccessible to frontend code.</span>
          </div>

          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1">
            <Database className="w-4 h-4 text-blue-400 mb-1" />
            <span className="font-bold block text-white">Data Retention Policy</span>
            <span className="text-slate-400">Disconnecting immediately purges tokens and reverts student session to Demo Mode.</span>
          </div>
        </div>
      </div>
    </div>
  );
};
