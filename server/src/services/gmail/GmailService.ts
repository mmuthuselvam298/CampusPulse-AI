import { google } from 'googleapis';
import sanitizeHtml from 'sanitize-html';
import { EmailData } from '../../types';
import { UniversityFilter } from '../filter/UniversityFilter';
import { GoogleOAuthService } from '../google/GoogleOAuthService';

export class GmailService {
  /**
   * Sanitizes raw email HTML content to guarantee XSS-free safe rendering
   */
  public static sanitizeEmailContent(rawHtml: string): string {
    return sanitizeHtml(rawHtml, {
      allowedTags: ['b', 'i', 'em', 'strong', 'a', 'p', 'br', 'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'h4', 'table', 'tr', 'td', 'th', 'span', 'div'],
      allowedAttributes: {
        'a': ['href', 'target', 'rel'],
        '*': ['class', 'style']
      },
      allowedSchemes: ['http', 'https', 'mailto']
    });
  }

  /**
   * Helper to decode Base64 / Base64URL encoded Gmail message payload body parts
   */
  public static decodeBase64(data: string): string {
    try {
      const base64 = data.replace(/-/g, '+').replace(/_/g, '/');
      return Buffer.from(base64, 'base64').toString('utf-8');
    } catch (e) {
      return '';
    }
  }

  /**
   * Recursively extracts plain text and HTML from MIME payload
   */
  public static extractBodyFromPayload(payload: any): { text: string; html: string } {
    let text = '';
    let html = '';

    if (!payload) return { text, html };

    if (payload.body && payload.body.data) {
      const decoded = GmailService.decodeBase64(payload.body.data);
      if (payload.mimeType === 'text/html') {
        html += decoded;
      } else {
        text += decoded;
      }
    }

    if (payload.parts && Array.isArray(payload.parts)) {
      for (const part of payload.parts) {
        if (part.mimeType === 'text/plain' && part.body?.data) {
          text += GmailService.decodeBase64(part.body.data);
        } else if (part.mimeType === 'text/html' && part.body?.data) {
          html += GmailService.decodeBase64(part.body.data);
        } else if (part.parts) {
          const nested = GmailService.extractBodyFromPayload(part);
          text += nested.text;
          html += nested.html;
        }
      }
    }

    return { text, html };
  }

  /**
   * Fetches messages using Gmail API with incremental sync support.
   * Uses after: date-based query for initial sync, then fetches newer messages.
   * @param syncDays Number of days to look back for initial sync (default 30)
   */
  public static async fetchUniversityEmails(syncDays: number = 30): Promise<(EmailData & { gmailMessageId?: string; bodyHtml?: string; snippet?: string })[]> {
    const oauthService = GoogleOAuthService.getInstance();
    if (!oauthService.isAuthConnected()) {
      throw new Error('Google OAuth is not connected. Please connect your Google account first.');
    }

    const auth = oauthService.getClient();
    const gmail = google.gmail({ version: 'v1', auth });

    // Build query: fetch university-related messages from the configured timeframe
    const afterDate = new Date();
    afterDate.setDate(afterDate.getDate() - syncDays);
    const afterDateStr = `${afterDate.getFullYear()}/${String(afterDate.getMonth() + 1).padStart(2, '0')}/${String(afterDate.getDate()).padStart(2, '0')}`;

    const allowedDomains = UniversityFilter.getAllowedDomains();
    // Build domain-based query parts
    const domainQueries = allowedDomains
      .filter(d => d !== 'edu' && d !== 'university.edu') // skip too-generic defaults
      .map(d => `from:${d} OR to:${d}`)
      .join(' OR ');

    const query = `after:${afterDateStr} (${domainQueries || 'srmap OR classroom'})`;

    const results: (EmailData & { gmailMessageId?: string; bodyHtml?: string; snippet?: string })[] = [];
    const seenIds = new Set<string>();
    let pageToken: string | undefined;
    let totalFetched = 0;
    const maxMessages = 200; // Reasonable cap to prevent excessive API usage

    do {
      const response = await gmail.users.messages.list({
        userId: 'me',
        maxResults: 50, // per-page, not total
        q: query,
        pageToken: pageToken
      });

      const messages = response.data.messages || [];
      pageToken = response.data.nextPageToken || undefined;

      for (const msg of messages) {
        if (!msg.id || seenIds.has(msg.id)) continue;
        seenIds.add(msg.id);
        totalFetched++;

        if (totalFetched > maxMessages) {
          pageToken = undefined; // Stop pagination
          break;
        }

        try {
          const detail = await gmail.users.messages.get({
            userId: 'me',
            id: msg.id,
            format: 'full'
          });

          const payload = detail.data.payload;
          const headers = payload?.headers || [];
          const getHeader = (name: string) => headers.find(h => h.name?.toLowerCase() === name.toLowerCase())?.value || '';

          const from = getHeader('from');
          const subject = getHeader('subject') || '(No Subject)';
          const date = getHeader('date') || new Date().toISOString();
          const to = getHeader('to') || '';
          const messageId = getHeader('message-id');

          // Apply institutional domain filter
          if (!UniversityFilter.isUniversityEmail(from, to)) {
            continue;
          }

          // Extract body
          const { text, html } = GmailService.extractBodyFromPayload(payload);
          const rawBody = text || html || detail.data.snippet || '';
          const sanitized = GmailService.sanitizeEmailContent(rawBody);

          // Detect Classroom notifications
          const isClassroomNotification =
            from.toLowerCase().includes('classroom') ||
            subject.toLowerCase().includes('google classroom') ||
            rawBody.toLowerCase().includes('classroom.google.com');

          let senderName = from.split('<')[0].replace(/"/g, '').trim();
          if (!senderName) senderName = from;

          const parsedDate = new Date(date);
          const dateFormatted = parsedDate.toLocaleDateString("en-US", {
            month: "short", day: "numeric", year: "numeric"
          });

          // Extract labels
          const labels = detail.data.labelIds || [];

          results.push({
            id: `gmail-${msg.id}`,
            gmailMessageId: msg.id,
            threadId: detail.data.threadId || `thread-${msg.id}`,
            sender: from,
            senderName,
            recipient: to,
            subject,
            body: sanitized,
            bodyHtml: html ? GmailService.sanitizeEmailContent(html) : undefined,
            snippet: detail.data.snippet || undefined,
            timestamp: parsedDate.toISOString(),
            dateFormatted,
            category: isClassroomNotification ? 'ASSIGNMENTS' : 'ACADEMICS',
            priority: 'MEDIUM',
            priorityScore: 60,
            priorityReason: isClassroomNotification ? 'Classroom notification ingested from Gmail' : 'Verified university communication',
            categoryReason: 'University institutional sender domain confirmed',
            summary: detail.data.snippet || subject,
            actionRequired: isClassroomNotification,
            urgency: 'MEDIUM',
            tags: isClassroomNotification ? ['gmail', 'live', 'classroom'] : ['gmail', 'live', 'university'],
            isRead: !labels.includes('UNREAD'),
            source: 'gmail',
            systemOrigin: isClassroomNotification ? 'Google Classroom' : 'University Email',
            labels: JSON.stringify(labels) as any,
          });
        } catch (msgErr) {
          console.warn(`Failed to fetch details for Gmail message ${msg.id}:`, msgErr);
        }
      }
    } while (pageToken && totalFetched < maxMessages);

    console.log(`📧 GmailService: Fetched ${results.length} university emails (${totalFetched} total scanned)`);
    return results;
  }
}
