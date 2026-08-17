'use client';

import Link from 'next/link';
import { ArrowDown, ArrowRight, ArrowUpRight, Code2, MousePointerClick, Palette, ShieldCheck } from 'lucide-react';
import { Badge, Button, Container, GlowOrb, GridPattern, Kbd, SectionNumber } from '@ds/ui';
import { COLOR_TOKENS } from '@ds/tokens';
import { Reveal } from '@/components/reveal';
import {
  ContrastWidget,
  CopyInstall,
  HeroCanvas,
  LandingFooter,
  LandingNav,
  LiveStats,
  Marquee,
  OklchRamp,
  PatternGallery,
  ScenarioPreview,
  VoiceStage,
} from '@/components/landing';

const primaryToken = COLOR_TOKENS.find((t) => t.variable === '--primary');
const highlightToken = COLOR_TOKENS.find((t) => t.variable === '--highlight');

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <LandingNav />

      <main className="flex-1">
        {/* ——— HERO: Living Canvas ——— */}
        <section className="relative overflow-hidden pb-16 pt-14 lg:pb-24 lg:pt-20">
          <GridPattern fade="bottom" className="opacity-25" />
          <GlowOrb color="highlight" size="xl" position="top-center" className="opacity-15" />

          <Container size="xl" className="relative z-10">
            <div className="grid items-center gap-14 lg:grid-cols-[1.05fr_1fr]">
              <Reveal variant="fade">
                <div className="space-y-8">
                  <Badge
                    variant="outline"
                    className="border-highlight/25 bg-highlight/10 px-3.5 py-1 font-mono text-xs font-semibold tracking-wider text-highlight"
                  >
                    ARAH — DESIGN SYSTEM
                  </Badge>

                  <h1 className="font-display text-5xl font-extrabold leading-[1.05] tracking-tight text-foreground sm:text-6xl lg:text-7xl">
                    Direction,
                    <br />
                    <span className="text-highlight">by design.</span>
                  </h1>

                  <p className="max-w-xl text-lg leading-relaxed text-muted-foreground">
                    Arah is a design system built layer by layer — OKLCH color science,
                    WCAG-audited contrast, and Radix primitives — so every interface ships with
                    intent. Built slowly. Built surely.
                  </p>

                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                    <Button asChild size="lg" className="h-12 gap-2 rounded-full px-7 text-base">
                      <a href="#voices">
                        Feel the system
                        <ArrowDown className="h-4 w-4" aria-hidden="true" />
                      </a>
                    </Button>
                    <CopyInstall />
                  </div>

                  <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                    OKLCH Native · WCAG AAA Audited · 26 UX Patterns
                  </p>
                </div>
              </Reveal>

              <Reveal delay={150} variant="zoom">
                <HeroCanvas />
              </Reveal>
            </div>
          </Container>
        </section>

        {/* ——— KINETIC MARQUEE ——— */}
        <Marquee />

        {/* ——— 01 · VOICES ——— */}
        <section id="voices" className="scroll-mt-24 py-20 lg:py-28">
          <Container size="xl">
            <VoiceStage />
          </Container>
        </section>

        {/* ——— 02 · CRAFT ——— */}
        <section id="craft" className="scroll-mt-24 border-y border-border/50 bg-muted/20 py-20 lg:py-28">
          <Container size="xl">
            <div className="mb-12 max-w-3xl space-y-4">
              <SectionNumber number={2} label="The Craft" />
              <h2 className="font-display text-3xl font-extrabold tracking-tight text-foreground sm:text-5xl">
                The anatomy of craft
              </h2>
              <p className="text-lg leading-relaxed text-muted-foreground">
                We stopped guessing. Every decision is backed by color science, audited contrast,
                and primitives that respect everyone.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-12">
              {/* OKLCH — live ramp from active tokens */}
              <div className="group relative flex flex-col overflow-hidden rounded-3xl border border-border bg-card md:col-span-12 lg:col-span-8">
                <div className="absolute inset-0 bg-gradient-to-br from-highlight/5 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                <div className="relative z-10 flex flex-1 flex-col p-8 md:p-10">
                  <div className="mb-8 max-w-md">
                    <div className="mb-6 flex h-10 w-10 items-center justify-center rounded-xl bg-highlight/10">
                      <Palette className="h-5 w-5 text-highlight" aria-hidden="true" />
                    </div>
                    <h3 className="mb-3 font-display text-2xl font-bold text-foreground">
                      OKLCH Color Science
                    </h3>
                    <p className="leading-relaxed text-muted-foreground">
                      We abandoned RGB and HSL. Perceptually uniform lightness means every tone —
                      from Pulse to Botanic — stays legible at every step.
                    </p>
                  </div>
                  <div className="mt-auto">
                    <OklchRamp />
                  </div>
                </div>
              </div>

              {/* WCAG — live contrast audit */}
              <div className="relative flex flex-col overflow-hidden rounded-3xl border border-border bg-card p-8 md:col-span-6 lg:col-span-4">
                <div className="mb-6 flex h-10 w-10 items-center justify-center rounded-xl bg-success/10">
                  <ShieldCheck className="h-5 w-5 text-success" aria-hidden="true" />
                </div>
                <h3 className="mb-3 font-display text-2xl font-bold text-foreground">
                  WCAG AAA Guaranteed
                </h3>
                <p className="mb-6 leading-relaxed text-muted-foreground">
                  Contrast is enforced by the token pipeline, not by hope.
                </p>
                <div className="mt-auto">
                  <ContrastWidget />
                </div>
              </div>

              {/* A11y — real focusable primitives */}
              <div className="relative flex flex-col justify-between overflow-hidden rounded-3xl border border-border bg-card p-8 md:col-span-6 lg:col-span-5">
                <div>
                  <div className="mb-6 flex h-10 w-10 items-center justify-center rounded-xl bg-foreground/5">
                    <MousePointerClick className="h-5 w-5 text-foreground" aria-hidden="true" />
                  </div>
                  <h3 className="mb-3 font-display text-2xl font-bold text-foreground">
                    Zero-Compromise A11y
                  </h3>
                  <p className="leading-relaxed text-muted-foreground">
                    Focus management, keyboard navigation, and ARIA semantics come natively via
                    Radix primitives. Try it — this demo is real.
                  </p>
                </div>
                <div className="mt-8 rounded-xl border border-dashed border-border bg-muted/30 p-5">
                  <div className="flex flex-wrap gap-3">
                    <Button size="sm">Primary</Button>
                    <Button size="sm" variant="outline">
                      Outline
                    </Button>
                    <Button size="sm" variant="ghost">
                      Ghost
                    </Button>
                  </div>
                  <p className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
                    Press
                    <Kbd>Tab</Kbd>
                    — the focus ring is always visible
                  </p>
                </div>
              </div>

              {/* CSS-first — snippet from real token values */}
              <div className="relative flex flex-col overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-950 p-8 text-zinc-50 md:col-span-12 lg:col-span-7">
                <GridPattern fade="top" className="opacity-10" />
                <div className="relative z-10 flex h-full flex-col justify-between">
                  <div className="max-w-md">
                    <div className="mb-6 flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-800">
                      <Code2 className="h-5 w-5 text-zinc-300" aria-hidden="true" />
                    </div>
                    <h3 className="mb-3 font-display text-2xl font-bold text-white">
                      CSS-First Architecture
                    </h3>
                    <p className="leading-relaxed text-zinc-400">
                      Tailwind v4 with @theme directives and pure CSS layers. Zero runtime
                      overhead — the cascade does the work.
                    </p>
                  </div>

                  <div className="mt-8 overflow-hidden rounded-xl border border-zinc-800/60 bg-zinc-900/50 p-4 font-mono text-sm backdrop-blur-sm">
                    <div className="mb-3 flex gap-2" aria-hidden="true">
                      <span className="h-2.5 w-2.5 rounded-full bg-zinc-700" />
                      <span className="h-2.5 w-2.5 rounded-full bg-zinc-700" />
                      <span className="h-2.5 w-2.5 rounded-full bg-zinc-700" />
                    </div>
                    <pre aria-label="Theme token CSS example">
                      <code>
                        <span className="text-pink-400">@theme</span>
                        <span className="text-zinc-300">{' {'}</span>
                        {'\n'}
                        <span className="text-zinc-500">
                          {'  /* Live values from @ds/tokens */'}
                        </span>
                        {'\n'}
                        <span className="text-blue-400">  --color-primary:</span>{' '}
                        <span className="text-amber-300">{primaryToken?.lightOklch}</span>
                        <span className="text-zinc-300">;</span>
                        {'\n'}
                        <span className="text-blue-400">  --color-highlight:</span>{' '}
                        <span className="text-amber-300">{highlightToken?.lightOklch}</span>
                        <span className="text-zinc-300">;</span>
                        {'\n'}
                        <span className="text-zinc-300">{'}'}</span>
                      </code>
                    </pre>
                  </div>
                </div>
              </div>
            </div>
          </Container>
        </section>

        {/* ——— 03 · PATTERNS ——— */}
        <section id="patterns" className="scroll-mt-24 py-20 lg:py-28">
          <Container size="xl">
            <PatternGallery />
          </Container>
        </section>

        {/* ——— 04 · SCENARIOS ——— */}
        <section id="scenarios" className="scroll-mt-24 border-y border-border/50 bg-muted/20 py-20 lg:py-28">
          <Container size="xl">
            <ScenarioPreview />
          </Container>
        </section>

        {/* ——— 05 · LIVE STATS ——— */}
        <section className="py-20 lg:py-28">
          <Container size="xl">
            <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div className="space-y-4">
                <SectionNumber number={5} label="Proof" />
                <h2 className="font-display text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
                  Numbers that can’t drift
                </h2>
              </div>
              <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
                Every figure below is computed from <span className="font-mono text-highlight">@ds/tokens</span> at
                render time. Change a token, and this section changes with it.
              </p>
            </div>
            <LiveStats />
          </Container>
        </section>

        {/* ——— CTA ——— */}
        <Container size="xl" className="pb-24">
          <Reveal variant="zoom">
            <div className="relative overflow-hidden rounded-[3rem] bg-foreground px-8 py-20 text-center text-background">
              <GlowOrb color="highlight" size="lg" position="center" className="opacity-30 mix-blend-screen" />
              <div className="relative z-10 mx-auto flex max-w-2xl flex-col items-center">
                <h2 className="mb-6 font-display text-4xl font-extrabold tracking-tight text-background md:text-5xl">
                  Start with a direction.
                </h2>
                <p className="mb-10 text-lg text-background/70">
                  Stop wrestling with generic templates and unscalable tokens. Ship high-craft,
                  accessible products — layer by layer.
                </p>
                <div className="flex w-full flex-col items-center gap-4 sm:w-auto sm:flex-row">
                  <Button
                    asChild
                    variant="default"
                    size="lg"
                    className="h-12 w-full rounded-full bg-background px-8 text-base text-foreground hover:bg-background/90 sm:w-auto"
                  >
                    <Link href="/getting-started">
                      Get Started
                      <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
                    </Link>
                  </Button>
                  <Button
                    asChild
                    variant="ghost"
                    size="lg"
                    className="h-12 w-full rounded-full px-8 text-base text-background hover:bg-background/10 hover:text-background sm:w-auto"
                  >
                    <Link href="/">
                      Read the Docs
                      <ArrowUpRight className="ml-2 h-4 w-4" aria-hidden="true" />
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </Reveal>
        </Container>
      </main>

      <LandingFooter />
    </div>
  );
}
