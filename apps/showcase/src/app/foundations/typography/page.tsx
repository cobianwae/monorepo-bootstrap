'use client';

import * as React from 'react';
import { TYPOGRAPHY_SCALE } from '@ds/tokens';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Input,
  Label,
  Badge,
} from '@ds/ui';
import { BookOpen, Sliders } from 'lucide-react';
import { PageHeader } from '../../../components/page-header';

const FONT_FAMILIES = [
  {
    name: 'Inter',
    role: 'Primary UI Sans-Serif',
    fontClass: 'font-sans',
    variable: '--font-sans',
    weights: [
      { label: 'Regular', weight: '400', sample: 'Every detail reflects thoughtful intentionality.' },
      { label: 'Medium', weight: '500', sample: 'Structured contrast enhances cognitive clarity.' },
      { label: 'Semibold', weight: '600', sample: 'Clear hierarchy guides natural focus navigation.' },
      { label: 'Bold', weight: '700', sample: 'Confident display anchors key actions instantly.' },
    ],
    alphabet: 'Aa Bb Cc Dd Ee Ff Gg Hh Ii Jj Kk Ll Mm Nn Oo Pp Qq Rr Ss Tt Uu Vv Ww Xx Yy Zz',
    numerals: '0 1 2 3 4 5 6 7 8 9 ( ! @ # $ % & * )',
  },
  {
    name: 'JetBrains Mono',
    role: 'Code, Telemetry & Data Grid Mono',
    fontClass: 'font-mono',
    variable: '--font-mono',
    weights: [
      { label: 'Regular', weight: '400', sample: 'const ratio = calculateContrast(fg, bg);' },
      { label: 'Medium', weight: '500', sample: 'export type TokenCompliance = "AAA" | "AA";' },
      { label: 'Bold', weight: '700', sample: '0x7FFD98A1  [ACTIVE]  lat: +37.7749' },
    ],
    alphabet: 'Aa Bb Cc Dd Ee Ff Gg Hh Ii Jj Kk Ll Mm Nn Oo Pp Qq Rr Ss Tt Uu Vv Ww Xx Yy Zz',
    numerals: '0 1 2 3 4 5 6 7 8 9 { [ ( => === != ) ] }',
  },
];

const PAIRING_EXAMPLES = [
  {
    title: 'Editorial / Hero Composition',
    role: 'Landing pages, section intros, key announcements',
    display: 'Crafting Interfaces with Precision',
    body: 'A thoughtful design system harmonizes mathematics and artistry. By establishing consistent visual cadence and perceptual color balance, software feels natural and effortless.',
    meta: 'PUBLISHED AUGUST 2026 • 6 MIN READ',
  },
  {
    title: 'Dashboard Widget / Stat Composition',
    role: 'Metric cards, activity summaries, master CRUD cards',
    display: '$1,284,920.00',
    body: 'Net annualized recurring revenue across all 12 sovereign deployment clusters.',
    meta: '+14.8% vs previous 30-day baseline',
  },
];

export default function TypographyPage() {
  const [sampleText, setSampleText] = React.useState('Crafting delightful user experiences with mathematical precision');
  const [selectedWeight, setSelectedWeight] = React.useState<string>('400');

  return (
    <div className="space-y-10 animate-in fade-in-50 duration-200">
      <PageHeader
        eyebrow="Foundations"
        eyebrowIcon={BookOpen}
        title="Typography Scale & Specimen Sheet"
        description="The typographic hierarchy establishes clear reading rhythm, high legibility, and proportional scaling across all viewport sizes. Engineered with optical kerning and variable font weights."
      />

      {/* Font Family Dual Specimen Card */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {FONT_FAMILIES.map((family) => (
          <Card key={family.name} className="border-border overflow-hidden shadow-xs">
            <CardHeader className="border-b border-border/60 bg-muted/30 pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-xl font-bold tracking-tight text-foreground">
                      {family.name}
                    </CardTitle>
                    <Badge variant="secondary" className="font-mono text-[10px]">
                      Variable Font
                    </Badge>
                  </div>
                  <CardDescription className="text-xs mt-1">
                    {family.role}
                  </CardDescription>
                </div>
                <div className="text-right font-mono text-xs text-muted-foreground">
                  <code className="bg-muted px-2 py-1 rounded text-[11px] text-foreground">
                    {family.variable}
                  </code>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-6 space-y-5">
              {/* Giant Glyph Banner */}
              <div
                className={`rounded-xl border border-border/60 bg-card/60 p-5 text-center ${family.fontClass}`}
              >
                <div className="text-5xl font-extrabold tracking-tight text-foreground sm:text-6xl select-none">
                  Ag 42 &
                </div>
                <div className="mt-3 text-xs tracking-wider text-muted-foreground break-words opacity-85">
                  {family.alphabet}
                </div>
                <div className="mt-1 text-xs font-mono text-muted-foreground opacity-70">
                  {family.numerals}
                </div>
              </div>

              {/* Weight Samples */}
              <div className="space-y-2.5 pt-1">
                <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Weight Matrix
                </div>
                <div className="space-y-2">
                  {family.weights.map((w) => (
                    <div
                      key={w.label}
                      className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1 rounded-lg border border-border/40 p-3 bg-card"
                    >
                      <span className="font-mono text-xs text-muted-foreground shrink-0 w-24">
                        {w.label} ({w.weight})
                      </span>
                      <p
                        className={`text-sm text-foreground ${family.fontClass}`}
                        style={{ fontWeight: Number(w.weight) }}
                      >
                        {w.sample}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Interactive Typography Preview Playground */}
      <Card className="border-primary/30 bg-primary/5 shadow-xs">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Sliders className="h-4 w-4 text-primary" />
            <CardTitle className="text-base">Interactive Specimen Tester</CardTitle>
          </div>
          <CardDescription className="text-xs">
            Type custom preview copy and test responsive scaling across weights.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2 space-y-2">
              <Label htmlFor="sampleText">Custom Preview Text</Label>
              <Input
                id="sampleText"
                value={sampleText}
                onChange={(e) => setSampleText(e.target.value)}
                placeholder="Type custom text..."
                className="bg-card"
              />
            </div>

            <div className="space-y-2">
              <Label>Active Weight</Label>
              <div className="flex rounded-lg border border-border bg-card p-1">
                {[
                  { label: '400', value: '400' },
                  { label: '500', value: '500' },
                  { label: '600', value: '600' },
                  { label: '700', value: '700' },
                ].map((item) => (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => setSelectedWeight(item.value)}
                    className={`flex-1 rounded-md py-1 text-xs font-mono font-medium transition-colors ${
                      selectedWeight === item.value
                        ? 'bg-primary text-primary-foreground shadow-xs'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Structured Scale Specimen List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-foreground">Typographic Hierarchy Scale</h2>
          <span className="font-mono text-xs text-muted-foreground">
            8 Proportional Steps
          </span>
        </div>

        <div className="space-y-3">
          {TYPOGRAPHY_SCALE.map((item) => (
            <Card
              key={item.name}
              className="border-border hover:border-primary/40 transition-colors duration-150 overflow-hidden"
            >
              <CardContent className="p-5 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/40 pb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm text-foreground">{item.name}</span>
                    <Badge variant="outline" className="font-mono text-[10px] px-1.5 py-0">
                      {item.size}
                    </Badge>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 font-mono text-[11px] text-muted-foreground">
                    <span>LH: {item.lineHeight}</span>
                    <span>Tracking: {item.tracking}</span>
                    <span>Weight: {item.weight}</span>
                  </div>
                </div>

                <div
                  style={{
                    fontSize: item.size,
                    lineHeight: item.lineHeight,
                    fontWeight: Number(selectedWeight),
                    letterSpacing: item.tracking,
                  }}
                  className="font-sans text-foreground transition-all duration-150 break-words"
                >
                  {sampleText}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Practical Typographic Pairing Recipes */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-foreground">Real-World Typographic Pairings</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {PAIRING_EXAMPLES.map((pair) => (
            <Card key={pair.title} className="border-border">
              <CardHeader className="pb-3 border-b border-border/50 bg-muted/20">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-semibold">{pair.title}</CardTitle>
                  <Badge variant="secondary" className="text-[10px]">
                    Layout Pattern
                  </Badge>
                </div>
                <CardDescription className="text-xs">{pair.role}</CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-3">
                <div className="font-mono text-[11px] font-semibold text-primary tracking-wider">
                  {pair.meta}
                </div>
                <h3 className="text-2xl font-bold tracking-tight text-foreground">
                  {pair.display}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {pair.body}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
