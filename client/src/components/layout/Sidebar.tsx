import React, { useState } from 'react';
import {
  LayoutDashboard,
  Inbox,
  CheckSquare,
  GitCompare,
  Calendar,
  MapPin,
  BarChart3,
  Bot,
  Settings,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Sparkles,
  Sliders,
  BookOpen,
  ShieldCheck,
  Network,
  AlertTriangle,
  Clock,
  HelpCircle,
  CalendarDays,
  Layers,
  Radio,
  Activity,
  Award,
  Compass,
  Lock,
  LayoutGrid
} from 'lucide-react';
import { useApp, NavTab } from '../../context/AppContext';

interface SidebarProps {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ collapsed, setCollapsed }) => {
  const { currentTab, setCurrentTab, dashboard, actions, emails, setIsDemoControlOpen } = useApp();
  const [uniqueExpanded, setUniqueExpanded] = useState(true);

  const urgentCount = dashboard?.metrics?.requireAttention || 0;
  const unreadCount = emails.filter(e => !e.isRead).length;
  const pendingActions = actions.filter(a => !a.completed).length;

  const mainNavItems: { id: NavTab; label: string; icon: React.ElementType; badge?: number; badgeColor?: string }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'inbox', label: 'Priority Inbox', icon: Inbox, badge: unreadCount, badgeColor: 'bg-indigo-100 text-indigo-700' },
    { id: 'actions', label: 'My Actions', icon: CheckSquare, badge: pendingActions, badgeColor: 'bg-red-100 text-red-700' },
    { id: 'calendar', label: 'Calendar', icon: Calendar },
    { id: 'classroom', label: 'Google Classroom', icon: BookOpen },
    { id: 'relationships', label: 'What Changed?', icon: GitCompare, badge: 3, badgeColor: 'bg-amber-100 text-amber-700' },
    { id: 'assistant', label: 'AI Assistant', icon: Bot },
    { id: 'connections', label: 'Connected Accounts', icon: ShieldCheck }
  ];

  const uniqueNavItems: { id: NavTab; label: string; icon: React.ElementType; badge?: string }[] = [
    { id: 'unique-features', label: 'Unique Features Overview', icon: Sparkles, badge: 'ALL' },
    { id: 'command-center', label: 'Student Command Center', icon: LayoutGrid, badge: 'NEW' },
    { id: 'knowledge-graph', label: 'Campus Knowledge Graph', icon: Network },
    { id: 'changes-radar', label: 'What Changed Radar', icon: GitCompare },
    { id: 'conflicts', label: 'Information Conflict Detector', icon: AlertTriangle, badge: 'PS02' },
    { id: 'deadline-risk', label: 'Deadline Risk', icon: Clock },
    { id: 'why-it-matters', label: 'Why This Matters', icon: HelpCircle },
    { id: 'calendar-planner', label: 'AI Calendar Planner', icon: CalendarDays },
    { id: 'information-hub', label: 'Information Hub', icon: Layers },
    { id: 'catch-up', label: 'What Did I Miss?', icon: Radio },
    { id: 'communication-health', label: 'Communication Health', icon: Activity },
    { id: 'opportunities', label: 'Opportunity Matcher', icon: Award },
    { id: 'attention-budget', label: 'Attention Budget', icon: Compass },
    { id: 'explain-decision', label: 'Explain AI Decision', icon: Sparkles },
    { id: 'chaos-simulator', label: 'Campus Chaos Simulator', icon: Radio, badge: 'DEMO' },
    { id: 'event-navigator', label: 'Campus Event Navigator', icon: MapPin },
    { id: 'privacy', label: 'Privacy Center', icon: Lock }
  ];

  const isUniqueTabActive = uniqueNavItems.some(item => item.id === currentTab);

  return (
    <aside
      className={`relative flex flex-col justify-between h-screen bg-white border-r border-[#E7EAF3] transition-all duration-300 z-40 shrink-0 ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Top Branding Section */}
      <div className="flex-1 overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b border-slate-100 sticky top-0 bg-white z-20">
          <div className="flex items-center gap-3 overflow-hidden cursor-pointer" onClick={() => setCurrentTab('dashboard')}>
            <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-cyan-500 flex items-center justify-center shadow-md shadow-indigo-100 shrink-0">
              <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 12h4l3 8 4-16 3 8h4" />
              </svg>
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-pink-500 rounded-full border-2 border-white animate-pulse"></span>
            </div>

            {!collapsed && (
              <div className="flex flex-col animate-in fade-in duration-200">
                <div className="flex items-center gap-1.5">
                  <span className="text-base font-extrabold tracking-tight text-slate-900 font-heading">
                    CampusPulse
                  </span>
                  <span className="px-1.5 py-0.5 text-[10px] font-bold bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-md tracking-wider">
                    AI
                  </span>
                </div>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-[9px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-1 py-0.2 rounded">
                    SRM AP
                  </span>
                  <span className="text-[10px] font-medium text-slate-400 tracking-tight">
                    Your campus. Prioritized.
                  </span>
                </div>
              </div>
            )}
          </div>

          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden lg:flex p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            aria-label="Toggle Sidebar"
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Main Navigation Links */}
        <nav className="p-3 space-y-1">
          {mainNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => setCurrentTab(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl font-medium text-xs transition-all duration-200 cursor-pointer group relative ${
                  isActive
                    ? 'bg-indigo-50 text-indigo-700 font-bold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
                title={collapsed ? item.label : undefined}
              >
                {isActive && (
                  <span className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-indigo-600 rounded-r-full" />
                )}
                <Icon
                  className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-110 ${
                    isActive ? 'text-indigo-600' : 'text-slate-400 group-hover:text-slate-600'
                  }`}
                />
                {!collapsed && <span className="truncate text-left flex-1">{item.label}</span>}
                {!collapsed && item.badge !== undefined && item.badge > 0 && (
                  <span className={`ml-auto px-1.5 py-0.2 text-[10px] font-bold rounded-full ${item.badgeColor || 'bg-slate-100 text-slate-600'}`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}

          {/* ========================================================= */}
          {/* NEW SECTION: UNIQUE FEATURES (ABOVE SETTINGS) */}
          {/* ========================================================= */}
          <div className="pt-3 mt-2 border-t border-slate-100">
            {!collapsed ? (
              <button
                onClick={() => setUniqueExpanded(!uniqueExpanded)}
                className="w-full flex items-center justify-between px-3 py-1.5 text-[11px] font-extrabold text-indigo-700 uppercase tracking-wider rounded-lg hover:bg-indigo-50/60 transition-colors cursor-pointer mb-1"
              >
                <div className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                  <span>UNIQUE FEATURES</span>
                </div>
                {uniqueExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
              </button>
            ) : (
              <div className="w-full h-px bg-slate-200 my-2" />
            )}

            {(uniqueExpanded || collapsed) && (
              <div className="space-y-0.5">
                {uniqueNavItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentTab === item.id;

                  return (
                    <button
                      key={item.id}
                      onClick={() => setCurrentTab(item.id)}
                      className={`w-full flex items-center gap-2.5 px-3 py-1.5 rounded-xl text-xs transition-all duration-150 cursor-pointer group relative ${
                        isActive
                          ? 'bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-800 font-bold shadow-xs'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                      }`}
                      title={collapsed ? item.label : undefined}
                    >
                      {isActive && (
                        <span className="absolute left-0 top-1 bottom-1 w-1 bg-gradient-to-b from-indigo-600 to-purple-600 rounded-r-full" />
                      )}
                      <Icon
                        className={`w-3.5 h-3.5 shrink-0 transition-transform group-hover:scale-110 ${
                          isActive ? 'text-indigo-600' : 'text-slate-400 group-hover:text-slate-600'
                        }`}
                      />
                      {!collapsed && <span className="truncate text-left flex-1 text-[11px]">{item.label}</span>}
                      {!collapsed && item.badge && (
                        <span className="ml-auto text-[9px] font-extrabold px-1.5 py-0.2 rounded bg-indigo-100 text-indigo-700">
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Settings Section (Below Unique Features) */}
          <div className="pt-2 border-t border-slate-100 mt-2">
            <button
              onClick={() => setCurrentTab('settings')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl font-medium text-xs transition-all duration-200 cursor-pointer group relative ${
                currentTab === 'settings'
                  ? 'bg-indigo-50 text-indigo-700 font-bold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
              title={collapsed ? 'Settings' : undefined}
            >
              {currentTab === 'settings' && (
                <span className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-indigo-600 rounded-r-full" />
              )}
              <Settings className="w-4 h-4 text-slate-400 group-hover:text-slate-600 shrink-0" />
              {!collapsed && <span className="truncate text-left flex-1">Settings</span>}
            </button>
          </div>
        </nav>
      </div>

      {/* Bottom Section: Hackathon Demo Center Controller */}
      <div className="p-3 border-t border-slate-100">
        <button
          onClick={() => setIsDemoControlOpen(true)}
          className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200/80 text-emerald-800 hover:from-emerald-100 hover:to-teal-100 transition-all text-xs font-semibold shadow-xs cursor-pointer ${
            collapsed ? 'justify-center' : ''
          }`}
          title="Open Demo Control Center"
        >
          <Sliders className="w-4 h-4 text-emerald-600 shrink-0" />
          {!collapsed && (
            <div className="flex flex-col text-left">
              <span>Demo Controls</span>
              <span className="text-[10px] text-emerald-600 font-normal">SIH PS02 Live Console</span>
            </div>
          )}
        </button>
      </div>
    </aside>
  );
};
