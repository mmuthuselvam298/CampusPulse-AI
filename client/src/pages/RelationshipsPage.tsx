import React, { useState, useEffect } from 'react';
import {
  GitCompare,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  Layers,
  MapPin,
  Clock,
  Calendar,
  CheckCircle2,
  FileText
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ApiService } from '../services/api';
import { ScheduleChangeItem } from '../types';

export const RelationshipsPage: React.FC = () => {
  const { openEmailById } = useApp();
  const [changes, setChanges] = useState<ScheduleChangeItem[]>([]);
  const [clusters, setClusters] = useState<any[]>([]);

  useEffect(() => {
    ApiService.getRelationships().then(res => {
      setChanges(res.whatChanged);
      setClusters(res.clusters);
    });
  }, []);

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12 animate-in fade-in duration-200">
      {/* Header Banner explaining PS02 Value */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-amber-50 via-orange-50 to-white border border-amber-200/80 shadow-xs">
        <div className="flex items-center gap-2 mb-2">
          <span className="px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider bg-amber-500 text-white rounded-md">
            SIH PS02 Core Innovation
          </span>
          <span className="text-xs font-bold text-amber-800">
            Cross-Department Information Synthesis
          </span>
        </div>

        <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight font-heading">
          What Changed? & Communication Clusters
        </h2>

        <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-3xl leading-relaxed">
          When university departments operate in silos, students receive isolated emails about venue changes, delayed buses, and extended deadlines. CampusPulse connects related notices into unified stories and highlights critical diffs.
        </p>
      </div>

      {/* Section 1: Critical Changes Detected */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-extrabold text-slate-900 tracking-tight font-heading flex items-center gap-2">
            <GitCompare className="w-5 h-5 text-amber-600" />
            <span>Critical Schedule & Logistics Changes</span>
          </h3>
          <span className="text-xs font-semibold text-slate-500">
            Detected from recent notices
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {changes.map((item, idx) => (
            <div
              key={idx}
              onClick={() => openEmailById(item.emailId)}
              className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs hover:shadow-md hover:border-amber-300 transition-all cursor-pointer space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-amber-100 text-amber-800">
                  {item.changeType} DIFF
                </span>
                <span className="text-xs font-bold text-indigo-600 hover:underline inline-flex items-center gap-1">
                  <span>View Notice</span>
                  <ArrowRight className="w-3 h-3" />
                </span>
              </div>

              <h4 className="text-sm font-bold text-slate-900">
                {item.topic}
              </h4>

              {/* Before vs After Visual Diff */}
              <div className="grid grid-cols-2 gap-2 text-xs p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Previous
                  </span>
                  <p className="font-semibold text-slate-500 line-through">
                    {item.previousValue}
                  </p>
                </div>

                <div className="space-y-1 border-l border-slate-200 pl-3">
                  <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">
                    Updated Now
                  </span>
                  <p className="font-bold text-emerald-700">
                    {item.newValue}
                  </p>
                </div>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">
                {item.summary}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Section 2: Connected Communication Chains (Exam Series, Transit Series) */}
      <div className="space-y-3 pt-4 border-t border-slate-200">
        <h3 className="text-base font-extrabold text-slate-900 tracking-tight font-heading flex items-center gap-2">
          <Layers className="w-5 h-5 text-indigo-600" />
          <span>Connected Topic Threads</span>
        </h3>
        <p className="text-xs text-slate-500">
          Individual department emails linked together under unified academic topics.
        </p>

        <div className="space-y-4">
          {/* Thread 1: CSE Mid-Semester Exam */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <div>
                <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                  EXAMS CLUSTER
                </span>
                <h4 className="text-sm font-bold text-slate-900 mt-1">
                  CSE Mid-Semester Examination Logistics & Relocation
                </h4>
              </div>
              <span className="text-xs font-semibold text-slate-400">
                3 Connected Notices
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <div
                onClick={() => openEmailById('email-001')}
                className="flex items-center justify-between p-2.5 rounded-xl bg-red-50/60 border border-red-200 hover:bg-red-50 cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                  <span className="font-bold text-red-950">URGENT: Examination Hall Changed for Tomorrow</span>
                </div>
                <span className="text-slate-500 font-mono">Sep 29, 8:15 AM</span>
              </div>

              <div
                onClick={() => openEmailById('email-012')}
                className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200 hover:bg-slate-100 cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-slate-400" />
                  <span className="font-medium text-slate-700">RE: Calculator & Admit Card Guidelines</span>
                </div>
                <span className="text-slate-500 font-mono">Sep 28, 5:00 PM</span>
              </div>

              <div
                onClick={() => openEmailById('email-011')}
                className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200 hover:bg-slate-100 cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-slate-400" />
                  <span className="font-medium text-slate-700">Mid-Semester Examination Schedule – CSE Department</span>
                </div>
                <span className="text-slate-500 font-mono">Sep 25, 9:00 AM</span>
              </div>
            </div>
          </div>

          {/* Thread 2: Transport & Transit */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <div>
                <span className="text-xs font-bold text-cyan-700 bg-cyan-50 px-2 py-0.5 rounded">
                  TRANSPORT CLUSTER
                </span>
                <h4 className="text-sm font-bold text-slate-900 mt-1">
                  Campus Transit & Morning Fleet Schedule
                </h4>
              </div>
              <span className="text-xs font-semibold text-slate-400">
                2 Connected Notices
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <div
                onClick={() => openEmailById('email-003')}
                className="flex items-center justify-between p-2.5 rounded-xl bg-orange-50/60 border border-orange-200 hover:bg-orange-50 cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-orange-500" />
                  <span className="font-bold text-orange-950">Bus Route 4 Delayed Tomorrow Morning (Gate 2 Drop-off)</span>
                </div>
                <span className="text-slate-500 font-mono">Sep 29, 6:30 AM</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
