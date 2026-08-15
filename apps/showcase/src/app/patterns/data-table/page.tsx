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
} from '@ds/ui';
import {
  Search,
  ArrowUpDown,
  Trash2,
  Plus,
  RefreshCw,
  Sparkles,
  Inbox,
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
];

export default function DataTablePatternPage() {
  const [data, setData] = React.useState<User[]>(INITIAL_DATA);
  const [search, setSearch] = React.useState('');
  const [roleFilter, setRoleFilter] = React.useState('all');
  const [statusFilter, setStatusFilter] = React.useState('all');
  const [selectedIds, setSelectedIds] = React.useState<string[]>([]);
  const [sortAsc, setSortAsc] = React.useState(true);
  const [isLoading, setIsLoading] = React.useState(false);

  // Filter and sort
  const filteredData = React.useMemo(() => {
    return data
      .filter((item) => {
        const matchesSearch =
          item.name.toLowerCase().includes(search.toLowerCase()) ||
          item.email.toLowerCase().includes(search.toLowerCase());
        const matchesRole = roleFilter === 'all' || item.role === roleFilter;
        const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
        return matchesSearch && matchesRole && matchesStatus;
      })
      .sort((a, b) => {
        return sortAsc
          ? a.name.localeCompare(b.name)
          : b.name.localeCompare(a.name);
      });
  }, [data, search, roleFilter, statusFilter, sortAsc]);

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredData.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredData.map((d) => d.id));
    }
  };

  const toggleSelectOne = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleBulkDelete = () => {
    setData((prev) => prev.filter((d) => !selectedIds.includes(d.id)));
    setSelectedIds([]);
  };

  const simulateLoading = () => {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 1200);
  };

  return (
    <div className="space-y-10 animate-in fade-in-50 duration-200">
      <PageHeader
        eyebrow="UX Recipe Scenario"
        eyebrowIcon={Sparkles}
        title="Advanced Data Table & Filtering"
        description="Production data grid with column sorting, live multi-criteria filtering, multi-row selection, bulk operations, and full skeleton/empty states."
      />

      <Card className="border-border shadow-xs">
        {/* Table Toolbar */}
        <CardHeader className="p-5 border-b border-border space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex flex-1 items-center gap-3">
              {/* Search Bar */}
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name or email..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>

              {/* Role Filter */}
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-36">
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
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-36">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Right Actions & Simulation Controls */}
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={simulateLoading}
                className="gap-1.5"
                title="Test loading skeleton UX"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                Reload
              </Button>

              <Button size="sm" className="gap-1.5">
                <Plus className="h-4 w-4" />
                Add Member
              </Button>
            </div>
          </div>

          {/* Bulk Selection Action Bar */}
          {selectedIds.length > 0 && (
            <div className="flex items-center justify-between rounded-lg bg-primary/10 border border-primary/20 p-2.5 px-4 animate-in fade-in-50">
              <span className="text-xs font-semibold text-primary">
                {selectedIds.length} item{selectedIds.length > 1 ? 's' : ''} selected
              </span>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={handleBulkDelete}
                  className="gap-1.5 h-8 text-xs"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Delete Selected
                </Button>
              </div>
            </div>
          )}
        </CardHeader>

        {/* Table Content */}
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-3">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
            </div>
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
                }}
              />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={
                        selectedIds.length === filteredData.length &&
                        filteredData.length > 0
                      }
                      onCheckedChange={toggleSelectAll}
                    />
                  </TableHead>
                  <TableHead>
                    <button
                      onClick={() => setSortAsc(!sortAsc)}
                      className="flex items-center gap-1.5 hover:text-foreground font-semibold"
                    >
                      <span>Member Name</span>
                      <ArrowUpDown className="h-3.5 w-3.5" />
                    </button>
                  </TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Joined Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredData.map((user) => {
                  const isSelected = selectedIds.includes(user.id);
                  return (
                    <TableRow key={user.id} data-state={isSelected ? 'selected' : undefined}>
                      <TableCell>
                        <Checkbox
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
                        <Button size="sm" variant="ghost" className="h-8 text-xs">
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

        {/* Table Footer Pagination */}
        <CardFooter className="flex items-center justify-between p-4 border-t border-border text-xs text-muted-foreground">
          <span>
            Showing <strong>{filteredData.length}</strong> of <strong>{data.length}</strong> members
          </span>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" disabled className="h-8 text-xs">
              Previous
            </Button>
            <Button size="sm" variant="outline" disabled className="h-8 text-xs">
              Next
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
