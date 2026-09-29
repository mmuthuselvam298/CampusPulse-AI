import { Router, Request, Response } from 'express';
import { DatabaseService } from '../db/DatabaseService';
import { AIService } from '../services/ai/AIService';
import { GmailService } from '../services/gmail/GmailService';
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
import { ChaosSimulatorEngine } from '../services/intelligence/ChaosSimulatorEngine';

export const apiRouter = Router();
const db = DatabaseService.getInstance();
const ai = AIService.getInstance();

// 1. DASHBOARD
apiRouter.get('/dashboard', async (_req: Request, res: Response) => {
  try {
    const data = await db.getDashboardData();
    res.json(data);
  } catch (err: any) {
    console.error('Error fetching dashboard data:', err);
    res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
});

// 2. EMAILS LIST & SEARCH
apiRouter.get('/emails', (req: Request, res: Response) => {
  try {
    let emails = db.getEmails();
    const { priority, category, search, unread, source, sortBy } = req.query;

    if (priority && typeof priority === 'string' && priority !== 'ALL') {
      emails = emails.filter(e => e.priority.toUpperCase() === priority.toUpperCase());
    }

    if (category && typeof category === 'string' && category !== 'ALL') {
      emails = emails.filter(e => e.category.toUpperCase() === category.toUpperCase());
    }

    if (unread === 'true') {
      emails = emails.filter(e => !e.isRead);
    }

    if (source && typeof source === 'string') {
      emails = emails.filter(e => e.source === source);
    }

    if (search && typeof search === 'string') {
      const q = search.toLowerCase();
      emails = emails.filter(e => 
        e.subject.toLowerCase().includes(q) ||
        e.body.toLowerCase().includes(q) ||
        e.sender.toLowerCase().includes(q) ||
        e.senderName.toLowerCase().includes(q) ||
        e.category.toLowerCase().includes(q) ||
        (e.location && e.location.toLowerCase().includes(q)) ||
        (e.actionText && e.actionText.toLowerCase().includes(q)) ||
        e.tags.some(t => t.toLowerCase().includes(q))
      );
    }

    // Sort options
    if (sortBy === 'deadline') {
      emails.sort((a, b) => {
        if (!a.deadlineDate) return 1;
        if (!b.deadlineDate) return -1;
        return new Date(a.deadlineDate).getTime() - new Date(b.deadlineDate).getTime();
      });
    } else if (sortBy === 'priority') {
      emails.sort((a, b) => b.priorityScore - a.priorityScore);
    } else {
      // Default: recency
      emails.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    }

    res.json({
      total: emails.length,
      emails
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch emails' });
  }
});

// 3. EMAIL DETAIL
apiRouter.get('/emails/:id', (req: Request, res: Response) => {
  const email = db.getEmailById(req.params.id);
  if (!email) {
    res.status(404).json({ error: 'Email not found' });
    return;
  }
  // Auto-mark read on detail open
  db.markEmailRead(email.id, true);
  res.json(email);
});

// 4. ON-DEMAND AI ANALYSIS
apiRouter.post('/emails/:id/analyze', async (req: Request, res: Response) => {
  try {
    const email = db.getEmailById(req.params.id);
    if (!email) {
      res.status(404).json({ error: 'Email not found' });
      return;
    }

    const analysis = await ai.analyzeEmail({
      subject: email.subject,
      body: email.body,
      sender: email.sender
    });

    // Update email with new analysis
    email.category = analysis.category;
    email.priority = analysis.priority;
    email.priorityScore = analysis.priorityScore;
    email.priorityReason = analysis.reason;
    email.categoryReason = analysis.categoryReason;
    email.summary = analysis.summary;
    if (analysis.action) email.actionText = analysis.action;
    if (analysis.deadline) email.actionDeadline = analysis.deadline;
    if (analysis.location) email.location = analysis.location;

    res.json({ email, analysis });
  } catch (err) {
    res.status(500).json({ error: 'AI analysis failed' });
  }
});

// 5. MARK READ / UNREAD
apiRouter.post('/emails/:id/read', (req: Request, res: Response) => {
  const { isRead = true } = req.body;
  const success = db.markEmailRead(req.params.id, isRead);
  if (!success) {
    res.status(404).json({ error: 'Email not found' });
    return;
  }
  res.json({ success: true, emailId: req.params.id, isRead });
});

// 6. ACTIONS (TASKS)
apiRouter.get('/actions', (_req: Request, res: Response) => {
  const actions = db.getActions();
  res.json({ actions, total: actions.length });
});

apiRouter.post('/actions/:id/toggle', (req: Request, res: Response) => {
  const action = db.toggleAction(req.params.id);
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
  const newAction = db.addAction({
    emailId: 'custom',
    title,
    category: category || 'GENERAL',
    priority: priority || 'MEDIUM',
    deadline: deadline || 'Today',
    completed: false,
    sourceEmailSubject: sourceEmailSubject || 'Manual Task',
    sourceSender: 'Student Muthu',
    location
  });
  res.status(201).json(newAction);
});

// 7. DAILY BRIEFING
apiRouter.get('/briefing', async (_req: Request, res: Response) => {
  try {
    const emails = db.getEmails();
    const student = db.getStudentProfile();
    const briefing = await ai.generateBriefing(emails, student.name);
    res.json(briefing);
  } catch (err) {
    res.status(500).json({ error: 'Failed to generate campus briefing' });
  }
});

// 8. CAMPUS ASSISTANT
apiRouter.post('/assistant', async (req: Request, res: Response) => {
  try {
    const { query } = req.body;
    if (!query) {
      res.status(400).json({ error: 'Query is required' });
      return;
    }

    const emails = db.getEmails();
    const actions = db.getActions();
    const response = await ai.answerCampusQuery(query, emails, actions);
    res.json(response);
  } catch (err) {
    res.status(500).json({ error: 'Assistant query failed' });
  }
});

// 9. EMAIL RELATIONSHIPS & "WHAT CHANGED?"
apiRouter.get('/relationships', (_req: Request, res: Response) => {
  const emails = db.getEmails();
  const clusters = RelationshipEngine.clusterByTopic(emails);
  const whatChanged = RelationshipEngine.getWhatChanged(emails);
  res.json({ clusters, whatChanged });
});

// 10. DEMO CONTROLS
apiRouter.post('/demo/simulate-email', (req: Request, res: Response) => {
  const { scenario } = req.body;
  const simulated = db.simulateNewEmail(scenario);
  res.json({
    message: 'New simulated email arrived and analyzed successfully!',
    email: simulated
  });
});

apiRouter.post('/demo/reset', (_req: Request, res: Response) => {
  db.loadInitialDataset();
  ai.clearCache();
  res.json({ message: 'Demo dataset reset to pristine initial state' });
});

apiRouter.get('/demo/status', (_req: Request, res: Response) => {
  res.json({
    mode: db.getMode(),
    activeAIProvider: ai.getActiveProviderName(),
    totalEmails: db.getEmails().length,
    allowedDomains: UniversityFilter.getAllowedDomains()
  });
});

// 11. ONE GOOGLE OAUTH & STATUS
apiRouter.get('/google/oauth/start', (_req: Request, res: Response) => {
  const { GoogleOAuthService } = require('../services/google/GoogleOAuthService');
  const url = GoogleOAuthService.getInstance().getAuthUrl();
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
    const success = await GoogleOAuthService.getInstance().handleCallback(code);

    if (success) {
      db.setMode('gmail');
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
  res.json(GoogleOAuthService.getInstance().getStatus());
});

apiRouter.post('/google/disconnect', (_req: Request, res: Response) => {
  const { GoogleOAuthService } = require('../services/google/GoogleOAuthService');
  GoogleOAuthService.getInstance().disconnect();
  db.setMode('demo');
  res.json({ message: 'Disconnected Google account. Reverted to Demo Mode.', isConnected: false });
});

// UNIFIED GOOGLE SYNC (Gmail + Classroom + Calendar)
apiRouter.post('/google/sync', async (_req: Request, res: Response) => {
  try {
    const { SyncService } = require('../services/google/SyncService');
    const result = await SyncService.getInstance().syncAll();
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Google sync failed' });
  }
});

// 12. CLASSROOM API
apiRouter.get('/classroom/courses', (_req: Request, res: Response) => {
  res.json(db.getClassroomCourses());
});

apiRouter.get('/classroom/coursework', (req: Request, res: Response) => {
  const { courseId } = req.query;
  let work = db.getClassroomCoursework();
  if (courseId && typeof courseId === 'string') {
    work = work.filter(w => w.courseId === courseId);
  }
  res.json(work);
});

apiRouter.get('/classroom/announcements', (req: Request, res: Response) => {
  const { courseId } = req.query;
  let ann = db.getClassroomAnnouncements();
  if (courseId && typeof courseId === 'string') {
    ann = ann.filter(a => a.courseId === courseId);
  }
  res.json(ann);
});

// 13. CALENDAR API & CONFLICT DETECTION
apiRouter.get('/calendar/events', (_req: Request, res: Response) => {
  res.json(db.getCalendarEvents());
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

    const created = await calendarService.createEvent({
      title,
      startTime,
      endTime,
      description,
      location,
      sourceId
    });

    // Mark email as added to calendar if source was an email
    if (sourceId) {
      const email = db.getEmailById(sourceId);
      if (email) {
        email.isCalendarAdded = true;
        email.calendarEventId = created.event.id;
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

// BACKWARD-COMPATIBLE GMAIL ROUTES
apiRouter.get('/gmail/auth-url', (_req: Request, res: Response) => {
  const { GoogleOAuthService } = require('../services/google/GoogleOAuthService');
  res.json({ authUrl: GoogleOAuthService.getInstance().getAuthUrl() });
});

apiRouter.get('/gmail/status', (_req: Request, res: Response) => {
  const { GoogleOAuthService } = require('../services/google/GoogleOAuthService');
  const status = GoogleOAuthService.getInstance().getStatus();
  res.json({
    isConnected: status.connected,
    userEmail: status.userEmail,
    scope: 'https://www.googleapis.com/auth/gmail.readonly'
  });
});

apiRouter.post('/gmail/disconnect', (_req: Request, res: Response) => {
  const { GoogleOAuthService } = require('../services/google/GoogleOAuthService');
  GoogleOAuthService.getInstance().disconnect();
  db.setMode('demo');
  res.json({ message: 'Gmail disconnected. Reverted to Demo Mode.', isConnected: false });
});

apiRouter.post('/gmail/sync', async (_req: Request, res: Response) => {
  try {
    const { SyncService } = require('../services/google/SyncService');
    const result = await SyncService.getInstance().syncAll();
    res.json({
      message: `Successfully synchronized ${result.gmailImported} university emails via Gmail read-only API`,
      count: result.gmailImported,
      syncResult: result
    });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Gmail sync failed' });
  }
});

// AI HEALTH / STATUS
apiRouter.get('/ai/status', async (_req: Request, res: Response) => {
  try {
    const health = await ai.checkHealth();
    res.json(health);
  } catch (err: any) {
    res.status(500).json({ aiProvider: 'gemini', status: 'error', error: err.message });
  }
});

// 14. SETTINGS
apiRouter.get('/settings', (_req: Request, res: Response) => {
  const { GoogleOAuthService } = require('../services/google/GoogleOAuthService');
  res.json({
    student: db.getStudentProfile(),
    mode: db.getMode(),
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
  const { student, mode } = req.body;
  if (student) db.updateStudentProfile(student);
  if (mode === 'demo' || mode === 'gmail') db.setMode(mode);
  res.json({ message: 'Settings updated successfully' });
});

// ============================================================
// UNIQUE FEATURES API ROUTES
// ============================================================

// 1. Feature 1: Campus Knowledge Graph
apiRouter.get('/unique-features/knowledge-graph', (_req: Request, res: Response) => {
  try {
    const graphData = KnowledgeGraphEngine.getInstance().getGraphData();
    res.json(graphData);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to generate knowledge graph' });
  }
});

// 2. Feature 2: What Changed Radar
apiRouter.get('/unique-features/changes', (_req: Request, res: Response) => {
  try {
    const changes = RelationshipEngine.getWhatChanged(db.getEmails());
    res.json(changes);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch change radar' });
  }
});

// 3. Feature 3: Cross-System Information Conflict Detector
apiRouter.get('/unique-features/conflicts', (_req: Request, res: Response) => {
  try {
    const conflicts = ConflictEngine.getInstance().detectConflicts();
    res.json(conflicts);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to detect conflicts' });
  }
});

// 4. Feature 4: Information Truth / Resolution View
apiRouter.get('/unique-features/truth-resolution/:id', (req: Request, res: Response) => {
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

// 5. Feature 5: "Why This Matters to Me?"
apiRouter.get('/unique-features/why-it-matters/:id', (req: Request, res: Response) => {
  try {
    const reasons = UnifiedEventEngine.getInstance().getWhyThisMatters(req.params.id);
    res.json({ id: req.params.id, whyItMatters: reasons });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch importance reasoning' });
  }
});

// 6. Feature 6: Deadline Risk Detector
apiRouter.get('/unique-features/deadline-risk', (_req: Request, res: Response) => {
  try {
    const risks = RiskEngine.getInstance().calculateDeadlineRisks();
    res.json(risks);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to calculate deadline risks' });
  }
});

// 7. Feature 7: AI Calendar Planner
apiRouter.get('/unique-features/calendar-planner', (req: Request, res: Response) => {
  try {
    const date = typeof req.query.date === 'string' ? req.query.date : '2026-09-30';
    const plan = CalendarPlannerEngine.getInstance().generatePlan(date);
    res.json(plan);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to generate calendar plan' });
  }
});

// 8 & 20. Feature 8 & 20: Information Hub & Unified Events
apiRouter.get('/unique-features/unified-events', (_req: Request, res: Response) => {
  try {
    const events = UnifiedEventEngine.getInstance().getUnifiedEvents();
    res.json(events);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch unified events' });
  }
});

apiRouter.get('/unique-features/unified-events/:id', (req: Request, res: Response) => {
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

// 9. Feature 9: "What Did I Miss?" / Catch-Up
apiRouter.get('/unique-features/catch-up', (req: Request, res: Response) => {
  try {
    const tf = (req.query.timeframe as any) || 'since_yesterday';
    const report = CatchUpEngine.getInstance().getCatchUpSummary(tf);
    res.json(report);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to generate catch-up report' });
  }
});

// 10. Feature 10: Campus Communication Health
apiRouter.get('/unique-features/communication-health', (_req: Request, res: Response) => {
  try {
    const metrics = HealthEngine.getInstance().calculateHealthMetrics();
    res.json(metrics);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to compute communication health' });
  }
});

// 11. Feature 11: Opportunity Matcher
apiRouter.get('/unique-features/opportunities', (_req: Request, res: Response) => {
  try {
    const opportunities = OpportunityEngine.getInstance().getOpportunities();
    res.json(opportunities);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch opportunities' });
  }
});

// 12. Feature 12: Attention Budget
apiRouter.get('/unique-features/attention-budget', (_req: Request, res: Response) => {
  try {
    const budget = AttentionBudgetEngine.getInstance().getAttentionBudget();
    res.json(budget);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch attention budget' });
  }
});

// 13. Feature 13: Explain AI Decision
apiRouter.get('/unique-features/explain/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const email = db.getEmailById(id);
    const action = db.getActions().find(a => a.id === id || a.emailId === id);
    const unified = UnifiedEventEngine.getInstance().getUnifiedEventById(id);

    const reasons: string[] = [];
    const sources: any[] = [];

    if (email) {
      if (email.priorityReason) reasons.push(email.priorityReason);
      if (email.categoryReason) reasons.push(email.categoryReason);
      if (email.actionRequired) reasons.push(`Requires explicit action: "${email.actionText}"`);
      if (email.actionDeadline) reasons.push(`Hard deadline identified: ${email.actionDeadline}`);
      sources.push({
        source: 'Gmail',
        title: email.subject,
        snippet: email.summary || email.body.slice(0, 100),
        timestamp: email.timestamp
      });
    }

    if (action) {
      reasons.push(`Action priority is ${action.priority} due to target deadline: ${action.deadline || 'Immediate'}`);
    }

    if (unified) {
      reasons.push(...unified.whyItMatters);
      unified.sources.forEach(s => {
        sources.push({
          source: s.type.toUpperCase(),
          title: s.title,
          snippet: s.snippet || '',
          timestamp: s.timestamp
        });
      });
    }

    if (reasons.length === 0) {
      reasons.push('Classified according to student department priority and urgency heuristics.');
    }

    res.json({
      itemId: id,
      itemTitle: email?.subject || action?.title || unified?.title || 'Decision Explanation',
      decisionType: 'PRIORITY',
      outcome: email?.priority || action?.priority || 'CRITICAL',
      reasons,
      evidenceSources: sources
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to generate explanation' });
  }
});

// 14. Feature 14: Campus Chaos Simulator
apiRouter.post('/unique-features/chaos-simulate', (req: Request, res: Response) => {
  try {
    const { simulationType } = req.body;
    if (!simulationType) {
      res.status(400).json({ error: 'simulationType is required' });
      return;
    }
    const result = ChaosSimulatorEngine.getInstance().simulateChaos(simulationType);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Simulation failed' });
  }
});

// 16. Feature 16: "What Happens If I Ignore This?"
apiRouter.get('/unique-features/consequence/:actionId', (req: Request, res: Response) => {
  try {
    const analysis = UnifiedEventEngine.getInstance().getConsequence(req.params.actionId);
    res.json(analysis);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to evaluate consequences' });
  }
});

// 21. Feature 21: Campus Intelligence Global Search
apiRouter.get('/unique-features/search', (req: Request, res: Response) => {
  try {
    const q = typeof req.query.q === 'string' ? req.query.q.toLowerCase() : '';
    if (!q) {
      res.json({ emails: [], coursework: [], calendarEvents: [], actions: [], unifiedEvents: [], totalMatches: 0 });
      return;
    }

    const emails = db.getEmails().filter(e =>
      e.subject.toLowerCase().includes(q) ||
      e.body.toLowerCase().includes(q) ||
      e.senderName.toLowerCase().includes(q) ||
      (e.location && e.location.toLowerCase().includes(q)) ||
      (e.actionText && e.actionText.toLowerCase().includes(q))
    );

    const coursework = db.getClassroomCoursework().filter(w =>
      w.title.toLowerCase().includes(q) ||
      w.courseName.toLowerCase().includes(q)
    );

    const calendarEvents = db.getCalendarEvents().filter(c =>
      c.title.toLowerCase().includes(q) ||
      (c.location && c.location.toLowerCase().includes(q)) ||
      (c.description && c.description.toLowerCase().includes(q))
    );

    const actions = db.getActions().filter(a =>
      a.title.toLowerCase().includes(q) ||
      a.sourceEmailSubject.toLowerCase().includes(q) ||
      (a.location && a.location.toLowerCase().includes(q))
    );

    const unifiedEvents = UnifiedEventEngine.getInstance().getUnifiedEvents().filter(u =>
      u.title.toLowerCase().includes(q) ||
      (u.location && u.location.toLowerCase().includes(q)) ||
      u.category.toLowerCase().includes(q)
    );

    const totalMatches = emails.length + coursework.length + calendarEvents.length + actions.length + unifiedEvents.length;

    res.json({
      query: q,
      totalMatches,
      emails,
      coursework,
      calendarEvents,
      actions,
      unifiedEvents
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Search failed' });
  }
});

// 24. Feature 24: Smart Notification Digest
apiRouter.get('/unique-features/digests', (_req: Request, res: Response) => {
  try {
    const digests = DigestEngine.getInstance().getNotificationDigests();
    res.json(digests);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch digests' });
  }
});


