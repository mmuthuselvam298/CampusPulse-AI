import { GoogleGenerativeAI } from '@google/generative-ai';
import { AIProvider, AssistantQueryResult } from './AIProvider';
import { EmailAnalysisResult, CampusBriefingResult, EmailData, ActionItem } from '../../types';
import { FallbackAIProvider } from './FallbackAIProvider';

export class GeminiProvider implements AIProvider {
  public name: 'gemini' = 'gemini';
  private genAI: GoogleGenerativeAI | null = null;
  private fallback: FallbackAIProvider;
  private modelName: string;

  constructor(apiKey?: string, modelName: string = 'gemini-1.5-flash') {
    this.fallback = new FallbackAIProvider();
    this.modelName = modelName;
    if (apiKey) {
      try {
        this.genAI = new GoogleGenerativeAI(apiKey);
      } catch (err) {
        console.warn('Failed to initialize GoogleGenerativeAI, falling back to mock provider:', err);
      }
    }
  }

  public async analyzeEmail(email: {
    subject: string;
    body: string;
    sender: string;
  }): Promise<EmailAnalysisResult> {
    if (!this.genAI) {
      return this.fallback.analyzeEmail(email);
    }

    try {
      const model = this.genAI.getGenerativeModel({
        model: this.modelName,
        generationConfig: { responseMimeType: "application/json" }
      });

      const prompt = `You are CampusPulse AI, an expert university communication intelligence system for Smart India Hackathon PS02.
Analyze this university email and output strict JSON adhering to this exact schema:
{
  "category": "ACADEMICS" | "EXAMS" | "ATTENDANCE" | "ASSIGNMENTS" | "TRANSPORT" | "EVENTS" | "FEES" | "HOSTEL" | "PLACEMENTS" | "ADMINISTRATION" | "FACILITIES" | "EMERGENCY" | "CLUBS" | "SCHOLARSHIPS" | "GENERAL",
  "priority": "CRITICAL" | "HIGH" | "MEDIUM" | "LOW",
  "priorityScore": number between 1 and 99,
  "summary": "1 to 2 sentence crisp actionable summary",
  "deadline": "formatted deadline string like 'Friday, Oct 2, 2026' or null",
  "actionRequired": boolean,
  "action": "clear single action item sentence or null",
  "eventDate": "ISO date string or null",
  "location": "physical campus location or hall if mentioned or null",
  "affectedGroup": "affected student cohort e.g. 'CSE Semester 3 Students'",
  "urgency": "CRITICAL" | "HIGH" | "MEDIUM" | "LOW",
  "reason": "Clear explanation of why this priority score was assigned based on academic/safety/deadline consequences",
  "categoryReason": "Brief explanation of category selection"
}

EMAIL TO ANALYZE:
Sender: ${email.sender}
Subject: ${email.subject}
Body:
${email.body}`;

      const response = await model.generateContent(prompt);
      const text = response.response.text();
      const parsed = JSON.parse(text);

      return {
        category: parsed.category || 'GENERAL',
        priority: parsed.priority || 'MEDIUM',
        priorityScore: typeof parsed.priorityScore === 'number' ? parsed.priorityScore : 60,
        summary: parsed.summary || email.subject,
        deadline: parsed.deadline || undefined,
        actionRequired: Boolean(parsed.actionRequired),
        action: parsed.action || undefined,
        eventDate: parsed.eventDate || undefined,
        location: parsed.location || undefined,
        affectedGroup: parsed.affectedGroup || 'All Students',
        urgency: parsed.urgency || parsed.priority || 'MEDIUM',
        reason: parsed.reason || 'AI evaluated priority based on deadline and academic consequence.',
        categoryReason: parsed.categoryReason || 'Classified based on contextual email content.',
        aiProvider: 'gemini'
      };
    } catch (error) {
      console.warn('Gemini analysis failed or returned invalid JSON. Falling back to deterministic engine:', error);
      const fallbackResult = await this.fallback.analyzeEmail(email);
      return {
        ...fallbackResult,
        reason: `${fallbackResult.reason} (Gemini fallback active)`
      };
    }
  }

  public async generateBriefing(
    emails: EmailData[],
    userName: string
  ): Promise<CampusBriefingResult> {
    if (!this.genAI) {
      return this.fallback.generateBriefing(emails, userName);
    }

    try {
      const model = this.genAI.getGenerativeModel({
        model: this.modelName,
        generationConfig: { responseMimeType: "application/json" }
      });

      const topEmailsSummary = emails.slice(0, 10).map(e => ({
        id: e.id,
        subject: e.subject,
        category: e.category,
        priority: e.priority,
        summary: e.summary,
        deadline: e.actionDeadline
      }));

      const prompt = `You are CampusPulse AI generating the daily campus briefing for student ${userName}.
Based on these prioritized university communications, generate a structured JSON briefing:
{
  "date": "Wednesday, September 30, 2026",
  "greeting": "Good morning, ${userName}",
  "studentName": "${userName}",
  "headline": "punchy 1-sentence headline highlighting the most urgent thing",
  "criticalCount": number,
  "highCount": number,
  "upcomingDeadlinesCount": number,
  "academicUpdatesCount": number,
  "summaryBullets": [
    {
      "emoji": "emoji icon",
      "priority": "CRITICAL" | "HIGH" | "MEDIUM" | "LOW",
      "title": "short title",
      "description": "crisp description",
      "emailId": "corresponding email id"
    }
  ],
  "motivationalNote": "short encouraging student productivity tip"
}

EMAILS DATA:
${JSON.stringify(topEmailsSummary, null, 2)}`;

      const response = await model.generateContent(prompt);
      const parsed = JSON.parse(response.response.text());

      return {
        ...parsed,
        aiProvider: 'gemini'
      };
    } catch (err) {
      console.warn('Gemini briefing generation failed, using deterministic briefing:', err);
      return this.fallback.generateBriefing(emails, userName);
    }
  }

  public async answerCampusQuery(
    query: string,
    contextEmails: EmailData[],
    actions: ActionItem[]
  ): Promise<AssistantQueryResult> {
    if (!this.genAI) {
      return this.fallback.answerCampusQuery(query, contextEmails, actions);
    }

    try {
      const model = this.genAI.getGenerativeModel({
        model: this.modelName,
        generationConfig: { responseMimeType: "application/json" }
      });

      const prompt = `You are the CampusPulse AI assistant for Northbridge University students.
You must answer strictly using the provided indexed university email data.
Never invent information. If information is not in the context, explicitly state: "I couldn't find that information in your university communications."

STUDENT QUERY: "${query}"

INDEXED EMAILS SUMMARY:
${JSON.stringify(contextEmails.slice(0, 15).map(e => ({
  id: e.id,
  subject: e.subject,
  category: e.category,
  priority: e.priority,
  summary: e.summary,
  location: e.location,
  deadline: e.actionDeadline,
  action: e.actionText
})), null, 2)}

PENDING ACTIONS:
${JSON.stringify(actions.slice(0, 8), null, 2)}

Respond with JSON:
{
  "answer": "markdown-formatted helpful answer with bold highlights, bullets, and exact locations/times",
  "suggestedActions": ["Action button label 1", "Action button label 2"],
  "referencedEmailIds": ["email-001"],
  "toolUsed": "e.g. getUrgentMessages() or getUpcomingExams()"
}`;

      const response = await model.generateContent(prompt);
      const parsed = JSON.parse(response.response.text());

      return {
        answer: parsed.answer,
        suggestedActions: parsed.suggestedActions || [],
        referencedEmailIds: parsed.referencedEmailIds || [],
        toolUsed: parsed.toolUsed || 'searchUniversityMessages()'
      };
    } catch (err) {
      console.warn('Gemini query answering failed, using fallback rule engine:', err);
      return this.fallback.answerCampusQuery(query, contextEmails, actions);
    }
  }
}
