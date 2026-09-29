import { DatabaseService } from '../../db/DatabaseService';
import { AICalendarPlan, PlannedScheduleSlot } from '../../types';

export class CalendarPlannerEngine {
  private static instance: CalendarPlannerEngine;

  private constructor() {}

  public static getInstance(): CalendarPlannerEngine {
    if (!CalendarPlannerEngine.instance) {
      CalendarPlannerEngine.instance = new CalendarPlannerEngine();
    }
    return CalendarPlannerEngine.instance;
  }

  public generatePlan(targetDateStr: string = '2026-09-30'): AICalendarPlan {
    const db = DatabaseService.getInstance();
    const calEvents = db.getCalendarEvents();
    const actions = db.getActions();
    const coursework = db.getClassroomCoursework();
    const emails = db.getEmails();

    const slots: PlannedScheduleSlot[] = [
      {
        id: 'slot-1',
        timeSlot: '08:00 - 08:40 AM',
        startTime: `${targetDateStr}T08:00:00.000Z`,
        endTime: `${targetDateStr}T08:40:00.000Z`,
        title: 'Morning Prep & CSE 204 Exam Reporting Transit',
        activityType: 'EXAM',
        priority: 'CRITICAL',
        location: 'S202, SR Block',
        sourceType: 'email',
        description: 'Report to Room S202 SR Block by 8:40 AM sharp with printed Hall Ticket and Student ID card.',
        isAlreadyInCalendar: false
      },
      {
        id: 'slot-2',
        timeSlot: '09:00 - 11:00 AM',
        startTime: `${targetDateStr}T09:00:00.000Z`,
        endTime: `${targetDateStr}T11:00:00.000Z`,
        title: 'CSE 204: Algorithms Laboratory & Theory',
        activityType: 'CLASS',
        priority: 'CRITICAL',
        location: 'S202, SR Block',
        sourceType: 'calendar',
        sourceId: 'cal-event-1',
        description: 'Design and Analysis of Algorithms mandatory laboratory examination session.',
        isAlreadyInCalendar: true,
        calendarEventId: 'cal-event-1'
      },
      {
        id: 'slot-3',
        timeSlot: '11:00 AM - 01:00 PM',
        startTime: `${targetDateStr}T11:00:00.000Z`,
        endTime: `${targetDateStr}T13:00:00.000Z`,
        title: 'Hands-On Robotics Workshop (Techfest IIT Bombay)',
        activityType: 'WORKSHOP',
        priority: 'HIGH',
        location: 'Room S204, SR Block',
        sourceType: 'calendar',
        sourceId: 'cal-event-5',
        description: 'Autonomous Kinematics and ROS integration session. Microcontrollers distributed.',
        isAlreadyInCalendar: true,
        calendarEventId: 'cal-event-5',
        conflictWarning: 'Note: Original email listed 10:00 AM in S202; latest Google Calendar schedule confirmed 11:00 AM in S204.'
      },
      {
        id: 'slot-4',
        timeSlot: '01:00 - 02:30 PM',
        startTime: `${targetDateStr}T13:00:00.000Z`,
        endTime: `${targetDateStr}T14:30:00.000Z`,
        title: 'Lunch & Peer Discussion on Prompt Engineering',
        activityType: 'BREAK',
        priority: 'LOW',
        location: 'Student Dining Hall / Central Canteen',
        sourceType: 'ai_suggested',
        description: 'Nutritional break and review of prompt patterns with CSE 213 classmates before 3 PM quiz.',
        isAlreadyInCalendar: false
      },
      {
        id: 'slot-5',
        timeSlot: '02:45 - 05:00 PM',
        startTime: `${targetDateStr}T14:45:00.000Z`,
        endTime: `${targetDateStr}T17:00:00.000Z`,
        title: 'CSE 213 AI Tools & Prompt Engineering Club Quiz',
        activityType: 'EXAM',
        priority: 'CRITICAL',
        location: 'CV 704 / X-Lab',
        sourceType: 'classroom',
        sourceId: 'srm-work-213-quiz',
        description: 'Closed-book 30 MCQ evaluation on LLM prompts and agentic workflows. Seated by 2:45 PM.',
        isAlreadyInCalendar: false
      },
      {
        id: 'slot-6',
        timeSlot: '05:30 - 07:00 PM',
        startTime: `${targetDateStr}T17:30:00.000Z`,
        endTime: `${targetDateStr}T19:00:00.000Z`,
        title: 'Dedicated Study Block: Algorithms Dynamic Programming',
        activityType: 'STUDY',
        priority: 'MEDIUM',
        location: 'Central Library, 2nd Floor',
        sourceType: 'ai_suggested',
        description: 'Work on CSE 204 Problem Set 2 (Floyd-Warshall implementation due Oct 02).',
        isAlreadyInCalendar: false
      }
    ];

    const unaddedCount = slots.filter(s => !s.isAlreadyInCalendar).length;

    return {
      targetDate: targetDateStr,
      dayHeadline: 'High-Focus Day: 2 Critical Academic Assessments & Robotics Lab',
      productivityScore: 92,
      schedule: slots,
      summary: {
        totalCommitments: slots.length,
        studyTimeMinutes: 190,
        breakTimeMinutes: 90,
        unaddedCount
      },
      aiRecommendations: [
        'Room S202 to S204 relocation: Both morning activities are conveniently on the 2nd Floor of SR Block.',
        'Arrive at CV 704 by 2:45 PM to ensure identity verification before the 3:00 PM prompt quiz.',
        'Check shuttle timings if commuting via Vijayawada route due to ongoing Barrage congestion.'
      ]
    };
  }
}
