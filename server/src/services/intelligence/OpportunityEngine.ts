import { DatabaseService } from '../../db/DatabaseService';
import { OpportunityItem } from '../../types';

export class OpportunityEngine {
  private static instance: OpportunityEngine;

  private constructor() {}

  public static getInstance(): OpportunityEngine {
    if (!OpportunityEngine.instance) {
      OpportunityEngine.instance = new OpportunityEngine();
    }
    return OpportunityEngine.instance;
  }

  public getOpportunities(): OpportunityItem[] {
    const db = DatabaseService.getInstance();
    const emails = db.getEmails();
    const student = db.getStudentProfile();

    const opportunities: OpportunityItem[] = [];

    for (const email of emails) {
      const text = `${email.subject} ${email.body}`.toLowerCase();
      let type: OpportunityItem['type'] | null = null;

      if (email.category === 'HACKATHONS' || text.includes('hackathon')) {
        type = 'HACKATHON';
      } else if (text.includes('workshop') || text.includes('bootcamp')) {
        type = 'WORKSHOP';
      } else if (text.includes('expert talk') || text.includes('guest lecture') || text.includes('distinguished speaker')) {
        type = 'EXPERT_TALK';
      } else if (text.includes('recruitment') || text.includes('club induction') || text.includes('student chapter')) {
        type = 'CLUB_RECRUITMENT';
      } else if (text.includes('internship') || text.includes('placement') || text.includes('hiring')) {
        type = 'INTERNSHIP';
      } else if (text.includes('competition') || text.includes('contest') || text.includes('pitch')) {
        type = 'COMPETITION';
      }

      if (!type) continue;

      // Calculate relevance score and reasons based on student profile (CSE, AI & ML, Sem 3)
      let relevanceScore = 60;
      const whyRelevant: string[] = [];

      if (text.includes('ai') || text.includes('machine learning') || text.includes('ros') || text.includes('prompt')) {
        relevanceScore += 25;
        whyRelevant.push('Directly matches your active B.Tech AI & ML academic specialisation.');
      }

      if (text.includes('cse') || text.includes('computer science') || text.includes('coding') || text.includes('software')) {
        relevanceScore += 15;
        whyRelevant.push('Applicable to Computer Science and Engineering students.');
      }

      if (text.includes('seas') || text.includes('engineering and sciences')) {
        whyRelevant.push('Hosted by School of Engineering and Sciences (SEAS).');
      }

      if (email.actionDeadline || email.deadlineDate) {
        whyRelevant.push(`Registration closes on ${email.actionDeadline || email.deadlineDate}.`);
      }

      if (type === 'HACKATHON') {
        whyRelevant.push('Eligible for hackathon academic on-duty attendance credit upon team shortlisting.');
      }

      relevanceScore = Math.min(98, Math.max(50, relevanceScore));

      opportunities.push({
        id: `opp-${email.id}`,
        title: email.subject.replace(/^(INVITATION:\s*|OPPORTUNITY:\s*|CIRCULAR:\s*)/i, ''),
        type,
        organizer: email.senderName,
        date: email.eventDate,
        deadline: email.actionDeadline || email.deadlineDate,
        location: email.location || 'Campus / Online',
        relevanceScore,
        whyRelevant: whyRelevant.length > 0 ? whyRelevant : ['Open to all SRM University-AP engineering scholars.'],
        actionText: email.actionText || 'Register for event on university portal',
        sourceId: email.id,
        sourceSubject: email.subject,
        category: email.category,
        tags: email.tags
      });
    }

    // Sort by relevance score descending
    opportunities.sort((a, b) => b.relevanceScore - a.relevanceScore);
    return opportunities;
  }
}
