'use client';

import * as React from 'react';
import { SPACING_SCALE, RADII_SCALE } from '@ds/tokens';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Button } from '@ds/ui';
import { Play, Sparkles } from 'lucide-react';
import { PageHeader } from '@/components/page-header';

export default function SpacingPage() {
  const [animate, setAnimate] = React.useState(false);

  const triggerAnimation = () => {
    setAnimate(false);
    setTimeout(() => setAnimate(true), 50);
  };

  return (
    <div className="space-y-10 animate-in fade-in-50 duration-200">
      <PageHeader
        eyebrow="Foundations"
        eyebrowIcon={Sparkles}
        title="Spacing, Radii & Motion"
        description={
          <>
            Spatial rhythm based on a strict <strong>4px baseline grid</strong>, ergonomic boundary radii, and natural spring-physics motion tokens for intentional micro-interactions.
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

      {/* Motion & Transition Tokens */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-foreground">Motion Tokens & Physics</h2>
          <Button size="sm" onClick={triggerAnimation} className="gap-1.5">
            <Play className="h-3.5 w-3.5" />
            Play Animations
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Fast (150ms)</CardTitle>
              <CardDescription className="text-xs">
                Micro-interactions, button active states, tooltip fade-in.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-16 w-full rounded-lg bg-muted p-2 flex items-center">
                <div
                  className={`h-12 w-12 rounded-lg bg-primary transition-all duration-150 ease-out motion-reduce:transition-none ${
                    animate ? 'translate-x-[180px] bg-success' : 'translate-x-0'
                  }`}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Normal (250ms)</CardTitle>
              <CardDescription className="text-xs">
                Dropdown menus, modals, tab switching, and accordion expands.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-16 w-full rounded-lg bg-muted p-2 flex items-center">
                <div
                  className={`h-12 w-12 rounded-lg bg-primary transition-all duration-normal ease-spring motion-reduce:transition-none ${
                    animate ? 'translate-x-[180px] bg-success' : 'translate-x-0'
                  }`}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Slow (400ms)</CardTitle>
              <CardDescription className="text-xs">
                Page transitions, large slide-out drawer sheets, multi-step morphing.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-16 w-full rounded-lg bg-muted p-2 flex items-center">
                <div
                  className={`h-12 w-12 rounded-lg bg-primary transition-all duration-slow ease-smooth motion-reduce:transition-none ${
                    animate ? 'translate-x-[180px] bg-success' : 'translate-x-0'
                  }`}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
