'use client';

import * as React from 'react';
import {
  PageHeader,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Button,
  Badge,
  Progress,
  EmptyState,
  Banner,
} from '@ds/ui';
import { Tour, type TourStep, type TourStepStatus } from '@ds/ui';
import { Compass, MousePointerClick, RotateCcw, Copy, Check } from 'lucide-react';

const RESEP = `const [open, setOpen] = useState(false);
<Tour steps={STEPS} open={open}
  onFinish={(s) => {
    localStorage.setItem('tour-done',
      JSON.stringify(s));
    setOpen(false);
  }}
  onSkip={(s, at) => {
    localStorage.setItem('tour-skip',
      JSON.stringify({ at, s }));
    setOpen(false);
  }} />`;

type DemoVariant = 'penuh' | 'tiga-hilang' | 'semua-hilang' | 'kosong' | 'loading';

const VARIANT_LABEL: Record<DemoVariant, string> = {
  penuh: '5 valid steps',
  'tiga-hilang': 'Step 3 missing',
  'semua-hilang': 'All missing (error)',
  kosong: 'Empty',
  loading: 'Short loading trigger',
};

export default function ProductTourPatternPage() {
  const mulaiRef = React.useRef<HTMLButtonElement>(null);

  const [open, setOpen] = React.useState(false);
  const [variant, setVariant] = React.useState<DemoVariant>('penuh');
  const [sembunyiTiga, setSembunyiTiga] = React.useState(true);
  const [loadingDemo, setLoadingDemo] = React.useState(false);
  const [indeks, setIndeks] = React.useState(0);
  const [status, setStatus] = React.useState<TourStepStatus[]>([]);
  const [hasil, setHasil] = React.useState<string | null>(null);
  const [disalin, setDisalin] = React.useState(false);

  const hilangTiga = variant === 'tiga-hilang' || (variant === 'penuh' && sembunyiTiga);
  const semuaHilang = variant === 'semua-hilang';
  const kosong = variant === 'kosong';

  const steps: TourStep[] = React.useMemo(() => {
    if (kosong) return [];
    const dasar: Array<Omit<TourStep, 'target'>> = [
      { id: 'buat', title: 'Create a project', content: 'Start with the Create Project button in this example action bar.' },
      { id: 'cari', title: 'Find tasks', content: 'Filter the example task list without opening another page.' },
      { id: 'filter', title: 'Filter by status', content: 'Narrow the example cards to active items.' },
      { id: 'metrik', title: 'Review metrics', content: 'Check the example summary numbers before continuing.' },
      { id: 'tabel', title: 'Manage the table', content: 'Work with the example rows. This is the final tour step.' },
    ];
    return dasar.map((s) => ({
      ...s,
      target: semuaHilang ? `#tak-ada-${s.id}` : `[data-tour-target="${s.id}"]`,
    }));
  }, [kosong, semuaHilang]);

  const mulaiTur = React.useCallback(() => {
    if (steps.length === 0) return;
    if (variant === 'loading') {
      setLoadingDemo(true);
      window.setTimeout(() => {
        setLoadingDemo(false);
        setHasil(null);
        setStatus([]);
        setOpen(true);
      }, 400);
      return;
    }
    setHasil(null);
    setStatus([]);
    setOpen(true);
    requestAnimationFrame(() => mulaiRef.current?.focus({ preventScroll: true }));
  }, [steps.length, variant]);

  const salinResep = React.useCallback(async () => {
    try {
      await navigator.clipboard.writeText(RESEP);
      setDisalin(true);
      window.setTimeout(() => setDisalin(false), 1500);
    } catch {
      setDisalin(false);
    }
  }, []);


  return (
    <div className="flex flex-col gap-6 p-6">
      <PageHeader
        eyebrow="UX Recipe Scenario"
        eyebrowIcon={Compass}
        title="Product Tour"
        description="Start a guided tour of the example dashboard. Move through each spotlight with Next or Back, or close it from the popover."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline">driver.js</Badge>
            <Badge variant="outline">5 steps</Badge>
          </div>
        }
      />

      <ol className="flex flex-col gap-1 rounded-xl border border-border bg-card p-4 text-sm text-muted-foreground">
        <li>1. Select Start tour. The spotlight opens step 1 of 5.</li>
        <li>2. Continue until step 3 is hidden. It is skipped and announced.</li>
        <li>3. Continue to step 5 and select Finish. Focus returns to Start tour.</li>
        <li>4. Repeat, then press Esc on step 3.</li>
        <li>5. The Skip tour? confirmation appears after step 1. Select Yes.</li>
        <li>6. Focus returns to Start tour without an error.</li>
      </ol>

      <div className="flex flex-wrap items-center gap-2">
        <Button ref={mulaiRef} type="button" onClick={mulaiTur} data-testid="tour-start">
          <MousePointerClick className="h-4 w-4" />
          Start tour
        </Button>
      </div>

      <Card className="border-border">
        <CardHeader>
          <CardTitle>Example dashboard — tour targets</CardTitle>
          <CardDescription>A static example for the tour spotlight; not production data (S-005.20).</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <div data-tour-target="buat" className="rounded-lg border border-border bg-muted/20 px-4 py-3 text-sm font-medium">
              [Create Project] (step 1)
            </div>
            <div data-tour-target="cari" className="rounded-lg border border-border bg-muted/20 px-4 py-3 text-sm font-medium">
              [Find tasks] (step 2)
            </div>
            {!hilangTiga && !semuaHilang && (
              <div data-tour-target="filter" className="rounded-lg border border-border bg-muted/20 px-4 py-3 text-sm font-medium">
                [Filter status] (step 3)
              </div>
            )}
          </div>
          {!semuaHilang ? (
            <>
              <div data-tour-target="metrik" className="grid grid-cols-3 gap-2">
                {['Active 12', 'Done 48', 'Archived 7'].map((m) => (
                  <div key={m} className="rounded-lg border border-border bg-card px-3 py-4 text-center text-sm font-semibold">
                    {m} <span className="block text-xs font-normal text-muted-foreground">(step 4)</span>
                  </div>
                ))}
              </div>
              <div data-tour-target="tabel" className="rounded-lg border border-border">
                {['Task A — active', 'Task B — done', 'Task C — active'].map((r) => (
                  <div key={r} className="border-b border-border px-3 py-2 text-sm last:border-0">
                    {r}
                  </div>
                ))}
                <p className="px-3 py-2 text-xs text-muted-foreground">Example mini table (step 5).</p>
              </div>
            </>
          ) : (
            <p className="rounded-lg border border-destructive/40 bg-destructive/5 px-3 py-4 text-sm">All example targets are hidden for the error variant.</p>
          )}
        </CardContent>
      </Card>

      <div data-testid="tour-popover">
        <Tour
          steps={steps}
          open={open}
          onStepChange={(i) => setIndeks(i)}
          onFinish={(s) => {
            setStatus(s);
            setHasil('Tour finished — per-step status saved via onFinish.');
            setOpen(false);
            requestAnimationFrame(() => mulaiRef.current?.focus({ preventScroll: true }));
          }}
          onSkip={(s, at) => {
            setStatus(s);
            setHasil(`Tour skipped at step ${at + 1} — per-step status saved via onSkip.`);
            setOpen(false);
            requestAnimationFrame(() => mulaiRef.current?.focus({ preventScroll: true }));
          }}
        />
      </div>

      <Card className="border-border">
        <CardHeader>
          <CardTitle>Demo states</CardTitle>
          <CardDescription>Switch states without a reload; each state is visible in the showcase.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2" role="group" aria-label="Demo variant">
            {(Object.keys(VARIANT_LABEL) as DemoVariant[]).map((v) => (
              <Button
                key={v}
                type="button"
                variant={variant === v ? 'default' : 'outline'}
                size="sm"
                aria-pressed={variant === v}
                onClick={() => {
                  setVariant(v);
                  setOpen(false);
                }}
              >
                {VARIANT_LABEL[v]}
              </Button>
            ))}
          </div>
          <label className="flex cursor-pointer items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={sembunyiTiga}
              onChange={(e) => setSembunyiTiga(e.target.checked)}
              className="h-4 w-4 accent-[var(--primary)]"
            />
            Hide step 3 (without reload)
          </label>
          {loadingDemo && <Banner variant="info">Loading steps… (aria-busy, controls briefly disabled)</Banner>}
          {kosong && (
            <div role="status" className="rounded-lg border border-border px-3 py-2 text-sm">
              No tour steps yet — Start tour is disabled when steps are empty.
            </div>
          )}
          <div className="space-y-1" data-testid="tour-progress">
            <p className="text-sm font-medium">
              {steps.length === 0 ? 'Step 0 of 0' : `Step ${Math.min(indeks + 1, steps.length)} of ${steps.length}`}
            </p>
            <Progress value={steps.length === 0 ? 0 : ((Math.min(indeks + 1, steps.length)) / steps.length) * 100} className="h-1.5" />
          </div>
          {hasil && (
            <p role="status" data-testid="tour-confirm" className="rounded-lg border border-border bg-muted/20 px-3 py-2 text-sm">
              {hasil}
            </p>
          )}
          {status.length > 0 && (
            <ul className="space-y-1 text-xs text-muted-foreground">
              {status.map((s) => (
                <li key={s.id} className="font-mono">
                  {s.id} #{s.index + 1} — {s.result}
                </li>
              ))}
            </ul>
          )}
          {(status.some((s) => s.result === 'skipped-missing') || hilangTiga) && (
            <p className="rounded-lg border border-warning/40 bg-warning/10 px-3 py-2 text-sm">
              Step 3 skipped: target not found — text, not color alone.
            </p>
          )}
          {semuaHilang && (
            <div role="alert" className="rounded-lg border border-destructive/40 bg-destructive/5 px-3 py-2 text-sm">
              All targets missing — 5 of 5 targets not found.
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border-border">
        <CardHeader>
          <CardTitle>Implementation</CardTitle>
          <CardDescription>Copy the pattern and add your own persistence; the component does not store data internally.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <pre className="overflow-x-auto rounded-lg bg-muted p-3 font-mono text-xs">{RESEP}</pre>
          <Button type="button" variant="outline" size="sm" onClick={salinResep} className="gap-1.5">
            {disalin ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
            {disalin ? 'Copied' : 'Copy recipe'}
          </Button>
        </CardContent>
      </Card>

      <Card className="border-border">
        <CardHeader>
          <CardTitle>Keyboard, SR &amp; motion</CardTitle>
          <CardDescription>Focus order: trigger → popover → dialog → trigger. Reduced motion is instant.</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
            <li>Tab cycles within the popover footer; Enter activates the focused button.</li>
            <li>Esc starts the skip flow (a dialog appears after step 1; step 1 skips directly).</li>
            <li>Each step is announced with progress text; errors always use text with an alert/status role.</li>
            <li>Primary focus ring: 2px with a 2px offset; all buttons are at least 44px.</li>
            <li>With prefers-reduced-motion, the spotlight and scroll are instant.</li>
          </ul>
          <Button type="button" variant="outline" size="sm" className="mt-3 gap-1.5" onClick={() => setOpen(false)}>
            <RotateCcw className="h-3.5 w-3.5" />
            Close tour &amp; return focus
          </Button>
          {status.length === 0 && !hasil && (
            <div className="mt-3">
              <EmptyState
                icon={Compass}
                title="No tour results yet"
                description="Run the tour to see per-step status here."
                actionLabel="Start tour"
                onAction={mulaiTur}
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
