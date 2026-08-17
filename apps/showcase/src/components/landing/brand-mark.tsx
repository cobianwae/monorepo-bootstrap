import { Navigation } from 'lucide-react';
import { cn } from '@ds/ui';

interface BrandMarkProps {
  className?: string;
  /** Hide the wordmark and render only the compass glyph. */
  iconOnly?: boolean;
}

/**
 * Arah brand mark — a compass needle pointing up-right, standing for
 * "direction". Used by the landing navbar and footer.
 */
export function BrandMark({ className, iconOnly = false }: BrandMarkProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-2 font-display text-base font-bold text-foreground',
        className
      )}
    >
      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-foreground text-background shadow-sm">
        <Navigation className="h-4 w-4 fill-current" aria-hidden="true" />
      </span>
      {!iconOnly && <span>Arah</span>}
    </span>
  );
}
