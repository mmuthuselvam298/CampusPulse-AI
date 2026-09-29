import React, { useState, useEffect } from 'react';
import { 
  CalendarDays, 
  Clock, 
  Calendar, 
  CheckCircle2, 
  AlertTriangle, 
  Plus, 
  Sparkles, 
  MapPin, 
  Layers, 
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import { AICalendarPlan, PlannedScheduleSlot } from '../../types';
import { ApiService } from '../../services/api';
import { useApp } from '../../context/AppContext';

export const CalendarPlannerPage: React.FC = () => {
  const { addToast } = useApp();
  const [targetDate, setTargetDate] = useState<string>('2026-09-30');
  const [plan, setPlan] = useState<AICalendarPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [addingSlotId, setAddingSlotId] = useState<string | null>(null);
  const [conflictModalSlot, setConflictModalSlot] = useState<PlannedScheduleSlot | null>(null);

  useEffect(() => {
    loadPlan(targetDate);
  }, [targetDate]);

  const loadPlan = async (date: string) => {
    try {
      setLoading(true);
      const res = await ApiService.getCalendarPlan(date);
      setPlan(res);
    } catch (err) {
      console.error('Failed to load plan:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSlot = async (slot: PlannedScheduleSlot) => {
    // 1. Conflict Check before write
    try {
      setAddingSlotId(slot.id);
      const conflictRes = await fetch('/api/calendar/check-conflict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          startTime: slot.startTime,
          endTime: slot.endTime
        })
      });

      const conflictData = await conflictRes.json();
      if (conflictData.hasConflict) {
        setConflictModalSlot(slot);
        setAddingSlotId(null);
        return;
      }

      // 2. Perform write on confirmation
      await executeCalendarCreation(slot);
    } catch (err: any) {
      addToast({
        title: 'Calendar Schedule Error',
        message: err.message || 'Failed to communicate with calendar service.',
        priority: 'CRITICAL'
      });
      setAddingSlotId(null);
    }
  };

  const executeCalendarCreation = async (slot: PlannedScheduleSlot) => {
    try {
      const res = await fetch('/api/calendar/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: slot.title,
          startTime: slot.startTime,
          endTime: slot.endTime,
          description: slot.description,
          location: slot.location
        })
      });

      if (res.ok) {
        slot.isAlreadyInCalendar = true;
        addToast({
          title: 'Added to Google Calendar',
          message: `Scheduled "${slot.title}" successfully with confirmed slot.`,
          priority: 'HIGH'
        });
      }
    } catch (err: any) {
      console.error('Create event failed:', err);
    } finally {
      setAddingSlotId(null);
      setConflictModalSlot(null);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-indigo-600 text-xs font-bold uppercase tracking-wider mb-1">
            <CalendarDays className="w-4 h-4" />
            <span>Intelligent Day Synthesis</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-heading">
            AI Calendar Planner
          </h1>
          <p className="text-sm text-slate-500 mt-1 max-w-2xl">
            Synthesizes your Google Calendar, Classroom deadlines, venue shifts, and pending tasks into a realistic suggested day schedule. Never creates events without your confirmation.
          </p>
        </div>

        {/* Date Selector Buttons */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setTargetDate('2026-09-29')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              targetDate === '2026-09-29' ? 'bg-indigo-600 text-white shadow-xs' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Today (Sep 29)
          </button>
          <button
            onClick={() => setTargetDate('2026-09-30')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              targetDate === '2026-09-30' ? 'bg-indigo-600 text-white shadow-xs' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Tomorrow (Sep 30)
          </button>
        </div>
      </div>

      {/* Plan Summary Bar */}
      {plan && (
        <div className="bg-gradient-to-r from-indigo-900 to-slate-900 text-white p-6 rounded-3xl shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-indigo-500/30 border border-indigo-400/40 text-indigo-200 uppercase tracking-wider">
              Productivity Score {plan.productivityScore}%
            </span>
            <h2 className="text-lg font-bold mt-2">
              {plan.dayHeadline}
            </h2>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <div className="bg-white/10 px-3 py-2 rounded-xl border border-white/10">
              <span className="text-slate-400 block text-[10px]">Commitments</span>
              <span className="text-sm font-extrabold text-white">{plan.summary.totalCommitments}</span>
            </div>
            <div className="bg-white/10 px-3 py-2 rounded-xl border border-white/10">
              <span className="text-slate-400 block text-[10px]">Study Focus</span>
              <span className="text-sm font-extrabold text-white">{Math.round(plan.summary.studyTimeMinutes / 60)}h {plan.summary.studyTimeMinutes % 60}m</span>
            </div>
            <div className="bg-white/10 px-3 py-2 rounded-xl border border-white/10">
              <span className="text-slate-400 block text-[10px]">Unscheduled</span>
              <span className="text-sm font-extrabold text-amber-300">{plan.summary.unaddedCount} slots</span>
            </div>
          </div>
        </div>
      )}

      {/* Schedule Slots Timeline */}
      <div className="space-y-4">
        {plan?.schedule.map((slot) => (
          <div
            key={slot.id}
            className={`p-5 rounded-3xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
              slot.isAlreadyInCalendar 
                ? 'bg-white border-slate-200/90 shadow-xs' 
                : 'bg-white border-indigo-200 shadow-sm'
            }`}
          >
            <div className="space-y-1.5 max-w-2xl">
              <div className="flex items-center gap-2">
                <span className="text-xs font-extrabold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-md border border-indigo-100 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {slot.timeSlot}
                </span>

                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider ${
                  slot.priority === 'CRITICAL' ? 'bg-rose-100 text-rose-700' :
                  slot.priority === 'HIGH' ? 'bg-amber-100 text-amber-700' :
                  'bg-slate-100 text-slate-700'
                }`}>
                  {slot.activityType}
                </span>

                {slot.isAlreadyInCalendar && (
                  <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Synchronized
                  </span>
                )}
              </div>

              <h3 className="text-base font-bold text-slate-900">
                {slot.title}
              </h3>

              <p className="text-xs text-slate-600 leading-relaxed">
                {slot.description}
              </p>

              {slot.location && (
                <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span>{slot.location}</span>
                </div>
              )}

              {slot.conflictWarning && (
                <div className="p-2 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span>{slot.conflictWarning}</span>
                </div>
              )}
            </div>

            {/* CTA: Add to Calendar */}
            <div className="shrink-0 flex items-center gap-2">
              {slot.isAlreadyInCalendar ? (
                <button
                  disabled
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-400 font-bold text-xs flex items-center gap-1.5 cursor-not-allowed"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>On Calendar</span>
                </button>
              ) : (
                <button
                  onClick={() => handleAddSlot(slot)}
                  disabled={addingSlotId === slot.id}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{addingSlotId === slot.id ? 'Verifying...' : 'Add to Calendar'}</span>
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Confirmation Modal on Conflict */}
      {conflictModalSlot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-100 flex items-center justify-center text-amber-700 shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Potential Calendar Conflict
                </h3>
                <p className="text-xs text-slate-500">
                  Another event overlaps with this proposed time slot.
                </p>
              </div>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 text-xs space-y-1">
              <div className="font-bold text-slate-800">{conflictModalSlot.title}</div>
              <div className="text-slate-500">{conflictModalSlot.timeSlot}</div>
              <div className="text-slate-500">{conflictModalSlot.location}</div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setConflictModalSlot(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => executeCalendarCreation(conflictModalSlot)}
                className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs cursor-pointer"
              >
                Confirm & Add Anyway
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
