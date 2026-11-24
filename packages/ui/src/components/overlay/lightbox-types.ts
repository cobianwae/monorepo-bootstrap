import type * as React from 'react';

export type LightboxItemType = 'image' | 'video';

export interface LightboxItem {
  id: string;
  src: string;
  /** Wajib untuk a11y; kosong ditolak dengan peringatan dev. */
  alt: string;
  type?: LightboxItemType;
  /** Thumbnail video / poster. */
  poster?: string;
  /** Lebar asli (px) — dipakai zoom maksimal & rasio video. */
  width?: number;
  /** Tinggi asli (px) — dipakai zoom maksimal & rasio video. */
  height?: number;
  caption?: string;
  meta?: string;
}

export interface LightboxProps {
  items: LightboxItem[];
  /** Controlled; `null` = tertutup (K5). */
  openIndex: number | null;
  onOpenChange: (index: number | null) => void;
  renderCaption?: (item: LightboxItem, index: number) => React.ReactNode;
  /** Slot aksi opsional milik konsumen (K3). */
  actions?: React.ReactNode;
  /** Default `true`. */
  closeOnBackdropClick?: boolean;
  /** State loading komponen (FR-008): skeleton + `aria-busy`, navigasi antre. */
  loading?: boolean;
  /** Penyebab error item aktif untuk state error (FR-008); kosong = tidak error. */
  error?: string | null;
  /** Dipanggil saat [Coba lagi] pada state error; default muat ulang slide. */
  onRetry?: (index: number) => void;
}
