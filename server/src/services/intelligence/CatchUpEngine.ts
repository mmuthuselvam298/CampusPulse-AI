import { DatabaseService } from '../../db/DatabaseService';
import { RelationshipEngine } from '../relationships/RelationshipEngine';
import { CatchUpSummary } from '../../types';

export class CatchUpEngine {
  private static instance: CatchUpEngine;

  private constructor() {}

  public static getInstance(): CatchUpEngine {
    if (!CatchUpEngine.instance) {
      CatchUpEngine.instance = new CatchUpEngine();
    }
    return CatchUpEngine.instance;
  }

  public getCatchUpSummary(timeframe: CatchUpSummary['timeframe'] = 'since_yesterday'): CatchUpSummary {
    const db = DatabaseService.getInstance();
    const emails = db.getEmails();
    const actions = db.getActions().filter(a => !a.completed);
    const changes = RelationshipEngine.getWhatChanged(emails);

    let timeframeLabel = 'Since Yesterday (Last 24 Hours)';
    let analyzedSince = 'Sep 28, 2026, 12:00 PM';

    if (timeframe === 'today') {
      timeframeLabel = 'Today';
      analyzedSince = 'Sep 29, 2026, 00:00 AM';
    } else if (timeframe === 'last_3_days') {
      timeframeLabel = 'Last 3 Days';
      analyzedSince = 'Sep 26, 2026, 00:00 AM';
    } else if (timeframe === 'last_week') {
      timeframeLabel = 'Past 7 Days';
      analyzedSince = 'Sep 22, 2026, 00:00 AM';
    }

    const highlights: CatchUpSummary['highlights'] = [
      {
        category: 'EXAMS',
        title: 'CSE 204 Exam Venue Relocation',
        summary: 'Room changed from Central Lecture Hall A to Room S202, SR Block (Reporting: 8:40 AM).',
        type: 'CHANGE',
        sourceType: 'Gmail & Academic Notice',
        id: 'email-srm-003'
      },
      {
        category: 'EVENTS',
        title: 'Robotics Workshop Laboratory Update',
        summary: 'ROS 2 software prerequisites checklist issued; kickoff shifted to 11:00 AM in S204 SR Block.',
        type: 'CHANGE',
        sourceType: 'Gmail & Google Calendar',
        id: 'email-srm-002'
      },
      {
        category: 'HACKATHONS',
        title: 'Terrathon 2026 National Hackathon Registrations Open',
        summary: '36-hour sustainability hackathon announced with HatchLab incubation support and on-duty attendance.',
        type: 'INFO',
        sourceType: 'Directorate of Student Affairs',
        id: 'email-srm-024'
      },
      {
        category: 'ADMINISTRATION',
        title: 'Compensatory Working Day Circular',
        summary: 'Heavy rain closure on Sept 25 to be compensated by mandatory working day on Saturday, Oct 10.',
        type: 'CHANGE',
        sourceType: 'Registrar Circular',
        id: 'email-srm-012'
      }
    ];

    return {
      timeframe,
      timeframeLabel,
      analyzedSince,
      counts: {
        importantChanges: changes.length,
        newActions: actions.length,
        informationalUpdates: emails.length - actions.length,
        totalNotices: emails.length
      },
      highlights,
      topActions: actions.slice(0, 5)
    };
  }
}
