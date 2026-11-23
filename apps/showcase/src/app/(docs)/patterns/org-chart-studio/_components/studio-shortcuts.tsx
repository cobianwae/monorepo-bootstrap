import { SectionHeading } from '../../../../../components/section-heading';

const SHORTCUTS: Array<{ keys: string; action: string }> = [
  { keys: 'Tab', action: 'Focus order: toolbar → search → canvas → cards and handles → controls → panel → accessible tree' },
  { keys: '← ↑ ↓ →', action: 'Pan the canvas by 40px (when the viewport has focus)' },
  { keys: '+ − 0 F', action: 'Zoom in, zoom out, reset to 100%, fit view' },
  { keys: 'Enter', action: 'Select the focused card' },
  { keys: 'Shift+Enter', action: 'Open the detail panel for the focused card' },
  { keys: 'F2 / Ctrl+Enter', action: 'Rename the focused card inline (Enter saves, Esc cancels)' },
  { keys: 'Space', action: 'Expand or collapse the focused card' },
  { keys: 'Delete', action: 'Delete the focused card after confirmation (the root is protected)' },
  { keys: 'Ctrl+Z / Ctrl+Y', action: 'Undo or redo (up to 50 steps; toolbar and live region stay in sync)' },
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

export function StudioShortcuts() {
  return (
    <section id="keyboard-a11y" aria-labelledby="org-studio-shortcuts" className="space-y-4 scroll-mt-20">
      <SectionHeading id="org-studio-shortcuts" title="Keyboard & accessibility" />
      <dl className="grid gap-2 sm:grid-cols-2">
        {SHORTCUTS.map((row) => (
          <div key={row.keys} className="rounded-md border border-border bg-card p-3">
            <dt className="font-mono text-sm font-medium text-foreground">{row.keys}</dt>
            <dd className="mt-1 text-sm text-muted-foreground">{row.action}</dd>
          </div>
        ))}
      </dl>
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
