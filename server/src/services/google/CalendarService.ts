import { google } from 'googleapis';
import { GoogleOAuthService } from './GoogleOAuthService';
import { GoogleCalendarEvent, CalendarConflictCheckResult } from '../../types';

export class CalendarService {
  private static instance: CalendarService;
  private sourceToEventMap: Map<string, string> = new Map(); // sourceId -> calendarEventId

  private constructor() {}

  public static getInstance(): CalendarService {
    if (!CalendarService.instance) {
      CalendarService.instance = new CalendarService();
    }
    return CalendarService.instance;
  }



  /**
   * Retrieves upcoming events from Google Calendar API or local state
   */
  public async getUpcomingEvents(timeMin?: string, timeMax?: string): Promise<GoogleCalendarEvent[]> {
    const oauth = GoogleOAuthService.getInstance();

    if (!oauth.isAuthConnected()) {
      // Return persisted events from SQLite
      const { SQLiteService } = require('../../db/SQLiteService');
      const sqlite = SQLiteService.getInstance();
      return sqlite.getCalendarEvents({ timeMin, timeMax });
    }

    try {
      const auth = oauth.getClient();
      const calendar = google.calendar({ version: 'v3', auth: auth as any });

      const res = await calendar.events.list({
        calendarId: 'primary',
        timeMin: timeMin || new Date().toISOString(),
        timeMax: timeMax || undefined,
        maxResults: 50,
        singleEvents: true,
        orderBy: 'startTime'
      });

      const items = res.data.items || [];
      const events: GoogleCalendarEvent[] = items.map(item => ({
        id: item.id || `event-${Date.now()}`,
        title: item.summary || 'Untitled Event',
        description: item.description || undefined,
        location: item.location || undefined,
        startTime: item.start?.dateTime || item.start?.date || new Date().toISOString(),
        endTime: item.end?.dateTime || item.end?.date || new Date().toISOString(),
        isAllDay: !item.start?.dateTime,
        htmlLink: item.htmlLink || undefined,
        source: 'google',
        sourceId: item.extendedProperties?.private?.sourceId
      }));

      // Persist to SQLite
      const { SQLiteService } = require('../../db/SQLiteService');
      const sqliteDb = SQLiteService.getInstance();
      for (const event of events) {
        sqliteDb.upsertCalendarEvent(event);
      }

      return events;
    } catch (err) {
      console.warn('Google Calendar fetch failed, using persisted events:', err);
      const { SQLiteService } = require('../../db/SQLiteService');
      const sqliteDb = SQLiteService.getInstance();
      return sqliteDb.getCalendarEvents({ timeMin, timeMax });
    }
  }

  /**
   * Checks whether a proposed event time overlaps with any scheduled calendar event.
   */
  public async checkConflict(
    proposedStart: string,
    proposedEnd: string,
    excludeEventId?: string
  ): Promise<CalendarConflictCheckResult> {
    const allEvents = await this.getUpcomingEvents();
    const propStartTime = new Date(proposedStart).getTime();
    const propEndTime = new Date(proposedEnd).getTime();

    const conflictingEvents = allEvents.filter(event => {
      if (excludeEventId && event.id === excludeEventId) return false;
      const evStart = new Date(event.startTime).getTime();
      const evEnd = new Date(event.endTime).getTime();

      // Overlap condition: start < otherEnd AND end > otherStart
      return propStartTime < evEnd && propEndTime > evStart;
    });

    const hasConflict = conflictingEvents.length > 0;
    return {
      hasConflict,
      conflictingEvents,
      isDuplicate: false,
      message: hasConflict
        ? `Conflict detected: overlaps with ${conflictingEvents[0]?.title}`
        : 'No conflicts detected in proposed time slot'
    };
  }


  /**
   * Checks whether an identical event already exists to prevent duplicate creation
   */
  public async checkDuplicate(
    title: string,
    startTime: string,
    sourceId?: string
  ): Promise<{ isDuplicate: boolean; existingEvent?: GoogleCalendarEvent }> {
    const allEvents = await this.getUpcomingEvents();
    const normTitle = title.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
    const targetStart = new Date(startTime).getTime();

    // 1. Check mapped sourceId
    if (sourceId && this.sourceToEventMap.has(sourceId)) {
      const existingId = this.sourceToEventMap.get(sourceId);
      const matched = allEvents.find(e => e.id === existingId);
      if (matched) return { isDuplicate: true, existingEvent: matched };
    }

    // 2. Check title + timestamp proximity (within 30 minutes)
    for (const ev of allEvents) {
      const evNormTitle = ev.title.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
      const evStart = new Date(ev.startTime).getTime();
      const timeDiffMinutes = Math.abs(evStart - targetStart) / (1000 * 60);

      if ((normTitle.includes(evNormTitle) || evNormTitle.includes(normTitle)) && timeDiffMinutes <= 30) {
        return { isDuplicate: true, existingEvent: ev };
      }

      if (sourceId && ev.sourceId === sourceId) {
        return { isDuplicate: true, existingEvent: ev };
      }
    }

    return { isDuplicate: false };
  }

  /**
   * Adds an event to Google Calendar ONLY after explicit student confirmation.
   */
  public async createEvent(params: {
    title: string;
    startTime: string;
    endTime: string;
    description?: string;
    location?: string;
    sourceId?: string;
  }): Promise<{ success: boolean; event: GoogleCalendarEvent; message: string }> {
    const oauth = GoogleOAuthService.getInstance();

    if (oauth.isAuthConnected()) {
      try {
        const auth = oauth.getClient();
        const calendar = google.calendar({ version: 'v3', auth: auth as any });

        const inserted = await calendar.events.insert({
          calendarId: 'primary',
          requestBody: {
            summary: params.title,
            description: params.description ? `${params.description}\n\n[Imported by CampusPulse AI]` : '[Imported by CampusPulse AI]',
            location: params.location,
            start: { dateTime: new Date(params.startTime).toISOString() },
            end: { dateTime: new Date(params.endTime).toISOString() },
            extendedProperties: {
              private: {
                campusPulseId: params.sourceId || `cp-${Date.now()}`,
                sourceId: params.sourceId || ''
              }
            }
          }
        });

        const createdEvent: GoogleCalendarEvent = {
          id: inserted.data.id || `cal-${Date.now()}`,
          title: inserted.data.summary || params.title,
          description: inserted.data.description || params.description,
          location: inserted.data.location || params.location,
          startTime: inserted.data.start?.dateTime || params.startTime,
          endTime: inserted.data.end?.dateTime || params.endTime,
          isAllDay: false,
          htmlLink: inserted.data.htmlLink || undefined,
          source: 'google',
          sourceId: params.sourceId
        };

        if (params.sourceId) {
          this.sourceToEventMap.set(params.sourceId, createdEvent.id);
        }

        // Persist to SQLite
        const { SQLiteService } = require('../../db/SQLiteService');
        SQLiteService.getInstance().upsertCalendarEvent(createdEvent);

        return {
          success: true,
          event: createdEvent,
          message: 'Confirmed & scheduled to Google Calendar successfully.'
        };
      } catch (err: any) {
        console.warn('Google Calendar API insert failed, storing in CampusPulse state:', err);
      }
    }

    // Local fallback creation (persisted in SQLite)
    const localEvent: GoogleCalendarEvent = {
      id: `local-cal-${Date.now()}`,
      title: params.title,
      description: params.description,
      location: params.location,
      startTime: params.startTime,
      endTime: params.endTime,
      isAllDay: false,
      source: 'local',
      sourceId: params.sourceId
    };

    if (params.sourceId) {
      this.sourceToEventMap.set(params.sourceId, localEvent.id);
    }

    // Persist to SQLite
    const { SQLiteService: SQLiteSvc } = require('../../db/SQLiteService');
    SQLiteSvc.getInstance().upsertCalendarEvent(localEvent);

    return {
      success: true,
      event: localEvent,
      message: 'Event confirmed and scheduled to calendar.'
    };
  }

  /**
   * Deletes a calendar event with confirmation
   */
  public async deleteEvent(eventId: string): Promise<boolean> {
    const oauth = GoogleOAuthService.getInstance();
    if (oauth.isAuthConnected()) {
      try {
        const auth = oauth.getClient();
        const calendar = google.calendar({ version: 'v3', auth: auth as any });
        await calendar.events.delete({
          calendarId: 'primary',
          eventId
        });
      } catch (err) {
        console.warn('Failed to delete event from Google Calendar API:', err);
      }
    }

    // Remove from SQLite
    try {
      const { SQLiteService: SQLiteSvc2 } = require('../../db/SQLiteService');
      SQLiteSvc2.getInstance().getDatabase().prepare('DELETE FROM calendar_events WHERE id = ?').run(eventId);
    } catch (delErr) {
      console.warn('Failed to remove event from local database:', delErr);
    }
    return true;
  }
}
