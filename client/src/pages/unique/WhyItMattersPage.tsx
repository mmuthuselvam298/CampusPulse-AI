import React, { useState, useEffect } from 'react';
import { 
  HelpCircle, 
  Sparkles, 
  CheckCircle2, 
  BookOpen, 
  ArrowRight,
  UserCheck,
  ShieldCheck,
  GraduationCap
} from 'lucide-react';
import { ApiService } from '../../services/api';
import { useApp } from '../../context/AppContext';

export const WhyItMattersPage: React.FC = () => {
  const { emails, actions, setCurrentTab, openEmailById } = useApp();
  const [selectedId, setSelectedId] = useState<string>('unified-cse213-quiz');
  const [reasons, setReasons] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const sampleItems = [
    { id: 'unified-cse213-quiz', title: 'CSE 213: AI Tools Club Quiz (30 MCQs)', type: 'ACADEMICS' },
    { id: 'unified-robotics-workshop', title: 'Hands-On Robotics Workshop (Techfest IIT Bombay)', type: 'EVENTS' },
    { id: 'unified-cse204-exam', title: 'CSE 204 Algorithms Mid-Semester Exam Relocation', type: 'EXAMS' },
    { id: 'email-srm-004', title: 'Mandatory Attendance Condonation Notice (68.4%)', type: 'ATTENDANCE' },
    { id: 'unified-rain-closure', title: 'Rain Closure & Saturday Compensatory Working Day', type: 'ADMINISTRATION' }
  ];

  useEffect(() => {
    loadReasoning(selectedId);
  }, [selectedId]);

  const loadReasoning = async (id: string) => {
    try {
      setLoading(true);
      const res = await ApiService.getWhyThisMatters(id);
      setReasons(res.whyItMatters);
    } catch (err) {
      console.error('Failed to load reasoning:', err);
    } finally {
      setLoading(false);
    }
  };

  const activeItem = sampleItems.find(s => s.id === selectedId) || sampleItems[0];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center gap-2 text-indigo-600 text-xs font-bold uppercase tracking-wider mb-1">
          <HelpCircle className="w-4 h-4" />
          <span>Contextual Personalization</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-heading">
          "Why This Matters to Me?"
        </h1>
        <p className="text-sm text-slate-500 mt-1 max-w-2xl">
          Students receive dozens of general announcements every day. CampusPulse personalizes every circular by explaining exactly why it matters to your active degree, coursework, and attendance.
        </p>

        {/* Item selector pills */}
        <div className="flex items-center gap-2 mt-5 overflow-x-auto pb-1">
          {sampleItems.map(item => (
            <button
              key={item.id}
              onClick={() => setSelectedId(item.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                selectedId === item.id
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {item.title}
            </button>
          ))}
        </div>
      </div>

      {/* Reasoning Presentation Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Active Item Summary */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4">
          <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 uppercase tracking-wider">
            {activeItem.type}
          </span>
          <h2 className="text-xl font-bold text-slate-900 leading-snug">
            {activeItem.title}
          </h2>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2 text-xs">
            <div className="flex items-center gap-2 text-slate-700 font-medium">
              <GraduationCap className="w-4 h-4 text-indigo-500 shrink-0" />
              <span>B.Tech CSE · AI & ML Specialization</span>
            </div>
            <div className="flex items-center gap-2 text-slate-700 font-medium">
              <UserCheck className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>Semester 3 · School of Engineering (SEAS)</span>
            </div>
            <div className="flex items-center gap-2 text-slate-700 font-medium">
              <ShieldCheck className="w-4 h-4 text-blue-500 shrink-0" />
              <span>Enrolled Student: Muthu</span>
            </div>
          </div>

          <div className="pt-2">
            <button
              onClick={() => {
                if (selectedId.startsWith('email-')) {
                  openEmailById(selectedId);
                } else {
                  setCurrentTab('information-hub');
                }
              }}
              className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>Inspect Source Record</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Right: Evidence-Based Reasoning Bullets */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-indigo-600 font-bold text-xs uppercase tracking-wider mb-4">
              <Sparkles className="w-4 h-4 text-purple-600" />
              <span>WHY THIS MATTERS TO YOU (GROUNDED IN SYSTEM DATA)</span>
            </div>

            <div className="space-y-3.5">
              {reasons.map((reason, idx) => (
                <div 
                  key={idx}
                  className="flex items-start gap-3 p-4 rounded-2xl bg-gradient-to-r from-slate-50 to-indigo-50/40 border border-slate-200/70"
                >
                  <CheckCircle2 className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
                  <p className="text-sm font-medium text-slate-800 leading-relaxed">
                    {reason}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Action Suggestion */}
          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-500 italic">
              Explanations derived strictly from official university circulars and enrolled courses.
            </span>
            <button
              onClick={() => setCurrentTab('actions')}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition-colors cursor-pointer"
            >
              Take Action
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
