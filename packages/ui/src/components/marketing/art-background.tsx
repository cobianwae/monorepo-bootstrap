import * as React from 'react';
import { cn } from '../../lib/utils';
import { GridPattern } from './grid-pattern';

export interface ArtBackgroundProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'glow' | 'aurora' | 'blueprint';
}

export const ArtBackground = React.forwardRef<HTMLDivElement, ArtBackgroundProps>(
  ({ className, variant = 'glow', ...props }, ref) => {
    return (
      <div
        ref={ref}
        aria-hidden="true"
        className={cn('pointer-events-none fixed inset-0 -z-50 overflow-hidden bg-background', className)}
        {...props}
      >
        {/* 1. ATELIER (Glow & Studio Craft) */}
        {variant === 'glow' && (
          <div className="absolute inset-0">
            {/* Fine Studio Baseline Grid */}
            <GridPattern
              className="opacity-25 dark:opacity-15 stroke-border/60"
              width={40}
              height={40}
              fade="radial"
            />
            {/* Top-Right Highlight Radiant Ambient Aura */}
            <div
              className="absolute -top-24 -right-24 h-[550px] w-[550px] rounded-full blur-[130px] opacity-45 dark:opacity-30"
              style={{
                background:
                  'radial-gradient(circle, color-mix(in oklch, var(--color-highlight) 14%, transparent) 0%, color-mix(in oklch, var(--color-highlight) 4%, transparent) 50%, transparent 75%)',
              }}
            />
            {/* Bottom-Left Primary Sub-Orb */}
            <div
              className="absolute -bottom-32 -left-32 h-[500px] w-[500px] rounded-full blur-[130px] opacity-40 dark:opacity-25"
              style={{
                background:
                  'radial-gradient(circle, color-mix(in oklch, var(--color-primary) 12%, transparent) 0%, color-mix(in oklch, var(--color-primary) 3%, transparent) 50%, transparent 75%)',
              }}
            />
          </div>
        )}

        {/* 2. AURORA (Fluid Gradient Flow & Luminous Horizon) */}
        {variant === 'aurora' && (
          <div className="absolute inset-0">
            {/* Fine Ethereal Micro-Dot Matrix (Eliminates banding & adds pro digital texture) */}
            <div
              className="absolute inset-0 opacity-20 dark:opacity-15 [mask-image:radial-gradient(ellipse_at_center,white_40%,transparent_80%)]"
              style={{
                backgroundImage:
                  'radial-gradient(circle, color-mix(in oklch, var(--color-border) 90%, transparent) 1px, transparent 1px)',
                backgroundSize: '24px 24px',
              }}
            />

            {/* Seamless Top Atmospheric Horizon Aurora Flow */}
            <div
              className="absolute -top-32 inset-x-0 h-[480px] opacity-70 dark:opacity-50"
              style={{
                background:
                  'radial-gradient(ellipse 90% 70% at 50% 0%, color-mix(in oklch, var(--color-highlight) 16%, transparent) 0%, color-mix(in oklch, var(--color-primary) 10%, transparent) 45%, transparent 85%)',
              }}
            />

            {/* Top-Right Soft Highlight Ambient Wash */}
            <div
              className="absolute top-0 right-0 w-[55vw] h-[55vh] opacity-60 dark:opacity-45"
              style={{
                background:
                  'radial-gradient(ellipse at top right, color-mix(in oklch, var(--color-highlight) 12%, transparent) 0%, color-mix(in oklch, var(--color-accent) 6%, transparent) 40%, transparent 70%)',
              }}
            />

            {/* Bottom-Left Soft Primary Ambient Wash */}
            <div
              className="absolute bottom-0 left-0 w-[50vw] h-[50vh] opacity-50 dark:opacity-35"
              style={{
                background:
                  'radial-gradient(ellipse at bottom left, color-mix(in oklch, var(--color-primary) 12%, transparent) 0%, color-mix(in oklch, var(--color-highlight) 5%, transparent) 45%, transparent 70%)',
              }}
            />
          </div>
        )}

        {/* 3. BLUEPRINT (Precision CAD & Technical Line Graphics) */}
        {variant === 'blueprint' && (
          <div className="absolute inset-0">
            {/* Precision Technical Dual-Grid */}
            <GridPattern
              className="opacity-30 dark:opacity-20 stroke-primary/30"
              width={36}
              height={36}
              fade="radial"
            />

            {/* Architectural Isometric Elevation Curves */}
            <div className="absolute inset-0 overflow-hidden opacity-30 dark:opacity-25">
              <svg
                className="absolute w-full h-full"
                viewBox="0 0 1440 900"
                preserveAspectRatio="xMidYMid slice"
                xmlns="http://www.w3.org/2000/svg"
              >
                <defs>
                  <linearGradient id="bpGrad1" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="var(--color-primary)" stopOpacity="0" />
                    <stop offset="30%" stopColor="var(--color-highlight)" stopOpacity="0.8" />
                    <stop offset="70%" stopColor="var(--color-primary)" stopOpacity="0.6" />
                    <stop offset="100%" stopColor="var(--color-highlight)" stopOpacity="0" />
                  </linearGradient>
                  <linearGradient id="bpGrad2" x1="0%" y1="100%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="var(--color-highlight)" stopOpacity="0" />
                    <stop offset="40%" stopColor="var(--color-primary)" stopOpacity="0.7" />
                    <stop offset="80%" stopColor="var(--color-highlight)" stopOpacity="0.5" />
                    <stop offset="100%" stopColor="var(--color-primary)" stopOpacity="0" />
                  </linearGradient>
                </defs>

                {/* Mathematical Topographic Waves (true non-distorting curves) */}
                <path
                  d="M -100,750 C 300,600 600,820 1000,680 C 1200,600 1400,720 1600,660"
                  fill="none"
                  stroke="url(#bpGrad1)"
                  strokeWidth="1.2"
                  vectorEffect="non-scaling-stroke"
                />
                <path
                  d="M -100,800 C 350,650 650,870 1050,730 C 1250,650 1450,770 1650,710"
                  fill="none"
                  stroke="url(#bpGrad2)"
                  strokeWidth="0.8"
                  strokeDasharray="4 4"
                  vectorEffect="non-scaling-stroke"
                />
                <path
                  d="M -100,850 C 400,700 700,920 1100,780 C 1300,700 1500,820 1700,760"
                  fill="none"
                  stroke="url(#bpGrad1)"
                  strokeWidth="0.6"
                  vectorEffect="non-scaling-stroke"
                />

                {/* Architectural Precision Registration Marks */}
                <g stroke="var(--color-primary)" strokeWidth="1" opacity="0.6">
                  {/* Top-Right Calibration Cross */}
                  <line x1="1360" y1="72" x2="1360" y2="88" />
                  <line x1="1352" y1="80" x2="1368" y2="80" />
                  <circle cx="1360" cy="80" r="10" fill="none" stroke="var(--color-primary)" strokeWidth="0.5" strokeDasharray="2 2" />

                  {/* Mid Calibration Node */}
                  <line x1="1000" y1="672" x2="1000" y2="688" />
                  <line x1="992" y1="680" x2="1008" y2="680" />
                  <circle cx="1000" cy="680" r="3" fill="none" stroke="var(--color-highlight)" strokeWidth="1" />
                </g>
              </svg>
            </div>

            {/* Subtle Bottom Technical Horizon Wash */}
            <div
              className="absolute -bottom-32 left-1/3 h-[450px] w-[700px] rounded-full blur-[140px] opacity-40 dark:opacity-30"
              style={{
                background:
                  'radial-gradient(ellipse, color-mix(in oklch, var(--color-primary) 18%, transparent) 0%, transparent 70%)',
              }}
            />
          </div>
        )}
      </div>
    );
  }
);
ArtBackground.displayName = 'ArtBackground';
