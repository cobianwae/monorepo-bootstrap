import {
  LayoutDashboard,
  Users,
  Megaphone,
  Headphones,
  Sparkles,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface ScenarioNavItem {
  id: string;
  title: string;
  label: string;
  href: string;
  icon: LucideIcon;
  exact?: boolean;
  keywords: string[];
  description: string;
}

export const CRM_NAV_ITEMS: ScenarioNavItem[] = [
  {
    id: 'nav-dashboard',
    title: 'Dashboard',
    label: 'CRM Dashboard',
    href: '/crm',
    icon: LayoutDashboard,
    exact: true,
    keywords: ['home', 'metrics', 'overview', 'stats'],
    description: 'KPIs, pipeline charts and revenue metrics',
  },
  {
    id: 'nav-leads',
    title: 'Leads Pipeline',
    label: 'Leads Pipeline',
    href: '/crm/leads',
    icon: Users,
    keywords: ['deals', 'sales', 'prospects', 'clients'],
    description: 'Kanban board and table view',
  },
  {
    id: 'nav-campaigns',
    title: 'Campaigns',
    label: 'Marketing Campaigns',
    href: '/crm/campaigns',
    icon: Megaphone,
    keywords: ['marketing', 'broadcast', 'roi'],
    description: 'Email, WhatsApp and omnichannel campaigns',
  },
  {
    id: 'nav-contact-center',
    title: 'Contact Center',
    label: 'Contact Center Inbox',
    href: '/crm/contact-center',
    icon: Headphones,
    keywords: ['inbox', 'messages', 'chat', 'support', 'tickets'],
    description: 'Omnichannel customer conversations',
  },
  {
    id: 'nav-ai',
    title: 'AI Command Center',
    label: 'AI Copilot Studio',
    href: '/crm/ai',
    icon: Sparkles,
    keywords: ['artificial intelligence', 'gpt', 'insights', 'drafts'],
    description: 'Lead scoring radar & predictive analytics',
  },
];