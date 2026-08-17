'use client';

import * as React from 'react';
import {
  Combobox,
  Badge,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  Input,
  EmptyState,
  Skeleton,
  toast,
  type ComboboxOption,
} from '@ds/ui';
import {
  Sparkles,
  FileText,
  User,
  Settings,
  Search as SearchIcon,
  TrendingUp,
  Inbox,
  Command,
} from 'lucide-react';
import { PageHeader } from '@ds/ui';

interface SearchableResource {
  value: string;
  label: string;
  keywords?: string[];
}

const RESOURCES: SearchableResource[] = [
  { value: 'user/eleanor', label: 'Eleanor Vance', keywords: ['admin', 'settings'] },
  { value: 'user/marcus', label: 'Marcus Thorne', keywords: ['editor'] },
  { value: 'doc/data-table', label: 'Data Table docs', keywords: ['table', 'grid', 'filter'] },
  { value: 'doc/kanban', label: 'Kanban pattern docs', keywords: ['dnd', 'drag', 'board'] },
  { value: 'doc/charts', label: 'Chart kit docs', keywords: ['recharts', 'graph', 'visualization'] },
  { value: 'settings/billing', label: 'Billing settings', keywords: ['invoice', 'plan'] },
  { value: 'settings/team', label: 'Team & roles', keywords: ['members', 'permissions', 'rbac'] },
  { value: 'analytics/revenue', label: 'Revenue analytics', keywords: ['mrr', 'kpi', 'dashboard'] },
  { value: 'analytics/users', label: 'User analytics', keywords: ['cohort', 'retention', 'active'] },
  { value: 'reports/q3', label: 'Q3 executive report', keywords: ['pdf', 'export', 'download'] },
  { value: 'reports/churn', label: 'Churn deep-dive', keywords: ['retention', 'cancel'] },
  { value: 'project/launch', label: 'Launch checklist', keywords: ['release', 'go-live'] },
];

const RESULT_ICON: Record<string, typeof FileText> = {
  user: User,
  doc: FileText,
  settings: Settings,
  analytics: TrendingUp,
  reports: FileText,
  project: Inbox,
};

function renderIcon(category: string) {
  const Icon = RESULT_ICON[category] ?? FileText;
  return <Icon className="h-4 w-4 text-muted-foreground" />;
}

export default function GlobalSearchPage() {
  const [query, setQuery] = React.useState('');
  const [selected, setSelected] = React.useState<string | null>(null);
  const [isSearching, setIsSearching] = React.useState(false);

  React.useEffect(() => {
    if (!query.trim()) {
      setIsSearching(false);
      return;
    }
    setIsSearching(true);
    const t = setTimeout(() => setIsSearching(false), 450);
    return () => clearTimeout(t);
  }, [query]);

  const results = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    const scored = RESOURCES.map((r) => {
      let score = 0;
      if (r.label.toLowerCase().includes(q)) score += 3;
      if ((r.keywords ?? []).some((k) => k.includes(q))) score += 1;
      if (r.value.toLowerCase().includes(q)) score += 1;
      return { resource: r, score };
    }).filter((s) => s.score > 0);
    return scored.sort((a, b) => b.score - a.score).map((s) => s.resource);
  }, [query]);

  const showResults = query.trim().length > 0;

  const handleSelect = (value: string) => {
    setSelected(value);
    setQuery('');
    const resource = RESOURCES.find((r) => r.value === value);
    toast({
      variant: 'success',
      title: 'Opened result',
      description: resource?.label ?? value,
    });
  };

  return (
    <div className="space-y-10 animate-in fade-in-50 duration-200">
      <PageHeader
        eyebrow="UX Recipe Scenario"
        eyebrowIcon={Sparkles}
        title="Global Search"
        description="A fast, keyboard-navigable global search across users, docs, settings, and reports — with relevance-ranked results, loading skeletons, empty states, and quick action shortcuts."
      />

      <div className="mx-auto max-w-2xl space-y-6">
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground" htmlFor="global-search-input">
            Search everything
          </label>
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="global-search-input"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search users, docs, settings, reports…"
              className="h-11 pl-9 pr-16 text-base shadow-xs"
              autoComplete="off"
              aria-controls="global-search-results"
              aria-expanded={showResults}
            />
            <kbd className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md border border-border bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
              <Command className="mr-0.5 inline h-2.5 w-2.5" />
              K
            </kbd>
          </div>
        </div>

        <div id="global-search-results" className="space-y-2" aria-live="polite">
          {!showResults ? (
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-wrap gap-2">
                  {RESOURCES.slice(0, 6).map((r) => (
                    <Badge
                      key={r.value}
                      variant="secondary"
                      className="cursor-pointer transition-colors hover:bg-accent hover:text-accent-foreground"
                      onClick={() => handleSelect(r.value)}
                    >
                      {r.label}
                    </Badge>
                  ))}
                </div>
                <p className="mt-3 text-xs text-muted-foreground">
                  Suggested searches — click one or start typing. Results are relevance-ranked.
                </p>
              </CardContent>
            </Card>
          ) : isSearching ? (
            <Card>
              <CardContent className="divide-y divide-border p-0">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3 p-4">
                    <Skeleton className="h-8 w-8 rounded-md" />
                    <div className="space-y-1.5">
                      <Skeleton className="h-4 w-40" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          ) : results.length === 0 ? (
            <EmptyState
              icon={Inbox}
              title="No matches found"
              description={`Nothing matched "${query}". Try a broader term like "report" or "user".`}
              actionLabel="Clear search"
              onAction={() => setQuery('')}
            />
          ) : (
            <Card>
              <CardHeader className="p-4 pb-2">
                <CardTitle className="text-sm">{results.length} results</CardTitle>
                <CardDescription className="text-xs">
                  Ranked by relevance. Use ↑/↓ + Enter to select, Esc to dismiss.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <Combobox
                  label="Search results"
                  placeholder="Select a result…"
                  searchPlaceholder="Filter results…"
                  value={selected ?? undefined}
                  onValueChange={(v) => {
                    if (v && !Array.isArray(v)) handleSelect(v);
                  }}
                  multiple={false}
                  options={results.map<ComboboxOption>((r) => {
                    const category = r.value.split('/')[0];
                    return {
                      value: r.value,
                      label: r.label,
                      description: r.value,
                      icon: renderIcon(category),
                    };
                  })}
                  emptyText="No results"
                  className="border-0 shadow-none"
                />
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}