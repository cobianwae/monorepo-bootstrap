import type * as React from 'react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@ds/ui';

export interface SectionHeadingProps {
  title: React.ReactNode;
  /** Satu kalimat penjelas di bawah judul. */
  description?: React.ReactNode;
  /** Ikon section (warna `highlight`). Hanya untuk `level="section"`. */
  icon?: LucideIcon;
  /** `section` = Heading 2 (h2); `sub` = Heading 3 (h3). */
  level?: 'section' | 'sub';
  /** Aksi di sisi kanan, mis. tombol "Play". */
  actions?: React.ReactNode;
  className?: string;
}

/**
 * Heading section halaman docs showcase.
 * Satu-satunya cara menulis heading section — lihat docs/design/visual-language.md
 * (Type Scale + Section Heading). Heading 2 = `text-2xl`, Heading 3 = `text-xl`,
 * keduanya `font-bold font-display` agar art direction terlihat.
 */
export function SectionHeading({
  title,
  description,
  icon: Icon,
  level = 'section',
  actions,
  className,
}: SectionHeadingProps) {
  const isSub = level === 'sub';
  const Heading = isSub ? 'h3' : 'h2';

  return (
    <div className={cn('flex items-start justify-between gap-4', className)}>
      <div className="space-y-1">
        <Heading
          className={cn(
            'flex items-center gap-2 font-bold text-foreground font-display',
            isSub ? 'text-xl' : 'text-2xl'
          )}
        >
          {Icon && !isSub && <Icon className="h-6 w-6 text-highlight" aria-hidden="true" />}
          <span>{title}</span>
        </Heading>
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
      </div>
      {actions && <div className="shrink-0">{actions}</div>}
    </div>
  );
}
