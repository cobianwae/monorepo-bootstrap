import { Sparkle } from 'lucide-react';
import { cn } from '@ds/ui';

const MARQUEE_ITEMS = [
  'Data Table',
  'Kanban',
  'Command Palette',
  'Global Search',
  'Dashboard',
  'Master Detail',
  'Stepper',
  'Dynamic Form',
  'File Upload',
  'Rich Text Editor',
  'Infinite Scroll',
  'Virtualized List',
  'Activity Feed',
  'Notifications',
  'Calendar',
  'Media Gallery',
  'Comments',
  'Auth',
  'Onboarding',
  'Product Tour',
  'Settings',
  'Billing',
  'Results',
  'Optimistic Updates',
  'Workspace',
  'Master Data',
] as const;

/**
 * Kinetic ticker announcing the pattern library's breadth.
 * Pauses on hover/focus, static under prefers-reduced-motion.
 */
export function Marquee({ className }: { className?: string }) {
  // Two exact copies so the -50% translate loops seamlessly.
  const copies = [0, 1] as const;

  return (
    <div
      className={cn(
        'group relative overflow-hidden border-y border-border/60 bg-muted/20 py-4',
        className
      )}
      aria-label="Pattern library index"
    >
      {/* Edge fades */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-background to-transparent"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-background to-transparent"
      />

      <div className="animate-marquee flex w-max group-hover:[animation-play-state:paused]">
        {copies.map((copy) => (
          <div
            key={copy}
            aria-hidden={copy === 1}
            className="flex shrink-0 items-center"
          >
            {MARQUEE_ITEMS.map((item) => (
              <span
                key={item}
                className="flex items-center gap-6 pr-6 font-mono text-xs font-medium uppercase tracking-widest text-muted-foreground"
              >
                {item}
                <Sparkle className="h-3 w-3 text-highlight/70" aria-hidden="true" />
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
