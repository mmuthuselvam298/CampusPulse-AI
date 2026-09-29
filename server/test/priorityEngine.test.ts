import { test, describe } from 'node:test';
import assert from 'node:assert';
import { PriorityEngine } from '../src/services/priority/PriorityEngine';
import { UniversityFilter } from '../src/services/filter/UniversityFilter';
import { ActionExtractor } from '../src/services/actions/ActionExtractor';
import { FallbackAIProvider } from '../src/services/ai/FallbackAIProvider';
import { EmailData } from '../src/types';

describe('PriorityEngine Tests', () => {
  test('evaluates urgent exam venue change as CRITICAL', () => {
    const result = PriorityEngine.evaluate(
      'URGENT: Examination Hall Changed for Tomorrow',
      'The CSE mid-semester examination venue has changed from Block A to Block C Hall 204. Report by 8:40 AM.',
      'examinations@northbridgeuniversity.edu',
      '2026-09-30T08:40:00.000Z'
    );

    assert.strictEqual(result.priority, 'CRITICAL');
    assert.ok(result.priorityScore >= 90);
    assert.ok(result.priorityReason.includes('examination hall'));
  });

  test('evaluates attendance shortage warning as HIGH priority', () => {
    const result = PriorityEngine.evaluate(
      'Attendance Shortage Notice – CSE Students',
      'Your attendance is below 75%. Submit condonation explanation before Friday or face exam debarment.',
      'attendance@northbridgeuniversity.edu',
      '2026-10-02T17:00:00.000Z'
    );

    assert.strictEqual(result.priority, 'HIGH');
    assert.ok(result.priorityScore >= 75);
    assert.ok(result.priorityReason.toLowerCase().includes('attendance'));
  });

  test('evaluates monthly general newsletter as LOW priority', () => {
    const result = PriorityEngine.evaluate(
      'Campus Newsletter – October Edition',
      'Read about recent campus research grants and student cultural highlights in the October issue.',
      'communications@northbridgeuniversity.edu'
    );

    assert.strictEqual(result.priority, 'LOW');
    assert.ok(result.priorityScore <= 35);
  });
});

describe('UniversityFilter Tests', () => {
  test('allows institutional university domains', () => {
    assert.strictEqual(UniversityFilter.isUniversityEmail('examinations@northbridgeuniversity.edu'), true);
    assert.strictEqual(UniversityFilter.isUniversityEmail('attendance@srmist.edu.in'), true);
    assert.strictEqual(UniversityFilter.isUniversityEmail('dean@university.edu'), true);
  });

  test('rejects external commercial and promotional noise', () => {
    assert.strictEqual(UniversityFilter.isUniversityEmail('orders@amazon.in'), false);
    assert.strictEqual(UniversityFilter.isUniversityEmail('notifications@instagram.com'), false);
    assert.strictEqual(UniversityFilter.isUniversityEmail('promo@edutech-deals.com'), false);
  });
});

describe('ActionExtractor Tests', () => {
  test('extracts actionable tasks with deadlines', () => {
    const mockEmails: EmailData[] = [
      {
        id: 'test-1',
        sender: 'attendance@northbridgeuniversity.edu',
        senderName: 'Attendance Cell',
        recipient: 'student@northbridgeuniversity.edu',
        subject: 'Attendance Shortage',
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
        actionText: 'Submit signed attendance explanation form to Room 114',
        actionDeadline: 'Friday 5:00 PM',
        deadlineDate: '2026-10-02T17:00:00.000Z',
        urgency: 'HIGH',
        tags: ['attendance'],
        isRead: false,
        source: 'demo'
      }
    ];

    const actions = ActionExtractor.extractActions(mockEmails);
    assert.strictEqual(actions.length, 1);
    assert.strictEqual(actions[0].title, 'Submit signed attendance explanation form to Room 114');
    assert.strictEqual(actions[0].priority, 'HIGH');
    assert.strictEqual(actions[0].completed, false);
  });
});

describe('FallbackAIProvider Tests', () => {
  test('extracts structured analysis deterministically', async () => {
    const fallback = new FallbackAIProvider();
    const analysis = await fallback.analyzeEmail({
      subject: 'URGENT: Examination Hall Changed for Tomorrow',
      body: 'The CSE exam venue changed to Block C Hall 204.',
      sender: 'examinations@northbridgeuniversity.edu'
    });

    assert.strictEqual(analysis.category, 'EXAMS');
    assert.strictEqual(analysis.priority, 'CRITICAL');
    assert.strictEqual(analysis.actionRequired, true);
    assert.ok(analysis.location?.includes('Block C'));
  });
});
