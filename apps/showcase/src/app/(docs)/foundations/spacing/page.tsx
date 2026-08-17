'use client';

import { SPACING_SCALE, RADII_SCALE } from '@ds/tokens';
import { Card, CardContent } from '@ds/ui';
import { Sparkles } from 'lucide-react';
import { PageHeader } from '@ds/ui';

export default function SpacingPage() {
  return (
    <div className="space-y-10 animate-in fade-in-50 duration-200">
      <PageHeader
        eyebrow="Foundations"
        eyebrowIcon={Sparkles}
        title="Spacing, Radii & Elevation"
        description={
          <>
            Spatial rhythm based on a strict <strong>4px baseline grid</strong>, ergonomic boundary radii, and an elevation scale that separates surfaces by depth.
          </>
        }
      />

      {/* Spacing Scale */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-foreground">4px Spacing Grid Scale</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {SPACING_SCALE.map((space) => (
            <Card key={space.name} className="border-border">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-foreground">Space {space.name}</span>
                  <span className="font-mono text-muted-foreground">{space.value} ({space.px}px)</span>
                </div>
                <div className="h-10 w-full rounded-md bg-muted flex items-center p-2">
                  <div
                    className="h-full bg-primary rounded-xs transition-all"
                    style={{ width: `${space.px}px` }}
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Radii Scale */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-foreground">Corner Radius Scale</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {RADII_SCALE.map((radius) => (
            <Card key={radius.name} className="border-border text-center">
              <CardContent className="p-4 space-y-3">
                <div
                  className="mx-auto h-16 w-16 bg-primary/15 border-2 border-primary flex items-center justify-center text-xs font-mono font-semibold text-primary"
                  style={{ borderRadius: radius.value }}
                >
                  {radius.name}
                </div>
                <div className="text-xs">
                  <p className="font-semibold text-foreground">{radius.name}</p>
                  <p className="font-mono text-muted-foreground">{radius.value}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Elevation Scale */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-foreground">Elevation &amp; Shadow Scale</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { name: 'xs', use: 'Cards, buttons, stat tiles' },
            { name: 'sm', use: 'Hovered cards, dropdown menus' },
            { name: 'md', use: 'Floating panels, sheets' },
            { name: 'lg', use: 'Modals, overlays, popovers' },
          ].map((level) => (
            <Card key={level.name} className="border-border/60">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-foreground">Shadow {level.name}</span>
                  <span className="font-mono text-muted-foreground">{`shadow-${level.name}`}</span>
                </div>
                <div className={`h-16 w-full rounded-lg bg-card border border-border shadow-${level.name} flex items-center justify-center`}>
                  <span className="text-[10px] font-mono text-muted-foreground">Surface</span>
                </div>
                <p className="text-[11px] text-muted-foreground">{level.use}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
