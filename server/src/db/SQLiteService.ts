import Database from 'better-sqlite3';
import path from 'path';
import crypto from 'crypto';
import {
  EmailData, ActionItem, Category, Priority,
  ClassroomCourse, ClassroomCoursework, ClassroomAnnouncement,
  GoogleCalendarEvent, ScheduleChangeItem, InformationConflict
} from '../types';

import fs from 'fs';

const DB_PATH = process.env.VERCEL
  ? path.join('/tmp', 'campuspulse.sqlite')
  : (process.env.SQLITE_DB_PATH || path.resolve(__dirname, '../../../data/campuspulse.sqlite'));

// Ensure target directory exists
try {
  fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
} catch {
  // Directory already exists or handled by OS
}

export class SQLiteService {
  private static instance: SQLiteService;
  private db: Database.Database;

  private constructor() {
    this.db = new Database(DB_PATH, { timeout: 10000 });
    this.db.pragma('journal_mode = WAL');
    this.db.pragma('foreign_keys = ON');
    this.initializeSchema();
    this.seedDefaultDataIfEmpty();
  }

  public static getInstance(): SQLiteService {
    if (!SQLiteService.instance) {
      SQLiteService.instance = new SQLiteService();
    }
    return SQLiteService.instance;
  }

  public getDatabase(): Database.Database {
    return this.db;
  }

  private initializeSchema(): void {
    this.db.exec(`
      -- Users table
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
        google_subject_id TEXT UNIQUE,
        email TEXT UNIQUE,
        name TEXT,
        picture TEXT,
        university TEXT DEFAULT 'SRM University-AP',
        program TEXT,
        created_at TEXT DEFAULT (datetime('now')),
        updated_at TEXT DEFAULT (datetime('now'))
      );

      -- Google connections (tokens stored server-side only)
      CREATE TABLE IF NOT EXISTS google_connections (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        access_token TEXT,
        refresh_token TEXT,
        token_expiry TEXT,
        scopes TEXT,
        is_connected INTEGER DEFAULT 0,
        connected_at TEXT,
        updated_at TEXT DEFAULT (datetime('now')),
        UNIQUE(user_id)
      );

      -- Emails
      CREATE TABLE IF NOT EXISTS emails (
        id TEXT PRIMARY KEY,
        gmail_message_id TEXT UNIQUE,
        thread_id TEXT,
        sender TEXT NOT NULL,
        sender_name TEXT,
        recipient TEXT,
        cc TEXT,
        subject TEXT NOT NULL,
        body TEXT NOT NULL,
        body_html TEXT,
        snippet TEXT,
        timestamp TEXT NOT NULL,
        date_formatted TEXT,
        category TEXT DEFAULT 'GENERAL',
        priority TEXT DEFAULT 'MEDIUM',
        priority_score INTEGER DEFAULT 50,
        priority_reason TEXT,
        category_reason TEXT,
        summary TEXT,
        action_required INTEGER DEFAULT 0,
        action_text TEXT,
        action_deadline TEXT,
        deadline_date TEXT,
        event_date TEXT,
        location TEXT,
        affected_group TEXT,
        urgency TEXT DEFAULT 'MEDIUM',
        tags TEXT DEFAULT '[]',
        is_read INTEGER DEFAULT 0,
        is_action_completed INTEGER DEFAULT 0,
        source TEXT DEFAULT 'gmail',
        system_origin TEXT,
        labels TEXT DEFAULT '[]',
        related_classroom_course_id TEXT,
        related_classroom_work_id TEXT,
        related_calendar_event_id TEXT,
        is_calendar_added INTEGER DEFAULT 0,
        calendar_event_id TEXT,
        ai_analyzed INTEGER DEFAULT 0,
        ai_analyzed_at TEXT,
        created_at TEXT DEFAULT (datetime('now')),
        updated_at TEXT DEFAULT (datetime('now'))
      );

      -- Email threads
      CREATE TABLE IF NOT EXISTS email_threads (
        id TEXT PRIMARY KEY,
        subject TEXT,
        latest_message_id TEXT,
        message_count INTEGER DEFAULT 1,
        updated_at TEXT DEFAULT (datetime('now'))
      );

      -- Classroom courses
      CREATE TABLE IF NOT EXISTS classroom_courses (
        id TEXT PRIMARY KEY,
        google_course_id TEXT UNIQUE,
        name TEXT NOT NULL,
        section TEXT,
        description_heading TEXT,
        room TEXT,
        alternate_link TEXT,
        course_state TEXT DEFAULT 'ACTIVE',
        teacher_name TEXT,
        enrollment_code TEXT,
        created_at TEXT DEFAULT (datetime('now')),
        updated_at TEXT DEFAULT (datetime('now'))
      );

      -- Classroom coursework
      CREATE TABLE IF NOT EXISTS classroom_coursework (
        id TEXT PRIMARY KEY,
        google_coursework_id TEXT UNIQUE,
        course_id TEXT NOT NULL,
        course_name TEXT,
        title TEXT NOT NULL,
        description TEXT,
        state TEXT DEFAULT 'PUBLISHED',
        alternate_link TEXT,
        creation_time TEXT,
        update_time TEXT,
        due_date TEXT,
        due_time TEXT,
        due_date_time_iso TEXT,
        max_points REAL,
        work_type TEXT,
        submission_status TEXT DEFAULT 'ASSIGNED',
        priority TEXT DEFAULT 'MEDIUM',
        related_email_id TEXT,
        is_calendar_added INTEGER DEFAULT 0,
        ai_analyzed INTEGER DEFAULT 0,
        created_at TEXT DEFAULT (datetime('now')),
        updated_at TEXT DEFAULT (datetime('now'))
      );

      -- Classroom announcements
      CREATE TABLE IF NOT EXISTS classroom_announcements (
        id TEXT PRIMARY KEY,
        google_announcement_id TEXT UNIQUE,
        course_id TEXT NOT NULL,
        course_name TEXT,
        text TEXT NOT NULL,
        alternate_link TEXT,
        creation_time TEXT,
        update_time TEXT,
        creator_name TEXT,
        related_email_id TEXT,
        created_at TEXT DEFAULT (datetime('now'))
      );

      -- Classroom submissions
      CREATE TABLE IF NOT EXISTS classroom_submissions (
        id TEXT PRIMARY KEY,
        course_id TEXT NOT NULL,
        course_work_id TEXT NOT NULL,
        state TEXT DEFAULT 'NEW',
        late INTEGER DEFAULT 0,
        assigned_grade REAL,
        created_at TEXT DEFAULT (datetime('now')),
        updated_at TEXT DEFAULT (datetime('now')),
        UNIQUE(course_id, course_work_id)
      );

      -- Calendar events
      CREATE TABLE IF NOT EXISTS calendar_events (
        id TEXT PRIMARY KEY,
        google_event_id TEXT UNIQUE,
        title TEXT NOT NULL,
        description TEXT,
        location TEXT,
        start_time TEXT NOT NULL,
        end_time TEXT NOT NULL,
        is_all_day INTEGER DEFAULT 0,
        status TEXT,
        html_link TEXT,
        source TEXT DEFAULT 'google',
        source_type TEXT,
        source_id TEXT,
        is_created_by_app INTEGER DEFAULT 0,
        calendar_id TEXT DEFAULT 'primary',
        created_at TEXT DEFAULT (datetime('now')),
        updated_at TEXT DEFAULT (datetime('now'))
      );

      -- Actions
      CREATE TABLE IF NOT EXISTS actions (
        id TEXT PRIMARY KEY,
        email_id TEXT,
        coursework_id TEXT,
        title TEXT NOT NULL,
        category TEXT DEFAULT 'GENERAL',
        priority TEXT DEFAULT 'MEDIUM',
        deadline TEXT,
        deadline_date TEXT,
        completed INTEGER DEFAULT 0,
        completed_at TEXT,
        snoozed_until TEXT,
        source_email_subject TEXT,
        source_sender TEXT,
        location TEXT,
        related_calendar_event_id TEXT,
        is_calendar_eligible INTEGER DEFAULT 0,
        source_type TEXT DEFAULT 'email',
        created_at TEXT DEFAULT (datetime('now')),
        updated_at TEXT DEFAULT (datetime('now'))
      );

      -- Relationships
      CREATE TABLE IF NOT EXISTS relationships (
        id TEXT PRIMARY KEY,
        source_id TEXT NOT NULL,
        source_type TEXT NOT NULL,
        target_id TEXT NOT NULL,
        target_type TEXT NOT NULL,
        relationship_type TEXT NOT NULL,
        confidence REAL DEFAULT 0.5,
        created_at TEXT DEFAULT (datetime('now'))
      );

      -- Changes
      CREATE TABLE IF NOT EXISTS changes (
        id TEXT PRIMARY KEY,
        topic TEXT NOT NULL,
        previous_value TEXT,
        new_value TEXT,
        change_type TEXT NOT NULL,
        summary TEXT,
        email_id TEXT,
        source_id TEXT,
        source_type TEXT,
        what_changed TEXT,
        why_it_matters TEXT,
        what_you_need_to_do TEXT,
        detected_at TEXT DEFAULT (datetime('now'))
      );

      -- Conflicts
      CREATE TABLE IF NOT EXISTS conflicts (
        id TEXT PRIMARY KEY,
        event_id TEXT,
        event_title TEXT NOT NULL,
        field TEXT NOT NULL,
        source_a_name TEXT,
        source_a_value TEXT,
        source_a_record_id TEXT,
        source_a_timestamp TEXT,
        source_b_name TEXT,
        source_b_value TEXT,
        source_b_record_id TEXT,
        source_b_timestamp TEXT,
        severity TEXT DEFAULT 'MEDIUM',
        detected_at TEXT DEFAULT (datetime('now')),
        resolution TEXT,
        is_resolved INTEGER DEFAULT 0
      );

      -- Sync state
      CREATE TABLE IF NOT EXISTS sync_state (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT,
        service TEXT NOT NULL,
        last_sync TEXT,
        last_history_id TEXT,
        last_page_token TEXT,
        sync_status TEXT DEFAULT 'idle',
        sync_error TEXT,
        sync_duration_ms INTEGER,
        records_synced INTEGER DEFAULT 0,
        created_at TEXT DEFAULT (datetime('now')),
        updated_at TEXT DEFAULT (datetime('now')),
        UNIQUE(user_id, service)
      );

      -- AI insights
      CREATE TABLE IF NOT EXISTS ai_insights (
        id TEXT PRIMARY KEY,
        record_id TEXT NOT NULL,
        record_type TEXT NOT NULL,
        insight_type TEXT NOT NULL,
        content TEXT,
        metadata TEXT,
        created_at TEXT DEFAULT (datetime('now'))
      );

      -- Calendar mappings (source record -> calendar event)
      CREATE TABLE IF NOT EXISTS calendar_mappings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        source_id TEXT NOT NULL,
        source_type TEXT NOT NULL,
        calendar_event_id TEXT NOT NULL,
        created_at TEXT DEFAULT (datetime('now')),
        UNIQUE(source_id, source_type)
      );

      -- Indexes for performance
      CREATE INDEX IF NOT EXISTS idx_emails_timestamp ON emails(timestamp);
      CREATE INDEX IF NOT EXISTS idx_emails_gmail_message_id ON emails(gmail_message_id);
      CREATE INDEX IF NOT EXISTS idx_emails_thread_id ON emails(thread_id);
      CREATE INDEX IF NOT EXISTS idx_emails_priority ON emails(priority);
      CREATE INDEX IF NOT EXISTS idx_emails_is_read ON emails(is_read);
      CREATE INDEX IF NOT EXISTS idx_emails_category ON emails(category);
      CREATE INDEX IF NOT EXISTS idx_emails_source ON emails(source);

      CREATE INDEX IF NOT EXISTS idx_coursework_course_id ON classroom_coursework(course_id);
      CREATE INDEX IF NOT EXISTS idx_coursework_due_date ON classroom_coursework(due_date);

      CREATE INDEX IF NOT EXISTS idx_calendar_start_time ON calendar_events(start_time);
      CREATE INDEX IF NOT EXISTS idx_calendar_google_event_id ON calendar_events(google_event_id);

      CREATE INDEX IF NOT EXISTS idx_relationships_source ON relationships(source_id);
      CREATE INDEX IF NOT EXISTS idx_relationships_target ON relationships(target_id);

      CREATE INDEX IF NOT EXISTS idx_changes_detected_at ON changes(detected_at);

      CREATE INDEX IF NOT EXISTS idx_actions_completed ON actions(completed);
      CREATE INDEX IF NOT EXISTS idx_actions_priority ON actions(priority);

      CREATE INDEX IF NOT EXISTS idx_sync_state_service ON sync_state(service);
    `);
  }

  // ==================== USER METHODS ====================

  public getUser(userId?: string): any {
    if (userId) {
      return this.db.prepare('SELECT * FROM users WHERE id = ?').get(userId);
    }
    return this.db.prepare('SELECT * FROM users LIMIT 1').get();
  }

  public getUserByGoogleSubjectId(subjectId: string): any {
    return this.db.prepare('SELECT * FROM users WHERE google_subject_id = ?').get(subjectId);
  }

  public upsertUser(user: { googleSubjectId?: string; email: string; name: string; picture?: string; program?: string }): any {
    const existing = user.googleSubjectId ? this.getUserByGoogleSubjectId(user.googleSubjectId) : null;
    if (existing) {
      this.db.prepare(`
        UPDATE users SET email = ?, name = ?, picture = ?, program = ?, updated_at = datetime('now')
        WHERE google_subject_id = ?
      `).run(user.email, user.name, user.picture || null, user.program || null, user.googleSubjectId);
      return this.getUserByGoogleSubjectId(user.googleSubjectId!);
    }
    const id = crypto.randomBytes(16).toString('hex');
    this.db.prepare(`
      INSERT INTO users (id, google_subject_id, email, name, picture, program)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(id, user.googleSubjectId || null, user.email, user.name, user.picture || null, user.program || null);
    return this.db.prepare('SELECT * FROM users WHERE id = ?').get(id);
  }

  // ==================== GOOGLE CONNECTION ====================

  public getGoogleConnection(userId: string): any {
    return this.db.prepare('SELECT * FROM google_connections WHERE user_id = ?').get(userId);
  }

  public upsertGoogleConnection(userId: string, data: { accessToken?: string; refreshToken?: string; tokenExpiry?: string; scopes?: string; isConnected: boolean }): void {
    const existing = this.getGoogleConnection(userId);
    if (existing) {
      this.db.prepare(`
        UPDATE google_connections SET
          access_token = COALESCE(?, access_token),
          refresh_token = COALESCE(?, refresh_token),
          token_expiry = COALESCE(?, token_expiry),
          scopes = COALESCE(?, scopes),
          is_connected = ?,
          connected_at = CASE WHEN ? = 1 THEN datetime('now') ELSE connected_at END,
          updated_at = datetime('now')
        WHERE user_id = ?
      `).run(data.accessToken || null, data.refreshToken || null, data.tokenExpiry || null, data.scopes || null, data.isConnected ? 1 : 0, data.isConnected ? 1 : 0, userId);
    } else {
      this.db.prepare(`
        INSERT INTO google_connections (user_id, access_token, refresh_token, token_expiry, scopes, is_connected, connected_at)
        VALUES (?, ?, ?, ?, ?, ?, datetime('now'))
      `).run(userId, data.accessToken || null, data.refreshToken || null, data.tokenExpiry || null, data.scopes || null, data.isConnected ? 1 : 0);
    }
  }

  public disconnectGoogle(userId: string): void {
    this.db.prepare(`
      UPDATE google_connections SET is_connected = 0, access_token = NULL, refresh_token = NULL, updated_at = datetime('now')
      WHERE user_id = ?
    `).run(userId);
  }

  // ==================== EMAIL METHODS ====================

  public getEmails(options?: { priority?: string; category?: string; search?: string; unread?: boolean; source?: string; sortBy?: string; limit?: number; offset?: number }): EmailData[] {
    let query = 'SELECT * FROM emails WHERE 1=1';
    const params: any[] = [];

    if (options?.priority && options.priority !== 'ALL') {
      query += ' AND UPPER(priority) = UPPER(?)';
      params.push(options.priority);
    }
    if (options?.category && options.category !== 'ALL') {
      query += ' AND UPPER(category) = UPPER(?)';
      params.push(options.category);
    }
    if (options?.unread) {
      query += ' AND is_read = 0';
    }
    if (options?.source) {
      query += ' AND source = ?';
      params.push(options.source);
    }
    if (options?.search) {
      query += ' AND (subject LIKE ? OR body LIKE ? OR sender LIKE ? OR sender_name LIKE ? OR location LIKE ? OR action_text LIKE ?)';
      const q = `%${options.search}%`;
      params.push(q, q, q, q, q, q);
    }

    if (options?.sortBy === 'deadline') {
      query += ' ORDER BY CASE WHEN deadline_date IS NULL THEN 1 ELSE 0 END, deadline_date ASC';
    } else if (options?.sortBy === 'priority') {
      query += ' ORDER BY priority_score DESC';
    } else {
      query += ' ORDER BY timestamp DESC';
    }

    if (options?.limit) {
      query += ' LIMIT ?';
      params.push(options.limit);
      if (options.offset) {
        query += ' OFFSET ?';
        params.push(options.offset);
      }
    }

    const rows = this.db.prepare(query).all(...params) as any[];
    return rows.map(r => this.rowToEmail(r));
  }

  public getEmailById(id: string): EmailData | undefined {
    const row = this.db.prepare('SELECT * FROM emails WHERE id = ?').get(id) as any;
    return row ? this.rowToEmail(row) : undefined;
  }

  public getEmailByGmailMessageId(gmailMessageId: string): EmailData | undefined {
    const row = this.db.prepare('SELECT * FROM emails WHERE gmail_message_id = ?').get(gmailMessageId) as any;
    return row ? this.rowToEmail(row) : undefined;
  }

  public upsertEmail(email: EmailData & { gmailMessageId?: string; bodyHtml?: string; snippet?: string }): void {
    const existing = email.gmailMessageId ? this.getEmailByGmailMessageId(email.gmailMessageId) : this.getEmailById(email.id);
    if (existing) {
      this.db.prepare(`
        UPDATE emails SET
          subject = ?, body = ?, body_html = COALESCE(?, body_html), snippet = COALESCE(?, snippet),
          category = ?, priority = ?, priority_score = ?, priority_reason = ?, category_reason = ?,
          summary = ?, action_required = ?, action_text = ?, action_deadline = ?, deadline_date = ?,
          event_date = ?, location = ?, affected_group = ?, urgency = ?, tags = ?,
          ai_analyzed = ?, ai_analyzed_at = CASE WHEN ? = 1 THEN datetime('now') ELSE ai_analyzed_at END,
          updated_at = datetime('now')
        WHERE id = ?
      `).run(
        email.subject, email.body, email.bodyHtml || null, email.snippet || null,
        email.category, email.priority, email.priorityScore, email.priorityReason, email.categoryReason,
        email.summary, email.actionRequired ? 1 : 0, email.actionText || null, email.actionDeadline || null, email.deadlineDate || null,
        email.eventDate || null, email.location || null, email.affectedGroup || null, email.urgency, JSON.stringify(email.tags || []),
        email.aiAnalyzed ? 1 : 0, email.aiAnalyzed ? 1 : 0,
        existing.id
      );
      return;
    }

    this.db.prepare(`
      INSERT OR IGNORE INTO emails (
        id, gmail_message_id, thread_id, sender, sender_name, recipient, cc, subject, body, body_html, snippet,
        timestamp, date_formatted, category, priority, priority_score, priority_reason, category_reason,
        summary, action_required, action_text, action_deadline, deadline_date, event_date, location,
        affected_group, urgency, tags, is_read, source, system_origin,
        related_classroom_course_id, related_classroom_work_id, related_calendar_event_id,
        is_calendar_added, calendar_event_id, ai_analyzed
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      email.id, email.gmailMessageId || null, email.threadId || null,
      email.sender, email.senderName, email.recipient, email.cc ? JSON.stringify(email.cc) : null,
      email.subject, email.body, email.bodyHtml || null, email.snippet || null,
      email.timestamp, email.dateFormatted, email.category, email.priority, email.priorityScore,
      email.priorityReason, email.categoryReason, email.summary,
      email.actionRequired ? 1 : 0, email.actionText || null, email.actionDeadline || null, email.deadlineDate || null,
      email.eventDate || null, email.location || null, email.affectedGroup || null, email.urgency,
      JSON.stringify(email.tags || []), email.isRead ? 1 : 0, email.source, email.systemOrigin || null,
      email.relatedClassroomCourseId || null, email.relatedClassroomWorkId || null, email.relatedCalendarEventId || null,
      email.isCalendarAdded ? 1 : 0, email.calendarEventId || null, 0
    );
  }

  public markEmailRead(id: string, isRead: boolean = true): boolean {
    const result = this.db.prepare("UPDATE emails SET is_read = ?, updated_at = datetime('now') WHERE id = ?").run(isRead ? 1 : 0, id);
    return result.changes > 0;
  }

  public getEmailCount(): number {
    const row = this.db.prepare('SELECT COUNT(*) as count FROM emails').get() as any;
    return row?.count || 0;
  }

  public getUnreadEmailCount(): number {
    const row = this.db.prepare('SELECT COUNT(*) as count FROM emails WHERE is_read = 0').get() as any;
    return row?.count || 0;
  }

  private rowToEmail(row: any): EmailData {
    return {
      id: row.id,
      sender: row.sender,
      senderName: row.sender_name || row.sender,
      recipient: row.recipient || '',
      cc: row.cc ? JSON.parse(row.cc) : undefined,
      subject: row.subject,
      body: row.body,
      timestamp: row.timestamp,
      dateFormatted: row.date_formatted || '',
      category: (row.category || 'GENERAL') as Category,
      priority: (row.priority || 'MEDIUM') as Priority,
      priorityScore: row.priority_score || 50,
      priorityReason: row.priority_reason || '',
      categoryReason: row.category_reason || '',
      summary: row.summary || row.subject,
      actionRequired: Boolean(row.action_required),
      actionText: row.action_text || undefined,
      actionDeadline: row.action_deadline || undefined,
      deadlineDate: row.deadline_date || undefined,
      eventDate: row.event_date || undefined,
      location: row.location || undefined,
      affectedGroup: row.affected_group || undefined,
      urgency: (row.urgency || 'MEDIUM') as Priority,
      tags: row.tags ? JSON.parse(row.tags) : [],
      isRead: Boolean(row.is_read),
      isActionCompleted: Boolean(row.is_action_completed),
      source: (row.source || 'gmail') as 'demo' | 'gmail',
      threadId: row.thread_id || undefined,
      systemOrigin: row.system_origin || undefined,
      relatedClassroomCourseId: row.related_classroom_course_id || undefined,
      relatedClassroomWorkId: row.related_classroom_work_id || undefined,
      relatedCalendarEventId: row.related_calendar_event_id || undefined,
      isCalendarAdded: Boolean(row.is_calendar_added),
      calendarEventId: row.calendar_event_id || undefined,
      aiAnalyzed: Boolean(row.ai_analyzed),
    } as EmailData & { aiAnalyzed?: boolean };
  }

  // ==================== CLASSROOM METHODS ====================

  public getClassroomCourses(): ClassroomCourse[] {
    return this.db.prepare('SELECT * FROM classroom_courses ORDER BY name').all() as ClassroomCourse[] | any[];
  }

  public upsertClassroomCourse(course: ClassroomCourse): void {
    this.db.prepare(`
      INSERT INTO classroom_courses (id, google_course_id, name, section, description_heading, room, alternate_link, course_state, teacher_name, enrollment_code)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        name = excluded.name, section = excluded.section, description_heading = excluded.description_heading,
        room = excluded.room, alternate_link = excluded.alternate_link, course_state = excluded.course_state,
        teacher_name = excluded.teacher_name, updated_at = datetime('now')
    `).run(
      course.id, course.id, course.name, course.section || null, course.descriptionHeading || null,
      course.room || null, course.alternateLink || null, course.courseState || 'ACTIVE',
      course.teacherName || null, course.enrollmentCode || null
    );
  }

  public getClassroomCoursework(courseId?: string): ClassroomCoursework[] {
    let rows: any[];
    if (courseId) {
      rows = this.db.prepare('SELECT * FROM classroom_coursework WHERE course_id = ? ORDER BY due_date ASC').all(courseId);
    } else {
      rows = this.db.prepare('SELECT * FROM classroom_coursework ORDER BY due_date ASC').all();
    }
    return rows.map(r => ({
      id: r.id,
      courseId: r.course_id,
      courseName: r.course_name || '',
      title: r.title,
      description: r.description || undefined,
      state: r.state || 'PUBLISHED',
      alternateLink: r.alternate_link || undefined,
      creationTime: r.creation_time || undefined,
      updateTime: r.update_time || undefined,
      dueDate: r.due_date || undefined,
      dueTime: r.due_time || undefined,
      dueDateTimeISO: r.due_date_time_iso || undefined,
      maxPoints: r.max_points || undefined,
      workType: r.work_type || undefined,
      submissionStatus: r.submission_status || 'ASSIGNED',
      priority: (r.priority || 'MEDIUM') as Priority,
      relatedEmailId: r.related_email_id || undefined,
      isCalendarAdded: Boolean(r.is_calendar_added),
    }));
  }

  public upsertClassroomCoursework(work: ClassroomCoursework): void {
    this.db.prepare(`
      INSERT INTO classroom_coursework (id, google_coursework_id, course_id, course_name, title, description, state, alternate_link, creation_time, update_time, due_date, due_time, due_date_time_iso, max_points, work_type, submission_status, priority, related_email_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        title = excluded.title, description = excluded.description, state = excluded.state,
        alternate_link = excluded.alternate_link, update_time = excluded.update_time,
        due_date = excluded.due_date, due_time = excluded.due_time,
        submission_status = excluded.submission_status, priority = excluded.priority,
        updated_at = datetime('now')
    `).run(
      work.id, work.id, work.courseId, work.courseName, work.title, work.description || null,
      work.state || 'PUBLISHED', work.alternateLink || null, work.creationTime || null,
      work.updateTime || null, work.dueDate || null, work.dueTime || null,
      work.dueDateTimeISO || null, work.maxPoints || null, work.workType || null,
      work.submissionStatus || 'ASSIGNED', work.priority, work.relatedEmailId || null
    );
  }

  public getClassroomAnnouncements(courseId?: string): ClassroomAnnouncement[] {
    let rows: any[];
    if (courseId) {
      rows = this.db.prepare('SELECT * FROM classroom_announcements WHERE course_id = ? ORDER BY creation_time DESC').all(courseId);
    } else {
      rows = this.db.prepare('SELECT * FROM classroom_announcements ORDER BY creation_time DESC').all();
    }
    return rows.map(r => ({
      id: r.id,
      courseId: r.course_id,
      courseName: r.course_name || '',
      text: r.text,
      alternateLink: r.alternate_link || undefined,
      creationTime: r.creation_time || new Date().toISOString(),
      updateTime: r.update_time || undefined,
      creatorName: r.creator_name || undefined,
      relatedEmailId: r.related_email_id || undefined,
    }));
  }

  public upsertClassroomAnnouncement(ann: ClassroomAnnouncement): void {
    this.db.prepare(`
      INSERT INTO classroom_announcements (id, google_announcement_id, course_id, course_name, text, alternate_link, creation_time, update_time, creator_name, related_email_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        text = excluded.text, update_time = excluded.update_time, creator_name = excluded.creator_name
    `).run(
      ann.id, ann.id, ann.courseId, ann.courseName, ann.text,
      ann.alternateLink || null, ann.creationTime, ann.updateTime || null,
      ann.creatorName || null, ann.relatedEmailId || null
    );
  }

  // ==================== CALENDAR METHODS ====================

  public getCalendarEvents(options?: { timeMin?: string; timeMax?: string; limit?: number }): GoogleCalendarEvent[] {
    let query = 'SELECT * FROM calendar_events WHERE 1=1';
    const params: any[] = [];
    if (options?.timeMin) {
      query += ' AND end_time >= ?';
      params.push(options.timeMin);
    }
    if (options?.timeMax) {
      query += ' AND start_time <= ?';
      params.push(options.timeMax);
    }
    query += ' ORDER BY start_time ASC';
    if (options?.limit) {
      query += ' LIMIT ?';
      params.push(options.limit);
    }
    const rows = this.db.prepare(query).all(...params) as any[];
    return rows.map(r => this.rowToCalendarEvent(r));
  }

  public getCalendarEventByGoogleId(googleEventId: string): GoogleCalendarEvent | undefined {
    const row = this.db.prepare('SELECT * FROM calendar_events WHERE google_event_id = ?').get(googleEventId) as any;
    return row ? this.rowToCalendarEvent(row) : undefined;
  }

  public upsertCalendarEvent(event: GoogleCalendarEvent): void {
    this.db.prepare(`
      INSERT INTO calendar_events (id, google_event_id, title, description, location, start_time, end_time, is_all_day, status, html_link, source, source_type, source_id, is_created_by_app)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        title = excluded.title, description = excluded.description, location = excluded.location,
        start_time = excluded.start_time, end_time = excluded.end_time, status = excluded.status,
        html_link = excluded.html_link, updated_at = datetime('now')
    `).run(
      event.id, event.id, event.title, event.description || null, event.location || null,
      event.startTime, event.endTime, (event.isAllDay || event.allDay) ? 1 : 0,
      event.status || null, event.htmlLink || null, event.source || 'google',
      event.sourceType || null, event.sourceId || null, event.isCreatedByApp ? 1 : 0
    );
  }

  public getCalendarEventCount(): number {
    const row = this.db.prepare('SELECT COUNT(*) as count FROM calendar_events').get() as any;
    return row?.count || 0;
  }

  private rowToCalendarEvent(row: any): GoogleCalendarEvent {
    return {
      id: row.id,
      title: row.title,
      description: row.description || undefined,
      location: row.location || undefined,
      startTime: row.start_time,
      endTime: row.end_time,
      isAllDay: Boolean(row.is_all_day),
      status: row.status || undefined,
      htmlLink: row.html_link || undefined,
      source: row.source || 'google',
      sourceType: row.source_type || undefined,
      sourceId: row.source_id || undefined,
      isCreatedByApp: Boolean(row.is_created_by_app),
    };
  }

  // ==================== ACTIONS METHODS ====================

  public getActions(options?: { completed?: boolean }): ActionItem[] {
    let query = 'SELECT * FROM actions WHERE 1=1';
    const params: any[] = [];
    if (options?.completed !== undefined) {
      query += ' AND completed = ?';
      params.push(options.completed ? 1 : 0);
    }
    query += ` ORDER BY
      completed ASC,
      CASE priority WHEN 'CRITICAL' THEN 0 WHEN 'HIGH' THEN 1 WHEN 'MEDIUM' THEN 2 ELSE 3 END,
      CASE WHEN deadline_date IS NULL THEN 1 ELSE 0 END,
      deadline_date ASC`;

    const rows = this.db.prepare(query).all(...params) as any[];
    return rows.map(r => ({
      id: r.id,
      emailId: r.email_id || '',
      title: r.title,
      category: (r.category || 'GENERAL') as Category,
      priority: (r.priority || 'MEDIUM') as Priority,
      deadline: r.deadline || undefined,
      deadlineDate: r.deadline_date || undefined,
      completed: Boolean(r.completed),
      completedAt: r.completed_at || undefined,
      snoozedUntil: r.snoozed_until || undefined,
      sourceEmailSubject: r.source_email_subject || '',
      sourceSender: r.source_sender || '',
      location: r.location || undefined,
      relatedCalendarEventId: r.related_calendar_event_id || undefined,
      isCalendarEligible: Boolean(r.is_calendar_eligible),
    }));
  }

  public upsertAction(action: ActionItem): void {
    this.db.prepare(`
      INSERT INTO actions (id, email_id, title, category, priority, deadline, deadline_date, completed, completed_at, source_email_subject, source_sender, location, related_calendar_event_id, is_calendar_eligible)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        title = excluded.title, priority = excluded.priority, deadline = excluded.deadline,
        deadline_date = excluded.deadline_date, completed = excluded.completed,
        completed_at = excluded.completed_at, updated_at = datetime('now')
    `).run(
      action.id, action.emailId, action.title, action.category, action.priority,
      action.deadline || null, action.deadlineDate || null, action.completed ? 1 : 0,
      action.completedAt || null, action.sourceEmailSubject, action.sourceSender,
      action.location || null, action.relatedCalendarEventId || null, action.isCalendarEligible ? 1 : 0
    );
  }

  public toggleAction(actionId: string): ActionItem | undefined {
    const existing = this.db.prepare('SELECT * FROM actions WHERE id = ?').get(actionId) as any;
    if (!existing) return undefined;
    const newCompleted = !existing.completed;
    this.db.prepare(`
      UPDATE actions SET completed = ?, completed_at = ?, updated_at = datetime('now') WHERE id = ?
    `).run(newCompleted ? 1 : 0, newCompleted ? new Date().toISOString() : null, actionId);

    const updated = this.db.prepare('SELECT * FROM actions WHERE id = ?').get(actionId) as any;
    return updated ? {
      id: updated.id, emailId: updated.email_id || '', title: updated.title,
      category: updated.category as Category, priority: updated.priority as Priority,
      deadline: updated.deadline, deadlineDate: updated.deadline_date,
      completed: Boolean(updated.completed), completedAt: updated.completed_at,
      sourceEmailSubject: updated.source_email_subject || '', sourceSender: updated.source_sender || '',
      location: updated.location
    } : undefined;
  }

  public addAction(item: Omit<ActionItem, 'id'>): ActionItem {
    const id = `action-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;
    const action: ActionItem = { ...item, id };
    this.upsertAction(action);
    return action;
  }

  // ==================== SYNC STATE METHODS ====================

  public getSyncState(service: string, userId?: string): any {
    return this.db.prepare('SELECT * FROM sync_state WHERE service = ? AND (user_id = ? OR user_id IS NULL)').get(service, userId || null);
  }

  public updateSyncState(service: string, data: { lastSync?: string; lastHistoryId?: string; syncStatus?: string; syncError?: string; syncDurationMs?: number; recordsSynced?: number; userId?: string }): void {
    const existing = this.getSyncState(service, data.userId);
    if (existing) {
      this.db.prepare(`
        UPDATE sync_state SET
          last_sync = COALESCE(?, last_sync),
          last_history_id = COALESCE(?, last_history_id),
          sync_status = COALESCE(?, sync_status),
          sync_error = ?,
          sync_duration_ms = COALESCE(?, sync_duration_ms),
          records_synced = COALESCE(?, records_synced),
          updated_at = datetime('now')
        WHERE service = ? AND (user_id = ? OR user_id IS NULL)
      `).run(data.lastSync || null, data.lastHistoryId || null, data.syncStatus || null, data.syncError || null, data.syncDurationMs || null, data.recordsSynced || null, service, data.userId || null);
    } else {
      this.db.prepare(`
        INSERT INTO sync_state (user_id, service, last_sync, last_history_id, sync_status, sync_error, sync_duration_ms, records_synced)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).run(data.userId || null, service, data.lastSync || null, data.lastHistoryId || null, data.syncStatus || 'idle', data.syncError || null, data.syncDurationMs || null, data.recordsSynced || 0);
    }
  }

  public getAllSyncStates(): any[] {
    return this.db.prepare('SELECT * FROM sync_state ORDER BY service').all();
  }

  // ==================== CHANGES METHODS ====================

  public getChanges(limit?: number): ScheduleChangeItem[] {
    const query = limit ? 'SELECT * FROM changes ORDER BY detected_at DESC LIMIT ?' : 'SELECT * FROM changes ORDER BY detected_at DESC';
    const rows = limit ? this.db.prepare(query).all(limit) as any[] : this.db.prepare(query).all() as any[];
    return rows.map(r => ({
      topic: r.topic,
      previousValue: r.previous_value || '',
      newValue: r.new_value || '',
      changeType: r.change_type as any,
      summary: r.summary || '',
      emailId: r.email_id || '',
      whatChanged: r.what_changed || undefined,
      whyItMatters: r.why_it_matters || undefined,
      whatYouNeedToDo: r.what_you_need_to_do || undefined,
    }));
  }

  public insertChange(change: ScheduleChangeItem & { id?: string; sourceId?: string; sourceType?: string }): void {
    const id = change.id || `change-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;
    this.db.prepare(`
      INSERT OR IGNORE INTO changes (id, topic, previous_value, new_value, change_type, summary, email_id, source_id, source_type, what_changed, why_it_matters, what_you_need_to_do)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, change.topic, change.previousValue, change.newValue, change.changeType, change.summary, change.emailId, change.sourceId || null, change.sourceType || null, change.whatChanged || null, change.whyItMatters || null, change.whatYouNeedToDo || null);
  }

  // ==================== CONFLICTS METHODS ====================

  public getConflicts(): InformationConflict[] {
    const rows = this.db.prepare('SELECT * FROM conflicts ORDER BY detected_at DESC').all() as any[];
    return rows.map(r => ({
      id: r.id,
      eventId: r.event_id || '',
      eventTitle: r.event_title,
      field: r.field as any,
      sourceA: { sourceName: r.source_a_name as any, value: r.source_a_value || '', recordId: r.source_a_record_id || '', recordTitle: '', excerpt: '', timestamp: r.source_a_timestamp },
      sourceB: { sourceName: r.source_b_name as any, value: r.source_b_value || '', recordId: r.source_b_record_id || '', recordTitle: '', excerpt: '', timestamp: r.source_b_timestamp },
      severity: r.severity as any,
      detectedAt: r.detected_at,
      currentKnownState: '',
      hasAuthoritativeResolution: Boolean(r.is_resolved),
      resolutionExplanation: r.resolution || '',
      suggestedAction: '',
    }));
  }

  // ==================== RELATIONSHIPS METHODS ====================

  public getRelationships(sourceId?: string): any[] {
    if (sourceId) {
      return this.db.prepare('SELECT * FROM relationships WHERE source_id = ? OR target_id = ?').all(sourceId, sourceId);
    }
    return this.db.prepare('SELECT * FROM relationships').all();
  }

  public upsertRelationship(rel: { sourceId: string; sourceType: string; targetId: string; targetType: string; relationshipType: string; confidence?: number }): void {
    const id = `rel-${rel.sourceId}-${rel.targetId}-${rel.relationshipType}`;
    this.db.prepare(`
      INSERT INTO relationships (id, source_id, source_type, target_id, target_type, relationship_type, confidence)
      VALUES (?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET confidence = excluded.confidence
    `).run(id, rel.sourceId, rel.sourceType, rel.targetId, rel.targetType, rel.relationshipType, rel.confidence || 0.5);
  }

  // ==================== CALENDAR MAPPING METHODS ====================

  public getCalendarMapping(sourceId: string): string | null {
    const row = this.db.prepare('SELECT calendar_event_id FROM calendar_mappings WHERE source_id = ?').get(sourceId) as any;
    return row?.calendar_event_id || null;
  }

  public upsertCalendarMapping(sourceId: string, sourceType: string, calendarEventId: string): void {
    this.db.prepare(`
      INSERT INTO calendar_mappings (source_id, source_type, calendar_event_id)
      VALUES (?, ?, ?)
      ON CONFLICT(source_id, source_type) DO UPDATE SET calendar_event_id = excluded.calendar_event_id
    `).run(sourceId, sourceType, calendarEventId);
  }

  // ==================== STATISTICS ====================

  public getStats(): { emails: number; courses: number; coursework: number; announcements: number; calendarEvents: number; actions: number; changes: number; conflicts: number } {
    const emailCount = (this.db.prepare('SELECT COUNT(*) as c FROM emails').get() as any)?.c || 0;
    const courseCount = (this.db.prepare('SELECT COUNT(*) as c FROM classroom_courses').get() as any)?.c || 0;
    const courseworkCount = (this.db.prepare('SELECT COUNT(*) as c FROM classroom_coursework').get() as any)?.c || 0;
    const announcementCount = (this.db.prepare('SELECT COUNT(*) as c FROM classroom_announcements').get() as any)?.c || 0;
    const calEventCount = (this.db.prepare('SELECT COUNT(*) as c FROM calendar_events').get() as any)?.c || 0;
    const actionCount = (this.db.prepare('SELECT COUNT(*) as c FROM actions').get() as any)?.c || 0;
    const changeCount = (this.db.prepare('SELECT COUNT(*) as c FROM changes').get() as any)?.c || 0;
    const conflictCount = (this.db.prepare('SELECT COUNT(*) as c FROM conflicts').get() as any)?.c || 0;
    return { emails: emailCount, courses: courseCount, coursework: courseworkCount, announcements: announcementCount, calendarEvents: calEventCount, actions: actionCount, changes: changeCount, conflicts: conflictCount };
  }

  // ==================== DEFAULT SEEDING ====================

  public seedDefaultDataIfEmpty(): void {
    const fs = require('fs');

    // 1. Seed user if empty
    const userCount = (this.db.prepare('SELECT count(*) as c FROM users').get() as any)?.c || 0;
    if (userCount === 0) {
      this.db.prepare(`
        INSERT INTO users (id, email, name, university, program)
        VALUES ('default-student-1', 'muthuselvam.cse@srmap.edu.in', 'Muthu Selvam', 'SRM University-AP', 'B.Tech Computer Science and Engineering')
      `).run();
    }

    // 2. Seed emails if empty
    if (this.getEmailCount() === 0) {
      const possiblePaths = [
        path.resolve(__dirname, '../data/demo-emails.json'),
        path.resolve(__dirname, '../../../data/demo-emails/university-emails.json'),
        path.resolve(__dirname, '../../../client/src/data/demo-emails.json')
      ];
      let emailsData: any[] = [];
      for (const p of possiblePaths) {
        if (fs.existsSync(p)) {
          try {
            emailsData = JSON.parse(fs.readFileSync(p, 'utf8'));
            if (Array.isArray(emailsData) && emailsData.length > 0) break;
          } catch (e) {}
        }
      }
      for (const email of emailsData) {
        this.upsertEmail(email);
      }

      // Extract actions from seeded emails
      try {
        const { ActionExtractor } = require('../services/actions/ActionExtractor');
        const actions = ActionExtractor.extractActions(emailsData);
        for (const a of actions) {
          this.upsertAction(a);
        }
      } catch (err) {}
    }

    // 3. Seed classroom courses & coursework if empty
    const hasCourse1 = (this.db.prepare('SELECT count(*) as c FROM classroom_courses WHERE id = ?').get('course-cse204') as any)?.c || 0;
    if (hasCourse1 === 0) {
      const defaultCourses: ClassroomCourse[] = [
        {
          id: 'course-cse204',
          name: 'CSE 204: Design and Analysis of Algorithms',
          section: 'CSE-A',
          room: 'S202, SR Block',
          courseState: 'ACTIVE',
          alternateLink: 'https://classroom.google.com/c/cse204'
        },
        {
          id: 'course-cse213',
          name: 'CSE 213: Digital Systems & Microprocessors',
          section: 'CSE-Core',
          room: 'ALH 101',
          courseState: 'ACTIVE',
          alternateLink: 'https://classroom.google.com/c/cse213'
        },
        {
          id: 'course-mat202',
          name: 'MAT 202: Discrete Mathematics & Graph Theory',
          section: 'CSE-Math',
          room: 'ALH 205',
          courseState: 'ACTIVE',
          alternateLink: 'https://classroom.google.com/c/mat202'
        }
      ];
      for (const c of defaultCourses) {
        this.upsertClassroomCourse(c);
      }

      const defaultCoursework: ClassroomCoursework[] = [
        {
          id: 'cw-cse204-a1',
          courseId: 'course-cse204',
          courseName: 'CSE 204: Design and Analysis of Algorithms',
          title: 'Assignment 1: Dynamic Programming & Greedy Approaches',
          description: 'Implement Longest Common Subsequence, 0/1 Knapsack, and Dijkstra algorithm with test benches.',
          state: 'PUBLISHED',
          dueDate: '2026-10-02T18:29:59.000Z',
          dueTime: '11:59 PM',
          maxPoints: 100,
          alternateLink: 'https://classroom.google.com/c/cse204/a/1',
          submissionStatus: 'NOT_SUBMITTED',
          priority: 'HIGH'
        },
        {
          id: 'cw-cse204-lab',
          courseId: 'course-cse204',
          courseName: 'CSE 204: Design and Analysis of Algorithms',
          title: 'Lab Exercise 4: Graph Traversals & Topological Sort',
          description: 'Upload GitHub repo link and PDF execution logs before Wednesday 5 PM.',
          state: 'PUBLISHED',
          dueDate: '2026-10-04T18:29:59.000Z',
          dueTime: '05:00 PM',
          maxPoints: 50,
          alternateLink: 'https://classroom.google.com/c/cse204/a/2',
          submissionStatus: 'NOT_SUBMITTED',
          priority: 'MEDIUM'
        },
        {
          id: 'cw-cse213-quiz',
          courseId: 'course-cse213',
          courseName: 'CSE 213: Digital Systems & Microprocessors',
          title: 'Surprise Quiz 2 — Verilog HDL Simulation',
          description: 'Synchronous counters and finite state machine simulation analysis.',
          state: 'PUBLISHED',
          dueDate: '2026-10-01T10:00:00.000Z',
          dueTime: '10:00 AM',
          maxPoints: 20,
          alternateLink: 'https://classroom.google.com/c/cse213/a/quiz2',
          submissionStatus: 'NOT_SUBMITTED',
          priority: 'CRITICAL'
        }
      ];
      for (const cw of defaultCoursework) {
        this.upsertClassroomCoursework(cw);
      }
    }

    // 4. Seed calendar events if baseline missing
    const hasCal1 = (this.db.prepare('SELECT count(*) as c FROM calendar_events WHERE id = ?').get('cal-event-1') as any)?.c || 0;
    if (hasCal1 === 0) {
      const defaultEvents: GoogleCalendarEvent[] = [
        {
          id: 'cal-event-1',
          title: 'CSE 204: Algorithms Laboratory & Theory',
          description: 'Design and Analysis of Algorithms mandatory laboratory session.',
          startTime: '2026-09-30T09:00:00.000Z',
          endTime: '2026-09-30T11:00:00.000Z',
          location: 'S202, SR Block',
          isAllDay: false,
          source: 'google'
        },
        {
          id: 'cal-event-2',
          title: 'CEL Mentor Review — Team Pitching',
          description: 'In-person mentor review with Rakesh Sir at Directorate of Entrepreneurship.',
          startTime: '2026-09-29T15:50:00.000Z',
          endTime: '2026-09-29T16:30:00.000Z',
          location: 'Directorate of Entrepreneurship, Level 2',
          isAllDay: false,
          source: 'google'
        },
        {
          id: 'cal-event-3',
          title: 'CSE Expert Talk: Securing Autonomous AI Platforms',
          description: 'Guest talk on AI Governance, threat modeling, and OWASP Agentic Top 10.',
          startTime: '2026-09-26T11:00:00.000Z',
          endTime: '2026-09-26T12:30:00.000Z',
          location: 'Online (Zoom / University Stream)',
          isAllDay: false,
          source: 'google'
        },
        {
          id: 'cal-event-4',
          title: 'Terrathon 2026 — Sustainability Hackathon',
          description: 'Green computing & sustainable systems hackathon kickoff.',
          startTime: '2026-09-26T10:00:00.000Z',
          endTime: '2026-09-26T11:00:00.000Z',
          location: 'APJ Abdul Kalam Auditorium',
          isAllDay: false,
          source: 'google'
        },
        {
          id: 'cal-event-5',
          title: 'Hands-On Robotics Workshop (Techfest IIT Bombay)',
          description: 'Autonomous Kinematics and ROS integration session. Microcontrollers distributed.',
          startTime: '2026-09-30T11:00:00.000Z',
          endTime: '2026-09-30T16:00:00.000Z',
          location: 'Room S204, SR Block',
          isAllDay: false,
          source: 'google',
          sourceType: 'google',
          sourceId: 'email-srm-002'
        }
      ];
      for (const ev of defaultEvents) {
        this.upsertCalendarEvent(ev);
      }
    }

    // 5. Seed changes if empty
    if (this.getChanges().length === 0) {
      const defaultChanges: ScheduleChangeItem[] = [
        {
          topic: 'CSE 204 Exam Reporting Cutoff',
          previousValue: '09:30 AM',
          newValue: '08:35 AM',
          changeType: 'TIMING',
          summary: 'Reporting cutoff revised to 08:35 AM sharp. Physical hall ticket mandatory.',
          emailId: 'email-srm-001'
        },
        {
          topic: 'CSE302 Database Exam Venue',
          previousValue: 'Block A, Main Hall',
          newValue: 'Block C, Hall 204',
          changeType: 'LOCATION',
          summary: 'Exam relocated to Block C Hall 204. Arrive by 8:40 AM.',
          emailId: 'email-001'
        },
        {
          topic: 'Campus Shuttle Route 2 Diversion',
          previousValue: 'Gate 1 Main Entry',
          newValue: 'Gate 4 Drop-off (+15m delay)',
          changeType: 'LOCATION',
          summary: 'Road blockade near North Traffic Circle; drop-off shifted to Gate 4.',
          emailId: 'email-srm-008'
        }
      ];
      for (const ch of defaultChanges) {
        this.insertChange(ch);
      }
    }
  }

  // ==================== CLEANUP ====================

  public close(): void {
    this.db.close();
  }
}
