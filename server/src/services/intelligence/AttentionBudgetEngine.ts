import { DatabaseService } from '../../db/DatabaseService';
import { AttentionBudgetData, Priority } from '../../types';

export class AttentionBudgetEngine {
  private static instance: AttentionBudgetEngine;

  private constructor() {}

  public static getInstance(): AttentionBudgetEngine {
    if (!AttentionBudgetEngine.instance) {
      AttentionBudgetEngine.instance = new AttentionBudgetEngine();
    }
    return AttentionBudgetEngine.instance;
  }

  public getAttentionBudget(): AttentionBudgetData {
    const db = DatabaseService.getInstance();
    const emails = db.getEmails();
    const actions = db.getActions();

    const immediateItems: AttentionBudgetData['immediate']['items'] = [];
    const thisWeekItems: AttentionBudgetData['thisWeek']['items'] = [];
    const informationalItems: AttentionBudgetData['informational']['items'] = [];

    for (const email of emails) {
      if (email.priority === 'CRITICAL' || (email.priority === 'HIGH' && email.actionRequired)) {
        immediateItems.push({
          id: email.id,
          title: email.actionText || email.subject,
          reason: email.priorityReason || 'High priority action required today',
          deadline: email.actionDeadline || 'Today',
          priority: email.priority,
          category: email.category,
          source: 'Gmail'
        });
      } else if (email.actionRequired || email.priority === 'HIGH' || email.deadlineDate) {
        thisWeekItems.push({
          id: email.id,
          title: email.actionText || email.subject,
          reason: email.priorityReason || 'Upcoming action or deadline within 7 days',
          deadline: email.actionDeadline || email.deadlineDate || 'This Week',
          priority: email.priority,
          category: email.category,
          source: 'Gmail'
        });
      } else {
        informationalItems.push({
          id: email.id,
          title: email.subject,
          category: email.category,
          source: 'Gmail'
        });
      }
    }

    return {
      date: 'Sep 29, 2026',
      totalItems: emails.length,
      immediate: {
        count: immediateItems.length,
        items: immediateItems.slice(0, 10)
      },
      thisWeek: {
        count: thisWeekItems.length,
        items: thisWeekItems.slice(0, 15)
      },
      informational: {
        count: informationalItems.length,
        items: informationalItems.slice(0, 20)
      }
    };
  }
}
