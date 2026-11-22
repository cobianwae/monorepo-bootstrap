import type * as React from 'react';
import { cn } from '@ds/ui';

export interface SectionHeadingProps {
  title: React.ReactNode;
  /**
   * Satu kalimat penjelas di bawah judul. Opsional: isi hanya bila menambah informasi
   * yang tidak ada di judul (cara membaca, kapan dipakai); jangan mengulang judul.
   */
  description?: React.ReactNode;
  /** Aksi di sisi kanan, mis. tombol "Play". */
  actions?: React.ReactNode;
  className?: string;
}

/**
 * Heading section halaman docs showcase (Heading 2).
 * Satu-satunya cara menulis heading section — lihat docs/design/visual-language.md
 * (Type Scale + Section Heading). `text-2xl font-bold font-display` agar art direction terlihat.
 * Sengaja tanpa ikon dan tanpa level sub: belum ada kebutuhan nyata (aturan 3x, CR-037).
 */
export function SectionHeading({ title, description, actions, className }: SectionHeadingProps) {
  return (
    <div className={cn('flex items-start justify-between gap-4', className)}>
      <div className="space-y-1">
        <h2 className="text-2xl font-bold text-foreground font-display">{title}</h2>
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
      </div>
      {actions && <div className="shrink-0">{actions}</div>}
    </div>
  );
}
