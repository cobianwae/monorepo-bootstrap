'use client';

import * as React from 'react';
import {
  createColumnHelper,
  type ColumnDef,
} from '@tanstack/react-table';
import {
  useDataTable,
  DataTableToolbar,
  DataTableHeader,
  DataTableBody,
  DataTablePagination,
  FilterBuilder,
  BulkActionBar,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  Badge,
  Button,
  Checkbox,
  Alert,
  AlertTitle,
  AlertDescription,
  toast,
  ToastAction,
  type FilterChip,
  type FilterFieldDefinition,
  type SavedFilterView,
} from '@ds/ui';
import {
  Trash2,
  RefreshCw,
  Sparkles,
  Inbox,
  AlertCircle,
  RotateCcw,
  UserPlus,
} from 'lucide-react';
import { PageHeader } from '@ds/ui';
import type { User } from '@shared/types';

const INITIAL_DATA: User[] = [
  { id: 'usr_1', name: 'Eleanor Vance', email: 'eleanor@acme.io', role: 'admin', status: 'active', createdAt: '2025-01-14' },
  { id: 'usr_2', name: 'Marcus Thorne', email: 'marcus@acme.io', role: 'editor', status: 'active', createdAt: '2025-02-03' },
  { id: 'usr_3', name: 'Aria Takahashi', email: 'aria@acme.io', role: 'viewer', status: 'pending', createdAt: '2025-02-18' },
  { id: 'usr_4', name: 'Julian Hayes', email: 'julian@acme.io', role: 'editor', status: 'inactive', createdAt: '2024-11-20' },
  { id: 'usr_5', name: 'Sophia Chen', email: 'sophia@acme.io', role: 'admin', status: 'active', createdAt: '2025-01-02' },
  { id: 'usr_6', name: 'Darius Sterling', email: 'darius@acme.io', role: 'editor', status: 'active', createdAt: '2025-03-01' },
  { id: 'usr_7', name: 'Elena Rostova', email: 'elena@acme.io', role: 'viewer', status: 'active', createdAt: '2025-03-12' },
  { id: 'usr_8', name: 'Theo Lindqvist', email: 'theo@acme.io', role: 'editor', status: 'active', createdAt: '2025-03-20' },
  { id: 'usr_9', name: 'Ingrid Berg', email: 'ingrid@acme.io', role: 'viewer', status: 'pending', createdAt: '2025-04-02' },
  { id: 'usr_10', name: 'Felix Moreau', email: 'felix@acme.io', role: 'admin', status: 'active', createdAt: '2025-04-11' },
  { id: 'usr_11', name: 'Priya Nair', email: 'priya@acme.io', role: 'editor', status: 'inactive', createdAt: '2025-04-25' },
  { id: 'usr_12', name: 'Omar Haddad', email: 'omar@acme.io', role: 'viewer', status: 'active', createdAt: '2025-05-01' },
  { id: 'usr_13', name: 'Clara Fontaine', email: 'clara@acme.io', role: 'editor', status: 'active', createdAt: '2025-05-09' },
  { id: 'usr_14', name: 'Hiro Tanaka', email: 'hiro@acme.io', role: 'viewer', status: 'pending', createdAt: '2025-05-18' },
  { id: 'usr_15', name: 'Nadia Petrova', email: 'nadia@acme.io', role: 'admin', status: 'active', createdAt: '2025-05-27' },
  { id: 'usr_16', name: 'Lucas Ferreira', email: 'lucas@acme.io', role: 'editor', status: 'active', createdAt: '2025-06-03' },
  { id: 'usr_17', name: 'Amara Osei', email: 'amara@acme.io', role: 'viewer', status: 'inactive', createdAt: '2025-06-14' },
  { id: 'usr_18', name: 'Victor Zhukov', email: 'victor@acme.io', role: 'editor', status: 'active', createdAt: '2025-06-21' },
  { id: 'usr_19', name: 'Leila Mansour', email: 'leila@acme.io', role: 'viewer', status: 'active', createdAt: '2025-07-02' },
  { id: 'usr_20', name: 'Daniel Okafor', email: 'daniel@acme.io', role: 'admin', status: 'active', createdAt: '2025-07-10' },
  { id: 'usr_21', name: 'Marta Silva', email: 'marta@acme.io', role: 'editor', status: 'pending', createdAt: '2025-07-19' },
  { id: 'usr_22', name: 'Kenji Watanabe', email: 'kenji@acme.io', role: 'viewer', status: 'active', createdAt: '2025-07-28' },
  { id: 'usr_23', name: 'Isabelle Duval', email: 'isabelle@acme.io', role: 'editor', status: 'inactive', createdAt: '2025-08-04' },
  { id: 'usr_24', name: 'Rafael Navarro', email: 'rafael@acme.io', role: 'viewer', status: 'active', createdAt: '2025-08-13' },
  { id: 'usr_25', name: 'Yuki Aoki', email: 'yuki@acme.io', role: 'admin', status: 'active', createdAt: '2025-08-22' },
  { id: 'usr_26', name: 'Hannah Weiss', email: 'hannah@acme.io', role: 'editor', status: 'pending', createdAt: '2025-09-01' },
  { id: 'usr_27', name: 'Ivan Kovac', email: 'ivan@acme.io', role: 'viewer', status: 'active', createdAt: '2025-09-12' },
  { id: 'usr_28', name: 'Sofia Ricci', email: 'sofia@acme.io', role: 'editor', status: 'active', createdAt: '2025-09-20' },
  { id: 'usr_29', name: 'Martin Becker', email: 'martin@acme.io', role: 'viewer', status: 'inactive', createdAt: '2025-10-01' },
  { id: 'usr_30', name: 'Aisha Khan', email: 'aisha@acme.io', role: 'admin', status: 'active', createdAt: '2025-10-09' },
  { id: 'usr_31', name: 'Erik Johansson', email: 'erik@acme.io', role: 'editor', status: 'pending', createdAt: '2025-10-18' },
  { id: 'usr_32', name: 'Camille Laurent', email: 'camille@acme.io', role: 'viewer', status: 'active', createdAt: '2025-10-27' },
];

const FILTER_FIELDS: FilterFieldDefinition[] = [
  {
    id: 'role',
    label: 'Role',
    operators: ['eq', 'neq'],
    options: [
      { value: 'admin', label: 'Admin' },
      { value: 'editor', label: 'Editor' },
      { value: 'viewer', label: 'Viewer' },
    ],
  },
  {
    id: 'status',
    label: 'Status',
    operators: ['eq', 'neq'],
    options: [
      { value: 'active', label: 'Active' },
      { value: 'pending', label: 'Pending' },
      { value: 'inactive', label: 'Inactive' },
    ],
  },
  { id: 'name', label: 'Name', operators: ['contains'] },
  { id: 'email', label: 'Email', operators: ['contains'] },
];

const ROLE_BADGE: Record<string, 'default' | 'secondary' | 'outline'> = {
  admin: 'default',
  editor: 'secondary',
  viewer: 'outline',
};

const STATUS_BADGE: Record<string, 'success' | 'warning' | 'destructive'> = {
  active: 'success',
  pending: 'warning',
  inactive: 'destructive',
};

function matchesChips(user: User, chips: FilterChip[]): boolean {
  return chips.every((chip) => {
    const value = String(
      (user as unknown as Record<string, string>)[chip.fieldId] ?? ''
    );
    switch (chip.operator) {
      case 'eq':
        return value.toLowerCase() === chip.value.toLowerCase();
      case 'neq':
        return value.toLowerCase() !== chip.value.toLowerCase();
      case 'contains':
        return value.toLowerCase().includes(chip.value.toLowerCase());
      default:
        return true;
    }
  });
}

const TABLE_VARIANT_SAMPLES = [
  { name: 'Default', variant: 'default' },
  { name: 'Striped', variant: 'striped' },
  { name: 'Bordered', variant: 'bordered' },
  { name: 'Ghost', variant: 'ghost' },
] as const;

const TABLE_SIZE_SAMPLES = [
  { name: 'Compact (sm)', size: 'sm' },
  { name: 'Default', size: 'default' },
  { name: 'Relaxed (lg)', size: 'lg' },
] as const;

const SAMPLE_ROWS = [
  { id: 'usr_01', name: 'Eleanor Vance', role: 'admin', status: 'active' },
  { id: 'usr_02', name: 'Marcus Thorne', role: 'editor', status: 'pending' },
  { id: 'usr_03', name: 'Aria Takahashi', role: 'viewer', status: 'inactive' },
] as const;

function VariantPreview({
  variant,
  size,
}: {
  variant?: (typeof TABLE_VARIANT_SAMPLES)[number]['variant'];
  size?: (typeof TABLE_SIZE_SAMPLES)[number]['size'];
}) {
  return (
    <Table variant={variant} size={size}>
      <TableHeader>
        <TableRow>
          <TableHead>ID</TableHead>
          <TableHead>Member</TableHead>
          <TableHead>Role</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {SAMPLE_ROWS.map((row) => (
          <TableRow key={row.id}>
            <TableCell className="font-mono">{row.id}</TableCell>
            <TableCell>{row.name}</TableCell>
            <TableCell className="capitalize">{row.role}</TableCell>
            <TableCell className="capitalize">{row.status}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

export default function DataTablePage() {
  const [data, setData] = React.useState<User[]>(INITIAL_DATA);
  const [chips, setChips] = React.useState<FilterChip[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [hasError, setHasError] = React.useState(false);
  const [views, setViews] = React.useState<SavedFilterView[]>([]);
  const [activeViewId, setActiveViewId] = React.useState<string | null>(null);

  const filteredData = React.useMemo(
    () => (chips.length === 0 ? data : data.filter((u) => matchesChips(u, chips))),
    [data, chips]
  );

  const { table, globalFilter, setGlobalFilter } = useDataTable<User, unknown>({
    columns: React.useMemo(() => buildColumns(), []),
    data: filteredData,
    enableRowSelection: true,
    enableColumnVisibility: true,
    pagination: { pageSize: 5, show: true },
  });

  const selectedCount = table.getFilteredSelectedRowModel().rows.length;
  const selectedIds = React.useMemo(
    () =>
      Object.keys(table.getState().rowSelection).map(
        (id) => table.getRow(id).original.id
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [table.getState().rowSelection]
  );

  const handleBulkDelete = () => {
    const deletedUsers = data.filter((d) => selectedIds.includes(d.id));
    const count = deletedUsers.length;

    setData((prev) => prev.filter((d) => !selectedIds.includes(d.id)));
    table.resetRowSelection();

    toast({
      variant: 'default',
      title: `${count} member${count > 1 ? 's' : ''} deleted`,
      description: 'The selected accounts were removed from the workspace.',
      action: (
        <ToastAction
          altText="Undo deletion"
          onClick={() => {
            setData((prev) => [...prev, ...deletedUsers]);
            toast({
              variant: 'success',
              title: 'Deletion undone',
              description: `${count} member${count > 1 ? 's' : ''} restored successfully.`,
            });
          }}
        >
          <RotateCcw className="h-3 w-3 mr-1" />
          Undo
        </ToastAction>
      ),
    });
  };

  const simulateLoading = () => {
    setHasError(false);
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 900);
  };

  const simulateError = () => {
    setIsLoading(true);
    setHasError(false);
    setTimeout(() => {
      setIsLoading(false);
      setHasError(true);
    }, 600);
  };

  const handleApplyView = (view: SavedFilterView) => {
    setChips(view.chips);
    setActiveViewId(view.id);
    toast({
      title: 'View applied',
      description: `${view.name} (${view.chips.length} filter${view.chips.length > 1 ? 's' : ''})`,
      variant: 'info',
    });
  };

  const handleSaveView = (name: string, viewChips: FilterChip[]) => {
    const newView: SavedFilterView = { id: `v-${Date.now()}`, name, chips: viewChips };
    setViews((prev) => [...prev, newView]);
    setActiveViewId(newView.id);
    toast({
      title: 'View saved',
      description: `${name} (${viewChips.length} filter${viewChips.length > 1 ? 's' : ''})`,
      variant: 'success',
    });
  };

  const handleDeleteView = (id: string) => {
    const target = views.find((v) => v.id === id);
    setViews((prev) => prev.filter((v) => v.id !== id));
    if (activeViewId === id) setActiveViewId(null);
    if (target) {
      toast({
        title: 'Saved view removed',
        description: target.name,
        variant: 'default',
        action: (
          <ToastAction
            altText="Undo view deletion"
            onClick={() => {
              setViews((prev) => [...prev, target]);
              setActiveViewId(target.id);
              toast({ title: 'View restored', description: target.name, variant: 'success' });
            }}
          >
            Undo
          </ToastAction>
        ),
      });
    }
  };

  const handleUpdateView = (id: string, viewChips: FilterChip[]) => {
    const target = views.find((v) => v.id === id);
    setViews((prev) => prev.map((v) => (v.id === id ? { ...v, chips: viewChips } : v)));
    toast({
      title: 'View updated',
      description: `Updated filters for "${target?.name ?? 'view'}"`,
      variant: 'success',
    });
  };

  return (
    <div className="space-y-10 animate-in fade-in-50 duration-200">
      <PageHeader
        eyebrow="UX Recipe Scenario"
        eyebrowIcon={Sparkles}
        title="Advanced Data Table & Filtering"
        description="Production data grid powered by TanStack Table: column sorting, multi-criteria FilterBuilder chips, global search, multi-row selection with bulk actions, undoable toasts, and full skeleton/empty/error states."
      />

      {hasError && (
        <Alert variant="destructive" className="animate-in fade-in-50">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Failed to fetch member records</AlertTitle>
          <AlertDescription className="flex items-center justify-between">
            <span>Remote server returned HTTP 503 Service Unavailable.</span>
            <Button size="sm" variant="outline" onClick={simulateLoading} className="h-7 text-xs ml-4">
              Retry Request
            </Button>
          </AlertDescription>
        </Alert>
      )}

      <div className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
          <FilterBuilder
            fields={FILTER_FIELDS}
            chips={chips}
            onChipsChange={setChips}
            storageKey="ds.users.filters.v1"
          />

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={simulateLoading} className="gap-1.5" title="Simulate loading state">
              <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              Reload
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={simulateError}
              className="text-muted-foreground hover:text-destructive h-8 text-xs"
              title="Simulate server error UX state"
            >
              Test Error UX
            </Button>
            <Button
              size="sm"
              className="gap-1.5"
              onClick={() =>
                toast({
                  variant: 'info',
                  title: 'Add Member Modal',
                  description: 'Triggering team invitation flow drawer...',
                })
              }
            >
              <UserPlus className="h-4 w-4" />
              Add Member
            </Button>
          </div>
        </div>

        <div className="rounded-md border border-border bg-card shadow-xs">
          <DataTableToolbar
            table={table}
            globalFilter={globalFilter}
            onGlobalFilterChange={setGlobalFilter}
            searchPlaceholder="Search by name or email..."
          />

          <div className="border-t border-border">
            <Table>
              <DataTableHeader table={table} />
              <DataTableBody
                table={table}
                loading={isLoading}
                emptyTitle="No members match your criteria"
                emptyDescription="Try clearing your search query or removing some filters."
                emptyIcon={Inbox}
              />
            </Table>
          </div>

          <div className="border-t border-border">
            <DataTablePagination table={table} />
          </div>
        </div>

        <BulkActionBar
          open={selectedCount > 0}
          count={selectedCount}
          onClearSelection={() => table.resetRowSelection()}
          actions={[
            {
              id: 'delete',
              label: 'Delete Selected',
              icon: Trash2,
              variant: 'destructive',
              onClick: handleBulkDelete,
            },
            {
              id: 'tag',
              label: 'Tag as pending',
              onClick: () =>
                toast({
                  variant: 'info',
                  title: `${selectedCount} members tagged`,
                  description: 'Status updated to pending review.',
                }),
            },
          ]}
        />
      </div>

      <section className="space-y-4">
        <div className="space-y-1">
          <h2 className="text-xl font-semibold text-foreground">
            Saved Views &amp; Advanced Filtering
          </h2>
          <p className="text-sm text-muted-foreground">
            Combine multi-criteria <code className="font-mono text-xs">FilterBuilder</code> chips with
            persistent saved views: name your current filter set, apply a preset in one click, update it
            as criteria change, and undo a deletion via toast.
          </p>
        </div>

        <div className="rounded-md border border-border bg-card shadow-xs p-4 space-y-4">
          <FilterBuilder
            fields={FILTER_FIELDS}
            chips={chips}
            onChipsChange={(newChips) => {
              setChips(newChips);
              if (activeViewId) {
                const current = views.find((v) => v.id === activeViewId);
                if (current && JSON.stringify(current.chips) !== JSON.stringify(newChips)) {
                  setActiveViewId(null);
                }
              }
            }}
            savedViews={views}
            activeViewId={activeViewId ?? undefined}
            onApplyView={handleApplyView}
            onSaveView={handleSaveView}
            onDeleteView={handleDeleteView}
            onUpdateView={handleUpdateView}
            maxChips={6}
          />
          <p className="text-xs text-muted-foreground">
            Active filter set: <strong className="text-foreground">{chips.length}</strong> condition
            {chips.length > 1 ? 's' : ''} ·{' '}
            <strong className="text-foreground">{filteredData.length}</strong> of {data.length} rows match.
            {activeViewId && (
              <span className="text-highlight"> · Current view: {views.find((v) => v.id === activeViewId)?.name}</span>
            )}
          </p>
        </div>
      </section>

      <section className="space-y-4">
        <div className="space-y-1">
          <h2 className="text-xl font-semibold text-foreground">
            Table Variants &amp; Density
          </h2>
          <p className="text-sm text-muted-foreground">
            Use the same <code className="font-mono text-xs">Table</code>{' '}
            primitives across every module (CRM, Clinic, docs) and pick a
            standardized <code className="font-mono text-xs">variant</code>{' '}
            and <code className="font-mono text-xs">size</code> instead of
            hand-rolled className overrides.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {TABLE_VARIANT_SAMPLES.map((sample) => (
            <div
              key={sample.variant}
              className="rounded-md border border-border bg-card shadow-xs overflow-hidden"
            >
              <div className="border-b border-border px-3 py-2">
                <p className="font-mono text-xs font-medium text-foreground">
                  variant=&quot;{sample.name}&quot;
                </p>
              </div>
              <VariantPreview variant={sample.variant} />
            </div>
          ))}
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {TABLE_SIZE_SAMPLES.map((sample) => (
            <div
              key={sample.size}
              className="rounded-md border border-border bg-card shadow-xs overflow-hidden"
            >
              <div className="border-b border-border px-3 py-2">
                <p className="font-mono text-xs font-medium text-foreground">
                  size=&quot;{sample.name}&quot;
                </p>
              </div>
              <VariantPreview size={sample.size} />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- TanStack ColumnDef TValue invariant, mixed column types
function buildColumns(): ColumnDef<User, any>[] {
  const columnHelper = createColumnHelper<User>();

  return [
    columnHelper.display({
      id: 'select',
      header: ({ table }) => (
        <Checkbox
          aria-label="Select all members on current page"
          checked={table.getIsAllPageRowsSelected()}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          aria-label={`Select ${row.original.name}`}
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
        />
      ),
      enableSorting: false,
    }),
    columnHelper.accessor('name', {
      header: 'Member Name',
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="font-semibold text-foreground text-sm">{row.original.name}</span>
          <span className="text-xs text-muted-foreground">{row.original.email}</span>
        </div>
      ),
      enableGlobalFilter: true,
    }),
    columnHelper.accessor('role', {
      header: 'Role',
      cell: ({ getValue }) => (
        <Badge variant={ROLE_BADGE[String(getValue())]} className="capitalize text-[11px]">
          {String(getValue())}
        </Badge>
      ),
    }),
    columnHelper.accessor('status', {
      header: 'Status',
      cell: ({ getValue }) => (
        <Badge variant={STATUS_BADGE[String(getValue())]} className="capitalize text-[11px]">
          {String(getValue())}
        </Badge>
      ),
    }),
    columnHelper.accessor('createdAt', {
      header: 'Joined Date',
      cell: ({ getValue }) => (
        <span className="text-xs text-muted-foreground font-mono">{String(getValue())}</span>
      ),
      enableSorting: true,
    }),
    columnHelper.display({
      id: 'actions',
      header: () => <span className="text-right">Actions</span>,
      cell: ({ row }) => (
        <div className="text-right">
          <Button
            size="sm"
            variant="ghost"
            className="h-8 text-xs"
            onClick={() =>
              toast({
                title: `Edit ${row.original.name}`,
                description: `Opening profile editor for ${row.original.email}`,
                variant: 'info',
              })
            }
          >
            Edit
          </Button>
        </div>
      ),
      enableSorting: false,
    }),
  ];
}