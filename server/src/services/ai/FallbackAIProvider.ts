import { AIProvider, AssistantQueryResult } from './AIProvider';
import { EmailAnalysisResult, CampusBriefingResult, EmailData, ActionItem, Category, Priority } from '../../types';
import { PriorityEngine } from '../priority/PriorityEngine';

export class FallbackAIProvider implements AIProvider {
  public name: 'mock-fallback' = 'mock-fallback';

  public async analyzeEmail(email: {
    subject: string;
    body: string;
    sender: string;
  }): Promise<EmailAnalysisResult> {
    const text = `${email.subject} ${email.body}`.toLowerCase();

    // 1. Detect Category
    let category: Category = 'GENERAL';
    if (text.includes('exam') || text.includes('mid-semester') || text.includes('hall ticket') || text.includes('seating plan')) {
      category = 'EXAMS';
    } else if (text.includes('attendance') || text.includes('condonation') || text.includes('shortage')) {
      category = 'ATTENDANCE';
    } else if (text.includes('bus') || text.includes('transport') || text.includes('route') || text.includes('shuttle')) {
      category = 'TRANSPORT';
    } else if (text.includes('assignment') || text.includes('homework') || text.includes('submission deadline')) {
      category = 'ASSIGNMENTS';
    } else if (text.includes('fee') || text.includes('tuition') || text.includes('installment') || text.includes('payment')) {
      category = 'FEES';
    } else if (text.includes('placement') || text.includes('internship') || text.includes('recruitment') || text.includes('job drive')) {
      category = 'PLACEMENTS';
    } else if (text.includes('scholarship') || text.includes('financial aid') || text.includes('grant')) {
      category = 'SCHOLARSHIPS';
    } else if (text.includes('hostel') || text.includes('warden') || text.includes('mess') || text.includes('room allotment')) {
      category = 'HOSTEL';
    } else if (text.includes('weather') || text.includes('emergency') || text.includes('cyclone') || text.includes('closed tomorrow')) {
      category = 'EMERGENCY';
    } else if (text.includes('symposium') || text.includes('hackathon') || text.includes('fest') || text.includes('conference')) {
      category = 'EVENTS';
    } else if (text.includes('club') || text.includes('photography') || text.includes('robotics') || text.includes('recruitment 2026')) {
      category = 'CLUBS';
    } else if (text.includes('library') || text.includes('wifi') || text.includes('laboratory') || text.includes('cafeteria')) {
      category = 'FACILITIES';
    } else if (text.includes('registrar') || text.includes('identity verification') || text.includes('portal') || text.includes('administration')) {
      category = 'ADMINISTRATION';
    } else if (text.includes('syllabus') || text.includes('lecture') || text.includes('makeup class') || text.includes('course')) {
      category = 'ACADEMICS';
    }

    // 2. Extract Deadline
    let deadline: string | undefined;
    let deadlineDate: string | undefined;
    if (text.includes('tomorrow')) {
      deadline = "Tomorrow morning";
      deadlineDate = "2026-09-30T08:40:00.000Z";
    } else if (text.includes('october 2') || text.includes('friday')) {
      deadline = "Friday, Oct 2, 2026 · 5:00 PM";
      deadlineDate = "2026-10-02T17:00:00.000Z";
    } else if (text.includes('october 3')) {
      deadline = "Saturday, Oct 3, 2026 · 6:00 PM";
      deadlineDate = "2026-10-03T18:00:00.000Z";
    } else if (text.includes('october 4') || text.includes('sunday')) {
      deadline = "Sunday, Oct 4, 2026 · 11:59 PM";
      deadlineDate = "2026-10-04T23:59:00.000Z";
    } else if (text.includes('october 5') || text.includes('monday')) {
      deadline = "Monday, Oct 5, 2026 · 5:00 PM";
      deadlineDate = "2026-10-05T17:00:00.000Z";
    } else if (text.includes('october 8')) {
      deadline = "Thursday, Oct 8, 2026 · 5:00 PM";
      deadlineDate = "2026-10-08T17:00:00.000Z";
    } else if (text.includes('october 12')) {
      deadline = "Oct 12, 2026";
      deadlineDate = "2026-10-12T23:59:00.000Z";
    }

    // 3. Extract Location
    let location: string | undefined;
    if (text.includes('block c') || text.includes('hall 204')) location = "Block C – Hall 204";
    else if (text.includes('room 114')) location = "Room 114, Administrative Block";
    else if (text.includes('gate 2')) location = "Gate 2 Bus Bay";
    else if (text.includes('tech tower') || text.includes('room 408')) location = "Tech Tower Room 408";
    else if (text.includes('sac') || text.includes('room 102')) location = "SAC Room 102";
    else if (text.includes('auditorium')) location = "Main University Auditorium";
    else if (text.includes('library')) location = "Central Library 24/7 Wing";
    else if (text.includes('hostel block')) location = "Hostel Blocks B & C";

    // 4. Calculate Priority using Priority Engine
    const evalResult = PriorityEngine.evaluate(email.subject, email.body, email.sender, deadlineDate);

    // 5. Action extraction
    let actionRequired = false;
    let action: string | undefined;

    if (evalResult.priority === 'CRITICAL' || evalResult.priority === 'HIGH' || text.includes('must submit') || text.includes('action required') || text.includes('register') || text.includes('upload')) {
      actionRequired = true;
      if (text.includes('hall changed')) {
        action = "Check updated examination hall (Block C, Hall 204) and arrive by 8:40 AM";
      } else if (text.includes('attendance shortage')) {
        action = "Submit signed attendance explanation form before Friday 5:00 PM";
      } else if (text.includes('bus route 4')) {
        action = "Board Route 4 at delayed time (7:35 AM) or use Metro Line 2 to arrive before 8:40 AM exam cutoff";
      } else if (text.includes('fee payment')) {
        action = "Pay outstanding tuition fee balance online before Oct 5 to prevent portal freeze";
      } else if (text.includes('google cloud')) {
        action = "Upload ATS-friendly resume to placement portal for Google Cloud recruitment drive";
      } else if (text.includes('assignment')) {
        action = "Submit CS304 Assignment 2 notebook on LMS before extended deadline";
      } else if (text.includes('scholarship')) {
        action = "Submit verified financial aid dossier to Room 202 before Oct 8";
      } else {
        action = `Review and complete required tasks for ${email.subject}`;
      }
    }

    // 6. Summary extraction
    let summary = email.body.split('\n').filter(l => l.trim().length > 15)[0] || email.subject;
    if (summary.length > 130) summary = summary.slice(0, 130) + '...';

    return {
      category,
      priority: evalResult.priority,
      priorityScore: evalResult.priorityScore,
      summary,
      deadline,
      actionRequired,
      action,
      eventDate: deadlineDate,
      location,
      affectedGroup: text.includes('cse') ? 'CSE Students' : 'All Students',
      urgency: evalResult.priority,
      reason: evalResult.priorityReason,
      categoryReason: evalResult.categoryReason,
      aiProvider: 'mock-fallback'
    };
  }

  public async generateBriefing(
    emails: EmailData[],
    userName: string
  ): Promise<CampusBriefingResult> {
    const critical = emails.filter(e => e.priority === 'CRITICAL');
    const high = emails.filter(e => e.priority === 'HIGH');
    const upcomingDeadlines = emails.filter(e => e.deadlineDate && e.actionRequired && !e.isActionCompleted);

    const summaryBullets = [
      {
        emoji: "🔴",
        priority: "CRITICAL" as Priority,
        title: critical[0]?.subject || "Tomorrow's Examination Hall Relocated",
        description: critical[0]?.summary || "CSE302 exam moved to Block C Hall 204. Must report by 8:40 AM.",
        emailId: critical[0]?.id
      },
      {
        emoji: "🟠",
        priority: "HIGH" as Priority,
        title: high[0]?.subject || "Attendance Shortage Notice",
        description: high[0]?.summary || "Attendance is 68.4%. Submit explanation form to Room 114 before Friday.",
        emailId: high[0]?.id
      },
      {
        emoji: "🚌",
        priority: "HIGH" as Priority,
        title: high[1]?.subject || "Bus Route 4 Delayed 20 Mins",
        description: high[1]?.summary || "Arriving at Gate 2 instead of Main Gate. Exam students advise taking Metro.",
        emailId: high[1]?.id
      },
      {
        emoji: "📅",
        priority: "MEDIUM" as Priority,
        title: "2 Upcoming Deadlines Approaching",
        description: "ML Assignment 2 due Oct 4 • Fall Tuition balance due Oct 5."
      },
      {
        emoji: "💼",
        priority: "HIGH" as Priority,
        title: "Google Cloud Internship Drive",
        description: "Registration closes Oct 3 at 6:00 PM on Career Portal."
      }
    ];

    return {
      date: "Wednesday, September 30, 2026",
      greeting: `Good morning, ${userName}`,
      studentName: userName,
      headline: `You have ${critical.length} critical alert and ${high.length} high-priority actions requiring attention today.`,
      criticalCount: critical.length,
      highCount: high.length,
      upcomingDeadlinesCount: upcomingDeadlines.length,
      academicUpdatesCount: emails.filter(e => e.category === 'ACADEMICS').length,
      summaryBullets,
      motivationalNote: "Stay focused on your morning preparation. Review your hall ticket and allow extra commute time for Gate 2.",
      aiProvider: 'mock-fallback'
    };
  }

  public async answerCampusQuery(
    query: string,
    contextEmails: EmailData[],
    actions: ActionItem[]
  ): Promise<AssistantQueryResult> {
    const q = query.toLowerCase();

    if (q.includes('what do i need to do') || q.includes('urgent') || q.includes('today')) {
      const urgentActions = actions.filter(a => a.priority === 'CRITICAL' || a.priority === 'HIGH');
      const actionBullets = urgentActions.map(a => `• **${a.title}** (${a.priority}) — Deadline: ${a.deadline || 'Today'}`).join('\n');
      return {
        answer: `Here are the top actions that require your immediate attention today:\n\n${actionBullets}\n\nWould you like me to open the details for the exam hall change or attendance notice?`,
        suggestedActions: ["Open Exam Hall Email", "Submit Attendance Form", "Check Bus Route 4"],
        referencedEmailIds: ["email-001", "email-002", "email-003"],
        toolUsed: "getUrgentMessages()"
      };
    }

    if (q.includes('exam') || q.includes('next exam')) {
      return {
        answer: `**Next Scheduled Examination:**\n\n• **Course:** CS302 Database Management Systems\n• **Date & Time:** Tomorrow, Sept 30 at 9:00 AM\n• **Relocated Venue:** **Block C, Hall 204** (Moved from Block A)\n• **Admit Card:** Bring printed admit card with hologram and non-programmable calculator.\n• **Cutoff:** Report by 8:40 AM.`,
        suggestedActions: ["View Seating Plan", "Open in Google Maps", "View Admit Card Rules"],
        referencedEmailIds: ["email-001", "email-011", "email-012"],
        toolUsed: "getUpcomingExams()"
      };
    }

    if (q.includes('attendance')) {
      return {
        answer: `**Attendance Warning Summary:**\n\n• **Status:** Shortage detected in CS301 (Data Structures) & CS303 (Computer Architecture) at **68.4%** (Threshold is 75%).\n• **Debarment Risk:** Yes, unless condonation explanation is filed.\n• **Action Required:** Download form from ERP, get counselor endorsement, and submit to **Room 114 Admin Block** before **Friday, Oct 2 at 5:00 PM**.`,
        suggestedActions: ["Download Condonation Form", "Contact Counselor", "View Shortage Email"],
        referencedEmailIds: ["email-002"],
        toolUsed: "getAttendanceAlerts()"
      };
    }

    if (q.includes('transport') || q.includes('bus')) {
      return {
        answer: `**Campus Transport Advisory:**\n\n• **Bus Route 4:** Delayed by 20 minutes tomorrow morning due to hydraulic repair.\n• **Pickup:** 7:35 AM at Maple Cross (instead of 7:15 AM).\n• **Drop-off Point:** **Gate 2 Bus Bay** (instead of Main Gate).\n• **Recommendation:** If you have the 9:00 AM exam, take Metro Line 2 or Route 2B to avoid arriving past the 8:40 AM cutoff.`,
        suggestedActions: ["Check Route 2B Schedule", "View Gate 2 on Campus Map"],
        referencedEmailIds: ["email-003"],
        toolUsed: "getTransportUpdates()"
      };
    }

    if (q.includes('deadline') || q.includes('week')) {
      return {
        answer: `**Upcoming Deadlines This Week:**\n\n1. **CSE302 Exam Report:** Tomorrow, 8:40 AM at Block C Hall 204\n2. **Attendance Explanation Submission:** Friday, Oct 2 at 5:00 PM (Room 114)\n3. **Google Cloud Internship Drive Registration:** Saturday, Oct 3 at 6:00 PM\n4. **CS304 ML Assignment 2:** Sunday, Oct 4 at 11:59 PM (Extended)\n5. **Tuition Fee 2nd Installment:** Monday, Oct 5 at 5:00 PM ($100 late surcharge after)`,
        suggestedActions: ["View All Actions", "Export to Calendar"],
        referencedEmailIds: ["email-001", "email-002", "email-013", "email-004", "email-006"],
        toolUsed: "getTodayDeadlines()"
      };
    }

    if (q.includes('changed') || q.includes('what changed')) {
      return {
        answer: `**Key University Schedule & Logistics Changes:**\n\n⚠️ **Examination Venue:** Tomorrow's CSE302 exam moved from **Block A Main Hall** to **Block C Hall 204**.\n⚠️ **Transport Drop-off:** Route 4 bus will drop passengers at **Gate 2** instead of the Main Gate.\n⚠️ **Coursework Extension:** CS304 Assignment 2 deadline extended from Sept 29 to **Sunday, Oct 4, 11:59 PM**.\n⚠️ **Library Hours:** Central Library extended to **24/7 hours** with overnight study café.`,
        suggestedActions: ["Open Venue Change Notice", "View Updated Deadlines"],
        referencedEmailIds: ["email-001", "email-003", "email-004", "email-009"],
        toolUsed: "searchUniversityMessages('changed')"
      };
    }

    // Default search across indexed emails
    const matches = contextEmails.filter(e => 
      e.subject.toLowerCase().includes(q) || 
      e.body.toLowerCase().includes(q) || 
      e.category.toLowerCase().includes(q)
    ).slice(0, 3);

    if (matches.length > 0) {
      const matchText = matches.map(m => `• **${m.subject}** (${m.category}, ${m.priority})\n  ${m.summary}`).join('\n\n');
      return {
        answer: `I found ${matches.length} matching communications in your university inbox:\n\n${matchText}`,
        suggestedActions: matches.map(m => `Open: ${m.subject.slice(0, 25)}...`),
        referencedEmailIds: matches.map(m => m.id),
        toolUsed: "searchUniversityMessages()"
      };
    }

    return {
      answer: "I couldn't find that specific information in your indexed university communications. Try asking about exams, attendance warnings, bus schedules, or upcoming deadlines.",
      suggestedActions: ["What do I need to do today?", "When is my next exam?", "Are there transport delays?"],
      referencedEmailIds: []
    };
  }
}
