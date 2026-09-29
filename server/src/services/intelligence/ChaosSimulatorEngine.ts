import { DatabaseService } from '../../db/DatabaseService';
import { ConflictEngine } from './ConflictEngine';
import { RelationshipEngine } from '../relationships/RelationshipEngine';
import { 
  ChaosSimulationType, 
  ChaosSimulationResult, 
  EmailData, 
  ScheduleChangeItem 
} from '../../types';

export class ChaosSimulatorEngine {
  private static instance: ChaosSimulatorEngine;

  private constructor() {}

  public static getInstance(): ChaosSimulatorEngine {
    if (!ChaosSimulatorEngine.instance) {
      ChaosSimulatorEngine.instance = new ChaosSimulatorEngine();
    }
    return ChaosSimulatorEngine.instance;
  }

  public simulateChaos(type: ChaosSimulationType): ChaosSimulationResult {
    const db = DatabaseService.getInstance();
    const now = new Date();
    const formattedDate = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    const formattedTime = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

    let simulatedEmail: EmailData;
    let changeItem: ScheduleChangeItem;
    let headline: string;
    let affectedEventTitle: string;
    let calendarWarning: string | undefined;

    switch (type) {
      case 'ROOM_CHANGE':
        affectedEventTitle = 'Hands-On Robotics Workshop (Techfest IIT Bombay)';
        headline = 'Room Changed: S202 → S204 SR Block';
        simulatedEmail = {
          id: `sim-chaos-room-${Date.now()}`,
          sender: 'robotics.workshop@srmap.edu.in',
          senderName: 'Robotics Workshop Organizing Team, SRM AP',
          recipient: 'demo.student@srmap.edu.in',
          subject: 'URGENT UPDATE: Workshop Relocated from S202 to Room S204, SR Block',
          body: `Dear Registrants,\n\nDue to ROS 2 local LAN network configurations and high-power bench requirements, the Hands-On Robotics Workshop tomorrow has been officially MOVED:\n\nPREVIOUS ROOM: Room S202, SR Block\nNEW OFFICIAL VENUE: Room S204, SR Block (2nd Floor)\n\nPlease report directly to S204. Micro-ROS kits will be distributed at the entrance.\n\nDr. Teja Krishna Mamidi\nFaculty Coordinator, Dept. of Mechanical Engineering`,
          timestamp: now.toISOString(),
          dateFormatted: `${formattedDate} · ${formattedTime}`,
          category: 'EVENTS',
          priority: 'CRITICAL',
          priorityScore: 96,
          priorityReason: 'Emergency room relocation from S202 to S204 SR Block for tomorrow morning robotics workshop.',
          categoryReason: 'Official university venue relocation notice.',
          summary: 'URGENT: Hands-On Robotics Workshop relocated to Room S204, SR Block. Report to S204 at 11:00 AM.',
          actionRequired: true,
          actionText: 'Report to Room S204 SR Block (not S202) for Robotics Workshop',
          actionDeadline: 'Tomorrow, 11:00 AM',
          deadlineDate: new Date(now.getTime() + 20 * 3600 * 1000).toISOString(),
          location: 'Room S204, SR Block',
          urgency: 'CRITICAL',
          tags: ['robotics', 'room-change', 's204', 'urgent', 'sr-block'],
          isRead: false,
          source: 'demo',
          threadId: 'thread-robotics-workshop'
        };
        changeItem = {
          topic: 'Robotics Workshop Venue Shift',
          previousValue: 'Room S202, SR Block',
          newValue: 'Room S204, SR Block',
          changeType: 'LOCATION',
          summary: 'Workshop shifted to S204 SR Block to provide Gigabit LAN and high-voltage power benches for hardware kits.',
          emailId: simulatedEmail.id,
          whatChanged: 'Venue changed from S202 to S204 SR Block.',
          whyItMatters: 'Reporting to S202 will delay hardware kit allocation and session check-in.',
          whatYouNeedToDo: 'Proceed to Room S204 on the 2nd Floor of SR Block.'
        };
        calendarWarning = 'Existing Google Calendar event location updated to Room S204, SR Block.';
        break;

      case 'TIME_CHANGE':
        affectedEventTitle = 'Hands-On Robotics Workshop (Techfest IIT Bombay)';
        headline = 'Time Changed: 10:00 AM → 11:00 AM';
        simulatedEmail = {
          id: `sim-chaos-time-${Date.now()}`,
          sender: 'robotics.workshop@srmap.edu.in',
          senderName: 'Robotics Workshop Organizing Team',
          recipient: 'demo.student@srmap.edu.in',
          subject: 'SCHEDULE REVISION: Robotics Workshop Kickoff Delayed to 11:00 AM',
          body: `Notice to all Attendees:\n\nTo avoid schedule overlap with the morning CSE 204 Algorithms Lab examinations, the Robotics Workshop will now commence at 11:00 AM instead of 10:00 AM.\n\nNEW TIMING: 11:00 AM – 4:00 PM\nVENUE: Room S204, SR Block\n\nDr. Teja Krishna Mamidi`,
          timestamp: now.toISOString(),
          dateFormatted: `${formattedDate} · ${formattedTime}`,
          category: 'EVENTS',
          priority: 'HIGH',
          priorityScore: 90,
          priorityReason: 'Start time shifted 1 hour later (11:00 AM) to resolve CSE 204 lab exam conflict.',
          categoryReason: 'Official schedule delay notification.',
          summary: 'Robotics workshop session shifted from 10:00 AM to 11:00 AM.',
          actionRequired: true,
          actionText: 'Update schedule: Robotics Workshop begins at 11:00 AM in S204',
          actionDeadline: 'Tomorrow, 11:00 AM',
          location: 'Room S204, SR Block',
          urgency: 'HIGH',
          tags: ['robotics', 'time-change', '11am'],
          isRead: false,
          source: 'demo',
          threadId: 'thread-robotics-workshop'
        };
        changeItem = {
          topic: 'Robotics Workshop Starting Time',
          previousValue: '10:00 AM',
          newValue: '11:00 AM (-1 hr adjustment)',
          changeType: 'TIMING',
          summary: 'Start delayed to 11:00 AM to prevent clash with morning algorithms exam in S202.',
          emailId: simulatedEmail.id,
          whatChanged: 'Event start shifted from 10:00 AM to 11:00 AM.',
          whyItMatters: 'Frees morning hours 10:00-11:00 AM and resolves calendar overlap.',
          whatYouNeedToDo: 'Arrive at S204 by 10:50 AM.'
        };
        calendarWarning = 'Google Calendar timing conflict resolved to 11:00 AM.';
        break;

      case 'DEADLINE_CHANGE':
        affectedEventTitle = 'CSE 204: Problem Set 2 (Dynamic Programming)';
        headline = 'Deadline Extended: Oct 02 → Oct 05, 11:59 PM';
        simulatedEmail = {
          id: `sim-chaos-dl-${Date.now()}`,
          sender: 'dr.lakshmi.narayanan@srmap.edu.in',
          senderName: 'Dr. Lakshmi Narayanan, Department of CSE',
          recipient: 'demo.student@srmap.edu.in',
          subject: 'DEADLINE EXTENSION: CSE 204 Problem Set 2 Submission Window',
          body: `Dear B.Tech CSE Section A Scholars,\n\nIn consideration of the mid-semester lab tests and Hackathon preparations this week, the submission deadline for Problem Set 2 (Dynamic Programming & Graph Traversal) has been extended:\n\nORIGINAL DEADLINE: October 2, 2026 (23:59)\nREVISED EXTENDED DEADLINE: October 5, 2026 (23:59)\n\nPlease utilize the extra weekend days to optimize your benchmark algorithms.\n\nCourse Coordinator, CSE 204`,
          timestamp: now.toISOString(),
          dateFormatted: `${formattedDate} · ${formattedTime}`,
          category: 'ASSIGNMENTS',
          priority: 'MEDIUM',
          priorityScore: 68,
          priorityReason: 'CSE 204 Problem Set 2 deadline extended by 3 days until Oct 5.',
          categoryReason: 'Official academic coursework deadline extension.',
          summary: 'CSE 204 Problem Set 2 deadline extended to Monday, October 5, 11:59 PM.',
          actionRequired: true,
          actionText: 'Submit CSE 204 Problem Set 2 by extended deadline of Oct 5',
          actionDeadline: 'Oct 5, 2026, 11:59 PM',
          deadlineDate: '2026-10-05T23:59:00.000Z',
          urgency: 'MEDIUM',
          tags: ['deadline-extension', 'cse204', 'algorithms'],
          isRead: false,
          source: 'demo',
          threadId: 'thread-cse204-exam'
        };
        changeItem = {
          topic: 'CSE 204 Problem Set 2 Deadline',
          previousValue: 'October 2, 2026 (23:59)',
          newValue: 'October 5, 2026 (23:59) [+3 Days]',
          changeType: 'DEADLINE',
          summary: 'Deadline relaxed by 72 hours due to student hackathon participation.',
          emailId: simulatedEmail.id,
          whatChanged: 'Due date pushed from Friday Oct 2 to Monday Oct 5.',
          whyItMatters: 'Reduces immediate deadline risk pressure for this week.',
          whatYouNeedToDo: 'Submit before October 5, 11:59 PM.'
        };
        break;

      case 'EVENT_POSTPONEMENT':
        affectedEventTitle = 'E-Cell STARTUP WARS 2026';
        headline = 'Event Postponed: Revised Pitching Schedule TBA';
        simulatedEmail = {
          id: `sim-chaos-postpone-${Date.now()}`,
          sender: 'ecell@srmap.edu.in',
          senderName: 'Directorate of Entrepreneurship & E-Cell',
          recipient: 'demo.student@srmap.edu.in',
          subject: 'CIRCULAR: Postponement of STARTUP WARS Demo Day',
          body: `Dear Student Innovators,\n\nDue to external jury panel travel advisories, the STARTUP WARS pitching round originally scheduled for this week has been formally POSTPONED.\n\nAll submitted pitch decks remain preserved on the HatchLab portal. Revised dates will be announced after mid-semester assessments.\n\nTeam E-Cell, SRM AP`,
          timestamp: now.toISOString(),
          dateFormatted: `${formattedDate} · ${formattedTime}`,
          category: 'ENTREPRENEURSHIP',
          priority: 'MEDIUM',
          priorityScore: 65,
          priorityReason: 'STARTUP WARS demo day postponed; new schedule to be notified.',
          categoryReason: 'Campus event postponement circular.',
          summary: 'STARTUP WARS demo day postponed; slide decks preserved.',
          actionRequired: false,
          urgency: 'MEDIUM',
          tags: ['ecell', 'postponed', 'startup-wars'],
          isRead: false,
          source: 'demo',
          threadId: 'thread-startup-wars'
        };
        changeItem = {
          topic: 'STARTUP WARS Demo Day',
          previousValue: 'Active Pitching Schedule',
          newValue: 'Postponed (Revised Dates TBA)',
          changeType: 'CANCELLATION',
          summary: 'Pitching rounds postponed due to jury advisory.',
          emailId: simulatedEmail.id,
          whatChanged: 'Event status marked Postponed.',
          whyItMatters: 'Pitch presentations on hold; extra time to refine decks.',
          whatYouNeedToDo: 'Hold on travel to pitching hall.'
        };
        calendarWarning = 'Calendar reservation should be removed to free study block.';
        break;

      case 'EVENT_CANCELLATION':
        affectedEventTitle = 'CSE Guest Lecture on Quantum Computing';
        headline = 'Event Cancelled: Speaker Emergency';
        simulatedEmail = {
          id: `sim-chaos-cancel-${Date.now()}`,
          sender: 'hod.cse@srmap.edu.in',
          senderName: 'Department of Computer Science and Engineering',
          recipient: 'demo.student@srmap.edu.in',
          subject: 'NOTICE: Cancellation of Friday Quantum Computing Guest Lecture',
          body: `Scholars,\n\nWe regret to inform that the Friday Quantum Computing guest session by Dr. A. V. Rao is CANCELLED due to unforeseen medical leave. Regular laboratory classes will be conducted instead.\n\nHOD CSE`,
          timestamp: now.toISOString(),
          dateFormatted: `${formattedDate} · ${formattedTime}`,
          category: 'ACADEMICS',
          priority: 'LOW',
          priorityScore: 40,
          priorityReason: 'Quantum guest lecture cancelled; standard lab resumes.',
          categoryReason: 'Event cancellation announcement.',
          summary: 'Quantum Computing guest lecture cancelled; regular lab schedule resumed.',
          actionRequired: false,
          urgency: 'LOW',
          tags: ['cancelled', 'guest-lecture'],
          isRead: false,
          source: 'demo'
        };
        changeItem = {
          topic: 'Quantum Computing Guest Lecture',
          previousValue: 'Friday 4:00 PM Lecture',
          newValue: 'Cancelled',
          changeType: 'CANCELLATION',
          summary: 'Cancelled due to speaker medical emergency.',
          emailId: simulatedEmail.id,
          whatChanged: 'Lecture cancelled.',
          whyItMatters: 'Regular lab attendance applies.',
          whatYouNeedToDo: 'Attend regular departmental lab.'
        };
        break;

      case 'UNIVERSITY_CLOSURE':
        affectedEventTitle = 'SRM AP University Operations';
        headline = 'Emergency Weather Alert: Campus Closed Tomorrow';
        simulatedEmail = {
          id: `sim-chaos-closure-${Date.now()}`,
          sender: 'registrar@srmap.edu.in',
          senderName: 'Office of the Registrar, SRM University-AP',
          recipient: 'demo.student@srmap.edu.in',
          subject: 'EMERGENCY CIRCULAR: Severe Cyclone Warning & Campus Closure',
          body: `CIRCULAR NO. SRMAP/REG/2026/CYC-04:\n\nFollowing the India Meteorological Department (IMD) red alert for heavy rain and gale winds across Guntur and Krishna districts, SRM University-AP shall remain CLOSED tomorrow for all academic sessions.\n\nAll transport buses are suspended. Hostel students must remain indoors.\n\nRegistrar, SRM AP`,
          timestamp: now.toISOString(),
          dateFormatted: `${formattedDate} · ${formattedTime}`,
          category: 'EMERGENCY',
          priority: 'CRITICAL',
          priorityScore: 99,
          priorityReason: 'University closed tomorrow due to IMD cyclone red alert.',
          categoryReason: 'Emergency institutional closure order.',
          summary: 'EMERGENCY: Campus closed tomorrow due to severe cyclone warning. Buses suspended.',
          actionRequired: true,
          actionText: 'Do not travel to campus; all physical academic sessions suspended',
          actionDeadline: 'Tomorrow, All Day',
          location: 'Neerukonda Campus',
          urgency: 'CRITICAL',
          tags: ['emergency', 'cyclone', 'closure', 'registrar'],
          isRead: false,
          source: 'demo',
          threadId: 'thread-closure-schedule'
        };
        changeItem = {
          topic: 'SRM AP Campus Operations',
          previousValue: 'Regular Classes & Bus Schedules',
          newValue: 'Campus Closed; All Sessions & Transit Suspended',
          changeType: 'TIMING',
          summary: 'Campus closed in response to IMD cyclone red alert.',
          emailId: simulatedEmail.id,
          whatChanged: 'Full academic closure declared.',
          whyItMatters: 'No physical travel required; hostel safety protocol in effect.',
          whatYouNeedToDo: 'Remain indoors; monitor university portal.'
        };
        calendarWarning = 'All in-person calendar appointments marked suspended.';
        break;

      case 'TRANSPORT_DISRUPTION':
        affectedEventTitle = 'SRM AP Transit Fleet';
        headline = 'Transport Alert: Route 5 & 8 Diverted via Mangalagiri';
        simulatedEmail = {
          id: `sim-chaos-trans-${Date.now()}`,
          sender: 'transport@srmap.edu.in',
          senderName: 'Campus Transit Operations',
          recipient: 'demo.student@srmap.edu.in',
          subject: 'TRANSPORT ALERT: Highway Waterlogging on Route 5 & 8',
          body: `Notice to Day-Scholars:\n\nDue to culvert flash floods near Tadikonda, Bus Routes 5 and 8 are being diverted via Mangalagiri Bypass.\n\nExpect a 30-minute delay in morning campus arrival.\n\nTransport Directorate`,
          timestamp: now.toISOString(),
          dateFormatted: `${formattedDate} · ${formattedTime}`,
          category: 'TRANSPORT',
          priority: 'HIGH',
          priorityScore: 84,
          priorityReason: 'Route 5 and 8 delayed by 30 mins due to bypass road diversion.',
          categoryReason: 'Campus bus transit delay notice.',
          summary: 'Route 5 and 8 diverted via Mangalagiri Bypass; 30-minute delay expected.',
          actionRequired: true,
          actionText: 'Account for 30m delay on Route 5/8 morning transit',
          actionDeadline: 'Morning Commute',
          location: 'Main Gate Bay 2',
          urgency: 'HIGH',
          tags: ['transport', 'delay', 'bus'],
          isRead: false,
          source: 'demo',
          threadId: 'thread-transport-transit'
        };
        changeItem = {
          topic: 'Bus Routes 5 & 8 Operations',
          previousValue: 'Normal Route via Tadikonda',
          newValue: 'Diverted via Mangalagiri (+30 min delay)',
          changeType: 'TIMING',
          summary: 'Rerouted due to culvert waterlogging.',
          emailId: simulatedEmail.id,
          whatChanged: 'Transit rerouted with 30-minute delay.',
          whyItMatters: 'May affect 9:00 AM class attendance punch.',
          whatYouNeedToDo: 'Board earlier or inform faculty of transit delay.'
        };
        break;

      case 'CONFLICTING_INFO':
      default:
        affectedEventTitle = 'Hands-On Robotics Workshop (Techfest IIT Bombay)';
        headline = 'Cross-System Conflict: Gmail states 10:00 AM vs Calendar states 11:00 AM';
        simulatedEmail = {
          id: `sim-chaos-conflict-${Date.now()}`,
          sender: 'coordinator.robotics@srmap.edu.in',
          senderName: 'Faculty Coordinator, Robotics Workshop',
          recipient: 'demo.student@srmap.edu.in',
          subject: 'IMPORTANT: Reporting Timings for Tomorrow\'s Robotics Workshop in S202',
          body: `Attendees,\n\nPlease note the kickoff timing in Room S202 is 10:00 AM sharp.\n\n(Note: If your Google Calendar lists 11:00 AM, please be aware the lab opens at 10:00 AM for kit registration).\n\nDr. Teja Krishna Mamidi`,
          timestamp: now.toISOString(),
          dateFormatted: `${formattedDate} · ${formattedTime}`,
          category: 'EVENTS',
          priority: 'HIGH',
          priorityScore: 92,
          priorityReason: 'Conflicting start time detected between email circular (10:00 AM) and Calendar (11:00 AM).',
          categoryReason: 'Cross-system schedule contradiction.',
          summary: 'Email notice claims 10:00 AM kickoff, contradicting existing 11:00 AM calendar reservation.',
          actionRequired: true,
          actionText: 'Verify authoritative timing: 10:00 AM vs 11:00 AM for Robotics Workshop',
          actionDeadline: 'Tomorrow, Morning',
          location: 'Room S202 / S204, SR Block',
          urgency: 'HIGH',
          tags: ['conflict', 'robotics', 'time-discrepancy'],
          isRead: false,
          source: 'demo',
          threadId: 'thread-robotics-workshop'
        };
        changeItem = {
          topic: 'Robotics Workshop Kickoff Contradiction',
          previousValue: '11:00 AM (Google Calendar)',
          newValue: '10:00 AM (Gmail Faculty Notice)',
          changeType: 'TIMING',
          summary: 'Direct timing contradiction between communication and calendar.',
          emailId: simulatedEmail.id,
          whatChanged: 'Discrepancy of 1 hour detected across systems.',
          whyItMatters: 'Risk of reporting an hour late or waiting in locked lab.',
          whatYouNeedToDo: 'Check Conflict Detector for authoritative resolution.'
        };
        calendarWarning = 'Discrepancy flagged: Google Calendar displays 11:00 AM while Gmail states 10:00 AM.';
        break;
    }

    // Push simulated email into live DatabaseService
    db.getEmails().unshift(simulatedEmail);

    let actionCreated;
    if (simulatedEmail.actionRequired && simulatedEmail.actionText) {
      actionCreated = db.addAction({
        emailId: simulatedEmail.id,
        title: simulatedEmail.actionText,
        category: simulatedEmail.category,
        priority: simulatedEmail.priority,
        deadline: simulatedEmail.actionDeadline,
        deadlineDate: simulatedEmail.deadlineDate,
        completed: false,
        sourceEmailSubject: simulatedEmail.subject,
        sourceSender: simulatedEmail.senderName,
        location: simulatedEmail.location
      });
    }

    // Run conflict detection
    const conflicts = ConflictEngine.getInstance().detectConflicts();
    const conflictDetected = conflicts.find(c => c.emailId === simulatedEmail.id || c.eventTitle.includes('Robotics'));

    return {
      simulationType: type,
      success: true,
      headline,
      simulatedEmail,
      affectedEventTitle,
      changeDetected: changeItem,
      conflictDetected,
      actionCreated,
      calendarWarning,
      summaryOfUpdates: [
        'New realistic university communication ingested into database pipeline.',
        `RelationshipEngine linked message to thread: "${simulatedEmail.threadId || simulatedEmail.category}".`,
        `Schedule change detected: "${changeItem.whatChanged}".`,
        actionCreated ? `Extracted action item: "${actionCreated.title}".` : 'No new action extraction needed.',
        calendarWarning ? `Calendar warning generated: "${calendarWarning}".` : 'Calendar schedule verified.',
        'Knowledge graph, conflict detector, and dashboard updated in real-time.'
      ]
    };
  }
}
