import { DatabaseService } from '../../db/DatabaseService';
import { ConflictEngine } from './ConflictEngine';
import { RelationshipEngine } from '../relationships/RelationshipEngine';
import { CommunicationHealthMetrics } from '../../types';

export class HealthEngine {
  private static instance: HealthEngine;

  private constructor() {}

  public static getInstance(): HealthEngine {
    if (!HealthEngine.instance) {
      HealthEngine.instance = new HealthEngine();
    }
    return HealthEngine.instance;
  }

  public calculateHealthMetrics(): CommunicationHealthMetrics {
    const db = DatabaseService.getInstance();
    const emails = db.getEmails();
    const total = emails.length;

    if (total === 0) {
      return {
        totalCommunications: 0,
        duplicateOrRelatedCount: 0,
        duplicatePercentage: 0,
        withDeadlinesCount: 0,
        withDeadlinesPercentage: 0,
        withLocationsCount: 0,
        withLocationsPercentage: 0,
        withExplicitActionsCount: 0,
        withExplicitActionsPercentage: 0,
        conflictingInfoCount: 0,
        changedEventsCount: 0,
        missingLocationCount: 0,
        missingTimeCount: 0,
        overallHealthScore: 100,
        grade: 'A',
        datasetContext: 'No communications loaded.',
        topInsights: ['Awaiting incoming communications.']
      };
    }

    // 1. Duplicate / Related communications
    const clusters = RelationshipEngine.clusterByTopic(emails);
    let duplicateOrRelatedCount = 0;
    clusters.forEach(c => {
      if (c.emails.length > 1) {
        duplicateOrRelatedCount += (c.emails.length - 1);
      }
    });

    // 2. Deadlines
    const withDeadlines = emails.filter(e => Boolean(e.actionDeadline || e.deadlineDate));
    const withDeadlinesCount = withDeadlines.length;
    const withDeadlinesPercentage = Math.round((withDeadlinesCount / total) * 100);

    // 3. Locations
    const withLocations = emails.filter(e => Boolean(e.location && e.location.trim().length > 0));
    const withLocationsCount = withLocations.length;
    const withLocationsPercentage = Math.round((withLocationsCount / total) * 100);

    // 4. Explicit Actions
    const withExplicitActions = emails.filter(e => Boolean(e.actionRequired && e.actionText));
    const withExplicitActionsCount = withExplicitActions.length;
    const withExplicitActionsPercentage = Math.round((withExplicitActionsCount / total) * 100);

    // 5. Conflicts & Changes
    const conflicts = ConflictEngine.getInstance().detectConflicts();
    const changes = RelationshipEngine.getWhatChanged(emails);

    // 6. Missing Location/Time in event or action notices
    const eventLikeEmails = emails.filter(e => 
      ['EVENTS', 'TECH EVENTS', 'HACKATHONS', 'EXAMS'].includes(e.category) || e.actionRequired
    );
    const missingLocationCount = eventLikeEmails.filter(e => !e.location || e.location.trim().length === 0).length;
    const missingTimeCount = eventLikeEmails.filter(e => !e.eventDate && !e.deadlineDate && !e.actionDeadline).length;

    // 7. Overall Health Score Calculation (out of 100)
    // Higher clarity of deadlines, locations, and actions increases score.
    // High duplicates and conflicts deduct points.
    let score = 50;
    score += (withDeadlinesPercentage * 0.2);
    score += (withLocationsPercentage * 0.2);
    score += (withExplicitActionsPercentage * 0.2);
    score -= (conflicts.length * 4);
    score -= (duplicateOrRelatedCount * 0.5);

    score = Math.max(20, Math.min(100, Math.round(score)));

    let grade: 'A' | 'B' | 'C' | 'D' = 'B';
    if (score >= 85) grade = 'A';
    else if (score >= 70) grade = 'B';
    else if (score >= 50) grade = 'C';
    else grade = 'D';

    const topInsights: string[] = [
      `${withDeadlinesPercentage}% of campus notices clearly state deadlines, but ${missingTimeCount} event notices omit time specifications.`,
      `${duplicateOrRelatedCount} notifications were follow-up reminders or duplicate announcements that can be condensed.`,
      `${conflicts.length} cross-system contradictions detected between Gmail circulars and Google Calendar schedules.`,
      `${withLocationsPercentage}% of notices specify exact campus rooms (e.g. S202 SR Block, Kalam Auditorium).`
    ];

    const mode = db.getMode();
    const datasetContext = mode === 'demo' 
      ? `Calculated dynamically from exactly ${total} authentic SRM AP communications.`
      : `Calculated from ${total} synchronized Google account records.`;

    return {
      totalCommunications: total,
      duplicateOrRelatedCount,
      duplicatePercentage: Math.round((duplicateOrRelatedCount / total) * 100),
      withDeadlinesCount,
      withDeadlinesPercentage,
      withLocationsCount,
      withLocationsPercentage,
      withExplicitActionsCount,
      withExplicitActionsPercentage,
      conflictingInfoCount: conflicts.length,
      changedEventsCount: changes.length,
      missingLocationCount,
      missingTimeCount,
      overallHealthScore: score,
      grade,
      datasetContext,
      topInsights
    };
  }
}
