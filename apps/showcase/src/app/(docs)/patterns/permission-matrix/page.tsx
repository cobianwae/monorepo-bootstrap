'use client';

import * as React from 'react';
import { Button, Card, CardContent, CardHeader, CardTitle, PageHeader, PermissionMatrix } from '@ds/ui';
import type { PermissionValue } from '@ds/ui';
import {
  DEMO_RESOURCES,
  DEMO_ROLES,
  WIDE_ROLES,
  applyDirtyDemo,
  buildDemoValue,
  buildWideValue,
  demoLocked,
} from './_lib/demo-data';
import { PERMISSION_MATRIX_RECIPE } from './_lib/recipe';

type Scenario = 'demo' | 'dirty' | 'empty' | 'invalid' | 'loading' | 'error';

const SCENARIOS: { id: Scenario; label: string }[] = [
  { id: 'demo', label: '5×8 dataset (locked cells)' },
  { id: 'dirty', label: '3 unsaved changes' },
  { id: 'empty', label: 'Empty' },
  { id: 'invalid', label: 'Invalid (duplicate role)' },
  { id: 'loading', label: 'Loading' },
  { id: 'error', label: 'Error' },
];

const STEPS = [
  'Start with the 5×8 matrix. The "Viewer × Delete" cell is locked.',
  'Select the "Editor" column header to enable all unlocked Editor permissions.',
  'Try changing "Viewer × Delete". The change is blocked and the lock reason is announced.',
  'Change three other cells to show the unsaved-change count.',
  'Open "View changes" in the banner, then reset or save.',
];

const KEYBOARD = [
  'Arrow keys: move between cells and headers.',
  'Space: toggle a cell. Enter or Space on a header: toggle a row, column, or the entire matrix.',
  'Home / End: move to the start or end of a row. Ctrl+Home / Ctrl+End: move to a grid corner.',
];

export default function PermissionMatrixPage() {
  const [scenario, setScenario] = React.useState<Scenario>('demo');
  const [wide, setWide] = React.useState(false);
  const [dark, setDark] = React.useState(false);
  const [value, setValue] = React.useState<PermissionValue>(buildDemoValue);
  const [saved, setSaved] = React.useState<PermissionValue>(buildDemoValue);
  const [notice, setNotice] = React.useState('');
  const [copyStatus, setCopyStatus] = React.useState('');

  const loadDataset = (next: Scenario, nextWide: boolean) => {
    const base = nextWide ? buildWideValue() : buildDemoValue();
    const start = next === 'dirty' && !nextWide ? applyDirtyDemo(base) : base;
    setScenario(next);
    setWide(nextWide);
    setSaved(base);
    setValue(start);
    setNotice('');
  };

  const selectScenario = (next: Scenario) => {
    const keepWide = next !== 'demo' && next !== 'dirty' && wide;
    loadDataset(next, keepWide);
  };

  const roles = scenario === 'empty'
    ? []
    : scenario === 'invalid'
      ? [...DEMO_ROLES, DEMO_ROLES[0]]
      : wide
        ? WIDE_ROLES
        : DEMO_ROLES;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(PERMISSION_MATRIX_RECIPE);
      setCopyStatus('Recipe copied.');
    } catch {
      setCopyStatus('Could not copy. Select and copy the recipe above.');
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in-50 duration-200">
      <PageHeader
        eyebrow="Pattern"
        title="Permission Matrix"
        description="Manage permissions across roles and resources. Review unsaved changes and understand why some permissions are locked."
      />

      <Card className="mx-auto max-w-5xl">
        <CardHeader>
          <CardTitle>Try it</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <ol className="list-decimal space-y-2 pl-5 text-sm text-foreground">
            {STEPS.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              aria-pressed={dark}
              onClick={() => setDark((current) => !current)}
            >
              {dark ? 'Theme: dark' : 'Theme: light'}
            </Button>
            <Button
              variant="outline"
              size="sm"
              aria-pressed={wide}
              onClick={() => loadDataset('demo', !wide)}
            >
              Try 20 columns
            </Button>
          </div>

          <div
            data-testid="pm-theme-scope"
            className={
              dark
                ? 'dark space-y-4 rounded-lg border border-border bg-background p-4 text-foreground'
                : 'space-y-4 rounded-lg border border-border bg-background p-4 text-foreground'
            }
          >
            <PermissionMatrix
              roles={roles}
              resources={DEMO_RESOURCES}
              value={value}
              initialValue={saved}
              onValueChange={setValue}
              onSave={() => {
                setSaved(value);
                setNotice('Changes saved for this demo.');
              }}
              onCancel={() => {
                setValue(saved);
                setNotice('Changes discarded.');
              }}
              onLoadExample={() => loadDataset('demo', false)}
              onEmptyAction={() => loadDataset('demo', false)}
              loading={scenario === 'loading'}
              error={scenario === 'error' ? 'The data source is unavailable' : null}
              locked={demoLocked}
            />
          </div>

          <p role="status" className="text-sm text-muted-foreground" data-testid="pm-notice">
            {notice}
          </p>
        </CardContent>
      </Card>

      <Card className="mx-auto max-w-5xl">
        <CardHeader>
          <CardTitle>Accessibility notes</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="list-disc space-y-1 pl-5 text-sm text-foreground">
            {KEYBOARD.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Card className="mx-auto max-w-5xl">
        <CardHeader>
          <CardTitle>Demo states</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {SCENARIOS.map((item) => (
              <Button
                key={item.id}
                variant="outline"
                size="sm"
                aria-pressed={scenario === item.id}
                onClick={() => selectScenario(item.id)}
              >
                {item.label}
              </Button>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">
            &quot;Viewer × Delete&quot; is always locked in the 5×8 dataset. The unsaved-changes example modifies three cells from the baseline.
          </p>
        </CardContent>
      </Card>

      <Card className="mx-auto max-w-5xl">
        <CardHeader>
          <CardTitle>Implementation</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <pre className="overflow-x-auto rounded-md bg-muted p-3 text-xs text-foreground">
            <code>{PERMISSION_MATRIX_RECIPE}</code>
          </pre>
          <div className="flex flex-wrap items-center gap-3">
            <Button variant="outline" size="sm" onClick={handleCopy}>
            Copy recipe
            </Button>
            <p role="status" className="text-sm text-muted-foreground">
              {copyStatus}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
