'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { RotateCcw, Building, Mail, Phone, Sparkles, Headphones } from 'lucide-react';
import { CommandPalette, type CommandPaletteGroup } from '@ds/ui';
import { useCrm } from '../store/crm-context';
import { CRM_NAV_ITEMS } from '../nav-config';

export function CrmCommandPalette() {
  const router = useRouter();
  const {
    leads,
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
        items: CRM_NAV_ITEMS.map((item) => ({
          id: item.id,
          label: item.label,
          description: item.description,
          icon: item.icon,
          keywords: item.keywords,
          onSelect: () => router.push(item.href),
        })),
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
    conversations,
    router,
    setSelectedLeadId,
    setSelectedConversationId,
    openAiDrawer,
    resetAllData,
  ]);

  return <CommandPalette groups={groups} />;
}
