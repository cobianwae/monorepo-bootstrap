import * as React from 'react';
import { cn } from '../../lib/utils';
import { GlowOrb } from './glow-orb';
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
        className={cn('pointer-events-none fixed inset-0 -z-50 overflow-hidden', className)}
        {...props}
      >
        {variant === 'glow' && (
          <>
            <GridPattern
              className="opacity-50 dark:opacity-30"
              fade="radial"
              squares={[
                [4, 4],
                [5, 4],
                [5, 5],
                [8, 2],
                [8, 3],
              ]}
            />
            <GlowOrb color="highlight" position="top-right" size="lg" className="opacity-20 dark:opacity-10" />
            <GlowOrb color="primary" position="bottom-left" size="lg" className="opacity-20 dark:opacity-10" />
          </>
        )}

        {variant === 'aurora' && (
          <div className="absolute inset-0 bg-background">
            <div className="absolute top-0 right-0 w-[50vw] h-[50vh] rounded-full bg-gradient-to-bl from-highlight/30 via-primary/20 to-transparent blur-3xl" />
            <div className="absolute bottom-0 left-0 w-[60vw] h-[60vh] rounded-full bg-gradient-to-tr from-primary/20 via-highlight/15 to-transparent blur-3xl" />
            <div className="absolute top-1/4 left-1/4 w-[40vw] h-[40vh] rounded-full bg-gradient-to-r from-accent/30 to-transparent blur-3xl mix-blend-overlay" />
          </div>
        )}

        {variant === 'blueprint' && (
          <div className="absolute inset-0 bg-background">
            <GridPattern
              className="opacity-60 dark:opacity-40 stroke-primary/20"
              width={32}
              height={32}
              fade="none"
            />
            {/* Horizontal Blueprint Beams */}
            <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_0%,var(--color-highlight)_50%,transparent_100%)] opacity-5 dark:opacity-10 bg-[length:100%_4px] bg-repeat-y" />
            
            {/* Topographic/Contour abstraction via SVG lines */}
            <svg className="absolute w-full h-full opacity-30 dark:opacity-20" xmlns="http://www.w3.org/2000/svg">
              <path d="M-100 100 Q 200 300, 500 100 T 1200 200" fill="none" className="stroke-highlight" strokeWidth="1" />
              <path d="M-100 120 Q 200 320, 500 120 T 1200 220" fill="none" className="stroke-primary" strokeWidth="1" />
              <path d="M-100 140 Q 200 340, 500 140 T 1200 240" fill="none" className="stroke-primary" strokeWidth="0.5" />
            </svg>
          </div>
        )}
      </div>
    );
  }
);
ArtBackground.displayName = 'ArtBackground';
