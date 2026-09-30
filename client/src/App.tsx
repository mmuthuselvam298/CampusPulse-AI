import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { EmailDetailModal } from './components/email/EmailDetailModal';
import { AIChatDrawer } from './components/assistant/AIChatDrawer';
import { ToastNotification } from './components/notifications/ToastNotification';

// Core Pages
import { DashboardPage } from './pages/DashboardPage';
import { InboxPage } from './pages/InboxPage';
import { ActionsPage } from './pages/ActionsPage';
import { CalendarPage } from './pages/CalendarPage';
import { ClassroomPage } from './pages/ClassroomPage';
import { ConnectionsPage } from './pages/ConnectionsPage';
import { CampusMapPage } from './pages/CampusMapPage';
import { SettingsPage } from './pages/SettingsPage';
import { AssistantPage } from './pages/AssistantPage';

// Five Campus Intelligence Areas
import { CampusIntelligencePage } from './pages/CampusIntelligencePage';
import { ChangeConflictRadarPage } from './pages/ChangeConflictRadarPage';
import { ActionPlanningPage } from './pages/ActionPlanningPage';
import { StudentBriefingPage } from './pages/StudentBriefingPage';
import { TrustPrivacyPage } from './pages/TrustPrivacyPage';

// Mobile bottom nav icons
import { LayoutDashboard, Inbox, CheckSquare, Calendar, Sparkles } from 'lucide-react';

const MainLayout: React.FC = () => {
  const { currentTab, setCurrentTab, setIsAssistantOpen } = useApp();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const renderActivePage = () => {
    switch (currentTab) {
      case 'dashboard':
        return <DashboardPage />;
      case 'inbox':
        return <InboxPage />;
      case 'calendar':
      case 'deadlines':
        return <CalendarPage />;
      case 'classroom':
        return <ClassroomPage />;
      case 'actions':
        return <ActionsPage />;
      case 'map':
        return <CampusMapPage />;
      case 'connections':
        return <ConnectionsPage />;
      case 'settings':
        return <SettingsPage />;
      case 'assistant':
        return <AssistantPage />;

      // Five Campus Intelligence Areas
      case 'campus-intelligence':
      case 'knowledge-graph':
      case 'information-hub':
      case 'timeline':
      case 'unique-features':
      case 'command-center':
        return <CampusIntelligencePage />;

      case 'change-conflict':
      case 'changes-radar':
      case 'conflicts':
      case 'truth-resolution':
      case 'relationships':
      case 'compare-sources':
      case 'chaos-simulator':
        return <ChangeConflictRadarPage />;

      case 'action-planning':
      case 'deadline-risk':
      case 'attention-budget':
      case 'calendar-planner':
      case 'event-navigator':
        return <ActionPlanningPage />;

      case 'student-briefing':
      case 'catch-up':
      case 'opportunities':
      case 'digest':
        return <StudentBriefingPage />;

      case 'trust-privacy':
      case 'privacy':
      case 'communication-health':
      case 'explain-decision':
      case 'why-it-matters':
      case 'analytics':
        return <TrustPrivacyPage />;

      default:
        return <DashboardPage />;
    }
  };

  return (
    <div className="flex h-screen bg-[#F8FAFF] overflow-hidden select-none font-sans">
      {/* Collapsible Left Sidebar */}
      <Sidebar collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Sticky Top Header */}
        <Header />

        {/* Scrollable View Container */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 pb-20 md:pb-8">
          {renderActivePage()}
        </main>
      </div>

      {/* Slide-over Email Viewer Modal */}
      <EmailDetailModal />

      {/* Persistent AI Assistant Drawer */}
      <AIChatDrawer />

      {/* Toast System */}
      <ToastNotification />

      {/* Mobile Floating Action Button (FAB) for AI Assistant */}
      <button
        onClick={() => setIsAssistantOpen(true)}
        className="md:hidden fixed bottom-18 right-4 w-12 h-12 bg-gradient-to-tr from-indigo-600 to-purple-600 text-white rounded-full flex items-center justify-center shadow-lg shadow-indigo-500/30 z-40 active:scale-95 transition-transform cursor-pointer"
        aria-label="Open AI Assistant"
      >
        <Sparkles className="w-5 h-5 animate-pulse" />
      </button>

      {/* Mobile Bottom Navigation Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white/95 backdrop-blur-md border-t border-[#E7EAF3] flex items-center justify-around px-2 z-40">
        {[
          { id: 'dashboard' as const, label: 'Home', icon: LayoutDashboard },
          { id: 'inbox' as const, label: 'Inbox', icon: Inbox },
          { id: 'campus-intelligence' as const, label: 'Intelligence', icon: Sparkles },
          { id: 'calendar' as const, label: 'Calendar', icon: Calendar },
          { id: 'actions' as const, label: 'Actions', icon: CheckSquare }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setCurrentTab(tab.id)}
              className={`flex flex-col items-center justify-center w-12 h-12 rounded-xl transition-all cursor-pointer ${
                isActive ? 'text-indigo-600 font-bold' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] mt-0.5">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
};
export default App;
