const SHORTCUTS: Array<{ keys: string; action: string }> = [
  { keys: 'Enter / F2', action: 'Ubah nama ide' },
  { keys: 'Space', action: 'Lipat atau buka cabang' },
  { keys: 'Delete', action: 'Hapus cabang (dengan konfirmasi)' },
  { keys: 'Ctrl/⌘ + Z', action: 'Urungkan perubahan' },
  { keys: '← ↑ ↓ →', action: 'Telusuri ide: saudara, induk, atau anak' },
  { keys: 'Home / End', action: 'Ke awal atau akhir daftar' },
  { keys: '+ − 0 F', action: 'Kanvas: zoom in, zoom out, reset 100%, fit view' },
];

export function MindMapShortcuts() {
  return (
    <section aria-labelledby="mind-keyboard" className="space-y-3">
      <div className="space-y-1">
        <h2 id="mind-keyboard" className="text-lg font-semibold text-foreground">
          Papan keyboard
        </h2>
        <p className="text-sm text-muted-foreground">
          Fokuskan ide atau kanvas untuk menelusuri dan mengelola peta tanpa mouse.
        </p>
      </div>
      <dl className="grid gap-2 sm:grid-cols-2">
        {SHORTCUTS.map((row) => (
          <div key={row.keys} className="rounded-md border border-border bg-card p-3">
            <dt>
              <kbd className="rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-xs text-foreground">
                {row.keys}
              </kbd>
            </dt>
            <dd className="mt-1 text-sm text-muted-foreground">{row.action}</dd>
          </div>
        ))}
      </dl>
      <p className="text-xs text-muted-foreground">
        Buka panel pohon untuk alternatif pembaca layar. Gerakan mengikuti prefers-reduced-motion. Semua handler demo
        lokal, tanpa request server.
      </p>
    </section>
  );
}
