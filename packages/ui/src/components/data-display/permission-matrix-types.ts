import type { ReactNode } from 'react';

export type RoleId = string;
export type ResourceId = string;

/** Nilai controlled: nested record K1 — akses sel `value[role][resource]` O(1). */
export type PermissionValue = Record<RoleId, Record<ResourceId, boolean>>;

export interface PermissionDiff {
  role: RoleId;
  resource: ResourceId;
  from: boolean;
  to: boolean;
}

export interface PermissionRole {
  id: RoleId;
  label: string;
}

export interface PermissionResource {
  id: ResourceId;
  label: string;
}

export interface RenderCellInfo {
  role: RoleId;
  resource: ResourceId;
  checked: boolean;
  lockedReason: string | null;
}

export interface PermissionMatrixProps {
  roles: PermissionRole[];
  resources: PermissionResource[];
  /** Controlled — komponen tidak menyimpan state nilai internal. */
  value: PermissionValue;
  onValueChange?: (next: PermissionValue, diff: PermissionDiff[]) => void;
  /**
   * Baseline dirty banner (FR-003/FR-005): `diff(initialValue, value)`.
   * Tanpa prop ini, snapshot nilai pertama saat grid siap menjadi baseline.
   * Konsumen memperbarui baseline setelah penyimpanan berhasil.
   */
  initialValue?: PermissionValue;
  /** Slot konsumen: dipanggil dari tombol Simpan di banner dirty. */
  onSave?: () => void;
  /** Slot konsumen: bila diisi, banner dirty menampilkan tombol Batal. */
  onCancel?: () => void;
  /** Slot konsumen: dipanggil dari CTA state error/empty bila `onEmptyAction` kosong. */
  onLoadExample?: () => void;
  /** State loading: skeleton 5×8 + `aria-busy` + teks SR. */
  loading?: boolean;
  /** State error: `alert` + penyebab + CTA + fokus ke alert; diumumkan via live region assertive. */
  error?: string | null;
  emptyActionLabel?: string;
  /** Slot konsumen: CTA state empty; fallback ke `onLoadExample`. */
  onEmptyAction?: () => void;
  /** Kembalikan alasan kunci atau null bila sel bebas. Default `() => null`. */
  locked?: (role: RoleId, resource: ResourceId) => string | null;
  /** Slot future FR-010 (K2): bila diisi, menggantikan checkbox sel default. */
  renderCell?: (info: RenderCellInfo) => ReactNode;
  density?: 'default' | 'compact';
  className?: string;
}
