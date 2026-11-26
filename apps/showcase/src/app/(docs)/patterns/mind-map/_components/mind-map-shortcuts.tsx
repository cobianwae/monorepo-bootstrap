import * as React from 'react';
import { Keyboard } from 'lucide-react';
import { Kbd } from '@ds/ui';

type ShortcutJoiner = '/' | '+' | ' ';

const SHORTCUTS: Array<{ keys: string[]; joiner: ShortcutJoiner; action: string }> = [
  { keys: ['Enter', 'F2'], joiner: '/', action: 'Rename an idea' },
  { keys: ['Space'], joiner: ' ', action: 'Collapse or expand a branch' },
  { keys: ['Delete'], joiner: ' ', action: 'Delete a branch (with confirmation)' },
  { keys: ['Ctrl/⌘', 'Z'], joiner: '+', action: 'Undo a change' },
  { keys: ['←', '↑', '↓', '→'], joiner: ' ', action: 'Move between ideas: siblings, parents, or children' },
  { keys: ['Home', 'End'], joiner: '/', action: 'Jump to the start or end of the list' },
  { keys: ['+', '−', '0', 'F'], joiner: ' ', action: 'Canvas: zoom in, zoom out, reset to 100%, fit view' },
];

export function MindMapShortcuts() {
  return (
    <section aria-labelledby="mind-keyboard" className="space-y-3">
      <div className="space-y-1">
        <h2 id="mind-keyboard" className="flex items-center gap-2 font-display text-2xl font-bold text-foreground">
          <Keyboard aria-hidden="true" className="h-6 w-6 text-highlight" />
          <span>Keyboard</span>
        </h2>
        <p className="text-sm text-muted-foreground">
          Focus an idea or the canvas to explore and manage the map without a mouse.
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
        Open the tree panel for a screen reader alternative. Motion follows prefers-reduced-motion. All demo handlers are
        local, with no server requests.
      </p>
    </section>
  );
}
