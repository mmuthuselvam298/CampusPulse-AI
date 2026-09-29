import { google } from 'googleapis';
import sanitizeHtml from 'sanitize-html';
import { EmailData } from '../../types';
import { UniversityFilter } from '../filter/UniversityFilter';

export class GmailService {
  private static oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID || 'dummy_client_id',
    process.env.GOOGLE_CLIENT_SECRET || 'dummy_client_secret',
    process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3001/api/gmail/oauth/callback'
  );

  private static isConnected: boolean = false;
  private static userEmail: string | null = null;
  private static tokens: any = null;

  public static getAuthUrl(): string {
    const scopes = ['https://www.googleapis.com/auth/gmail.readonly'];
    return GmailService.oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
      prompt: 'consent'
    });
  }

  public static async handleCallback(code: string): Promise<boolean> {
    try {
      const { tokens } = await GmailService.oauth2Client.getToken(code);
      GmailService.oauth2Client.setCredentials(tokens);
      GmailService.tokens = tokens;
      GmailService.isConnected = true;

      const oauth2 = google.oauth2({ version: 'v2', auth: GmailService.oauth2Client });
      const userInfo = await oauth2.userinfo.get();
      GmailService.userEmail = userInfo.data.email || 'connected-user@university.edu';
      return true;
    } catch (err) {
      console.error('Gmail OAuth token exchange error:', err);
      return false;
    }
  }

  public static getStatus(): { isConnected: boolean; userEmail: string | null; scope: string } {
    return {
      isConnected: GmailService.isConnected,
      userEmail: GmailService.userEmail,
      scope: 'https://www.googleapis.com/auth/gmail.readonly (Read-only, Zero Modify/Send)'
    };
  }

  public static disconnect(): void {
    GmailService.isConnected = false;
    GmailService.userEmail = null;
    GmailService.tokens = null;
    GmailService.oauth2Client.revokeCredentials().catch(() => {});
  }

  /**
   * Sanitizes raw email HTML content to guarantee 100% XSS-free safe rendering
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
   * Fetches messages using Gmail API and applies university-domain filtering
   */
  public static async fetchUniversityEmails(): Promise<EmailData[]> {
    if (!GmailService.isConnected) {
      throw new Error('Gmail is not connected. Connect via OAuth or switch to Demo Mode.');
    }

    const gmail = google.gmail({ version: 'v1', auth: GmailService.oauth2Client });
    const response = await gmail.users.messages.list({
      userId: 'me',
      maxResults: 50
    });

    const messages = response.data.messages || [];
    const results: EmailData[] = [];

    for (const msg of messages) {
      if (!msg.id) continue;
      const detail = await gmail.users.messages.get({ userId: 'me', id: msg.id });
      const payload = detail.data.payload;
      const headers = payload?.headers || [];

      const getHeader = (name: string) => headers.find(h => h.name?.toLowerCase() === name.toLowerCase())?.value || '';
      const from = getHeader('from');
      const subject = getHeader('subject') || '(No Subject)';
      const date = getHeader('date') || new Date().toISOString();
      const to = getHeader('to') || 'me@university.edu';

      // Apply university domain filter
      if (!UniversityFilter.isUniversityEmail(from, to)) {
        continue;
      }

      let body = detail.data.snippet || '';
      const sanitized = GmailService.sanitizeEmailContent(body);

      results.push({
        id: `gmail-${msg.id}`,
        sender: from,
        senderName: from.split('<')[0].replace(/"/g, '').trim() || from,
        recipient: to,
        subject,
        body: sanitized,
        timestamp: new Date(date).toISOString(),
        dateFormatted: new Date(date).toLocaleDateString(),
        category: 'GENERAL',
        priority: 'MEDIUM',
        priorityScore: 50,
        priorityReason: 'Ingested via Gmail Read-Only Sync.',
        categoryReason: 'University sender domain confirmed.',
        summary: detail.data.snippet || subject,
        actionRequired: false,
        urgency: 'MEDIUM',
        tags: ['gmail', 'live'],
        isRead: false,
        source: 'gmail'
      });
    }

    return results;
  }
}
