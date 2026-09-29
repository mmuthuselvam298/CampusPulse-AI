import React, { useState, useEffect } from 'react';
import { 
  History, 
  Clock, 
  Calendar, 
  Mail, 
  CheckCircle2, 
  GitCompare, 
  Layers,
  ArrowRight
} from 'lucide-react';
import { UnifiedEvent } from '../../types';
import { ApiService } from '../../services/api';
import { useApp } from '../../context/AppContext';

export const TimelinePage: React.FC = () => {
  const { setCurrentTab } = useApp();
  const [events, setEvents] = useState<UnifiedEvent[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string>('unified-robotics-workshop');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      setLoading(true);
      const res = await ApiService.getUnifiedEvents();
      setEvents(res);
    } catch (err) {
      console.error('Failed to load events:', err);
    } finally {
      setLoading(false);
    }
  };

  const selectedEvent = events.find(e => e.id === selectedEventId) || events[0];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center gap-2 text-indigo-600 text-xs font-bold uppercase tracking-wider mb-1">
          <History className="w-4 h-4" />
          <span>Chronological Information Evolution</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-heading">
          Timeline View
        </h1>
        <p className="text-sm text-slate-500 mt-1 max-w-2xl">
          Observe how university circulars, reminder alerts, venue relocations, and calendar bookings developed over time. Tracks the exact chain of custody for any campus event.
        </p>

        {/* Event selection pills */}
        <div className="flex items-center gap-2 mt-5 overflow-x-auto pb-1">
          {events.map(item => (
            <button
              key={item.id}
              onClick={() => setSelectedEventId(item.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                selectedEventId === item.id
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {item.title}
            </button>
          ))}
        </div>
      </div>

      {/* Selected Event Timeline */}
      {selectedEvent && (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 uppercase tracking-wider">
              {selectedEvent.category} · {selectedEvent.sourceCount} RECORDS
            </span>
            <h2 className="text-2xl font-bold text-slate-900 mt-2">
              {selectedEvent.title}
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Active Location: {selectedEvent.location || 'Neerukonda Campus'} · Scheduled: {selectedEvent.dateFormatted}
            </p>
          </div>

          {/* Stepper Timeline Nodes */}
          <div className="relative pl-6 sm:pl-8 space-y-8 before:absolute before:left-3 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200">
            {selectedEvent.timeline.map((step, idx) => (
              <div key={idx} className="relative group">
                {/* Timeline Node Icon */}
                <div className="absolute -left-6 sm:-left-8 top-1 w-6 h-6 rounded-full bg-white border-2 border-indigo-600 flex items-center justify-center shadow-xs">
                  <div className="w-2 h-2 rounded-full bg-indigo-600"></div>
                </div>

                <div className="bg-slate-50 p-4 sm:p-5 rounded-2xl border border-slate-200/80 hover:border-indigo-300 transition-all space-y-1.5">
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                    <span className="font-extrabold text-indigo-700">{step.date}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-600 uppercase tracking-wider">
                      {step.source}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900">
                    {step.title}
                  </h3>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
