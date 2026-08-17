import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { useState } from 'react';
import { FilterBuilder, type FilterChip, type FilterFieldDefinition, type SavedFilterView } from './filter-builder';

const FIELDS: FilterFieldDefinition[] = [
  {
    id: 'status',
    label: 'Status',
    operators: ['eq', 'neq'],
    options: [
      { value: 'active', label: 'Active' },
      { value: 'archived', label: 'Archived' },
    ],
  },
  { id: 'owner', label: 'Owner', operators: ['eq', 'contains'] },
];

const CHIP: FilterChip = { id: 'c1', fieldId: 'status', operator: 'eq', value: 'active' };
const VIEWS: SavedFilterView[] = [{ id: 'v1', name: 'Active only', chips: [CHIP] }];

function StatefulBuilder() {
  const [chips, setChips] = useState<FilterChip[]>([]);
  return <FilterBuilder fields={FIELDS} chips={chips} onChipsChange={setChips} />;
}

function pickOption(label: string, optionText: string) {
  fireEvent.click(screen.getByLabelText(label));
  fireEvent.click(screen.getByText(optionText));
}

function openMenu(triggerName: string | RegExp) {
  fireEvent.pointerDown(screen.getByRole('button', { name: triggerName }));
}

describe('FilterBuilder component', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('renders the filter label', () => {
    render(<StatefulBuilder />);
    expect(screen.getByText('Filters')).toBeDefined();
  });

  it('adds a chip via the inline form', () => {
    render(<StatefulBuilder />);
    fireEvent.click(screen.getByText('Add filter'));
    pickOption('Filter field', 'Status');
    pickOption('Filter value', 'Active');
    fireEvent.click(screen.getByText('Add'));
    expect(screen.getByText('Status')).toBeDefined();
    expect(screen.getByText('active')).toBeDefined();
  });

  it('removes a chip when its remove button is clicked', () => {
    render(<StatefulBuilder />);
    fireEvent.click(screen.getByText('Add filter'));
    pickOption('Filter field', 'Owner');
    fireEvent.change(screen.getByLabelText('Filter value'), { target: { value: 'Sarah' } });
    fireEvent.click(screen.getByText('Add'));
    fireEvent.click(screen.getByLabelText('Remove filter Owner contains Sarah'));
    expect(screen.queryByText('Sarah')).toBeNull();
  });

  it('clears all chips with clear all button', () => {
    render(<StatefulBuilder />);
    fireEvent.click(screen.getByText('Add filter'));
    pickOption('Filter field', 'Status');
    pickOption('Filter value', 'Active');
    fireEvent.click(screen.getByText('Add'));
    fireEvent.click(screen.getByText('Clear all'));
    expect(screen.queryByText('active')).toBeNull();
  });

  it('respects maxChips limit', () => {
    render(<FilterBuilder fields={FIELDS} chips={[]} onChipsChange={() => undefined} maxChips={0} />);
    const addBtn = screen.getByText('Add filter');
    expect((addBtn as HTMLButtonElement).disabled).toBe(true);
  });

  it('lists saved views in the dropdown', () => {
    render(
      <FilterBuilder
        fields={FIELDS}
        chips={[]}
        onChipsChange={() => undefined}
        savedViews={VIEWS}
        onSaveView={() => undefined}
      />
    );
    openMenu('Views (1)');
    expect(screen.getByText('Active only')).toBeDefined();
  });

  it('applies a saved view and reports active view via trigger label', () => {
    const onApply = vi.fn();
    const onChipsChange = vi.fn();
    render(
      <FilterBuilder
        fields={FIELDS}
        chips={[]}
        onChipsChange={onChipsChange}
        savedViews={VIEWS}
        onSaveView={() => undefined}
        onApplyView={onApply}
        activeViewId="v1"
      />
    );
    openMenu('Active only');
    fireEvent.click(screen.getByRole('menuitem', { name: /^Active only 1$/ }));
    expect(onApply).toHaveBeenCalledTimes(1);
    expect(onApply).toHaveBeenCalledWith(VIEWS[0]);
    expect(onChipsChange).toHaveBeenCalledWith([CHIP]);
  });

  it('saves a view through the onSaveView handler in controlled mode', () => {
    const onSave = vi.fn();
    render(
      <FilterBuilder
        fields={FIELDS}
        chips={[CHIP]}
        onChipsChange={() => undefined}
        savedViews={[]}
        onSaveView={onSave}
      />
    );
    openMenu('Views (0)');
    fireEvent.change(screen.getByLabelText('Saved view name'), { target: { value: 'Active only' } });
    fireEvent.click(screen.getByLabelText('Save view'));
    expect(onSave).toHaveBeenCalledWith('Active only', [CHIP]);
  });

  it('deletes the active view through the onDeleteView handler', () => {
    const onDelete = vi.fn();
    render(
      <FilterBuilder
        fields={FIELDS}
        chips={[CHIP]}
        onChipsChange={() => undefined}
        savedViews={VIEWS}
        onSaveView={() => undefined}
        onDeleteView={onDelete}
        activeViewId="v1"
      />
    );
    openMenu('Active only');
    fireEvent.click(screen.getByText('Delete view'));
    expect(onDelete).toHaveBeenCalledWith('v1');
  });

  it('updates the active view through the onUpdateView handler', () => {
    const onUpdate = vi.fn();
    const nextChips: FilterChip[] = [
      CHIP,
      { id: 'c2', fieldId: 'owner', operator: 'eq', value: 'Sarah' },
    ];
    render(
      <FilterBuilder
        fields={FIELDS}
        chips={nextChips}
        onChipsChange={() => undefined}
        savedViews={VIEWS}
        onSaveView={() => undefined}
        onUpdateView={onUpdate}
        activeViewId="v1"
      />
    );
    openMenu('Active only');
    fireEvent.click(screen.getByText('Update "Active only"'));
    expect(onUpdate).toHaveBeenCalledWith('v1', nextChips);
  });

  it('persists and rehydrates views when storageKey is provided', () => {
    window.localStorage.setItem('ds.test.views', JSON.stringify(VIEWS));
    render(<FilterBuilder fields={FIELDS} chips={[]} onChipsChange={() => undefined} storageKey="ds.test.views" />);
    openMenu('Views (1)');
    expect(screen.getByText('Active only')).toBeDefined();
  });
});