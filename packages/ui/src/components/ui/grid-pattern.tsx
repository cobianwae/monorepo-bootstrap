import * as React from 'react';
import { cn } from '../../lib/utils';

export interface GridPatternProps extends React.SVGProps<SVGSVGElement> {
  width?: number;
  height?: number;
  x?: number;
  y?: number;
  squares?: Array<[x: number, y: number]>;
  strokeDasharray?: string;
  className?: string;
  fade?: 'radial' | 'top' | 'bottom' | 'none';
}

export const GridPattern = React.forwardRef<SVGSVGElement, GridPatternProps>(
  (
    {
      width = 40,
      height = 40,
      x = -1,
      y = -1,
      squares,
      strokeDasharray = '0',
      className,
      fade = 'radial',
      ...props
    },
    ref
  ) => {
    const id = React.useId();

    return (
      <svg
        ref={ref}
        aria-hidden="true"
        className={cn(
          'pointer-events-none absolute inset-0 h-full w-full stroke-border/50 fill-none',
          fade === 'radial' && '[mask-image:radial-gradient(ellipse_at_center,white_30%,transparent_75%)]',
          fade === 'top' && '[mask-image:linear-gradient(to_bottom,white_10%,transparent_90%)]',
          fade === 'bottom' && '[mask-image:linear-gradient(to_top,white_10%,transparent_90%)]',
          className
        )}
        {...props}
      >
        <defs>
          <pattern
            id={id}
            width={width}
            height={height}
            patternUnits="userSpaceOnUse"
            x={x}
            y={y}
          >
            <path
              d={`M.5 ${height}V.5H${width}`}
              fill="none"
              strokeDasharray={strokeDasharray}
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" strokeWidth={0} fill={`url(#${id})`} />
        {squares && (
          <svg x={x} y={y} className="overflow-visible">
            {squares.map(([sqX, sqY], idx) => (
              <rect
                strokeWidth="0"
                key={`${sqX}-${sqY}-${idx}`}
                width={width - 1}
                height={height - 1}
                x={sqX * width + 1}
                y={sqY * height + 1}
                className="fill-highlight/10 stroke-highlight/30"
              />
            ))}
          </svg>
        )}
      </svg>
    );
  }
);
GridPattern.displayName = 'GridPattern';
