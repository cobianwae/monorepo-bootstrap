export const SETTINGS_RECIPE = `const [saved, setSaved] = useState(initial);
const [draft, setDraft] = useState(initial);

// One list drives the row markers, the count and the save bar.
const changed = Object.keys(saved).filter((key) => draft[key] !== saved[key]);

<Input
  id="title"
  value={draft.title}
  aria-describedby={changed.includes('title') ? 'title-was' : undefined}
  onChange={(e) => setDraft({ ...draft, title: e.target.value })}
/>
{changed.includes('title') && <p id="title-was">was “{saved.title}”</p>}

{/* Always mounted, so the count is announced when it appears. */}
<p role="status" className="sr-only">
  {changed.length > 0 ? \`\${changed.length} unsaved\` : ''}
</p>

{changed.length > 0 && (
  <div className="sticky bottom-4">
    <Button variant="ghost" onClick={() => setDraft(saved)}>Discard</Button>
    <Button onClick={() => setSaved(draft)}>Save changes</Button>
  </div>
)}`;

export const A11Y_NOTES = [
  {
    term: 'Navigation',
    meaning: 'Every section is a button. Tab reaches each one, and the open section is marked with aria-current.',
  },
  {
    term: 'Search',
    meaning: 'The result count is announced. Choosing a result moves focus to its control; Escape brings the sections back.',
  },
  {
    term: 'Errors',
    meaning: 'Each message is tied to its field with aria-describedby, and Save moves focus to the first invalid one.',
  },
  {
    term: 'Unsaved changes',
    meaning: 'A status region announces the count. Changed sections carry a text label, not only a dot.',
  },
  {
    term: 'Dialogs',
    meaning: 'Focus stays inside until the dialog closes. Deleting stays disabled until DELETE is typed.',
  },
  {
    term: 'Small screens',
    meaning: 'Opening a section moves focus to its title; All settings returns focus to where you came from.',
  },
];
