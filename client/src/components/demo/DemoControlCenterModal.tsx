import React from 'react';
import {
  X,
  Sliders,
  RotateCcw,
  Sparkles,
  AlertOctagon,
  ShieldCheck,
  CheckCircle,
  Database,
  ExternalLink,
  Mail
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const DemoControlCenterModal: React.FC = () => {
  const { isDemoControlOpen, setIsDemoControlOpen, simulateEmail, resetDemo, dashboard } = useApp();

  if (!isDemoControlOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-emerald-50 via-teal-50 to-white">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-600 text-white shadow-xs">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-extrabold text-slate-900 font-heading">
                  Demo Control Center
                </span>
                <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-100 text-emerald-800 rounded-md">
                  SIH PS02 Demonstration
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Trigger live scenarios to showcase how CampusPulse AI prioritizes university noise.
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsDemoControlOpen(false)}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-full transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Quick Scenario 1: Simulate Live Email */}
          <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h4 className="text-xs font-bold text-indigo-950 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                Simulate Incoming Email
              </h4>
              <p className="text-xs text-slate-600 mt-1">
                Injects an urgent venue relocation email in real-time, displays slide-in toast, and triggers AI analysis.
              </p>
            </div>

            <button
              onClick={() => {
                simulateEmail();
                setIsDemoControlOpen(false);
              }}
              className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all shadow-xs cursor-pointer shrink-0"
            >
              Trigger Live Email
            </button>
          </div>

          {/* Quick Scenario 2: Severe Weather / Campus Alert */}
          <div className="p-4 rounded-2xl bg-red-50/60 border border-red-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h4 className="text-xs font-bold text-red-950 uppercase tracking-wider flex items-center gap-1.5">
                <AlertOctagon className="w-4 h-4 text-red-600" />
                Trigger Critical Alert
              </h4>
              <p className="text-xs text-slate-600 mt-1">
                Dispatches an emergency weather advisory closing physical campus grounds and rescheduling morning exams.
              </p>
            </div>

            <button
              onClick={() => {
                simulateEmail('exam_moved');
                setIsDemoControlOpen(false);
              }}
              className="px-4 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl transition-all shadow-xs cursor-pointer shrink-0"
            >
              Trigger Critical Alert
            </button>
          </div>

          {/* Quick Scenario 3: Reset Demo Dataset */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <RotateCcw className="w-4 h-4 text-slate-600" />
                Reset To Clean State
              </h4>
              <p className="text-xs text-slate-600 mt-1">
                Restores the 108 synthetic emails, marks unread notices, and clears custom tasks.
              </p>
            </div>

            <button
              onClick={() => {
                resetDemo();
                setIsDemoControlOpen(false);
              }}
              className="px-4 py-2 text-xs font-bold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-xl transition-all shadow-2xs cursor-pointer shrink-0"
            >
              Reset Demo
            </button>
          </div>

          {/* Domain Security & Filtering Inspection */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              University Domain Security Guard
            </h4>
            <p className="text-xs text-slate-600">
              Approved Domains: <code className="font-mono text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded">northbridgeuniversity.edu</code>, <code className="font-mono text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded">srmist.edu.in</code>
            </p>
            <p className="text-[11px] text-slate-500">
              Commercial spam from Amazon, Instagram, or promotional newsletters without institutional endorsement are automatically rejected from the student priority dashboard.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button
            onClick={() => setIsDemoControlOpen(false)}
            className="px-5 py-2 text-xs font-bold text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 rounded-xl transition-all cursor-pointer"
          >
            Close Console
          </button>
        </div>
      </div>
    </div>
  );
};
