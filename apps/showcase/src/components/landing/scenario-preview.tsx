import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Badge, Button, SectionNumber, cn } from '@ds/ui';

const SCENARIOS = [
  {
    id: 'crm',
    name: 'CRM Workspace',
    tagline: 'Revenue operations',
    href: '/crm',
    description:
      'A full revenue cockpit — lead pipelines, campaign tracking, a contact center, and an AI copilot drawer. Command palette included.',
    features: ['Leads Pipeline', 'Campaigns', 'Contact Center', 'AI Copilot'],
    bars: [40, 65, 45, 80, 58, 92, 70],
  },
  {
    id: 'clinic',
    name: 'Clinic Workspace',
    tagline: 'Care operations',
    href: '/clinic',
    description:
      'A clinical operations suite — patient records, appointment scheduling, consultation notes, and a point of sale. Calm under pressure.',
    features: ['Patients', 'Appointments', 'Consultations', 'Point of Sale'],
    bars: [55, 38, 72, 50, 88, 64, 76],
  },
] as const;

function ScenarioMockup({ bars }: { bars: readonly number[] }) {
  return (
    <div
      aria-hidden="true"
      className="relative overflow-hidden rounded-t-2xl border-b border-border/60 bg-muted/30 p-4"
    >
      <div className="overflow-hidden rounded-xl border border-border/60 bg-card shadow-sm">
        {/* Window chrome */}
        <div className="flex items-center gap-1.5 border-b border-border/60 px-3 py-2">
          <span className="h-2 w-2 rounded-full bg-border" />
          <span className="h-2 w-2 rounded-full bg-border" />
          <span className="h-2 w-2 rounded-full bg-border" />
          <span className="ml-2 h-2 w-16 rounded-full bg-muted" />
        </div>
        <div className="flex">
          {/* Sidebar */}
          <div className="hidden w-16 space-y-2 border-r border-border/60 p-3 sm:block">
            <span className="block h-2 w-8 rounded-full bg-highlight/60" />
            <span className="block h-2 w-10 rounded-full bg-muted" />
            <span className="block h-2 w-9 rounded-full bg-muted" />
            <span className="block h-2 w-10 rounded-full bg-muted" />
          </div>
          {/* Content: mini stats + bar chart */}
          <div className="flex-1 space-y-3 p-3">
            <div className="grid grid-cols-3 gap-2">
              {[0, 1, 2].map((i) => (
                <div key={i} className="space-y-1.5 rounded-lg border border-border/60 p-2">
                  <span className="block h-1.5 w-2/3 rounded-full bg-muted" />
                  <span className="block h-2.5 w-1/2 rounded-full bg-foreground/70" />
                </div>
              ))}
            </div>
            <div className="flex h-20 items-end gap-1.5 rounded-lg border border-border/60 p-3">
              {bars.map((height, i) => (
                <span
                  key={i}
                  className={cn(
                    'flex-1 rounded-t-sm transition-colors',
                    i === bars.length - 2 ? 'bg-highlight' : 'bg-primary/25'
                  )}
                  style={{ height: `${height}%` }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * The two flagship scenario apps — the deepest proof of the system. Each card
 * is a composed mock of the real workspace and links straight into it.
 */
export function ScenarioPreview() {
  return (
    <div>
      <div className="mb-10 max-w-2xl space-y-4">
        <SectionNumber number={4} label="Live Scenarios" />
        <h2 className="font-display text-3xl font-extrabold tracking-tight text-foreground sm:text-5xl">
          Two apps. Same system.
        </h2>
        <p className="leading-relaxed text-muted-foreground">
          Not screenshots — running applications composed entirely from Arah primitives and
          patterns. Launch one and stress-test the system yourself.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {SCENARIOS.map((scenario) => (
          <article
            key={scenario.id}
            className="group flex flex-col overflow-hidden rounded-2xl border border-border/60 bg-card transition-all duration-300 hover:-translate-y-1 hover:border-highlight/40 hover:shadow-xl"
          >
            <ScenarioMockup bars={scenario.bars} />

            <div className="flex flex-1 flex-col gap-4 p-6 md:p-8">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-widest text-highlight">
                  {scenario.tagline}
                </p>
                <h3 className="mt-1 font-display text-2xl font-bold text-foreground">
                  {scenario.name}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {scenario.description}
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                {scenario.features.map((feature) => (
                  <Badge key={feature} variant="outline" className="font-mono text-[10px]">
                    {feature}
                  </Badge>
                ))}
              </div>

              <div className="mt-auto pt-2">
                <Button asChild className="gap-2">
                  <Link href={scenario.href}>
                    Launch scenario
                    <ArrowRight
                      className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
                      aria-hidden="true"
                    />
                  </Link>
                </Button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
