'use client';

import * as React from 'react';
import {
  PageHeader,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  Button,
  Badge,
  Input,
  Label,
  Checkbox,
  Progress,
  Skeleton,
  Banner,
  EmptyState,
  Kbd,
  toast,
  cn,
} from '@ds/ui';
import {
  Compass,
  MousePointerClick,
  RotateCcw,
  ListOrdered,
  Plus,
  Users,
  Wallet,
  Send,
  Eye,
  X,
  ArrowLeft,
  ArrowRight,
  Play,
  CheckCircle2,
  type LucideIcon,
} from 'lucide-react';

const STORAGE_KEY = 'ds:tour-dismissed';
const GAP = 12;
const MARGIN = 12;
const STEP_CARD_WIDTH = 320;
const ESTIMATED_CARD_HEIGHT = 260;

type Placement = 'top' | 'bottom' | 'right' | 'left';
type TourKey = 'create' | 'segmentation' | 'budget' | 'publish';

const TOUR_SELECTOR = (key: TourKey) => `[data-tour="${key}"]`;

interface TourStep {
  key: TourKey;
  icon: LucideIcon;
  title: string;
  description: string;
  placement: Placement;
}

interface HighlightRect {
  top: number;
  left: number;
  width: number;
  height: number;
}

const TOUR_STEPS: TourStep[] = [
  {
    key: 'create',
    icon: Plus,
    title: 'Create your campaign',
    description:
      'Kick off a new campaign from the toolbar. You can also duplicate an existing one to reuse its targeting rules.',
    placement: 'bottom',
  },
  {
    key: 'segmentation',
    icon: Users,
    title: 'Segment your audience',
    description:
      'Reach the right people by combining location, device and interest rules into a reusable segment.',
    placement: 'right',
  },
  {
    key: 'budget',
    icon: Wallet,
    title: 'Set a daily budget',
    description:
      'Cap how much you spend per day. The dashboard shows a live burn-down against your limit.',
    placement: 'bottom',
  },
  {
    key: 'publish',
    icon: Send,
    title: 'Publish when ready',
    description:
      'Send the campaign to review. Once approved it starts serving to the segmented audience.',
    placement: 'top',
  },
];

const STATS: Array<{
  label: string;
  value: string;
  delta: string;
  tone: 'success' | 'muted';
  icon: LucideIcon;
}> = [
  { label: 'Reach', value: '412K', delta: '+12%', tone: 'success', icon: Eye },
  { label: 'CTR', value: '2.8%', delta: '+0.4pt', tone: 'success', icon: MousePointerClick },
  { label: 'Spend', value: '$31', delta: 'on track', tone: 'muted', icon: Wallet },
];

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function computeCardStyle(
  rect: DOMRect,
  placement: Placement,
  viewportWidth: number,
  viewportHeight: number
): React.CSSProperties {
  const centeredLeft = clamp(
    rect.left + rect.width / 2 - STEP_CARD_WIDTH / 2,
    MARGIN,
    viewportWidth - STEP_CARD_WIDTH - MARGIN
  );

  switch (placement) {
    case 'top': {
      if (rect.top - GAP - ESTIMATED_CARD_HEIGHT < MARGIN) {
        return { top: rect.bottom + GAP, left: centeredLeft };
      }
      return { top: rect.top - GAP, left: centeredLeft, transform: 'translateY(-100%)' };
    }
    case 'right': {
      if (rect.right + GAP + STEP_CARD_WIDTH > viewportWidth - MARGIN) {
        return { top: rect.bottom + GAP, left: centeredLeft };
      }
      return {
        top: rect.top + rect.height / 2,
        left: rect.right + GAP,
        transform: 'translateY(-50%)',
      };
    }
    case 'left': {
      if (rect.left - GAP - STEP_CARD_WIDTH < MARGIN) {
        return { top: rect.bottom + GAP, left: centeredLeft };
      }
      return {
        top: rect.top + rect.height / 2,
        left: rect.left - GAP - STEP_CARD_WIDTH,
        transform: 'translateY(-50%)',
      };
    }
    case 'bottom':
    default: {
      if (rect.bottom + GAP + ESTIMATED_CARD_HEIGHT > viewportHeight - MARGIN) {
        return { top: rect.top - GAP, left: centeredLeft, transform: 'translateY(-100%)' };
      }
      return { top: rect.bottom + GAP, left: centeredLeft };
    }
  }
}

function DemoSkeleton() {
  return (
    <Card className="overflow-hidden border-border shadow-lg">
      <CardHeader className="border-b border-border/60 bg-muted/20">
        <div className="flex items-center justify-between gap-3">
          <div className="space-y-2">
            <Skeleton className="h-5 w-44" />
            <Skeleton className="h-3 w-56 max-w-full" />
          </div>
          <Skeleton className="h-9 w-32" />
        </div>
      </CardHeader>
      <CardContent className="space-y-4 p-5">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <Skeleton className="h-16" />
          <Skeleton className="h-16" />
          <Skeleton className="h-16" />
        </div>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <Skeleton className="h-40" />
          <Skeleton className="h-40" />
          <Skeleton className="h-40" />
        </div>
      </CardContent>
      <CardFooter className="border-t border-border/60 bg-muted/20 p-4">
        <Skeleton className="ml-auto h-8 w-28" />
      </CardFooter>
    </Card>
  );
}

function CampaignDashboard() {
  return (
    <Card className="overflow-hidden border-border shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between gap-3 border-b border-border/60 bg-muted/20">
        <div className="min-w-0 space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <CardTitle className="text-base sm:text-lg">Campaign Dashboard</CardTitle>
            <Badge
              variant="outline"
              className="border-warning/40 bg-warning/10 text-warning"
            >
              Draft
            </Badge>
          </div>
          <CardDescription>Q3 brand awareness · Acme Co</CardDescription>
        </div>
        <div
          data-tour="create"
          className="shrink-0"
        >
          <Button
            className="gap-1.5"
            onClick={() =>
              toast({
                variant: 'success',
                title: 'Campaign draft created',
                description: 'A blank campaign was added to your workspace.',
              })
            }
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Create Campaign</span>
            <span className="sm:hidden">Create</span>
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-5 p-5">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {STATS.map((stat) => {
            const StatIcon = stat.icon;
            return (
              <div
                key={stat.label}
                className="flex items-center gap-3 rounded-lg border border-border bg-card p-3"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-highlight/10 text-highlight">
                  <StatIcon className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
                    {stat.label}
                  </p>
                  <div className="flex items-baseline gap-1.5">
                    <span className="font-display text-lg font-bold text-foreground">
                      {stat.value}
                    </span>
                    <span
                      className={cn(
                        'text-[10px] font-medium',
                        stat.tone === 'success' ? 'text-success' : 'text-muted-foreground'
                      )}
                    >
                      {stat.delta}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div
            data-tour="segmentation"
            className="space-y-3 rounded-lg border border-border bg-muted/20 p-4"
          >
            <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <Users className="h-4 w-4 text-highlight" />
              Segmentation
              <Badge variant="outline" className="ml-auto text-[10px]">
                3 rules
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">2.4M reachable users in segment</p>
            <div className="flex flex-wrap gap-1.5">
              <Badge variant="secondary">US + CA</Badge>
              <Badge variant="secondary">iOS &amp; Android</Badge>
              <Badge variant="secondary">Age 25–44</Badge>
            </div>
            <div className="flex items-center justify-between rounded-md bg-highlight/10 px-3 py-2 text-[11px]">
              <span className="font-medium text-highlight">Lookalike engine</span>
              <span className="font-mono text-foreground">4% match</span>
            </div>
          </div>

          <div className="space-y-3 rounded-lg border border-border bg-card p-4">
            <Label htmlFor="daily-budget">Daily budget (USD)</Label>
            <div
              data-tour="budget"
            >
              <Input
                id="daily-budget"
                type="number"
                min="1"
                defaultValue="50"
                startAdornment={<span>$</span>}
              />
            </div>
            <Progress value={62} className="h-2" />
            <p className="text-[11px] text-muted-foreground">
              Spent $31 of $50 today · pacing healthy
            </p>
          </div>

          <div className="space-y-3 rounded-lg border border-border bg-muted/20 p-4">
            <p className="text-sm font-semibold text-foreground">Reach forecast</p>
            <div className="flex items-end gap-2">
              <span className="font-display text-2xl font-bold text-foreground">1.2M</span>
              <span className="pb-1 text-[11px] text-muted-foreground">est. weekly</span>
            </div>
            <div className="flex h-16 items-end gap-1.5">
              {[40, 62, 48, 80, 55, 90, 70].map((height, index) => (
                <div
                  key={index}
                  style={{ height: `${height}%` }}
                  className="flex-1 rounded-t-sm bg-highlight/40"
                />
              ))}
            </div>
          </div>
        </div>
      </CardContent>

      <CardFooter className="flex flex-wrap items-center justify-between gap-3 border-t border-border/60 bg-muted/20 p-4">
        <p className="text-xs text-muted-foreground">Last saved 2 min ago · auto-save on</p>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            Save draft
          </Button>
          <div
            data-tour="publish"
          >
            <Button
              variant="success"
              size="sm"
              className="gap-1.5"
              onClick={() =>
                toast({
                  variant: 'success',
                  title: 'Campaign published',
                  description: 'Your campaign is now in review and will start serving soon.',
                })
              }
            >
              <Send className="h-3.5 w-3.5" />
              Publish
            </Button>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}

export default function ProductTourPage() {
  const [loading, setLoading] = React.useState(true);
  const [activeStep, setActiveStep] = React.useState<number | null>(null);
  const [showDismissedBanner, setShowDismissedBanner] = React.useState(false);
  const [dontShowAgain, setDontShowAgain] = React.useState(false);
  const [highlight, setHighlight] = React.useState<HighlightRect | null>(null);
  const [cardStyle, setCardStyle] = React.useState<React.CSSProperties>({});
  const [targetMissing, setTargetMissing] = React.useState(false);

  const stepCardRef = React.useRef<HTMLDivElement | null>(null);

  const getTarget = React.useCallback((key: TourKey) => {
    return document.querySelector<HTMLElement>(TOUR_SELECTOR(key));
  }, []);

  const startTour = React.useCallback(() => {
    setShowDismissedBanner(false);
    setActiveStep(0);
  }, []);

  const endTour = React.useCallback((completed: boolean) => {
    setActiveStep(null);
    setHighlight(null);
    setCardStyle({});
    setTargetMissing(false);
    if (completed) {
      toast({
        variant: 'success',
        title: 'Tour completed',
        description: 'You know the ropes now — happy campaigning!',
      });
    }
  }, []);

  const next = React.useCallback(() => {
    setActiveStep((prev) =>
      prev === null || prev >= TOUR_STEPS.length - 1 ? prev : prev + 1
    );
  }, []);

  const prev = React.useCallback(() => {
    setActiveStep((prev) => (prev === null || prev <= 0 ? prev : prev - 1));
  }, []);

  React.useEffect(() => {
    const id = window.setTimeout(() => {
      setLoading(false);
      const stored = localStorage.getItem(STORAGE_KEY) === 'true';
      if (stored) {
        setDontShowAgain(true);
        setShowDismissedBanner(true);
      } else {
        startTour();
      }
    }, 500);
    return () => window.clearTimeout(id);
  }, [startTour]);

  const measure = React.useCallback(() => {
    if (activeStep === null) return;
    const step = TOUR_STEPS[activeStep];
    const el = getTarget(step.key);
    if (!el) {
      setTargetMissing(true);
      setHighlight(null);
      setCardStyle({});
      return;
    }
    const rect = el.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) {
      setTargetMissing(true);
      setHighlight(null);
      setCardStyle({});
      return;
    }
    setTargetMissing(false);
    setHighlight({
      top: rect.top - 4,
      left: rect.left - 4,
      width: rect.width + 8,
      height: rect.height + 8,
    });
    setCardStyle(
      computeCardStyle(rect, step.placement, window.innerWidth, window.innerHeight)
    );
  }, [activeStep, getTarget]);

  React.useEffect(() => {
    if (activeStep === null) return;
    const step = TOUR_STEPS[activeStep];
    const el = getTarget(step.key);
    if (el) {
      el.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
    const frame = window.requestAnimationFrame(() => measure());
    const timeout = window.setTimeout(() => measure(), 400);
    window.addEventListener('resize', measure);
    window.addEventListener('scroll', measure, true);
    return () => {
      window.cancelAnimationFrame(frame);
      window.clearTimeout(timeout);
      window.removeEventListener('resize', measure);
      window.removeEventListener('scroll', measure, true);
    };
  }, [activeStep, measure, getTarget]);

  React.useEffect(() => {
    if (activeStep === null || targetMissing) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        endTour(false);
      } else if (event.key === 'ArrowRight') {
        event.preventDefault();
        next();
      } else if (event.key === 'ArrowLeft') {
        event.preventDefault();
        prev();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [activeStep, targetMissing, endTour, next, prev]);

  React.useEffect(() => {
    if (activeStep !== null && !targetMissing) {
      stepCardRef.current?.focus({ preventScroll: true });
    }
  }, [activeStep, targetMissing]);

  const handleDontShowAgain = (checked: boolean) => {
    setDontShowAgain(checked);
    if (checked) {
      localStorage.setItem(STORAGE_KEY, 'true');
      setShowDismissedBanner(true);
      endTour(false);
      toast({
        variant: 'info',
        title: 'Tour dismissed',
        description: 'We won\u2019t auto-start the tour again in this browser.',
      });
    } else {
      localStorage.removeItem(STORAGE_KEY);
      setShowDismissedBanner(false);
    }
  };

  const restartTour = () => {
    localStorage.removeItem(STORAGE_KEY);
    setDontShowAgain(false);
    setShowDismissedBanner(false);
    startTour();
    toast({
      variant: 'success',
      title: 'Tour restarted',
      description: 'Coach marks are back, starting from step one.',
    });
  };

  const step = activeStep !== null ? TOUR_STEPS[activeStep] : null;
  const StepIcon = step?.icon;

  return (
    <div className="space-y-10 animate-in fade-in-50 duration-200">
      <PageHeader
        eyebrow="UX Recipe Scenario"
        eyebrowIcon={Compass}
        title="Guided Product Tour & Coach Marks"
        description="A step-by-step onboarding tour that dims the page and rings the current target. Built from scratch with React state and geometry — no tour library required — with keyboard navigation, reduced-motion support and localStorage persistence."
      />

      {/* Interactive demo surface */}
      <section id="demo-surface" className="space-y-4 scroll-mt-20">
        <h2 className="flex items-center gap-2 font-display text-2xl font-bold text-foreground">
          <MousePointerClick className="h-6 w-6 text-highlight" />
          <span>Interactive Demo Surface</span>
        </h2>

        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-dashed border-border bg-card/50 p-4">
          <div className="space-y-0.5">
            <p className="text-sm font-semibold text-foreground">Try the guided tour</p>
            <p className="text-xs text-muted-foreground">
              Start the tour to walk through the dashboard with coach marks. Use the arrows,
              keyboard, or the step list below.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button onClick={startTour} disabled={loading} className="gap-1.5">
              <Play className="h-4 w-4" />
              Start Tour
            </Button>
            {activeStep !== null && (
              <Button variant="outline" onClick={() => endTour(false)}>
                Stop
              </Button>
            )}
          </div>
        </div>

        {loading ? <DemoSkeleton /> : <CampaignDashboard />}
      </section>

      {/* Dismiss & persistence */}
      <section id="dismiss-persistence" className="space-y-4 scroll-mt-20">
        <h2 className="flex items-center gap-2 font-display text-2xl font-bold text-foreground">
          <RotateCcw className="h-6 w-6 text-highlight" />
          <span>Dismiss &amp; Persistence</span>
        </h2>

        {showDismissedBanner && (
          <Banner variant="info" dismissible={false} icon={RotateCcw}>
            Tour dismissed. Restart available below.
          </Banner>
        )}

        <Card className="border-border">
          <CardHeader>
            <CardTitle>Control the tour</CardTitle>
            <CardDescription>
              The &quot;Don&apos;t show this again&quot; flag is persisted to localStorage under{' '}
              <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-[11px]">
                {STORAGE_KEY}
              </code>{' '}
              and read back on mount.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-border bg-card/40 p-4 transition-colors hover:bg-accent/50">
              <Checkbox
                checked={dontShowAgain}
                onCheckedChange={(checked) => handleDontShowAgain(checked === true)}
                className="mt-0.5"
              />
              <div className="space-y-1">
                <p className="text-sm font-medium text-foreground">Don&apos;t show this again</p>
                <p className="text-xs text-muted-foreground">
                  Skips the auto-start on the next visit to this page.
                </p>
              </div>
            </label>

            <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-dashed border-border bg-muted/20 p-4">
              <div className="space-y-1">
                <p className="text-sm font-semibold text-foreground">Restart the tour</p>
                <p className="text-xs text-muted-foreground">
                  Clears the flag and relaunches the coach marks from step one.
                </p>
              </div>
              <Button variant="outline" onClick={restartTour} disabled={loading} className="gap-1.5">
                <RotateCcw className="h-4 w-4" />
                Restart Tour
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Tour steps editor */}
      <section id="steps-editor" className="space-y-4 scroll-mt-20">
        <h2 className="flex items-center gap-2 font-display text-2xl font-bold text-foreground">
          <ListOrdered className="h-6 w-6 text-highlight" />
          <span>Tour Steps Editor</span>
        </h2>

        <Card className="border-border">
          <CardContent className="divide-y divide-border p-0">
            {TOUR_STEPS.map((item, index) => {
              const ItemIcon = item.icon;
              const isActive = activeStep === index;
              return (
                <div
                  key={item.key}
                  className={cn(
                    'flex items-start gap-4 p-4 transition-colors sm:px-5',
                    isActive && 'bg-highlight/10'
                  )}
                >
                  <div
                    className={cn(
                      'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border font-mono text-xs font-semibold transition-colors',
                      isActive
                        ? 'border-highlight bg-highlight text-highlight-foreground'
                        : 'border-border bg-muted/30 text-muted-foreground'
                    )}
                  >
                    {index + 1}
                  </div>
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <ItemIcon
                        className={cn(
                          'h-4 w-4',
                          isActive ? 'text-highlight' : 'text-muted-foreground'
                        )}
                      />
                      <p className="text-sm font-semibold text-foreground">{item.title}</p>
                      <Badge variant="outline" className="font-mono text-[10px]">
                        {item.placement}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{item.description}</p>
                  </div>
                  {isActive && (
                    <div className="flex shrink-0 items-center gap-1">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7"
                        aria-label="Previous step"
                        onClick={prev}
                        disabled={index === 0}
                      >
                        <ArrowLeft className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7"
                        aria-label="Next step"
                        onClick={next}
                        disabled={index === TOUR_STEPS.length - 1}
                      >
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  )}
                </div>
              );
            })}
          </CardContent>
        </Card>
      </section>

      {/* Tour overlay */}
      {activeStep !== null && step && StepIcon && (
        <div
          className="fixed inset-0 z-overlay bg-background/80 backdrop-blur-sm"
          aria-hidden="true"
        >
          {highlight && !targetMissing && (
            <div
              className="pointer-events-none fixed rounded-xl border-2 border-highlight ring-4 ring-highlight/20 transition-all duration-300 ease-in-out motion-reduce:transition-none"
              style={{
                top: highlight.top,
                left: highlight.left,
                width: highlight.width,
                height: highlight.height,
              }}
            />
          )}

          {targetMissing ? (
            <div className="fixed inset-0 flex items-center justify-center p-4">
              <div className="w-full max-w-sm">
                <EmptyState
                  icon={MousePointerClick}
                  title="Target out of reach"
                  description="Some tour targets are hidden at this viewport size. Expand the window or scroll and the highlight will re-lock onto the dashboard."
                  actionLabel="Close tour"
                  onAction={() => endTour(false)}
                />
              </div>
            </div>
          ) : (
            <div
              ref={stepCardRef}
              role="dialog"
              aria-label={step.title}
              tabIndex={-1}
              className="fixed z-tooltip w-full max-w-xs outline-none"
              style={cardStyle}
            >
              <Card className="border-highlight/40 shadow-2xl">
                <CardHeader className="space-y-2 p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-highlight text-highlight-foreground">
                        <StepIcon className="h-3.5 w-3.5" />
                      </span>
                      <p className="font-mono text-[11px] font-semibold uppercase tracking-wider text-highlight">
                        Step {activeStep + 1} of {TOUR_STEPS.length}
                      </p>
                    </div>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="-mr-1 -mt-1 h-7 w-7"
                      aria-label="Skip tour"
                      onClick={() => endTour(false)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  <CardTitle className="text-base">{step.title}</CardTitle>
                  <CardDescription className="text-xs leading-relaxed">
                    {step.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 px-4 pb-4">
                  <Progress
                    value={((activeStep + 1) / TOUR_STEPS.length) * 100}
                    className="h-1.5"
                  />
                  <div className="flex items-center justify-between gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={prev}
                      disabled={activeStep === 0}
                      className="gap-1.5"
                    >
                      <ArrowLeft className="h-3.5 w-3.5" />
                      Back
                    </Button>
                    {activeStep === TOUR_STEPS.length - 1 ? (
                      <Button variant="highlight" size="sm" onClick={() => endTour(true)} className="gap-1.5">
                        Finish
                        <CheckCircle2 className="h-3.5 w-3.5" />
                      </Button>
                    ) : (
                      <Button size="sm" onClick={next} className="gap-1.5">
                        Next
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 pt-0.5 text-[11px] text-muted-foreground">
                    <Kbd size="sm">←</Kbd>
                    <Kbd size="sm">→</Kbd>
                    <span>navigate</span>
                    <span className="mx-0.5">·</span>
                    <Kbd size="sm">Esc</Kbd>
                    <span>to skip</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      )}
    </div>
  );
}