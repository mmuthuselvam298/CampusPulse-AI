export type Priority = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export type Category = 
  | 'ACADEMICS'
  | 'EXAMS'
  | 'ATTENDANCE'
  | 'ASSIGNMENTS'
  | 'TIMETABLE'
  | 'COURSE REGISTRATION'
  | 'EVENTS'
  | 'TECH EVENTS'
  | 'HACKATHONS'
  | 'STUDENT CLUBS'
  | 'CLUBS'
  | 'PLACEMENTS'
  | 'ENTREPRENEURSHIP'
  | 'FEES'
  | 'HOSTEL'
  | 'TRANSPORT'
  | 'ADMINISTRATION'
  | 'EMERGENCY'
  | 'FACILITIES'
  | 'LIBRARY'
  | 'SCHOLARSHIPS'
  | 'GENERAL';

export interface EmailAttachment {
  name: string;
  size: string;
  type: string;
}

export interface EmailData {
  id: string;
  sender: string;
  senderName: string;
  recipient: string;
  cc?: string[];
  subject: string;
  body: string;
  timestamp: string;
  dateFormatted: string;
  category: Category;
  priority: Priority;
  priorityScore: number;
  priorityReason: string;
  categoryReason: string;
  summary: string;
  actionRequired: boolean;
  actionText?: string;
  actionDeadline?: string;
  deadlineDate?: string;
  eventDate?: string;
  location?: string;
  affectedGroup?: string;
  urgency: Priority;
  tags: string[];
  isRead: boolean;
  isActionCompleted?: boolean;
  source: 'demo' | 'gmail';
  attachments?: EmailAttachment[];
  threadId?: string;
  systemOrigin?: string;
}

export interface ActionItem {
  id: string;
  emailId: string;
  title: string;
  category: Category;
  priority: Priority;
  deadline?: string;
  deadlineDate?: string;
  completed: boolean;
  completedAt?: string;
  snoozedUntil?: string;
  sourceEmailSubject: string;
  sourceSender: string;
  location?: string;
}

export interface ScheduleChangeItem {
  topic: string;
  previousValue: string;
  newValue: string;
  changeType: 'LOCATION' | 'DEADLINE' | 'TIMING' | 'CANCELLATION';
  summary: string;
  emailId: string;
  whatChanged?: string;
  whyItMatters?: string;
  whatYouNeedToDo?: string;
}

export interface CampusBriefingResult {
  date: string;
  greeting: string;
  studentName: string;
  headline: string;
  criticalCount: number;
  highCount: number;
  upcomingDeadlinesCount: number;
  academicUpdatesCount: number;
  summaryBullets: {
    emoji: string;
    priority: Priority;
    title: string;
    description: string;
    emailId?: string;
  }[];
  motivationalNote: string;
  aiProvider: 'gemini' | 'mock-fallback';
}

export interface DashboardData {
  mode: 'demo' | 'gmail';
  student: {
    name: string;
    university: string;
    program: string;
    school?: string;
    email?: string;
    semester: number;
  };
  metrics: {
    totalAnalyzed: number;
    requireAttention: number;
    criticalCount: number;
    highPriorityCount: number;
    mediumPriorityCount: number;
    lowPriorityCount: number;
    upcomingDeadlinesCount: number;
    actionsCompleted: number;
    actionsPending: number;
  };
  campusPulse: {
    activityLevel: 'HIGH' | 'NORMAL' | 'ELEVATED';
    recentSignalsCount: number;
    waveform: number[];
    lastSignalTime: string;
  };
  urgentActions: ActionItem[];
  recentEmails: EmailData[];
  categoryCounts: Record<string, number>;
  todayTimeline: {
    time: string;
    title: string;
    category: Category;
    priority: Priority;
    emailId: string;
    location?: string;
  }[];
  briefing: CampusBriefingResult;
  whatChanged: ScheduleChangeItem[];
}

export interface ToastMessage {
  id: string;
  title: string;
  message: string;
  priority: Priority;
  emailId?: string;
  time: string;
}
