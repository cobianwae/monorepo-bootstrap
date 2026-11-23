import { SectionHeading } from '../../../../../components/section-heading';

const SHORTCUTS: Array<{ combos: string[][]; action: string }> = [
  { combos: [['Tab']], action: 'Focus order: toolbar → search → canvas → cards and handles → controls → panel → accessible tree' },
  { combos: [['←'], ['↑'], ['↓'], ['→']], action: 'Pan the canvas by 40px (when the viewport has focus)' },
  { combos: [['+'], ['−'], ['0'], ['F']], action: 'Zoom in, zoom out, reset to 100%, fit view' },
  { combos: [['Enter']], action: 'Select the focused card' },
  { combos: [['Shift', 'Enter']], action: 'Open the detail panel for the focused card' },
  { combos: [['F2'], ['Ctrl', 'Enter']], action: 'Rename the focused card inline (Enter saves, Esc cancels)' },
  { combos: [['Space']], action: 'Expand or collapse the focused card' },
  { combos: [['Delete']], action: 'Delete the focused card after confirmation (the root is protected)' },
  { combos: [['Ctrl', 'Z'], ['Ctrl', 'Y']], action: 'Undo or redo (up to 50 steps; toolbar and live region stay in sync)' },
];

const A11Y_NOTES: Array<{ title: string; detail: string }> = [
  {
    title: 'Screen reader',
    detail:
      'The primary path is the built-in accessible tree (role="tree"). A "Skip canvas to accessible tree" link comes before the canvas.',
  },
  {
    title: 'Live regions',
    detail:
      'Search result count, edit status and zoom level are announced politely. Only delete errors and invalid data use assertive.',
  },
  {
    title: 'Focus',
    detail: 'Focus uses a primary ring with a 2px offset, visible in both light and dark mode.',
  },
  {
    title: 'Motion and touch',
    detail:
      'Reduced motion removes animation and disables pinch. Handles, expanders and controls have hit areas of at least 44px. Accent strips and badges always come with text, never colour alone.',
  },
];

const KBD_CLASS = 'rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-xs text-foreground';

export function StudioShortcuts() {
  return (
    <section id="keyboard-a11y" aria-labelledby="org-studio-shortcuts" className="space-y-4 scroll-mt-20">
      <SectionHeading id="org-studio-shortcuts" title="Keyboard & accessibility" />
      <h3 className="text-xl font-bold font-display text-foreground">Keyboard shortcuts</h3>
      <dl className="grid gap-2 sm:grid-cols-2">
        {SHORTCUTS.map((row) => (
          <div key={row.action} className="rounded-md border border-border bg-card p-3">
            <dt className="flex flex-wrap items-center gap-1 text-sm font-medium text-foreground">
              {row.combos.map((combo, comboIndex) => (
                <span key={combo.join('+')} className="flex items-center gap-1">
                  {comboIndex > 0 ? <span aria-hidden="true" className="text-muted-foreground">/</span> : null}
                  {combo.map((key, keyIndex) => (
                    <span key={key} className="flex items-center gap-1">
                      {keyIndex > 0 ? <span aria-hidden="true" className="text-muted-foreground">+</span> : null}
                      <kbd className={KBD_CLASS}>{key}</kbd>
                    </span>
                  ))}
                </span>
              ))}
            </dt>
            <dd className="mt-1 text-sm text-muted-foreground">{row.action}</dd>
          </div>
        ))}
      </dl>
      <h3 className="text-xl font-bold font-display text-foreground">Accessibility notes</h3>
      <ul className="grid gap-3 sm:grid-cols-2">
        {A11Y_NOTES.map((note) => (
          <li key={note.title} className="rounded-md border border-border bg-card p-3">
            <p className="text-sm font-medium text-foreground">{note.title}</p>
            <p className="mt-1 text-sm text-muted-foreground">{note.detail}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
