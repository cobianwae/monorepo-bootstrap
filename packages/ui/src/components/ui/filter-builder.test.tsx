import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { useState } from 'react';
import { FilterBuilder, type FilterChip, type FilterFieldDefinition } from './filter-builder';

const FIELDS: FilterFieldDefinition[] = [
  { id: 'status', label: 'Status', operators: ['eq', 'neq'], options: [
    { value: 'active', label: 'Active' },
    { value: 'archived', label: 'Archived' },
  ]},
  { id: 'owner', label: 'Owner', operators: ['eq', 'contains'] },
];

function StatefulBuilder() {
  const [chips, setChips] = useState<FilterChip[]>([]);
  return <FilterBuilder fields={FIELDS} chips={chips} onChipsChange={setChips} />;
}

describe('FilterBuilder component', () => {
  it('renders the filter label', () => {
    render(<StatefulBuilder />);
    expect(screen.getByText('Filters')).toBeDefined();
  });

  it('adds a chip via the inline form', () => {
    render(<StatefulBuilder />);
    fireEvent.click(screen.getByText('Add filter'));
    fireEvent.change(screen.getByLabelText('Filter field'), { target: { value: 'status' } });
    fireEvent.change(screen.getByLabelText('Filter value'), { target: { value: 'active' } });
    fireEvent.click(screen.getByText('Add'));
    expect(screen.getByText('Status')).toBeDefined();
    expect(screen.getByText('active')).toBeDefined();
  });

  it('removes a chip when its remove button is clicked', () => {
    render(<StatefulBuilder />);
    fireEvent.click(screen.getByText('Add filter'));
    fireEvent.change(screen.getByLabelText('Filter field'), { target: { value: 'owner' } });
    fireEvent.change(screen.getByLabelText('Filter value'), { target: { value: 'Sarah' } });
    fireEvent.click(screen.getByText('Add'));
    fireEvent.click(screen.getByLabelText('Remove filter Owner contains Sarah'));
    expect(screen.queryByText('Sarah')).toBeNull();
  });

  it('clears all chips with clear all button', () => {
    render(<StatefulBuilder />);
    fireEvent.click(screen.getByText('Add filter'));
    fireEvent.change(screen.getByLabelText('Filter field'), { target: { value: 'status' } });
    fireEvent.change(screen.getByLabelText('Filter value'), { target: { value: 'active' } });
    fireEvent.click(screen.getByText('Add'));
    fireEvent.click(screen.getByText('Clear all'));
    expect(screen.queryByText('active')).toBeNull();
  });

  it('respects maxChips limit', () => {
    render(<FilterBuilder fields={FIELDS} chips={[]} onChipsChange={() => undefined} maxChips={0} />);
    const addBtn = screen.getByText('Add filter');
    expect((addBtn as HTMLButtonElement).disabled).toBe(true);
  });
});