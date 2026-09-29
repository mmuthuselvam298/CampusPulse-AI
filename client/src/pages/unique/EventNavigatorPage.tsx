import React, { useState } from 'react';
import { 
  MapPin, 
  Navigation, 
  ExternalLink, 
  Building2, 
  Compass, 
  Calendar,
  Info
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const EventNavigatorPage: React.FC = () => {
  const { emails, openEmailById } = useApp();

  const locations = [
    {
      eventTitle: 'Hands-On Robotics Workshop (Techfest IIT Bombay)',
      room: 'Room S204, SR Block',
      block: 'SR Block (2nd Floor)',
      campus: 'SRM University-AP, Neerukonda, Mangalagiri',
      source: 'Gmail & Google Calendar',
      sourceId: 'email-srm-002',
      coordinates: { lat: 16.4649, lng: 80.5078 }
    },
    {
      eventTitle: 'CSE 204 Algorithms Mid-Semester Exam',
      room: 'Room S202, SR Block',
      block: 'SR Block (2nd Floor)',
      campus: 'SRM University-AP, Neerukonda, Mangalagiri',
      source: 'Gmail (HOD Dept of CSE)',
      sourceId: 'email-srm-003',
      coordinates: { lat: 16.4649, lng: 80.5078 }
    },
    {
      eventTitle: 'CSE 213: AI Tools Club Quiz',
      room: 'CV 704 / X-Lab',
      block: 'C. V. Raman Block (7th Floor)',
      campus: 'SRM University-AP, Neerukonda, Mangalagiri',
      source: 'Google Classroom',
      sourceId: 'email-srm-001',
      coordinates: { lat: 16.4655, lng: 80.5085 }
    },
    {
      eventTitle: 'Terrathon 2026 Sustainability Hackathon',
      room: 'APJ Abdul Kalam Auditorium',
      block: 'Central Academic Block',
      campus: 'SRM University-AP, Neerukonda, Mangalagiri',
      source: 'Directorate of Student Affairs',
      sourceId: 'email-srm-024',
      coordinates: { lat: 16.4635, lng: 80.5070 }
    },
    {
      eventTitle: 'CEL Mentor Review Deck Pitching',
      room: 'Directorate of Entrepreneurship, Level 2',
      block: 'Administration & Innovation Tower',
      campus: 'SRM University-AP, Neerukonda, Mangalagiri',
      source: 'CEL 101 Minor',
      sourceId: 'email-srm-007',
      coordinates: { lat: 16.4640, lng: 80.5072 }
    },
    {
      eventTitle: 'Attendance Condonation Form Submission',
      room: 'Room 114, Administrative Block',
      block: 'Administrative Block (Ground Floor)',
      campus: 'SRM University-AP, Neerukonda, Mangalagiri',
      source: 'Academic Affairs Office',
      sourceId: 'email-srm-004',
      coordinates: { lat: 16.4638, lng: 80.5074 }
    }
  ];

  const handleOpenMaps = (loc: typeof locations[0]) => {
    const query = encodeURIComponent(`${loc.room}, ${loc.campus}`);
    window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center gap-2 text-indigo-600 text-xs font-bold uppercase tracking-wider mb-1">
          <MapPin className="w-4 h-4" />
          <span>Physical Campus Venues</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-heading">
          Campus Event Navigator
        </h1>
        <p className="text-sm text-slate-500 mt-1 max-w-2xl">
          Locate physical exam halls, engineering laboratories, and auditoriums directly from extracted university communications.
        </p>

        <div className="mt-4 p-3 rounded-2xl bg-amber-50/80 border border-amber-200/80 text-xs text-amber-900 flex items-center gap-2 max-w-xl">
          <Info className="w-4 h-4 text-amber-600 shrink-0" />
          <span>Location extracted from university communication. Navigates using SRM AP campus coordinates.</span>
        </div>
      </div>

      {/* Grid of Locations */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {locations.map((loc, idx) => (
          <div
            key={idx}
            className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                <span className="font-semibold">{loc.block}</span>
                <span className="text-[11px] bg-slate-100 px-2 py-0.5 rounded text-slate-600">{loc.source}</span>
              </div>

              <h3 className="text-base font-bold text-slate-900 mb-1">
                {loc.eventTitle}
              </h3>

              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 text-xs my-3 space-y-1">
                <div className="flex items-center gap-2 font-bold text-indigo-700">
                  <Building2 className="w-4 h-4 text-indigo-500 shrink-0" />
                  <span>{loc.room}</span>
                </div>
                <div className="text-slate-500 pl-6 text-[11px]">
                  {loc.campus}
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2 mt-2">
              <button
                onClick={() => openEmailById(loc.sourceId)}
                className="text-xs font-bold text-slate-600 hover:text-indigo-600 cursor-pointer"
              >
                View Notice
              </button>

              <button
                onClick={() => handleOpenMaps(loc)}
                className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Navigation className="w-3.5 h-3.5" />
                <span>Open in Google Maps</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
