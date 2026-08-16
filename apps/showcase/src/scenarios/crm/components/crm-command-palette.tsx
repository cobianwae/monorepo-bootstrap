'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  Megaphone,
  Headphones,
  Sparkles,
  RotateCcw,
  Building,
  Mail,
  Phone,
} from 'lucide-react';
import { CommandPalette, type CommandPaletteGroup } from '@ds/ui';
import { useCrm } from '../store/crm-context';

export function CrmCommandPalette() {
  const router = useRouter();
  const {
    leads,
    campaigns,
    conversations,
    setSelectedLeadId,
    setSelectedConversationId,
    openAiDrawer,
    resetAllData,
  } = useCrm();

  const groups: CommandPaletteGroup[] = React.useMemo(() => {
    return [
      {
        heading: 'Quick Navigation',
        items: [
          {
            id: 'nav-dashboard',
            label: 'CRM Dashboard',
            description: 'KPIs, pipeline charts and revenue metrics',
            icon: LayoutDashboard,
            keywords: ['home', 'metrics', 'overview', 'stats'],
            onSelect: () => router.push('/crm'),
          },
          {
            id: 'nav-leads',
            label: 'Leads Pipeline',
            description: 'Kanban board and table view',
            icon: Users,
            keywords: ['deals', 'sales', 'prospects', 'clients'],
            onSelect: () => router.push('/crm/leads'),
          },
          {
            id: 'nav-campaigns',
            label: 'Marketing Campaigns',
            description: 'Email, WhatsApp and omnichannel campaigns',
            icon: Megaphone,
            keywords: ['marketing', 'broadcast', 'roi'],
            onSelect: () => router.push('/crm/campaigns'),
          },
          {
            id: 'nav-contact-center',
            label: 'Contact Center Inbox',
            description: 'Omnichannel customer conversations',
            icon: Headphones,
            keywords: ['inbox', 'messages', 'chat', 'support', 'tickets'],
            onSelect: () => router.push('/crm/contact-center'),
          },
          {
            id: 'nav-ai',
            label: 'AI Copilot Studio',
            description: 'Lead scoring radar & predictive analytics',
            icon: Sparkles,
            keywords: ['artificial intelligence', 'gpt', 'insights', 'drafts'],
            onSelect: () => router.push('/crm/ai'),
          },
        ],
      },
      {
        heading: 'Search Leads & Deals',
        items: leads.slice(0, 6).map((lead) => ({
          id: `lead-${lead.id}`,
          label: `${lead.name} • ${lead.company}`,
          description: `$${lead.dealValue.toLocaleString()} • Stage: ${lead.stage.toUpperCase()} (AI Score: ${lead.aiScore})`,
          icon: Building,
          keywords: [lead.name, lead.company, lead.email, lead.stage, ...lead.tags],
          onSelect: () => {
            setSelectedLeadId(lead.id);
            router.push('/crm/leads');
          },
        })),
      },
      {
        heading: 'Omnichannel Conversations',
        items: conversations.slice(0, 4).map((conv) => ({
          id: `conv-${conv.id}`,
          label: `${conv.customerName} (${conv.channel.toUpperCase()})`,
          description: conv.subject,
          icon: conv.channel === 'email' ? Mail : conv.channel === 'voice' ? Phone : Headphones,
          keywords: [conv.customerName, conv.subject, conv.customerCompany, conv.channel],
          onSelect: () => {
            setSelectedConversationId(conv.id);
            router.push('/crm/contact-center');
          },
        })),
      },
      {
        heading: 'Quick Actions',
        items: [
          {
            id: 'action-ask-ai',
            label: 'Ask AI Copilot Assistant',
            description: 'Open conversational AI assistant drawer',
            icon: Sparkles,
            shortcut: '⌘J',
            keywords: ['copilot', 'assistant', 'prompt'],
            onSelect: () => openAiDrawer({ type: 'general' }),
          },
          {
            id: 'action-reset',
            label: 'Reset CRM Demo Data',
            description: 'Restore initial deterministic fixtures',
            icon: RotateCcw,
            keywords: ['clean', 'reload', 'fixture'],
            onSelect: () => resetAllData(),
          },
        ],
      },
    ];
  }, [
    leads,
    campaigns,
    conversations,
    router,
    setSelectedLeadId,
    setSelectedConversationId,
    openAiDrawer,
    resetAllData,
  ]);

  return <CommandPalette groups={groups} />;
}
