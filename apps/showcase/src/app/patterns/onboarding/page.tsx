'use client';

import * as React from 'react';
import {
  Card,
  CardContent,
  Button,
  Badge,
  Progress,
  Checkbox,
  toast,
} from '@ds/ui';
import {
  Sparkles,
  Compass,
  Rocket,
  CheckCircle2,
  ArrowRight,
  X,
  Star,
  Users,
  Database,
} from 'lucide-react';
import { cn } from '@ds/ui';
import { PageHeader } from '../../../components/page-header';

const STORAGE_KEY = 'ds-onboarding-dismissed';

const CHECKLIST = [
  { id: 'profile', label: 'Complete your profile', description: 'Add your name, role and avatar.', icon: Users },
  { id: 'invite', label: 'Invite your team', description: 'Bring up to 10 teammates.', icon: Rocket },
  { id: 'source', label: 'Connect a data source', description: 'Link your database or API.', icon: Database },
  { id: 'star', label: 'Bookmark a favorite', description: 'Star your most-used file or page.', icon: Star },
];

export default function OnboardingPatternPage() {
  const [showBanner, setShowBanner] = React.useState(false);
  const [showModal, setShowModal] = React.useState(false);
  const [completedIds, setCompletedIds] = React.useState<string[]>([]);
  const [resolved, setResolved] = React.useState(false);

  // Detect first visit on mount via localStorage
  React.useEffect(() => {
    const dismissed = localStorage.getItem(STORAGE_KEY) === 'true';
    if (!dismissed) {
      // First visit: show banner, then modal after a short delay
      setShowBanner(true);
      const id = window.setTimeout(() => setShowModal(true), 600);
      return () => window.clearTimeout(id);
    }
    setResolved(true);
  }, []);

  const dismissAll = () => {
    localStorage.setItem(STORAGE_KEY, 'true');
    setShowBanner(false);
    setShowModal(false);
    setResolved(true);
    toast({
      variant: 'info',
      title: 'Onboarding skipped',
      description: 'You can re-enable it by clearing site data.',
    });
  };

  const toggleItem = (id: string) => {
    setCompletedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const progress = Math.round((completedIds.length / CHECKLIST.length) * 100);
  const allDone = completedIds.length === CHECKLIST.length;

  return (
    <div className="space-y-10 animate-in fade-in-50 duration-200">
      <PageHeader
        eyebrow="UX Recipe Scenario"
        eyebrowIcon={Sparkles}
        title="Onboarding & First Visit"
        description="Welcome new users with a dismissible banner and a short checklist modal. Progress is tracked locally and completion unlocks a success state. A clear Skip action is always visible."
      />

      {/* Controls */}
      <div className="flex flex-wrap items-center gap-3 rounded-xl border border-dashed border-border bg-card/50 p-6">
        <div className="flex-1 space-y-1">
          <p className="text-sm font-semibold text-foreground">Simulate a first visit</p>
          <p className="text-xs text-muted-foreground">
            Click to reset the “dismissed” flag and replay the onboarding flow. On a real first
            visit the banner and checklist appear automatically.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              localStorage.removeItem(STORAGE_KEY);
              setShowBanner(true);
              setShowModal(true);
            }}
          >
            Replay onboarding
          </Button>
          <Button variant="ghost" size="sm" onClick={dismissAll}>
            Dismiss permanently
          </Button>
        </div>
      </div>

      {/* Welcome banner — dismissible */}
      {showBanner && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 rounded-xl border border-primary/30 bg-primary/10 p-4 animate-in slide-in-from-top-2 fade-in-50 duration-300">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Compass className="h-5 w-5" />
          </div>
          <div className="flex-1 space-y-0.5">
            <p className="text-sm font-semibold text-foreground">
              Welcome to the Design System!
            </p>
            <p className="text-xs text-muted-foreground">
              Complete a few quick steps to get the most out of your workspace.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" onClick={() => setShowModal(true)} className="gap-1.5">
              Get started
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={dismissAll}
              aria-label="Dismiss welcome banner"
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Onboarding checklist modal */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="onboarding-title"
        >
          <div
            className="absolute inset-0 bg-overlay backdrop-blur-xs"
            onClick={() => setShowModal(false)}
          />
          <Card
            className={cn(
              'relative z-10 w-full max-w-md border-border shadow-xl animate-in zoom-in-95 duration-200',
              allDone && 'border-success/40'
            )}
          >
            <CardContent className="p-6 space-y-5">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Step 1 of 2 · Let&apos;s get set up
                  </p>
                  <h2 id="onboarding-title" className="text-lg font-bold text-foreground">
                    {allDone ? 'All set!' : 'Finish your setup'}
                  </h2>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-8 w-8 p-0"
                  onClick={() => setShowModal(false)}
                  aria-label="Close onboarding modal"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* Progress */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Checklist progress</span>
                  <span className="font-semibold text-foreground">{progress}%</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>

              {/* Checklist */}
              <ul className="space-y-2">
                {CHECKLIST.map((item) => {
                  const Icon = item.icon;
                  const done = completedIds.includes(item.id);
                  return (
                    <li key={item.id}>
                      <label
                        className={cn(
                          'flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors',
                          done
                            ? 'border-success/40 bg-success/5'
                            : 'border-border bg-card/40 hover:bg-accent/50'
                        )}
                      >
                        <Checkbox
                          checked={done}
                          onCheckedChange={() => toggleItem(item.id)}
                          aria-label={item.label}
                          className="mt-0.5"
                        />
                        <div className="flex-1 space-y-0.5">
                          <div className="flex items-center gap-2">
                            <Icon
                              className={cn(
                                'h-3.5 w-3.5',
                                done ? 'text-success' : 'text-muted-foreground'
                              )}
                            />
                            <span
                              className={cn(
                                'text-sm font-medium',
                                done ? 'text-foreground' : 'text-foreground'
                              )}
                            >
                              {item.label}
                            </span>
                            {done && <CheckCircle2 className="h-3.5 w-3.5 text-success" />}
                          </div>
                          <p className="text-xs text-muted-foreground">{item.description}</p>
                        </div>
                      </label>
                    </li>
                  );
                })}
              </ul>

              {/* Footer actions */}
              <div className="flex items-center justify-between gap-2">
                <Button variant="ghost" size="sm" onClick={dismissAll} className="text-xs">
                  Skip for now
                </Button>
                <div className="flex items-center gap-2">
                  {allDone ? (
                    <Button
                      size="sm"
                      onClick={() => {
                        dismissAll();
                        toast({
                          variant: 'success',
                          title: 'Onboarding complete',
                          description: 'Your workspace is fully configured.',
                        });
                      }}
                      className="gap-1.5"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Launch workspace
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      onClick={() => setShowModal(false)}
                      className="gap-1.5"
                    >
                      Later
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Completion state */}
      {resolved && !showBanner && !showModal && (
        <Card className="border-border">
          <CardContent className="flex flex-col items-center gap-3 p-8 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-success/15 text-success">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">Onboarding completed</p>
              <p className="text-xs text-muted-foreground">
                The first-visit flow won&apos;t appear again for this browser.
              </p>
            </div>
            <Badge variant="outline" className="text-[10px]">
              localStorage: {STORAGE_KEY}
            </Badge>
          </CardContent>
        </Card>
      )}
    </div>
  );
}