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
  timestamp: string; // ISO
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
  isNoise?: boolean;
  systemOrigin?: string;
  // Cross-system links
  relatedClassroomCourseId?: string;
  relatedClassroomWorkId?: string;
  relatedCalendarEventId?: string;
  isCalendarAdded?: boolean;
  calendarEventId?: string;
  aiAnalyzed?: boolean;
  labels?: string[];
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
  relatedCalendarEventId?: string;
  isCalendarEligible?: boolean;
}

export interface FactorBreakdown {
  deadlineProximityScore: number;
  immediateActionScore: number;
  academicConsequenceScore: number;
  financialConsequenceScore: number;
  safetyScore: number;
  transportDisruptionScore: number;
  examAttendanceImpactScore: number;
  urgencyKeywordsScore: number;
}

export interface PriorityEvaluation {
  priority: Priority;
  priorityScore: number;
  priorityReason: string;
  categoryReason: string;
  factors: FactorBreakdown;
}

export interface EmailAnalysisResult {
  category: Category;
  priority: Priority;
  priorityScore: number;
  summary: string;
  deadline?: string;
  actionRequired: boolean;
  action?: string;
  eventDate?: string;
  location?: string;
  affectedGroup?: string;
  urgency: Priority;
  reason: string;
  categoryReason: string;
  aiProvider: 'gemini' | 'mock-fallback';
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
    sourceType?: 'email' | 'classroom' | 'calendar';
  }[];
  motivationalNote: string;
  aiProvider: 'gemini' | 'mock-fallback';
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

// Google Classroom Models
export interface ClassroomCourse {
  id: string;
  name: string;
  section?: string;
  descriptionHeading?: string;
  room?: string;
  alternateLink?: string;
  courseState?: string;
  teacherName?: string;
  enrollmentCode?: string;
}

export interface ClassroomCoursework {
  id: string;
  courseId: string;
  courseName: string;
  title: string;
  description?: string;
  state?: 'PUBLISHED' | 'DRAFT' | 'DELETED' | string;
  alternateLink?: string;
  creationTime?: string;
  updateTime?: string;
  dueDate?: string; // YYYY-MM-DD
  dueTime?: string; // HH:mm
  dueDateTimeISO?: string;
  maxPoints?: number;
  workType?: 'ASSIGNMENT' | 'SHORT_ANSWER_QUESTION' | 'MULTIPLE_CHOICE_QUESTION' | string;
  submissionStatus?: 'SUBMITTED' | 'NEW' | 'TURNED_IN' | 'RETURNED' | 'LATE' | 'ASSIGNED' | string;
  priority: Priority;
  relatedEmailId?: string;
  isCalendarAdded?: boolean;
}

export interface ClassroomAnnouncement {
  id: string;
  courseId: string;
  courseName: string;
  text: string;
  alternateLink?: string;
  creationTime: string;
  updateTime?: string;
  creatorName?: string;
  relatedEmailId?: string;
}

export interface ClassroomSubmission {
  id: string;
  courseId: string;
  courseWorkId: string;
  state: 'NEW' | 'CREATED' | 'TURNED_IN' | 'RETURNED' | 'RECLAIMED_BY_STUDENT' | string;
  late?: boolean;
  assignedGrade?: number;
}

// Google Calendar Models
export interface GoogleCalendarEvent {
  id: string;
  title: string;
  description?: string;
  location?: string;
  startTime: string; // ISO
  endTime: string; // ISO
  allDay?: boolean;
  isAllDay?: boolean;
  status?: string;
  htmlLink?: string;
  source?: string;
  sourceType?: 'google' | 'detected_email' | 'detected_classroom' | string;
  sourceId?: string;
  isCreatedByApp?: boolean;
}

export interface CalendarConflictCheckResult {
  hasConflict: boolean;
  conflictingEvents: GoogleCalendarEvent[];
  isDuplicate?: boolean;
  existingEventId?: string;
  message?: string;
}

// Google Unified Sync & Connection Status
export interface GoogleServiceStatus {
  isConnected?: boolean;
  connected?: boolean;
  configured?: boolean;
  userEmail: string | null;
  userName?: string | null;
  userPicture?: string | null;
  lastSync?: string | null;
  scopes?: string[];
  gmail?: {
    connected: boolean;
    lastSync: string | null;
    messageCount?: number;
    readOnly?: boolean;
  };
  classroom?: {
    connected: boolean;
    lastSync: string | null;
    courseCount?: number;
    assignmentCount?: number;
    announcementCount?: number;
    readOnly?: boolean;
  };
  calendar?: {
    connected: boolean;
    lastSync: string | null;
    eventCount?: number;
    readOnly?: boolean;
  };
  gemini?: {
    connected?: boolean;
    configured?: boolean;
    model: string;
    status?: string;
  };
  maps?: {
    configured: boolean;
  };
  services?: any;
}

export interface GoogleSyncResult {
  success?: boolean;
  gmailImported: number;
  gmailSkipped: number;
  classroomCourses: number;
  classroomAssignments: number;
  classroomAnnouncements: number;
  calendarEvents: number;
  newActions: number;
  updatedItems: number;
  durationMs: number;
  timestamp?: string;
  message?: string;
}

// AI Tool Calling & Grounding Models
export interface SourceCitation {
  sourceType?: 'email' | 'classroom' | 'calendar' | string;
  type?: 'gmail' | 'classroom' | 'calendar' | 'university' | string;
  id: string;
  title: string;
  detail?: string;
  snippet?: string;
  date?: string;
  timestamp?: string;
  url?: string;
}

export interface AssistantQueryResult {
  answer: string;
  suggestedActions: string[];
  referencedEmailIds: string[];
  toolUsed?: string;
  citations?: SourceCitation[];
}


export interface DashboardData {
  mode: 'demo' | 'live' | 'gmail';
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
    classroomAssignmentsCount?: number;
    calendarEventsCount?: number;
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
    sourceType?: 'email' | 'classroom' | 'calendar';
  }[];
  briefing: CampusBriefingResult;
  whatChanged: ScheduleChangeItem[];
  classroomAssignments?: ClassroomCoursework[];
  classroomAnnouncements?: ClassroomAnnouncement[];
  calendarEvents?: GoogleCalendarEvent[];
  googleStatus?: GoogleServiceStatus;
}

export interface ToastMessage {
  id: string;
  title: string;
  message: string;
  priority?: Priority | string;
  emailId?: string;
  time?: string;
}

// ==========================================
// UNIQUE FEATURES EXPANSION TYPES
// ==========================================

export type UniqueFeatureCategory = 
  | 'UNDERSTAND'
  | 'DETECT'
  | 'ACT'
  | 'PERSONALIZE'
  | 'DEMO_TRUST'
  | 'AI';

export interface UniqueFeatureCardDef {
  id: string;
  route: string;
  title: string;
  subtitle: string;
  whyItMatters: string;
  category: UniqueFeatureCategory;
  iconName: string;
  badge?: 'LIVE' | 'DEMO' | 'AI' | 'GOOGLE' | 'FLAGSHIP';
  badgeColor?: string;
}

// 1. Knowledge Graph
export type GraphNodeType = 'COURSE' | 'GMAIL' | 'CLASSROOM' | 'CALENDAR' | 'ACTION' | 'DEADLINE' | 'ANNOUNCEMENT' | 'TOPIC';

export interface KnowledgeGraphNode {
  id: string;
  label: string;
  type: GraphNodeType;
  source: 'gmail' | 'classroom' | 'calendar' | 'system' | 'action';
  sourceId?: string;
  category?: Category;
  timestamp?: string;
  priority?: Priority;
  details?: Record<string, any>;
  x?: number;
  y?: number;
  vx?: number;
  vy?: number;
}

export interface KnowledgeGraphEdge {
  id: string;
  source: string; // source node id
  target: string; // target node id
  label: string;
  type: 'CONTAINS' | 'SCHEDULED_IN' | 'ANNOUNCED_BY' | 'TRIGGERS_ACTION' | 'HAS_DEADLINE' | 'CHANGED_BY' | 'CONFLICTS_WITH' | 'SYNCS_TO';
}

export interface KnowledgeGraphData {
  nodes: KnowledgeGraphNode[];
  edges: KnowledgeGraphEdge[];
  summary: {
    totalNodes: number;
    totalEdges: number;
    courseCount: number;
    emailCount: number;
    classroomCount: number;
    calendarCount: number;
    actionCount: number;
  };
}

// 3. Information Conflict
export interface ConflictSourceEvidence {
  sourceName: 'Gmail' | 'Google Calendar' | 'Google Classroom';
  value: string;
  timestamp?: string;
  recordId: string;
  recordTitle: string;
  excerpt: string;
  url?: string;
}

export interface InformationConflict {
  id: string;
  eventId: string;
  eventTitle: string;
  field: 'TIME' | 'LOCATION' | 'DATE' | 'STATUS' | 'DEADLINE';
  sourceA: ConflictSourceEvidence;
  sourceB: ConflictSourceEvidence;
  severity: 'HIGH' | 'MEDIUM';
  detectedAt: string;
  currentKnownState: string;
  hasAuthoritativeResolution: boolean;
  authoritativeSource?: string;
  resolutionExplanation: string;
  suggestedAction: string;
  calendarEventId?: string;
  emailId?: string;
}

// 4. Information Truth Resolution
export interface TruthFieldResolution {
  field: 'Title' | 'Date' | 'Time' | 'Location' | 'Status';
  value: string;
  status: 'Confirmed' | 'Supported' | 'Conflicting' | 'Unknown';
  authoritativeReason: string;
  sources: {
    source: 'Gmail' | 'Google Classroom' | 'Google Calendar';
    value: string;
    evidence: string;
    timestamp?: string;
  }[];
}

export interface TruthResolutionItem {
  id: string;
  eventId: string;
  title: string;
  overallStatus: 'Confirmed' | 'Supported' | 'Conflicting' | 'Unknown';
  fields: TruthFieldResolution[];
  sourcesCovered: {
    gmail: boolean;
    classroom: boolean;
    calendar: boolean;
  };
  lastVerifiedAt: string;
}

// 6. Deadline Risk
export interface DeadlineRiskItem {
  id: string;
  title: string;
  courseName?: string;
  sourceType: 'classroom' | 'gmail';
  sourceId: string;
  dueDate: string; // ISO or formatted
  dueTimeFormatted?: string;
  hoursRemaining: number;
  riskLevel: 'LOW RISK' | 'MEDIUM RISK' | 'HIGH RISK';
  submissionStatus: 'SUBMITTED' | 'ASSIGNED' | 'NEW' | 'TURNED_IN' | 'UNAVAILABLE' | string;
  explicitActionRequired: boolean;
  hasRepeatedReminders: boolean;
  hasChangedDeadline: boolean;
  hasConflict: boolean;
  riskScore: number; // 0 - 100
  riskReasons: string[];
  suggestedAction: string;
}

// 7. AI Calendar Planner
export interface PlannedScheduleSlot {
  id: string;
  timeSlot: string; // e.g. "09:00 - 10:00"
  startTime: string; // ISO
  endTime: string; // ISO
  title: string;
  activityType: 'CLASS' | 'EVENT' | 'WORKSHOP' | 'STUDY' | 'SUBMISSION' | 'BREAK' | 'EXAM';
  priority: Priority;
  location?: string;
  sourceType?: 'email' | 'classroom' | 'calendar' | 'ai_suggested';
  sourceId?: string;
  description: string;
  isAlreadyInCalendar: boolean;
  calendarEventId?: string;
  conflictWarning?: string;
}

export interface AICalendarPlan {
  targetDate: string;
  dayHeadline: string;
  productivityScore: number;
  schedule: PlannedScheduleSlot[];
  summary: {
    totalCommitments: number;
    studyTimeMinutes: number;
    breakTimeMinutes: number;
    unaddedCount: number;
  };
  aiRecommendations: string[];
}

// 8 & 20. Unified Event Card
export interface UnifiedEventSource {
  type: 'gmail' | 'classroom' | 'calendar';
  id: string;
  title: string;
  timestamp?: string;
  snippet?: string;
  url?: string;
  detail?: string;
}

export interface UnifiedEvent {
  id: string;
  title: string;
  topicKey: string;
  category: Category;
  priority: Priority;
  dateFormatted: string;
  timeFormatted: string;
  location?: string;
  status: 'Confirmed' | 'Supported' | 'Conflicting' | 'Changed' | 'Postponed' | 'Cancelled' | 'Unknown';
  sources: UnifiedEventSource[];
  sourceCount: number;
  relatedEmailCount: number;
  hasClassroom: boolean;
  hasCalendar: boolean;
  isCalendarAdded: boolean;
  calendarEventId?: string;
  actions: ActionItem[];
  changes: ScheduleChangeItem[];
  conflicts: InformationConflict[];
  whyItMatters: string[];
  timeline: {
    date: string;
    timestamp: string;
    title: string;
    source: string;
    description: string;
    badge?: string;
  }[];
}

// 9. "What Did I Miss?" / Catch-Up
export interface CatchUpSummary {
  timeframe: 'today' | 'since_yesterday' | 'last_3_days' | 'last_week';
  timeframeLabel: string;
  analyzedSince: string;
  counts: {
    importantChanges: number;
    newActions: number;
    informationalUpdates: number;
    totalNotices: number;
  };
  highlights: {
    category: Category;
    title: string;
    summary: string;
    type: 'CHANGE' | 'ACTION' | 'INFO';
    sourceType: string;
    id: string;
  }[];
  topActions: ActionItem[];
}

// 10. Communication Health
export interface CommunicationHealthMetrics {
  totalCommunications: number;
  duplicateOrRelatedCount: number;
  duplicatePercentage: number;
  withDeadlinesCount: number;
  withDeadlinesPercentage: number;
  withLocationsCount: number;
  withLocationsPercentage: number;
  withExplicitActionsCount: number;
  withExplicitActionsPercentage: number;
  conflictingInfoCount: number;
  changedEventsCount: number;
  missingLocationCount: number;
  missingTimeCount: number;
  overallHealthScore: number; // 0 - 100
  grade: 'A' | 'B' | 'C' | 'D';
  datasetContext: string;
  topInsights: string[];
}

// 11. Opportunity Matcher
export interface OpportunityItem {
  id: string;
  title: string;
  type: 'HACKATHON' | 'WORKSHOP' | 'EXPERT_TALK' | 'COMPETITION' | 'INTERNSHIP' | 'CLUB_RECRUITMENT' | 'FDP';
  organizer: string;
  date?: string;
  deadline?: string;
  location?: string;
  relevanceScore: number; // 0 - 100
  whyRelevant: string[];
  actionText: string;
  sourceId: string;
  sourceSubject: string;
  category: Category;
  tags: string[];
}

// 12. Attention Budget
export interface AttentionBudgetData {
  date: string;
  totalItems: number;
  immediate: {
    count: number;
    items: {
      id: string;
      title: string;
      reason: string;
      deadline?: string;
      priority: Priority;
      category: Category;
      source: string;
    }[];
  };
  thisWeek: {
    count: number;
    items: {
      id: string;
      title: string;
      reason: string;
      deadline?: string;
      priority: Priority;
      category: Category;
      source: string;
    }[];
  };
  informational: {
    count: number;
    items: {
      id: string;
      title: string;
      category: Category;
      source: string;
    }[];
  };
}

// 13. Decision Explanation
export interface AIDecisionExplanation {
  itemId: string;
  itemTitle: string;
  decisionType: 'PRIORITY' | 'RECOMMENDATION' | 'RISK' | 'RELATIONSHIP' | 'CHANGE';
  outcome: string;
  reasons: string[];
  evidenceSources: {
    source: string;
    title: string;
    snippet: string;
    timestamp?: string;
  }[];
}

// 14. Chaos Simulator
export type ChaosSimulationType = 
  | 'ROOM_CHANGE'
  | 'TIME_CHANGE'
  | 'DEADLINE_CHANGE'
  | 'EVENT_POSTPONEMENT'
  | 'EVENT_CANCELLATION'
  | 'UNIVERSITY_CLOSURE'
  | 'TRANSPORT_DISRUPTION'
  | 'CONFLICTING_INFO';

export interface ChaosSimulationResult {
  simulationType: ChaosSimulationType;
  success: boolean;
  headline: string;
  simulatedEmail: EmailData;
  affectedEventTitle: string;
  changeDetected: ScheduleChangeItem;
  conflictDetected?: InformationConflict;
  actionCreated?: ActionItem;
  calendarWarning?: string;
  summaryOfUpdates: string[];
}

// 16. Consequence Analysis
export interface ConsequenceAnalysis {
  actionId: string;
  actionTitle: string;
  deadline?: string;
  consequences: string[];
  supportedByEvidence: boolean;
  evidenceSource: string;
  evidenceSnippet: string;
}

// 24. Smart Notification Digest
export interface NotificationDigestGroup {
  topicKey: string;
  topicTitle: string;
  category: Category;
  totalNotificationsCount: number;
  condensedHeadline: string;
  lastUpdated: string;
  summary: string;
  primaryAction?: ActionItem;
  hasChanges: boolean;
  hasConflict: boolean;
  emails: EmailData[];
}


