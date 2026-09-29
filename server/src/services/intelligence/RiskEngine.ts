import { DatabaseService } from '../../db/DatabaseService';
import { DeadlineRiskItem } from '../../types';

export class RiskEngine {
  private static instance: RiskEngine;

  private constructor() {}

  public static getInstance(): RiskEngine {
    if (!RiskEngine.instance) {
      RiskEngine.instance = new RiskEngine();
    }
    return RiskEngine.instance;
  }

  public calculateDeadlineRisks(): DeadlineRiskItem[] {
    const db = DatabaseService.getInstance();
    const coursework = db.getClassroomCoursework();
    const emails = db.getEmails();
    const now = new Date('2026-09-29T12:00:00.000Z').getTime();

    const riskItems: DeadlineRiskItem[] = [];

    // 1. Process Google Classroom Coursework
    for (const work of coursework) {
      if (!work.dueDate) continue;

      const dueDateTime = work.dueTime 
        ? `${work.dueDate}T${work.dueTime}:00.000Z` 
        : `${work.dueDate}T23:59:59.000Z`;
      
      const dueMs = new Date(dueDateTime).getTime();
      const hoursRemaining = Math.max(0, Math.round((dueMs - now) / (1000 * 3600)));

      // Factors
      let riskScore = 0;
      const reasons: string[] = [];

      // Proximity score
      if (hoursRemaining <= 12) {
        riskScore += 45;
        reasons.push(`Imminent deadline: Only ${hoursRemaining} hours remaining until submission portal locks.`);
      } else if (hoursRemaining <= 28) {
        riskScore += 35;
        reasons.push(`Approaching deadline: Due tomorrow (${work.dueDate}) with ${hoursRemaining} hours left.`);
      } else if (hoursRemaining <= 72) {
        riskScore += 20;
        reasons.push(`Due in 3 days (${hoursRemaining} hours remaining).`);
      } else {
        riskScore += 10;
        reasons.push(`Standard homework timeline (${Math.round(hoursRemaining / 24)} days left).`);
      }

      // Submission status factor
      const subStatus = work.submissionStatus || 'UNAVAILABLE';
      if (subStatus === 'ASSIGNED' || subStatus === 'NEW') {
        riskScore += 35;
        reasons.push(`Submission status on Classroom is "${subStatus}" (Pending student upload).`);
      } else if (subStatus === 'TURNED_IN' || subStatus === 'SUBMITTED') {
        riskScore = Math.max(5, riskScore - 50);
        reasons.push('Assignment marked as TURNED_IN on Google Classroom.');
      } else {
        reasons.push(`Classroom submission status is "${subStatus}"; verify on Google Classroom portal.`);
      }

      // Action required
      riskScore += 15;
      reasons.push('Evaluation carries internal continuous assessment grade weighting.');

      // Check repeated reminders
      const reminderCount = emails.filter(e => 
        e.subject.toLowerCase().includes(work.courseName.toLowerCase()) || 
        e.body.toLowerCase().includes(work.title.toLowerCase())
      ).length;
      if (reminderCount > 1) {
        riskScore += 10;
        reasons.push(`Repeated reminders detected: ${reminderCount} notices received regarding this subject.`);
      }

      // Cap at 100
      riskScore = Math.min(100, riskScore);

      let riskLevel: 'LOW RISK' | 'MEDIUM RISK' | 'HIGH RISK' = 'LOW RISK';
      if (riskScore >= 75) {
        riskLevel = 'HIGH RISK';
      } else if (riskScore >= 45) {
        riskLevel = 'MEDIUM RISK';
      }

      let suggestedAction = 'Review submission criteria and upload completed files.';
      if (riskLevel === 'HIGH RISK') {
        suggestedAction = `Prioritize immediate completion. Check Google Classroom and submit before ${work.dueDate} ${work.dueTime || '23:59'}.`;
      } else if (subStatus === 'TURNED_IN') {
        suggestedAction = 'Submission verified. Confirm grading status after evaluation.';
      }

      riskItems.push({
        id: `risk-work-${work.id}`,
        title: work.title,
        courseName: work.courseName,
        sourceType: 'classroom',
        sourceId: work.id,
        dueDate: work.dueDate,
        dueTimeFormatted: work.dueTime ? `${work.dueTime} HRS` : '11:59 PM',
        hoursRemaining,
        riskLevel,
        submissionStatus: subStatus,
        explicitActionRequired: true,
        hasRepeatedReminders: reminderCount > 1,
        hasChangedDeadline: false,
        hasConflict: false,
        riskScore,
        riskReasons: reasons,
        suggestedAction
      });
    }

    // 2. Process High Priority Email Deadlines (e.g. Attendance condonation, Hall Ticket)
    const deadlineEmails = emails.filter(e => 
      e.actionRequired && 
      (e.deadlineDate || e.actionDeadline) && 
      (e.priority === 'CRITICAL' || e.priority === 'HIGH')
    );

    for (const email of deadlineEmails) {
      // Avoid duplicate if already covered by coursework
      if (riskItems.some(r => r.title.toLowerCase().includes(email.actionText?.toLowerCase() || 'xyz'))) {
        continue;
      }

      const dueMs = email.deadlineDate ? new Date(email.deadlineDate).getTime() : now + 6 * 3600 * 1000;
      const hoursRemaining = Math.max(0, Math.round((dueMs - now) / (1000 * 3600)));

      let riskScore = 80;
      const reasons: string[] = [
        `Urgent notice from ${email.senderName}.`,
        `Explicit action required: "${email.actionText}".`,
        `Enforces deadline: ${email.actionDeadline || 'Today'}.`
      ];

      riskItems.push({
        id: `risk-email-${email.id}`,
        title: email.actionText || email.subject,
        courseName: email.category,
        sourceType: 'gmail',
        sourceId: email.id,
        dueDate: email.actionDeadline || 'Today',
        dueTimeFormatted: '5:00 PM',
        hoursRemaining,
        riskLevel: 'HIGH RISK',
        submissionStatus: email.isActionCompleted ? 'SUBMITTED' : 'ASSIGNED',
        explicitActionRequired: true,
        hasRepeatedReminders: false,
        hasChangedDeadline: false,
        hasConflict: false,
        riskScore,
        riskReasons: reasons,
        suggestedAction: `Execute required action before office closes: ${email.actionText}`
      });
    }

    // Sort by risk score descending
    riskItems.sort((a, b) => b.riskScore - a.riskScore);
    return riskItems;
  }
}
