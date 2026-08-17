'use client';

import * as React from 'react';
import {
  COLOR_TOKENS,
  auditSemanticTokenPairs,
  getContrastRatio,
  checkWcagCompliance,
} from '@ds/tokens';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Badge,
  Input,
  Label,
} from '@ds/ui';
import { ShieldCheck, Check, Copy, Sparkles, Palette, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@ds/ui';
import { PageHeader } from '@ds/ui';

export default function ColorsPage() {
  const tokenPairs = React.useMemo(() => auditSemanticTokenPairs(), []);
  const [customFg, setCustomFg] = React.useState('#3D34B3');
  const [customBg, setCustomBg] = React.useState('#FFFFFF');
  const [copiedKey, setCopiedKey] = React.useState<string | null>(null);

  const customRatio = React.useMemo(() => {
    try {
      if (customFg.length >= 4 && customBg.length >= 4) {
        const ratio = getContrastRatio(customFg, customBg);
        return checkWcagCompliance(ratio);
      }
    } catch {
      // Invalid hex
    }
    return null;
  }, [customFg, customBg]);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1500);
  };

  return (
    <div className="space-y-10 animate-in fade-in-50 duration-200">
      <PageHeader
        eyebrow="WCAG 2.1 AA / AAA Verified"
        eyebrowIcon={ShieldCheck}
        title="Color System & Contrast Matrix"
        description={
          <>
            The color system uses modern <strong>OKLCH color space</strong> for perceptual uniformity and predictability across both light and dark modes. Every single semantic foreground/background pair is audited and guaranteed to meet or exceed WCAG 2.1 AA (4.5:1 for body text, 3:1 for UI elements).
          </>
        }
        actions={
          <Link href="/foundations/themes">
            <Button variant="outline" size="sm" className="gap-2 border-highlight/30 text-highlight hover:bg-highlight hover:text-highlight-foreground">
              <Palette className="h-3.5 w-3.5" />
              <span>Explore 3 Art Directions</span>
              <ArrowRight className="h-3 w-3" />
            </Button>
          </Link>
        }
      />

      {/* Live Custom Contrast Checker Playground */}
      <Card className="border-primary/30 bg-primary/5">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <CardTitle className="text-base">Live Interactive Contrast Checker</CardTitle>
          </div>
          <CardDescription>
            Test any custom foreground/background combination against WCAG 2.1 AA and AAA standards.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="customFg">Foreground Hex</Label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={customFg.startsWith('#') && customFg.length === 7 ? customFg : '#3D34B3'}
                  onChange={(e) => setCustomFg(e.target.value)}
                  className="h-9 w-12 rounded-md border border-input cursor-pointer bg-background p-1"
                />
                <Input
                  id="customFg"
                  value={customFg}
                  onChange={(e) => setCustomFg(e.target.value)}
                  placeholder="#000000"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="customBg">Background Hex</Label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={customBg.startsWith('#') && customBg.length === 7 ? customBg : '#FFFFFF'}
                  onChange={(e) => setCustomBg(e.target.value)}
                  className="h-9 w-12 rounded-md border border-input cursor-pointer bg-background p-1"
                />
                <Input
                  id="customBg"
                  value={customBg}
                  onChange={(e) => setCustomBg(e.target.value)}
                  placeholder="#FFFFFF"
                />
              </div>
            </div>
          </div>

          {/* Result Preview Box */}
          {customRatio && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-xl border border-border p-6 shadow-xs" style={{ backgroundColor: customBg, color: customFg }}>
              <div>
                <p className="text-xl font-bold tracking-tight">
                  Sample Text on Background
                </p>
                <p className="text-sm opacity-90 mt-0.5">
                  The quick brown fox jumps over the lazy dog.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <div className="rounded-lg bg-foreground/15 backdrop-blur-xs px-3 py-1.5 text-center text-foreground font-mono">
                  <span className="block text-xs uppercase tracking-wider">Ratio</span>
                  <span className="text-lg font-bold">{customRatio.ratioFormatted}</span>
                </div>

                <div className="flex flex-col gap-1">
                  <Badge variant={customRatio.passAA ? 'success' : 'destructive'} className="text-xs">
                    WCAG AA (4.5:1): {customRatio.passAA ? 'PASS' : 'FAIL'}
                  </Badge>
                  <Badge variant={customRatio.passAAA ? 'success' : 'outline'} className="text-xs">
                    WCAG AAA (7.0:1): {customRatio.passAAA ? 'PASS' : 'FAIL'}
                  </Badge>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Audited Semantic Pair Contrast Matrix */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-foreground">
          Audited Semantic Token Pairs
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {tokenPairs.map((pair) => (
            <Card key={pair.name} className="overflow-hidden border-border/80">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-sm text-foreground">{pair.name}</h3>
                    <p className="text-xs text-muted-foreground font-mono">
                      {pair.fgName} on {pair.bgName}
                    </p>
                  </div>

                  <Badge
                    variant={pair.compliance.level === 'AAA' ? 'success' : pair.compliance.level === 'AA' ? 'info' : 'warning'}
                    className="font-mono text-xs"
                  >
                    {pair.compliance.level} ({pair.compliance.ratioFormatted})
                  </Badge>
                </div>

                {/* Visual Swatch Demo */}
                <div
                  className="flex items-center justify-between rounded-lg p-3.5 border border-foreground/15 shadow-xs"
                  style={{ backgroundColor: pair.bgHex, color: pair.fgHex }}
                >
                  <span className="text-sm font-medium">Sample Foreground Content</span>
                  <span className="text-xs font-mono opacity-80">{pair.fgHex} / {pair.bgHex}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Token Palette Reference */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-foreground">
          Semantic Color Tokens Catalog
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {COLOR_TOKENS.map((token) => (
            <Card key={token.variable} className="border-border">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-sm text-foreground">{token.name}</span>
                  <Badge variant="outline" className="text-[10px] uppercase font-mono">
                    {token.category}
                  </Badge>
                </div>

                {/* Swatches (Light / Dark) */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <div
                      className="h-12 w-full rounded-md border border-border shadow-xs"
                      style={{ backgroundColor: token.lightHex }}
                    />
                    <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                      <span>Light</span>
                      <button
                        onClick={() => copyToClipboard(token.lightHex, `${token.variable}-light`)}
                        className="hover:text-foreground font-mono flex items-center gap-1"
                      >
                        {copiedKey === `${token.variable}-light` ? (
                          <Check className="h-3 w-3 text-success" />
                        ) : (
                          <Copy className="h-3 w-3" />
                        )}
                        {token.lightHex}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div
                      className="h-12 w-full rounded-md border border-border shadow-xs"
                      style={{ backgroundColor: token.darkHex }}
                    />
                    <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                      <span>Dark</span>
                      <button
                        onClick={() => copyToClipboard(token.darkHex, `${token.variable}-dark`)}
                        className="hover:text-foreground font-mono flex items-center gap-1"
                      >
                        {copiedKey === `${token.variable}-dark` ? (
                          <Check className="h-3 w-3 text-success" />
                        ) : (
                          <Copy className="h-3 w-3" />
                        )}
                        {token.darkHex}
                      </button>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-muted-foreground line-clamp-2">
                  {token.description}
                </p>

                <div className="flex items-center justify-between pt-1 border-t border-border/50 text-[11px] font-mono text-muted-foreground">
                  <span>{token.variable}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
