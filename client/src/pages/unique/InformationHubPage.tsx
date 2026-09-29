import React, { useState, useEffect } from 'react';
import { 
  Layers, 
  Sparkles, 
  Calendar, 
  Mail, 
  BookOpen, 
  Search, 
  ArrowRight,
  Filter
} from 'lucide-react';
import { UnifiedEvent } from '../../types';
import { ApiService } from '../../services/api';
import { UnifiedEventCard } from '../../components/common/UnifiedEventCard';
import { useApp } from '../../context/AppContext';

export const InformationHubPage: React.FC = () => {
  const { setCurrentTab } = useApp();
  const [events, setEvents] = useState<UnifiedEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      setLoading(true);
      const res = await ApiService.getUnifiedEvents();
      setEvents(res);
    } catch (err) {
      console.error('Failed to load unified events:', err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = events.filter(e => {
    const matchesCat = categoryFilter === 'ALL' || e.category === categoryFilter;
    const matchesSearch = !search || 
      e.title.toLowerCase().includes(search.toLowerCase()) ||
      (e.location && e.location.toLowerCase().includes(search.toLowerCase()));
    return matchesCat && matchesSearch;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center gap-2 text-indigo-600 text-xs font-bold uppercase tracking-wider mb-1">
          <Layers className="w-4 h-4" />
          <span>One Event · One Card · Zero Redundancy</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-heading">
          Information Hub
        </h1>
        <p className="text-sm text-slate-500 mt-1 max-w-2xl">
          Demonstrates advanced information compression. When an event is fragmented across multiple email announcements, Google Classroom posts, and calendar entries, CampusPulse fuses them into a single intelligence card.
        </p>

        {/* Search & Filter Bar */}
        <div className="mt-5 flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Filter unified events by title or location..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
            {['ALL', 'EVENTS', 'ACADEMICS', 'EXAMS', 'HACKATHONS', 'ADMINISTRATION'].map(cat => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  categoryFilter === cat
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grid of Unified Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map(event => (
          <UnifiedEventCard
            key={event.id}
            event={event}
            onOpenTruth={() => setCurrentTab('truth-resolution')}
            onOpenSources={() => setCurrentTab('inbox')}
            onOpenDetails={() => setCurrentTab('truth-resolution')}
          />
        ))}
      </div>
    </div>
  );
};
