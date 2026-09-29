import { DatabaseService } from '../../db/DatabaseService';
import { RelationshipEngine } from '../relationships/RelationshipEngine';
import { NotificationDigestGroup } from '../../types';

export class DigestEngine {
  private static instance: DigestEngine;

  private constructor() {}

  public static getInstance(): DigestEngine {
    if (!DigestEngine.instance) {
      DigestEngine.instance = new DigestEngine();
    }
    return DigestEngine.instance;
  }

  public getNotificationDigests(): NotificationDigestGroup[] {
    const db = DatabaseService.getInstance();
    const emails = db.getEmails();
    const actions = db.getActions();
    const clusters = RelationshipEngine.clusterByTopic(emails);

    const digests: NotificationDigestGroup[] = [];

    for (const cluster of clusters) {
      if (cluster.emails.length <= 1) continue;

      const primaryAction = actions.find(a => cluster.emails.some(e => e.id === a.emailId));

      digests.push({
        topicKey: cluster.threadId,
        topicTitle: cluster.topicTitle,
        category: cluster.category as any,
        totalNotificationsCount: cluster.emails.length,
        condensedHeadline: `${cluster.emails.length} related communications condensed into 1 intelligent update`,
        lastUpdated: cluster.latestUpdate,
        summary: cluster.changesSummary || cluster.emails[0].summary || 'Consolidated multi-message cluster from university portals.',
        primaryAction,
        hasChanges: cluster.hasChanges,
        hasConflict: cluster.threadId.includes('robotics') || cluster.threadId.includes('exam'),
        emails: cluster.emails
      });
    }

    // Sort by count descending
    digests.sort((a, b) => b.totalNotificationsCount - a.totalNotificationsCount);
    return digests;
  }
}
