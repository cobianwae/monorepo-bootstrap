export type LeadStage =
  | 'new'
  | 'contacted'
  | 'qualified'
  | 'proposal'
  | 'negotiation'
  | 'won'
  | 'lost';

export type LeadPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface Lead {
  id: string;
  name: string;
  title: string;
  company: string;
  email: string;
  phone: string;
  avatarUrl?: string;
  stage: LeadStage;
  priority: LeadPriority;
  dealValue: number;
  aiScore: number; // 0 - 100
  aiScoreReason: string;
  aiSentiment: 'positive' | 'neutral' | 'negative' | 'critical';
  assignedAgentId: string;
  assignedAgentName: string;
  source: 'Website Form' | 'LinkedIn InMail' | 'Referral' | 'Cold Outreach' | 'Webinar' | 'Product Trial';
  tags: string[];
  notesCount: number;
  lastContactedAt: string;
  createdAt: string;
  customFields?: Record<string, string | number>;
}

export type CampaignStatus = 'draft' | 'scheduled' | 'active' | 'paused' | 'completed';
export type CampaignChannel = 'email' | 'whatsapp' | 'sms' | 'multichannel';

export interface Campaign {
  id: string;
  name: string;
  channel: CampaignChannel;
  status: CampaignStatus;
  targetAudience: string;
  audienceCount: number;
  sentCount: number;
  openRate: number; // percentage e.g. 42.5
  clickRate: number; // percentage e.g. 18.2
  conversionRate: number; // percentage e.g. 6.4
  budget: number;
  spent: number;
  revenueGenerated: number;
  roi: number; // multiple e.g. 3.4x
  scheduledFor?: string;
  launchedAt?: string;
  endedAt?: string;
  createdAt: string;
  subject?: string;
  previewText?: string;
}

export type ChannelType = 'email' | 'whatsapp' | 'webchat' | 'voice';
export type ConversationStatus = 'open' | 'pending' | 'resolved' | 'closed';
export type ConversationPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface Message {
  id: string;
  conversationId: string;
  sender: 'customer' | 'agent' | 'bot' | 'system';
  senderName: string;
  senderAvatar?: string;
  content: string;
  timestamp: string;
  status: 'sending' | 'sent' | 'delivered' | 'read';
  channel: ChannelType;
  isAiGenerated?: boolean;
}

export interface Conversation {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  customerCompany: string;
  customerAvatar?: string;
  channel: ChannelType;
  status: ConversationStatus;
  priority: ConversationPriority;
  subject: string;
  assignedAgentId: string;
  assignedAgentName: string;
  assignedAgentAvatar?: string;
  unreadCount: number;
  lastMessage: {
    content: string;
    timestamp: string;
    sender: 'customer' | 'agent' | 'bot' | 'system';
  };
  messages: Message[];
  tags: string[];
  sentimentScore: number; // 0 - 100
  aiSummary?: string;
  suggestedReplies?: string[];
  createdAt: string;
  updatedAt: string;
}

export type AgentStatus = 'available' | 'busy' | 'away' | 'offline';

export interface Agent {
  id: string;
  name: string;
  email: string;
  role: 'Admin' | 'Sales Executive' | 'Support Lead' | 'AI Specialist';
  avatarUrl?: string;
  status: AgentStatus;
  activeChatsCount: number;
  closedDealsCount: number;
  rating: number;
}

export interface Activity {
  id: string;
  type:
    | 'lead_created'
    | 'stage_moved'
    | 'deal_won'
    | 'deal_lost'
    | 'message_sent'
    | 'campaign_launched'
    | 'note_added'
    | 'ai_insight';
  title: string;
  description: string;
  entityType: 'lead' | 'campaign' | 'conversation';
  entityId: string;
  entityName: string;
  actorName: string;
  actorAvatar?: string;
  timestamp: string;
}

export interface AiLeadInsight {
  leadId: string;
  score: number;
  churnRisk: 'low' | 'medium' | 'high';
  buyingIntent: 'very_high' | 'high' | 'medium' | 'low';
  keyDrivers: string[];
  recommendedAction: string;
  draftEmail?: {
    subject: string;
    body: string;
  };
}

export interface DashboardMetrics {
  totalPipelineValue: number;
  pipelineGrowthPct: number;
  activeLeadsCount: number;
  leadsWonThisMonth: number;
  winRatePct: number;
  avgResponseTimeMin: number;
  csatScore: number;
  activeCampaignsCount: number;
  aiSuggestedActionsCount: number;
}
