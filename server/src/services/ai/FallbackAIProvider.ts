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

    // 1. Detect SRM AP Category
    let category: Category = 'GENERAL';
    if (text.includes('exam') || text.includes('mid-semester') || text.includes('hall ticket') || text.includes('cse 204') || text.includes('algorithms exam')) {
      category = 'EXAMS';
    } else if (text.includes('attendance') || text.includes('condonation') || text.includes('shortage')) {
      category = 'ATTENDANCE';
    } else if (text.includes('acm') || text.includes('student chapter') || text.includes('recruitment 2026') || text.includes('clubs')) {
      category = 'STUDENT CLUBS';
    } else if (text.includes('startup wars') || text.includes('ecell') || text.includes('cel') || text.includes('entrepreneurship') || text.includes('hatchlab')) {
      category = 'ENTREPRENEURSHIP';
    } else if (text.includes('google solution hunt') || text.includes('hackathon') || text.includes('gdg')) {
      category = 'HACKATHONS';
    } else if (text.includes('robotics') || text.includes('techfest') || text.includes('workshop')) {
      category = 'EVENTS';
    } else if (text.includes('bus') || text.includes('transport') || text.includes('shuttle') || text.includes('route') || text.includes('gate bay 2')) {
      category = 'TRANSPORT';
    } else if (text.includes('fee') || text.includes('tuition') || text.includes('feepay')) {
      category = 'FEES';
    } else if (text.includes('compensatory') || text.includes('closure') || text.includes('circular') || text.includes('registrar')) {
      category = 'ADMINISTRATION';
    } else if (text.includes('weather') || text.includes('cyclone') || text.includes('emergency') || text.includes('red alert')) {
      category = 'EMERGENCY';
    } else if (text.includes('library') || text.includes('reading room')) {
      category = 'LIBRARY';
    } else if (text.includes('hostel') || text.includes('ganga') || text.includes('yamuna') || text.includes('warden')) {
      category = 'HOSTEL';
    } else if (text.includes('scholarship') || text.includes('financial aid')) {
      category = 'SCHOLARSHIPS';
    } else if (text.includes('timetable') || text.includes('friday timetable')) {
      category = 'TIMETABLE';
    } else if (text.includes('elective') || text.includes('course registration')) {
      category = 'COURSE REGISTRATION';
    } else if (text.includes('lab record') || text.includes('assignment')) {
      category = 'ASSIGNMENTS';
    } else if (text.includes('tutorial') || text.includes('lecture') || text.includes('discrete mathematics') || text.includes('seas')) {
      category = 'ACADEMICS';
    }

    // 2. Extract Deadline
    let deadline: string | undefined;
    let deadlineDate: string | undefined;
    if (text.includes('tomorrow') && (text.includes('8:40 am') || text.includes('exam'))) {
      deadline = "Tomorrow, 8:40 AM";
      deadlineDate = "2026-09-30T08:40:00.000Z";
    } else if (text.includes('september 30') || text.includes('sept 30')) {
      deadline = "Wednesday, Sep 30, 2026 · 11:59 PM";
      deadlineDate = "2026-09-30T23:59:00.000Z";
    } else if (text.includes('october 2') || text.includes('friday')) {
      deadline = "Friday, Oct 2, 2026 · 5:00 PM";
      deadlineDate = "2026-10-02T17:00:00.000Z";
    } else if (text.includes('october 4')) {
      deadline = "Sunday, Oct 4, 2026 · 11:59 PM";
      deadlineDate = "2026-10-04T23:59:00.000Z";
    } else if (text.includes('october 5')) {
      deadline = "Monday, Oct 5, 2026 · 5:00 PM";
      deadlineDate = "2026-10-05T17:00:00.000Z";
    } else if (text.includes('october 10')) {
      deadline = "Saturday, Oct 10, 2026";
      deadlineDate = "2026-10-10T08:30:00.000Z";
    } else if (text.includes('12:00 pm today')) {
      deadline = "Today, 12:00 PM";
      deadlineDate = "2026-09-29T12:00:00.000Z";
    }

    // 3. Extract Verified SRM AP Location
    let location: string | undefined;
    if (text.includes('s202') || text.includes('sr block')) location = "S202, SR Block";
    else if (text.includes('x-lab')) location = "X-Lab Auditorium, Neerukonda";
    else if (text.includes('room 114') || text.includes('administrative block')) location = "Room 114, Administrative Block";
    else if (text.includes('main gate bay 2') || text.includes('gate 2')) location = "Main Gate Bay 2, Neerukonda";
    else if (text.includes('directorate of entrepreneurship')) location = "Directorate of Entrepreneurship, Admin Block";
    else if (text.includes('acm lab') || text.includes('acm hub')) location = "ACM Hub, SR Block";
    else if (text.includes('central library')) location = "Central Library, Neerukonda";
    else if (text.includes('ganga') || text.includes('yamuna')) location = "Ganga & Yamuna Hostel Blocks";
    else location = "Neerukonda Campus Grounds";

    // 4. Calculate Priority using Priority Engine
    const evalResult = PriorityEngine.evaluate(email.subject, email.body, email.sender, deadlineDate);

    // 5. Action extraction
    let actionRequired = false;
    let action: string | undefined;

    if (evalResult.priority === 'CRITICAL' || evalResult.priority === 'HIGH' || text.includes('must submit') || text.includes('action required') || text.includes('apply now') || text.includes('compensatory')) {
      actionRequired = true;
      if (text.includes('exam') && (text.includes('venue') || text.includes('shifted'))) {
        action = "Report to Room S202 SR Block by 8:40 AM for CSE 204 Algorithms exam";
      } else if (text.includes('attendance shortage')) {
        action = "Submit signed attendance condonation form to Room 114 before Friday 5:00 PM";
      } else if (text.includes('compensatory working day')) {
        action = "Note compensatory working day on Saturday, October 10 (Friday timetable applies)";
      } else if (text.includes('cel') && text.includes('mentor review')) {
        action = "Upload pitch deck before 12:00 PM; report to Directorate by 3:50 PM for mentor review";
      } else if (text.includes('robotics')) {
        action = "Report to Room S202 SR Block by 9:45 AM tomorrow with laptop for Techfest workshop";
      } else if (text.includes('acm')) {
        action = "Submit ACM Student Chapter application before tomorrow 11:59 PM";
      } else if (text.includes('route 5') || text.includes('bus')) {
        action = "Board bus at 7:25 AM (-15m earlier) via Mangalagiri Bypass to arrive on time";
      } else if (text.includes('fee payment')) {
        action = "Pay semester fee balance on fees.srmap.edu.in before Oct 5";
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
      affectedGroup: "SEAS CSE Semester 3 Students",
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
        title: critical[0]?.subject || "Tomorrow's CSE 204 Exam Venue Moved to S202 SR Block",
        description: critical[0]?.summary || "CSE 204 exam moved to S202 SR Block. Report by 8:40 AM with ID card.",
        emailId: critical[0]?.id
      },
      {
        emoji: "🟠",
        priority: "HIGH" as Priority,
        title: high[0]?.subject || "Attendance Shortage Notice (CSE 204 & 207)",
        description: high[0]?.summary || "Attendance is 68.2%. Submit condonation form to Room 114 before Friday 5 PM.",
        emailId: high[0]?.id
      },
      {
        emoji: "🤖",
        priority: "HIGH" as Priority,
        title: "Hands-On Robotics Workshop (Techfest IIT Bombay)",
        description: "Tomorrow 10 AM – 4 PM at S202, SR Block. Bring laptop with ROS.",
        emailId: "email-srm-002"
      },
      {
        emoji: "🚌",
        priority: "HIGH" as Priority,
        title: "Vijayawada & Guntur Buses Delayed 15 Mins",
        description: "Buses diverted via Mangalagiri Bypass; drop-off relocated to Main Gate Bay 2.",
        emailId: "email-srm-009"
      },
      {
        emoji: "🚀",
        priority: "MEDIUM" as Priority,
        title: "ACM Chapter Recruitment Closes Tomorrow",
        description: "Online applications for R&D, Events, and PR teams close Sept 30 at 11:59 PM."
      }
    ];

    return {
      date: "Wednesday, September 30, 2026",
      greeting: `Good morning, ${userName}`,
      studentName: userName,
      headline: `You have ${critical.length} critical alert and ${high.length} high-priority actions requiring attention at SRM University-AP today.`,
      criticalCount: critical.length,
      highCount: high.length,
      upcomingDeadlinesCount: upcomingDeadlines.length,
      academicUpdatesCount: emails.filter(e => e.category === 'ACADEMICS').length,
      summaryBullets,
      motivationalNote: "Focus on your morning algorithms preparation. Remember to verify your hall ticket and carry your student ID to SR Block.",
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
        answer: `Here are your top action items requiring attention at SRM AP today:\n\n${actionBullets}\n\nWould you like me to open the details for the CSE 204 exam venue change or attendance notice?`,
        suggestedActions: ["Open CSE 204 Exam Notice", "Submit Attendance Form", "Check Bus Route 5 & 8"],
        referencedEmailIds: ["email-srm-003", "email-srm-004", "email-srm-009"],
        toolUsed: "getUrgentMessages()"
      };
    }

    if (q.includes('exam') || q.includes('next exam') || q.includes('algorithms') || q.includes('cse 204')) {
      return {
        answer: `**Next Scheduled Examination at SRM University-AP:**\n\n• **Course:** CSE 204 (Design and Analysis of Algorithms)\n• **Date & Time:** Tomorrow, Sept 30 at 9:00 AM\n• **Relocated Venue:** **Room S202, SR Block** (Moved from Central Hall)\n• **Mandatory Requirement:** Bring physical SRM AP Student ID Card and Hall Ticket barcode sheet.\n• **Reporting Cutoff:** **8:40 AM sharp**.`,
        suggestedActions: ["View Notice in Email", "Open S202 in Google Maps", "View Exam Guidelines"],
        referencedEmailIds: ["email-srm-003"],
        toolUsed: "getUpcomingExams()"
      };
    }

    if (q.includes('attendance') || q.includes('debarment') || q.includes('condonation')) {
      return {
        answer: `**Attendance Warning Summary (SEAS):**\n\n• **Shortage Detected:** CSE 204 (Algorithms) at **68.2%** & CSE 207 (Digital Electronics) at **69.4%** (University threshold is 75.0%).\n• **Consequence:** Debarment from End-Semester examinations unless condonation is submitted.\n• **Action Required:** Download form from ERP, get Faculty Advisor endorsement, and submit to **Room 114, Administrative Block** before **Friday, Oct 2 at 5:00 PM**.`,
        suggestedActions: ["Download Condonation Form", "Contact Faculty Advisor", "View Notice Details"],
        referencedEmailIds: ["email-srm-004"],
        toolUsed: "getAttendanceAlerts()"
      };
    }

    if (q.includes('bus') || q.includes('transport') || q.includes('shuttle') || q.includes('mangalagiri') || q.includes('vijayawada')) {
      return {
        answer: `**SRM AP Transport Advisory:**\n\n• **Routes 5 & 8:** Diverted via Mangalagiri Highway due to culvert repairs on the Neerukonda approach road.\n• **Timing Adjustment:** Departs **7:25 AM** (15 minutes earlier than usual) to arrive at campus by 8:40 AM.\n• **Drop-off Point:** **Main Gate Bay 2** (instead of Academic Quadrangle).\n• **Recommendation:** Day scholars taking 9:00 AM exams must board at 7:25 AM to avoid missing the 8:40 AM exam cutoff.`,
        suggestedActions: ["Check Route 5 Schedule", "View Gate Bay 2 on Map"],
        referencedEmailIds: ["email-srm-009"],
        toolUsed: "getTransportUpdates()"
      };
    }

    if (q.includes('acm') || q.includes('recruitment') || q.includes('club')) {
      return {
        answer: `**ACM Student Chapter Recruitment 2026:**\n\n• **Teams Open:** Research & Development, Hackathons & Events, Social Media, PR/Sponsorship, Documentation.\n• **Eligibility:** Open to all SEAS students and years.\n• **Deadline:** **Wednesday, September 30, 2026, 11:59 PM**.\n• **Interviews:** Conducted in the **ACM Hub, SR Block** over the weekend.\n• **Link:** \`forms.srmap.edu.in/acm-recruitment-2026\``,
        suggestedActions: ["Open ACM Email Notice", "Fill Application Form"],
        referencedEmailIds: ["email-srm-005"],
        toolUsed: "searchUniversityMessages('acm')"
      };
    }

    if (q.includes('changed') || q.includes('what changed')) {
      return {
        answer: `**Key SRM University-AP Logistics & Schedule Changes:**\n\n⚠️ **Examination Venue:** Tomorrow's CSE 204 Algorithms exam relocated from Central Hall to **Room S202, SR Block**.\n⚠️ **University Calendar:** Friday, Sept 25 was closed due to rain; **Saturday, October 10** is designated as a mandatory **compensatory working day** following Friday's timetable.\n⚠️ **STARTUP WARS:** Originally scheduled for Sept 21 has been **postponed** by E-Cell; revised pitching dates will be notified soon.\n⚠️ **Bus Drop-off & Departure:** Routes 5 & 8 departing **15 mins earlier (7:25 AM)** via Mangalagiri Bypass to drop students at **Main Gate Bay 2**.`,
        suggestedActions: ["View Venue Change", "View Working Day Circular", "View STARTUP WARS Notice"],
        referencedEmailIds: ["email-srm-003", "email-srm-001", "email-srm-006", "email-srm-009"],
        toolUsed: "searchUniversityMessages('changed')"
      };
    }

    if (q.includes('robotics') || q.includes('workshop') || q.includes('techfest')) {
      return {
        answer: `**Hands-On Workshop on Robotics (Techfest IIT Bombay Collaboration):**\n\n• **Date & Time:** Wednesday, September 30, 2026 | 10:00 AM – 4:00 PM\n• **Venue:** **Room S202, SR Block**, SRM University-AP\n• **Faculty Lead:** Dr. Teja Krishna Mamidi, Dept of Mechanical Engineering\n• **Certification:** Co-branded by SRM University-AP & Techfest, IIT Bombay\n• **Requirement:** Bring personal laptop with Ubuntu or VirtualBox pre-installed.`,
        suggestedActions: ["Open Robotics Notice", "View SR Block on Map"],
        referencedEmailIds: ["email-srm-002"],
        toolUsed: "searchUniversityMessages('robotics')"
      };
    }

    // Default search
    const matches = contextEmails.filter(e => 
      e.subject.toLowerCase().includes(q) || 
      e.body.toLowerCase().includes(q) || 
      e.category.toLowerCase().includes(q)
    ).slice(0, 3);

    if (matches.length > 0) {
      const matchText = matches.map(m => `• **${m.subject}** (${m.category}, ${m.priority})\n  ${m.summary}`).join('\n\n');
      return {
        answer: `I found ${matches.length} matching communications in your SRM AP inbox:\n\n${matchText}`,
        suggestedActions: matches.map(m => `Open: ${m.subject.slice(0, 25)}...`),
        referencedEmailIds: matches.map(m => m.id),
        toolUsed: "searchUniversityMessages()"
      };
    }

    return {
      answer: "I couldn't find that specific information in your SRM University-AP communications. Try asking about the CSE 204 exam venue, attendance condonation, bus route diversions, or the ACM recruitment deadline.",
      suggestedActions: ["What do I need to do today?", "When is my next exam?", "Are buses delayed?"],
      referencedEmailIds: []
    };
  }
}
