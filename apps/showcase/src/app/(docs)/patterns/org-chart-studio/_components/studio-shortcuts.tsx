const SHORTCUTS: Array<{ keys: string; action: string }> = [
  { keys: 'Tab', action: 'Urutan fokus: toolbar → pencarian → kanvas → kartu/gagang → kontrol → panel → pohon aksesibel' },
  { keys: '← ↑ ↓ →', action: 'Geser kanvas 40px (fokus di viewport)' },
  { keys: '+ − 0 F', action: 'Zoom in / out / reset 100% / fit view' },
  { keys: 'Enter', action: 'Pilih kartu fokus' },
  { keys: 'Shift+Enter', action: 'Buka panel detail kartu fokus (S-005.34.01)' },
  { keys: 'F2 / Ctrl+Enter', action: 'Ubah nama kartu fokus (inline-edit; Enter simpan, Esc batal)' },
  { keys: 'Space', action: 'Perluas/ciutkan kartu induk' },
  { keys: 'Delete', action: 'Hapus kartu fokus (dialog M-008, root diproteksi)' },
  { keys: 'Ctrl+Z / Ctrl+Y', action: 'Urungkan / ulangi perubahan (batas 50, toolbar + live region)' },
];

export function StudioShortcuts() {
  return (
    <section aria-labelledby="org-studio-shortcuts" className="space-y-3">
      <h2 id="org-studio-shortcuts" className="text-lg font-semibold text-foreground">
        Papan keyboard
      </h2>
      <dl className="grid gap-2 sm:grid-cols-2">
        {SHORTCUTS.map((row) => (
          <div key={row.keys} className="rounded-md border border-border bg-card p-3">
            <dt className="font-mono text-sm font-medium text-foreground">{row.keys}</dt>
            <dd className="mt-1 text-sm text-muted-foreground">{row.action}</dd>
          </div>
        ))}
      </dl>
      <div className="space-y-1 text-xs text-muted-foreground">
        <p>
          Jalur utama screen reader adalah pohon aksesibel internal (<code>role=&quot;tree&quot;</code>, tautan
          &quot;Lewati kanvas ke pohon aksesibel&quot; tersedia sebelum kanvas, S-005.34.01 + tab pohon SR).
        </p>
        <p>
          Live region: jumlah hasil cari + status mutasi + level zoom (<code>polite</code>; <code>assertive</code>{' '}
          hanya untuk error hapus/invalid). Fokus memakai ring <code>primary</code> offset 2px, terlihat di light dan
          dark.
        </p>
        <p>
          Reduced motion: durasi animasi 0 + pinch mati. Aksi gagang <code>+</code>, expander, dan kontrol memakai
          hit-area ≥ 44px. Strip aksen + badge selalu ditemani teks (bukan warna saja).
        </p>
      </div>
    </section>
  );
}
