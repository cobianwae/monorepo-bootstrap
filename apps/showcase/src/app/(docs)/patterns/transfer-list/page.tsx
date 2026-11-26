'use client';

import * as React from 'react';
import { PageHeader } from '@ds/ui';
import { TransferList, type TransferItem } from '@ds/ui';

const ROLE_MEMBERS: TransferItem[] = [
  { id: 'u-01', label: 'Alice — Frontend' },
  { id: 'u-02', label: 'Bob — Backend' },
  { id: 'u-03', label: 'Carol — QA' },
  { id: 'u-04', label: 'Dave — PM' },
  { id: 'u-05', label: 'Erin — Frontend' },
  { id: 'u-06', label: 'Frank — QA' },
  { id: 'u-07', label: 'Grace — Designer' },
  { id: 'u-08', label: 'Hank — Backend' },
  { id: 'u-09', label: 'Ivy — DevOps' },
  { id: 'u-10', label: 'Jack — Frontend' },
  { id: 'u-11', label: 'Kim — QA' },
  { id: 'u-12', label: 'Leo — Support' },
  { id: 'u-13', label: 'Maya — PM' },
  { id: 'u-14', label: 'Noah — Backend' },
  { id: 'u-15', label: 'Olivia — Designer' },
];

type DemoState = 'success' | 'loading' | 'empty' | 'error';

export default function TransferListPatternPage() {
  const [value, setValue] = React.useState<string[]>(['u-13', 'u-14', 'u-15']);
  const [demoState, setDemoState] = React.useState<DemoState>('success');

  const isLoading = demoState === 'loading';
  const isEmpty = demoState === 'empty';
  const demoError = demoState === 'error' ? 'Failed to load members. Try again.' : null;
  const demoItems = isEmpty ? [] : ROLE_MEMBERS;
  const demoValue = isEmpty ? [] : value;

  return (
    <div className="flex flex-col gap-6 p-6">
      <PageHeader
        title="Transfer List"
        description="Assign members to a role by moving them between two searchable lists."
      />
      <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Demo state">
        {(['success', 'loading', 'empty', 'error'] as const).map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setDemoState(s)}
            aria-pressed={demoState === s}
            className={
              demoState === s
                ? 'rounded-md bg-highlight/10 ring-1 ring-highlight px-3 py-1.5 text-sm text-foreground'
                : 'rounded-md border border-border px-3 py-1.5 text-sm text-foreground'
            }
          >
            {s}
          </button>
        ))}
      </div>
      <TransferList
        items={demoItems}
        value={demoValue}
        onChange={isEmpty ? () => undefined : setValue}
        loading={isLoading}
        error={demoError}
        availableLabel="Available members"
        selectedLabel="Role members"
      />
      <ol className="flex flex-col gap-1 text-sm text-muted-foreground">
        <li>1. Select a member on the left. Ctrl+click selects multiple items; Shift+click selects a range.</li>
        <li>2. Move members with the arrow button, a double-click, or the move-all-visible action.</li>
        <li>3. Filter either list without changing the assigned members.</li>
        <li>4. Use Tab to reach a list, arrow keys to navigate, and Space or Enter to select. Tab to the move buttons.</li>
        <li>5. After a move, focus follows the items to the destination list.</li>
        <li>6. Use the demo controls to try loading, empty, and error states (S-005.30).</li>
      </ol>
    </div>
  );
}
