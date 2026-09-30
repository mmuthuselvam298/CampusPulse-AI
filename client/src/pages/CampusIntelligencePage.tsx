import React, { useState, useEffect } from 'react';
import { 
  Network, 
  Search, 
  Layers, 
  GitBranch, 
  ArrowRight,
  Filter
} from 'lucide-react';
import { ApiService } from '../services/api';
import { useApp } from '../context/AppContext';
import { 
  UnifiedEvent, 
  KnowledgeGraphData, 
  KnowledgeGraphNode 
} from '../types';

export const CampusIntelligencePage: React.FC = () => {
  const { openEmailById, setCurrentTab } = useApp();
  const [activeTab, setActiveTab] = useState<'unified' | 'graph' | 'timeline' | 'search'>('unified');
  
  // Data states
  const [unifiedEvents, setUnifiedEvents] = useState<UnifiedEvent[]>([]);
  const [graphData, setGraphData] = useState<KnowledgeGraphData | null>(null);
  const [selectedNode, setSelectedNode] = useState<KnowledgeGraphNode | null>(null);
  const [graphFilter, setGraphFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [events, graph] = await Promise.all([
        ApiService.getUnifiedEvents(),
        ApiService.getKnowledgeGraph()
      ]);
      setUnifiedEvents(events);
      setGraphData(graph);
      if (graph.nodes.length > 0) {
        setSelectedNode(graph.nodes[0]);
      }
    } catch (err) {
      console.error('Failed to load campus intelligence data:', err);
    }
  };

  const handleSearch = async (q: string) => {
    setSearchQuery(q);
    if (!q.trim()) {
      setSearchResults([]);
      return;
    }
    setIsSearching(true);
    try {
      const res = await ApiService.searchCampus(q);
      const combined: any[] = [];
      if (res.emails) {
        res.emails.forEach(e => combined.push({ source: 'Gmail', title: e.subject, snippet: e.summary, timestamp: e.dateFormatted }));
      }
      if (res.coursework) {
        res.coursework.forEach(c => combined.push({ source: 'Classroom', title: c.title, snippet: c.description || c.courseName, timestamp: c.dueDate }));
      }
      if (res.calendarEvents) {
        res.calendarEvents.forEach(ev => combined.push({ source: 'Calendar', title: ev.title, snippet: ev.description || ev.location, timestamp: ev.startTime }));
      }
      if (res.actions) {
        res.actions.forEach(a => combined.push({ source: 'Action', title: a.title, snippet: a.sourceEmailSubject, timestamp: a.deadline }));
      }
      setSearchResults(combined);
    } catch (err) {
      console.error('Search failed:', err);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 animate-in fade-in duration-200">
      {/* Hero Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white shadow-xl border border-indigo-800/40 relative overflow-hidden">
        <div className="relative z-10 space-y-1.5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 text-xs font-semibold">
            <Network className="w-3.5 h-3.5" />
            <span>Cross-System Intelligence Layer</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-heading">
            Campus Intelligence
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
            Unifying fragmented university information across Gmail, Google Classroom, and Calendar into connected knowledge, timelines, and unified events.
          </p>
        </div>

        {/* View Switcher Tabs */}
        <div className="relative z-10 flex flex-wrap gap-1.5 bg-white/10 backdrop-blur-md p-1.5 rounded-2xl border border-white/15 self-start md:self-auto">
          {[
            { id: 'unified', label: 'Unified Events', icon: Layers },
            { id: 'graph', label: 'Knowledge Graph', icon: Network },
            { id: 'timeline', label: 'Info Timeline', icon: GitBranch },
            { id: 'search', label: 'Global Search', icon: Search }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-white text-slate-900 shadow-md scale-102'
                    : 'text-slate-300 hover:text-white hover:bg-white/10'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-indigo-600' : ''}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* TAB 1: UNIFIED EVENTS */}
      {activeTab === 'unified' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 font-heading">
                Unified Information Records ({unifiedEvents.length})
              </h3>
              <p className="text-xs text-slate-500">
                Multiple emails, classroom notices, and calendar items compressed into authoritative cards.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {unifiedEvents.map((event) => (
              <div
                key={event.id}
                className="p-5 rounded-2xl bg-white border border-[#E7EAF3] hover:border-indigo-300 shadow-xs hover:shadow-md transition-all space-y-4 relative"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-700 uppercase">
                      {event.category}
                    </span>
                    <h4 className="text-sm font-bold text-slate-900 leading-snug">{event.title}</h4>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${
                    event.priority === 'CRITICAL' ? 'bg-red-100 text-red-700' :
                    event.priority === 'HIGH' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-700'
                  }`}>
                    {event.priority}
                  </span>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">
                  {event.whyItMatters?.[0] || 'Authoritative university record synthesized from cross-system communications.'}
                </p>

                {/* Key metadata grid */}
                <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <div>
                    <span className="text-[10px] text-slate-400 font-medium">When</span>
                    <p className="font-semibold text-slate-800">{event.dateFormatted} · {event.timeFormatted}</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-medium">Location</span>
                    <p className="font-semibold text-slate-800 truncate">{event.location || 'Online'}</p>
                  </div>
                </div>

                {/* Sources Bar */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] font-medium text-slate-400">Sources ({event.sources.length}):</span>
                    {event.sources.map((src, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-200 uppercase"
                      >
                        {src.type}
                      </span>
                    ))}
                  </div>

                  {event.conflicts && event.conflicts.length > 0 && (
                    <button
                      onClick={() => setCurrentTab('change-conflict')}
                      className="text-[11px] font-bold text-amber-600 hover:text-amber-700 bg-amber-50 px-2 py-0.5 rounded cursor-pointer"
                    >
                      {event.conflicts.length} Conflict Detected →
                    </button>
                  )}
                </div>

                {event.actions && event.actions.length > 0 && (
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-indigo-50/60 border border-indigo-100 text-xs">
                    <span className="font-semibold text-indigo-900 truncate">⚡ {event.actions[0].title}</span>
                    <button
                      onClick={() => setCurrentTab('actions')}
                      className="text-[11px] font-bold text-indigo-600 hover:underline shrink-0"
                    >
                      View Action
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: KNOWLEDGE GRAPH */}
      {activeTab === 'graph' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-white border border-[#E7EAF3] shadow-xs">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-400" />
              <span className="text-xs font-bold text-slate-700">Filter Nodes:</span>
              <div className="flex flex-wrap gap-1">
                {['ALL', 'COURSE', 'CLASSROOM', 'CALENDAR', 'GMAIL', 'ACTION', 'DEADLINE'].map((f) => (
                  <button
                    key={f}
                    onClick={() => setGraphFilter(f)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                      graphFilter === f
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>
            <span className="text-xs text-slate-500 font-mono">
              {graphData?.nodes?.length || 0} Nodes · {graphData?.edges?.length || 0} Semantic Edges
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Visual Node Cloud Canvas */}
            <div className="lg:col-span-2 p-6 rounded-3xl bg-slate-900 text-white border border-slate-800 shadow-xl min-h-[450px] relative overflow-hidden flex flex-col justify-between">
              <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
              <div className="flex items-center justify-between text-xs text-slate-400 pb-4 border-b border-slate-800">
                <span>Semantic Campus Relationships</span>
                <span>Click any node to inspect evidence</span>
              </div>

              {/* Node Chips Matrix */}
              <div className="py-6 flex flex-wrap gap-2.5 items-center justify-center max-h-[350px] overflow-y-auto">
                {graphData?.nodes
                  ?.filter(n => graphFilter === 'ALL' || n.type === graphFilter)
                  .map((node) => {
                    const isSelected = selectedNode?.id === node.id;
                    const typeColors: Record<string, string> = {
                      TOPIC: 'bg-indigo-600 text-white border-indigo-400',
                      COURSE: 'bg-blue-600/30 text-blue-300 border-blue-500/50',
                      CLASSROOM: 'bg-emerald-600/30 text-emerald-300 border-emerald-500/50',
                      CALENDAR: 'bg-purple-600/30 text-purple-300 border-purple-500/50',
                      GMAIL: 'bg-rose-600/30 text-rose-300 border-rose-500/50',
                      ACTION: 'bg-amber-600/30 text-amber-300 border-amber-500/50',
                      DEADLINE: 'bg-red-600/30 text-red-300 border-red-500/50'
                    };

                    return (
                      <button
                        key={node.id}
                        onClick={() => setSelectedNode(node)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer hover:scale-105 flex items-center gap-1.5 ${
                          typeColors[node.type] || 'bg-slate-800 text-slate-200 border-slate-700'
                        } ${isSelected ? 'ring-2 ring-white shadow-lg scale-105' : 'opacity-90'}`}
                      >
                        <span className="text-[10px] font-mono opacity-70">[{node.type}]</span>
                        <span className="truncate max-w-[200px]">{node.label}</span>
                      </button>
                    );
                  })}
              </div>

              <div className="flex items-center justify-between text-xs text-slate-500 pt-4 border-t border-slate-800">
                <span>Interactive SQLite Graph</span>
                <span>SRM AP Knowledge Domain</span>
              </div>
            </div>

            {/* Node Inspector Panel */}
            <div className="p-6 rounded-3xl bg-white border border-[#E7EAF3] shadow-xs space-y-4">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Node Inspector
              </h4>
              {selectedNode ? (
                <div className="space-y-4 animate-in fade-in duration-150">
                  <div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-700 uppercase">
                      {selectedNode.type}
                    </span>
                    <h3 className="text-base font-bold text-slate-900 mt-1">{selectedNode.label}</h3>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Source Layer</span>
                      <span className="font-semibold text-slate-800">{selectedNode.source}</span>
                    </div>

                    {selectedNode.details && (
                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                        <span className="text-slate-400 block text-[10px] uppercase font-bold">Metadata</span>
                        {Object.entries(selectedNode.details).map(([k, v]) => (
                          <div key={k} className="flex justify-between">
                            <span className="text-slate-500 capitalize">{k}:</span>
                            <span className="font-medium text-slate-800">{String(v)}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Connected Edges */}
                    <div className="p-3 rounded-xl bg-indigo-50/60 border border-indigo-100 space-y-2">
                      <span className="text-indigo-900 block text-[10px] uppercase font-bold">Connected Links</span>
                      {graphData?.edges
                        ?.filter(e => e.source === selectedNode.id || e.target === selectedNode.id)
                        .slice(0, 4)
                        .map(e => (
                          <div key={e.id} className="text-[11px] text-indigo-700 flex items-center gap-1.5">
                            <ArrowRight className="w-3 h-3 text-indigo-500" />
                            <span>{e.label}</span>
                          </div>
                        ))}
                    </div>
                  </div>

                  {selectedNode.source === 'gmail' && selectedNode.sourceId && (
                    <button
                      onClick={() => openEmailById(selectedNode.sourceId!)}
                      className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
                    >
                      Open Grounding Email
                    </button>
                  )}
                </div>
              ) : (
                <p className="text-xs text-slate-400">Select any node from the graph to inspect details.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: TIMELINE */}
      {activeTab === 'timeline' && (
        <div className="p-6 rounded-3xl bg-white border border-[#E7EAF3] shadow-xs space-y-6">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 font-heading">
              Cross-Source Evolution Timeline
            </h3>
            <p className="text-xs text-slate-500">
              Traces how notices evolved from initial announcements to calendar bookings and late modifications.
            </p>
          </div>

          <div className="relative pl-6 space-y-8 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-indigo-100">
            {[
              {
                time: "Sep 28, 09:30 AM",
                source: "Gmail (Dr. Teja Krishna Mamidi)",
                title: "Initial Robotics Workshop Announcement",
                status: "Original Notice",
                badge: "bg-blue-100 text-blue-700",
                desc: "Autonomous Robotics Workshop announced for S202 SR Block, 10:00 AM kickoff."
              },
              {
                time: "Sep 29, 10:00 AM",
                source: "Google Calendar Booking",
                title: "Calendar Event Registered: 11:00 AM Start",
                status: "Scheduled",
                badge: "bg-purple-100 text-purple-700",
                desc: "Entry scheduled for 11:00 AM – 4:00 PM with venue designated as Room S204."
              },
              {
                time: "Sep 29, 04:15 PM",
                source: "Gmail (Office of Examinations)",
                title: "Emergency Venue Relocation Notice",
                status: "Change Detected",
                badge: "bg-amber-100 text-amber-700",
                desc: "CSE 204 Exam shifted from Main Hall to S202, SR Block with revised 08:35 AM reporting cutoff."
              },
              {
                time: "Sep 30, 08:00 AM",
                source: "CampusPulse AI Engine",
                title: "Truth Resolution & Conflict Raised",
                status: "Resolved",
                badge: "bg-emerald-100 text-emerald-700",
                desc: "Cross-checked conflicting times between Gmail circulars and Calendar slot; surfaced authoritative resolution."
              }
            ].map((step, idx) => (
              <div key={idx} className="relative group">
                <span className="absolute -left-6 top-1.5 w-3 h-3 rounded-full bg-indigo-600 border-2 border-white shadow-xs group-hover:scale-125 transition-transform" />
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900">{step.title}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.2 rounded ${step.badge}`}>
                      {step.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-slate-500">
                    <span>{step.time}</span>
                    <span>·</span>
                    <span className="font-medium text-slate-700">{step.source}</span>
                  </div>
                  <p className="text-xs text-slate-600 pt-1 leading-relaxed max-w-3xl">
                    {step.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: GLOBAL SEARCH */}
      {activeTab === 'search' && (
        <div className="p-6 rounded-3xl bg-white border border-[#E7EAF3] shadow-xs space-y-6">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 font-heading">
              Global Campus Intelligence Search
            </h3>
            <p className="text-xs text-slate-500">
              Query semantic links across Gmail notices, Classroom coursework, Calendar slots, and Actions.
            </p>
          </div>

          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Search across all sources (e.g. robotics, algorithms, fee, hall ticket, S202)..."
              className="w-full pl-11 pr-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-sm outline-none focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all text-slate-800"
            />
          </div>

          {isSearching && (
            <div className="text-center py-8 text-xs text-slate-400">
              Searching campus information layers...
            </div>
          )}

          {!isSearching && searchQuery && searchResults.length === 0 && (
            <div className="text-center py-8 text-xs text-slate-500">
              No matching records found for "{searchQuery}".
            </div>
          )}

          <div className="space-y-3">
            {searchResults.map((item, i) => (
              <div
                key={i}
                className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-white hover:border-indigo-200 transition-all space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-100 text-indigo-700 uppercase">
                      {item.source}
                    </span>
                    <h5 className="text-xs font-bold text-slate-900">{item.title}</h5>
                  </div>
                  {item.timestamp && (
                    <span className="text-[10px] text-slate-400">{item.timestamp}</span>
                  )}
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {item.snippet}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
