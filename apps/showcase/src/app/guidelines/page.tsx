'use client';

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@ds/ui';
import {
  CheckCircle2,
  XCircle,
  Sparkles,
  Layers,
  Palette,
  ShieldCheck,
  BookOpen,
} from 'lucide-react';
import { PageHeader } from '../../components/page-header';

export default function GuidelinesPage() {
  return (
    <div className="space-y-10 animate-in fade-in-50 duration-200">
      <PageHeader
        eyebrow="Core Design Principles"
        eyebrowIcon={BookOpen}
        title="Visual & Accessibility Guidelines"
        description="The aesthetic foundation and craft standards behind our design system. Designed to ensure visual coherence, intentional rhythm, and complete WCAG accessibility."
      />

      {/* Grid of Key Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Pillar 1: Visual Hierarchy */}
        <Card className="border-border">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Layers className="h-5 w-5 text-primary" />
              <CardTitle className="text-base">1. Visual Hierarchy & Spatial Rhythm</CardTitle>
            </div>
            <CardDescription className="text-xs">
              Every element should guide the user&apos;s eye naturally across the interface.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-xs text-muted-foreground leading-relaxed">
            <p>
              • <strong>4px Baseline Grid:</strong> All margins, paddings, and line heights align to multiples of 4px (4, 8, 12, 16, 24, 32, 48, 64).
            </p>
            <p>
              • <strong>Weight over Color:</strong> Use font weight (regular vs semibold) to establish hierarchy before resorting to multiple saturated colors.
            </p>
            <p>
              • <strong>Surface Layering:</strong> Background (<code className="font-mono text-[11px] bg-muted px-1.5 py-0.5 rounded text-foreground">--background</code>) → Container Card (<code className="font-mono text-[11px] bg-muted px-1.5 py-0.5 rounded text-foreground">--card</code>) → Popover/Modal (<code className="font-mono text-[11px] bg-muted px-1.5 py-0.5 rounded text-foreground">--popover</code>) creates natural optical depth.
            </p>
          </CardContent>
        </Card>

        {/* Pillar 2: Color Contrast & Accessibility */}
        <Card className="border-border">
          <CardHeader>
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-success" />
              <CardTitle className="text-base">2. WCAG Contrast Standards</CardTitle>
            </div>
            <CardDescription className="text-xs">
              Accessibility is not an afterthought; it is built into the token maths.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-xs text-muted-foreground leading-relaxed">
            <p>
              • <strong>Normal Body Text:</strong> Minimum contrast ratio of <strong>4.5:1</strong> (WCAG AA) with a target of <strong>7.0:1</strong> (WCAG AAA).
            </p>
            <p>
              • <strong>UI Components & Borders:</strong> Minimum contrast ratio of <strong>3.0:1</strong> for interactive inputs and focus rings.
            </p>
            <p>
              • <strong>Color Independence:</strong> Never use color alone to communicate state. Always pair color with an icon or descriptive text.
            </p>
          </CardContent>
        </Card>

        {/* Pillar 3: Dark Mode Aesthetics */}
        <Card className="border-border">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Palette className="h-5 w-5 text-primary" />
              <CardTitle className="text-base">3. Dark Mode Craftsmanship</CardTitle>
            </div>
            <CardDescription className="text-xs">
              Dark mode should feel natural and easy on the eyes, not an inverted harsh black.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-xs text-muted-foreground leading-relaxed">
            <p>
              • <strong>Tinted Charcoal Surfaces:</strong> Avoid pure #000000 black canvas. Use tinted OKLCH dark slate (<code className="font-mono text-[11px] bg-muted px-1.5 py-0.5 rounded text-foreground">oklch(0.14 0.015 260)</code>) to prevent high-glare eye fatigue.
            </p>
            <p>
              • <strong>Elevation via Lightness:</strong> Higher layered elements (cards, dialogs) use slightly lighter lightness (<code className="font-mono text-[11px] bg-muted px-1.5 py-0.5 rounded text-foreground">oklch(0.18)</code>) rather than heavy drop shadows.
            </p>
            <p>
              • <strong>Desaturated Accents:</strong> Primary colors in dark mode use slightly reduced chroma and higher lightness for readability.
            </p>
          </CardContent>
        </Card>

        {/* Pillar 4: Motion & Micro-interactions */}
        <Card className="border-border">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              <CardTitle className="text-base">4. Motion & Micro-Interactions</CardTitle>
            </div>
            <CardDescription className="text-xs">
              Motion should give physical weight and context to spatial navigation.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-xs text-muted-foreground leading-relaxed">
            <p>
              • <strong>Spring Curves:</strong> Use natural spring easing (<code className="font-mono text-[11px] bg-muted px-1.5 py-0.5 rounded text-foreground">cubic-bezier(0.16, 1, 0.3, 1)</code>) rather than linear motion.
            </p>
            <p>
              • <strong>Duration Scale:</strong> Micro-interactions at 150ms, dropdowns/modals at 250ms, screen transitions at 400ms max.
            </p>
            <p>
              • <strong>Respect User Preferences:</strong> Honor <code className="font-mono text-[11px] bg-muted px-1.5 py-0.5 rounded text-foreground">prefers-reduced-motion</code> media query automatically.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Do's and Don'ts Table */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-foreground">Visual Do&apos;s & Don&apos;ts</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="border-success/30 bg-success/5">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2 text-success">
                <CheckCircle2 className="h-5 w-5" />
                <CardTitle className="text-sm">DO</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-2 text-xs text-foreground/90">
              <p>✓ Use semantic tokens (<code className="font-mono text-[11px] bg-muted/60 px-1 py-0.5 rounded">--primary</code>, <code className="font-mono text-[11px] bg-muted/60 px-1 py-0.5 rounded">--muted</code>) instead of hardcoded hex values.</p>
              <p>✓ Provide visible keyboard focus rings on all interactive elements.</p>
              <p>✓ Use loading skeletons matching the exact shape of incoming content.</p>
              <p>✓ Keep spacing consistent using the 4px rhythm multiplier.</p>
            </CardContent>
          </Card>

          <Card className="border-destructive/30 bg-destructive/5">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2 text-destructive">
                <XCircle className="h-5 w-5" />
                <CardTitle className="text-sm">DON&apos;T</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-2 text-xs text-foreground/90">
              <p>✗ Don&apos;t use pure black #000000 on pure white #FFFFFF for long-form reading.</p>
              <p>✗ Don&apos;t hide focus rings with <code>outline: none</code> without a custom ring.</p>
              <p>✗ Don&apos;t mix more than 2 distinct font families in a single view.</p>
              <p>✗ Don&apos;t rely solely on color to indicate form errors or status flags.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
