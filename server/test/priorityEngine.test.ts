import { test, describe } from 'node:test';
import assert from 'node:assert';
import { PriorityEngine } from '../src/services/priority/PriorityEngine';
import { UniversityFilter } from '../src/services/filter/UniversityFilter';
import { ActionExtractor } from '../src/services/actions/ActionExtractor';
import { FallbackAIProvider } from '../src/services/ai/FallbackAIProvider';
import { RelationshipEngine } from '../src/services/relationships/RelationshipEngine';
import { EmailData } from '../src/types';

describe('PriorityEngine Tests — SRM AP Scenarios', () => {
  test('evaluates urgent exam venue change to S202 SR Block as CRITICAL', () => {
    const result = PriorityEngine.evaluate(
      'URGENT: Examination Venue Changed for CSE 204 Tomorrow',
      'The CSE 204 Design and Analysis of Algorithms examination has been shifted to S202, SR Block due to technical lab setup. Report by 09:30 AM with physical Hall Ticket.',
      'hod.cse@srmap.edu.in',
      '2026-09-30T10:00:00.000Z'
    );

    assert.strictEqual(result.priority, 'CRITICAL');
    assert.ok(result.priorityScore >= 90);
    assert.ok(result.priorityReason.includes('examination hall') || result.priorityReason.includes('venue'));
  });

  test('evaluates university rain closure circular as CRITICAL', () => {
    const result = PriorityEngine.evaluate(
      'CIRCULAR: University Closure on September 25 due to Heavy Rainfall',
      'University is closed today due to waterlogging and severe weather across Mangalagiri. Classes cancelled. October 10 is compensatory working day.',
      'registrar.office@srmap.edu.in',
      '2026-09-25T08:00:00.000Z'
    );

    assert.strictEqual(result.priority, 'CRITICAL');
    assert.ok(result.priorityScore >= 95);
    assert.ok(result.priorityReason.toLowerCase().includes('closure'));
  });

  test('evaluates attendance shortage warning as HIGH priority', () => {
    const result = PriorityEngine.evaluate(
      'Attendance Shortage Warning – CSE 204 & CSE 207',
      'Your attendance is below 75% in CSE 207 (68%). Submit medical condonation form to Room 114 before Friday or face semester debarment.',
      'dean.seas@srmap.edu.in',
      '2026-10-02T17:00:00.000Z'
    );

    assert.strictEqual(result.priority, 'HIGH');
    assert.ok(result.priorityScore >= 75);
    assert.ok(result.priorityReason.toLowerCase().includes('attendance'));
  });

  test('evaluates ACM recruitment deadline as MEDIUM priority with actionable deadline', () => {
    const result = PriorityEngine.evaluate(
      'ACM Student Chapter Recruitment 2026 — Applications Open',
      'Join R&D, Events, PR & Sponsorship, and Social Media teams. Apply before September 30 deadline.',
      'acm.core@srmap.edu.in',
      '2026-09-30T23:59:00.000Z'
    );

    assert.strictEqual(result.priority, 'MEDIUM');
    assert.ok(result.priorityScore >= 50);
  });

  test('evaluates monthly general newsletter as LOW priority', () => {
    const result = PriorityEngine.evaluate(
      'SRM AP Campus Newsletter — September Edition',
      'Read about research grants and cultural highlights at SRM University-AP in the September issue.',
      'communications@srmap.edu.in'
    );

    assert.strictEqual(result.priority, 'LOW');
    assert.ok(result.priorityScore <= 35);
  });
});

describe('UniversityFilter Tests — SRM AP Domain Security Policy', () => {
  test('allows official SRM AP institutional email addresses', () => {
    assert.strictEqual(UniversityFilter.isUniversityEmail('communications@srmap.edu.in'), true);
    assert.strictEqual(UniversityFilter.isUniversityEmail('registrar.office@srmap.edu.in'), true);
    assert.strictEqual(UniversityFilter.isUniversityEmail('ecell@srmap.edu.in'), true);
    assert.strictEqual(UniversityFilter.isUniversityEmail('cel@srmap.edu.in'), true);
    assert.strictEqual(UniversityFilter.isUniversityEmail('acm.core@srmap.edu.in'), true);
    assert.strictEqual(UniversityFilter.isUniversityEmail('dean.seas@srmap.edu.in'), true);
    assert.strictEqual(UniversityFilter.isUniversityEmail('hod.cse@srmap.edu.in'), true);
    assert.strictEqual(UniversityFilter.isUniversityEmail('demo.student@srmap.edu.in'), true);
  });

  test('rejects external commercial and promotional noise', () => {
    assert.strictEqual(UniversityFilter.isUniversityEmail('orders@amazon.in'), false);
    assert.strictEqual(UniversityFilter.isUniversityEmail('notifications@instagram.com'), false);
    assert.strictEqual(UniversityFilter.isUniversityEmail('promo@edutech-deals.com'), false);
    assert.strictEqual(UniversityFilter.isUniversityEmail('marketing@commercial-bank.com'), false);
  });
});

describe('ActionExtractor Tests', () => {
  test('extracts actionable tasks with deadlines for SRM AP student', () => {
    const mockEmails: EmailData[] = [
      {
        id: 'srm-test-1',
        sender: 'dean.seas@srmap.edu.in',
        senderName: 'Dean SEAS',
        recipient: 'demo.student@srmap.edu.in',
        subject: 'Attendance Shortage Warning',
        body: 'Submit condonation explanation',
        timestamp: new Date().toISOString(),
        dateFormatted: 'Today',
        category: 'ATTENDANCE',
        priority: 'HIGH',
        priorityScore: 88,
        priorityReason: 'Shortage warning',
        categoryReason: 'Official attendance record',
        summary: 'Submit explanation before Friday',
        actionRequired: true,
        actionText: 'Submit signed medical attendance condonation form to Room 114 Admin Block',
        actionDeadline: 'Friday 5:00 PM',
        deadlineDate: '2026-10-02T17:00:00.000Z',
        urgency: 'HIGH',
        tags: ['attendance', 'srmap'],
        isRead: false,
        source: 'demo'
      }
    ];

    const actions = ActionExtractor.extractActions(mockEmails);
    assert.strictEqual(actions.length, 1);
    assert.strictEqual(actions[0].title, 'Submit signed medical attendance condonation form to Room 114 Admin Block');
    assert.strictEqual(actions[0].priority, 'HIGH');
    assert.strictEqual(actions[0].completed, false);
  });
});

describe('RelationshipEngine — "What Changed?" Tests', () => {
  test('detects schedule changes and postponements in university communications', () => {
    const mockEmails: EmailData[] = [
      {
        id: 'change-1',
        sender: 'registrar.office@srmap.edu.in',
        senderName: 'Registrar Office',
        recipient: 'demo.student@srmap.edu.in',
        subject: 'CIRCULAR: University Closure on September 25 & Compensatory Working Day',
        body: 'University closed Sept 25 due to heavy rainfall. October 10 will be compensatory working Saturday following Friday timetable.',
        timestamp: new Date().toISOString(),
        dateFormatted: 'Sept 25, 2026',
        category: 'EMERGENCY',
        priority: 'CRITICAL',
        priorityScore: 98,
        priorityReason: 'Emergency campus closure',
        categoryReason: 'Official circular',
        summary: 'Sept 25 closed; Oct 10 compensatory working day',
        actionRequired: true,
        actionText: 'Stay indoors Sept 25; Attend classes on Oct 10 compensatory working day',
        actionDeadline: 'Oct 10, 2026',
        urgency: 'CRITICAL',
        tags: ['closure', 'rain'],
        isRead: false,
        source: 'demo'
      },
      {
        id: 'change-2',
        sender: 'ecell@srmap.edu.in',
        senderName: 'SRMAP - Entrepreneurship Cell',
        recipient: 'demo.student@srmap.edu.in',
        subject: 'IMPORTANT: STARTUP WARS 2026 Postponed',
        body: 'STARTUP WARS scheduled for September 21 has been postponed. Revised dates will be announced shortly.',
        timestamp: new Date().toISOString(),
        dateFormatted: 'Sept 21, 2026',
        category: 'ENTREPRENEURSHIP',
        priority: 'HIGH',
        priorityScore: 82,
        priorityReason: 'Event postponement',
        categoryReason: 'E-Cell notice',
        summary: 'STARTUP WARS postponed; new dates TBA',
        actionRequired: true,
        actionText: 'Update startup pitch schedule; disregard Sept 21 slot',
        actionDeadline: 'TBA',
        urgency: 'HIGH',
        tags: ['postponed', 'startup-wars'],
        isRead: false,
        source: 'demo'
      }
    ];

    const changes = RelationshipEngine.getWhatChanged(mockEmails);
    assert.ok(changes.length >= 2);
    const rainChange = changes.find(c => c.topic.includes('Rain') || c.topic.includes('Closure'));
    assert.ok(rainChange);
    assert.ok(rainChange.whatChanged.includes('October 10') || rainChange.whatChanged.includes('closed'));
  });
});

describe('FallbackAIProvider Tests — SRM AP Category Mapping', () => {
  test('extracts structured analysis deterministically for SRM AP notices', async () => {
    const fallback = new FallbackAIProvider();
    const analysis = await fallback.analyzeEmail({
      subject: 'URGENT: Examination Hall Changed for CSE 204 Tomorrow',
      body: 'The CSE 204 examination venue changed to S202, SR Block.',
      sender: 'hod.cse@srmap.edu.in'
    });

    assert.strictEqual(analysis.category, 'EXAMS');
    assert.strictEqual(analysis.priority, 'CRITICAL');
    assert.strictEqual(analysis.actionRequired, true);
    assert.ok(analysis.location?.includes('S202') || analysis.location?.includes('SR Block'));
  });
});
