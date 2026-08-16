import type {
  Lead,
  Campaign,
  Conversation,
  Activity,
  AiLeadInsight,
} from '../types';
import {
  INITIAL_LEADS,
  INITIAL_CAMPAIGNS,
  INITIAL_CONVERSATIONS,
  INITIAL_ACTIVITIES,
  INITIAL_METRICS,
} from '../data/fixtures';

export const delay = (ms = 180): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

export async function getMockLeads(): Promise<Lead[]> {
  await delay(150);
  return [...INITIAL_LEADS];
}

export async function getMockCampaigns(): Promise<Campaign[]> {
  await delay(150);
  return [...INITIAL_CAMPAIGNS];
}

export async function getMockConversations(): Promise<Conversation[]> {
  await delay(150);
  return [...INITIAL_CONVERSATIONS];
}

export async function getMockActivities(): Promise<Activity[]> {
  await delay(120);
  return [...INITIAL_ACTIVITIES];
}

export async function getMockMetrics() {
  await delay(100);
  return { ...INITIAL_METRICS };
}

/**
 * AI Lead Insight Generator (Deterministic simulation)
 */
export async function analyzeLeadWithAi(lead: Lead): Promise<AiLeadInsight> {
  await delay(350);
  const score = lead.aiScore;
  const isHigh = score >= 80;
  const isMed = score >= 50 && score < 80;

  return {
    leadId: lead.id,
    score,
    churnRisk: isHigh ? 'low' : isMed ? 'medium' : 'high',
    buyingIntent: isHigh ? 'very_high' : isMed ? 'medium' : 'low',
    keyDrivers: [
      `Budget qualification: $${lead.dealValue.toLocaleString()}`,
      `Activity frequency: Last touched ${lead.lastContactedAt}`,
      `Channel fit: Originated from ${lead.source}`,
      `Industry urgency: Tags include ${lead.tags.join(', ')}`,
    ],
    recommendedAction: isHigh
      ? 'Schedule final executive closing call with custom SLA terms.'
      : isMed
        ? 'Send interactive ROI calculator and offer 14-day token sandbox trial.'
        : 'Nurture with monthly design system whitepaper & automated check-in.',
    draftEmail: {
      subject: `Accelerating ${lead.company}'s Design System Architecture`,
      body: `Hi ${lead.name},\n\nI noticed ${lead.company} is evaluating modern UI architecture for your team. Our enterprise plan provides full OKLCH tokens, WCAG AAA accessibility verification, and seamless omnichannel integration.\n\nWould you have 15 minutes this Thursday for a personalized architectural walkthrough?\n\nBest regards,\nSarah Jenkins`,
    },
  };
}

/**
 * Helper to stream simulated AI text chunks token-by-token
 */
export async function streamAiDraftReply(
  prompt: string,
  onChunk: (chunk: string) => void,
  onComplete: () => void
): Promise<void> {
  const sampleResponses: Record<string, string> = {
    enterprise:
      "Thank you for reaching out regarding our Enterprise SLA. Our infrastructure guarantees 99.99% uptime with 24/7 dedicated support, automatic Okta SAML 2.0 SCIM provisioning, and data residency in US and EU regions. I have attached our SOC2 Type II compliance report for your security team.",
    pricing:
      "Our team plan starts at $49/seat/month and our Enterprise tier includes custom volume discounts, multi-tenant isolation, and tailored design token governance. We would be happy to prepare a formal quote matching your current seat count.",
    general:
      "Hello! Thank you for contacting our team. I've reviewed your request and confirmed that our Next.js + Tailwind CSS v4 design system package seamlessly supports your technical requirements with zero hydration overhead.",
  };

  const key = prompt.toLowerCase().includes('enterprise') || prompt.toLowerCase().includes('sla')
    ? 'enterprise'
    : prompt.toLowerCase().includes('price') || prompt.toLowerCase().includes('budget')
      ? 'pricing'
      : 'general';

  const fullText = sampleResponses[key];
  const words = fullText.split(' ');

  for (let i = 0; i < words.length; i++) {
    await delay(35);
    onChunk((i === 0 ? '' : ' ') + words[i]);
  }

  onComplete();
}
