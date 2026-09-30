import { EmailData, ActionItem, DashboardData, Category, Priority, ClassroomCourse, ClassroomCoursework, ClassroomAnnouncement, GoogleCalendarEvent } from '../types';
import { SQLiteService } from './SQLiteService';
import { ActionExtractor } from '../services/actions/ActionExtractor';
import { RelationshipEngine } from '../services/relationships/RelationshipEngine';
import { AIService } from '../services/ai/AIService';

/**
 * DatabaseService now wraps SQLiteService for persistent storage.
 * All data survives backend restarts.
 */
export class DatabaseService {
  private static instance: DatabaseService;
  private sqlite: SQLiteService;

  private constructor() {
    this.sqlite = SQLiteService.getInstance();
  }

  public static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService();
    }
    return DatabaseService.instance;
  }

  public getSQLite(): SQLiteService {
    return this.sqlite;
  }

  public getMode(): string {
    return 'live';
  }

  public loadInitialDataset(): void {
    this.sqlite.seedDefaultDataIfEmpty();
  }

  // --- Email Methods ---
  public getEmails(): EmailData[] {
    return this.sqlite.getEmails();
  }

  public getEmailById(id: string): EmailData | undefined {
    return this.sqlite.getEmailById(id);
  }

  public markEmailRead(id: string, isRead: boolean = true): boolean {
    return this.sqlite.markEmailRead(id, isRead);
  }

  public addEmails(newEmails: EmailData[]): void {
    for (const email of newEmails) {
      this.sqlite.upsertEmail(email as any);
    }
  }

  // --- Actions ---
  public getActions(): ActionItem[] {
    return this.sqlite.getActions();
  }

  public toggleAction(actionId: string): ActionItem | undefined {
    return this.sqlite.toggleAction(actionId);
  }

  public addAction(item: Omit<ActionItem, 'id'>): ActionItem {
    return this.sqlite.addAction(item);
  }

  public refreshActions(): void {
    const emails = this.getEmails();
    const extracted = ActionExtractor.extractActions(emails);
    for (const action of extracted) {
      this.sqlite.upsertAction(action);
    }
  }

  // --- User & Profile ---
  public getUser(): any {
    return this.sqlite.getUser();
  }

  public getStudentProfile(): { name: string; university: string; program: string; school?: string; email?: string; semester: number; picture?: string } {
    const user = this.sqlite.getUser();
    if (user) {
      return {
        name: user.name || 'Student',
        university: user.university || 'SRM University-AP',
        program: user.program || 'B.Tech Computer Science',
        email: user.email || undefined,
        picture: user.picture || undefined,
        semester: 3
      };
    }
    return {
      name: 'Student',
      university: 'SRM University-AP',
      program: 'B.Tech Computer Science',
      semester: 3
    };
  }

  // --- Classroom ---
  public getClassroomCourses(): ClassroomCourse[] {
    const rows = this.sqlite.getClassroomCourses() as any[];
    return rows.map(r => ({
      id: r.id || r.google_course_id,
      name: r.name,
      section: r.section || undefined,
      descriptionHeading: r.description_heading || r.descriptionHeading || undefined,
      room: r.room || undefined,
      alternateLink: r.alternate_link || r.alternateLink || undefined,
      courseState: r.course_state || r.courseState || 'ACTIVE',
      teacherName: r.teacher_name || r.teacherName || undefined,
      enrollmentCode: r.enrollment_code || r.enrollmentCode || undefined,
    }));
  }

  public getClassroomCoursework(courseId?: string): ClassroomCoursework[] {
    return this.sqlite.getClassroomCoursework(courseId);
  }

  public getClassroomAnnouncements(courseId?: string): ClassroomAnnouncement[] {
    return this.sqlite.getClassroomAnnouncements(courseId);
  }

  public setClassroomData(courses: ClassroomCourse[], coursework: ClassroomCoursework[], announcements: ClassroomAnnouncement[]): void {
    for (const c of courses) this.sqlite.upsertClassroomCourse(c);
    for (const w of coursework) this.sqlite.upsertClassroomCoursework(w);
    for (const a of announcements) this.sqlite.upsertClassroomAnnouncement(a);
  }

  // --- Calendar ---
  public getCalendarEvents(): GoogleCalendarEvent[] {
    return this.sqlite.getCalendarEvents();
  }

  public setCalendarEvents(events: GoogleCalendarEvent[]): void {
    for (const e of events) this.sqlite.upsertCalendarEvent(e);
  }

  // --- Sync ---
  public getLastSyncTime(): string | null {
    const state = this.sqlite.getSyncState('full');
    return state?.last_sync || null;
  }

  public setLastSyncTime(time: string): void {
    this.sqlite.updateSyncState('full', { lastSync: time });
  }

  // --- Dashboard ---
  public async getDashboardData(): Promise<DashboardData> {
    const aiService = AIService.getInstance();
    const emails = this.getEmails();
    const actions = this.getActions();
    const student = this.getStudentProfile();
    const briefing = await aiService.generateBriefing(emails, student.name);
    const changes = this.sqlite.getChanges(10);

    // Fall back to RelationshipEngine if no persisted changes
    const whatChanged = changes.length > 0 ? changes : RelationshipEngine.getWhatChanged(emails);

    const criticalCount = emails.filter(e => e.priority === 'CRITICAL').length;
    const highPriorityCount = emails.filter(e => e.priority === 'HIGH').length;
    const mediumPriorityCount = emails.filter(e => e.priority === 'MEDIUM').length;
    const lowPriorityCount = emails.filter(e => e.priority === 'LOW').length;

    const requireAttention = actions.filter(a => !a.completed && (a.priority === 'CRITICAL' || a.priority === 'HIGH')).length;
    const actionsCompleted = actions.filter(a => a.completed).length;
    const actionsPending = actions.filter(a => !a.completed).length;

    const categoryCounts: Record<string, number> = {};
    emails.forEach(e => {
      categoryCounts[e.category] = (categoryCounts[e.category] || 0) + 1;
    });

    const urgentActions = actions
      .filter(a => !a.completed && (a.priority === 'CRITICAL' || a.priority === 'HIGH'))
      .slice(0, 5);

    // Build dynamic today timeline from calendar events + email deadlines
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    const calEvents = this.getCalendarEvents();
    const todayTimeline: DashboardData['todayTimeline'] = calEvents
      .filter(e => e.startTime.includes(todayStr))
      .map(e => ({
        time: new Date(e.startTime).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }),
        title: e.title,
        category: 'EVENTS' as Category,
        priority: 'HIGH' as Priority,
        emailId: e.sourceId || e.id,
        location: e.location,
        sourceType: 'calendar' as const
      }));

    // Add email-based timeline items for today
    emails.filter(e => e.deadlineDate && e.deadlineDate.includes(todayStr)).forEach(e => {
      todayTimeline.push({
        time: e.actionDeadline || 'Today',
        title: e.actionText || e.subject,
        category: e.category,
        priority: e.priority,
        emailId: e.id,
        location: e.location,
        sourceType: 'email' as const
      });
    });

    const stats = this.sqlite.getStats();
    const coursework = this.getClassroomCoursework();
    const announcements = this.getClassroomAnnouncements();

    return {
      mode: 'live',
      student,
      metrics: {
        totalAnalyzed: emails.length,
        requireAttention,
        criticalCount,
        highPriorityCount,
        mediumPriorityCount,
        lowPriorityCount,
        upcomingDeadlinesCount: emails.filter(e => e.deadlineDate).length,
        actionsCompleted,
        actionsPending,
        classroomAssignmentsCount: stats.coursework,
        calendarEventsCount: stats.calendarEvents,
      },
      campusPulse: {
        activityLevel: criticalCount > 0 ? 'HIGH' : 'NORMAL',
        recentSignalsCount: emails.length,
        waveform: [45, 60, 35, 75, 95, 85, 65, 70, 90, 85, 60, 50, 80, 95, 45],
        lastSignalTime: emails[0]?.timestamp || new Date().toISOString()
      },
      urgentActions,
      recentEmails: emails.slice(0, 10),
      categoryCounts,
      todayTimeline,
      briefing,
      whatChanged,
      classroomAssignments: coursework,
      classroomAnnouncements: announcements,
      calendarEvents: calEvents,
    };
  }
}
