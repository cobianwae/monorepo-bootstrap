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