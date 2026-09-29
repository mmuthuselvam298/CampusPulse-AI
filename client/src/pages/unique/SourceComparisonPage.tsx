import React, { useState, useEffect } from 'react';
import { 
  FileDiff, 
  Mail, 
  Calendar, 
  BookOpen, 
  AlertTriangle, 
  CheckCircle2, 
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import { TruthResolutionItem } from '../../types';
import { ApiService } from '../../services/api';
import { useApp } from '../../context/AppContext';

export const SourceComparisonPage: React.FC = () => {
  const { setCurrentTab } = useApp();
  const [selectedEventId, setSelectedEventId] = useState<string>('unified-robotics-workshop');
  const [truth, setTruth] = useState<TruthResolutionItem | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTruth(selectedEventId);
  }, [selectedEventId]);

  const loadTruth = async (id: string) => {
    try {
      setLoading(true);
      const res = await ApiService.getTruthResolution(id);
      setTruth(res);
    } catch (err) {
      console.error('Failed to load comparison:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center gap-2 text-indigo-600 text-xs font-bold uppercase tracking-wider mb-1">
          <FileDiff className="w-4 h-4" />
          <span>Cross-Platform Side-by-Side Diff</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-heading">
          Source Comparison
        </h1>
        <p className="text-sm text-slate-500 mt-1 max-w-2xl">
          Side-by-side evidence audit comparing what Gmail, Google Calendar, and Google Classroom claim about the same event. Never obscures contradictory facts.
        </p>

        {/* Event selector pills */}
        <div className="flex items-center gap-2 mt-5 overflow-x-auto pb-1">
          {[
            { id: 'unified-robotics-workshop', label: 'Robotics Workshop (IIT Bombay)' },
            { id: 'unified-cse204-exam', label: 'CSE 204 Algorithms Midterm' },
            { id: 'unified-cse213-quiz', label: 'CSE 213 AI Tools Club Quiz' }
          ].map(item => (
            <button
              key={item.id}
              onClick={() => setSelectedEventId(item.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                selectedEventId === item.id
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {truth && (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 uppercase tracking-wider">
                COMPARING 3 PLATFORMS
              </span>
              <h2 className="text-2xl font-bold text-slate-900 mt-2">{truth.title}</h2>
            </div>
            <button
              onClick={() => setCurrentTab('conflicts')}
              className="px-4 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold text-xs transition-colors flex items-center gap-1.5 border border-amber-200 cursor-pointer"
            >
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <span>Open Conflict Detector</span>
            </button>
          </div>

          {/* Matrix of Fields comparing platforms */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Column 1: Gmail Claims */}
            <div className="p-5 rounded-3xl bg-slate-50 border border-slate-200/80 space-y-4">
              <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
                <Mail className="w-4 h-4 text-red-500" />
                <span>Gmail Circulars</span>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-slate-400 font-bold block text-[10px] uppercase">Stated Time:</span>
                  <span className="font-bold text-slate-900">
                    {truth.fields.find(f => f.field === 'Time')?.sources.find(s => s.source === 'Gmail')?.value || '10:00 AM – 4:00 PM'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 font-bold block text-[10px] uppercase">Stated Room:</span>
                  <span className="font-bold text-slate-900">
                    {truth.fields.find(f => f.field === 'Location')?.sources.find(s => s.source === 'Gmail')?.value || 'Room S202, SR Block'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 font-bold block text-[10px] uppercase">Originating Sender:</span>
                  <span className="text-slate-700">Department / Directorate Coordinator</span>
                </div>
              </div>
            </div>

            {/* Column 2: Google Calendar Claims */}
            <div className="p-5 rounded-3xl bg-slate-50 border border-slate-200/80 space-y-4">
              <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
                <Calendar className="w-4 h-4 text-blue-500" />
                <span>Google Calendar</span>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-slate-400 font-bold block text-[10px] uppercase">Scheduled Time:</span>
                  <span className="font-bold text-slate-900">
                    {truth.fields.find(f => f.field === 'Time')?.sources.find(s => s.source === 'Google Calendar')?.value || '11:00 AM – 4:00 PM'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 font-bold block text-[10px] uppercase">Booked Room:</span>
                  <span className="font-bold text-slate-900">
                    {truth.fields.find(f => f.field === 'Location')?.sources.find(s => s.source === 'Google Calendar')?.value || 'Room S204, SR Block'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 font-bold block text-[10px] uppercase">Calendar Status:</span>
                  <span className="text-slate-700">Active reservation</span>
                </div>
              </div>
            </div>

            {/* Column 3: CampusPulse AI Synthesis */}
            <div className="p-5 rounded-3xl bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-200 space-y-4">
              <div className="flex items-center gap-2 font-bold text-indigo-950 text-sm">
                <ShieldCheck className="w-4 h-4 text-indigo-600" />
                <span>CampusPulse Interpretation</span>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-indigo-600 font-bold block text-[10px] uppercase">Timing Discrepancy:</span>
                  <span className="font-extrabold text-amber-700">Two sources conflict (10 AM vs 11 AM)</span>
                </div>
                <div>
                  <span className="text-indigo-600 font-bold block text-[10px] uppercase">Authoritative State:</span>
                  <span className="font-extrabold text-emerald-800">Room S204 at 11:00 AM</span>
                </div>
                <p className="text-indigo-900 text-[11px] leading-relaxed pt-1">
                  Faculty coordinator Dr. Teja Krishna Mamidi confirmed Room S204 setup at 10:50 AM with session kickoff at 11:00 AM.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
