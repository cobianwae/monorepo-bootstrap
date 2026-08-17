'use client';

import * as React from 'react';
import {
  Card,
  CardContent,
  Button,
  Badge,
  Switch,
  ToastAction,
  toast,
} from '@ds/ui';
import {
  Sparkles,
  Zap,
  Star,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { cn } from '@ds/ui';
import { PageHeader } from '@ds/ui';

interface Feature {
  id: string;
  title: string;
  description: string;
  enabled: boolean;
  synced: boolean;
}

interface Favorite {
  id: string;
  name: string;
  starred: boolean;
}

const INITIAL_FEATURES: Feature[] = [
  {
    id: 'f1',
    title: 'Real-time Notifications',
    description: 'Push live updates to subscribed clients over WebSocket.',
    enabled: true,
    synced: true,
  },
  {
    id: 'f2',
    title: 'Dark Mode',
    description: 'Persist user appearance preference and sync across devices.',
    enabled: true,
    synced: true,
  },
  {
    id: 'f3',
    title: 'Beta Analytics',
    description: 'Granular event pipeline for product telemetry.',
    enabled: false,
    synced: true,
  },
  {
    id: 'f4',
    title: 'API Rate Limiting',
    description: 'Per-key quota enforcement for public endpoints.',
    enabled: false,
    synced: true,
  },
];

const INITIAL_FAVORITES: Favorite[] = [
  { id: 'p1', name: 'tokens.css', starred: true },
  { id: 'p2', name: 'data-table/page.tsx', starred: true },
  { id: 'p3', name: 'workspace/page.tsx', starred: false },
  { id: 'p4', name: 'command-palette.tsx', starred: false },
];

// ~25% chance the simulated API call fails, to demonstrate rollback
function simulateApiCall(successRate = 0.75): Promise<boolean> {
  return new Promise((resolve) => {
    setTimeout(() => resolve(Math.random() < successRate), 900);
  });
}

export default function OptimisticUpdatesPage() {
  const [features, setFeatures] = React.useState<Feature[]>(INITIAL_FEATURES);
  const [favorites, setFavorites] = React.useState<Favorite[]>(INITIAL_FAVORITES);
  const [pendingIds, setPendingIds] = React.useState<string[]>([]);

  const toggleFeature = async (id: string) => {
    const feature = features.find((f) => f.id === id);
    if (!feature) return;

    // Optimistic update: flip the switch immediately
    const nextValue = !feature.enabled;
    setFeatures((prev) =>
      prev.map((f) =>
        f.id === id ? { ...f, enabled: nextValue, synced: false } : f
      )
    );
    setPendingIds((prev) => [...prev, id]);

    const ok = await simulateApiCall();
    setPendingIds((prev) => prev.filter((p) => p !== id));

    if (ok) {
      setFeatures((prev) =>
        prev.map((f) => (f.id === id ? { ...f, synced: true } : f))
      );
      toast({
        variant: 'success',
        title: nextValue ? 'Feature enabled' : 'Feature disabled',
        description: `${feature.title} was saved to the server.`,
      });
    } else {
      // Rollback on failure
      setFeatures((prev) =>
        prev.map((f) =>
          f.id === id ? { ...f, enabled: feature.enabled, synced: true } : f
        )
      );
      toast({
        variant: 'destructive',
        title: 'Update failed',
        description: `Could not ${nextValue ? 'enable' : 'disable'} ${feature.title}. Changes were rolled back.`,
        action: (
          <ToastAction altText="Retry" onClick={() => toggleFeature(id)}>
            <RefreshCw className="h-3 w-3 mr-1" />
            Retry
          </ToastAction>
        ),
      });
    }
  };

  const toggleStar = async (id: string) => {
    const fav = favorites.find((f) => f.id === id);
    if (!fav) return;

    const nextValue = !fav.starred;
    setFavorites((prev) =>
      prev.map((f) => (f.id === id ? { ...f, starred: nextValue } : f))
    );
    setPendingIds((prev) => [...prev, id]);

    const ok = await simulateApiCall(0.7);
    setPendingIds((prev) => prev.filter((p) => p !== id));

    if (ok) {
      toast({
        variant: 'success',
        title: nextValue ? 'Bookmarked' : 'Removed bookmark',
        description: `${fav.name} ${nextValue ? 'added to' : 'removed from'} your starred files.`,
      });
    } else {
      setFavorites((prev) =>
        prev.map((f) => (f.id === id ? { ...f, starred: fav.starred } : f))
      );
      toast({
        variant: 'destructive',
        title: 'Sync failed',
        description: `Could not update ${fav.name}. Changes were rolled back.`,
        action: (
          <ToastAction altText="Retry" onClick={() => toggleStar(id)}>
            <RefreshCw className="h-3 w-3 mr-1" />
            Retry
          </ToastAction>
        ),
      });
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in-50 duration-200">
      <PageHeader
        eyebrow="UX Recipe Scenario"
        eyebrowIcon={Sparkles}
        title="Optimistic Updates with Auto-Rollback"
        description="Apply UI changes instantly for a snappy feel, then reconcile with the server. If the API fails, the interface rolls back and surfaces a persistent error toast with a Retry action."
      />

      {/* Explain card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-border">
          <CardContent className="p-5 space-y-2">
            <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <Zap className="h-4 w-4 text-primary" />
              1. Update instantly
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              The UI reflects the new state immediately — no waiting for the round-trip.
            </p>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardContent className="p-5 space-y-2">
            <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <CheckCircle2 className="h-4 w-4 text-success" />
              2. Reconcile
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              A background call confirms the change; success shows a confirming toast.
            </p>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardContent className="p-5 space-y-2">
            <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <AlertTriangle className="h-4 w-4 text-destructive" />
              3. Rollback on failure
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              If the API rejects the change, the UI reverts and an error toast with Retry appears.
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Feature toggles */}
        <Card className="border-border">
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-foreground">Feature Flags</h2>
              <Badge variant="outline" className="text-[10px]">
                ~75% success rate
              </Badge>
            </div>

            <div className="space-y-3">
              {features.map((feature) => {
                const isPending = pendingIds.includes(feature.id);
                return (
                  <div
                    key={feature.id}
                    className="flex items-center justify-between gap-4 rounded-lg border border-border bg-card/40 p-3.5"
                  >
                    <div className="min-w-0 space-y-0.5">
                      <p className="text-sm font-medium text-foreground">
                        {feature.title}
                      </p>
                      <p className="text-xs text-muted-foreground line-clamp-1">
                        {feature.description}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {isPending && (
                        <RefreshCw className="h-3.5 w-3.5 animate-spin text-muted-foreground" />
                      )}
                      <Switch
                        checked={feature.enabled}
                        onCheckedChange={() => toggleFeature(feature.id)}
                        disabled={isPending}
                        aria-label={`Toggle ${feature.title}`}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Starred files */}
        <Card className="border-border">
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-foreground">Starred Files</h2>
              <Badge variant="outline" className="text-[10px]">
                ~70% success rate
              </Badge>
            </div>

            <div className="space-y-3">
              {favorites.map((fav) => {
                const isPending = pendingIds.includes(fav.id);
                return (
                  <div
                    key={fav.id}
                    className="flex items-center justify-between gap-4 rounded-lg border border-border bg-card/40 p-3.5"
                  >
                    <span className="truncate font-mono text-sm text-foreground">
                      {fav.name}
                    </span>
                    <button
                      type="button"
                      disabled={isPending}
                      onClick={() => toggleStar(fav.id)}
                      aria-label={fav.starred ? `Unstar ${fav.name}` : `Star ${fav.name}`}
                      aria-pressed={fav.starred}
                      className={cn(
                        'rounded-md p-1.5 transition-colors cursor-pointer disabled:opacity-60',
                        fav.starred
                          ? 'text-amber-400 hover:text-amber-500'
                          : 'text-muted-foreground hover:text-foreground'
                      )}
                    >
                      <Star className="h-4 w-4" fill={fav.starred ? 'currentColor' : 'none'} />
                    </button>
                  </div>
                );
              })}
            </div>

            <p className="text-xs text-muted-foreground">
              Tip: try rapid toggling — some calls will fail to show the rollback pattern.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Reset demo */}
      <div className="flex justify-center">
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setFeatures(INITIAL_FEATURES);
            setFavorites(INITIAL_FAVORITES);
            toast({
              variant: 'info',
              title: 'Demo reset',
              description: 'All features and bookmarks restored to defaults.',
            });
          }}
        >
          <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
          Reset demo
        </Button>
      </div>
    </div>
  );
}