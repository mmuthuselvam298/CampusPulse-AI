import fs from 'fs';
import path from 'path';
import { EmailData, ActionItem, DashboardData, Category, Priority } from '../types';
import { ActionExtractor } from '../services/actions/ActionExtractor';
import { RelationshipEngine } from '../services/relationships/RelationshipEngine';
import { AIService } from '../services/ai/AIService';
import { UniversityFilter } from '../services/filter/UniversityFilter';

export class DatabaseService {
  private static instance: DatabaseService;
  private emails: EmailData[] = [];
  private actions: ActionItem[] = [];
  private mode: 'demo' | 'gmail' = 'demo';
  private simulatedCount = 0;
  private pulseWaveform: number[] = [30, 45, 25, 60, 80, 95, 70, 50, 40, 65, 85, 90, 75, 55, 35];
  private lastPulseTime: string = new Date().toISOString();

  private studentProfile = {
    name: "Muthu",
    university: "Northbridge University",
    program: "CSE – AI & ML",
    semester: 3
  };

  private constructor() {
    this.loadInitialDataset();
  }

  public static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService();
    }
    return DatabaseService.instance;
  }

  public loadInitialDataset(): void {
    try {
      const dataPath = path.resolve(__dirname, '../data/demo-emails.json');
      if (fs.existsSync(dataPath)) {
        const raw = fs.readFileSync(dataPath, 'utf-8');
        this.emails = JSON.parse(raw);
      } else {
        console.warn('demo-emails.json not found, using empty array');
        this.emails = [];
      }
    } catch (err) {
      console.error('Failed to load demo-emails.json:', err);
      this.emails = [];
    }

    // Filter out external noise emails from primary university communications
    this.emails = this.emails.filter(e => !e.isNoise && UniversityFilter.isUniversityEmail(e.sender, e.recipient));
    this.actions = ActionExtractor.extractActions(this.emails);
    this.mode = 'demo';
    this.simulatedCount = 0;
    this.lastPulseTime = new Date().toISOString();
  }

  public getEmails(): EmailData[] {
    return this.emails;
  }

  public getEmailById(id: string): EmailData | undefined {
    return this.emails.find(e => e.id === id);
  }

  public markEmailRead(id: string, isRead: boolean = true): boolean {
    const email = this.emails.find(e => e.id === id);
    if (email) {
      email.isRead = isRead;
      return true;
    }
    return false;
  }

  public getActions(): ActionItem[] {
    return this.actions;
  }

  public toggleAction(actionId: string): ActionItem | undefined {
    const action = this.actions.find(a => a.id === actionId);
    if (action) {
      action.completed = !action.completed;
      action.completedAt = action.completed ? new Date().toISOString() : undefined;
      // sync with source email
      const email = this.emails.find(e => e.id === action.emailId);
      if (email) {
        email.isActionCompleted = action.completed;
      }
      return action;
    }
    return undefined;
  }

  public addAction(item: Omit<ActionItem, 'id'>): ActionItem {
    const newItem: ActionItem = {
      ...item,
      id: `custom-action-${Date.now()}`
    };
    this.actions.unshift(newItem);
    return newItem;
  }

  public getMode(): 'demo' | 'gmail' {
    return this.mode;
  }

  public setMode(mode: 'demo' | 'gmail'): void {
    this.mode = mode;
  }

  public getStudentProfile() {
    return this.studentProfile;
  }

  public updateStudentProfile(profile: Partial<typeof this.studentProfile>) {
    this.studentProfile = { ...this.studentProfile, ...profile };
  }

  public simulateNewEmail(scenario?: string): EmailData {
    this.simulatedCount++;
    const now = new Date();
    const formattedDate = now.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    const formattedTime = now.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });

    let simulated: EmailData;

    if (scenario === 'exam_moved' || this.simulatedCount % 2 === 1) {
      simulated = {
        id: `sim-live-${Date.now()}`,
        sender: "examinations@northbridgeuniversity.edu",
        senderName: "Office of the Controller of Examinations",
        recipient: "muthu@northbridgeuniversity.edu",
        subject: "URGENT: Tomorrow's CSE Exam Shifted to Block B Audio-Visual Hall",
        body: `URGENT NOTICE TO ALL CSE BATCH STUDENTS:

Due to an unexpected power maintenance overhaul in Block C, tomorrow morning's CSE302 Database Systems examination has been immediately relocated:

NEW VENUE: Block B, Audio-Visual Hall (1st Floor)
REPORTING CUTOFF: 8:35 AM sharp
EXAM TIME: 9:00 AM – 11:00 AM

Please bring your physical admit card. Digital copies on phones will not be permitted inside Block B.

Office of Examinations`,
        timestamp: now.toISOString(),
        dateFormatted: `${formattedDate} · ${formattedTime}`,
        category: "EXAMS",
        priority: "CRITICAL",
        priorityScore: 99,
        priorityReason: "Last-minute emergency examination venue shift to Block B AV Hall. Direct impact on tomorrow morning's exam.",
        categoryReason: "Critical examination logistics and hall reassignment.",
        summary: "URGENT: Tomorrow's CSE302 exam relocated to Block B Audio-Visual Hall. Arrive by 8:35 AM.",
        actionRequired: true,
        actionText: "Report to Block B Audio-Visual Hall by 8:35 AM for CSE302 exam",
        actionDeadline: "Tomorrow, 8:35 AM",
        deadlineDate: new Date(now.getTime() + 20 * 3600 * 1000).toISOString(),
        location: "Block B – Audio-Visual Hall",
        affectedGroup: "CSE Students",
        urgency: "CRITICAL",
        tags: ["urgent", "exam", "venue-change", "block-b"],
        isRead: false,
        source: "demo",
        threadId: "thread-midsem-cse"
      };
    } else {
      simulated = {
        id: `sim-live-${Date.now()}`,
        sender: "transport@northbridgeuniversity.edu",
        senderName: "Fleet & Transport Control",
        recipient: "muthu@northbridgeuniversity.edu",
        subject: "ALERT: Road Blockade on Main Campus Boulevard – Alternate Route Active",
        body: `ATTENTION ALL COMMUTERS:

Due to municipal fiber optic digging near the North Traffic Circle, Campus Shuttles and Routes 2, 4, and 7 are diverted via East Bypass Road.

Expect an additional 15-minute delay on all incoming buses. All drop-offs will occur at Campus Gate 4.

Please budget extra travel time.`,
        timestamp: now.toISOString(),
        dateFormatted: `${formattedDate} · ${formattedTime}`,
        category: "TRANSPORT",
        priority: "HIGH",
        priorityScore: 88,
        priorityReason: "Road blockade and route diversion causing 15m delay with drop-off relocated to Gate 4.",
        categoryReason: "Campus transit route diversion and schedule delay notice.",
        summary: "Main campus boulevard blocked; buses diverted via East Bypass to Gate 4 (+15m delay).",
        actionRequired: true,
        actionText: "Arrive at Gate 4 and account for 15m transit delay",
        actionDeadline: "Today, Morning Commute",
        location: "Campus Gate 4",
        affectedGroup: "All Transit Commuters",
        urgency: "HIGH",
        tags: ["transport", "diversion", "delay", "gate-4"],
        isRead: false,
        source: "demo",
        threadId: "thread-transport-transit"
      };
    }

    // Insert at top of emails
    this.emails.unshift(simulated);

    // Add action to task list
    if (simulated.actionRequired && simulated.actionText) {
      this.actions.unshift({
        id: `action-${simulated.id}`,
        emailId: simulated.id,
        title: simulated.actionText,
        category: simulated.category,
        priority: simulated.priority,
        deadline: simulated.actionDeadline,
        deadlineDate: simulated.deadlineDate,
        completed: false,
        sourceEmailSubject: simulated.subject,
        sourceSender: simulated.senderName,
        location: simulated.location
      });
    }

    // Update pulse
    this.pulseWaveform = [90, 100, 85, 95, 75, 80, 90, 60, 70, 85, 95, 100, 80, 65, 50];
    this.lastPulseTime = now.toISOString();

    return simulated;
  }

  public async getDashboardData(): Promise<DashboardData> {
    const aiService = AIService.getInstance();
    const briefing = await aiService.generateBriefing(this.emails, this.studentProfile.name);
    const whatChanged = RelationshipEngine.getWhatChanged(this.emails);

    const criticalCount = this.emails.filter(e => e.priority === 'CRITICAL').length;
    const highPriorityCount = this.emails.filter(e => e.priority === 'HIGH').length;
    const mediumPriorityCount = this.emails.filter(e => e.priority === 'MEDIUM').length;
    const lowPriorityCount = this.emails.filter(e => e.priority === 'LOW').length;

    const requireAttention = this.actions.filter(a => !a.completed && (a.priority === 'CRITICAL' || a.priority === 'HIGH')).length;
    const actionsCompleted = this.actions.filter(a => a.completed).length;
    const actionsPending = this.actions.filter(a => !a.completed).length;

    const categoryCounts: Record<string, number> = {};
    this.emails.forEach(e => {
      categoryCounts[e.category] = (categoryCounts[e.category] || 0) + 1;
    });

    const urgentActions = this.actions
      .filter(a => !a.completed && (a.priority === 'CRITICAL' || a.priority === 'HIGH'))
      .slice(0, 5);

    const todayTimeline = [
      {
        time: "8:40 AM",
        title: "CSE302 Exam Reporting Cutoff",
        category: "EXAMS" as Category,
        priority: "CRITICAL" as Priority,
        emailId: "email-001",
        location: "Block C – Hall 204"
      },
      {
        time: "9:00 AM",
        title: "CSE302 Database Systems Exam",
        category: "EXAMS" as Category,
        priority: "CRITICAL" as Priority,
        emailId: "email-001",
        location: "Block C – Hall 204"
      },
      {
        time: "1:00 PM",
        title: "Hostel Water Supply Maintenance Window",
        category: "HOSTEL" as Category,
        priority: "MEDIUM" as Priority,
        emailId: "email-014",
        location: "Hostel Blocks B & C"
      },
      {
        time: "5:00 PM",
        title: "Attendance Explanation Submission",
        category: "ATTENDANCE" as Category,
        priority: "HIGH" as Priority,
        emailId: "email-002",
        location: "Room 114 Admin Block"
      }
    ];

    return {
      mode: this.mode,
      student: this.studentProfile,
      metrics: {
        totalAnalyzed: this.emails.length,
        requireAttention,
        criticalCount,
        highPriorityCount,
        mediumPriorityCount,
        lowPriorityCount,
        upcomingDeadlinesCount: 4,
        actionsCompleted,
        actionsPending
      },
      campusPulse: {
        activityLevel: criticalCount > 0 ? 'HIGH' : 'NORMAL',
        recentSignalsCount: this.emails.length,
        waveform: this.pulseWaveform,
        lastSignalTime: this.lastPulseTime
      },
      urgentActions,
      recentEmails: this.emails.slice(0, 10),
      categoryCounts,
      todayTimeline,
      briefing,
      whatChanged
    };
  }
}
