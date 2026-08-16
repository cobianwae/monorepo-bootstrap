'use client';

import * as React from 'react';
import {
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  type VisibilityState,
  type RowSelectionState,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  flexRender,
  useReactTable,
  type Table as TanStackTable,
  type Column as TanStackColumn,
} from '@tanstack/react-table';
import {
  ChevronLeft,
  ChevronRight,
  ChevronsUpDown,
  ArrowUp,
  ArrowDown,
  Columns3,
  X,
  SlidersHorizontal,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Button } from './button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './table';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from './select';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from './dropdown-menu';
import { Skeleton } from './skeleton';
import { EmptyState } from './empty-state';
import { Input } from './input';

export type DataTableState = {
  sorting: SortingState;
  columnFilters: ColumnFiltersState;
  rowSelection: RowSelectionState;
  columnVisibility: VisibilityState;
  globalFilter: string;
};

export const initialDataTableState: DataTableState = {
  sorting: [],
  columnFilters: [],
  rowSelection: {},
  columnVisibility: {},
  globalFilter: '',
};

export interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  state?: Partial<DataTableState>;
  onStateChange?: (state: DataTableState) => void;
  loading?: boolean;
  skeletonRows?: number;
  emptyTitle?: string;
  emptyDescription?: string;
  enableRowSelection?: boolean;
  enableSorting?: boolean;
  enableColumnVisibility?: boolean;
  enableGlobalFilter?: boolean;
  pagination?: {
    pageSize?: number;
    show?: boolean;
  };
  onRowClick?: (row: TData) => void;
  getRowId?: (row: TData) => string;
  className?: string;
  tableClassName?: string;
}

export function useDataTable<TData, TValue>({
  columns,
  data,
  state,
  onStateChange,
  enableRowSelection = false,
  enableSorting = true,
  enableColumnVisibility = true,
  pagination = {},
}: Omit<DataTableProps<TData, TValue>, 'className' | 'tableClassName' | 'enableGlobalFilter'>) {
  const [sorting, setSorting] = React.useState<SortingState>(state?.sorting ?? []);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    state?.columnFilters ?? []
  );
  const [rowSelection, setRowSelection] = React.useState<RowSelectionState>(
    state?.rowSelection ?? {}
  );
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>(
    state?.columnVisibility ?? {}
  );
  const [globalFilter, setGlobalFilter] = React.useState(state?.globalFilter ?? '');

  const table = useReactTable<TData>({
    data,
    columns,
    state: {
      sorting,
      columnFilters,
      rowSelection,
      columnVisibility,
      globalFilter,
    },
    enableRowSelection,
    enableSorting,
    getRowId: (row: TData) => String((row as { id?: string }).id ?? ''),
    autoResetPageIndex: false,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onRowSelectionChange: setRowSelection,
    onColumnVisibilityChange: enableColumnVisibility
      ? setColumnVisibility
      : undefined,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: pagination.show === false ? undefined : getPaginationRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    pageCount: pagination.show === false ? -1 : undefined,
  });

  const lastDataRef = React.useRef(data);

  React.useEffect(() => {
    table.setPageSize(pagination.pageSize ?? 10);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.pageSize]);

  React.useEffect(() => {
    if (lastDataRef.current !== data) {
      lastDataRef.current = data;
      table.setPageIndex(0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  React.useEffect(() => {
    onStateChange?.({
      sorting,
      columnFilters,
      rowSelection,
      columnVisibility,
      globalFilter,
    });
  }, [sorting, columnFilters, rowSelection, columnVisibility, globalFilter, onStateChange]);

  return { table, globalFilter, setGlobalFilter };
}

export interface DataTableToolbarProps<TData> {
  table: TanStackTable<TData>;
  globalFilter?: string;
  onGlobalFilterChange?: (value: string) => void;
  searchPlaceholder?: string;
  children?: React.ReactNode;
}

export function DataTableToolbar<TData>({
  table,
  globalFilter,
  onGlobalFilterChange,
  searchPlaceholder = 'Search...',
  children,
}: DataTableToolbarProps<TData>) {
  const hasFilters =
    (globalFilter ?? '').length > 0 ||
    table.getState().columnFilters.length > 0;

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative">
          <Input
            value={globalFilter ?? ''}
            onChange={(e) => onGlobalFilterChange?.(e.target.value)}
            placeholder={searchPlaceholder}
            className="w-56 pl-8"
            aria-label={searchPlaceholder}
          />
          <svg
            className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11a6 6 0 11-12 0 6 6 0 0112 0z" />
          </svg>
        </div>
        {children}
        {hasFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              table.resetColumnFilters();
              onGlobalFilterChange?.('');
            }}
            className="h-8 px-2 text-xs"
          >
            <X className="h-3.5 w-3.5" />
            Reset filters
          </Button>
        )}
      </div>
      <div className="flex items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs">
              <Columns3 className="h-3.5 w-3.5" />
              Columns
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Toggle columns</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {table
              .getAllColumns()
              .filter((column) => typeof column.accessorFn !== 'undefined' || column.id !== 'select')
              .map((column) => {
                return (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) => column.toggleVisibility(!!value)}
                  >
                    {column.id}
                  </DropdownMenuCheckboxItem>
                );
              })}
          </DropdownMenuContent>
        </DropdownMenu>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs">
              <SlidersHorizontal className="h-3.5 w-3.5" />
              Filters
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>Active filters</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {table.getState().columnFilters.length === 0 ? (
              <p className="px-2 py-1.5 text-xs text-muted-foreground">
                No active filters.
              </p>
            ) : (
              table.getState().columnFilters.map((filter) => (
                <div
                  key={filter.id}
                  className="flex items-center justify-between gap-2 px-2 py-1.5 text-xs"
                >
                  <span className="truncate">
                    <span className="font-medium">{filter.id}:</span>{' '}
                    {String(filter.value)}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-5 w-5"
                    onClick={() => table.getColumn(filter.id)?.setFilterValue(undefined)}
                    aria-label={`Remove ${filter.id} filter`}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ))
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

export interface DataTablePaginationProps<TData> {
  table: TanStackTable<TData>;
  pageSizeOptions?: number[];
  labels?: {
    selected?: (count: number) => string;
    rowsPerPage?: string;
    page?: string;
    of?: string;
  };
}

export function DataTablePagination<TData>({
  table,
  pageSizeOptions = [10, 20, 50, 100],
  labels = {},
}: DataTablePaginationProps<TData>) {
  const selectedCount = table.getFilteredSelectedRowModel().rows.length;
  const { pageIndex } = table.getState().pagination;

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
      <p className="text-sm text-muted-foreground">
        {labels.selected?.(selectedCount) ??
          (selectedCount > 0 ? `${selectedCount} selected` : '')}
      </p>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          {labels.rowsPerPage ?? 'Rows per page'}
          <Select
            value={`${table.getState().pagination.pageSize}`}
            onValueChange={(value) => {
              table.setPageSize(Number(value));
            }}
          >
            <SelectTrigger className="h-8 w-16" aria-label="Rows per page">
              <SelectValue placeholder={`${table.getState().pagination.pageSize}`} />
            </SelectTrigger>
            <SelectContent side="top">
              {pageSizeOptions.map((size) => (
                <SelectItem key={size} value={`${size}`}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>
            Page {pageIndex + 1} {labels.of ?? 'of'} {table.getPageCount() || 1}
          </span>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              aria-label="Previous page"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              aria-label="Next page"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export interface SortableHeaderProps<TData> {
  column: TanStackColumn<TData, unknown>;
  children: React.ReactNode;
  className?: string;
}

export function SortableHeader<TData>({ column, children, className }: SortableHeaderProps<TData>) {
  const isSorted = column.getIsSorted();
  return (
    <button
      type="button"
      onClick={column.getToggleSortingHandler?.()}
      className={cn(
        'group inline-flex items-center gap-1.5 font-medium text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm',
        className
      )}
      aria-label={`Sort by ${column.id}`}
    >
      {children}
      {isSorted === 'asc' ? (
        <ArrowUp className="h-3.5 w-3.5 text-primary" />
      ) : isSorted === 'desc' ? (
        <ArrowDown className="h-3.5 w-3.5 text-primary" />
      ) : (
        <ChevronsUpDown className="h-3.5 w-3.5 text-muted-foreground/50 group-hover:text-muted-foreground" />
      )}
    </button>
  );
}

export interface DataTablePropsBase<TData> {
  table: TanStackTable<TData>;
  loading?: boolean;
  skeletonRows?: number;
  emptyTitle?: string;
  emptyDescription?: string;
  onRowClick?: (row: TData) => void;
  emptyIcon?: LucideIcon;
}

export function DataTableBody<TData>({
  table,
  loading,
  skeletonRows = 6,
  emptyTitle = 'No results',
  emptyDescription = 'Try adjusting your search or filters.',
  onRowClick,
  emptyIcon,
}: DataTablePropsBase<TData>) {
  if (loading) {
    return (
      <TableBody>
        {Array.from({ length: skeletonRows }).map((_, i) => (
          <TableRow key={i}>
            {table.getVisibleFlatColumns().map((_, j) => (
              <TableCell key={j}>
                <Skeleton className="h-4 w-full" />
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    );
  }

  const rows = table.getRowModel().rows;
  if (rows.length === 0) {
    return (
      <TableBody>
        <TableRow>
          <TableCell
            colSpan={table.getVisibleFlatColumns().length}
            className="h-64 text-center"
          >
            <EmptyState
              title={emptyTitle}
              description={emptyDescription}
              icon={emptyIcon}
            />
          </TableCell>
        </TableRow>
      </TableBody>
    );
  }

  return (
    <TableBody>
      {rows.map((row) => (
        <TableRow
          key={row.id}
          data-state={row.getIsSelected() && 'selected'}
          onClick={onRowClick ? () => onRowClick(row.original) : undefined}
          className={onRowClick ? 'cursor-pointer' : undefined}
        >
          {row.getVisibleCells().map((cell) => (
            <TableCell key={cell.id}>
              {flexRender(cell.column.columnDef.cell, cell.getContext())}
            </TableCell>
          ))}
        </TableRow>
      ))}
    </TableBody>
  );
}

export interface DataTableHeaderProps<TData> {
  table: TanStackTable<TData>;
  enableSorting?: boolean;
}

export function DataTableHeader<TData>({
  table,
  enableSorting = true,
}: DataTableHeaderProps<TData>) {
  return (
    <TableHeader>
      {table.getHeaderGroups().map((headerGroup) => (
        <TableRow key={headerGroup.id}>
          {headerGroup.headers.map((header) => {
            const canSort = enableSorting && header.column.getCanSort();
            return (
              <TableHead
                key={header.id}
                className="whitespace-nowrap"
              >
                {header.isPlaceholder
                  ? null
                  : canSort
                    ? (
                        <SortableHeader column={header.column}>
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                        </SortableHeader>
                      )
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
              </TableHead>
            );
          })}
        </TableRow>
      ))}
    </TableHeader>
  );
}

export function DataTable<TData, TValue>({
  columns,
  data,
  state,
  onStateChange,
  loading,
  skeletonRows,
  emptyTitle,
  emptyDescription,
  enableRowSelection,
  enableSorting,
  enableColumnVisibility,
  enableGlobalFilter,
  pagination,
  onRowClick,
  getRowId,
  className,
  tableClassName,
}: DataTableProps<TData, TValue>) {
  const { table, globalFilter, setGlobalFilter } = useDataTable<TData, TValue>({
    columns,
    data,
    state,
    onStateChange,
    enableRowSelection,
    enableSorting,
    enableColumnVisibility,
    pagination,
    getRowId,
  });

  return (
    <div className={cn('space-y-3', className)}>
      {enableGlobalFilter && (
        <DataTableToolbar
          table={table}
          globalFilter={globalFilter}
          onGlobalFilterChange={setGlobalFilter}
        />
      )}
      <div className="rounded-md border border-border">
        <Table className={tableClassName}>
          <DataTableHeader table={table} enableSorting={enableSorting} />
          <DataTableBody
            table={table}
            loading={loading}
            skeletonRows={skeletonRows}
            emptyTitle={emptyTitle}
            emptyDescription={emptyDescription}
            onRowClick={onRowClick}
          />
        </Table>
      </div>
      {pagination?.show !== false && (
        <DataTablePagination table={table} />
      )}
    </div>
  );
}