import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BulkActionBar } from './bulk-action-bar';
import { SegmentedControl, SegmentedControlItem } from './segmented-control';
import { Timeline } from './timeline';
import { DescriptionList } from './description-list';

describe('BulkActionBar component', () => {
  it('renders nothing when closed', () => {
    const { container } = render(
      <BulkActionBar open={false} count={0} actions={[]} />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders count and actions when open', () => {
    const onAction = vi.fn();
    render(
      <BulkActionBar
        open
        count={3}
        actions={[{ id: 'del', label: 'Delete', onClick: onAction }]}
      />
    );
    expect(screen.getByText('3 selected')).toBeDefined();
    fireEvent.click(screen.getByText('Delete'));
    expect(onAction).toHaveBeenCalled();
  });

  it('fires clear selection callback', () => {
    const onClear = vi.fn();
    render(
      <BulkActionBar
        open
        count={2}
        actions={[]}
        onClearSelection={onClear}
      />
    );
    fireEvent.click(screen.getByText('Clear'));
    expect(onClear).toHaveBeenCalled();
  });
});

describe('SegmentedControl component', () => {
  it('renders items and toggles state', () => {
    render(
      <SegmentedControl type="single" defaultValue="list">
        <SegmentedControlItem value="list">List</SegmentedControlItem>
        <SegmentedControlItem value="grid">Grid</SegmentedControlItem>
      </SegmentedControl>
    );
    expect(screen.getByText('List')).toBeDefined();
    expect(screen.getByText('Grid')).toBeDefined();
  });
});

describe('Timeline component', () => {
  it('renders items with title and timestamp', () => {
    render(
      <Timeline
        items={[
          { id: '1', title: 'Created', timestamp: '10:00' },
          { id: '2', title: 'Approved', timestamp: '11:30' },
        ]}
      />
    );
    expect(screen.getByText('Created')).toBeDefined();
    expect(screen.getByText('Approved')).toBeDefined();
    expect(screen.getByText('10:00')).toBeDefined();
  });
});

describe('DescriptionList component', () => {
  it('renders label and value pairs', () => {
    render(
      <DescriptionList
        items={[
          { label: 'Name', value: 'Acme' },
          { label: 'Status', value: 'Active' },
        ]}
      />
    );
    expect(screen.getByText('Name')).toBeDefined();
    expect(screen.getByText('Acme')).toBeDefined();
    expect(screen.getByText('Status')).toBeDefined();
  });
});