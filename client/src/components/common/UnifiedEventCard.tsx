import React from 'react';
import { 
  Calendar, 
  MapPin, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  Sparkles, 
  Layers, 
  Mail, 
  BookOpen, 
  ArrowRight,
  GitCompare,
  ExternalLink
} from 'lucide-react';
import { UnifiedEvent } from '../../types';
import { useApp } from '../../context/AppContext';

interface UnifiedEventCardProps {
  event: UnifiedEvent;
  onOpenTruth?: (event: UnifiedEvent) => void;
  onOpenSources?: (event: UnifiedEvent) => void;
  onOpenDetails?: (event: UnifiedEvent) => void;
}

export const UnifiedEventCard: React.FC<UnifiedEventCardProps> = ({
  event,
  onOpenTruth,
  onOpenSources,
  onOpenDetails
}) => {
  const { setCurrentTab, openEmailById } = useApp();

  const getStatusColor = (status: UnifiedEvent['status']) => {
    switch (status) {
      case 'Confirmed':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Conflicting':
        return 'bg-amber-50 text-amber-700 border-amber-300 animate-pulse';
      case 'Changed':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'Postponed':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 hover:border-indigo-300 transition-all shadow-sm hover:shadow-md p-5 flex flex-col justify-between group">
      <div>
        {/* Header row: Category, Priority, and Status badge */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
              {event.category}
            </span>
            {event.priority === 'CRITICAL' && (
              <span className="text-[10px] font-bold bg-rose-100 text-rose-700 px-1.5 py-0.5 rounded">
                CRITICAL
              </span>
            )}
          </div>
          <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border flex items-center gap-1 ${getStatusColor(event.status)}`}>
            {event.status === 'Conflicting' && <AlertTriangle className="w-3 h-3 text-amber-600" />}
            {event.status === 'Confirmed' && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
            {event.status}
          </span>
        </div>

        {/* Title */}
        <h3 className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors mb-2 line-clamp-2">
          {event.title}
        </h3>

        {/* Schedule & Location */}
        <div className="space-y-1.5 text-xs text-slate-600 mb-4 bg-slate-50/60 p-2.5 rounded-xl border border-slate-100">
          <div className="flex items-center gap-2">
            <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="font-semibold text-slate-800">{event.dateFormatted}</span>
            <span className="text-slate-400">·</span>
            <span>{event.timeFormatted}</span>
          </div>
          {event.location && (
            <div className="flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="truncate">{event.location}</span>
            </div>
          )}
        </div>

        {/* Cross-System Sources Badges */}
        <div className="mb-4">
          <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1.5 font-medium">
            <span>Synchronized Sources</span>
            <span className="font-semibold text-indigo-600">{event.sourceCount} records condensed</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {event.relatedEmailCount > 0 && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-50 text-red-700 border border-red-200/60 rounded-md text-[11px] font-medium">
                <Mail className="w-3 h-3" />
                Gmail ({event.relatedEmailCount})
              </span>
            )}
            {event.hasClassroom && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200/60 rounded-md text-[11px] font-medium">
                <BookOpen className="w-3 h-3" />
                Classroom
              </span>
            )}
            {event.hasCalendar && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-200/60 rounded-md text-[11px] font-medium">
                <Calendar className="w-3 h-3" />
                Google Calendar
              </span>
            )}
          </div>
        </div>

        {/* Warning callout if Conflict Detected */}
        {event.conflicts.length > 0 && (
          <div className="mb-4 p-2.5 rounded-xl bg-amber-50/80 border border-amber-200 text-xs text-amber-900 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-bold text-[11px] uppercase tracking-wide text-amber-800">Cross-System Discrepancy</p>
              <p className="text-[11px] mt-0.5 text-amber-700 leading-tight">
                {event.conflicts[0].currentKnownState}
              </p>
            </div>
          </div>
        )}

        {/* Primary Action preview */}
        {event.actions.length > 0 && (
          <div className="mb-4 p-2.5 rounded-xl bg-indigo-50/60 border border-indigo-100 text-xs text-indigo-950 flex items-center justify-between">
            <div className="flex items-center gap-2 truncate">
              <span className="w-2 h-2 rounded-full bg-indigo-600 shrink-0"></span>
              <span className="font-medium truncate">{event.actions[0].title}</span>
            </div>
            <span className="text-[10px] text-indigo-600 font-bold shrink-0 ml-2">
              {event.actions[0].deadline || 'Action Item'}
            </span>
          </div>
        )}
      </div>

      {/* Action Footer */}
      <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
        <button
          onClick={() => {
            if (onOpenTruth) onOpenTruth(event);
            else setCurrentTab('truth-resolution');
          }}
          className="text-xs font-semibold text-slate-700 hover:text-indigo-600 flex items-center gap-1 transition-colors cursor-pointer"
        >
          <GitCompare className="w-3.5 h-3.5 text-slate-400" />
          <span>Truth View</span>
        </button>

        <div className="flex items-center gap-1.5">
          {event.sources[0]?.id && (
            <button
              onClick={() => openEmailById(event.sources[0].id)}
              className="text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
              title="View source message"
            >
              Sources
            </button>
          )}

          <button
            onClick={() => {
              if (onOpenDetails) onOpenDetails(event);
              else setCurrentTab('information-hub');
            }}
            className="text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 px-3 py-1 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
          >
            <span>Intelligence</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
};
