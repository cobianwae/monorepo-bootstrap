import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { useState } from 'react';
import { type ColumnDef, createColumnHelper } from '@tanstack/react-table';
import { DataTable, useDataTable, DataTableToolbar } from './data-table';

interface Person {
  id: string;
  name: string;
  role: string;
  age: number;
}

const columnHelper = createColumnHelper<Person>();

const columns: ColumnDef<Person, unknown>[] = [
  columnHelper.accessor('name', { header: 'Name' }),
  columnHelper.accessor('role', { header: 'Role' }),
  columnHelper.accessor('age', { header: 'Age' }),
];

const DATA: Person[] = [
  { id: '1', name: 'Sarah', role: 'Admin', age: 30 },
  { id: '2', name: 'John', role: 'Editor', age: 25 },
  { id: '3', name: 'Nina', role: 'Viewer', age: 40 },
];

function StatefulTable() {
  const [data] = useState(DATA);
  return <DataTable columns={columns} data={data} pagination={{ show: false }} />;
}

describe('DataTable component', () => {
  it('renders table headers and rows', () => {
    render(<StatefulTable />);
    expect(screen.getByText('Name')).toBeDefined();
    expect(screen.getByText('Role')).toBeDefined();
    expect(screen.getByText('Sarah')).toBeDefined();
    expect(screen.getByText('John')).toBeDefined();
  });

  it('renders loading skeletons when loading', () => {
    render(<DataTable columns={columns} data={[]} loading skeletonRows={3} pagination={{ show: false }} />);
    expect(screen.getAllByRole('row').length).toBeGreaterThanOrEqual(1);
  });

  it('renders empty state when no data and not loading', () => {
    render(
      <DataTable
        columns={columns}
        data={[]}
        emptyTitle="Nothing here"
        emptyDescription="Adjust filters"
        pagination={{ show: false }}
      />
    );
    expect(screen.getByText('Nothing here')).toBeDefined();
  });

  it('sorts rows when sortable header clicked', () => {
    render(<StatefulTable />);
    const nameButton = screen.getByLabelText('Sort by name');
    fireEvent.click(nameButton);
    // After ascending sort: John, Nina, Sarah
    const cells = screen.getAllByText(/John|Nina|Sarah/);
    expect(cells[0].textContent).toBe('John');
  });

  it('exposes aria-sort on sortable header and updates direction after sort', () => {
    render(<StatefulTable />);
    const nameHeader = screen.getByRole('columnheader', { name: 'Name' });
    expect(nameHeader.getAttribute('aria-sort')).toBe('none');

    const nameButton = screen.getByLabelText('Sort by name');
    fireEvent.click(nameButton);
    expect(nameHeader.getAttribute('aria-sort')).toBe('ascending');
    expect(nameButton.getAttribute('aria-label')).toBe('Sort by name, ascending');

    fireEvent.click(nameButton);
    expect(nameHeader.getAttribute('aria-sort')).toBe('descending');
    expect(nameButton.getAttribute('aria-label')).toBe('Sort by name, descending');
  });

  it('filters rows via global search', () => {
    function WithSearch() {
      const { table, globalFilter, setGlobalFilter } = useDataTable<Person, unknown>({
        columns,
        data: DATA,
        pagination: { show: false },
      });
      return (
        <>
          <DataTableToolbar
            table={table}
            globalFilter={globalFilter}
            onGlobalFilterChange={setGlobalFilter}
          />
          <div data-testid="rows">
            {table.getRowModel().rows.map((row) => row.original.name)}
          </div>
        </>
      );
    }
    render(<WithSearch />);
    const search = screen.getByLabelText('Search...');
    fireEvent.change(search, { target: { value: 'John' } });
    const rows = screen.getByTestId('rows');
    expect(within(rows).getByText('John')).toBeDefined();
    expect(within(rows).queryByText('Sarah')).toBeNull();
  });

  it('renders a 44px hit area on the remove-filter button', async () => {
    function WithFilter() {
      const { table } = useDataTable<Person, unknown>({
        columns,
        data: DATA,
        state: { columnFilters: [{ id: 'role', value: 'Admin' }] },
        pagination: { show: false },
      });
      return <DataTableToolbar table={table} />;
    }
    render(<WithFilter />);
    fireEvent.pointerDown(screen.getByRole('button', { name: 'Filters' }), {
      button: 0,
      ctrlKey: false,
    });
    const remove = await screen.findByRole('button', { name: 'Remove role filter' });
    expect(remove.className).toContain('h-8');
    expect(remove.className).toContain('w-8');
    expect(remove.className).toContain('after:-inset-1.5');
  });

  it('paginates when pagination enabled', () => {
    const bigData = Array.from({ length: 25 }, (_, i) => ({
      id: String(i),
      name: `User ${i}`,
      role: 'Member',
      age: 20 + i,
    }));
    render(<DataTable columns={columns} data={bigData} pagination={{ pageSize: 10, show: true }} />);
    expect(screen.getByText('Page 1 of 3')).toBeDefined();
    fireEvent.click(screen.getByLabelText('Next page'));
    expect(screen.getByText('Page 2 of 3')).toBeDefined();
  });

  it('forwards variant and size props to the underlying table', () => {
    const { container } = render(
      <DataTable
        columns={columns}
        data={DATA}
        variant="striped"
        size="sm"
        pagination={{ show: false }}
      />
    );
    const table = container.querySelector('table');
    expect(table?.className).toContain('nth-child(even)');
    expect(table?.className).toContain('text-xs');
  });
});

describe('DataTable row keyboard access', () => {
  it('makes clickable rows focusable and activatable via Enter and Space', () => {
    const onRowClick = vi.fn();
    render(
      <DataTable
        columns={columns}
        data={DATA}
        onRowClick={onRowClick}
        pagination={{ show: false }}
      />
    );

    const row = screen.getByText('Sarah').closest('tr') as HTMLElement;
    expect(row).not.toBeNull();
    expect(row.getAttribute('role')).toBe('button');
    expect(row.getAttribute('tabindex')).toBe('0');

    fireEvent.keyDown(row, { key: 'Enter' });
    expect(onRowClick).toHaveBeenCalledTimes(1);
    expect(onRowClick).toHaveBeenCalledWith(DATA[0]);

    fireEvent.keyDown(row, { key: ' ' });
    expect(onRowClick).toHaveBeenCalledTimes(2);
  });

  it('does not expose row activation when onRowClick is absent', () => {
    render(<StatefulTable />);
    const row = screen.getByText('Sarah').closest('tr') as HTMLElement;
    expect(row.getAttribute('role')).toBeNull();
    expect(row.getAttribute('tabindex')).toBeNull();
  });

  it('does not double-trigger row click for Enter on interactive cell elements', () => {
    const onRowClick = vi.fn();
    const columnsWithAction: ColumnDef<Person, unknown>[] = [
      ...columns,
      columnHelper.display({
        id: 'actions',
        cell: () => (
          <button type="button" onClick={() => undefined}>
            Action
          </button>
        ),
      }),
    ];

    render(
      <DataTable
        columns={columnsWithAction}
        data={DATA}
        onRowClick={onRowClick}
        pagination={{ show: false }}
      />
    );

    const actionButton = screen.getAllByText('Action')[0];
    fireEvent.keyDown(actionButton, { key: 'Enter' });
    expect(onRowClick).not.toHaveBeenCalled();
  });
});

describe('useDataTable hook', () => {
  it('fires onStateChange with table state', () => {
    const onStateChange = vi.fn();
    function HookTest() {
      useDataTable<Person, unknown>({
        columns,
        data: DATA,
        onStateChange,
        pagination: { show: false },
      });
      return null;
    }
    render(<HookTest />);
    expect(onStateChange).toHaveBeenCalled();
  });
});