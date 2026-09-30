import React, { useState } from 'react';
import {
  LayoutDashboard,
  Inbox,
  CheckSquare,
  Calendar,
  BookOpen,
  MapPin,
  ShieldCheck,
  Network,
  GitCompare,
  CalendarDays,
  Radio,
  Lock,
  Settings,
  ChevronLeft,
  ChevronRight,
  RefreshCw
} from 'lucide-react';
import { useApp, NavTab } from '../../context/AppContext';

interface SidebarProps {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ collapsed, setCollapsed }) => {
  const { currentTab, setCurrentTab, dashboard, actions, emails, triggerSync } = useApp();
  const [isSyncing, setIsSyncing] = useState(false);

  const unreadCount = emails.filter(e => !e.isRead).length;
  const pendingActions = actions.filter(a => !a.completed).length;

  const mainNavItems: { id: NavTab; label: string; icon: React.ElementType; badge?: number; badgeColor?: string }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'inbox', label: 'Priority Inbox', icon: Inbox, badge: unreadCount, badgeColor: 'bg-indigo-100 text-indigo-700' },
    { id: 'calendar', label: 'Calendar', icon: Calendar },
    { id: 'classroom', label: 'Classroom', icon: BookOpen },
    { id: 'actions', label: 'Actions', icon: CheckSquare, badge: pendingActions, badgeColor: 'bg-red-100 text-red-700' },
    { id: 'map', label: 'Campus Map', icon: MapPin },
    { id: 'connections', label: 'Connections', icon: ShieldCheck }
  ];

  const intelligenceNavItems: { id: NavTab; label: string; icon: React.ElementType; badge?: string }[] = [
    { id: 'campus-intelligence', label: 'Campus Intelligence', icon: Network },
    { id: 'change-conflict', label: 'Change & Conflict Radar', icon: GitCompare, badge: 'PS02' },
    { id: 'action-planning', label: 'Action & Planning', icon: CalendarDays },
    { id: 'student-briefing', label: 'Student Briefing', icon: Radio },
    { id: 'trust-privacy', label: 'Trust & Privacy', icon: Lock }
  ];

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      await triggerSync();
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <aside
      className={`relative flex flex-col justify-between h-screen bg-white border-r border-[#E7EAF3] transition-all duration-300 z-40 shrink-0 ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Top Section */}
      <div className="flex-1 overflow-y-auto">
        {/* Branding */}
        <div className="flex items-center justify-between p-4 border-b border-slate-100 sticky top-0 bg-white z-20">
          <div
            onClick={() => setCurrentTab('dashboard')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-700 to-purple-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform shrink-0 relative">
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
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
                    Operating Layer
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

        {/* Main Navigation */}
        <nav className="p-3 space-y-1">
          {mainNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => setCurrentTab(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-xs transition-all duration-200 cursor-pointer group relative ${
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
                  <span
                    className={`ml-auto px-2 py-0.5 text-[10px] font-bold rounded-full ${
                      item.badgeColor || 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}

          {/* Section Divider: CAMPUS INTELLIGENCE */}
          <div className="pt-4 pb-1">
            {!collapsed ? (
              <div className="px-3 text-[10px] font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <span>CAMPUS INTELLIGENCE</span>
              </div>
            ) : (
              <div className="h-px bg-slate-200 mx-3 my-2" />
            )}
          </div>

          {/* 5 Campus Intelligence Nav Items */}
          {intelligenceNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => setCurrentTab(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-xs transition-all duration-200 cursor-pointer group relative ${
                  isActive
                    ? 'bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-800 font-bold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
                title={collapsed ? item.label : undefined}
              >
                {isActive && (
                  <span className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-gradient-to-b from-indigo-600 to-purple-600 rounded-r-full" />
                )}
                <Icon
                  className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-110 ${
                    isActive ? 'text-indigo-600' : 'text-slate-400 group-hover:text-slate-600'
                  }`}
                />
                {!collapsed && <span className="truncate text-left flex-1">{item.label}</span>}
                {!collapsed && item.badge && (
                  <span className="ml-auto text-[9px] font-extrabold px-1.5 py-0.2 rounded bg-indigo-100 text-indigo-700">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}

          {/* Settings Section */}
          <div className="pt-4 border-t border-slate-100 mt-3">
            <button
              onClick={() => setCurrentTab('settings')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-xs transition-all duration-200 cursor-pointer group relative ${
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

      {/* Bottom Section: Real Live Google Sync Button */}
      <div className="p-3 border-t border-slate-100">
        <button
          onClick={handleSync}
          disabled={isSyncing}
          className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-gradient-to-r from-indigo-50 to-cyan-50 border border-indigo-200/80 text-indigo-800 hover:from-indigo-100 hover:to-cyan-100 transition-all text-xs font-semibold shadow-xs cursor-pointer disabled:opacity-50 ${
            collapsed ? 'justify-center' : ''
          }`}
          title="Synchronize with Google Services"
        >
          <RefreshCw className={`w-4 h-4 text-indigo-600 shrink-0 ${isSyncing ? 'animate-spin' : ''}`} />
          {!collapsed && (
            <div className="flex flex-col text-left">
              <span>{isSyncing ? 'Syncing...' : 'Sync Now'}</span>
              <span className="text-[10px] text-indigo-600 font-normal">Gmail · Classroom · Calendar</span>
            </div>
          )}
        </button>
      </div>
    </aside>
  );
};
