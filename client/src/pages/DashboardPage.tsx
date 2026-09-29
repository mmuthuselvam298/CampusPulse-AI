import React from 'react';
import { CampusPulseVisualizer } from '../components/dashboard/CampusPulseVisualizer';
import { DailyBriefingCard } from '../components/briefing/DailyBriefingCard';
import { UrgentAttentionCards } from '../components/dashboard/UrgentAttentionCards';
import { CategoryOverview } from '../components/dashboard/CategoryOverview';
import { TimelineWidget } from '../components/dashboard/TimelineWidget';
import { EmailCard } from '../components/email/EmailCard';
import { useApp } from '../context/AppContext';
import { ArrowRight, Inbox } from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const { dashboard, openEmailById, setCurrentTab } = useApp();
  const recentEmails = dashboard?.recentEmails || [];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 animate-in fade-in duration-200">
      {/* 1. Hero Dynamic Campus Pulse Visualizer */}
      <CampusPulseVisualizer />

      {/* 2. AI Daily Campus Briefing */}
      <DailyBriefingCard />

      {/* 3. Urgent Needs Attention Cards (Critical / High) */}
      <UrgentAttentionCards />

      {/* 4. Split Grid: Channels Overview & Today's Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <CategoryOverview />
        </div>
        <div className="lg:col-span-1">
          <TimelineWidget />
        </div>
      </div>

      {/* 5. Recent Prioritized Communications */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 tracking-tight font-heading">
              Recent Prioritized Communications
            </h3>
            <p className="text-xs text-slate-500">
              Sorted by real-time academic consequence & action requirement
            </p>
          </div>

          <button
            onClick={() => setCurrentTab('inbox')}
            className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-700 cursor-pointer"
          >
            <span>View All Inbox ({dashboard?.metrics?.totalAnalyzed || 108})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="space-y-3">
          {recentEmails.slice(0, 5).map((email) => (
            <EmailCard
              key={email.id}
              email={email}
              onClick={() => openEmailById(email.id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
