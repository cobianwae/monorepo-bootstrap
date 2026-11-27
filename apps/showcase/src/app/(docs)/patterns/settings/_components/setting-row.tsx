import type * as React from 'react';
import { Label, cn } from '@ds/ui';

export interface SettingRowProps {
  /** id kontrol; id penjelasan, nilai lama, dan error diturunkan darinya. */
  id: string;
  label: string;
  description?: string;
  /** false bila isi baris bukan kontrol yang bisa diberi label (mis. teks). */
  labelled?: boolean;
  /** Catatan perubahan; mengaktifkan penanda tepi. */
  changed?: string;
  error?: string;
  /** Kontrol menempel di kanan (switch, tombol), tetap sebaris di mobile. */
  inline?: boolean;
  children: (describedBy: string | undefined) => React.ReactNode;
}

export function SettingRow({
  id,
  label,
  description,
  labelled = true,
  changed,
  error,
  inline = false,
  children,
}: SettingRowProps) {
  const describedBy =
    [error && `${id}-error`, description && `${id}-hint`, changed && `${id}-was`].filter(Boolean).join(' ') ||
    undefined;

  return (
    <div
      data-changed={changed ? true : undefined}
      className={cn(
        'border-b border-l-2 border-b-border border-l-transparent px-4 py-4 last:border-b-0 sm:px-5',
        changed && 'border-l-highlight'
      )}
    >
      <div
        className={cn(
          'grid gap-2',
          inline
            ? 'grid-cols-[minmax(0,1fr)_auto] items-center gap-4'
            : '@xl:grid-cols-[14rem_minmax(0,1fr)] @xl:gap-6'
        )}
      >
        <div className="space-y-1">
          {labelled ? (
            <Label htmlFor={id} className="text-sm font-medium">
              {label}
            </Label>
          ) : (
            <p className="text-sm font-medium text-foreground">{label}</p>
          )}
          {description && (
            <p id={`${id}-hint`} className="text-xs text-muted-foreground">
              {description}
            </p>
          )}
        </div>
        <div className={cn('min-w-0 space-y-2', !inline && 'max-w-md')}>
          {children(describedBy)}
          {error && (
            <p id={`${id}-error`} className="text-xs font-medium text-destructive">
              {error}
            </p>
          )}
          {changed && (
            <p id={`${id}-was`} className="text-xs text-muted-foreground">
              {changed}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
