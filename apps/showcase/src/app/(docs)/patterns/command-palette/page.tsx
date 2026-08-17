'use client';

import { useRouter } from 'next/navigation';
import {
  Button,
  Card,
  CardContent,
  CommandPalette,
  openCommandPalette,
  toast,
} from '@ds/ui';
import {
  Command,
  Sparkles,
  Search,
  Home,
  Palette,
  TableProperties,
  Database,
  LayoutDashboard,
  Sun,
  Moon,
  Laptop,
  Download,
  RefreshCw,
  Keyboard,
} from 'lucide-react';
import { PageHeader } from '@ds/ui';

export default function CommandPalettePage() {
  const router = useRouter();

  const navigate = (href: string) => () => router.push(href);

  return (
    <div className="space-y-10 animate-in fade-in-50 duration-200">
      <PageHeader
        eyebrow="UX Recipe Scenario"
        eyebrowIcon={Sparkles}
        title="Command Palette (⌘K)"
        description="A global keyboard-first command palette for fast navigation and actions. Open with Cmd+K / Ctrl+K, filter with fuzzy text search, navigate with arrow keys, and select with Enter. Fully mouse-accessible too."
      />

      {/* Demo trigger + shortcut hint */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 rounded-xl border border-dashed border-border bg-card/50 p-8">
        <Button
          size="lg"
          className="gap-2"
          onClick={openCommandPalette}
          aria-haspopup="dialog"
        >
          <Command className="h-4 w-4" />
          Open command palette
        </Button>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>or press</span>
          <kbd className="rounded-md border border-border bg-muted px-2 py-1 font-mono text-xs">
            ⌘K
          </kbd>
          <span>/</span>
          <kbd className="rounded-md border border-border bg-muted px-2 py-1 font-mono text-xs">
            Ctrl+K
          </kbd>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-border">
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <Keyboard className="h-4 w-4 text-primary" />
              Keyboard Accessibility
            </div>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center justify-between">
                <span>Open palette</span>
                <kbd className="rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-[11px]">⌘K</kbd>
              </li>
              <li className="flex items-center justify-between">
                <span>Next item</span>
                <kbd className="rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-[11px]">↓</kbd>
              </li>
              <li className="flex items-center justify-between">
                <span>Previous item</span>
                <kbd className="rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-[11px]">↑</kbd>
              </li>
              <li className="flex items-center justify-between">
                <span>Run selection</span>
                <kbd className="rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-[11px]">Enter</kbd>
              </li>
              <li className="flex items-center justify-between">
                <span>Close</span>
                <kbd className="rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-[11px]">Esc</kbd>
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <Search className="h-4 w-4 text-primary" />
              Search &amp; Filtering
            </div>
            <p className="text-sm text-muted-foreground">
              Results are filtered across labels, descriptions, and keywords. Try typing
              “theme”, “dashboard”, or “export” to see fuzzy matches grouped by section.
            </p>
            <div className="flex flex-wrap gap-2">
              <Button size="sm" variant="outline" onClick={openCommandPalette}>
                Try it
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Live palette instance for this recipe */}
      <CommandPalette
        groups={[
          {
            heading: 'Navigate',
            items: [
              {
                id: 'go-home',
                label: 'Overview',
                description: 'Design system home',
                icon: Home,
                keywords: ['home', 'overview', 'index'],
                shortcut: 'G H',
                onSelect: navigate('/'),
              },
              {
                id: 'go-colors',
                label: 'Color & Contrast',
                description: 'Foundations · tokens',
                icon: Palette,
                keywords: ['color', 'contrast', 'tokens', 'oklch'],
                onSelect: navigate('/foundations/colors'),
              },
              {
                id: 'go-table',
                label: 'Data Table & Filtering',
                description: 'UX scenario patterns',
                icon: TableProperties,
                keywords: ['table', 'grid', 'filter', 'sort'],
                onSelect: navigate('/patterns/data-table'),
              },
              {
                id: 'go-master',
                label: 'Master Data CRUD',
                description: 'UX scenario patterns',
                icon: Database,
                keywords: ['crud', 'master', 'records'],
                onSelect: navigate('/patterns/master-data'),
              },
              {
                id: 'go-dashboard',
                label: 'Dashboard & Metrics',
                description: 'UX scenario patterns',
                icon: LayoutDashboard,
                keywords: ['dashboard', 'metrics', 'kpi'],
                onSelect: navigate('/patterns/dashboard'),
              },
            ],
          },
          {
            heading: 'Actions',
            items: [
              {
                id: 'act-theme-light',
                label: 'Switch to light mode',
                icon: Sun,
                keywords: ['theme', 'light', 'appearance'],
                shortcut: 'T L',
                onSelect: () =>
                  toast({ variant: 'info', title: 'Light mode', description: 'Theme switching is controlled from the header for this demo.' }),
              },
              {
                id: 'act-theme-dark',
                label: 'Switch to dark mode',
                icon: Moon,
                keywords: ['theme', 'dark', 'appearance'],
                shortcut: 'T D',
                onSelect: () =>
                  toast({ variant: 'info', title: 'Dark mode', description: 'Theme switching is controlled from the header for this demo.' }),
              },
              {
                id: 'act-theme-system',
                label: 'Use system theme',
                icon: Laptop,
                keywords: ['theme', 'system', 'appearance'],
                onSelect: () =>
                  toast({ variant: 'info', title: 'System theme', description: 'Theme switching is controlled from the header for this demo.' }),
              },
              {
                id: 'act-export',
                label: 'Export token report',
                icon: Download,
                keywords: ['export', 'download', 'tokens', 'report'],
                onSelect: () =>
                  toast({ variant: 'success', title: 'Report exported', description: 'tokens-report.pdf generated successfully.' }),
              },
              {
                id: 'act-reload',
                label: 'Reload current page',
                icon: RefreshCw,
                keywords: ['reload', 'refresh', 'retry'],
                onSelect: () =>
                  toast({ variant: 'info', title: 'Reloading', description: 'Simulated page reload for demo purposes.' }),
              },
            ],
          },
        ]}
      />
    </div>
  );
}