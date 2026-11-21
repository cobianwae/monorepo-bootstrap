import * as React from 'react';
import { Keyboard } from 'lucide-react';
import { Kbd } from '@ds/ui';

type ShortcutJoiner = '/' | '+' | ' ';

const SHORTCUTS: Array<{ keys: string[]; joiner: ShortcutJoiner; action: string }> = [
  { keys: ['Enter', 'F2'], joiner: '/', action: 'Ubah nama ide' },
  { keys: ['Space'], joiner: ' ', action: 'Lipat atau buka cabang' },
  { keys: ['Delete'], joiner: ' ', action: 'Hapus cabang (dengan konfirmasi)' },
  { keys: ['Ctrl/⌘', 'Z'], joiner: '+', action: 'Urungkan perubahan' },
  { keys: ['←', '↑', '↓', '→'], joiner: ' ', action: 'Telusuri ide: saudara, induk, atau anak' },
  { keys: ['Home', 'End'], joiner: '/', action: 'Ke awal atau akhir daftar' },
  { keys: ['+', '−', '0', 'F'], joiner: ' ', action: 'Kanvas: zoom in, zoom out, reset 100%, fit view' },
];

export function MindMapShortcuts() {
  return (
    <section aria-labelledby="mind-keyboard" className="space-y-3">
      <div className="space-y-1">
        <h2 id="mind-keyboard" className="flex items-center gap-2 font-display text-2xl font-bold text-foreground">
          <Keyboard aria-hidden="true" className="h-6 w-6 text-highlight" />
          <span>Papan keyboard</span>
        </h2>
        <p className="text-sm text-muted-foreground">
          Fokuskan ide atau kanvas untuk menelusuri dan mengelola peta tanpa mouse.
        </p>
      </div>
      <dl className="grid gap-2 sm:grid-cols-2">
        {SHORTCUTS.map((row) => (
          <div key={row.keys.join(' ')} className="rounded-md border border-border bg-card p-3">
            <dt className="flex flex-wrap items-center gap-1">
              {row.keys.map((key, index) => (
                <React.Fragment key={key}>
                  {index > 0 && (
                    <span aria-hidden="true" className="px-0.5 text-xs text-muted-foreground">
                      {row.joiner === ' ' ? '' : row.joiner}
                    </span>
                  )}
                  <Kbd size="sm" variant="outline">{key}</Kbd>
                </React.Fragment>
              ))}
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
