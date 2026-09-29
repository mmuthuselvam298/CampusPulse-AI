import { EmailAnalysisResult, CampusBriefingResult, EmailData, ActionItem } from '../../types';

export interface AssistantQueryResult {
  answer: string;
  suggestedActions: string[];
  referencedEmailIds: string[];
  toolUsed?: string;
}

export interface AIProvider {
  name: 'gemini' | 'mock-fallback';
  
  analyzeEmail(email: {
    subject: string;
    body: string;
    sender: string;
    recipient?: string;
  }): Promise<EmailAnalysisResult>;

  generateBriefing(
    emails: EmailData[],
    userName: string
  ): Promise<CampusBriefingResult>;

  answerCampusQuery(
    query: string,
    contextEmails: EmailData[],
    actions: ActionItem[]
  ): Promise<AssistantQueryResult>;
}
