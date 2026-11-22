import Link from 'next/link';
import {
  Box,
  FileCheck2,
  MousePointerClick,
  PanelLeft,
  Component,
  TableProperties,
  ShieldCheck,
  Activity,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import {
  HeroBand,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  Badge,
  Button,
} from '@ds/ui';
import type { LucideIcon } from 'lucide-react';
import { SectionHeading } from '../../../components/section-heading';

interface CategoryCard {
  title: string;
  description: string;
  href: string;
  icon: LucideIcon;
  badge: string;
  highlights: string[];
}

const CATEGORIES: CategoryCard[] = [
  {
    title: 'Actions & Inputs',
    description: 'Buttons, badges, toggles, rating, sliders, segmented control, number, search, and OTP inputs.',
    href: '/components/actions-inputs',
    icon: MousePointerClick,
    badge: '11+ Primitives',
    highlights: ['Button', 'Toggle', 'Slider', 'Rating'],
  },
  {
    title: 'Forms',
    description: 'Form field system with validation, radio groups, file uploads, combobox, tag input, date & time pickers, and filter builder.',
    href: '/components/forms',
    icon: FileCheck2,
    badge: '10 Sections',
    highlights: ['Combobox', 'DatePicker', 'FilterBuilder'],
  },
  {
    title: 'Layout & Navigation',
    description: 'Sidebar system, app shells, navbar, mega menu, tabs, breadcrumbs, pagination, footer, and menubar.',
    href: '/components/layout-navigation',
    icon: PanelLeft,
    badge: '12 Sections',
    highlights: ['Sidebar', 'AppShell', 'Mega Menu'],
  },
  {
    title: 'Overlays & Menus',
    description: 'Dialogs, alert dialogs, sheets, popovers, hover cards, context & dropdown menus, command palette, banner, and toasts.',
    href: '/components/overlays-menus',
    icon: Component,
    badge: '11 Sections',
    highlights: ['AlertDialog', 'Command Palette', 'Toast'],
  },
  {
    title: 'Data Display',
    description: 'Cards, avatars, carousel, scroll area, tables, timeline, metric tiles, bulk action bar, tree view, sortable list, and chat.',
    href: '/components/data-display',
    icon: TableProperties,
    badge: '15 Sections',
    highlights: ['TreeView', 'SortableList', 'Chat'],
  },
  {
    title: 'States & Feedback',
    description: 'Alerts, banners, notifications, spinners, skeletons, progress, empty states, and error pages.',
    href: '/components/states-feedback',
    icon: ShieldCheck,
    badge: '7 Sections',
    highlights: ['Skeleton', 'Progress', 'EmptyState'],
  },
  {
    title: 'Charts & Data Viz',
    description: 'Perceptually uniform OKLCH charts with responsive containers, tooltips, and accessible data tables.',
    href: '/components/charts',
    icon: Activity,
    badge: 'Recharts',
    highlights: ['Line', 'Bar', 'Donut'],
  },
  {
    title: 'Marketing',
    description: 'Hero sections, feature grids, stats bands, pricing, testimonials, FAQ, CTA bands, and footer blocks.',
    href: '/components/marketing',
    icon: Sparkles,
    badge: 'Blocks',
    highlights: ['Hero', 'Pricing', 'Testimonials'],
  },
];

export default function ComponentsIndexPage() {
  return (
    <div className="space-y-12 animate-in fade-in-50 duration-300">
      {/* Hero Header */}
      <HeroBand
        accent="primary"
        eyebrow="UI LIBRARY · RADIX + CVA + TAILWIND V4"
        eyebrowIcon={Box}
        title="Component Catalog"
        description="Accessible, composable UI primitives organized by domain. Every component supports full keyboard interaction, focus rings, WCAG AA contrast, and dark mode parity."
        actions={
          <>
            <Link href="/components/forms">
              <Button variant="highlight" className="gap-2 h-10 px-5 text-sm shadow-md">
                Start with Forms
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/components/overlays-menus">
              <Button variant="outline" className="gap-2 h-10 px-5 text-sm bg-background/50 backdrop-blur-sm">
                Explore Overlays
              </Button>
            </Link>
          </>
        }
      />

      {/* Category Grid */}
      <div className="space-y-5">
        <div className="border-b border-border pb-3">
          <SectionHeading
            title="Browse by Category"
            description="Pick a domain to browse its primitives and composition patterns"
            actions={
              <span className="text-xs font-mono text-muted-foreground hidden sm:inline">
                {CATEGORIES.length} CATEGORIES
              </span>
            }
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {CATEGORIES.map((category, idx) => {
            const Icon = category.icon;
            return (
              <Link key={category.href} href={category.href} className="group">
                <Card className="h-full border-border hover:border-highlight/50 hover:shadow-md transition-all duration-200 relative overflow-hidden">
                  <CardHeader className="p-5">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-secondary text-foreground group-hover:bg-highlight group-hover:text-highlight-foreground transition-all duration-200 shadow-xs">
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-mono text-muted-foreground">
                          #{String(idx + 1).padStart(2, '0')}
                        </span>
                        <Badge
                          variant="outline"
                          className="text-xs px-2 py-0 border-border group-hover:border-highlight/30 group-hover:text-highlight transition-colors"
                        >
                          {category.badge}
                        </Badge>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <CardTitle className="text-base font-display group-hover:text-highlight transition-colors">
                        {category.title}
                      </CardTitle>
                      <CardDescription className="text-xs line-clamp-2 mt-1 leading-relaxed">
                        {category.description}
                      </CardDescription>
                    </div>

                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {category.highlights.map((h) => (
                        <span
                          key={h}
                          className="rounded-md bg-muted/60 px-2 py-0.5 text-xs font-mono text-muted-foreground group-hover:bg-highlight/10 group-hover:text-highlight transition-colors"
                        >
                          {h}
                        </span>
                      ))}
                    </div>
                  </CardHeader>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
