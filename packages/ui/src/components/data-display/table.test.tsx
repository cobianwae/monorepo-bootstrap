import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableRow,
  TableHead,
  TableCell,
  TableCaption,
  tableVariants,
} from './table';

describe('Table components', () => {
  it('renders a full table with caption, header, body and footer', () => {
    render(
      <Table>
        <TableCaption>List of patients</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell>Ada</TableCell>
            <TableCell>Active</TableCell>
          </TableRow>
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableCell>Total</TableCell>
            <TableCell>1</TableCell>
          </TableRow>
        </TableFooter>
      </Table>
    );

    expect(screen.getByRole('table')).toBeDefined();
    expect(screen.getByText('List of patients')).toBeDefined();
    expect(screen.getByRole('columnheader', { name: 'Name' })).toBeDefined();
    expect(screen.getByRole('cell', { name: 'Ada' })).toBeDefined();
    expect(screen.getByText('Total')).toBeDefined();
  });

  it('renders a table header cell within thead', () => {
    const { container } = render(
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Column</TableHead>
          </TableRow>
        </TableHeader>
      </Table>
    );
    expect(container.querySelector('thead')).toBeDefined();
    expect(container.querySelector('th')?.textContent).toBe('Column');
  });

  it('applies default variant and size classes', () => {
    const { container } = render(<Table />);
    const table = container.querySelector('table');
    expect(table?.className).toContain('text-sm');
    expect(tableVariants({ variant: 'default', size: 'default' })).toBe(
      tableVariants()
    );
  });

  it('applies striped variant with zebra striping utility', () => {
    const { container } = render(<Table variant="striped" />);
    const table = container.querySelector('table');
    expect(table?.className).toContain('nth-child(even)');
    expect(table?.className).toContain('bg-muted/30');
  });

  it('applies bordered variant with column separators', () => {
    const { container } = render(<Table variant="bordered" />);
    const table = container.querySelector('table');
    expect(table?.className).toContain('[&_td]:border-r');
    expect(table?.className).toContain('[&_th]:border-r');
  });

  it('applies ghost variant without tbody row borders', () => {
    const { container } = render(<Table variant="ghost" />);
    const table = container.querySelector('table');
    expect(table?.className).toContain('[&_thead_tr]:border-b');
  });

  it('applies compact and relaxed size utilities', () => {
    const { container } = render(<Table size="sm" />);
    expect(container.querySelector('table')?.className).toContain('text-xs');

    const { container: relaxed } = render(<Table size="lg" />);
    expect(relaxed.querySelector('table')?.className).toContain('text-base');
    expect(relaxed.querySelector('table')?.className).toContain('py-5');
  });
});