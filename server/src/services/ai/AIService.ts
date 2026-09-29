import crypto from 'crypto';
import { AIProvider, AssistantQueryResult } from './AIProvider';
import { GeminiProvider } from './GeminiProvider';
import { FallbackAIProvider } from './FallbackAIProvider';
import { EmailAnalysisResult, CampusBriefingResult, EmailData, ActionItem } from '../../types';

export class AIService {
  private static instance: AIService;
  private provider: AIProvider;
  private cache: Map<string, EmailAnalysisResult> = new Map();
  private briefingCache: { timestamp: number; data: CampusBriefingResult } | null = null;

  private constructor() {
    const aiProviderEnv = process.env.AI_PROVIDER || 'mock';
    const geminiKey = process.env.GEMINI_API_KEY;
    const model = process.env.GEMINI_MODEL || 'gemini-1.5-flash';

    if (aiProviderEnv.toLowerCase() === 'gemini' && geminiKey && geminiKey !== 'your_gemini_api_key_here') {
      console.log('🤖 AIService: Initializing Google Gemini AI Provider');
      this.provider = new GeminiProvider(geminiKey, model);
    } else {
      console.log('⚡ AIService: Initializing Deterministic Mock/Fallback AI Provider');
      this.provider = new FallbackAIProvider();
    }
  }

  public static getInstance(): AIService {
    if (!AIService.instance) {
      AIService.instance = new AIService();
    }
    return AIService.instance;
  }

  public getActiveProviderName(): string {
    return this.provider.name;
  }

  private computeHash(subject: string, body: string, sender: string): string {
    return crypto
      .createHash('sha256')
      .update(`${sender}:${subject}:${body}`)
      .digest('hex');
  }

  public async analyzeEmail(email: {
    subject: string;
    body: string;
    sender: string;
  }): Promise<EmailAnalysisResult> {
    const hash = this.computeHash(email.subject, email.body, email.sender);

    if (this.cache.has(hash)) {
      return this.cache.get(hash)!;
    }

    const result = await this.provider.analyzeEmail(email);
    this.cache.set(hash, result);
    return result;
  }

  public async generateBriefing(emails: EmailData[], userName: string): Promise<CampusBriefingResult> {
    const now = Date.now();
    // Cache briefing for 5 minutes unless forced refresh
    if (this.briefingCache && now - this.briefingCache.timestamp < 5 * 60 * 1000) {
      return this.briefingCache.data;
    }

    const briefing = await this.provider.generateBriefing(emails, userName);
    this.briefingCache = { timestamp: now, data: briefing };
    return briefing;
  }

  public async answerCampusQuery(
    query: string,
    contextEmails: EmailData[],
    actions: ActionItem[]
  ): Promise<AssistantQueryResult> {
    return this.provider.answerCampusQuery(query, contextEmails, actions);
  }

  public clearCache(): void {
    this.cache.clear();
    this.briefingCache = null;
  }
}
