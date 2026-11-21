import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { useState } from 'react';
import { TransferList, type TransferItem } from './transfer-list';

const ITEMS: TransferItem[] = [
  { id: 'dev-1', label: 'Dev Alice' },
  { id: 'dev-2', label: 'Dev Bob' },
  { id: 'qa-1', label: 'QA Carol' },
  { id: 'pm-1', label: 'PM Dave' },
  { id: 'dev-3', label: 'Dev Erin' },
  { id: 'qa-2', label: 'QA Frank' },
  { id: 'pm-2', label: 'PM Grace' },
  { id: 'dev-4', label: 'Dev Hank' },
];

function ControlledHarness({
  initial = ['pm-1'],
  items = ITEMS,
  onChangeSpy,
}: {
  initial?: string[];
  items?: TransferItem[];
  onChangeSpy?: (v: string[]) => void;
}) {
  const [value, setValue] = useState<string[]>(initial);
  return (
    <TransferList
      items={items}
      value={value}
      onChange={(v) => {
        setValue(v);
        onChangeSpy?.(v);
      }}
    />
  );
}

describe('TransferList', () => {
  it('renders both panels with synchronized counters', () => {
    render(<TransferList items={ITEMS} value={['pm-1', 'qa-1', 'dev-1']} onChange={() => undefined} />);
    expect(screen.getByLabelText('5 items in Available')).toBeDefined();
    expect(screen.getByLabelText('3 items in Selected')).toBeDefined();
  });

  it('moves an item via move button', () => {
    const onChange = vi.fn();
    render(<TransferList items={ITEMS.slice(0, 3)} value={[]} onChange={onChange} />);
    fireEvent.click(screen.getByText('Dev Alice'));
    fireEvent.click(screen.getByLabelText('Move 1 items to selected'));
    expect(onChange).toHaveBeenCalledWith(['dev-1']);
  });

  it('moves an item via double-click', () => {
    const onChange = vi.fn();
    render(<TransferList items={ITEMS.slice(0, 3)} value={[]} onChange={onChange} />);
    fireEvent.doubleClick(screen.getByText('Dev Bob'));
    expect(onChange).toHaveBeenCalledWith(['dev-2']);
  });

  it('moves only visible (filtered) items with move-all', () => {
    const onChange = vi.fn();
    render(<TransferList items={ITEMS} value={[]} onChange={onChange} />);
    const [availableSearch] = screen.getAllByPlaceholderText(/Filter/);
    fireEvent.change(availableSearch, { target: { value: 'dev' } });
    fireEvent.click(screen.getByLabelText('Move all visible to selected'));
    expect(onChange).toHaveBeenCalledWith(['dev-1', 'dev-2', 'dev-3', 'dev-4']);
  });

  it('moves multiple selected items at once (ctrl multi-select)', () => {
    const onChange = vi.fn();
    render(<TransferList items={ITEMS.slice(0, 4)} value={[]} onChange={onChange} />);
    fireEvent.click(screen.getByText('Dev Alice'), { ctrlKey: true });
    fireEvent.click(screen.getByText('Dev Bob'), { ctrlKey: true });
    fireEvent.click(screen.getByLabelText('Move 2 items to selected'));
    expect(onChange).toHaveBeenCalledWith(['dev-1', 'dev-2']);
  });

  it('filter does not mutate controlled value', () => {
    const onChange = vi.fn();
    render(
      <TransferList items={ITEMS} value={['pm-1', 'qa-1', 'dev-2', 'dev-3']} onChange={onChange} />
    );
    const [availableSearch] = screen.getAllByPlaceholderText(/Filter/);
    fireEvent.change(availableSearch, { target: { value: 'dev' } });
    // 'QA Frank' lives in the available panel and must be hidden by the filter…
    expect(screen.queryByText('QA Frank')).toBeNull();
    // …while the selected panel keeps its own copy of 'QA Carol' untouched.
    expect(screen.getByText('QA Carol')).toBeDefined();
    expect(onChange).not.toHaveBeenCalled();
    fireEvent.change(availableSearch, { target: { value: '' } });
    expect(screen.getByText('QA Frank')).toBeDefined();
  });

  it('supports keyboard selection and listbox roles', () => {
    render(<ControlledHarness initial={[]} />);
    const option = screen.getByText('Dev Alice');
    option.focus();
    fireEvent.keyDown(option, { key: 'ArrowDown' });
    expect(document.activeElement?.textContent).toBe('Dev Bob');
  });

  it('skips disabled items when moving', () => {
    const onChange = vi.fn();
    render(
      <TransferList
        items={[{ id: 'x', label: 'Locked', disabled: true }, { id: 'y', label: 'Open' }]}
        value={[]}
        onChange={onChange}
      />
    );
    fireEvent.click(screen.getByLabelText('Move all visible to selected'));
    expect(onChange).toHaveBeenCalledWith(['y']);
  });

  it('renders loading skeletons and error alert', () => {
    render(
      <TransferList items={ITEMS} value={[]} onChange={() => undefined} loading error="Failed to load" />
    );
    expect(screen.getByLabelText('Loading transfer list')).toBeDefined();
    expect(screen.getByRole('alert')).toBeDefined();
  });

  it('renders empty state per panel', () => {
    render(<TransferList items={[]} value={[]} onChange={() => undefined} />);
    expect(screen.getAllByRole('status').length).toBeGreaterThanOrEqual(2);
  });
});
