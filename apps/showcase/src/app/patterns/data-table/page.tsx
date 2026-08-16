'use client';

import * as React from 'react';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  Card,
  CardHeader,
  CardContent,
  CardFooter,
  Input,
  Button,
  Badge,
  Checkbox,
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  Skeleton,
  EmptyState,
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
  ToastAction,
  toast,
  Alert,
  AlertTitle,
  AlertDescription,
} from '@ds/ui';
import {
  Search,
  ArrowUp,
  ArrowDown,
  Trash2,
  Plus,
  RefreshCw,
  Sparkles,
  Inbox,
  AlertCircle,
  RotateCcw,
} from 'lucide-react';
import { PageHeader } from '../../../components/page-header';
import type { User } from '@shared/types';

const INITIAL_DATA: User[] = [
  {
    id: 'usr_1',
    name: 'Eleanor Vance',
    email: 'eleanor@acme.io',
    role: 'admin',
    status: 'active',
    createdAt: '2025-01-14',
  },
  {
    id: 'usr_2',
    name: 'Marcus Thorne',
    email: 'marcus@acme.io',
    role: 'editor',
    status: 'active',
    createdAt: '2025-02-03',
  },
  {
    id: 'usr_3',
    name: 'Aria Takahashi',
    email: 'aria@acme.io',
    role: 'viewer',
    status: 'pending',
    createdAt: '2025-02-18',
  },
  {
    id: 'usr_4',
    name: 'Julian Hayes',
    email: 'julian@acme.io',
    role: 'editor',
    status: 'inactive',
    createdAt: '2024-11-20',
  },
  {
    id: 'usr_5',
    name: 'Sophia Chen',
    email: 'sophia@acme.io',
    role: 'admin',
    status: 'active',
    createdAt: '2025-01-02',
  },
  {
    id: 'usr_6',
    name: 'Darius Sterling',
    email: 'darius@acme.io',
    role: 'editor',
    status: 'active',
    createdAt: '2025-03-01',
  },
  {
    id: 'usr_7',
    name: 'Elena Rostova',
    email: 'elena@acme.io',
    role: 'viewer',
    status: 'active',
    createdAt: '2025-03-12',
  },
  {
    id: 'usr_8',
    name: 'Theo Lindqvist',
    email: 'theo@acme.io',
    role: 'editor',
    status: 'active',
    createdAt: '2025-03-20',
  },
  {
    id: 'usr_9',
    name: 'Ingrid Berg',
    email: 'ingrid@acme.io',
    role: 'viewer',
    status: 'pending',
    createdAt: '2025-04-02',
  },
  {
    id: 'usr_10',
    name: 'Felix Moreau',
    email: 'felix@acme.io',
    role: 'admin',
    status: 'active',
    createdAt: '2025-04-11',
  },
  {
    id: 'usr_11',
    name: 'Priya Nair',
    email: 'priya@acme.io',
    role: 'editor',
    status: 'inactive',
    createdAt: '2025-04-25',
  },
  {
    id: 'usr_12',
    name: 'Omar Haddad',
    email: 'omar@acme.io',
    role: 'viewer',
    status: 'active',
    createdAt: '2025-05-01',
  },
  {
    id: 'usr_13',
    name: 'Clara Fontaine',
    email: 'clara@acme.io',
    role: 'editor',
    status: 'active',
    createdAt: '2025-05-09',
  },
  {
    id: 'usr_14',
    name: 'Hiro Tanaka',
    email: 'hiro@acme.io',
    role: 'viewer',
    status: 'pending',
    createdAt: '2025-05-18',
  },
  {
    id: 'usr_15',
    name: 'Nadia Petrova',
    email: 'nadia@acme.io',
    role: 'admin',
    status: 'active',
    createdAt: '2025-05-27',
  },
  {
    id: 'usr_16',
    name: 'Lucas Ferreira',
    email: 'lucas@acme.io',
    role: 'editor',
    status: 'active',
    createdAt: '2025-06-03',
  },
  {
    id: 'usr_17',
    name: 'Amara Osei',
    email: 'amara@acme.io',
    role: 'viewer',
    status: 'inactive',
    createdAt: '2025-06-14',
  },
  {
    id: 'usr_18',
    name: 'Victor Zhukov',
    email: 'victor@acme.io',
    role: 'editor',
    status: 'active',
    createdAt: '2025-06-21',
  },
  {
    id: 'usr_19',
    name: 'Leila Mansour',
    email: 'leila@acme.io',
    role: 'viewer',
    status: 'active',
    createdAt: '2025-07-02',
  },
  {
    id: 'usr_20',
    name: 'Daniel Okafor',
    email: 'daniel@acme.io',
    role: 'admin',
    status: 'active',
    createdAt: '2025-07-10',
  },
  {
    id: 'usr_21',
    name: 'Marta Silva',
    email: 'marta@acme.io',
    role: 'editor',
    status: 'pending',
    createdAt: '2025-07-19',
  },
  {
    id: 'usr_22',
    name: 'Kenji Watanabe',
    email: 'kenji@acme.io',
    role: 'viewer',
    status: 'active',
    createdAt: '2025-07-28',
  },
  {
    id: 'usr_23',
    name: 'Isabelle Duval',
    email: 'isabelle@acme.io',
    role: 'editor',
    status: 'inactive',
    createdAt: '2025-08-04',
  },
  {
    id: 'usr_24',
    name: 'Rafael Navarro',
    email: 'rafael@acme.io',
    role: 'viewer',
    status: 'active',
    createdAt: '2025-08-13',
  },
  {
    id: 'usr_25',
    name: 'Yuki Aoki',
    email: 'yuki@acme.io',
    role: 'admin',
    status: 'active',
    createdAt: '2025-08-22',
  },
  {
    id: 'usr_26',
    name: 'Hannah Weiss',
    email: 'hannah@acme.io',
    role: 'editor',
    status: 'pending',
    createdAt: '2025-09-01',
  },
  {
    id: 'usr_27',
    name: 'Ivan Kovac',
    email: 'ivan@acme.io',
    role: 'viewer',
    status: 'active',
    createdAt: '2025-09-12',
  },
  {
    id: 'usr_28',
    name: 'Sofia Ricci',
    email: 'sofia@acme.io',
    role: 'editor',
    status: 'active',
    createdAt: '2025-09-20',
  },
  {
    id: 'usr_29',
    name: 'Martin Becker',
    email: 'martin@acme.io',
    role: 'viewer',
    status: 'inactive',
    createdAt: '2025-10-01',
  },
  {
    id: 'usr_30',
    name: 'Aisha Khan',
    email: 'aisha@acme.io',
    role: 'admin',
    status: 'active',
    createdAt: '2025-10-09',
  },
  {
    id: 'usr_31',
    name: 'Erik Johansson',
    email: 'erik@acme.io',
    role: 'editor',
    status: 'pending',
    createdAt: '2025-10-18',
  },
  {
    id: 'usr_32',
    name: 'Camille Laurent',
    email: 'camille@acme.io',
    role: 'viewer',
    status: 'active',
    createdAt: '2025-10-27',
  },
];

const PAGE_SIZE = 4;

type SortKey = 'name' | 'role' | 'status';

type PageItem = number | 'ellipsis-left' | 'ellipsis-right';

function getPaginationItems(current: number, total: number): PageItem[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const items: PageItem[] = [1];
  if (current > 3) items.push('ellipsis-left');
  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);
  for (let p = start; p <= end; p++) items.push(p);
  if (current < total - 2) items.push('ellipsis-right');
  items.push(total);
  return items;
}

export default function DataTablePatternPage() {
  const [data, setData] = React.useState<User[]>(INITIAL_DATA);
  const [search, setSearch] = React.useState('');
  const [roleFilter, setRoleFilter] = React.useState('all');
  const [statusFilter, setStatusFilter] = React.useState('all');
  const [datePreset, setDatePreset] = React.useState('all');
  const [fromDate, setFromDate] = React.useState('');
  const [toDate, setToDate] = React.useState('');
  const [selectedIds, setSelectedIds] = React.useState<string[]>([]);
  const [sortKey, setSortKey] = React.useState<SortKey>('name');
  const [sortAsc, setSortAsc] = React.useState<boolean>(true);
  const [isLoading, setIsLoading] = React.useState(false);
  const [hasError, setHasError] = React.useState(false);
  const [currentPage, setCurrentPage] = React.useState(1);

  const today = React.useMemo(() => new Date(), []);
  const presetStart = React.useMemo(() => {
    const d = new Date(today);
    if (datePreset === '30d') d.setDate(d.getDate() - 30);
    else if (datePreset === '90d') d.setDate(d.getDate() - 90);
    else if (datePreset === '7d') d.setDate(d.getDate() - 7);
    return d;
  }, [datePreset, today]);

  // Filter and sort
  const filteredData = React.useMemo(() => {
    return data
      .filter((item) => {
        const matchesSearch =
          item.name.toLowerCase().includes(search.toLowerCase()) ||
          item.email.toLowerCase().includes(search.toLowerCase());
        const matchesRole = roleFilter === 'all' || item.role === roleFilter;
        const matchesStatus = statusFilter === 'all' || item.status === statusFilter;

        const createdAt = new Date(item.createdAt);
        let matchesDate = true;
        if (datePreset !== 'all') {
          matchesDate = createdAt >= presetStart;
        }
        if (fromDate && createdAt < new Date(fromDate)) matchesDate = false;
        if (toDate && createdAt > new Date(toDate)) matchesDate = false;

        return matchesSearch && matchesRole && matchesStatus && matchesDate;
      })
      .sort((a, b) => {
        const modifier = sortAsc ? 1 : -1;
        const av = a[sortKey];
        const bv = b[sortKey];
        return av.localeCompare(bv) * modifier;
      });
  }, [data, search, roleFilter, statusFilter, datePreset, presetStart, fromDate, toDate, sortKey, sortAsc]);

  // Paginated slice
  const totalPages = Math.max(1, Math.ceil(filteredData.length / PAGE_SIZE));
  const paginatedData = React.useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredData.slice(start, start + PAGE_SIZE);
  }, [filteredData, currentPage]);

  const toggleSelectAll = () => {
    const currentPageIds = paginatedData.map((d) => d.id);
    const allSelected = currentPageIds.every((id) => selectedIds.includes(id));

    if (allSelected) {
      setSelectedIds((prev) => prev.filter((id) => !currentPageIds.includes(id)));
    } else {
      setSelectedIds((prev) => Array.from(new Set([...prev, ...currentPageIds])));
    }
  };

  const toggleSelectOne = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleBulkDelete = () => {
    const deletedUsers = data.filter((d) => selectedIds.includes(d.id));
    const count = deletedUsers.length;

    setData((prev) => prev.filter((d) => !selectedIds.includes(d.id)));
    setSelectedIds([]);

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

  return (
    <div className="space-y-10 animate-in fade-in-50 duration-200">
      <PageHeader
        eyebrow="UX Recipe Scenario"
        eyebrowIcon={Sparkles}
        title="Advanced Data Table & Filtering"
        description="Production data grid with column sorting, live multi-criteria filtering (search, role, status, join date range), multi-row selection, confirmation dialogs, undoable toasts, and full skeleton/empty/error states."
      />

      {/* Simulated error notification banner */}
      {hasError && (
        <Alert variant="destructive" className="animate-in fade-in-50">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Failed to fetch member records</AlertTitle>
          <AlertDescription className="flex items-center justify-between">
            <span>Remote server returned HTTP 503 Service Unavailable.</span>
            <Button
              size="sm"
              variant="outline"
              onClick={simulateLoading}
              className="h-7 text-xs ml-4"
            >
              Retry Request
            </Button>
          </AlertDescription>
        </Alert>
      )}

      <Card className="border-border shadow-xs">
        {/* Table Toolbar */}
        <CardHeader className="p-5 border-b border-border space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex w-full flex-1 flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
              {/* Search Bar */}
              <div className="relative w-full sm:max-w-sm sm:flex-1">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  aria-label="Search members"
                  placeholder="Search by name or email..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="pl-9"
                />
              </div>

              {/* Role Filter */}
              <Select
                value={roleFilter}
                onValueChange={(val) => {
                  setRoleFilter(val);
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger className="w-full sm:w-36" aria-label="Filter by role">
                  <SelectValue placeholder="Role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="editor">Editor</SelectItem>
                  <SelectItem value="viewer">Viewer</SelectItem>
                </SelectContent>
              </Select>

              {/* Status Filter */}
              <Select
                value={statusFilter}
                onValueChange={(val) => {
                  setStatusFilter(val);
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger className="w-full sm:w-36" aria-label="Filter by status">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>

              {/* Date Range Preset */}
              <Select
                value={datePreset}
                onValueChange={(val) => {
                  setDatePreset(val);
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger className="w-full sm:w-32" aria-label="Filter by join date range">
                  <SelectValue placeholder="Joined" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All dates</SelectItem>
                  <SelectItem value="7d">Last 7 days</SelectItem>
                  <SelectItem value="30d">Last 30 days</SelectItem>
                  <SelectItem value="90d">Last 90 days</SelectItem>
                </SelectContent>
              </Select>

              {/* Custom date range */}
              <div className="flex items-center gap-2">
                <input
                  type="date"
                  aria-label="Join date from"
                  value={fromDate}
                  max={toDate || undefined}
                  onChange={(e) => {
                    setFromDate(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="h-9 rounded-md border border-input bg-background px-2 text-xs text-foreground shadow-xs focus:border-primary focus:ring-2 focus:ring-ring focus:outline-none"
                />
                <span className="text-xs text-muted-foreground">to</span>
                <input
                  type="date"
                  aria-label="Join date to"
                  value={toDate}
                  min={fromDate || undefined}
                  onChange={(e) => {
                    setToDate(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="h-9 rounded-md border border-input bg-background px-2 text-xs text-foreground shadow-xs focus:border-primary focus:ring-2 focus:ring-ring focus:outline-none"
                />
              </div>
            </div>

            {/* Right Actions & Simulation Controls */}
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={simulateLoading}
                className="gap-1.5"
                title="Simulate loading state"
              >
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
                <Plus className="h-4 w-4" />
                Add Member
              </Button>
            </div>
          </div>

          {/* Bulk Selection Action Bar with AlertDialog Confirmation */}
          {selectedIds.length > 0 && (
            <div className="flex items-center justify-between rounded-lg bg-primary/10 border border-primary/20 p-2.5 px-4 animate-in fade-in-50">
              <span className="text-xs font-semibold text-primary">
                {selectedIds.length} item{selectedIds.length > 1 ? 's' : ''} selected across view
              </span>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setSelectedIds([])}
                  className="h-8 text-xs"
                >
                  Deselect All
                </Button>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      size="sm"
                      variant="destructive"
                      className="gap-1.5 h-8 text-xs"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Delete Selected ({selectedIds.length})
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete selected team members?</AlertDialogTitle>
                      <AlertDialogDescription>
                        You are about to remove <strong>{selectedIds.length}</strong> team member{selectedIds.length > 1 ? 's' : ''}. They will immediately lose workspace access.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        variant="destructive"
                        onClick={handleBulkDelete}
                      >
                        Confirm Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          )}
        </CardHeader>

        {/* Table Content */}
        <CardContent className="p-0">
          {isLoading ? (
            /* High-fidelity column-matching skeleton */
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12"><Skeleton className="h-4 w-4" /></TableHead>
                  <TableHead><Skeleton className="h-4 w-28" /></TableHead>
                  <TableHead><Skeleton className="h-4 w-16" /></TableHead>
                  <TableHead><Skeleton className="h-4 w-16" /></TableHead>
                  <TableHead><Skeleton className="h-4 w-24" /></TableHead>
                  <TableHead className="text-right"><Skeleton className="h-4 w-12 ml-auto" /></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Array.from({ length: PAGE_SIZE }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-4 w-4" /></TableCell>
                    <TableCell>
                      <div className="space-y-1.5">
                        <Skeleton className="h-4 w-36" />
                        <Skeleton className="h-3 w-24" />
                      </div>
                    </TableCell>
                    <TableCell><Skeleton className="h-5 w-14 rounded-full" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-16 rounded-full" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="h-8 w-12 ml-auto rounded-md" /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : filteredData.length === 0 ? (
            <div className="p-12">
              <EmptyState
                icon={Inbox}
                title="No members match your criteria"
                description="Try clearing your search query or loosening your role/status filters."
                actionLabel="Reset Filters"
                onAction={() => {
                  setSearch('');
                  setRoleFilter('all');
                  setStatusFilter('all');
                  setDatePreset('all');
                  setFromDate('');
                  setToDate('');
                  setCurrentPage(1);
                }}
              />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      aria-label="Select all members on current page"
                      checked={
                        paginatedData.length > 0 &&
                        paginatedData.every((d) => selectedIds.includes(d.id))
                      }
                      onCheckedChange={toggleSelectAll}
                    />
                  </TableHead>
                  <TableHead aria-sort={sortKey === 'name' ? (sortAsc ? 'ascending' : 'descending') : undefined}>
                    <button
                      onClick={() => {
                        if (sortKey === 'name') setSortAsc(!sortAsc);
                        else setSortKey('name');
                      }}
                      className="flex items-center gap-1.5 hover:text-foreground font-semibold cursor-pointer"
                      aria-label="Sort by member name"
                    >
                      <span>Member Name</span>
                      {sortKey === 'name' &&
                        (sortAsc ? (
                          <ArrowUp className="h-3.5 w-3.5 text-primary" />
                        ) : (
                          <ArrowDown className="h-3.5 w-3.5 text-primary" />
                        ))}
                    </button>
                  </TableHead>
                  <TableHead aria-sort={sortKey === 'role' ? (sortAsc ? 'ascending' : 'descending') : undefined}>
                    <button
                      onClick={() => {
                        if (sortKey === 'role') setSortAsc(!sortAsc);
                        else setSortKey('role');
                      }}
                      className="flex items-center gap-1.5 hover:text-foreground font-semibold cursor-pointer"
                      aria-label="Sort by role"
                    >
                      <span>Role</span>
                      {sortKey === 'role' &&
                        (sortAsc ? (
                          <ArrowUp className="h-3.5 w-3.5 text-primary" />
                        ) : (
                          <ArrowDown className="h-3.5 w-3.5 text-primary" />
                        ))}
                    </button>
                  </TableHead>
                  <TableHead aria-sort={sortKey === 'status' ? (sortAsc ? 'ascending' : 'descending') : undefined}>
                    <button
                      onClick={() => {
                        if (sortKey === 'status') setSortAsc(!sortAsc);
                        else setSortKey('status');
                      }}
                      className="flex items-center gap-1.5 hover:text-foreground font-semibold cursor-pointer"
                      aria-label="Sort by status"
                    >
                      <span>Status</span>
                      {sortKey === 'status' &&
                        (sortAsc ? (
                          <ArrowUp className="h-3.5 w-3.5 text-primary" />
                        ) : (
                          <ArrowDown className="h-3.5 w-3.5 text-primary" />
                        ))}
                    </button>
                  </TableHead>
                  <TableHead>Joined Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedData.map((user) => {
                  const isSelected = selectedIds.includes(user.id);
                  return (
                    <TableRow key={user.id} data-state={isSelected ? 'selected' : undefined}>
                      <TableCell>
                        <Checkbox
                          aria-label={`Select ${user.name}`}
                          checked={isSelected}
                          onCheckedChange={() => toggleSelectOne(user.id)}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-semibold text-foreground text-sm">
                            {user.name}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {user.email}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            user.role === 'admin'
                              ? 'default'
                              : user.role === 'editor'
                              ? 'secondary'
                              : 'outline'
                          }
                          className="capitalize text-[11px]"
                        >
                          {user.role}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            user.status === 'active'
                              ? 'success'
                              : user.status === 'pending'
                              ? 'warning'
                              : 'destructive'
                          }
                          className="capitalize text-[11px]"
                        >
                          {user.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground font-mono">
                        {user.createdAt}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 text-xs"
                          onClick={() =>
                            toast({
                              title: `Edit ${user.name}`,
                              description: `Opening profile editor for ${user.email}`,
                              variant: 'info',
                            })
                          }
                        >
                          Edit
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>

        {/* Table Footer Real Pagination */}
        <CardFooter className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border-t border-border text-xs text-muted-foreground">
          <span>
            Showing <strong>{Math.min(filteredData.length, (currentPage - 1) * PAGE_SIZE + 1)}</strong> to{' '}
            <strong>{Math.min(filteredData.length, currentPage * PAGE_SIZE)}</strong> of{' '}
            <strong>{filteredData.length}</strong> members
          </span>

          <Pagination className="mx-0 w-auto">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    if (currentPage > 1) setCurrentPage((p) => p - 1);
                  }}
                  className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                />
              </PaginationItem>

              {getPaginationItems(currentPage, totalPages).map((item, idx) => {
                if (item === 'ellipsis-left' || item === 'ellipsis-right') {
                  return (
                    <PaginationItem key={`${item}-${idx}`}>
                      <PaginationEllipsis />
                    </PaginationItem>
                  );
                }
                const pageNum = item;
                return (
                  <PaginationItem key={pageNum}>
                    <PaginationLink
                      href="#"
                      isActive={currentPage === pageNum}
                      onClick={(e) => {
                        e.preventDefault();
                        setCurrentPage(pageNum);
                      }}
                      className="cursor-pointer"
                    >
                      {pageNum}
                    </PaginationLink>
                  </PaginationItem>
                );
              })}

              <PaginationItem>
                <PaginationNext
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    if (currentPage < totalPages) setCurrentPage((p) => p + 1);
                  }}
                  className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </CardFooter>
      </Card>
    </div>
  );
}
