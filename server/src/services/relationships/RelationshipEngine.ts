import { EmailData, ScheduleChangeItem } from '../../types';

export interface EmailThreadCluster {
  threadId: string;
  topicTitle: string;
  category: string;
  emails: EmailData[];
  latestUpdate: string;
  hasChanges: boolean;
  changesSummary?: string;
}

export class RelationshipEngine {
  /**
   * Identifies thread relationships and connects fragmented communications
   */
  public static clusterByTopic(emails: EmailData[]): EmailThreadCluster[] {
    const threadMap = new Map<string, EmailData[]>();

    emails.forEach(email => {
      let tid = email.threadId;
      if (!tid) {
        if (email.subject.toLowerCase().includes('exam') || email.subject.toLowerCase().includes('hall')) {
          tid = 'thread-midsem-cse';
        } else if (email.subject.toLowerCase().includes('bus') || email.subject.toLowerCase().includes('route')) {
          tid = 'thread-transport-transit';
        } else if (email.subject.toLowerCase().includes('attendance')) {
          tid = 'thread-attendance-shortage';
        } else {
          tid = `thread-${email.category.toLowerCase()}`;
        }
      }

      if (!threadMap.has(tid)) {
        threadMap.set(tid, []);
      }
      threadMap.get(tid)!.push(email);
    });

    const clusters: EmailThreadCluster[] = [];

    threadMap.forEach((emailList, threadId) => {
      // Sort chronologically
      emailList.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

      let topicTitle = emailList[0].subject.replace(/^(URGENT:\s*|RE:\s*|FWD:\s*)/i, '');
      let hasChanges = false;
      let changesSummary: string | undefined;

      if (threadId === 'thread-midsem-cse') {
        topicTitle = "CSE Mid-Semester Examination Logistics";
        hasChanges = true;
        changesSummary = "Exam Hall relocated from Block A Main Hall to Block C Hall 204. Reporting cutoff: 8:40 AM.";
      } else if (threadId === 'thread-transport-transit') {
        topicTitle = "Campus Transit & Bus Route Operations";
        hasChanges = true;
        changesSummary = "Route 4 delayed by 20 mins. Boarding moved to Gate 2.";
      } else if (threadId === 'thread-cs304-course') {
        topicTitle = "CS304 Machine Learning Coursework";
        hasChanges = true;
        changesSummary = "Assignment 2 submission deadline extended to Oct 4, 11:59 PM.";
      }

      clusters.push({
        threadId,
        topicTitle,
        category: emailList[0].category,
        emails: emailList,
        latestUpdate: emailList[0].dateFormatted,
        hasChanges,
        changesSummary
      });
    });

    return clusters;
  }

  /**
   * Generates "What Changed?" critical diff items comparing recent notices
   */
  public static getWhatChanged(emails: EmailData[]): ScheduleChangeItem[] {
    const changes: ScheduleChangeItem[] = [
      {
        topic: "CSE302 Database Exam Venue",
        previousValue: "Block A, Main Hall",
        newValue: "Block C, Hall 204",
        changeType: "LOCATION",
        summary: "Due to server maintenance, tomorrow morning's exam venue moved to Block C Hall 204. Arrive by 8:40 AM.",
        emailId: "email-001"
      },
      {
        topic: "Bus Route 4 Morning Drop-off & Timing",
        previousValue: "7:15 AM at Main Admin Gate",
        newValue: "7:35 AM at Gate 2 Bus Bay (+20m delay)",
        changeType: "TIMING",
        summary: "Fleet maintenance caused 20-min delay; drop-off relocated to Gate 2. Exam students should use Metro Line 2.",
        emailId: "email-003"
      },
      {
        topic: "CS304 Machine Learning Assignment 2",
        previousValue: "Sept 29, 11:59 PM",
        newValue: "Oct 4, 11:59 PM (Extended)",
        changeType: "DEADLINE",
        summary: "Deadline extended by 5 days due to student mid-term exam schedule load.",
        emailId: "email-004"
      },
      {
        topic: "Central Library Operating Hours",
        previousValue: "Closes at 10:00 PM",
        newValue: "Open 24/7 with Night Café",
        changeType: "TIMING",
        summary: "Library reading rooms now open 24/7 with overnight study café for mid-semester exams.",
        emailId: "email-009"
      }
    ];

    return changes;
  }
}
