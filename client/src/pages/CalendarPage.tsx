import React, { useState } from 'react';
import { Calendar as CalendarIcon, Clock, MapPin, Download, ExternalLink, ChevronLeft, ChevronRight } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const CalendarPage: React.FC = () => {
  const { openEmailById, addToast } = useApp();

  const calendarEvents = [
    {
      id: 'cal-1',
      title: 'CSE 204 Algorithms Mid-Term Exam (Venue Relocated)',
      date: 'Wednesday, September 30, 2026',
      time: '10:00 AM – 01:00 PM',
      category: 'EXAMS',
      priority: 'CRITICAL',
      location: 'S202, SR Block (SEAS)',
      emailId: 'email-001',
      color: 'bg-red-500'
    },
    {
      id: 'cal-2',
      title: 'Techfest IIT Bombay Robotics Workshop',
      date: 'Wednesday, September 30, 2026',
      time: '10:00 AM – 04:00 PM',
      category: 'EVENTS',
      priority: 'HIGH',
      location: 'S202, SR Block (Dr. Teja Krishna Mamidi, Mech Engg)',
      emailId: 'email-010',
      color: 'bg-indigo-500'
    },
    {
      id: 'cal-3',
      title: 'ACM Student Chapter Recruitment Applications Close',
      date: 'Wednesday, September 30, 2026',
      time: 'Due by 11:59 PM',
      category: 'STUDENT CLUBS',
      priority: 'MEDIUM',
      location: 'Online Application Portal (acm.core@srmap.edu.in)',
      emailId: 'email-011',
      color: 'bg-violet-500'
    },
    {
      id: 'cal-4',
      title: 'CEL Mentor Review & Pitch Deck Submission',
      date: 'Friday, October 2, 2026',
      time: 'Due by 12:00 PM (Review 3:50 PM)',
      category: 'ENTREPRENEURSHIP',
      priority: 'HIGH',
      location: 'Directorate of Entrepreneurship & Innovation',
      emailId: 'email-013',
      color: 'bg-amber-500'
    },
    {
      id: 'cal-5',
      title: 'GDG Google Solution Hunt Challenge Registration',
      date: 'Sunday, October 4, 2026',
      time: '11:59 PM',
      category: 'HACKATHONS',
      priority: 'MEDIUM',
      location: 'X-Lab Auditorium, Neerukonda',
      emailId: 'email-014',
      color: 'bg-blue-500'
    },
    {
      id: 'cal-6',
      title: 'Odd Semester Tuition Fee Installment Deadline (No Fine)',
      date: 'Monday, October 5, 2026',
      time: '5:00 PM',
      category: 'FEES',
      priority: 'HIGH',
      location: 'Student Finance Portal / Accounts Desk',
      emailId: 'email-006',
      color: 'bg-emerald-500'
    },
    {
      id: 'cal-7',
      title: 'Compensatory Working Saturday (Rain Makeup Day)',
      date: 'Saturday, October 10, 2026',
      time: '09:00 AM – 04:30 PM (Friday Timetable)',
      category: 'ADMINISTRATION',
      priority: 'HIGH',
      location: 'All SEAS Academic Blocks',
      emailId: 'email-012',
      color: 'bg-purple-500'
    }
  ];

  const exportICS = () => {
    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//CampusPulse AI//SRM University-AP Schedule//EN
BEGIN:VEVENT
SUMMARY:CSE 204 Algorithms Mid-Term Exam (S202 SR Block)
DTSTART:20260930T100000Z
DTEND:20260930T130000Z
LOCATION:S202, SR Block, SRM University-AP
DESCRIPTION:Relocated from Block A. Arrive by 09:30 AM with physical Hall Ticket.
END:VEVENT
BEGIN:VEVENT
SUMMARY:SRM AP Compensatory Working Day (Friday Timetable)
DTSTART:20261010T090000Z
DTEND:20261010T163000Z
LOCATION:SRM University-AP, Neerukonda Campus
DESCRIPTION:Compensatory working day for Sept 25 heavy rainfall closure.
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
