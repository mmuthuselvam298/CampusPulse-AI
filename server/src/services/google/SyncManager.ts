import { GoogleOAuthService } from './GoogleOAuthService';
import { GmailService } from '../gmail/GmailService';
import { ClassroomService } from './ClassroomService';
import { CalendarService } from './CalendarService';
import { SQLiteService } from '../../db/SQLiteService';
import { PriorityEngine } from '../priority/PriorityEngine';
import { ActionExtractor } from '../actions/ActionExtractor';
import { AIService } from '../ai/AIService';
import { GoogleSyncResult, EmailData } from '../../types';

export class SyncManager {
  private static instance: SyncManager;
  private syncInterval: ReturnType<typeof setInterval> | null = null;
  private isSyncing: boolean = false;
  private syncLock: Promise<void> = Promise.resolve();

  private constructor() {}

  public static getInstance(): SyncManager {
    if (!SyncManager.instance) {
      SyncManager.instance = new SyncManager();
    }
    return SyncManager.instance;
  }

  /**
   * Start background sync polling at the configured interval
   */
  public startBackgroundSync(): void {
    const intervalSeconds = parseInt(process.env.GMAIL_SYNC_INTERVAL_SECONDS || '60', 10);
    const intervalMs = Math.max(15000, intervalSeconds * 1000); // Minimum 15 seconds

    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }

    console.log(`🔄 SyncManager: Background sync enabled (every ${intervalSeconds}s)`);

    // Perform initial sync after a short delay
    setTimeout(async () => {
      const oauth = GoogleOAuthService.getInstance();
      if (oauth.isAuthConnected()) {
        console.log('🔄 SyncManager: Performing initial sync...');
        try {
          await this.syncAll();
        } catch (err) {
          console.warn('🔄 SyncManager: Initial sync warning:', err);
        }
      }
    }, 3000);

    this.syncInterval = setInterval(async () => {
      const oauth = GoogleOAuthService.getInstance();
      if (oauth.isAuthConnected() && !this.isSyncing) {
        try {
          await this.syncAll();
        } catch (err) {
          console.warn('🔄 SyncManager: Background sync error:', err);
        }
      }
    }, intervalMs);
  }

  /**
   * Stop background sync
   */
  public stopBackgroundSync(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
      console.log('🔄 SyncManager: Background sync stopped');
    }
  }

  /**
   * Perform a full sync of Gmail, Classroom, and Calendar
   * Uses a lock to prevent overlapping syncs
   */
  public async syncAll(): Promise<GoogleSyncResult> {
    if (this.isSyncing) {
      return {
        success: false,
        gmailImported: 0, gmailSkipped: 0,
        classroomCourses: 0, classroomAssignments: 0, classroomAnnouncements: 0,
        calendarEvents: 0, newActions: 0, updatedItems: 0, durationMs: 0,
        message: 'Sync already in progress'
      };
    }

    this.isSyncing = true;
    const startTime = Date.now();
    const db = SQLiteService.getInstance();
    const oauth = GoogleOAuthService.getInstance();

    let gmailImported = 0;
    let gmailSkipped = 0;
    let updatedItems = 0;
    let newActions = 0;

    try {
      // 1. Sync Gmail
      if (oauth.isAuthConnected()) {
        try {
          db.updateSyncState('gmail', { syncStatus: 'syncing' });
          const syncDays = parseInt(process.env.GMAIL_INITIAL_SYNC_DAYS || '30', 10);
          const liveEmails = await GmailService.fetchUniversityEmails(syncDays);

          for (const email of liveEmails) {
            const existing = email.gmailMessageId ? db.getEmailByGmailMessageId(email.gmailMessageId!) : db.getEmailById(email.id);
            if (existing) {
              gmailSkipped++;
              if (existing.subject !== email.subject || existing.body !== email.body) {
                updatedItems++;
                email.aiAnalyzed = false; // re-analyze if changed
                db.upsertEmail(email as any);
              }
            } else {
              // Apply priority engine
              const priorityResult = PriorityEngine.evaluate(email.subject, email.body, email.sender, email.deadlineDate || email.timestamp);
              email.priority = priorityResult.priority;
              email.priorityScore = priorityResult.priorityScore;
              email.priorityReason = priorityResult.priorityReason;
              email.urgency = priorityResult.priority;
              email.categoryReason = priorityResult.categoryReason;

              db.upsertEmail(email as any);
              gmailImported++;
            }
          }

          db.updateSyncState('gmail', {
            lastSync: new Date().toISOString(),
            syncStatus: 'success',
            syncError: null as any,
            recordsSynced: gmailImported
          });
        } catch (err: any) {
          console.warn('Gmail sync warning:', err?.message || err);
          db.updateSyncState('gmail', { syncStatus: 'error', syncError: err?.message || 'Gmail sync failed' });
        }
      }

      // 2. Sync Classroom
      try {
        db.updateSyncState('classroom', { syncStatus: 'syncing' });
        const classroomService = ClassroomService.getInstance();
        const classroomData = await classroomService.syncClassroom();

        for (const course of classroomData.courses) {
          db.upsertClassroomCourse(course);
        }
        for (const work of classroomData.coursework) {
          db.upsertClassroomCoursework(work);
        }
        for (const ann of classroomData.announcements) {
          db.upsertClassroomAnnouncement(ann);
        }

        // Cross-link Classroom with Gmail
        const allEmails = db.getEmails();
        for (const email of allEmails) {
          for (const work of classroomData.coursework) {
            const titleWords = work.title.toLowerCase().split(' ').filter(w => w.length > 3);
            const matchesTitle = titleWords.some(w =>
              email.subject.toLowerCase().includes(w) || email.body.toLowerCase().includes(w)
            );
            if (matchesTitle && !email.relatedClassroomWorkId) {
              db.upsertRelationship({
                sourceId: email.id, sourceType: 'email',
                targetId: work.id, targetType: 'classroom_coursework',
                relationshipType: 'RELATED_TO', confidence: 0.7
              });
            }
          }
        }

        db.updateSyncState('classroom', {
          lastSync: new Date().toISOString(),
          syncStatus: 'success',
          syncError: null as any,
          recordsSynced: classroomData.courses.length + classroomData.coursework.length + classroomData.announcements.length
        });
      } catch (err: any) {
        console.warn('Classroom sync warning:', err?.message || err);
        db.updateSyncState('classroom', { syncStatus: 'error', syncError: err?.message || 'Classroom sync failed' });
      }

      // 3. Sync Calendar
      try {
        db.updateSyncState('calendar', { syncStatus: 'syncing' });
        const calendarService = CalendarService.getInstance();
        const calendarEvents = await calendarService.getUpcomingEvents();

        for (const event of calendarEvents) {
          db.upsertCalendarEvent(event);
        }

        db.updateSyncState('calendar', {
          lastSync: new Date().toISOString(),
          syncStatus: 'success',
          syncError: null as any,
          recordsSynced: calendarEvents.length
        });
      } catch (err: any) {
        console.warn('Calendar sync warning:', err?.message || err);
        db.updateSyncState('calendar', { syncStatus: 'error', syncError: err?.message || 'Calendar sync failed' });
      }

      // 4. Extract/refresh actions from all emails
      const allEmails = db.getEmails();
      const existingActions = db.getActions();
      const existingActionIds = new Set(existingActions.map(a => a.id));
      const extractedActions = ActionExtractor.extractActions(allEmails);
      for (const act of extractedActions) {
        if (!existingActionIds.has(act.id)) {
          db.upsertAction(act);
          newActions++;
        }
      }

      // 5. Run AI analysis on unanalyzed emails (background, non-blocking)
      this.runBackgroundAIAnalysis().catch(err => {
        console.warn('Background AI analysis error:', err);
      });

      // 6. Update overall sync metadata
      const nowIso = new Date().toISOString();
      oauth.setLastSync(nowIso);
      db.updateSyncState('full', { lastSync: nowIso, syncStatus: 'success' });

      const durationMs = Date.now() - startTime;
      const stats = db.getStats();

      return {
        success: true,
        timestamp: nowIso,
        gmailImported,
        gmailSkipped,
        classroomCourses: stats.courses,
        classroomAssignments: stats.coursework,
        classroomAnnouncements: stats.announcements,
        calendarEvents: stats.calendarEvents,
        newActions,
        updatedItems,
        durationMs,
        message: `Synchronized: ${gmailImported} new emails, ${stats.courses} courses, ${stats.coursework} assignments, ${stats.calendarEvents} events`
      };
    } finally {
      this.isSyncing = false;
    }
  }

  /**
   * Run AI analysis on emails that haven't been analyzed yet
   */
  private async runBackgroundAIAnalysis(): Promise<void> {
    const db = SQLiteService.getInstance();
    const ai = AIService.getInstance();
    const unanalyzed = db.getEmails().filter((e: any) => !e.aiAnalyzed);

    // Process up to 10 at a time to avoid rate limits
    const batch = unanalyzed.slice(0, 10);
    for (const email of batch) {
      try {
        const analysis = await ai.analyzeEmail({
          subject: email.subject,
          body: email.body,
          sender: email.sender
        });

        // Update the email with AI analysis results
        db.upsertEmail({
          ...email,
          category: analysis.category,
          priority: analysis.priority,
          priorityScore: analysis.priorityScore,
          priorityReason: analysis.reason,
          categoryReason: analysis.categoryReason,
          summary: analysis.summary,
          actionText: analysis.action || email.actionText,
          actionDeadline: analysis.deadline || email.actionDeadline,
          location: analysis.location || email.location,
          actionRequired: analysis.actionRequired,
          aiAnalyzed: true,
        } as any);

        // Create action if analysis found one
        if (analysis.actionRequired && analysis.action) {
          const actionId = `action-${email.id}`;
          db.upsertAction({
            id: actionId,
            emailId: email.id,
            title: analysis.action,
            category: analysis.category,
            priority: analysis.priority,
            deadline: analysis.deadline,
            deadlineDate: email.deadlineDate,
            completed: false,
            sourceEmailSubject: email.subject,
            sourceSender: email.senderName,
            location: analysis.location,
          });
        }
      } catch (err) {
        // Non-blocking: continue with next email
        console.warn(`AI analysis failed for email ${email.id}:`, err);
      }
    }
  }

  public isSyncInProgress(): boolean {
    return this.isSyncing;
  }
}
