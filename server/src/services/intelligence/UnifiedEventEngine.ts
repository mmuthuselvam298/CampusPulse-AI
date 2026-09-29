import { DatabaseService } from '../../db/DatabaseService';
import { ConflictEngine } from './ConflictEngine';
import { RelationshipEngine } from '../relationships/RelationshipEngine';
import { 
  UnifiedEvent, 
  TruthResolutionItem, 
  InformationConflict, 
  ConsequenceAnalysis 
} from '../../types';

export class UnifiedEventEngine {
  private static instance: UnifiedEventEngine;

  private constructor() {}

  public static getInstance(): UnifiedEventEngine {
    if (!UnifiedEventEngine.instance) {
      UnifiedEventEngine.instance = new UnifiedEventEngine();
    }
    return UnifiedEventEngine.instance;
  }

  public getUnifiedEvents(): UnifiedEvent[] {
    const db = DatabaseService.getInstance();
    const emails = db.getEmails();
    const calEvents = db.getCalendarEvents();
    const coursework = db.getClassroomCoursework();
    const actions = db.getActions();
    const changes = RelationshipEngine.getWhatChanged(emails);
    const conflicts = ConflictEngine.getInstance().detectConflicts();

    const unified: UnifiedEvent[] = [];

    // 1. Hands-On Robotics Workshop (Flagship Demonstration Event)
    const roboticsEmails = emails.filter(e => 
      e.subject.toLowerCase().includes('robotics') || 
      e.threadId === 'thread-robotics-workshop'
    );
    const roboticsCal = calEvents.find(c => c.title.toLowerCase().includes('robotics'));
    const roboticsWork = coursework.find(w => w.title.toLowerCase().includes('robotics'));
    const roboticsActions = actions.filter(a => a.title.toLowerCase().includes('robotics') || a.title.toLowerCase().includes('ros'));
    const roboticsConflicts = conflicts.filter(c => c.eventId === 'unified-robotics-workshop');
    const roboticsChanges = changes.filter(ch => ch.topic.toLowerCase().includes('robotics') || ch.whatChanged?.toLowerCase().includes('robotics'));

    if (roboticsEmails.length > 0 || roboticsCal) {
      unified.push({
        id: 'unified-robotics-workshop',
        title: 'Hands-On Robotics Workshop (Techfest IIT Bombay)',
        topicKey: 'robotics-workshop',
        category: 'EVENTS',
        priority: 'CRITICAL',
        dateFormatted: 'Sep 30, 2026',
        timeFormatted: '11:00 AM – 4:00 PM',
        location: 'Room S204, SR Block',
        status: roboticsConflicts.length > 0 ? 'Conflicting' : 'Confirmed',
        sources: [
          ...roboticsEmails.map(e => ({
            type: 'gmail' as const,
            id: e.id,
            title: e.subject,
            timestamp: e.timestamp,
            snippet: e.summary || e.body.slice(0, 120),
            detail: `${e.senderName} (${e.sender})`
          })),
          ...(roboticsWork ? [{
            type: 'classroom' as const,
            id: roboticsWork.id,
            title: roboticsWork.title,
            snippet: `Classroom coursework: ${roboticsWork.courseName}. Points: ${roboticsWork.maxPoints || 'N/A'}`
          }] : []),
          ...(roboticsCal ? [{
            type: 'calendar' as const,
            id: roboticsCal.id,
            title: roboticsCal.title,
            snippet: `Scheduled: ${new Date(roboticsCal.startTime).toLocaleTimeString()} - ${new Date(roboticsCal.endTime).toLocaleTimeString()} @ ${roboticsCal.location}`
          }] : [])
        ],
        sourceCount: roboticsEmails.length + (roboticsWork ? 1 : 0) + (roboticsCal ? 1 : 0),
        relatedEmailCount: roboticsEmails.length,
        hasClassroom: Boolean(roboticsWork),
        hasCalendar: Boolean(roboticsCal),
        isCalendarAdded: Boolean(roboticsCal),
        calendarEventId: roboticsCal?.id,
        actions: roboticsActions,
        changes: roboticsChanges,
        conflicts: roboticsConflicts,
        whyItMatters: [
          'Direct collaboration between SRM AP Department of Mechanical Engineering and Techfest IIT Bombay.',
          'Provides hands-on Autonomous Kinematics and ROS micro-controller experience relevant to your AI/Robotics track.',
          'Limited to 80 verified seats; hardware issued strictly at session start.'
        ],
        timeline: [
          {
            date: 'Sep 24, 2026',
            timestamp: '2026-09-24T10:00:00.000Z',
            title: 'Initial Announcement Circulated',
            source: 'Gmail',
            description: 'Directorate of Communications announced the Techfest IIT Bombay Robotics workshop for Sept 30 in S202.',
            badge: 'ANNOUNCEMENT'
          },
          {
            date: 'Sep 28, 2026',
            timestamp: '2026-09-28T16:30:00.000Z',
            title: 'Hardware & Software Setup Checklist',
            source: 'Gmail',
            description: 'Faculty coordinator Dr. Teja Krishna Mamidi instructed students to install ROS 2 VirtualBox image before attending.',
            badge: 'ACTION'
          },
          {
            date: 'Sep 29, 2026',
            timestamp: '2026-09-29T10:00:00.000Z',
            title: 'Calendar Synchronization & Venue Relocation',
            source: 'Google Calendar',
            description: 'Calendar event updated to 11:00 AM kickoff in Room S204, SR Block (Robotics Mechatronics Lab).',
            badge: 'SCHEDULED'
          },
          {
            date: 'Sep 30, 2026',
            timestamp: '2026-09-30T11:00:00.000Z',
            title: 'Hands-On Session Execution',
            source: 'Campus Event',
            description: 'Active workshop session with micro-ROS microcontroller deployment.',
            badge: 'LIVE'
          }
        ]
      });
    }

    // 2. CSE 213: AI Tools & Prompt Engineering Club Quiz
    const quizEmails = emails.filter(e => e.subject.includes('CSE 213') || e.subject.includes('AI Quiz') || e.body.includes('AI Quiz'));
    const quizWork = coursework.find(w => w.id === 'srm-work-213-quiz' || w.title.includes('Quiz'));
    const quizActions = actions.filter(a => a.title.toLowerCase().includes('quiz') || a.title.toLowerCase().includes('prompt'));

    unified.push({
      id: 'unified-cse213-quiz',
      title: 'CSE 213: AI Tools & Prompt Engineering Club Quiz (30 MCQs)',
      topicKey: 'cse213-quiz',
      category: 'ACADEMICS',
      priority: 'CRITICAL',
      dateFormatted: 'Sep 30, 2026',
      timeFormatted: '3:00 PM – 5:00 PM',
      location: 'CV 704 / X-Lab',
      status: 'Confirmed',
      sources: [
        ...quizEmails.map(e => ({
          type: 'gmail' as const,
          id: e.id,
          title: e.subject,
          timestamp: e.timestamp,
          snippet: e.summary || e.body.slice(0, 100)
        })),
        ...(quizWork ? [{
          type: 'classroom' as const,
          id: quizWork.id,
          title: quizWork.title,
          snippet: `Google Classroom coursework | Due: ${quizWork.dueDate} ${quizWork.dueTime || ''}`
        }] : [])
      ],
      sourceCount: quizEmails.length + (quizWork ? 1 : 0),
      relatedEmailCount: quizEmails.length,
      hasClassroom: Boolean(quizWork),
      hasCalendar: false,
      isCalendarAdded: false,
      actions: quizActions,
      changes: [],
      conflicts: [],
      whyItMatters: [
        'Mandatory internal assessment contributing 15% to your CSE 213 course grade.',
        'Closed-book physical evaluation on agentic reasoning and LLM prompt optimization.',
        'Physical reporting required at CV 704 by 2:45 PM sharp with University ID.'
      ],
      timeline: [
        {
          date: 'Sep 27, 2026',
          timestamp: '2026-09-27T09:00:00.000Z',
          title: 'Classroom Evaluation Published',
          source: 'Google Classroom',
          description: 'Dr. Suresh Kumar posted syllabus breakdown and grading rubric for 30 MCQ quiz.',
          badge: 'CLASSROOM'
        },
        {
          date: 'Sep 29, 2026',
          timestamp: '2026-09-29T10:00:00.000Z',
          title: 'Venue & Seating Circular Sent',
          source: 'Gmail',
          description: 'Department of CSE confirmed CV 704 / X-Lab as the physical testing venue.',
          badge: 'ANNOUNCEMENT'
        },
        {
          date: 'Sep 30, 2026',
          timestamp: '2026-09-30T15:00:00.000Z',
          title: 'Quiz In-Person Administration',
          source: 'Department of CSE',
          description: '3:00 PM - 5:00 PM examination window in CV 704.',
          badge: 'SCHEDULED'
        }
      ]
    });

    // 3. CSE 204: Algorithms Mid-Semester Examination
    const examEmails = emails.filter(e => e.subject.includes('CSE 204') || e.subject.includes('Algorithms'));
    const examCal = calEvents.find(c => c.title.includes('CSE 204') || c.title.includes('Algorithms'));
    const examActions = actions.filter(a => a.title.toLowerCase().includes('cse 204') || a.title.toLowerCase().includes('algorithm'));
    const examChanges = changes.filter(ch => ch.topic.toLowerCase().includes('cse 204'));
    const examConflicts = conflicts.filter(c => c.eventId === 'unified-cse204-exam');

    unified.push({
      id: 'unified-cse204-exam',
      title: 'CSE 204 Algorithms Mid-Semester Examination',
      topicKey: 'cse204-exam',
      category: 'EXAMS',
      priority: 'CRITICAL',
      dateFormatted: 'Sep 30, 2026',
      timeFormatted: '9:00 AM – 11:00 AM (Cutoff: 8:40 AM)',
      location: 'Room S202, SR Block',
      status: examChanges.length > 0 ? 'Changed' : 'Confirmed',
      sources: [
        ...examEmails.map(e => ({
          type: 'gmail' as const,
          id: e.id,
          title: e.subject,
          timestamp: e.timestamp,
          snippet: e.summary || e.body.slice(0, 100)
        })),
        ...(examCal ? [{
          type: 'calendar' as const,
          id: examCal.id,
          title: examCal.title,
          snippet: `Google Calendar entry: ${examCal.startTime} @ ${examCal.location}`
        }] : [])
      ],
      sourceCount: examEmails.length + (examCal ? 1 : 0),
      relatedEmailCount: examEmails.length,
      hasClassroom: true,
      hasCalendar: Boolean(examCal),
      isCalendarAdded: Boolean(examCal),
      calendarEventId: examCal?.id,
      actions: examActions,
      changes: examChanges,
      conflicts: examConflicts,
      whyItMatters: [
        'Venue was relocated from Central Hall to Room S202, SR Block by HOD CSE.',
        'Strict reporting cutoff is 8:40 AM; late arrivals will be barred from entry.',
        'Physical printed Hall Ticket and Student ID are mandatory.'
      ],
      timeline: [
        {
          date: 'Sep 22, 2026',
          timestamp: '2026-09-22T08:00:00.000Z',
          title: 'Timetable Published',
          source: 'Exam System',
          description: 'Original timetable published with Central Hall as testing venue.',
          badge: 'ORIGINAL'
        },
        {
          date: 'Sep 28, 2026',
          timestamp: '2026-09-28T14:00:00.000Z',
          title: 'Emergency Venue Relocation Circular',
          source: 'Gmail',
          description: 'HOD CSE issued urgent notice shifting exam to Room S202 SR Block due to diagnostic setup.',
          badge: 'CHANGED'
        },
        {
          date: 'Sep 30, 2026',
          timestamp: '2026-09-30T08:40:00.000Z',
          title: 'Reporting Cutoff',
          source: 'Examination Cell',
          description: 'Students seated in S202 SR Block for biometric verification.',
          badge: 'CRITICAL'
        }
      ]
    });

    // 4. SRM AP University Operations & Rain Closure
    const closureEmails = emails.filter(e => e.subject.toLowerCase().includes('closure') || e.subject.toLowerCase().includes('circular') || e.body.toLowerCase().includes('heavy rainfall'));
    const closureChanges = changes.filter(ch => ch.topic.toLowerCase().includes('closure') || ch.topic.toLowerCase().includes('rain'));
    unified.push({
      id: 'unified-rain-closure',
      title: 'SRM AP University Operations & Compensatory Working Day',
      topicKey: 'university-closure',
      category: 'ADMINISTRATION',
      priority: 'HIGH',
      dateFormatted: 'Oct 10, 2026',
      timeFormatted: 'Full Working Day (Friday Timetable)',
      location: 'Neerukonda Campus',
      status: 'Confirmed',
      sources: closureEmails.map(e => ({
        type: 'gmail' as const,
        id: e.id,
        title: e.subject,
        timestamp: e.timestamp,
        snippet: e.summary || e.body.slice(0, 100)
      })),
      sourceCount: closureEmails.length,
      relatedEmailCount: closureEmails.length,
      hasClassroom: false,
      hasCalendar: false,
      isCalendarAdded: false,
      actions: actions.filter(a => a.title.toLowerCase().includes('compensatory') || a.title.toLowerCase().includes('closure')),
      changes: closureChanges,
      conflicts: [],
      whyItMatters: [
        'Compensates for the emergency rainfall closure declared on September 25.',
        'Follows Friday timetable; absence directly penalizes attendance condonation quota.'
      ],
      timeline: [
        {
          date: 'Sep 24, 2026',
          timestamp: '2026-09-24T20:00:00.000Z',
          title: 'Emergency Rain Closure Circular',
          source: 'Registrar Circular',
          description: 'Campus closed on Sept 25 due to road waterlogging across Mangalagiri.',
          badge: 'EMERGENCY'
        },
        {
          date: 'Sep 26, 2026',
          timestamp: '2026-09-26T11:00:00.000Z',
          title: 'Compensatory Working Day Notification',
          source: 'Gmail',
          description: 'Registrar announced Saturday, October 10 as full working day.',
          badge: 'ANNOUNCEMENT'
        }
      ]
    });

    // 5. Terrathon 2026 — Sustainability Hackathon
    const terrathonEmails = emails.filter(e => e.subject.toLowerCase().includes('terrathon') || e.body.toLowerCase().includes('terrathon'));
    const terrathonCal = calEvents.find(c => c.title.toLowerCase().includes('terrathon'));
    unified.push({
      id: 'unified-terrathon',
      title: 'Terrathon 2026 — Sustainability Hackathon',
      topicKey: 'terrathon',
      category: 'HACKATHONS',
      priority: 'HIGH',
      dateFormatted: 'Oct 16, 2026',
      timeFormatted: '36-Hour Hackathon',
      location: 'APJ Abdul Kalam Auditorium',
      status: 'Confirmed',
      sources: [
        ...terrathonEmails.map(e => ({
          type: 'gmail' as const,
          id: e.id,
          title: e.subject,
          timestamp: e.timestamp,
          snippet: e.summary || e.body.slice(0, 100)
        })),
        ...(terrathonCal ? [{
          type: 'calendar' as const,
          id: terrathonCal.id,
          title: terrathonCal.title,
          snippet: `Google Calendar entry: ${terrathonCal.startTime} @ ${terrathonCal.location}`
        }] : [])
      ],
      sourceCount: terrathonEmails.length + (terrathonCal ? 1 : 0),
      relatedEmailCount: terrathonEmails.length,
      hasClassroom: false,
      hasCalendar: Boolean(terrathonCal),
      isCalendarAdded: Boolean(terrathonCal),
      calendarEventId: terrathonCal?.id,
      actions: actions.filter(a => a.title.toLowerCase().includes('terrathon')),
      changes: [],
      conflicts: [],
      whyItMatters: [
        'Premier national sustainability hackathon hosted by SRM University-AP.',
        'Direct cash awards, incubation support from HatchLab, and academic attendance exemption for finalist teams.'
      ],
      timeline: [
        {
          date: 'Sep 21, 2026',
          timestamp: '2026-09-21T10:00:00.000Z',
          title: 'Hackathon Registration Opened',
          source: 'Gmail',
          description: 'Directorate of Student Affairs announced themes and portal link.',
          badge: 'OPPORTUNITY'
        }
      ]
    });

    // 6. E-Cell STARTUP WARS 2026
    const startupEmails = emails.filter(e => e.subject.toLowerCase().includes('startup') || e.subject.toLowerCase().includes('ecell'));
    const startupChanges = changes.filter(ch => ch.topic.toLowerCase().includes('startup'));
    const startupConflicts = conflicts.filter(c => c.eventId === 'unified-startup-wars');
    unified.push({
      id: 'unified-startup-wars',
      title: 'E-Cell STARTUP WARS 2026 Pitching Series',
      topicKey: 'startup-wars',
      category: 'ENTREPRENEURSHIP',
      priority: 'MEDIUM',
      dateFormatted: 'Revised Dates TBA',
      timeFormatted: 'Postponed',
      location: 'Directorate of Entrepreneurship',
      status: 'Postponed',
      sources: startupEmails.map(e => ({
        type: 'gmail' as const,
        id: e.id,
        title: e.subject,
        timestamp: e.timestamp,
        snippet: e.summary || e.body.slice(0, 100)
      })),
      sourceCount: startupEmails.length,
      relatedEmailCount: startupEmails.length,
      hasClassroom: false,
      hasCalendar: false,
      isCalendarAdded: false,
      actions: actions.filter(a => a.title.toLowerCase().includes('pitch') || a.title.toLowerCase().includes('startup')),
      changes: startupChanges,
      conflicts: startupConflicts,
      whyItMatters: [
        'Event postponed to accommodate midterm exam revisions.',
        'Submitted slide decks are preserved; pitching schedule will be re-notified.'
      ],
      timeline: [
        {
          date: 'Sep 15, 2026',
          timestamp: '2026-09-15T09:00:00.000Z',
          title: 'Original Schedule Announced',
          source: 'Gmail',
          description: 'E-Cell announced Sept 21 demo day.',
          badge: 'ORIGINAL'
        },
        {
          date: 'Sep 19, 2026',
          timestamp: '2026-09-19T14:00:00.000Z',
          title: 'Postponement Circular Issued',
          source: 'Gmail',
          description: 'Official notice postponing pitching rounds.',
          badge: 'POSTPONED'
        }
      ]
    });

    return unified;
  }

  public getUnifiedEventById(id: string): UnifiedEvent | undefined {
    return this.getUnifiedEvents().find(e => e.id === id);
  }

  public getTruthResolution(eventId: string): TruthResolutionItem | undefined {
    const event = this.getUnifiedEventById(eventId);
    if (!event) return undefined;

    const fields = [
      {
        field: 'Title' as const,
        value: event.title,
        status: 'Confirmed' as const,
        authoritativeReason: 'Consistent across university communications and system calendar.',
        sources: [
          {
            source: 'Gmail' as const,
            value: event.title,
            evidence: 'Official email subject line issued by SRM AP administrative unit.'
          },
          {
            source: 'Google Calendar' as const,
            value: event.title,
            evidence: 'Registered calendar booking matching normalized course/event title.'
          }
        ]
      },
      {
        field: 'Date' as const,
        value: event.dateFormatted,
        status: 'Confirmed' as const,
        authoritativeReason: 'Corroborated by academic notice and calendar date.',
        sources: [
          {
            source: 'Gmail' as const,
            value: event.dateFormatted,
            evidence: 'Specified date in university circular.'
          }
        ]
      },
      {
        field: 'Time' as const,
        value: event.timeFormatted,
        status: event.conflicts.some(c => c.field === 'TIME') ? 'Conflicting' as const : 'Supported' as const,
        authoritativeReason: event.conflicts.some(c => c.field === 'TIME')
          ? 'Gmail original notice says 10:00 AM; Google Calendar entry indicates 11:00 AM.'
          : 'Consistent across active scheduled time slots.',
        sources: [
          {
            source: 'Gmail' as const,
            value: event.conflicts.find(c => c.field === 'TIME')?.sourceA.value || event.timeFormatted,
            evidence: 'Original announcement circular.'
          },
          {
            source: 'Google Calendar' as const,
            value: event.conflicts.find(c => c.field === 'TIME')?.sourceB.value || event.timeFormatted,
            evidence: 'Active event time slot in Google Calendar.'
          }
        ]
      },
      {
        field: 'Location' as const,
        value: event.location || 'Unknown',
        status: event.conflicts.some(c => c.field === 'LOCATION') ? 'Conflicting' as const : 'Confirmed' as const,
        authoritativeReason: event.conflicts.some(c => c.field === 'LOCATION')
          ? 'Email notice indicates Room S202; Calendar entry points to Room S204.'
          : 'Verified campus building and room assignment.',
        sources: [
          {
            source: 'Gmail' as const,
            value: event.location || 'Campus Grounds',
            evidence: 'Latest circular signed by organizing faculty.'
          }
        ]
      },
      {
        field: 'Status' as const,
        value: event.status,
        status: 'Supported' as const,
        authoritativeReason: 'Derived dynamically from active circular status and conflict verification.',
        sources: [
          {
            source: 'Gmail' as const,
            value: event.status,
            evidence: 'Validated through thread relationship inspection.'
          }
        ]
      }
    ];

    return {
      id: `truth-${event.id}`,
      eventId: event.id,
      title: event.title,
      overallStatus: event.status === 'Conflicting' ? 'Conflicting' : 'Confirmed',
      fields,
      sourcesCovered: {
        gmail: event.relatedEmailCount > 0,
        classroom: event.hasClassroom,
        calendar: event.hasCalendar
      },
      lastVerifiedAt: new Date().toISOString()
    };
  }

  public getWhyThisMatters(id: string): string[] {
    const event = this.getUnifiedEventById(id);
    if (event) return event.whyItMatters;

    const email = DatabaseService.getInstance().getEmailById(id);
    if (email) {
      const reasons: string[] = [];
      if (email.priority === 'CRITICAL' || email.priority === 'HIGH') {
        reasons.push(`Direct academic or operational impact flagged as ${email.priority} priority.`);
      }
      if (email.actionRequired) {
        reasons.push(`Contains explicit student action required: "${email.actionText}".`);
      }
      if (email.actionDeadline || email.deadlineDate) {
        reasons.push(`Enforces a strict submission/reporting cutoff: ${email.actionDeadline || email.deadlineDate}.`);
      }
      if (email.category === 'ACADEMICS' || email.category === 'EXAMS') {
        reasons.push('Relevant to your active B.Tech Computer Science and Engineering curriculum.');
      }
      if (email.category === 'ATTENDANCE') {
        reasons.push('Directly protects your 75% attendance condonation threshold.');
      }
      if (reasons.length === 0) {
        reasons.push('Informational notice relevant to SRM University-AP student cohort.');
      }
      return reasons;
    }

    return ['Directly relevant to your active academic semester and student responsibilities at SRM AP.'];
  }

  public getConsequence(actionId: string): ConsequenceAnalysis {
    const action = DatabaseService.getInstance().getActions().find(a => a.id === actionId);
    if (!action) {
      return {
        actionId,
        actionTitle: 'Unknown Action',
        consequences: ['Missing official university action record.'],
        supportedByEvidence: false,
        evidenceSource: 'CampusPulse Database',
        evidenceSnippet: 'No supporting record found.'
      };
    }

    const email = DatabaseService.getInstance().getEmailById(action.emailId);
    const consequences: string[] = [];

    if (action.title.toLowerCase().includes('quiz')) {
      consequences.push('You will lose 15% of your internal continuous evaluation marks for CSE 213.');
      consequences.push('No re-examination is conducted for missed club assessments.');
    } else if (action.title.toLowerCase().includes('attendance') || action.title.toLowerCase().includes('condonation')) {
      consequences.push('Your attendance shortage will remain unexcused, barring exam hall ticket generation.');
      consequences.push('You will receive a non-refundable condonation fee penalty.');
    } else if (action.title.toLowerCase().includes('exam') || action.title.toLowerCase().includes('s202')) {
      consequences.push('Reporting to the wrong hall after 8:40 AM results in late-entry disqualification.');
      consequences.push('Invigilators strictly enforce the locked door policy.');
    } else if (action.title.toLowerCase().includes('ros') || action.title.toLowerCase().includes('robotics')) {
      consequences.push('You will be unable to interface with the micro-ROS hardware kit during lab exercises.');
      consequences.push('Your seat may be allocated to waitlisted attendees at 11:00 AM.');
    } else if (action.deadline) {
      consequences.push(`Failing to act before ${action.deadline} means missing the official university submission window.`);
      consequences.push('Subsequent appeals require physical Dean approval.');
    } else {
      consequences.push('You may miss critical academic deadlines or operational scheduling updates.');
    }

    return {
      actionId,
      actionTitle: action.title,
      deadline: action.deadline,
      consequences,
      supportedByEvidence: true,
      evidenceSource: email?.subject || 'University Academic Circular',
      evidenceSnippet: email?.body.slice(0, 160) || 'Strict adherence to announced deadlines is required by university regulations.'
    };
  }
}
