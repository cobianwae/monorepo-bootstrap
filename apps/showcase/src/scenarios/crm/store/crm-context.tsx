'use client';

import * as React from 'react';
import type {
  Lead,
  LeadStage,
  Campaign,
  CampaignStatus,
  Conversation,
  ConversationStatus,
  Message,
  Agent,
  AgentStatus,
  Activity,
  DashboardMetrics,
} from '../types';
import {
  INITIAL_LEADS,
  INITIAL_CAMPAIGNS,
  INITIAL_CONVERSATIONS,
  INITIAL_AGENTS,
  INITIAL_ACTIVITIES,
  INITIAL_METRICS,
} from '../data/fixtures';
import { toast } from '@ds/ui';

interface CrmNotification {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  read: boolean;
  type: 'lead' | 'campaign' | 'message' | 'ai';
}

interface AiDrawerContext {
  type: 'lead' | 'conversation' | 'campaign' | 'general';
  entityId?: string;
  initialTab?: 'chat' | 'lead-scoring' | 'draft' | 'insights';
}

interface CrmState {
  leads: Lead[];
  campaigns: Campaign[];
  conversations: Conversation[];
  agents: Agent[];
  activities: Activity[];
  metrics: DashboardMetrics;
  selectedLeadId: string | null;
  selectedConversationId: string | null;
  currentAgent: Agent;
  isAiDrawerOpen: boolean;
  aiContext: AiDrawerContext | null;
  notifications: CrmNotification[];
  isLoading: boolean;
}

type CrmAction =
  | { type: 'ADD_LEAD'; payload: Omit<Lead, 'id' | 'createdAt' | 'notesCount'> }
  | { type: 'UPDATE_LEAD'; payload: { id: string; patch: Partial<Lead> } }
  | { type: 'MOVE_LEAD_STAGE'; payload: { id: string; stage: LeadStage } }
  | { type: 'DELETE_LEAD'; payload: { id: string } }
  | { type: 'CONVERT_LEAD'; payload: { id: string } }
  | { type: 'SET_SELECTED_LEAD'; payload: string | null }
  | { type: 'ADD_CAMPAIGN'; payload: Omit<Campaign, 'id' | 'createdAt' | 'sentCount' | 'openRate' | 'clickRate' | 'conversionRate' | 'spent' | 'revenueGenerated' | 'roi'> }
  | { type: 'UPDATE_CAMPAIGN_STATUS'; payload: { id: string; status: CampaignStatus } }
  | { type: 'DELETE_CAMPAIGN'; payload: { id: string } }
  | { type: 'SET_SELECTED_CONVERSATION'; payload: string | null }
  | { type: 'SEND_MESSAGE'; payload: { conversationId: string; content: string; isAiGenerated?: boolean } }
  | { type: 'SIMULATE_CUSTOMER_REPLY'; payload: { conversationId: string; content: string } }
  | { type: 'SET_CONVERSATION_STATUS'; payload: { id: string; status: ConversationStatus } }
  | { type: 'ASSIGN_CONVERSATION'; payload: { id: string; agentId: string; agentName: string } }
  | { type: 'SET_AGENT_STATUS'; payload: AgentStatus }
  | { type: 'OPEN_AI_DRAWER'; payload?: AiDrawerContext }
  | { type: 'CLOSE_AI_DRAWER' }
  | { type: 'MARK_NOTIFICATIONS_READ' }
  | { type: 'ADD_ACTIVITY'; payload: Omit<Activity, 'id' | 'timestamp'> }
  | { type: 'RESET_ALL_DATA' };

const INITIAL_NOTIFICATIONS: CrmNotification[] = [
  {
    id: 'notif-1',
    title: 'AI Lead Alert',
    description: 'Alister Thornfield (FinTech Velocity Ltd) reached AI Score 94.',
    timestamp: '10m ago',
    read: false,
    type: 'ai',
  },
  {
    id: 'notif-2',
    title: 'New WhatsApp Message',
    description: 'Beatrix Solis replied in Omnichannel Contact Center.',
    timestamp: '32m ago',
    read: false,
    type: 'message',
  },
  {
    id: 'notif-3',
    title: 'Campaign Milestone',
    description: 'Q1 Enterprise AI Upsell Wave exceeded 45% open rate target.',
    timestamp: '2h ago',
    read: false,
    type: 'campaign',
  },
];

const INITIAL_STATE: CrmState = {
  leads: INITIAL_LEADS,
  campaigns: INITIAL_CAMPAIGNS,
  conversations: INITIAL_CONVERSATIONS,
  agents: INITIAL_AGENTS,
  activities: INITIAL_ACTIVITIES,
  metrics: INITIAL_METRICS,
  selectedLeadId: null,
  selectedConversationId: 'conv-301',
  currentAgent: INITIAL_AGENTS[0],
  isAiDrawerOpen: false,
  aiContext: null,
  notifications: INITIAL_NOTIFICATIONS,
  isLoading: false,
};

function crmReducer(state: CrmState, action: CrmAction): CrmState {
  switch (action.type) {
    case 'ADD_LEAD': {
      const newId = `lead-${Date.now()}`;
      const newLead: Lead = {
        ...action.payload,
        id: newId,
        createdAt: new Date().toISOString(),
        notesCount: 0,
      };
      const newActivity: Activity = {
        id: `act-${Date.now()}`,
        type: 'lead_created',
        title: 'New Lead Inbound',
        description: `Created lead ${newLead.name} (${newLead.company}) valued at $${newLead.dealValue.toLocaleString()}`,
        entityType: 'lead',
        entityId: newId,
        entityName: newLead.name,
        actorName: state.currentAgent.name,
        actorAvatar: state.currentAgent.avatarUrl,
        timestamp: 'Just now',
      };
      return {
        ...state,
        leads: [newLead, ...state.leads],
        activities: [newActivity, ...state.activities],
        metrics: {
          ...state.metrics,
          activeLeadsCount: state.metrics.activeLeadsCount + 1,
          totalPipelineValue: state.metrics.totalPipelineValue + newLead.dealValue,
        },
      };
    }

    case 'UPDATE_LEAD': {
      return {
        ...state,
        leads: state.leads.map((l) =>
          l.id === action.payload.id ? { ...l, ...action.payload.patch } : l
        ),
      };
    }

    case 'MOVE_LEAD_STAGE': {
      const target = state.leads.find((l) => l.id === action.payload.id);
      if (!target) return state;

      const newActivity: Activity = {
        id: `act-${Date.now()}`,
        type: action.payload.stage === 'won' ? 'deal_won' : action.payload.stage === 'lost' ? 'deal_lost' : 'stage_moved',
        title: `Pipeline Stage Updated: ${action.payload.stage.toUpperCase()}`,
        description: `${target.name} (${target.company}) moved to stage "${action.payload.stage}"`,
        entityType: 'lead',
        entityId: target.id,
        entityName: target.name,
        actorName: state.currentAgent.name,
        actorAvatar: state.currentAgent.avatarUrl,
        timestamp: 'Just now',
      };

      return {
        ...state,
        leads: state.leads.map((l) =>
          l.id === action.payload.id ? { ...l, stage: action.payload.stage } : l
        ),
        activities: [newActivity, ...state.activities],
        metrics: action.payload.stage === 'won'
          ? {
              ...state.metrics,
              leadsWonThisMonth: state.metrics.leadsWonThisMonth + 1,
            }
          : state.metrics,
      };
    }

    case 'DELETE_LEAD': {
      return {
        ...state,
        leads: state.leads.filter((l) => l.id !== action.payload.id),
        selectedLeadId: state.selectedLeadId === action.payload.id ? null : state.selectedLeadId,
      };
    }

    case 'CONVERT_LEAD': {
      const target = state.leads.find((l) => l.id === action.payload.id);
      if (!target) return state;

      const newActivity: Activity = {
        id: `act-${Date.now()}`,
        type: 'deal_won',
        title: 'Deal Won & Converted',
        description: `${target.name} converted to Won Customer ($${target.dealValue.toLocaleString()})`,
        entityType: 'lead',
        entityId: target.id,
        entityName: target.name,
        actorName: state.currentAgent.name,
        actorAvatar: state.currentAgent.avatarUrl,
        timestamp: 'Just now',
      };

      return {
        ...state,
        leads: state.leads.map((l) =>
          l.id === action.payload.id ? { ...l, stage: 'won' as LeadStage } : l
        ),
        activities: [newActivity, ...state.activities],
        metrics: {
          ...state.metrics,
          leadsWonThisMonth: state.metrics.leadsWonThisMonth + 1,
        },
      };
    }

    case 'SET_SELECTED_LEAD':
      return { ...state, selectedLeadId: action.payload };

    case 'ADD_CAMPAIGN': {
      const newId = `cmp-${Date.now()}`;
      const newCampaign: Campaign = {
        ...action.payload,
        id: newId,
        createdAt: new Date().toISOString(),
        sentCount: 0,
        openRate: 0,
        clickRate: 0,
        conversionRate: 0,
        spent: 0,
        revenueGenerated: 0,
        roi: 0,
      };
      const newActivity: Activity = {
        id: `act-${Date.now()}`,
        type: 'campaign_launched',
        title: 'New Campaign Created',
        description: `Campaign "${newCampaign.name}" (${newCampaign.channel}) configured for ${newCampaign.audienceCount.toLocaleString()} contacts`,
        entityType: 'campaign',
        entityId: newId,
        entityName: newCampaign.name,
        actorName: state.currentAgent.name,
        actorAvatar: state.currentAgent.avatarUrl,
        timestamp: 'Just now',
      };
      return {
        ...state,
        campaigns: [newCampaign, ...state.campaigns],
        activities: [newActivity, ...state.activities],
      };
    }

    case 'UPDATE_CAMPAIGN_STATUS': {
      return {
        ...state,
        campaigns: state.campaigns.map((c) =>
          c.id === action.payload.id ? { ...c, status: action.payload.status } : c
        ),
      };
    }

    case 'DELETE_CAMPAIGN': {
      return {
        ...state,
        campaigns: state.campaigns.filter((c) => c.id !== action.payload.id),
      };
    }

    case 'SET_SELECTED_CONVERSATION':
      return {
        ...state,
        selectedConversationId: action.payload,
        conversations: state.conversations.map((c) =>
          c.id === action.payload ? { ...c, unreadCount: 0 } : c
        ),
      };

    case 'SEND_MESSAGE': {
      const conv = state.conversations.find((c) => c.id === action.payload.conversationId);
      if (!conv) return state;

      const newMsg: Message = {
        id: `msg-${Date.now()}`,
        conversationId: conv.id,
        sender: 'agent',
        senderName: state.currentAgent.name,
        senderAvatar: state.currentAgent.avatarUrl,
        content: action.payload.content,
        timestamp: 'Just now',
        status: 'delivered',
        channel: conv.channel,
        isAiGenerated: action.payload.isAiGenerated,
      };

      const updatedConv: Conversation = {
        ...conv,
        unreadCount: 0,
        lastMessage: {
          content: action.payload.content,
          timestamp: 'Just now',
          sender: 'agent',
        },
        messages: [...conv.messages, newMsg],
        updatedAt: new Date().toISOString(),
      };

      return {
        ...state,
        conversations: state.conversations.map((c) =>
          c.id === conv.id ? updatedConv : c
        ),
      };
    }

    case 'SIMULATE_CUSTOMER_REPLY': {
      const conv = state.conversations.find((c) => c.id === action.payload.conversationId);
      if (!conv) return state;

      const newMsg: Message = {
        id: `msg-${Date.now()}`,
        conversationId: conv.id,
        sender: 'customer',
        senderName: conv.customerName,
        senderAvatar: conv.customerAvatar,
        content: action.payload.content,
        timestamp: 'Just now',
        status: 'read',
        channel: conv.channel,
      };

      const isCurrentSelected = state.selectedConversationId === conv.id;

      const updatedConv: Conversation = {
        ...conv,
        unreadCount: isCurrentSelected ? 0 : conv.unreadCount + 1,
        lastMessage: {
          content: action.payload.content,
          timestamp: 'Just now',
          sender: 'customer',
        },
        messages: [...conv.messages, newMsg],
        updatedAt: new Date().toISOString(),
      };

      return {
        ...state,
        conversations: state.conversations.map((c) =>
          c.id === conv.id ? updatedConv : c
        ),
      };
    }

    case 'SET_CONVERSATION_STATUS': {
      return {
        ...state,
        conversations: state.conversations.map((c) =>
          c.id === action.payload.id ? { ...c, status: action.payload.status } : c
        ),
      };
    }

    case 'ASSIGN_CONVERSATION': {
      return {
        ...state,
        conversations: state.conversations.map((c) =>
          c.id === action.payload.id
            ? {
                ...c,
                assignedAgentId: action.payload.agentId,
                assignedAgentName: action.payload.agentName,
              }
            : c
        ),
      };
    }

    case 'SET_AGENT_STATUS': {
      return {
        ...state,
        currentAgent: {
          ...state.currentAgent,
          status: action.payload,
        },
      };
    }

    case 'OPEN_AI_DRAWER':
      return {
        ...state,
        isAiDrawerOpen: true,
        aiContext: action.payload || { type: 'general' },
      };

    case 'CLOSE_AI_DRAWER':
      return {
        ...state,
        isAiDrawerOpen: false,
        aiContext: null,
      };

    case 'MARK_NOTIFICATIONS_READ':
      return {
        ...state,
        notifications: state.notifications.map((n) => ({ ...n, read: true })),
      };

    case 'ADD_ACTIVITY': {
      const newActivity: Activity = {
        ...action.payload,
        id: `act-${Date.now()}`,
        timestamp: 'Just now',
      };
      return {
        ...state,
        activities: [newActivity, ...state.activities],
      };
    }

    case 'RESET_ALL_DATA':
      return INITIAL_STATE;

    default:
      return state;
  }
}

interface CrmContextValue extends CrmState {
  addLead: (data: Omit<Lead, 'id' | 'createdAt' | 'notesCount'>) => void;
  updateLead: (id: string, patch: Partial<Lead>) => void;
  moveLeadStage: (id: string, stage: LeadStage) => void;
  deleteLead: (id: string) => void;
  convertLead: (id: string) => void;
  setSelectedLeadId: (id: string | null) => void;
  addCampaign: (data: Omit<Campaign, 'id' | 'createdAt' | 'sentCount' | 'openRate' | 'clickRate' | 'conversionRate' | 'spent' | 'revenueGenerated' | 'roi'>) => void;
  updateCampaignStatus: (id: string, status: CampaignStatus) => void;
  deleteCampaign: (id: string) => void;
  setSelectedConversationId: (id: string | null) => void;
  sendMessage: (conversationId: string, content: string, isAiGenerated?: boolean) => void;
  simulateCustomerReply: (conversationId: string, content: string) => void;
  setConversationStatus: (id: string, status: ConversationStatus) => void;
  assignConversation: (id: string, agentId: string, agentName: string) => void;
  setAgentStatus: (status: AgentStatus) => void;
  openAiDrawer: (context?: AiDrawerContext) => void;
  closeAiDrawer: () => void;
  markNotificationsRead: () => void;
  resetAllData: () => void;
}

const CrmContext = React.createContext<CrmContextValue | undefined>(undefined);

export function CrmProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = React.useReducer(crmReducer, INITIAL_STATE);

  const addLead = React.useCallback(
    (data: Omit<Lead, 'id' | 'createdAt' | 'notesCount'>) => {
      dispatch({ type: 'ADD_LEAD', payload: data });
      toast({
        variant: 'success',
        title: 'Lead Created',
        description: `${data.name} from ${data.company} added to pipeline.`,
      });
    },
    []
  );

  const updateLead = React.useCallback((id: string, patch: Partial<Lead>) => {
    dispatch({ type: 'UPDATE_LEAD', payload: { id, patch } });
    toast({
      variant: 'default',
      title: 'Lead Updated',
      description: 'Changes saved successfully.',
    });
  }, []);

  const moveLeadStage = React.useCallback((id: string, stage: LeadStage) => {
    dispatch({ type: 'MOVE_LEAD_STAGE', payload: { id, stage } });
    toast({
      variant: 'default',
      title: 'Pipeline Updated',
      description: `Lead moved to ${stage.toUpperCase()} stage.`,
    });
  }, []);

  const deleteLead = React.useCallback((id: string) => {
    dispatch({ type: 'DELETE_LEAD', payload: { id } });
    toast({
      variant: 'destructive',
      title: 'Lead Deleted',
      description: 'Lead removed from active pipeline.',
    });
  }, []);

  const convertLead = React.useCallback((id: string) => {
    dispatch({ type: 'CONVERT_LEAD', payload: { id } });
    toast({
      variant: 'success',
      title: 'Deal Won',
      description: 'Lead converted to active customer deal.',
    });
  }, []);

  const setSelectedLeadId = React.useCallback((id: string | null) => {
    dispatch({ type: 'SET_SELECTED_LEAD', payload: id });
  }, []);

  const addCampaign = React.useCallback(
    (data: Omit<Campaign, 'id' | 'createdAt' | 'sentCount' | 'openRate' | 'clickRate' | 'conversionRate' | 'spent' | 'revenueGenerated' | 'roi'>) => {
      dispatch({ type: 'ADD_CAMPAIGN', payload: data });
      toast({
        variant: 'success',
        title: 'Campaign Created',
        description: `"${data.name}" scheduled for launch.`,
      });
    },
    []
  );

  const updateCampaignStatus = React.useCallback(
    (id: string, status: CampaignStatus) => {
      dispatch({ type: 'UPDATE_CAMPAIGN_STATUS', payload: { id, status } });
      toast({
        variant: 'default',
        title: 'Campaign Status Updated',
        description: `Campaign is now ${status}.`,
      });
    },
    []
  );

  const deleteCampaign = React.useCallback((id: string) => {
    dispatch({ type: 'DELETE_CAMPAIGN', payload: { id } });
    toast({
      variant: 'destructive',
      title: 'Campaign Deleted',
      description: 'Campaign removed from history.',
    });
  }, []);

  const setSelectedConversationId = React.useCallback((id: string | null) => {
    dispatch({ type: 'SET_SELECTED_CONVERSATION', payload: id });
  }, []);

  const sendMessage = React.useCallback(
    (conversationId: string, content: string, isAiGenerated = false) => {
      dispatch({
        type: 'SEND_MESSAGE',
        payload: { conversationId, content, isAiGenerated },
      });
      toast({
        variant: 'success',
        title: isAiGenerated ? 'AI Message Sent' : 'Message Sent',
        description: 'Delivered via customer channel.',
      });
    },
    []
  );

  const simulateCustomerReply = React.useCallback(
    (conversationId: string, content: string) => {
      dispatch({
        type: 'SIMULATE_CUSTOMER_REPLY',
        payload: { conversationId, content },
      });
    },
    []
  );

  const setConversationStatus = React.useCallback(
    (id: string, status: ConversationStatus) => {
      dispatch({ type: 'SET_CONVERSATION_STATUS', payload: { id, status } });
      toast({
        variant: 'default',
        title: 'Conversation Status',
        description: `Ticket status set to ${status}.`,
      });
    },
    []
  );

  const assignConversation = React.useCallback(
    (id: string, agentId: string, agentName: string) => {
      dispatch({
        type: 'ASSIGN_CONVERSATION',
        payload: { id, agentId, agentName },
      });
      toast({
        variant: 'default',
        title: 'Assigned',
        description: `Conversation assigned to ${agentName}.`,
      });
    },
    []
  );

  const setAgentStatus = React.useCallback((status: AgentStatus) => {
    dispatch({ type: 'SET_AGENT_STATUS', payload: status });
    toast({
      variant: 'default',
      title: 'Agent Status',
      description: `Your status is now ${status}.`,
    });
  }, []);

  const openAiDrawer = React.useCallback((context?: AiDrawerContext) => {
    dispatch({ type: 'OPEN_AI_DRAWER', payload: context });
  }, []);

  const closeAiDrawer = React.useCallback(() => {
    dispatch({ type: 'CLOSE_AI_DRAWER' });
  }, []);

  const markNotificationsRead = React.useCallback(() => {
    dispatch({ type: 'MARK_NOTIFICATIONS_READ' });
  }, []);

  const resetAllData = React.useCallback(() => {
    dispatch({ type: 'RESET_ALL_DATA' });
    toast({
      variant: 'default',
      title: 'Data Reset',
      description: 'CRM fixtures restored to default initial state.',
    });
  }, []);

  const value = React.useMemo<CrmContextValue>(
    () => ({
      ...state,
      addLead,
      updateLead,
      moveLeadStage,
      deleteLead,
      convertLead,
      setSelectedLeadId,
      addCampaign,
      updateCampaignStatus,
      deleteCampaign,
      setSelectedConversationId,
      sendMessage,
      simulateCustomerReply,
      setConversationStatus,
      assignConversation,
      setAgentStatus,
      openAiDrawer,
      closeAiDrawer,
      markNotificationsRead,
      resetAllData,
    }),
    [
      state,
      addLead,
      updateLead,
      moveLeadStage,
      deleteLead,
      convertLead,
      setSelectedLeadId,
      addCampaign,
      updateCampaignStatus,
      deleteCampaign,
      setSelectedConversationId,
      sendMessage,
      simulateCustomerReply,
      setConversationStatus,
      assignConversation,
      setAgentStatus,
      openAiDrawer,
      closeAiDrawer,
      markNotificationsRead,
      resetAllData,
    ]
  );

  return <CrmContext.Provider value={value}>{children}</CrmContext.Provider>;
}

export function useCrm(): CrmContextValue {
  const context = React.useContext(CrmContext);
  if (!context) {
    throw new Error('useCrm must be used within a CrmProvider');
  }
  return context;
}
