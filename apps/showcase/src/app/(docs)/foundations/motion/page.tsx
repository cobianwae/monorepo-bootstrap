'use client';

import * as React from 'react';
import { MOTION_TOKENS } from '@ds/tokens';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Button, Badge, Banner } from '@ds/ui';
import { Play, Sparkles, Timer, Zap, MoveRight } from 'lucide-react';
import { PageHeader } from '@ds/ui';

export default function MotionPage() {
  const [animate, setAnimate] = React.useState(false);
  const [key, setKey] = React.useState(0);

  const triggerAnimation = () => {
    setAnimate(false);
    setTimeout(() => {
      setAnimate(true);
      setKey((k) => k + 1);
    }, 50);
  };

  return (
    <div className="space-y-10 animate-in fade-in-50 duration-200">
      <PageHeader
        eyebrow="Foundations"
        eyebrowIcon={Timer}
        title="Motion & Animation"
        description={
          <>
            Intentional motion language built on a <strong>4-step duration scale</strong> and two easing
            curves (spring &amp; smooth), always respecting <strong>prefers-reduced-motion</strong>.
          </>
        }
        actions={
          <div className="flex items-center gap-2">
            <Badge variant="highlight" className="font-mono text-xs">
              {MOTION_TOKENS.durations.fast} · {MOTION_TOKENS.durations.normal} · {MOTION_TOKENS.durations.slow}
            </Badge>
            <Badge variant="outline" className="font-mono text-xs">
              WCAG 2.3.3 Reduced Motion
            </Badge>
          </div>
        }
      />

      <Banner variant="highlight" actionText="Play All" actionHref="#durations">
        <strong>Motion principles:</strong> subtle by default, directional, and never the only channel for conveying state (color + motion together).
      </Banner>

      {/* Duration Scale */}
      <section id="durations" className="space-y-4 scroll-mt-20">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h2 className="text-2xl font-bold text-foreground font-display flex items-center gap-2">
              <Timer className="h-6 w-6 text-highlight" />
              <span>Duration Scale</span>
            </h2>
            <p className="text-sm text-muted-foreground">
              Fast for micro-interactions, normal for UI transitions, slow for large structural movement.
            </p>
          </div>
          <Button size="sm" onClick={triggerAnimation} className="gap-1.5">
            <Play className="h-3.5 w-3.5" />
            Play Animations
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              name: 'Fast',
              value: MOTION_TOKENS.durations.fast,
              use: 'Button active states, tooltip fade-in, checkbox toggles.',
              cls: 'duration-150 ease-out',
            },
            {
              name: 'Normal',
              value: MOTION_TOKENS.durations.normal,
              use: 'Dropdown menus, modals, tab switches, accordion expands.',
              cls: 'duration-250 ease-spring',
            },
            {
              name: 'Slow',
              value: MOTION_TOKENS.durations.slow,
              use: 'Page transitions, large slide-out drawers, multi-step morphing.',
              cls: 'duration-400 ease-smooth',
            },
          ].map((item) => (
            <Card key={item.name} className="border-border">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">{item.name} ({item.value})</CardTitle>
                <CardDescription className="text-xs">{item.use}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-16 w-full rounded-lg bg-muted p-2 flex items-center">
                  <div
                    key={key}
                    className={`h-12 w-12 rounded-lg bg-primary transition-all ${item.cls} motion-reduce:transition-none ${
                      animate ? 'translate-x-[180px] bg-success' : 'translate-x-0'
                    }`}
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Easing Curves */}
      <section id="easings" className="space-y-4 scroll-mt-20">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold text-foreground font-display flex items-center gap-2">
            <Zap className="h-6 w-6 text-highlight" />
            <span>Easing Curves</span>
          </h2>
          <p className="text-sm text-muted-foreground">
            Spring for entry &amp; emphasis, smooth for exits and neutral movement.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            {
              name: 'Spring',
              value: MOTION_TOKENS.easings.spring,
              use: 'Entrance, emphasis, playful micro-interactions.',
              cls: 'ease-spring',
            },
            {
              name: 'Smooth',
              value: MOTION_TOKENS.easings.smooth,
              use: 'Exits, dismissals, and neutral layout movement.',
              cls: 'ease-smooth',
            },
          ].map((item) => (
            <Card key={item.name} className="border-border">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">{item.name} Easing</CardTitle>
                <CardDescription className="text-xs font-mono">{item.value}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-16 w-full rounded-lg bg-muted p-2 flex items-center overflow-hidden">
                  <div
                    key={`${key}-${item.name}`}
                    className={`h-12 w-12 rounded-lg bg-highlight transition-transform duration-500 ${item.cls} motion-reduce:transition-none ${
                      animate ? 'translate-x-[220px]' : 'translate-x-0'
                    }`}
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Directional Motion */}
      <section id="direction" className="space-y-4 scroll-mt-20">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold text-foreground font-display flex items-center gap-2">
            <MoveRight className="h-6 w-6 text-highlight" />
            <span>Directional Motion</span>
          </h2>
          <p className="text-sm text-muted-foreground">
            Movement should mirror spatial relationships: content enters from where it will live, exits toward where it came from.
          </p>
        </div>

        <Card className="border-border">
          <CardContent className="p-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { dir: 'Slide In (right)', from: '-translate-x-24 opacity-0', to: 'translate-x-0 opacity-100' },
              { dir: 'Slide Up (bottom)', from: 'translate-y-8 opacity-0', to: 'translate-y-0 opacity-100' },
              { dir: 'Scale Fade (modal)', from: 'scale-90 opacity-0', to: 'scale-100 opacity-100' },
            ].map((item) => (
              <div
                key={item.dir}
                className="rounded-xl border border-border bg-muted/20 p-4 space-y-3 flex flex-col justify-between"
              >
                <span className="text-xs font-mono text-muted-foreground">{item.dir}</span>
                <div className="h-20 rounded-lg bg-card border border-border flex items-center justify-center overflow-hidden">
                  <div
                    key={`${key}-${item.dir}`}
                    className={`h-8 w-24 rounded-md bg-primary/20 border border-primary/40 flex items-center justify-center text-[10px] font-mono text-primary transition-all duration-300 ease-smooth motion-reduce:transition-none ${
                      animate ? item.to : item.from
                    }`}
                  >
                    Element
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>

      {/* Reduced Motion */}
      <section id="reduced-motion" className="space-y-4 scroll-mt-20">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold text-foreground font-display flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-highlight" />
            <span>Reduced Motion Support</span>
          </h2>
          <p className="text-sm text-muted-foreground">
            Every animation ships with a <code className="font-mono text-xs">motion-reduce:transition-none</code> fallback and respects the user&apos;s system preference.
          </p>
        </div>

        <Card className="border-border">
          <CardContent className="p-6 space-y-3">
            <div className="rounded-lg bg-muted/40 p-4 font-mono text-xs text-muted-foreground overflow-x-auto">
              <pre>{`<div className="transition-all duration-300 ease-spring motion-reduce:transition-none">
  content
</div>`}</pre>
            </div>
            <p className="text-xs text-muted-foreground">
              Skeleton loaders, spinners, and carousels must also pause or slow when reduced motion is active.
            </p>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
