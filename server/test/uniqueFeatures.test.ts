import { describe, it, before } from 'node:test';
import assert from 'node:assert';
import { DatabaseService } from '../src/db/DatabaseService';
import { ConflictEngine } from '../src/services/intelligence/ConflictEngine';
import { UnifiedEventEngine } from '../src/services/intelligence/UnifiedEventEngine';
import { RiskEngine } from '../src/services/intelligence/RiskEngine';
import { HealthEngine } from '../src/services/intelligence/HealthEngine';
import { OpportunityEngine } from '../src/services/intelligence/OpportunityEngine';
import { AttentionBudgetEngine } from '../src/services/intelligence/AttentionBudgetEngine';
import { KnowledgeGraphEngine } from '../src/services/intelligence/KnowledgeGraphEngine';
import { CalendarPlannerEngine } from '../src/services/intelligence/CalendarPlannerEngine';
import { CatchUpEngine } from '../src/services/intelligence/CatchUpEngine';
import { DigestEngine } from '../src/services/intelligence/DigestEngine';
import { ChaosSimulatorEngine } from '../src/services/intelligence/ChaosSimulatorEngine';
import { AIToolRegistry } from '../src/services/ai/AIToolRegistry';

describe('Unique Features — PS02 Cross-System Intelligence Tests', () => {
  before(() => {
    DatabaseService.getInstance().loadInitialDataset();
  });

  it('Feature 1: Campus Knowledge Graph generates interconnected nodes and edges', () => {
    const graph = KnowledgeGraphEngine.getInstance().getGraphData();
    assert.ok(graph.nodes.length > 10, 'Graph should have substantial nodes');
    assert.ok(graph.edges.length > 10, 'Graph should have substantial relationships');
    
    // Check key node types
    const types = new Set(graph.nodes.map(n => n.type));
    assert.ok(types.has('COURSE'), 'Graph has COURSE nodes');
    assert.ok(types.has('CLASSROOM'), 'Graph has CLASSROOM nodes');
    assert.ok(types.has('CALENDAR'), 'Graph has CALENDAR nodes');
    assert.ok(types.has('GMAIL'), 'Graph has GMAIL nodes');
    assert.ok(types.has('ACTION'), 'Graph has ACTION nodes');

    // Confirm pulse central hub
    assert.ok(graph.nodes.some(n => n.id === 'node-campuspulse'), 'CampusPulse hub node present');
  });

  it('Feature 3: Cross-System Conflict Detector identifies contradictions across Gmail, Classroom, Calendar', () => {
    const conflicts = ConflictEngine.getInstance().detectConflicts();
    assert.ok(conflicts.length >= 1, 'Should detect cross-system contradictions');

    // Robotics flagship conflict
    const roboticsConflict = conflicts.find(c => c.eventId === 'unified-robotics-workshop');
    assert.ok(roboticsConflict, 'Robotics Workshop conflict detected');
    assert.strictEqual(roboticsConflict?.sourceA.sourceName, 'Gmail');
    assert.strictEqual(roboticsConflict?.sourceB.sourceName, 'Google Calendar');
    assert.ok(roboticsConflict?.hasAuthoritativeResolution, 'Should explain authoritative resolution if evidence exists');
    assert.ok(roboticsConflict?.resolutionExplanation.length > 0, 'Explanation should be evidence-based');
  });

  it('Feature 4: Information Truth Resolution exposes field-by-field verification with sources', () => {
    const truth = UnifiedEventEngine.getInstance().getTruthResolution('unified-robotics-workshop');
    assert.ok(truth, 'Truth resolution generated for Robotics Workshop');
    assert.strictEqual(truth?.title, 'Hands-On Robotics Workshop (Techfest IIT Bombay)');
    
    const timeField = truth?.fields.find(f => f.field === 'Time');
    assert.ok(timeField, 'Time field evaluated');
    assert.strictEqual(timeField?.status, 'Conflicting', 'Time field flagged as Conflicting');
    assert.ok(timeField?.sources.length >= 2, 'Time field references multiple sources');
  });

  it('Feature 5: "Why This Matters" generates evidence-based student context', () => {
    const reasons = UnifiedEventEngine.getInstance().getWhyThisMatters('unified-cse213-quiz');
    assert.ok(reasons.length > 0, 'Reasons generated');
    assert.ok(reasons.some(r => r.includes('CSE 213') || r.includes('assessment') || r.includes('grade')), 'Grounded in CSE 213 context');
  });

  it('Feature 6: Deadline Risk Detector flags approaching assignments with actionable risk levels', () => {
    const risks = RiskEngine.getInstance().calculateDeadlineRisks();
    assert.ok(risks.length > 0, 'Calculates deadline risks for upcoming tasks');
    
    const quizRisk = risks.find(r => r.title.toLowerCase().includes('quiz'));
    assert.ok(quizRisk, 'Club quiz evaluated for risk');
    assert.strictEqual(quizRisk?.riskLevel, 'HIGH RISK');
    assert.ok(quizRisk?.riskScore >= 75);
    assert.ok(quizRisk?.suggestedAction.length > 0);
  });

  it('Feature 7: AI Calendar Planner generates an actionable day plan with conflict prevention', () => {
    const plan = CalendarPlannerEngine.getInstance().generatePlan('2026-09-30');
    assert.ok(plan.schedule.length >= 4, 'Day plan contains scheduled slots');
    assert.ok(plan.productivityScore > 50, 'Calculates day productivity score');
    
    // Check that items have [Add to Calendar] capability
    const unadded = plan.schedule.filter(s => !s.isAlreadyInCalendar);
    assert.ok(unadded.length > 0, 'Has unadded activities for student confirmation');
  });

  it('Feature 8 & 20: Unified Event Card compresses multiple notices into 1 intelligence item', () => {
    const events = UnifiedEventEngine.getInstance().getUnifiedEvents();
    assert.ok(events.length >= 4, 'Generates unified events');
    
    const robotics = events.find(e => e.id === 'unified-robotics-workshop');
    assert.ok(robotics, 'Robotics Workshop unified');
    assert.ok(robotics?.sources.length >= 2, 'Compresses multiple sources');
    assert.ok(robotics?.timeline.length >= 2, 'Includes chronological timeline');
  });

  it('Feature 9: "What Did I Miss?" produces time-filtered catch-up report with top actions', () => {
    const report = CatchUpEngine.getInstance().getCatchUpSummary('since_yesterday');
    assert.strictEqual(report.timeframe, 'since_yesterday');
    assert.ok(report.counts.totalNotices > 0);
    assert.ok(report.highlights.length > 0);
    assert.ok(report.topActions.length > 0);
  });

  it('Feature 10: Campus Communication Health calculates live statistics on 50-email dataset', () => {
    const health = HealthEngine.getInstance().calculateHealthMetrics();
    assert.strictEqual(health.totalCommunications, 50, 'Evaluates the exact 50 demo emails');
    assert.ok(health.withDeadlinesPercentage > 0, 'Non-zero deadline percentage');
    assert.ok(health.withLocationsPercentage > 0, 'Non-zero location percentage');
    assert.ok(health.withExplicitActionsPercentage > 0, 'Non-zero action percentage');
    assert.ok(health.overallHealthScore > 0, 'Calculates non-zero health score');
    assert.ok(['A', 'B', 'C', 'D'].includes(health.grade));
    assert.ok(health.topInsights.length > 0);
  });

  it('Feature 11: Opportunity Matcher recommends events aligned with CSE/AI student profile', () => {
    const opps = OpportunityEngine.getInstance().getOpportunities();
    assert.ok(opps.length > 0, 'Identifies campus opportunities');
    
    const topMatch = opps[0];
    assert.ok(topMatch.relevanceScore >= 60, 'High relevance score for technical opportunities');
    assert.ok(topMatch.whyRelevant.length > 0, 'Provides traceable relevance reasons');
  });

  it('Feature 12: Attention Budget categorizes cognitive load into Immediate vs This Week vs Informational', () => {
    const budget = AttentionBudgetEngine.getInstance().getAttentionBudget();
    assert.ok(budget.immediate.count > 0, 'Has immediate attention items');
    assert.ok(budget.thisWeek.count > 0, 'Has this week items');
    assert.ok(budget.informational.count > 0, 'Has informational notices');
  });

  it('Feature 14: Campus Chaos Simulator executes live pipeline mutation for Room Change', () => {
    const sim = ChaosSimulatorEngine.getInstance().simulateChaos('ROOM_CHANGE');
    assert.strictEqual(sim.simulationType, 'ROOM_CHANGE');
    assert.ok(sim.success);
    assert.ok(sim.simulatedEmail.id.includes('sim-chaos'));
    assert.strictEqual(sim.changeDetected.changeType, 'LOCATION');
    assert.strictEqual(sim.changeDetected.newValue, 'Room S204, SR Block');
    assert.ok(sim.summaryOfUpdates.length >= 4);
  });

  it('Feature 16: "What Happens If I Ignore This?" derives evidence-based consequences', () => {
    const actions = DatabaseService.getInstance().getActions();
    const action = actions[0];
    const analysis = UnifiedEventEngine.getInstance().getConsequence(action.id);
    assert.strictEqual(analysis.actionId, action.id);
    assert.ok(analysis.consequences.length > 0);
    assert.ok(analysis.supportedByEvidence);
  });

  it('Feature 24: Smart Notification Digest condenses repetitive notifications', () => {
    const digests = DigestEngine.getInstance().getNotificationDigests();
    assert.ok(digests.length > 0, 'Identifies multi-notice clusters');
    const topDigest = digests[0];
    assert.ok(topDigest.totalNotificationsCount > 1, 'Condenses multiple notifications');
    assert.ok(topDigest.condensedHeadline.includes('condensed into 1 intelligent update'));
  });

  it('AI Tools Registry provides all requested tools', () => {
    const registry = AIToolRegistry.getInstance();
    
    const campusSearch = registry.searchCampus('robotics');
    assert.strictEqual(campusSearch.toolName, 'searchCampus');
    assert.ok(campusSearch.citations.length > 0);

    const conflictsTool = registry.getConflicts();
    assert.strictEqual(conflictsTool.toolName, 'getConflicts');
    assert.ok(conflictsTool.data.length > 0);

    const healthTool = registry.getCommunicationHealth();
    assert.strictEqual(healthTool.toolName, 'getCommunicationHealth');
    assert.ok(healthTool.data.overallHealthScore > 0);

    const missTool = registry.getWhatDidIMiss('today');
    assert.strictEqual(missTool.toolName, 'getWhatDidIMiss');
    assert.ok(missTool.data.counts.totalNotices > 0);
  });
});
