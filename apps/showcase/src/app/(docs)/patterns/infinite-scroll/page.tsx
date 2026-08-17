'use client';

import * as React from 'react';
import {
  Card,
  CardContent,
  Badge,
  Avatar,
  AvatarFallback,
  Button,
  toast,
} from '@ds/ui';
import { Sparkles, Infinity as InfinityIcon, Loader2, Check, RefreshCw } from 'lucide-react';
import { cn } from '@ds/ui';
import { PageHeader } from '@ds/ui';

interface FeedItem {
  id: string;
  author: string;
  initials: string;
  action: string;
  target: string;
  time: string;
  tone: 'success' | 'info' | 'warning';
}

const PEOPLE = ['Amara', 'Julian', 'Priya', 'Marcus', 'Elena', 'Theo', 'Sofia', 'Hiro'];
const ACTIONS = [
  'deployed',
  'updated',
  'commented on',
  'approved',
  'requested changes on',
  'merged',
  'reverted',
];
const TARGETS = [
  'tokens.css',
  'auth.controller.ts',
  'command-palette.tsx',
  'data-table/page.tsx',
  'workspace/page.tsx',
  'schema.prisma',
  'button.tsx',
];

const BATCH_SIZE = 8;
const TONES: FeedItem['tone'][] = ['success', 'info', 'warning'];

function makeItem(id: string): FeedItem {
  return {
    id,
    author: PEOPLE[id.charCodeAt(0) % PEOPLE.length],
    initials: 'AB',
    action: ACTIONS[id.charCodeAt(id.length - 1) % ACTIONS.length],
    target: TARGETS[id.charCodeAt(id.length - 1) % TARGETS.length],
    time: `${Math.floor((id.charCodeAt(0) + id.charCodeAt(1)) % 59)}m ago`,
    tone: TONES[id.charCodeAt(1) % TONES.length],
  };
}

function generateBatch(start: number, count: number): FeedItem[] {
  return Array.from({ length: count }, (_, i) => makeItem(`feed_${start + i}`));
}

const INITIAL_ITEMS = generateBatch(0, BATCH_SIZE);
const TOTAL_ITEMS = 40;

export default function InfiniteScrollPage() {
  const [items, setItems] = React.useState<FeedItem[]>(INITIAL_ITEMS);
  const [isLoading, setIsLoading] = React.useState(false);
  const [hasMore, setHasMore] = React.useState(true);
  const loadMoreRef = React.useRef<HTMLDivElement>(null);

  const loadMore = React.useCallback(async () => {
    setIsLoading(true);
    // Simulate network latency
    await new Promise((resolve) => setTimeout(resolve, 800));
    setItems((prev) => {
      const next = generateBatch(prev.length, BATCH_SIZE);
      const merged = [...prev, ...next];
      if (merged.length >= TOTAL_ITEMS) {
        setHasMore(false);
        return merged.slice(0, TOTAL_ITEMS);
      }
      return merged;
    });
    setIsLoading(false);
  }, []);

  // Infinite scroll via IntersectionObserver on the trigger element
  React.useEffect(() => {
    const node = loadMoreRef.current;
    if (!node || !hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isLoading) {
          loadMore();
        }
      },
      { rootMargin: '200px' }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [hasMore, isLoading, loadMore]);

  return (
    <div className="space-y-10 animate-in fade-in-50 duration-200">
      <PageHeader
        eyebrow="UX Recipe Scenario"
        eyebrowIcon={Sparkles}
        title="Infinite Scroll / Load More"
        description="Stream long lists incrementally with an IntersectionObserver on a trigger element — not scroll listeners. A subtle spinner appears while fetching the next batch, and a clear end-of-feed state terminates the loop."
      />

      <div className="mx-auto max-w-2xl">
        <Card className="border-border">
          <CardContent className="p-0">
            {/* Feed header */}
            <div className="flex items-center justify-between border-b border-border px-5 py-3.5">
              <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <InfinityIcon className="h-4 w-4 text-primary" />
                Activity Feed
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-[10px]">
                  {items.length} / {TOTAL_ITEMS} loaded
                </Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs"
                  onClick={() => {
                    setItems(generateBatch(0, BATCH_SIZE));
                    setHasMore(true);
                    toast({
                      variant: 'info',
                      title: 'Feed reset',
                      description: 'Loaded the first batch again.',
                    });
                  }}
                >
                  <RefreshCw className="h-3 w-3 mr-1" />
                  Reset
                </Button>
              </div>
            </div>

            {/* Feed list */}
            <ul className="divide-y divide-border">
              {items.map((item) => (
                <li key={item.id} className="flex items-start gap-3 px-5 py-3.5 animate-in fade-in-50">
                  <Avatar className="h-9 w-9">
                    <AvatarFallback
                      className={cn(
                        'text-xs font-semibold',
                        item.tone === 'success' && 'bg-success/15 text-success',
                        item.tone === 'info' && 'bg-info/15 text-info',
                        item.tone === 'warning' && 'bg-warning/15 text-warning'
                      )}
                    >
                      {item.author.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-foreground">
                      <strong className="font-semibold">{item.author}</strong>{' '}
                      <span className="text-muted-foreground">{item.action}</span>{' '}
                      <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs text-primary">
                        {item.target}
                      </code>
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">{item.time}</p>
                  </div>
                </li>
              ))}
            </ul>

            {/* Trigger element for IntersectionObserver */}
            <div ref={loadMoreRef} className="border-t border-border">
              {isLoading ? (
                <div className="flex items-center justify-center gap-2 py-6 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                  Loading more activity...
                </div>
              ) : hasMore ? (
                <div className="flex items-center justify-center gap-2 py-6 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading more activity...
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2 py-6 text-sm text-muted-foreground">
                  <Check className="h-4 w-4 text-success" />
                  You&apos;re all caught up — end of feed.
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <p className="mt-4 text-xs text-muted-foreground text-center">
          Auto-loads the next batch when the trigger enters the viewport (rootMargin 200px).
          Scroll to the bottom to observe the spinner and the end-of-feed state.
        </p>
      </div>
    </div>
  );
}