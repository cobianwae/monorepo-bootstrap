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
        className={cn('pointer-events-none fixed inset-0 -z-50 overflow-hidden', className)}
        {...props}
      >
        {variant === 'glow' && (
          <>
            <GridPattern
              className="opacity-20 dark:opacity-15 stroke-border"
              width={40}
              height={40}
              fade="radial"
            />
            {/* Native radial gradients for perfectly smooth falloff */}
            <div 
              className="absolute top-0 right-0 w-[60vw] h-[60vh] opacity-100"
              style={{
                background: 'radial-gradient(ellipse at top right, color-mix(in oklch, var(--color-highlight) 6%, transparent), transparent 65%)'
              }}
            />
            <div 
              className="absolute bottom-0 left-0 w-[50vw] h-[50vh] opacity-100"
              style={{
                background: 'radial-gradient(ellipse at bottom left, color-mix(in oklch, var(--color-primary) 4%, transparent), transparent 60%)'
              }}
            />
          </>
        )}

        {variant === 'aurora' && (
          <div className="absolute inset-0 bg-background">
            <div 
              className="absolute top-0 right-0 w-[70vw] h-[70vh]"
              style={{
                background: 'radial-gradient(ellipse at top right, color-mix(in oklch, var(--color-highlight) 8%, transparent), color-mix(in oklch, var(--color-primary) 3%, transparent) 40%, transparent 70%)'
              }}
            />
            <div 
              className="absolute bottom-0 left-0 w-[80vw] h-[80vh]"
              style={{
                background: 'radial-gradient(ellipse at bottom left, color-mix(in oklch, var(--color-primary) 6%, transparent), color-mix(in oklch, var(--color-accent) 4%, transparent) 40%, transparent 70%)'
              }}
            />
            {/* Soft ambient wash across the middle, ultra faint */}
            <div 
              className="absolute top-1/4 left-1/4 w-[50vw] h-[50vh]"
              style={{
                background: 'radial-gradient(circle at center, color-mix(in oklch, var(--color-secondary) 5%, transparent), transparent 60%)'
              }}
            />
          </div>
        )}

        {variant === 'blueprint' && (
          <div className="absolute inset-0 bg-background">
            <GridPattern
              className="opacity-25 dark:opacity-20 stroke-primary/30"
              width={48}
              height={48}
              fade="top"
            />
            
            {/* Responsive Contour / Gradient Beams anchored to the bottom */}
            <div className="absolute bottom-0 left-0 w-full h-[40vh] overflow-hidden opacity-[0.12] dark:opacity-[0.15]">
              {/* Fade out top edge of the lines */}
              <div className="absolute inset-0 bg-gradient-to-t from-transparent to-background z-10" />
              <svg 
                className="absolute inset-0 w-full h-full" 
                viewBox="0 0 100 100" 
                preserveAspectRatio="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <defs>
                  <linearGradient id="gradBlueprint1" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="var(--color-highlight)" stopOpacity="0" />
                    <stop offset="50%" stopColor="var(--color-highlight)" stopOpacity="1" />
                    <stop offset="100%" stopColor="var(--color-primary)" stopOpacity="0" />
                  </linearGradient>
                  <linearGradient id="gradBlueprint2" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="var(--color-primary)" stopOpacity="0" />
                    <stop offset="70%" stopColor="var(--color-primary)" stopOpacity="1" />
                    <stop offset="100%" stopColor="var(--color-highlight)" stopOpacity="0" />
                  </linearGradient>
                </defs>
                
                {/* 3 scaling contour paths */}
                <path d="M0,80 Q30,50 50,70 T100,60" fill="none" stroke="url(#gradBlueprint1)" strokeWidth="0.5" vectorEffect="non-scaling-stroke" />
                <path d="M0,90 Q40,60 60,80 T100,70" fill="none" stroke="url(#gradBlueprint2)" strokeWidth="1" vectorEffect="non-scaling-stroke" />
                <path d="M0,100 Q50,70 70,90 T100,80" fill="none" stroke="url(#gradBlueprint2)" strokeWidth="0.5" vectorEffect="non-scaling-stroke" />
                
                {/* Abstract geometric accents (blueprint feel) */}
                <circle cx="50" cy="70" r="1.5" fill="none" stroke="url(#gradBlueprint1)" strokeWidth="0.5" vectorEffect="non-scaling-stroke" />
                <line x1="50" y1="68" x2="50" y2="72" stroke="url(#gradBlueprint1)" strokeWidth="0.5" vectorEffect="non-scaling-stroke" />
                <line x1="48" y1="70" x2="52" y2="70" stroke="url(#gradBlueprint1)" strokeWidth="0.5" vectorEffect="non-scaling-stroke" />
              </svg>
            </div>
          </div>
        )}
      </div>
    );
  }
);
ArtBackground.displayName = 'ArtBackground';
