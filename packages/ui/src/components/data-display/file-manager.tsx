'use client';

import * as React from 'react';
import { flexRender, type ColumnDef } from '@tanstack/react-table';
import {
  Download,
  Eye,
  File as FileIcon,
  FileText,
  FolderInput,
  FolderOpen,
  FolderPlus,
  Image as ImageIcon,
  Info,
  LayoutGrid,
  List,
  Music,
  PanelLeft,
  PanelRight,
  Pencil,
  Search,
  Trash2,
  Upload,
  Video,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { Button } from '../base/button';
import { Checkbox } from '../base/checkbox';
import { Input } from '../base/input';
import { Skeleton } from '../base/skeleton';
import { Sheet, SheetContent, SheetTitle } from '../overlay/sheet';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '../navigation/breadcrumb';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from '../navigation/context-menu';
import { EmptyState } from '../feedback/empty-state';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../form/select';
import { BulkActionBar } from './bulk-action-bar';
import { DataTableHeader, useDataTable } from './data-table';
import { Table, TableBody, TableCell, TableRow } from './table';
import { TreeView, type TreeNode } from '../dnd/tree-view';
import type { UploadHandler } from '../form/file-upload';

export interface FileFolder {
  id: string;
  name: string;
  parentId: string | null;
}

export type FileItemType = 'image' | 'pdf' | 'video' | 'audio' | 'other';

export interface FileItem {
  id: string;
  folderId: string;
  name: string;
  type: FileItemType;
  size: number;
  updatedAt: string;
  dimensions?: string;
  duration?: number;
  thumbnailUrl?: string;
  previewUrl?: string;
}

export type FileManagerView = 'list' | 'grid';

export interface FileManagerProps {
  folders: FileFolder[];
  items: FileItem[];
  activeFolderId: string;
  selectedIds?: string[];
  view?: FileManagerView;
  quota?: { total: number; used: number };
  loading?: boolean;
  error?: string | null;
  onActiveFolderChange?: (folderId: string) => void;
  onSelectionChange?: (ids: string[]) => void;
  onViewChange?: (view: FileManagerView) => void;
  onPreview?: (item: FileItem) => void;
  onDownload?: (items: FileItem[]) => void;
  onMove?: (items: FileItem[], targetFolderId: string) => void;
  onDelete?: (items: FileItem[]) => void;
  onRename?: (item: FileItem, nextName: string) => void;
  onCreateFolder?: (parentId: string, name: string) => void;
  uploadHandler?: UploadHandler;
  onRetry?: () => void;
  contentSlot?: React.ReactNode;
  contextSlot?: React.ReactNode;
  className?: string;
}

function buildTree(folders: FileFolder[]): TreeNode[] {
  const childrenByParent = new Map<string | null, FileFolder[]>();
  for (const folder of folders) {
    const list = childrenByParent.get(folder.parentId) ?? [];
    list.push(folder);
    childrenByParent.set(folder.parentId, list);
  }
  const toNode = (folder: FileFolder): TreeNode => ({
    id: folder.id,
    label: folder.name,
    children: (childrenByParent.get(folder.id) ?? []).map(toNode),
  });
  return (childrenByParent.get(null) ?? []).map(toNode);
}

function ancestorIds(folders: FileFolder[], folderId: string): string[] {
  const byId = new Map(folders.map((f) => [f.id, f]));
  const ids: string[] = [];
  let current = byId.get(folderId);
  while (current?.parentId) {
    ids.push(current.parentId);
    current = byId.get(current.parentId);
  }
  return ids;
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(iso: string): string {
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? iso : date.toLocaleDateString('id-ID');
}

const TYPE_ICONS: Record<FileItemType, React.ElementType> = {
  image: ImageIcon,
  pdf: FileText,
  video: Video,
  audio: Music,
  other: FileIcon,
};

const TYPE_LABELS: Record<FileItemType, string> = {
  image: 'Gambar',
  pdf: 'PDF',
  video: 'Video',
  audio: 'Audio',
  other: 'Lainnya',
};

export function FileManager({
  folders,
  items,
  activeFolderId,
  selectedIds,
  view,
  loading = false,
  error = null,
  onActiveFolderChange,
  onSelectionChange,
  onViewChange,
  onPreview,
  onDownload,
  onMove,
  onDelete,
  onRename,
  onCreateFolder,
  onRetry,
  contentSlot,
  contextSlot,
  className,
}: FileManagerProps) {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const [contextOpen, setContextOpen] = React.useState(false);
  const [expandedIds, setExpandedIds] = React.useState<string[]>(() =>
    ancestorIds(folders, activeFolderId)
  );
  const [internalView, setInternalView] = React.useState<FileManagerView>('list');
  const [internalSelected, setInternalSelected] = React.useState<string[]>(selectedIds ?? []);
  const [filterType, setFilterType] = React.useState<'all' | FileItemType>('all');
  const lastClickedIndex = React.useRef<number | null>(null);

  const currentView = view ?? internalView;
  const currentSelected = selectedIds ?? internalSelected;

  const setView = (next: FileManagerView) => {
    if (view === undefined) setInternalView(next);
    onViewChange?.(next);
  };

  const setSelection = (next: string[]) => {
    if (selectedIds === undefined) setInternalSelected(next);
    onSelectionChange?.(next);
  };

  const activeFolder = folders.find((f) => f.id === activeFolderId);
  const path = React.useMemo(() => {
    const byId = new Map(folders.map((f) => [f.id, f]));
    const chain: FileFolder[] = [];
    let current = byId.get(activeFolderId);
    while (current) {
      chain.unshift(current);
      current = current.parentId ? byId.get(current.parentId) : undefined;
    }
    return chain;
  }, [folders, activeFolderId]);

  // Keep the active folder visible in the tree when it changes via breadcrumb.
  React.useEffect(() => {
    setExpandedIds((prev) => [...new Set([...prev, ...ancestorIds(folders, activeFolderId)])]);
  }, [folders, activeFolderId]);

  // AC-05: error pada zona konten membersihkan seleksi.
  const prevError = React.useRef<string | null>(null);
  React.useEffect(() => {
    if (error && !prevError.current && currentSelected.length > 0) {
      setSelection([]);
    }
    prevError.current = error;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [error]);

  const handleSelect = (folderId: string) => {
    onActiveFolderChange?.(folderId);
  };

  const treeNodes = React.useMemo(() => buildTree(folders), [folders]);
  const activeItems = items.filter((item) => item.folderId === activeFolderId);
  const visibleItems = React.useMemo(
    () => (filterType === 'all' ? activeItems : activeItems.filter((i) => i.type === filterType)),
    // activeItems is derived each render; depend on its inputs instead.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [items, activeFolderId, filterType]
  );

  const selectedItems = React.useMemo(
    () => visibleItems.filter((i) => currentSelected.includes(i.id)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [items, activeFolderId, filterType, currentSelected]
  );

  const toggleItem = (item: FileItem, mode: 'single' | 'additive' | 'range', index: number) => {
    if (mode === 'additive') {
      const next = currentSelected.includes(item.id)
        ? currentSelected.filter((id) => id !== item.id)
        : [...currentSelected, item.id];
      setSelection(next);
      lastClickedIndex.current = index;
      return;
    }
    if (mode === 'range' && lastClickedIndex.current !== null) {
      const [from, to] = [Math.min(lastClickedIndex.current, index), Math.max(lastClickedIndex.current, index)];
      const rangeIds = sortedItems.slice(from, to + 1).map((i) => i.id);
      setSelection([...new Set([...currentSelected, ...rangeIds])]);
      return;
    }
    setSelection(currentSelected.includes(item.id) && mode === 'single' ? [] : [item.id]);
    lastClickedIndex.current = index;
  };

  const handleItemClick = (event: React.MouseEvent, item: FileItem, index: number) => {
    if ((event.target as HTMLElement).closest('button, a, input, [role="checkbox"], [role="menuitem"]')) {
      return;
    }
    if (event.shiftKey) {
      toggleItem(item, 'range', index);
    } else if (event.ctrlKey || event.metaKey) {
      toggleItem(item, 'additive', index);
    } else {
      toggleItem(item, 'single', index);
    }
  };

  const handleItemKeyDown = (event: React.KeyboardEvent, _item: FileItem, index: number) => {
    // Buka context menu via keyboard: tombol Menu / Shift+F10 memicu event
    // contextmenu di browser; dispatch manual agar Radix membukanya.
    if (event.key === 'ContextMenu' || (event.key === 'F10' && event.shiftKey)) {
      event.preventDefault();
      event.currentTarget.dispatchEvent(
        new MouseEvent('contextmenu', { bubbles: true, cancelable: true })
      );
      return;
    }
    if (!event.shiftKey) return;
    if (event.key === 'ArrowDown' || event.key === 'ArrowRight') {
      event.preventDefault();
      const next = sortedItems[index + 1];
      if (next && !currentSelected.includes(next.id)) {
        setSelection([...currentSelected, next.id]);
        lastClickedIndex.current = index + 1;
      }
    } else if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') {
      event.preventDefault();
      const prev = sortedItems[index - 1];
      if (prev && !currentSelected.includes(prev.id)) {
        setSelection([...currentSelected, prev.id]);
        lastClickedIndex.current = index - 1;
      }
    }
  };

  const columns = React.useMemo<ColumnDef<FileItem, unknown>[]>(
    () => [
      {
        id: 'select',
        header: () => <span className="sr-only">Pilih</span>,
        cell: ({ row }) => {
          const item = row.original;
          const index = visibleItems.findIndex((i) => i.id === item.id);
          return (
            <Checkbox
              aria-label={`Pilih ${item.name}`}
              checked={currentSelected.includes(item.id)}
              onCheckedChange={() => toggleItem(item, 'additive', index)}
            />
          );
        },
        enableSorting: false,
      },
      {
        accessorKey: 'name',
        header: 'Nama',
        cell: ({ row }) => {
          const ItemIcon = TYPE_ICONS[row.original.type];
          return (
            <span className="inline-flex items-center gap-2">
              <ItemIcon className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
              {row.original.name}
            </span>
          );
        },
      },
      {
        accessorKey: 'type',
        header: 'Tipe',
        cell: ({ row }) => TYPE_LABELS[row.original.type],
        enableSorting: false,
      },
      {
        accessorKey: 'size',
        header: 'Ukuran',
        cell: ({ row }) => formatSize(row.original.size),
      },
      {
        accessorKey: 'updatedAt',
        header: 'Tanggal',
        cell: ({ row }) => formatDate(row.original.updatedAt),
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [currentSelected, visibleItems]
  );

  // useDataTable di level pattern agar state sortir tetap hidup saat
  // pengguna menukar list <-> grid (AC-01/AC-04).
  const { table } = useDataTable<FileItem, unknown>({
    columns,
    data: visibleItems,
    enableSorting: true,
    enableColumnVisibility: false,
    pagination: { show: false },
    getRowId: (row: FileItem) => row.id,
  });

  const sortedItems = React.useMemo(
    () => table.getRowModel().rows.map((row) => row.original),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [table, visibleItems, columns]
  );

  const bulkActions = [
    {
      id: 'download',
      label: 'Unduh',
      icon: Download,
      onClick: () => onDownload?.(selectedItems),
    },
    {
      id: 'move',
      label: 'Pindah',
      icon: FolderInput,
      onClick: () => onMove?.(selectedItems, activeFolderId),
    },
    {
      id: 'delete',
      label: 'Hapus',
      icon: Trash2,
      variant: 'destructive' as const,
      onClick: () => onDelete?.(selectedItems),
    },
  ];

  const renderContextMenu = (item: FileItem) => (
    <ContextMenuContent aria-label={`Aksi ${item.name}`}>
      <ContextMenuItem onSelect={() => onPreview?.(item)}>
        <Eye className="mr-2 h-4 w-4" aria-hidden="true" />
        Buka / Pratinjau
      </ContextMenuItem>
      <ContextMenuItem onSelect={() => onDownload?.([item])}>
        <Download className="mr-2 h-4 w-4" aria-hidden="true" />
        Unduh
      </ContextMenuItem>
      <ContextMenuItem onSelect={() => onRename?.(item, item.name)}>
        <Pencil className="mr-2 h-4 w-4" aria-hidden="true" />
        Ganti nama
      </ContextMenuItem>
      <ContextMenuItem onSelect={() => onMove?.([item], activeFolderId)}>
        <FolderInput className="mr-2 h-4 w-4" aria-hidden="true" />
        Pindah
      </ContextMenuItem>
      <ContextMenuItem variant="destructive" onSelect={() => onDelete?.([item])}>
        <Trash2 className="mr-2 h-4 w-4" aria-hidden="true" />
        Hapus
      </ContextMenuItem>
      <ContextMenuItem
        onSelect={() => {
          // Detail ditampilkan panel konteks (002-03); memilih item
          // membuatnya menjadi item fokus panel tersebut.
          setSelection([item.id]);
        }}
      >
        <Info className="mr-2 h-4 w-4" aria-hidden="true" />
        Detail
      </ContextMenuItem>
    </ContextMenuContent>
  );

  const sidebarBody = loading ? (
    <div aria-busy="true" className="space-y-2 p-2">
      {[0, 1, 2, 3].map((i) => (
        <Skeleton key={i} className="h-6 w-full" />
      ))}
      <span className="sr-only">Memuat folder…</span>
    </div>
  ) : error ? (
    <div role="alert" className="space-y-3 p-4">
      <p className="text-sm text-destructive">{error}</p>
      <Button size="sm" variant="outline" onClick={onRetry}>
        Coba lagi
      </Button>
    </div>
  ) : folders.length === 0 ? (
    <div className="space-y-3 p-4">
      <p className="text-sm text-muted-foreground">Belum ada folder.</p>
      <Button size="sm" variant="outline">
        <FolderPlus className="h-4 w-4" />
        Folder baru
      </Button>
    </div>
  ) : (
    <TreeView
      nodes={treeNodes}
      expandedIds={expandedIds}
      onExpandedChange={setExpandedIds}
      selectedId={activeFolderId}
      onSelect={handleSelect}
      ariaLabel="Folder"
      className="border-0 bg-transparent p-1"
    />
  );

  const contentBody = contentSlot ?? (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <h2 className="text-sm font-semibold">{activeFolder?.name ?? 'Folder'}</h2>
        <div className="ml-auto flex items-center gap-2" role="group" aria-label="Mode tampilan">
          <Button
            size="icon"
            variant={currentView === 'list' ? 'default' : 'ghost'}
            className="h-8 w-8"
            aria-label="Tampilan list"
            aria-pressed={currentView === 'list'}
            onClick={() => setView('list')}
          >
            <List className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant={currentView === 'grid' ? 'default' : 'ghost'}
            className="h-8 w-8"
            aria-label="Tampilan grid"
            aria-pressed={currentView === 'grid'}
            onClick={() => setView('grid')}
          >
            <LayoutGrid className="h-4 w-4" />
          </Button>
          {currentView === 'list' && (
            <Select
              value={filterType}
              onValueChange={(value) => setFilterType(value as 'all' | FileItemType)}
            >
              <SelectTrigger aria-label="Filter tipe file" className="h-8 w-36">
                <SelectValue placeholder="Semua tipe" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua tipe</SelectItem>
                <SelectItem value="image">Gambar</SelectItem>
                <SelectItem value="pdf">PDF</SelectItem>
                <SelectItem value="video">Video</SelectItem>
                <SelectItem value="audio">Audio</SelectItem>
                <SelectItem value="other">Lainnya</SelectItem>
              </SelectContent>
            </Select>
          )}
        </div>
      </div>

      <p aria-live="polite" className="sr-only">
        {currentSelected.length > 0 ? `${currentSelected.length} item dipilih` : ''}
      </p>

      {loading ? (
        <div aria-busy="true" className="space-y-3">
          <span className="sr-only">Memuat konten…</span>
          {currentView === 'list' ? (
            <div className="space-y-2">
              {[0, 1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-9 w-full" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-28 w-full" />
              ))}
            </div>
          )}
        </div>
      ) : error ? (
        <div role="alert" className="space-y-3 rounded-xl border border-destructive/40 bg-destructive/5 p-6 text-center">
          <p className="text-sm text-destructive">{error}</p>
          <Button size="sm" variant="outline" onClick={onRetry}>
            Coba lagi
          </Button>
        </div>
      ) : activeItems.length === 0 ? (
        <EmptyState
          icon={FolderOpen}
          title="Folder kosong"
          description="Folder ini belum berisi file. Unggah file pertama atau buat folder baru untuk mulai."
          actionLabel="Upload"
          // Upload compose diisi pada 002-03 (panel konteks); di sini CTA
          // disediakan agar empty state lengkap dan terjangkau keyboard.
          secondaryActionLabel="Folder baru"
          onSecondaryAction={() => onCreateFolder?.(activeFolderId, 'Folder baru')}
        />
      ) : currentView === 'list' ? (
        <div className="rounded-md border border-border">
          <Table>
            <DataTableHeader table={table} enableSorting />
            <TableBody>
              {table.getRowModel().rows.map((row) => {
                const item = row.original;
                const index = sortedItems.findIndex((i) => i.id === item.id);
                const isSelected = currentSelected.includes(item.id);
                return (
                  <ContextMenu key={item.id}>
                    <ContextMenuTrigger asChild>
                      <TableRow
                        tabIndex={0}
                        data-state={isSelected ? 'selected' : undefined}
                        aria-selected={isSelected}
                        onClick={(event) => handleItemClick(event, item, index)}
                        onKeyDown={(event) => handleItemKeyDown(event, item, index)}
                        className="cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        {row.getVisibleCells().map((cell) => (
                          <TableCell key={cell.id}>
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </TableCell>
                        ))}
                      </TableRow>
                    </ContextMenuTrigger>
                    {renderContextMenu(item)}
                  </ContextMenu>
                );
              })}
            </TableBody>
          </Table>
        </div>
      ) : (
        <ul role="listbox" aria-multiselectable="true" aria-label="Konten folder (grid)" className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {sortedItems.map((item, index) => {
            const ItemIcon = TYPE_ICONS[item.type];
            const isSelected = currentSelected.includes(item.id);
            return (
              <ContextMenu key={item.id}>
                <ContextMenuTrigger asChild>
                  <li
                    role="option"
                    tabIndex={0}
                    aria-selected={isSelected}
                    aria-posinset={index + 1}
                    aria-setsize={sortedItems.length}
                    data-state={isSelected ? 'selected' : undefined}
                    onClick={(event) => handleItemClick(event, item, index)}
                    onKeyDown={(event) => handleItemKeyDown(event, item, index)}
                    className="cursor-pointer rounded-lg border border-border bg-card p-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring data-[state=selected]:border-primary data-[state=selected]:ring-1 data-[state=selected]:ring-primary"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="flex h-16 w-full items-center justify-center overflow-hidden rounded-md bg-muted">
                        {item.thumbnailUrl ? (
                          <img src={item.thumbnailUrl} alt="" className="h-full w-full object-cover" />
                        ) : (
                          <ItemIcon className="h-8 w-8 text-muted-foreground" aria-hidden="true" />
                        )}
                      </span>
                      <Checkbox
                        aria-label={`Pilih ${item.name}`}
                        checked={isSelected}
                        onCheckedChange={() => toggleItem(item, 'additive', index)}
                      />
                    </div>
                    <p className="mt-2 truncate text-sm font-medium">{item.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {TYPE_LABELS[item.type]} · {formatSize(item.size)} · {formatDate(item.updatedAt)}
                    </p>
                  </li>
                </ContextMenuTrigger>
                {renderContextMenu(item)}
              </ContextMenu>
            );
          })}
        </ul>
      )}

      <BulkActionBar
        open={currentSelected.length > 0 && !loading && !error}
        count={currentSelected.length}
        actions={bulkActions}
        onClearSelection={() => setSelection([])}
        label={(n) => `${n} item dipilih`}
      />
    </div>
  );

  return (
    <div className={cn('flex flex-col overflow-hidden rounded-xl border border-border bg-card', className)}>
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2 border-b border-border bg-muted/40 px-3 py-2">
        <Button
          size="icon"
          variant="ghost"
          className="h-8 w-8 lg:hidden"
          aria-label="Buka daftar folder"
          onClick={() => setSidebarOpen(true)}
        >
          <PanelLeft className="h-4 w-4" />
        </Button>
        <Breadcrumb aria-label="Breadcrumb">
          <BreadcrumbList>
            {path.map((folder, i) => {
              const isLast = i === path.length - 1;
              return (
                <React.Fragment key={folder.id}>
                  {i > 0 && <BreadcrumbSeparator />}
                  <BreadcrumbItem>
                    {isLast ? (
                      <BreadcrumbPage>{folder.name}</BreadcrumbPage>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleSelect(folder.id)}
                        className="transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
                      >
                        {folder.name}
                      </button>
                    )}
                  </BreadcrumbItem>
                </React.Fragment>
              );
            })}
          </BreadcrumbList>
        </Breadcrumb>
        <div className="ml-auto flex items-center gap-2">
          <div className="relative hidden sm:block">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Cari di folder ini" aria-label="Cari di folder ini" className="h-8 w-44 pl-8" />
          </div>
          <Button size="sm" variant="outline" className="hidden sm:inline-flex">
            <Upload className="h-4 w-4" />
            Upload
          </Button>
          <Button size="sm" variant="outline" className="hidden sm:inline-flex">
            <FolderPlus className="h-4 w-4" />
            Folder baru
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8 lg:hidden"
            aria-label="Buka panel konteks"
            onClick={() => setContextOpen(true)}
          >
            <PanelRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Three zones */}
      <div className="flex min-h-0 flex-col lg:h-[480px] lg:flex-row">
        <aside aria-label="Sidebar folder" className="hidden w-60 shrink-0 border-r border-border bg-muted/20 lg:block">
          {sidebarBody}
        </aside>

        <main aria-label="Konten folder" className="min-w-0 flex-1 bg-background p-4">
          {contentBody}
        </main>

        <aside aria-label="Panel konteks" className="hidden w-80 shrink-0 border-l border-border bg-muted/20 lg:block">
          {contextSlot ?? (
            <p className="p-4 text-sm text-muted-foreground">
              Panel konteks (upload, quota, detail) diisi pada story 002-03.
            </p>
          )}
        </aside>
      </div>

      {/* Mobile/tablet drawer: sidebar */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent side="left" className="p-0 sm:max-w-sm lg:hidden">
          <SheetTitle className="sr-only">Daftar folder</SheetTitle>
          <div className="border-b border-border px-4 py-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Folder</span>
          </div>
          {sidebarBody}
        </SheetContent>
      </Sheet>

      {/* Tablet/mobile sheet: context panel */}
      <Sheet open={contextOpen} onOpenChange={setContextOpen}>
        <SheetContent side="right" className="p-0 sm:max-w-sm lg:hidden">
          <SheetTitle className="sr-only">Panel konteks</SheetTitle>
          <div className="border-b border-border px-4 py-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Panel konteks</span>
          </div>
          {contextSlot ?? (
            <p className="p-4 text-sm text-muted-foreground">
              Panel konteks (upload, quota, detail) diisi pada story 002-03.
            </p>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
