import type { PermissionRole, PermissionResource, PermissionValue } from '@ds/ui';

/** Dataset demo 5 role × 8 resource (PRD 018, wireframe §1). */
export const DEMO_ROLES: PermissionRole[] = [
  { id: 'admin', label: 'Admin' },
  { id: 'editor', label: 'Editor' },
  { id: 'penulis', label: 'Writer' },
  { id: 'komentator', label: 'Commenter' },
  { id: 'viewer', label: 'Viewer' },
];

export const DEMO_RESOURCES: PermissionResource[] = [
  { id: 'publikasi', label: 'Publish' },
  { id: 'artikel', label: 'Articles' },
  { id: 'komentar', label: 'Comments' },
  { id: 'pengguna', label: 'Users' },
  { id: 'pengaturan', label: 'Settings' },
  { id: 'ekspor', label: 'Export' },
  { id: 'arsip', label: 'Archive' },
  { id: 'hapus', label: 'Delete' },
];

/** Dataset uji K3: 20 role (kolom) × 8 resource. */
export const WIDE_ROLES: PermissionRole[] = Array.from({ length: 20 }, (_, index) => ({
  id: `role-${String(index + 1).padStart(2, '0')}`,
  label: `Role ${String(index + 1).padStart(2, '0')}`,
}));

const GRANTS: Record<string, string[]> = {
  admin: DEMO_RESOURCES.map((resource) => resource.id),
  editor: ['publikasi', 'artikel', 'komentar', 'pengguna', 'ekspor', 'arsip'],
  penulis: ['publikasi', 'artikel', 'komentar'],
  komentator: ['komentar'],
  viewer: ['publikasi', 'artikel'],
};

/** Kunci kebijakan demo: sel Viewer × Hapus tidak bisa diubah. */
export const DEMO_LOCK_REASON = 'Locked by policy: Viewers cannot delete';

export function demoLocked(role: string, resource: string): string | null {
  return role === 'viewer' && resource === 'hapus' ? DEMO_LOCK_REASON : null;
}

export function buildDemoValue(): PermissionValue {
  return Object.fromEntries(
    DEMO_ROLES.map((role) => [
      role.id,
      Object.fromEntries(
        DEMO_RESOURCES.map((resource) => [resource.id, GRANTS[role.id]?.includes(resource.id) ?? false]),
      ),
    ]),
  );
}

/** Deterministik untuk 20 kolom: sebagian menyala, pola tidak seragam. */
export function buildWideValue(): PermissionValue {
  return Object.fromEntries(
    WIDE_ROLES.map((role, roleIndex) => [
      role.id,
      Object.fromEntries(
        DEMO_RESOURCES.map((resource, resourceIndex) => [resource.id, (roleIndex + resourceIndex) % 3 !== 0]),
      ),
    ]),
  );
}

/** Tiga sel berubah dari baseline (dirty-3): dua menyala, satu mati. */
export function applyDirtyDemo(base: PermissionValue): PermissionValue {
  return {
    ...base,
    editor: { ...base.editor, ekspor: false },
    penulis: { ...base.penulis, arsip: true },
    viewer: { ...base.viewer, komentar: true },
  };
}
