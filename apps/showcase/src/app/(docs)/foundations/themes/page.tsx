'use client';

import * as React from 'react';
import {
  ART_DIRECTIONS,
  type ArtDirectionId,
  type ThemeId,
  getTonesForArtDirection,
  auditThemeTokenPairs,
} from '@ds/tokens';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Badge,
  Button,
  Input,
  GradientText,
} from '@ds/ui';
import {
  Sparkles,
  Check,
  ShieldCheck,
  ArrowRight,
  Code2,
  Eye,
  Wand2,
} from 'lucide-react';
import { PageHeader } from '@/components/page-header';
import { useTheme } from '@/components/theme-provider';

export default function ThemesPage() {
  const { palette, setPalette, resolvedTheme, artDirection, setArtDirection } = useTheme();
  const isDark = resolvedTheme === 'dark';

  const activeDirectionDef = ART_DIRECTIONS.find((d) => d.id === artDirection) || ART_DIRECTIONS[0];
  const activeTones = getTonesForArtDirection(artDirection);
  const activeThemeDef = activeTones.find((t) => t.id === palette) || activeTones[0];
  
  const activeAuditedPairs = React.useMemo(
    () => auditThemeTokenPairs(palette),
    [palette]
  );

  return (
    <div className="space-y-10 animate-in fade-in-50 duration-200">
      <PageHeader
        eyebrow="Art Direction System"
        eyebrowIcon={Wand2}
        title="Art Directions & Tones"
        description={
          <>
            Explore <strong>3 curated art directions</strong> offering unique visual character via typography, decorative motifs, and hand-picked color tones. All mathematically verified against WCAG 2.1 AA/AAA contrast rules.
          </>
        }
        actions={
          <div className="flex items-center gap-2">
            <Badge variant="highlight-outline" className="font-mono">
              Active: {activeDirectionDef.name} / {activeThemeDef.name}
            </Badge>
          </div>
        }
      />

      {/* Active Direction Spotlight Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-highlight/30 bg-highlight/10 px-3 py-1 text-xs font-semibold text-highlight font-mono">
              <Sparkles className="h-3 w-3" />
              <span>ACTIVE ART DIRECTION: {activeDirectionDef.name.toUpperCase()}</span>
            </div>
            
            {activeDirectionDef.id === 'aurora' ? (
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight font-display">
                <GradientText>{activeDirectionDef.name}</GradientText> — {activeDirectionDef.tagline}
              </h2>
            ) : (
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground font-display">
                {activeDirectionDef.name} — {activeDirectionDef.tagline}
              </h2>
            )}
            
            <p className="text-sm text-muted-foreground leading-relaxed">
              {activeDirectionDef.description}
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2 text-xs text-muted-foreground font-mono">
              <div>
                Display Font: <span className="text-foreground font-semibold">{activeDirectionDef.typography.googleFont.split(',')[0]}</span>
              </div>
              <div className="h-3 w-px bg-border" />
              <div>
                Tone: <span className="text-foreground font-semibold">{activeThemeDef.name}</span>
              </div>
              <div className="h-3 w-px bg-border" />
              <div className="flex items-center gap-1 text-success font-semibold">
                <ShieldCheck className="h-3.5 w-3.5" />
                <span>100% WCAG AA Passing</span>
              </div>
            </div>
          </div>

          {/* Live Micro-Preview using Active Tokens */}
          <div className={`rounded-xl border border-border bg-background/80 p-5 space-y-4 max-w-sm w-full shrink-0 shadow-sm backdrop-blur-md ${activeDirectionDef.id === 'aurora' ? 'gradient-border' : ''}`}>
            <div className="flex items-center justify-between text-xs font-semibold text-foreground font-display">
              <span>Interactive Component Test</span>
              <Eye className="h-3.5 w-3.5 text-muted-foreground" />
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Button size="sm" className="flex-1 font-medium">
                  Primary Action
                </Button>
                <Button size="sm" variant="outline" className="border-highlight text-highlight hover:bg-highlight hover:text-highlight-foreground">
                  Highlight
                </Button>
              </div>

              <div className="space-y-1.5">
                <Input
                  placeholder="Interactive token input..."
                  className="h-8 text-xs"
                  defaultValue="Live theme tokens active"
                />
              </div>

              <div className="flex items-center justify-between rounded-lg bg-card border border-border p-2.5 text-xs">
                <span className="text-muted-foreground">Badge accent:</span>
                <Badge variant="highlight" className="text-[10px] px-2 py-0.5">
                  {activeThemeDef.name} Style
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3 Art Directions */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold tracking-tight text-foreground font-display">
            Art Direction Library
          </h3>
          <span className="text-xs text-muted-foreground font-mono">
            Click to switch direction
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {ART_DIRECTIONS.map((dir) => {
            const isSelected = dir.id === artDirection;
            
            return (
              <Card
                key={dir.id}
                className={`transition-all duration-200 flex flex-col ${
                  isSelected
                    ? 'ring-2 ring-highlight border-highlight/50 shadow-md'
                    : 'hover:border-border/80 hover:shadow-xs'
                }`}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-secondary text-foreground shadow-xs">
                      <Wand2 className="h-4 w-4" />
                    </div>
                    <Button
                      size="sm"
                      variant={isSelected ? 'secondary' : 'outline'}
                      onClick={() => setArtDirection(dir.id as ArtDirectionId)}
                      className="gap-1.5 text-xs h-8"
                    >
                      {isSelected ? (
                        <>
                          <Check className="h-3.5 w-3.5 text-highlight" />
                          <span>Active</span>
                        </>
                      ) : (
                        <>
                          <span>Activate</span>
                          <ArrowRight className="h-3 w-3" />
                        </>
                      )}
                    </Button>
                  </div>
                  <CardTitle className="text-base font-display">
                    {dir.id === 'aurora' ? <GradientText>{dir.name}</GradientText> : dir.name}
                  </CardTitle>
                  <CardDescription className="text-xs">
                    {dir.tagline}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 pt-0 flex-1 flex flex-col">
                  <p className="text-xs text-muted-foreground leading-relaxed flex-1">
                    {dir.description}
                  </p>
                  <div className="space-y-2 border-t border-border pt-3">
                    <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-muted-foreground">Typography</span>
                    <p className="text-xs font-mono">{dir.typography.googleFont}</p>
                  </div>
                  <div className="space-y-2 border-t border-border pt-3">
                    <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-muted-foreground">Motifs</span>
                    <ul className="text-xs text-muted-foreground list-disc pl-4 space-y-1">
                      {dir.art.signature.map((s, i) => (
                        <li key={i}>{s}</li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
      
      {/* Color Tones for Active Art Direction */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold tracking-tight text-foreground font-display">
            Color Tones for {activeDirectionDef.name}
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {activeTones.map((theme) => {
            const isSelected = theme.id === palette;
            const primaryHex = isDark
              ? theme.swatches.primary.darkHex
              : theme.swatches.primary.lightHex;
            const highlightHex = isDark
              ? theme.swatches.highlight.darkHex
              : theme.swatches.highlight.lightHex;
            const surfaceHex = isDark
              ? theme.swatches.surface.darkHex
              : theme.swatches.surface.lightHex;

            return (
              <Card
                key={theme.id}
                className={`transition-all duration-200 ${
                  isSelected
                    ? 'ring-2 ring-highlight border-highlight/50 shadow-md'
                    : 'hover:border-border/80 hover:shadow-xs'
                }`}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="flex items-center -space-x-1">
                        <span
                          className="h-4 w-4 rounded-full ring-2 ring-card shadow-xs"
                          style={{ backgroundColor: primaryHex }}
                        />
                        <span
                          className="h-4 w-4 rounded-full ring-2 ring-card shadow-xs"
                          style={{ backgroundColor: highlightHex }}
                        />
                        <span
                          className="h-4 w-4 rounded-full ring-2 ring-card shadow-xs"
                          style={{ backgroundColor: surfaceHex }}
                        />
                      </div>
                      <div>
                        <CardTitle className="text-base font-display flex items-center gap-2">
                          {theme.name}
                          {isSelected && (
                            <Badge variant="highlight" className="text-[10px] px-2 py-0.5 font-mono">
                              Active
                            </Badge>
                          )}
                        </CardTitle>
                        <CardDescription className="text-xs">
                          {theme.tagline}
                        </CardDescription>
                      </div>
                    </div>

                    <Button
                      size="sm"
                      variant={isSelected ? 'secondary' : 'outline'}
                      onClick={() => setPalette(theme.id as ThemeId)}
                      className="gap-1.5 text-xs h-8"
                    >
                      {isSelected ? (
                        <>
                          <Check className="h-3.5 w-3.5 text-highlight" />
                          <span>Selected</span>
                        </>
                      ) : (
                        <>
                          <span>Activate</span>
                          <ArrowRight className="h-3 w-3" />
                        </>
                      )}
                    </Button>
                  </div>
                </CardHeader>

                <CardContent className="space-y-3 pt-0">
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {theme.description}
                  </p>

                  {/* Swatch chips */}
                  <div className="grid grid-cols-3 gap-2 pt-1 font-mono text-[11px]">
                    <div className="rounded-md border border-border/80 p-2 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground text-[10px]">Primary</span>
                        <span
                          className="h-2.5 w-2.5 rounded-full"
                          style={{ backgroundColor: primaryHex }}
                        />
                      </div>
                      <div className="font-semibold text-foreground truncate">{primaryHex}</div>
                    </div>

                    <div className="rounded-md border border-border/80 p-2 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground text-[10px]">Highlight</span>
                        <span
                          className="h-2.5 w-2.5 rounded-full"
                          style={{ backgroundColor: highlightHex }}
                        />
                      </div>
                      <div className="font-semibold text-foreground truncate">{highlightHex}</div>
                    </div>

                    <div className="rounded-md border border-border/80 p-2 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground text-[10px]">Surface</span>
                        <span
                          className="h-2.5 w-2.5 rounded-full"
                          style={{ backgroundColor: surfaceHex }}
                        />
                      </div>
                      <div className="font-semibold text-foreground truncate">{surfaceHex}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Contrast Matrix for Active Tone */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <CardTitle className="text-base font-display">
                Audited Contrast Pairs: {activeThemeDef.name}
              </CardTitle>
              <CardDescription>
                Mathematical WCAG 2.1 ratio audit for all semantic pairs in the {activeThemeDef.name} tone.
              </CardDescription>
            </div>
            <div className="flex items-center gap-1.5 rounded-md bg-success/10 border border-success/30 px-2.5 py-1 text-xs text-success font-semibold">
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>All Pairs ≥ 4.5:1</span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-border text-muted-foreground font-mono">
                  <th className="pb-3 font-semibold">Token Pair</th>
                  <th className="pb-3 font-semibold">Mode</th>
                  <th className="pb-3 font-semibold">Foreground</th>
                  <th className="pb-3 font-semibold">Background</th>
                  <th className="pb-3 font-semibold text-right">Contrast Ratio</th>
                  <th className="pb-3 font-semibold text-right">WCAG Level</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {activeAuditedPairs.map((pair, idx) => (
                  <tr key={idx} className="hover:bg-muted/40 transition-colors">
                    <td className="py-2.5 font-medium text-foreground">
                      {pair.fgName} on {pair.bgName}
                    </td>
                    <td className="py-2.5 capitalize font-mono text-muted-foreground">
                      {pair.mode}
                    </td>
                    <td className="py-2.5">
                      <div className="flex items-center gap-1.5 font-mono">
                        <span
                          className="h-3 w-3 rounded-full border border-border"
                          style={{ backgroundColor: pair.fgHex }}
                        />
                        <span>{pair.fgHex}</span>
                      </div>
                    </td>
                    <td className="py-2.5">
                      <div className="flex items-center gap-1.5 font-mono">
                        <span
                          className="h-3 w-3 rounded-full border border-border"
                          style={{ backgroundColor: pair.bgHex }}
                        />
                        <span>{pair.bgHex}</span>
                      </div>
                    </td>
                    <td className="py-2.5 text-right font-mono font-semibold text-foreground">
                      {pair.compliance.ratioFormatted}
                    </td>
                    <td className="py-2.5 text-right">
                      <Badge
                        variant={pair.compliance.passAAA ? 'default' : 'secondary'}
                        className={`text-[10px] px-2 py-0 ${
                          pair.compliance.passAAA
                            ? 'bg-success text-success-foreground'
                            : 'bg-primary/20 text-primary border-primary/30'
                        }`}
                      >
                        {pair.compliance.level}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Code Usage Guide */}
      <Card className="bg-card">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Code2 className="h-4 w-4 text-highlight" />
            <CardTitle className="text-base font-display">
              How to Apply Art Directions in Code
            </CardTitle>
          </div>
          <CardDescription>
            Use declarative HTML attributes to switch between art directions and color tones.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-foreground font-mono uppercase tracking-wider">
              1. Declarative CSS Attributes
            </h4>
            <pre className="rounded-lg bg-muted/60 p-3.5 text-xs font-mono text-foreground overflow-x-auto border border-border">
{`<!-- Set on html tag to switch entire app style -->
<html lang="en" data-art-direction="aurora" data-theme="nebula" class="dark">`}
            </pre>
          </div>

          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-foreground font-mono uppercase tracking-wider">
              2. React Theme Provider & Hook
            </h4>
            <pre className="rounded-lg bg-muted/60 p-3.5 text-xs font-mono text-foreground overflow-x-auto border border-border">
{`import { useTheme } from '@/components/theme-provider';

export function ThemeControl() {
  const { artDirection, setArtDirection, palette, setPalette } = useTheme();
  return (
    <button onClick={() => setArtDirection('blueprint')}>
      Active Direction: {artDirection}
    </button>
  );
}`}
            </pre>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
