'use client';

import * as React from 'react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Card } from './card';
import { Progress } from './progress';

export interface MetricTile {
  label: string;
  value: React.ReactNode;
  unit?: string;
  highlight?: boolean;
  tone?: 'default' | 'primary' | 'success';
}

export interface MetricTilesCardProgress {
  value: number;
  label: React.ReactNode;
  sublabel?: React.ReactNode;
  icon?: LucideIcon;
  tone?: 'default' | 'success';
}

export interface MetricTilesCardProps extends React.HTMLAttributes<HTMLDivElement> {
  tiles: MetricTile[];
  progress?: MetricTilesCardProgress;
  footer?: React.ReactNode;
  containerClassName?: string;
}

const toneTileClasses: Record<NonNullable<MetricTile['tone']>, string> = {
  default: 'text-foreground',
  primary: 'text-foreground ring-1 ring-primary/30',
  success: 'text-success',
};

export function MetricTilesCard({
  className,
  containerClassName,
  tiles,
  progress,
  footer,
  ...props
}: MetricTilesCardProps) {
  return (
    <Card
      className={cn('p-4 md:p-6 bg-card border-border shadow-xs', className)}
      {...props}
    >
      <div className={cn('flex flex-col gap-3 bg-muted/30 p-3.5 rounded-xl border border-border/50', containerClassName)}>
        <div className="grid grid-cols-3 gap-2 text-center">
          {tiles.map((tile) => (
            <div
              key={tile.label}
              className={cn(
                'bg-background/80 p-2 rounded-lg border border-border/40',
                tile.highlight && 'ring-1 ring-primary/30'
              )}
            >
              <span
                className={cn(
                  'text-[10px] uppercase font-mono block',
                  tile.highlight ? 'text-primary font-semibold' : 'text-muted-foreground'
                )}
              >
                {tile.label}
              </span>
              <span className={cn('font-display font-bold text-sm text-foreground', tile.tone && toneTileClasses[tile.tone])}>
                {tile.value}
                {tile.unit && <span className="text-xs font-sans text-muted-foreground ml-0.5">{tile.unit}</span>}
              </span>
            </div>
          ))}
        </div>

        {progress && (
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-xs">
              <span className="text-muted-foreground flex items-center gap-1 font-medium">
                {progress.icon && <progress.icon className="h-3.5 w-3.5 text-success" />}
                {progress.label}
              </span>
              {progress.sublabel && (
                <span className="font-mono text-[11px] font-semibold text-foreground">
                  {progress.sublabel}
                </span>
              )}
            </div>
            <Progress value={progress.value} className="h-2 bg-muted" />
          </div>
        )}

        {footer && (
          <div className="flex items-center justify-between text-[11px] pt-1 border-t border-border/30">
            {footer}
          </div>
        )}
      </div>
    </Card>
  );
}