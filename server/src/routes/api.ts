import { Router, Request, Response } from 'express';
import { DatabaseService } from '../db/DatabaseService';
import { SQLiteService } from '../db/SQLiteService';
import { AIService } from '../services/ai/AIService';
import { RelationshipEngine } from '../services/relationships/RelationshipEngine';
import { UniversityFilter } from '../services/filter/UniversityFilter';
import { ConflictEngine } from '../services/intelligence/ConflictEngine';
import { UnifiedEventEngine } from '../services/intelligence/UnifiedEventEngine';
import { RiskEngine } from '../services/intelligence/RiskEngine';
import { HealthEngine } from '../services/intelligence/HealthEngine';
import { OpportunityEngine } from '../services/intelligence/OpportunityEngine';
import { AttentionBudgetEngine } from '../services/intelligence/AttentionBudgetEngine';
import { KnowledgeGraphEngine } from '../services/intelligence/KnowledgeGraphEngine';
import { CalendarPlannerEngine } from '../services/intelligence/CalendarPlannerEngine';
import { CatchUpEngine } from '../services/intelligence/CatchUpEngine';
import { DigestEngine } from '../services/intelligence/DigestEngine';
import { SyncManager } from '../services/google/SyncManager';

export const apiRouter = Router();
const db = DatabaseService.getInstance();
const sqlite = SQLiteService.getInstance();
const ai = AIService.getInstance();

// ============================================================
// 1. DASHBOARD
// ============================================================
apiRouter.get('/dashboard', async (_req: Request, res: Response) => {
  try {
    const data = await db.getDashboardData();
    res.json(data);
  } catch (err: any) {
    console.error('Error fetching dashboard data:', err);
    res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
});

// ============================================================
// 2. EMAILS
// ============================================================
apiRouter.get('/emails', (req: Request, res: Response) => {
  try {
    const { priority, category, search, unread, source, sortBy, limit, offset } = req.query;
    const emails = sqlite.getEmails({
      priority: priority as string,
      category: category as string,
      search: search as string,
      unread: unread === 'true',
      source: source as string,
      sortBy: sortBy as string,
      limit: limit ? parseInt(limit as string) : undefined,
      offset: offset ? parseInt(offset as string) : undefined,
    });
    res.json({ total: emails.length, emails });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch emails' });
  }
});

apiRouter.get('/emails/:id', (req: Request, res: Response) => {
  const email = sqlite.getEmailById(req.params.id);
  if (!email) {
    res.status(404).json({ error: 'Email not found' });
    return;
  }
  sqlite.markEmailRead(email.id, true);
  res.json(email);
});

apiRouter.post('/emails/:id/analyze', async (req: Request, res: Response) => {
  try {
    const email = sqlite.getEmailById(req.params.id);
    if (!email) {
      res.status(404).json({ error: 'Email not found' });
      return;
    }
    const analysis = await ai.analyzeEmail({
      subject: email.subject, body: email.body, sender: email.sender
    });
    const updatedEmail = {
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
    };
    sqlite.upsertEmail(updatedEmail as any);
    res.json({ email: updatedEmail, analysis });
  } catch (err) {
    res.status(500).json({ error: 'AI analysis failed' });
  }
});

apiRouter.post('/emails/:id/read', (req: Request, res: Response) => {
  const { isRead = true } = req.body;
  const success = sqlite.markEmailRead(req.params.id, isRead);
  if (!success) {
    res.status(404).json({ error: 'Email not found' });
    return;
  }
  res.json({ success: true, emailId: req.params.id, isRead });
});

// ============================================================
// 3. ACTIONS
// ============================================================
apiRouter.get('/actions', (_req: Request, res: Response) => {
  const actions = sqlite.getActions();
  res.json({ actions, total: actions.length });
});

apiRouter.post('/actions/:id/toggle', (req: Request, res: Response) => {
  const action = sqlite.toggleAction(req.params.id);
  if (!action) {
    res.status(404).json({ error: 'Action item not found' });
    return;
  }
  res.json(action);
});

apiRouter.post('/actions', (req: Request, res: Response) => {
  const { title, category, priority, deadline, location, sourceEmailSubject } = req.body;
  if (!title) {
    res.status(400).json({ error: 'Task title is required' });
    return;
  }
  const user = sqlite.getUser();
  const newAction = sqlite.addAction({
    emailId: 'custom',
    title,
    category: category || 'GENERAL',
    priority: priority || 'MEDIUM',
    deadline: deadline || 'Today',
    completed: false,
    sourceEmailSubject: sourceEmailSubject || 'Manual Task',
    sourceSender: user?.name || 'Student',
    location
  });
  res.status(201).json(newAction);
});

// ============================================================
// 4. BRIEFING
// ============================================================
apiRouter.get('/briefing', async (_req: Request, res: Response) => {
  try {
    const emails = sqlite.getEmails({ limit: 20 });
    const user = sqlite.getUser();
    const briefing = await ai.generateBriefing(emails, user?.name || 'Student');
    res.json(briefing);
  } catch (err) {
    res.status(500).json({ error: 'Failed to generate campus briefing' });
  }
});

// ============================================================
// 5. ASSISTANT
// ============================================================
apiRouter.post('/assistant', async (req: Request, res: Response) => {
  try {
    const { query } = req.body;
    if (!query) {
      res.status(400).json({ error: 'Query is required' });
      return;
    }
    const emails = sqlite.getEmails({ limit: 30 });
    const actions = sqlite.getActions();
    const response = await ai.answerCampusQuery(query, emails, actions);
    res.json(response);
  } catch (err) {
    res.status(500).json({ error: 'Assistant query failed' });
  }
});

// ============================================================
// 6. RELATIONSHIPS
// ============================================================
apiRouter.get('/relationships', (_req: Request, res: Response) => {
  const emails = sqlite.getEmails();
  const clusters = RelationshipEngine.clusterByTopic(emails);
  const whatChanged = RelationshipEngine.getWhatChanged(emails);
  res.json({ clusters, whatChanged });
});

// ============================================================
// 7. GOOGLE OAUTH
// ============================================================
apiRouter.get('/google/oauth/start', (_req: Request, res: Response) => {
  const { GoogleOAuthService } = require('../services/google/GoogleOAuthService');
  const oauth = GoogleOAuthService.getInstance();
  if (!process.env.GOOGLE_CLIENT_ID || process.env.GOOGLE_CLIENT_ID.length < 5) {
    res.status(500).json({ error: 'Google OAuth is not configured. Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in .env' });
    return;
  }
  const url = oauth.getAuthUrl();
  res.json({ authUrl: url });
});

apiRouter.get('/google/oauth/callback', async (req: Request, res: Response) => {
  try {
    const { code } = req.query;
    if (!code || typeof code !== 'string') {
      res.status(400).send('Authorization code missing');
      return;
    }

    const { GoogleOAuthService } = require('../services/google/GoogleOAuthService');
    const oauth = GoogleOAuthService.getInstance();
    const result = await oauth.handleCallback(code);

    if (result) {
      // Create/update user in database
      const userInfo = {
        googleSubjectId: result.sub || undefined,
        email: result.email || oauth.getStatus().userEmail || 'student@srmap.edu.in',
        name: result.name || oauth.getStatus().userName || 'Student',
        picture: result.picture || oauth.getStatus().userPicture || undefined,
      };
      const user = sqlite.upsertUser(userInfo);

      // Store connection in database
      if (user) {
        sqlite.upsertGoogleConnection(user.id, {
          isConnected: true,
          scopes: JSON.stringify(GoogleOAuthService.REQUIRED_SCOPES),
        });
      }

      // Trigger initial sync
      SyncManager.getInstance().syncAll().catch(err => {
        console.warn('Post-OAuth initial sync error:', err);
      });

      const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
      res.redirect(`${clientUrl}/connections?google_connected=true`);
    } else {
      res.status(400).send('OAuth exchange failed. Please try again.');
    }
  } catch (err: any) {
    res.status(500).send(`OAuth callback error: ${err.message}`);
  }
});

apiRouter.get('/google/status', (_req: Request, res: Response) => {
  const { GoogleOAuthService } = require('../services/google/GoogleOAuthService');
  const status = GoogleOAuthService.getInstance().getStatus();

  // Enrich with actual database counts
  const stats = sqlite.getStats();
  const syncStates = sqlite.getAllSyncStates();
  const syncMap: Record<string, any> = {};
  syncStates.forEach((s: any) => { syncMap[s.service] = s; });

  if (status.gmail) {
    status.gmail.messageCount = stats.emails;
    status.gmail.lastSync = syncMap.gmail?.last_sync || status.gmail.lastSync;
  }
  if (status.classroom) {
    status.classroom.courseCount = stats.courses;
    status.classroom.assignmentCount = stats.coursework;
    status.classroom.announcementCount = stats.announcements;
    status.classroom.lastSync = syncMap.classroom?.last_sync || status.classroom.lastSync;
  }
  if (status.calendar) {
    status.calendar.eventCount = stats.calendarEvents;
    status.calendar.lastSync = syncMap.calendar?.last_sync || status.calendar.lastSync;
  }

  res.json(status);
});

apiRouter.post('/google/disconnect', (_req: Request, res: Response) => {
  const { GoogleOAuthService } = require('../services/google/GoogleOAuthService');
  GoogleOAuthService.getInstance().disconnect();
  SyncManager.getInstance().stopBackgroundSync();
  const user = sqlite.getUser();
  if (user) {
    sqlite.disconnectGoogle(user.id);
  }
  res.json({ message: 'Disconnected Google account.', isConnected: false });
});

// ============================================================
// 8. SYNC
// ============================================================
apiRouter.post('/google/sync', async (_req: Request, res: Response) => {
  try {
    const result = await SyncManager.getInstance().syncAll();
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Google sync failed' });
  }
});

apiRouter.get('/sync/status', (_req: Request, res: Response) => {
  const syncStates = sqlite.getAllSyncStates();
  const isSyncing = SyncManager.getInstance().isSyncInProgress();
  res.json({ isSyncing, services: syncStates });
});

// ============================================================
// 9. CLASSROOM
// ============================================================
apiRouter.get('/classroom/courses', (_req: Request, res: Response) => {
  res.json(db.getClassroomCourses());
});

apiRouter.get('/classroom/coursework', (req: Request, res: Response) => {
  const { courseId } = req.query;
  const work = sqlite.getClassroomCoursework(courseId as string || undefined);
  res.json(work);
});

apiRouter.get('/classroom/announcements', (req: Request, res: Response) => {
  const { courseId } = req.query;
  const ann = sqlite.getClassroomAnnouncements(courseId as string || undefined);
  res.json(ann);
});

// ============================================================
// 10. CALENDAR
// ============================================================
apiRouter.get('/calendar/events', (_req: Request, res: Response) => {
  const events = sqlite.getCalendarEvents();
  res.json(events);
});

apiRouter.post('/calendar/check-conflict', async (req: Request, res: Response) => {
  try {
    const { startTime, endTime, excludeEventId } = req.body;
    if (!startTime || !endTime) {
      res.status(400).json({ error: 'startTime and endTime are required' });
      return;
    }
    const { CalendarService } = require('../services/google/CalendarService');
    const result = await CalendarService.getInstance().checkConflict(startTime, endTime, excludeEventId);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Conflict check failed' });
  }
});

apiRouter.post('/calendar/events', async (req: Request, res: Response) => {
  try {
    const { title, startTime, endTime, description, location, sourceId } = req.body;
    if (!title || !startTime || !endTime) {
      res.status(400).json({ error: 'title, startTime, and endTime are required' });
      return;
    }

    const { CalendarService } = require('../services/google/CalendarService');
    const calendarService = CalendarService.getInstance();

    // Check duplicate
    const dupCheck = await calendarService.checkDuplicate(title, startTime, sourceId);
    if (dupCheck.isDuplicate) {
      res.status(409).json({
        error: 'Event already scheduled on Google Calendar',
        isDuplicate: true,
        existingEvent: dupCheck.existingEvent
      });
      return;
    }

    const created = await calendarService.createEvent({ title, startTime, endTime, description, location, sourceId });

    // Persist to SQLite
    if (created.event) {
      sqlite.upsertCalendarEvent(created.event);
      if (sourceId) {
        sqlite.upsertCalendarMapping(sourceId, 'email', created.event.id);
      }
    }

    res.status(201).json(created);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to create calendar event' });
  }
});

apiRouter.delete('/calendar/events/:id', async (req: Request, res: Response) => {
  try {
    const { CalendarService } = require('../services/google/CalendarService');
    await CalendarService.getInstance().deleteEvent(req.params.id);
    res.json({ success: true, message: 'Event deleted successfully' });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to delete event' });
  }
});

// ============================================================
// 11. AI STATUS
// ============================================================
apiRouter.get('/ai/status', async (_req: Request, res: Response) => {
  try {
    const health = await ai.checkHealth();
    res.json(health);
  } catch (err: any) {
    res.status(500).json({ aiProvider: 'gemini', status: 'error', error: err.message });
  }
});

// ============================================================
// 12. SETTINGS
// ============================================================
apiRouter.get('/settings', (_req: Request, res: Response) => {
  const { GoogleOAuthService } = require('../services/google/GoogleOAuthService');
  const user = sqlite.getUser();
  res.json({
    student: db.getStudentProfile(),
    aiProvider: ai.getActiveProviderName(),
    model: ai.getModelName(),
    allowedDomains: UniversityFilter.getAllowedDomains(),
    googleStatus: GoogleOAuthService.getInstance().getStatus(),
    categoriesEnabled: [
      'ACADEMICS', 'EXAMS', 'ATTENDANCE', 'ASSIGNMENTS', 'TIMETABLE',
      'COURSE REGISTRATION', 'EVENTS', 'TECH EVENTS', 'HACKATHONS', 'STUDENT CLUBS',
      'PLACEMENTS', 'ENTREPRENEURSHIP', 'FEES', 'HOSTEL', 'TRANSPORT',
      'ADMINISTRATION', 'EMERGENCY', 'FACILITIES', 'LIBRARY', 'SCHOLARSHIPS', 'GENERAL'
    ]
  });
});

apiRouter.post('/settings', (req: Request, res: Response) => {
  const { student } = req.body;
  if (student?.name || student?.email) {
    const user = sqlite.getUser();
    if (user) {
      sqlite.upsertUser({
        googleSubjectId: user.google_subject_id,
        email: student.email || user.email,
        name: student.name || user.name,
        picture: user.picture,
        program: student.program || user.program,
      });
    }
  }
  res.json({ message: 'Settings updated successfully' });
});

// ============================================================
// CAMPUS INTELLIGENCE ROUTES
// (Consolidation of unique features into 5 areas)
// ============================================================

// --- Campus Intelligence ---
apiRouter.get('/intelligence/knowledge-graph', (_req: Request, res: Response) => {
  try {
    const graphData = KnowledgeGraphEngine.getInstance().getGraphData();
    res.json(graphData);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to generate knowledge graph' });
  }
});

apiRouter.get('/intelligence/unified-events', (_req: Request, res: Response) => {
  try {
    const events = UnifiedEventEngine.getInstance().getUnifiedEvents();
    res.json(events);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch unified events' });
  }
});

apiRouter.get('/intelligence/unified-events/:id', (req: Request, res: Response) => {
  try {
    const event = UnifiedEventEngine.getInstance().getUnifiedEventById(req.params.id);
    if (!event) {
      res.status(404).json({ error: 'Unified event not found' });
      return;
    }
    res.json(event);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch unified event detail' });
  }
});

apiRouter.get('/intelligence/search', (req: Request, res: Response) => {
  try {
    const q = typeof req.query.q === 'string' ? req.query.q.toLowerCase() : '';
    if (!q) {
      res.json({ emails: [], coursework: [], calendarEvents: [], actions: [], unifiedEvents: [], totalMatches: 0 });
      return;
    }

    const emails = sqlite.getEmails({ search: q, limit: 20 });
    const coursework = sqlite.getClassroomCoursework().filter(w =>
      w.title.toLowerCase().includes(q) || w.courseName.toLowerCase().includes(q)
    );
    const calendarEvents = sqlite.getCalendarEvents().filter(c =>
      c.title.toLowerCase().includes(q) ||
      (c.location && c.location.toLowerCase().includes(q)) ||
      (c.description && c.description.toLowerCase().includes(q))
    );
    const actions = sqlite.getActions().filter(a =>
      a.title.toLowerCase().includes(q) || a.sourceEmailSubject.toLowerCase().includes(q)
    );
    const unifiedEvents = UnifiedEventEngine.getInstance().getUnifiedEvents().filter(u =>
      u.title.toLowerCase().includes(q) ||
      (u.location && u.location.toLowerCase().includes(q))
    );
    const totalMatches = emails.length + coursework.length + calendarEvents.length + actions.length + unifiedEvents.length;

    res.json({ query: q, totalMatches, emails, coursework, calendarEvents, actions, unifiedEvents });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Search failed' });
  }
});

// --- Change & Conflict Radar ---
apiRouter.get('/intelligence/changes', (_req: Request, res: Response) => {
  try {
    const persisted = sqlite.getChanges(20);
    const dynamic = RelationshipEngine.getWhatChanged(sqlite.getEmails());
    const changes = persisted.length > 0 ? persisted : dynamic;
    res.json(changes);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch change radar' });
  }
});

apiRouter.get('/intelligence/conflicts', (_req: Request, res: Response) => {
  try {
    const conflicts = ConflictEngine.getInstance().detectConflicts();
    res.json(conflicts);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to detect conflicts' });
  }
});

apiRouter.get('/intelligence/truth-resolution/:id', (req: Request, res: Response) => {
  try {
    const truth = UnifiedEventEngine.getInstance().getTruthResolution(req.params.id);
    if (!truth) {
      res.status(404).json({ error: 'Event truth resolution not found' });
      return;
    }
    res.json(truth);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch truth resolution' });
  }
});

// --- Action & Planning ---
apiRouter.get('/intelligence/deadline-risk', (_req: Request, res: Response) => {
  try {
    const risks = RiskEngine.getInstance().calculateDeadlineRisks();
    res.json(risks);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to calculate deadline risks' });
  }
});

apiRouter.get('/intelligence/attention-budget', (_req: Request, res: Response) => {
  try {
    const budget = AttentionBudgetEngine.getInstance().getAttentionBudget();
    res.json(budget);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch attention budget' });
  }
});

apiRouter.get('/intelligence/calendar-planner', (req: Request, res: Response) => {
  try {
    const date = typeof req.query.date === 'string' ? req.query.date : new Date().toISOString().split('T')[0];
    const plan = CalendarPlannerEngine.getInstance().generatePlan(date);
    res.json(plan);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to generate calendar plan' });
  }
});

// --- Student Briefing ---
apiRouter.get('/intelligence/catch-up', (req: Request, res: Response) => {
  try {
    const tf = (req.query.timeframe as any) || 'since_yesterday';
    const report = CatchUpEngine.getInstance().getCatchUpSummary(tf);
    res.json(report);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to generate catch-up report' });
  }
});

apiRouter.get('/intelligence/opportunities', (_req: Request, res: Response) => {
  try {
    const opportunities = OpportunityEngine.getInstance().getOpportunities();
    res.json(opportunities);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch opportunities' });
  }
});

apiRouter.get('/intelligence/digests', (_req: Request, res: Response) => {
  try {
    const digests = DigestEngine.getInstance().getNotificationDigests();
    res.json(digests);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch digests' });
  }
});

// --- Trust & Privacy ---
apiRouter.get('/intelligence/communication-health', (_req: Request, res: Response) => {
  try {
    const metrics = HealthEngine.getInstance().calculateHealthMetrics();
    res.json(metrics);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to compute communication health' });
  }
});

apiRouter.get('/intelligence/explain/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const email = sqlite.getEmailById(id);
    const action = sqlite.getActions().find(a => a.id === id || a.emailId === id);
    const unified = UnifiedEventEngine.getInstance().getUnifiedEventById(id);

    const reasons: string[] = [];
    const sources: any[] = [];

    if (email) {
      if (email.priorityReason) reasons.push(email.priorityReason);
      if (email.categoryReason) reasons.push(email.categoryReason);
      if (email.actionRequired) reasons.push(`Requires explicit action: "${email.actionText}"`);
      if (email.actionDeadline) reasons.push(`Hard deadline identified: ${email.actionDeadline}`);
      sources.push({
        source: 'Gmail', title: email.subject,
        snippet: email.summary || email.body.slice(0, 100), timestamp: email.timestamp
      });
    }

    if (action) {
      reasons.push(`Action priority is ${action.priority} due to target deadline: ${action.deadline || 'Immediate'}`);
    }

    if (unified) {
      reasons.push(...unified.whyItMatters);
      unified.sources.forEach(s => {
        sources.push({ source: s.type.toUpperCase(), title: s.title, snippet: s.snippet || '', timestamp: s.timestamp });
      });
    }

    if (reasons.length === 0) {
      reasons.push('Classified according to student department priority and urgency heuristics.');
    }

    res.json({
      itemId: id,
      itemTitle: email?.subject || action?.title || unified?.title || 'Decision Explanation',
      decisionType: 'PRIORITY',
      outcome: email?.priority || action?.priority || 'MEDIUM',
      reasons,
      evidenceSources: sources
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to generate explanation' });
  }
});

apiRouter.get('/intelligence/why-it-matters/:id', (req: Request, res: Response) => {
  try {
    const reasons = UnifiedEventEngine.getInstance().getWhyThisMatters(req.params.id);
    res.json({ id: req.params.id, whyItMatters: reasons });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch importance reasoning' });
  }
});

// ============================================================
// BACKWARD-COMPATIBLE ROUTES (kept for existing frontend)
// ============================================================

// Legacy unique-features routes redirect to intelligence routes
apiRouter.get('/unique-features/knowledge-graph', (_req, res) => {
  try { res.json(KnowledgeGraphEngine.getInstance().getGraphData()); }
  catch (err: any) { res.status(500).json({ error: err.message }); }
});
apiRouter.get('/unique-features/changes', (_req, res) => {
  try { res.json(RelationshipEngine.getWhatChanged(sqlite.getEmails())); }
  catch (err: any) { res.status(500).json({ error: err.message }); }
});
apiRouter.get('/unique-features/conflicts', (_req, res) => {
  try { res.json(ConflictEngine.getInstance().detectConflicts()); }
  catch (err: any) { res.status(500).json({ error: err.message }); }
});
apiRouter.get('/unique-features/unified-events', (_req, res) => {
  try { res.json(UnifiedEventEngine.getInstance().getUnifiedEvents()); }
  catch (err: any) { res.status(500).json({ error: err.message }); }
});
apiRouter.get('/unique-features/unified-events/:id', (req, res) => {
  try {
    const event = UnifiedEventEngine.getInstance().getUnifiedEventById(req.params.id);
    event ? res.json(event) : res.status(404).json({ error: 'Not found' });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});
apiRouter.get('/unique-features/deadline-risk', (_req, res) => {
  try { res.json(RiskEngine.getInstance().calculateDeadlineRisks()); }
  catch (err: any) { res.status(500).json({ error: err.message }); }
});
apiRouter.get('/unique-features/attention-budget', (_req, res) => {
  try { res.json(AttentionBudgetEngine.getInstance().getAttentionBudget()); }
  catch (err: any) { res.status(500).json({ error: err.message }); }
});
apiRouter.get('/unique-features/calendar-planner', (req, res) => {
  try { res.json(CalendarPlannerEngine.getInstance().generatePlan(req.query.date as string || new Date().toISOString().split('T')[0])); }
  catch (err: any) { res.status(500).json({ error: err.message }); }
});
apiRouter.get('/unique-features/catch-up', (req, res) => {
  try { res.json(CatchUpEngine.getInstance().getCatchUpSummary((req.query.timeframe as any) || 'since_yesterday')); }
  catch (err: any) { res.status(500).json({ error: err.message }); }
});
apiRouter.get('/unique-features/opportunities', (_req, res) => {
  try { res.json(OpportunityEngine.getInstance().getOpportunities()); }
  catch (err: any) { res.status(500).json({ error: err.message }); }
});
apiRouter.get('/unique-features/communication-health', (_req, res) => {
  try { res.json(HealthEngine.getInstance().calculateHealthMetrics()); }
  catch (err: any) { res.status(500).json({ error: err.message }); }
});
apiRouter.get('/unique-features/truth-resolution/:id', (req, res) => {
  try {
    const truth = UnifiedEventEngine.getInstance().getTruthResolution(req.params.id);
    truth ? res.json(truth) : res.status(404).json({ error: 'Not found' });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});
apiRouter.get('/unique-features/why-it-matters/:id', (req, res) => {
  try { res.json({ id: req.params.id, whyItMatters: UnifiedEventEngine.getInstance().getWhyThisMatters(req.params.id) }); }
  catch (err: any) { res.status(500).json({ error: err.message }); }
});
apiRouter.get('/unique-features/digests', (_req, res) => {
  try { res.json(DigestEngine.getInstance().getNotificationDigests()); }
  catch (err: any) { res.status(500).json({ error: err.message }); }
});
apiRouter.get('/unique-features/search', (req, res) => {
  // Redirect to intelligence search
  req.url = '/intelligence/search' + (req.url.includes('?') ? req.url.slice(req.url.indexOf('?')) : '');
  (apiRouter as any).handle(req, res, () => {});
});
apiRouter.get('/unique-features/explain/:id', (req, res) => {
  req.url = `/intelligence/explain/${req.params.id}`;
  (apiRouter as any).handle(req, res, () => {});
});
apiRouter.get('/unique-features/consequence/:actionId', (req: Request, res: Response) => {
  try {
    const analysis = UnifiedEventEngine.getInstance().getConsequence(req.params.actionId);
    res.json(analysis);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to evaluate consequences' });
  }
});

// Legacy Gmail routes
apiRouter.get('/gmail/auth-url', (_req: Request, res: Response) => {
  const { GoogleOAuthService } = require('../services/google/GoogleOAuthService');
  res.json({ authUrl: GoogleOAuthService.getInstance().getAuthUrl() });
});

apiRouter.get('/gmail/status', (_req: Request, res: Response) => {
  const { GoogleOAuthService } = require('../services/google/GoogleOAuthService');
  const status = GoogleOAuthService.getInstance().getStatus();
  res.json({ isConnected: status.connected, userEmail: status.userEmail });
});

apiRouter.post('/gmail/disconnect', (_req: Request, res: Response) => {
  const { GoogleOAuthService } = require('../services/google/GoogleOAuthService');
  GoogleOAuthService.getInstance().disconnect();
  res.json({ message: 'Gmail disconnected.', isConnected: false });
});

apiRouter.post('/gmail/sync', async (_req: Request, res: Response) => {
  try {
    const result = await SyncManager.getInstance().syncAll();
    res.json({ message: `Synchronized ${result.gmailImported} university emails`, count: result.gmailImported, syncResult: result });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Gmail sync failed' });
  }
});
