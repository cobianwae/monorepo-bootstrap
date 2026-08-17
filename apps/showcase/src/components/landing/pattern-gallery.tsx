import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { SectionNumber } from '@ds/ui';

const PATTERNS = [
  { slug: 'data-table', label: 'Data Table' },
  { slug: 'kanban', label: 'Kanban Board' },
  { slug: 'command-palette', label: 'Command Palette' },
  { slug: 'global-search', label: 'Global Search' },
  { slug: 'dashboard', label: 'Dashboard' },
  { slug: 'master-detail', label: 'Master Detail' },
  { slug: 'master-data', label: 'Master Data' },
  { slug: 'stepper', label: 'Stepper' },
  { slug: 'dynamic-form', label: 'Dynamic Form' },
  { slug: 'file-upload', label: 'File Upload' },
  { slug: 'rich-text-editor', label: 'Rich Text Editor' },
  { slug: 'infinite-scroll', label: 'Infinite Scroll' },
  { slug: 'virtualized-list', label: 'Virtualized List' },
  { slug: 'activity-feed', label: 'Activity Feed' },
  { slug: 'notifications', label: 'Notifications' },
  { slug: 'calendar', label: 'Calendar' },
  { slug: 'media-gallery', label: 'Media Gallery' },
  { slug: 'comments', label: 'Comments' },
  { slug: 'auth', label: 'Auth' },
  { slug: 'onboarding', label: 'Onboarding' },
  { slug: 'product-tour', label: 'Product Tour' },
  { slug: 'settings', label: 'Settings' },
  { slug: 'billing', label: 'Billing' },
  { slug: 'results', label: 'Results' },
  { slug: 'optimistic-updates', label: 'Optimistic Updates' },
  { slug: 'workspace', label: 'Workspace' },
] as const;

/**
 * The full UX pattern index — every entry links straight into its living
 * recipe inside the docs.
 */
export function PatternGallery() {
  return (
    <div>
      <div className="mb-10 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div className="max-w-2xl space-y-4">
          <SectionNumber number={3} label="Pattern Library" />
          <h2 className="font-display text-3xl font-extrabold tracking-tight text-foreground sm:text-5xl">
            Twenty-six recipes, zero blank canvases
          </h2>
          <p className="leading-relaxed text-muted-foreground">
            Production-grade UX scenarios — loading skeletons, empty states, and error paths
            included. Each one runs live in the docs.
          </p>
        </div>
        <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
          {PATTERNS.length} patterns · all live
        </p>
      </div>

      <div className="grid gap-px overflow-hidden rounded-2xl border border-border/60 bg-border/50 sm:grid-cols-2 lg:grid-cols-3">
        {PATTERNS.map((pattern, i) => (
          <Link
            key={pattern.slug}
            href={`/patterns/${pattern.slug}`}
            className="group flex items-center justify-between gap-3 bg-card px-5 py-4 transition-colors hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
          >
            <span className="flex min-w-0 items-center gap-3">
              <span className="font-mono text-[10px] tabular-nums text-muted-foreground">
                {String(i + 1).padStart(2, '0')}
              </span>
              <span className="truncate text-sm font-medium text-foreground transition-colors group-hover:text-highlight">
                {pattern.label}
              </span>
            </span>
            <ArrowUpRight
              className="h-3.5 w-3.5 shrink-0 -translate-x-1 translate-y-1 text-muted-foreground opacity-0 transition-all duration-200 group-hover:translate-x-0 group-hover:translate-y-0 group-hover:opacity-100"
              aria-hidden="true"
            />
          </Link>
        ))}
      </div>
    </div>
  );
}
