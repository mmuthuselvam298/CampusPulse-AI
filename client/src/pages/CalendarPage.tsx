import React, { useState } from 'react';
import { Calendar as CalendarIcon, Clock, MapPin, Download, ExternalLink, ChevronLeft, ChevronRight } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const CalendarPage: React.FC = () => {
  const { openEmailById, addToast } = useApp();

  const calendarEvents = [
    {
      id: 'cal-1',
      title: 'CSE302 Database Systems Mid-Semester Exam',
      date: 'Wednesday, September 30, 2026',
      time: '9:00 AM – 11:00 AM',
      category: 'EXAMS',
      priority: 'CRITICAL',
      location: 'Block C – Hall 204 (Relocated)',
      emailId: 'email-001',
      color: 'bg-red-500'
    },
    {
      id: 'cal-2',
      title: 'Submit Signed Attendance Condonation Form',
      date: 'Friday, October 2, 2026',
      time: 'Due by 5:00 PM',
      category: 'ATTENDANCE',
      priority: 'HIGH',
      location: 'Room 114, Administrative Block',
      emailId: 'email-002',
      color: 'bg-orange-500'
    },
    {
      id: 'cal-3',
      title: 'Google Cloud Internship Application Closes',
      date: 'Saturday, October 3, 2026',
      time: '6:00 PM Sharp',
      category: 'PLACEMENTS',
      priority: 'HIGH',
      location: 'University Placement Portal',
      emailId: 'email-013',
      color: 'bg-purple-500'
    },
    {
      id: 'cal-4',
      title: 'CS304 Machine Learning Assignment 2 Due',
      date: 'Sunday, October 4, 2026',
      time: '11:59 PM',
      category: 'ASSIGNMENTS',
      priority: 'MEDIUM',
      location: 'Google Classroom / LMS',
      emailId: 'email-004',
      color: 'bg-indigo-500'
    },
    {
      id: 'cal-5',
      title: 'Fall Semester Fee Payment Deadline (No Fine)',
      date: 'Monday, October 5, 2026',
      time: '5:00 PM',
      category: 'FEES',
      priority: 'HIGH',
      location: 'Accounts Office / Online Portal',
      emailId: 'email-006',
      color: 'bg-emerald-500'
    },
    {
      id: 'cal-6',
      title: 'National Merit-cum-Means Scholarship Portal Closes',
      date: 'Thursday, October 8, 2026',
      time: '5:00 PM',
      category: 'SCHOLARSHIPS',
      priority: 'HIGH',
      location: 'Financial Aid Desk Room 202',
      emailId: 'email-015',
      color: 'bg-blue-500'
    }
  ];

  const exportICS = () => {
    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//CampusPulse AI//University Deadlines//EN
BEGIN:VEVENT
SUMMARY:CSE302 Database Systems Mid-Semester Exam
DTSTART:20260930T090000Z
DTEND:20260930T110000Z
LOCATION:Block C - Hall 204
DESCRIPTION:Relocated from Block A. Report by 8:40 AM with hall ticket.
END:VEVENT
END:VCALENDAR`;

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'campuspulse-schedule.ics');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    addToast({
      title: "📅 Calendar Sync File Generated",
      message: "campuspulse-schedule.ics exported for Google Calendar / Apple Calendar.",
      priority: "LOW"
    });
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight font-heading flex items-center gap-2">
            <CalendarIcon className="w-6 h-6 text-indigo-600" />
            <span>Deadlines & Academic Calendar</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Auto-populated from email deadlines, exam schedules, and department notices.
          </p>
        </div>

        <button
          onClick={exportICS}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all shadow-xs cursor-pointer self-start sm:self-auto"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export to Google Calendar (.ics)</span>
        </button>
      </div>

      {/* Events List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {calendarEvents.map((evt) => (
          <div
            key={evt.id}
            onClick={() => openEmailById(evt.emailId)}
            className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs hover:shadow-md hover:border-indigo-200 transition-all cursor-pointer flex flex-col justify-between space-y-3"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded text-white bg-indigo-600">
                  {evt.category}
                </span>

                <span className="text-xs font-semibold text-slate-500">
                  {evt.date}
                </span>
              </div>

              <h4 className="text-sm font-bold text-slate-900 leading-snug">
                {evt.title}
              </h4>
            </div>

            <div className="pt-3 border-t border-slate-100 flex flex-col gap-1.5 text-xs text-slate-600">
              <div className="flex items-center gap-1.5 font-medium">
                <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>{evt.time}</span>
              </div>

              {evt.location && (
                <div className="flex items-center gap-1.5 font-medium">
                  <MapPin className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                  <span className="truncate">{evt.location}</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
