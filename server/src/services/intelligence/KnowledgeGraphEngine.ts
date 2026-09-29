import { DatabaseService } from '../../db/DatabaseService';
import { 
  KnowledgeGraphData, 
  KnowledgeGraphNode, 
  KnowledgeGraphEdge 
} from '../../types';

export class KnowledgeGraphEngine {
  private static instance: KnowledgeGraphEngine;

  private constructor() {}

  public static getInstance(): KnowledgeGraphEngine {
    if (!KnowledgeGraphEngine.instance) {
      KnowledgeGraphEngine.instance = new KnowledgeGraphEngine();
    }
    return KnowledgeGraphEngine.instance;
  }

  public getGraphData(): KnowledgeGraphData {
    const db = DatabaseService.getInstance();
    const emails = db.getEmails();
    const courses = db.getClassroomCourses();
    const coursework = db.getClassroomCoursework();
    const announcements = db.getClassroomAnnouncements();
    const calEvents = db.getCalendarEvents();
    const actions = db.getActions();

    const nodes: KnowledgeGraphNode[] = [];
    const edges: KnowledgeGraphEdge[] = [];

    // 1. Root Pulse Node
    nodes.push({
      id: 'node-campuspulse',
      label: 'CampusPulse AI Intelligence Hub',
      type: 'TOPIC',
      source: 'system',
      category: 'ADMINISTRATION',
      priority: 'CRITICAL',
      details: {
        description: 'Central semantic intelligence layer unifying cross-system student data.'
      }
    });

    // 2. Course Nodes
    for (const course of courses) {
      nodes.push({
        id: `node-course-${course.id}`,
        label: course.name,
        type: 'COURSE',
        source: 'classroom',
        sourceId: course.id,
        category: 'ACADEMICS',
        details: {
          room: course.room,
          teacher: course.teacherName,
          section: course.section
        }
      });

      edges.push({
        id: `edge-root-course-${course.id}`,
        source: 'node-campuspulse',
        target: `node-course-${course.id}`,
        label: 'Monitors Academic Course',
        type: 'CONTAINS'
      });
    }

    // 3. Classroom Coursework Nodes & Edges
    for (const work of coursework) {
      const workNodeId = `node-work-${work.id}`;
      nodes.push({
        id: workNodeId,
        label: work.title,
        type: 'CLASSROOM',
        source: 'classroom',
        sourceId: work.id,
        category: 'ASSIGNMENTS',
        priority: work.priority,
        timestamp: work.dueDate,
        details: {
          dueDate: work.dueDate,
          dueTime: work.dueTime,
          maxPoints: work.maxPoints,
          status: work.submissionStatus
        }
      });

      edges.push({
        id: `edge-course-work-${work.id}`,
        source: `node-course-${work.courseId}`,
        target: workNodeId,
        label: 'Evaluates Coursework',
        type: 'CONTAINS'
      });

      // Deadline node
      if (work.dueDate) {
        const dlNodeId = `node-dl-${work.id}`;
        nodes.push({
          id: dlNodeId,
          label: `Due: ${work.dueDate} ${work.dueTime || ''}`,
          type: 'DEADLINE',
          source: 'classroom',
          sourceId: work.id,
          priority: work.priority,
          timestamp: work.dueDate
        });

        edges.push({
          id: `edge-work-dl-${work.id}`,
          source: workNodeId,
          target: dlNodeId,
          label: 'Submission Cutoff',
          type: 'HAS_DEADLINE'
        });
      }
    }

    // 4. Classroom Announcement Nodes
    for (const ann of announcements) {
      const annNodeId = `node-ann-${ann.id}`;
      nodes.push({
        id: annNodeId,
        label: `${ann.courseName} Announcement`,
        type: 'ANNOUNCEMENT',
        source: 'classroom',
        sourceId: ann.id,
        category: 'ACADEMICS',
        timestamp: ann.creationTime,
        details: {
          text: ann.text,
          creator: ann.creatorName
        }
      });

      edges.push({
        id: `edge-course-ann-${ann.id}`,
        source: `node-course-${ann.courseId}`,
        target: annNodeId,
        label: 'Course Bulletin',
        type: 'CONTAINS'
      });
    }

    // 5. Calendar Event Nodes
    for (const cal of calEvents) {
      const calNodeId = `node-cal-${cal.id}`;
      nodes.push({
        id: calNodeId,
        label: cal.title,
        type: 'CALENDAR',
        source: 'calendar',
        sourceId: cal.id,
        timestamp: cal.startTime,
        details: {
          startTime: cal.startTime,
          endTime: cal.endTime,
          location: cal.location
        }
      });

      edges.push({
        id: `edge-root-cal-${cal.id}`,
        source: 'node-campuspulse',
        target: calNodeId,
        label: 'Synchronized Schedule',
        type: 'SCHEDULED_IN'
      });
    }

    // 6. Selected Key Emails & Cross-System Links
    // Focus on key clusters: Robotics, CSE 213, CSE 204, Rain Closure, Terrathon
    const featuredEmails = emails.slice(0, 15);
    for (const email of featuredEmails) {
      const emailNodeId = `node-email-${email.id}`;
      nodes.push({
        id: emailNodeId,
        label: email.subject.slice(0, 40) + '...',
        type: 'GMAIL',
        source: 'gmail',
        sourceId: email.id,
        category: email.category,
        priority: email.priority,
        timestamp: email.timestamp,
        details: {
          sender: email.senderName,
          summary: email.summary,
          location: email.location
        }
      });

      // Link to course if applicable
      if (email.subject.includes('CSE 213') || email.body.includes('CSE 213')) {
        edges.push({
          id: `edge-email-cse213-${email.id}`,
          source: `node-course-srm-course-213`,
          target: emailNodeId,
          label: 'Course Communication',
          type: 'ANNOUNCED_BY'
        });
      } else if (email.subject.includes('CSE 204') || email.body.includes('CSE 204')) {
        edges.push({
          id: `edge-email-cse204-${email.id}`,
          source: `node-course-srm-course-204`,
          target: emailNodeId,
          label: 'Exam Notice',
          type: 'ANNOUNCED_BY'
        });
      } else {
        edges.push({
          id: `edge-root-email-${email.id}`,
          source: 'node-campuspulse',
          target: emailNodeId,
          label: 'Classified Notice',
          type: 'ANNOUNCED_BY'
        });
      }

      // If email has calendar event link
      const matchingCal = calEvents.find(c => 
        (email.subject.toLowerCase().includes('robotics') && c.title.toLowerCase().includes('robotics')) ||
        (email.subject.toLowerCase().includes('terrathon') && c.title.toLowerCase().includes('terrathon'))
      );
      if (matchingCal) {
        edges.push({
          id: `edge-email-cal-${email.id}-${matchingCal.id}`,
          source: emailNodeId,
          target: `node-cal-${matchingCal.id}`,
          label: 'Calendar Bridge',
          type: 'SYNCS_TO'
        });
      }
    }

    // 7. Action Nodes & Edges
    const featuredActions = actions.slice(0, 10);
    for (const act of featuredActions) {
      const actNodeId = `node-act-${act.id}`;
      nodes.push({
        id: actNodeId,
        label: act.title,
        type: 'ACTION',
        source: 'action',
        sourceId: act.id,
        category: act.category,
        priority: act.priority,
        timestamp: act.deadline,
        details: {
          deadline: act.deadline,
          completed: act.completed,
          location: act.location
        }
      });

      // Link to source email if present
      const sourceEmailNode = nodes.find(n => n.sourceId === act.emailId);
      if (sourceEmailNode) {
        edges.push({
          id: `edge-email-act-${act.id}`,
          source: sourceEmailNode.id,
          target: actNodeId,
          label: 'Requires Action',
          type: 'TRIGGERS_ACTION'
        });
      } else {
        edges.push({
          id: `edge-root-act-${act.id}`,
          source: 'node-campuspulse',
          target: actNodeId,
          label: 'Action Item',
          type: 'TRIGGERS_ACTION'
        });
      }
    }

    return {
      nodes,
      edges,
      summary: {
        totalNodes: nodes.length,
        totalEdges: edges.length,
        courseCount: courses.length,
        emailCount: featuredEmails.length,
        classroomCount: coursework.length + announcements.length,
        calendarCount: calEvents.length,
        actionCount: featuredActions.length
      }
    };
  }
}
