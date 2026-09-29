import { EmailData, ActionItem, DashboardData, CampusBriefingResult, ScheduleChangeItem } from '../types';
import localDemoEmails from '../data/demo-emails.json';

const API_BASE = '/api';

export class ApiService {
  public static async getDashboard(): Promise<DashboardData> {
    try {
      const res = await fetch(`${API_BASE}/dashboard`);
      if (res.ok) {
        return await res.json();
      }
    } catch (err) {
      console.warn('Backend unavailable, using local mock dashboard:', err);
    }
    return ApiService.generateLocalFallbackDashboard();
  }

  public static async getEmails(params?: {
    priority?: string;
    category?: string;
    search?: string;
    unread?: boolean;
    sortBy?: string;
  }): Promise<{ total: number; emails: EmailData[] }> {
    try {
      const query = new URLSearchParams();
      if (params?.priority && params.priority !== 'ALL') query.set('priority', params.priority);
      if (params?.category && params.category !== 'ALL') query.set('category', params.category);
      if (params?.search) query.set('search', params.search);
      if (params?.unread) query.set('unread', 'true');
      if (params?.sortBy) query.set('sortBy', params.sortBy);

      const res = await fetch(`${API_BASE}/emails?${query.toString()}`);
      if (res.ok) {
        return await res.json();
      }
    } catch (err) {
      console.warn('Backend unavailable, using local emails:', err);
    }

    let emails = [...(localDemoEmails as EmailData[])];
    if (params?.priority && params.priority !== 'ALL') {
      emails = emails.filter(e => e.priority.toUpperCase() === params.priority?.toUpperCase());
    }
    if (params?.category && params.category !== 'ALL') {
      emails = emails.filter(e => e.category.toUpperCase() === params.category?.toUpperCase());
    }
    if (params?.search) {
      const q = params.search.toLowerCase();
      emails = emails.filter(e => e.subject.toLowerCase().includes(q) || e.body.toLowerCase().includes(q));
    }
    return { total: emails.length, emails };
  }

  public static async getEmailById(id: string): Promise<EmailData | null> {
    try {
      const res = await fetch(`${API_BASE}/emails/${id}`);
      if (res.ok) {
        return await res.json();
      }
    } catch (err) {
      console.warn('Backend unavailable, using local email lookup:', err);
    }
    const found = (localDemoEmails as EmailData[]).find(e => e.id === id);
    return found || null;
  }

  public static async markEmailRead(id: string, isRead: boolean = true): Promise<void> {
    try {
      await fetch(`${API_BASE}/emails/${id}/read`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isRead })
      });
    } catch (err) {
      console.warn('Failed to mark read on server:', err);
    }
  }

  public static async getActions(): Promise<{ actions: ActionItem[]; total: number }> {
    try {
      const res = await fetch(`${API_BASE}/actions`);
      if (res.ok) {
        return await res.json();
      }
    } catch (err) {
      console.warn('Backend unavailable, using fallback actions:', err);
    }
    const fallbackActions: ActionItem[] = (localDemoEmails as EmailData[])
      .filter(e => e.actionRequired && e.actionText)
      .map(e => ({
        id: `action-${e.id}`,
        emailId: e.id,
        title: e.actionText!,
        category: e.category,
        priority: e.priority,
        deadline: e.actionDeadline,
        completed: Boolean(e.isActionCompleted),
        sourceEmailSubject: e.subject,
        sourceSender: e.senderName,
        location: e.location
      }));
    return { actions: fallbackActions, total: fallbackActions.length };
  }

  public static async toggleAction(actionId: string): Promise<ActionItem | null> {
    try {
      const res = await fetch(`${API_BASE}/actions/${actionId}/toggle`, { method: 'POST' });
      if (res.ok) {
        return await res.json();
      }
    } catch (err) {
      console.warn('Failed to toggle action on server:', err);
    }
    return null;
  }

  public static async addAction(task: {
    title: string;
    category?: string;
    priority?: string;
    deadline?: string;
    location?: string;
  }): Promise<ActionItem> {
    try {
      const res = await fetch(`${API_BASE}/actions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(task)
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (err) {
      console.warn('Failed to add action on server:', err);
    }
    return {
      id: `local-task-${Date.now()}`,
      emailId: 'custom',
      title: task.title,
      category: (task.category as any) || 'GENERAL',
      priority: (task.priority as any) || 'MEDIUM',
      deadline: task.deadline || 'Today',
      completed: false,
      sourceEmailSubject: 'Personal Student Task',
      sourceSender: 'Muthu',
      location: task.location
    };
  }

  public static async getBriefing(): Promise<CampusBriefingResult> {
    try {
      const res = await fetch(`${API_BASE}/briefing`);
      if (res.ok) {
        return await res.json();
      }
    } catch (err) {
      console.warn('Backend unavailable, using fallback briefing:', err);
    }
    return {
      date: "Wednesday, September 30, 2026",
      greeting: "Good morning, Muthu",
      studentName: "Muthu",
      headline: "You have 1 critical alert and 2 high-priority actions requiring attention today.",
      criticalCount: 1,
      highCount: 2,
      upcomingDeadlinesCount: 4,
      academicUpdatesCount: 8,
      summaryBullets: [
        {
          emoji: "🔴",
          priority: "CRITICAL",
          title: "Tomorrow's Examination Hall Relocated",
          description: "CSE302 exam moved to Block C Hall 204. Must report by 8:40 AM.",
          emailId: "email-001"
        },
        {
          emoji: "🟠",
          priority: "HIGH",
          title: "Attendance Shortage Notice",
          description: "Attendance is 68.4%. Submit explanation form to Room 114 before Friday.",
          emailId: "email-002"
        },
        {
          emoji: "🚌",
          priority: "HIGH",
          title: "Bus Route 4 Delayed 20 Mins",
          description: "Drop-off relocated to Gate 2. Exam students should use Metro.",
          emailId: "email-003"
        }
      ],
      motivationalNote: "Stay focused on your morning revision. Don't forget your printed admit card with hologram.",
      aiProvider: 'mock-fallback'
    };
  }

  public static async askAssistant(query: string): Promise<{
    answer: string;
    suggestedActions: string[];
    referencedEmailIds: string[];
    toolUsed?: string;
  }> {
    try {
      const res = await fetch(`${API_BASE}/assistant`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query })
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (err) {
      console.warn('Backend unavailable, using local assistant logic:', err);
    }

    const q = query.toLowerCase();
    if (q.includes('exam')) {
      return {
        answer: "Tomorrow's CSE302 Database Management Systems exam has been moved from Block A to **Block C, Hall 204**. Arrive by **8:40 AM** with your hall ticket.",
        suggestedActions: ["View Hall Ticket", "Open in Google Maps"],
        referencedEmailIds: ["email-001"]
      };
    }

    return {
      answer: "You have 3 pressing tasks today: Check the new exam hall (Block C Hall 204), file your attendance explanation before Friday, and plan for Route 4 bus delay.",
      suggestedActions: ["View Urgent Actions", "Check Exam Schedule"],
      referencedEmailIds: ["email-001", "email-002", "email-003"]
    };
  }

  public static async simulateEmail(scenario?: string): Promise<{ email: EmailData }> {
    try {
      const res = await fetch(`${API_BASE}/demo/simulate-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scenario })
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (err) {
      console.warn('Backend unavailable for simulate-email:', err);
    }

    const simulated: EmailData = {
      id: `sim-local-${Date.now()}`,
      sender: "examinations@northbridgeuniversity.edu",
      senderName: "Office of Examinations",
      recipient: "muthu@northbridgeuniversity.edu",
      subject: "URGENT: Tomorrow's CSE Exam Shifted to Block B Audio-Visual Hall",
      body: "Emergency venue change due to maintenance. Report to Block B AV Hall by 8:35 AM.",
      timestamp: new Date().toISOString(),
      dateFormatted: "Just Now",
      category: "EXAMS",
      priority: "CRITICAL",
      priorityScore: 99,
      priorityReason: "Emergency venue shift right before morning examination.",
      categoryReason: "Critical examination logistics.",
      summary: "Tomorrow's CSE exam relocated to Block B AV Hall. Report by 8:35 AM.",
      actionRequired: true,
      actionText: "Report to Block B AV Hall by 8:35 AM",
      actionDeadline: "Tomorrow, 8:35 AM",
      location: "Block B – Audio-Visual Hall",
      urgency: "CRITICAL",
      tags: ["urgent", "exam"],
      isRead: false,
      source: "demo"
    };

    return { email: simulated };
  }

  public static async resetDemo(): Promise<void> {
    try {
      await fetch(`${API_BASE}/demo/reset`, { method: 'POST' });
    } catch (err) {
      console.warn('Failed to reset demo on server:', err);
    }
  }

  public static async getRelationships(): Promise<{ clusters: any[]; whatChanged: ScheduleChangeItem[] }> {
    try {
      const res = await fetch(`${API_BASE}/relationships`);
      if (res.ok) {
        return await res.json();
      }
    } catch (err) {
      console.warn('Backend unavailable, using fallback relationships:', err);
    }
    return {
      clusters: [],
      whatChanged: [
        {
          topic: "CSE302 Database Exam Venue",
          previousValue: "Block A, Main Hall",
          newValue: "Block C, Hall 204",
          changeType: "LOCATION",
          summary: "Exam relocated to Block C Hall 204. Arrive by 8:40 AM.",
          emailId: "email-001"
        },
        {
          topic: "Bus Route 4 Morning Drop-off & Timing",
          previousValue: "7:15 AM at Main Admin Gate",
          newValue: "7:35 AM at Gate 2 Bus Bay (+20m delay)",
          changeType: "TIMING",
          summary: "Fleet repair caused 20-min delay; drop-off relocated to Gate 2.",
          emailId: "email-003"
        }
      ]
    };
  }

  private static generateLocalFallbackDashboard(): DashboardData {
    const emails = localDemoEmails as EmailData[];
    const urgentActions: ActionItem[] = [
      {
        id: "action-1",
        emailId: "email-001",
        title: "Report to Block C Hall 204 by 8:40 AM with ID card for CSE302 exam",
        category: "EXAMS",
        priority: "CRITICAL",
        deadline: "Tomorrow, 8:40 AM",
        completed: false,
        sourceEmailSubject: "URGENT: Examination Hall Changed for Tomorrow",
        sourceSender: "Controller of Examinations",
        location: "Block C – Hall 204"
      },
      {
        id: "action-2",
        emailId: "email-002",
        title: "Submit attendance explanation form before Friday 5 PM to avoid debarment",
        category: "ATTENDANCE",
        priority: "HIGH",
        deadline: "Friday, Oct 2 · 5:00 PM",
        completed: false,
        sourceEmailSubject: "Attendance Shortage Notice – CSE Students",
        sourceSender: "Attendance Monitoring Cell",
        location: "Room 114 Admin Block"
      },
      {
        id: "action-3",
        emailId: "email-003",
        title: "Board Route 4 at delayed time (7:35 AM) or use Metro Line 2 to arrive before 8:40 AM exam cutoff",
        category: "TRANSPORT",
        priority: "HIGH",
        deadline: "Tomorrow, 7:35 AM",
        completed: false,
        sourceEmailSubject: "Bus Route 4 Delayed Tomorrow Morning",
        sourceSender: "Campus Fleet Services",
        location: "Gate 2 Bus Bay"
      }
    ];

    return {
      mode: "demo",
      student: {
        name: "Muthu",
        university: "Northbridge University",
        program: "CSE – AI & ML",
        semester: 3
      },
      metrics: {
        totalAnalyzed: emails.length,
        requireAttention: 3,
        criticalCount: 1,
        highPriorityCount: 4,
        mediumPriorityCount: 22,
        lowPriorityCount: 75,
        upcomingDeadlinesCount: 4,
        actionsCompleted: 0,
        actionsPending: 3
      },
      campusPulse: {
        activityLevel: "HIGH",
        recentSignalsCount: emails.length,
        waveform: [40, 65, 30, 75, 95, 80, 55, 60, 85, 90, 70, 45, 65, 85, 40],
        lastSignalTime: new Date().toISOString()
      },
      urgentActions,
      recentEmails: emails.slice(0, 10),
      categoryCounts: {
        EXAMS: 8,
        ATTENDANCE: 4,
        ACADEMICS: 12,
        TRANSPORT: 5,
        EVENTS: 9,
        FEES: 3,
        HOSTEL: 6,
        PLACEMENTS: 7,
        SCHOLARSHIPS: 2
      },
      todayTimeline: [
        {
          time: "8:40 AM",
          title: "CSE302 Exam Reporting Cutoff",
          category: "EXAMS",
          priority: "CRITICAL",
          emailId: "email-001",
          location: "Block C – Hall 204"
        },
        {
          time: "9:00 AM",
          title: "CSE302 Database Systems Exam",
          category: "EXAMS",
          priority: "CRITICAL",
          emailId: "email-001",
          location: "Block C – Hall 204"
        },
        {
          time: "1:00 PM",
          title: "Hostel Water Supply Maintenance Window",
          category: "HOSTEL",
          priority: "MEDIUM",
          emailId: "email-014",
          location: "Hostel Blocks B & C"
        },
        {
          time: "5:00 PM",
          title: "Attendance Explanation Submission",
          category: "ATTENDANCE",
          priority: "HIGH",
          emailId: "email-002",
          location: "Room 114 Admin Block"
        }
      ],
      briefing: {
        date: "Wednesday, September 30, 2026",
        greeting: "Good morning, Muthu",
        studentName: "Muthu",
        headline: "You have 1 critical alert and 2 high-priority actions requiring attention today.",
        criticalCount: 1,
        highCount: 2,
        upcomingDeadlinesCount: 4,
        academicUpdatesCount: 8,
        summaryBullets: [
          {
            emoji: "🔴",
            priority: "CRITICAL",
            title: "Tomorrow's Examination Hall Relocated",
            description: "CSE302 exam moved to Block C Hall 204. Must report by 8:40 AM.",
            emailId: "email-001"
          },
          {
            emoji: "🟠",
            priority: "HIGH",
            title: "Attendance Shortage Notice",
            description: "Attendance is 68.4%. Submit explanation form to Room 114 before Friday.",
            emailId: "email-002"
          }
        ],
        motivationalNote: "Stay focused on your morning revision. Don't forget your printed admit card with hologram.",
        aiProvider: 'mock-fallback'
      },
      whatChanged: [
        {
          topic: "CSE302 Database Exam Venue",
          previousValue: "Block A, Main Hall",
          newValue: "Block C, Hall 204",
          changeType: "LOCATION",
          summary: "Exam relocated to Block C Hall 204. Arrive by 8:40 AM.",
          emailId: "email-001"
        }
      ]
    };
  }
}
