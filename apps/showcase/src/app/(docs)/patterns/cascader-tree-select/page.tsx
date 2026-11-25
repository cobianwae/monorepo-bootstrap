'use client';

import * as React from 'react';
import {
  PageHeader,
  Cascader,
  TreeSelect,
  SegmentedControl,
  SegmentedControlItem,
  type CascaderNode,
  type TreeSelectNode,
} from '@ds/ui';
import { SectionHeading } from '../../../../components/section-heading';

const ADDRESS: CascaderNode[] = [
  { id: 'id', parentId: null, label: 'ID' },
  { id: 'jabar', parentId: 'id', label: 'Jawa Barat' },
  { id: 'jatim', parentId: 'id', label: 'Jawa Timur' },
  { id: 'bdg', parentId: 'jabar', label: 'Bandung' },
  { id: 'bgr', parentId: 'jabar', label: 'Bogor' },
  { id: 'sby', parentId: 'jatim', label: 'Surabaya' },
  { id: 'mlg', parentId: 'jatim', label: 'Malang' },
  { id: 'coblong', parentId: 'bdg', label: 'Coblong', isLeaf: true },
  { id: 'sukajadi', parentId: 'bdg', label: 'Sukajadi', isLeaf: true },
  { id: 'bogor-sel', parentId: 'bgr', label: 'Bogor Selatan', isLeaf: true },
  { id: 'genteng', parentId: 'sby', label: 'Genteng', isLeaf: true },
  { id: 'klojen', parentId: 'mlg', label: 'Klojen', isLeaf: true },
];

const LAZY_ROOT: CascaderNode[] = [{ id: 'id', parentId: null, label: 'ID' }];

function fakeFetch(parentId: string | null): Promise<CascaderNode[]> {
  return new Promise((resolve) => {
    window.setTimeout(() => {
      if (parentId === null || parentId === 'id') {
        resolve([
          { id: 'jabar', parentId: 'id', label: 'Jawa Barat' },
          { id: 'jatim', parentId: 'id', label: 'Jawa Timur' },
        ]);
      } else if (parentId === 'jabar') {
        resolve([
          { id: 'bdg', parentId: 'jabar', label: 'Bandung' },
          { id: 'bgr', parentId: 'jabar', label: 'Bogor' },
        ]);
      } else if (parentId === 'bdg') {
        resolve([{ id: 'coblong', parentId: 'bdg', label: 'Coblong', isLeaf: true }]);
      } else {
        resolve([{ id: `${parentId}-leaf`, parentId, label: `${parentId} Kec.`, isLeaf: true }]);
      }
    }, 400);
  });
}

const CATEGORY: TreeSelectNode[] = [
  { id: 'el', parentId: null, label: 'Elektronik' },
  { id: 'hp', parentId: 'el', label: 'HP' },
  { id: 'android', parentId: 'hp', label: 'Android' },
  { id: 'ios', parentId: 'hp', label: 'iOS' },
  { id: 'laptop', parentId: 'el', label: 'Laptop' },
  { id: 'fashion', parentId: null, label: 'Fashion' },
  { id: 'pria', parentId: 'fashion', label: 'Pria' },
  { id: 'wanita', parentId: 'fashion', label: 'Wanita' },
];

function labelOf(nodes: readonly { id: string; label: string }[], id: string): string {
  return nodes.find((node) => node.id === id)?.label ?? id;
}

function pathLabels(
  nodes: readonly { id: string; label: string }[],
  ids: string[],
): string[] {
  return ids.map((id) => labelOf(nodes, id));
}

export default function CascaderTreeSelectPatternPage() {
  const [value, setValue] = React.useState<string[]>(['id', 'jabar', 'bdg', 'coblong']);
  const [clearableValue, setClearableValue] = React.useState<string[]>([
    'id',
    'jabar',
    'bdg',
    'coblong',
  ]);
  const [disabledValue, setDisabledValue] = React.useState<string[]>([
    'id',
    'jabar',
    'bdg',
    'coblong',
  ]);
  const [errorValue, setErrorValue] = React.useState<string[]>([]);
  const [displayMode, setDisplayMode] = React.useState<'full' | 'last'>('full');
  const [lazyValue, setLazyValue] = React.useState<string[]>([]);
  const [single, setSingle] = React.useState<string | string[]>('');
  const [multi, setMulti] = React.useState<string | string[]>(['android', 'ios', 'laptop', 'pria', 'wanita']);

  return (
    <div className="space-y-10 animate-in fade-in-50 duration-200 motion-reduce:animate-none">
      <PageHeader
        title="Cascader & Tree Select — Address/Category (S-005.31)"
        description="Pick a three-level address (province → city → district) or a product category from a nested tree. Try selecting a leaf, switching display mode, and navigating with the keyboard."
      />

      <section id="cascader" aria-labelledby="cascader-heading" className="space-y-4 scroll-mt-20">
        <SectionHeading id="cascader-heading" title="Cascader" />

        <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4">
          <h3 className="text-sm font-semibold text-foreground">Main demo — nested address</h3>
          <SegmentedControl
            type="single"
            value={displayMode}
            onValueChange={(value) => {
              if (value) setDisplayMode(value as 'full' | 'last');
            }}
            aria-label="Display mode"
          >
            <SegmentedControlItem value="full">Full mode</SegmentedControlItem>
            <SegmentedControlItem value="last">Last level only</SegmentedControlItem>
          </SegmentedControl>
          <Cascader
            options={ADDRESS}
            value={value}
            onChange={setValue}
            displayMode={displayMode}
            label="Home address"
            placeholder="Select province → city → district"
          />
          <p className="text-sm text-muted-foreground" aria-live="polite">
            Value:{' '}
            {value.length === 0
              ? '—'
              : displayMode === 'last'
                ? labelOf(ADDRESS, value[value.length - 1])
                : pathLabels(ADDRESS, value).join(' → ')}
          </p>
        </div>

        <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4">
          <h3 className="text-sm font-semibold text-foreground">Lazy load per column</h3>
          <Cascader
            options={LAZY_ROOT}
            value={lazyValue}
            onChange={setLazyValue}
            loadChildren={fakeFetch}
            label="Address"
            placeholder="Select a region — options load gradually"
          />
          <p className="text-sm text-muted-foreground" aria-live="polite">
            Value:{' '}
            {lazyValue.length === 0
              ? '—'
              : pathLabels([...LAZY_ROOT, ...ADDRESS], lazyValue).join(' → ')}
          </p>
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          <div className="flex flex-col gap-2 rounded-xl border border-border bg-card p-4">
            <h3 className="text-sm font-semibold text-foreground">Clearable</h3>
            <Cascader
              options={ADDRESS}
              value={clearableValue}
              onChange={setClearableValue}
              label="Address"
            />
            <p className="text-sm text-muted-foreground" aria-live="polite">
              Value: {clearableValue.length === 0 ? '—' : pathLabels(ADDRESS, clearableValue).join(' → ')}
            </p>
          </div>
          <div className="flex flex-col gap-2 rounded-xl border border-border bg-card p-4">
            <h3 className="text-sm font-semibold text-foreground">Disabled</h3>
            <Cascader
              options={ADDRESS}
              value={disabledValue}
              onChange={setDisabledValue}
              disabled
              label="Address"
            />
          </div>
          <div className="flex flex-col gap-2 rounded-xl border border-border bg-card p-4">
            <h3 className="text-sm font-semibold text-foreground">Error</h3>
            <Cascader
              options={ADDRESS}
              value={errorValue}
              onChange={setErrorValue}
              error={errorValue.length === 0 ? 'Address is required' : undefined}
              label="Address (required)"
            />
            <p className="text-sm text-muted-foreground" aria-live="polite">
              Value: {errorValue.length === 0 ? '—' : pathLabels(ADDRESS, errorValue).join(' → ')}
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <h3 className="text-sm font-semibold text-foreground">How to try</h3>
          <ol className="flex flex-col gap-1 text-sm text-muted-foreground">
            <li>Select ID → province → city → district; child columns open beside each selection.</li>
            <li>Selecting a district (leaf) closes the dropdown and fills the full path.</li>
            <li>Toggle full vs last-level mode for the two value displays.</li>
            <li>Type in the search column for flat results; selecting a result fills the full path.</li>
            <li>Keyboard: Tab to the trigger, Enter opens, arrows navigate columns/options, Enter selects, Escape closes.</li>
            <li>Lazy: open a column to load children with a per-column skeleton (400 ms simulated).</li>
          </ol>
        </div>
      </section>

      <section id="tree-select" aria-labelledby="tree-select-heading" className="space-y-4 scroll-mt-20">
        <SectionHeading id="tree-select-heading" title="Tree Select" />

        <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4">
          <h3 className="text-sm font-semibold text-foreground">
            Tree Select — product category (single)
          </h3>
          <TreeSelect
            options={[...CATEGORY]}
            value={single}
            onChange={setSingle}
            label="Primary category"
            placeholder="Select a category"
          />
          <p className="text-sm text-muted-foreground" aria-live="polite">
            Value: {single === '' ? '—' : labelOf(CATEGORY, String(single))}
          </p>
        </div>

        <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4">
          <h3 className="text-sm font-semibold text-foreground">
            Tree Select — multiple, max 3 tags + collapse
          </h3>
          <TreeSelect
            options={[...CATEGORY]}
            multiple
            value={multi}
            onChange={setMulti}
            label="Favorite categories"
            placeholder="Select multiple categories"
          />
          <p className="text-sm text-muted-foreground" aria-live="polite">
            Value:{' '}
            {Array.isArray(multi) && multi.length > 0
              ? pathLabels(CATEGORY, multi).join(', ')
              : '—'}
          </p>
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          <div className="flex flex-col gap-2 rounded-xl border border-border bg-card p-4">
            <h3 className="text-sm font-semibold text-foreground">Tree Select — loading</h3>
            <TreeSelect options={[]} loading label="Category" />
          </div>
          <div className="flex flex-col gap-2 rounded-xl border border-border bg-card p-4">
            <h3 className="text-sm font-semibold text-foreground">Tree Select — empty</h3>
            <TreeSelect options={[]} label="Category" emptyText="No categories yet." />
          </div>
          <div className="flex flex-col gap-2 rounded-xl border border-border bg-card p-4">
            <h3 className="text-sm font-semibold text-foreground">Tree Select — error</h3>
            <TreeSelect
              options={[...CATEGORY]}
              label="Category"
              error="Failed to load categories. Try again."
            />
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <h3 className="text-sm font-semibold text-foreground">How to try</h3>
          <ol className="flex flex-col gap-1 text-sm text-muted-foreground">
            <li>Tree Select: open the popover with the tree; clicking a leaf fills the value and closes.</li>
            <li>A nested initial value (e.g. Android) auto-expands its ancestors when the popover opens.</li>
            <li>Multiple shows max 3 tags + a +N collapse; remove via the × button on each tag.</li>
            <li>Keyboard: Tab to the trigger, Enter opens, arrows/Enter/Space in the tree, Escape closes.</li>
          </ol>
        </div>
      </section>
    </div>
  );
}
