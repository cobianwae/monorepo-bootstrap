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
import { Progress } from '../base/progress';
import { Skeleton } from '../base/skeleton';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../feedback/dialog';
import { Label } from '../base/label';
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
import { FileUpload, type UploadHandler, type UploadQueueItem } from '../form/file-upload';

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
  /** Tampilkan skeleton pada indikator quota (state panel §6). */
  quotaLoading?: boolean;
  /** Pesan ringan bila quota gagal dimuat; tidak memblokir konten. */
  quotaError?: string | null;
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

function formatDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const rest = Math.round(seconds % 60);
  return `${minutes}:${String(rest).padStart(2, '0')}`;
}

function inferItemType(file: File): FileItemType {
  if (file.type.startsWith('image/')) return 'image';
  if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) return 'pdf';
  if (file.type.startsWith('video/')) return 'video';
  if (file.type.startsWith('audio/')) return 'audio';
  return 'other';
}

function toFileItem(queueItem: UploadQueueItem, folderId: string): FileItem {
  const { file, previewUrl } = queueItem;
  return {
    id: `uploaded-${file.name}-${file.size}-${file.lastModified}`,
    folderId,
    name: file.name,
    type: inferItemType(file),
    size: file.size,
    updatedAt: new Date().toISOString(),
    previewUrl,
  };
}

/** Breakpoint `lg` (1024px) — preview sheet di desktop, dialog di bawahnya. */
function useIsDesktop(): boolean {
  const [isDesktop, setIsDesktop] = React.useState(false);
  React.useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return;
    const query = window.matchMedia('(min-width: 1024px)');
    setIsDesktop(query.matches);
    const listener = (event: MediaQueryListEvent) => setIsDesktop(event.matches);
    query.addEventListener('change', listener);
    return () => query.removeEventListener('change', listener);
  }, []);
  return isDesktop;
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
  quota,
  quotaLoading = false,
  quotaError = null,
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
  uploadHandler,
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
  const [uploadedItems, setUploadedItems] = React.useState<FileItem[]>([]);
  const [previewItem, setPreviewItem] = React.useState<FileItem | null>(null);
  const [previewFailed, setPreviewFailed] = React.useState(false);
  const previewTriggerRef = React.useRef<HTMLElement | null>(null);
  // Dialog kelola M-002 (rename / folder baru) dan M-003 (hapus / pindah).
  const [renameTarget, setRenameTarget] = React.useState<FileItem | null>(null);
  const [renameValue, setRenameValue] = React.useState('');
  const [renameError, setRenameError] = React.useState<string | null>(null);
  const [newFolderParent, setNewFolderParent] = React.useState<{ parentId: string | null } | null>(null);
  const [newFolderValue, setNewFolderValue] = React.useState('');
  const [newFolderError, setNewFolderError] = React.useState<string | null>(null);
  const [confirmAction, setConfirmAction] = React.useState<{
    kind: 'delete' | 'move';
    items: FileItem[];
  } | null>(null);
  const [moveTargetId, setMoveTargetId] = React.useState('');
  const manageTriggerRef = React.useRef<HTMLElement | null>(null);
  const isDesktop = useIsDesktop();
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
  const activeFolderIdRef = React.useRef(activeFolderId);
  React.useEffect(() => {
    activeFolderIdRef.current = activeFolderId;
  }, [activeFolderId]);

  // File yang selesai diunggah masuk ke folder aktif (FR-006) tanpa
  // meminta konsumen mengubah prop `items`; item dari konsumen tetap
  // menjadi sumber kebenaran bila id-nya bentrok.
  const allItems = React.useMemo(
    () => [...items, ...uploadedItems.filter((u) => !items.some((i) => i.id === u.id))],
    [items, uploadedItems]
  );
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
  const activeItems = allItems.filter((item) => item.folderId === activeFolderId);
  const visibleItems = React.useMemo(
    () => (filterType === 'all' ? activeItems : activeItems.filter((i) => i.type === filterType)),
    // activeItems is derived each render; depend on its inputs instead.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [allItems, activeFolderId, filterType]
  );

  const selectedItems = React.useMemo(
    () => visibleItems.filter((i) => currentSelected.includes(i.id)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [allItems, activeFolderId, filterType, currentSelected]
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

  const openPreview = (item: FileItem, trigger?: HTMLElement | null) => {
    previewTriggerRef.current = trigger ?? (document.activeElement as HTMLElement | null);
    setPreviewFailed(false);
    setPreviewItem(item);
    onPreview?.(item);
  };

  const closePreview = () => {
    setPreviewItem(null);
    // Radix mengembalikan fokus ke pemicu hanya bila memakai Trigger;
    // karena dibuka programatik, kembalikan fokus secara manual (AC-02).
    previewTriggerRef.current?.focus?.();
    previewTriggerRef.current = null;
  };

  // --- Dialog kelola (M-002 / M-003) -------------------------------------
  // Pattern murni memanggil handler konsumen; tidak memutasi data sendiri
  // (design §3). Fokus dialog dikembalikan ke pemicu saat ditutup.

  const captureManageTrigger = () => {
    manageTriggerRef.current = document.activeElement as HTMLElement | null;
  };

  const closeManage = () => {
    setRenameTarget(null);
    setNewFolderParent(null);
    setConfirmAction(null);
    setMoveTargetId('');
    // Tunda ke frame berikutnya: cleanup focus Radix (FocusScope) berjalan
    // saat unmount dan akan menimpa fokus sinkron ke body.
    const trigger = manageTriggerRef.current;
    manageTriggerRef.current = null;
    requestAnimationFrame(() => trigger?.focus?.());
  };

  const openRename = (item: FileItem) => {
    captureManageTrigger();
    setRenameTarget(item);
    setRenameValue(item.name);
    setRenameError(null);
  };

  const openCreateFolder = (parentId: string | null) => {
    captureManageTrigger();
    setNewFolderParent({ parentId });
    setNewFolderValue('');
    setNewFolderError(null);
  };

  const openConfirm = (kind: 'delete' | 'move', targetItems: FileItem[]) => {
    captureManageTrigger();
    setMoveTargetId('');
    setConfirmAction({ kind, items: targetItems });
  };

  const submitRename = (event: React.FormEvent) => {
    event.preventDefault();
    if (!renameTarget) return;
    const next = renameValue.trim();
    if (!next) {
      setRenameError('Nama tidak boleh kosong.');
      return;
    }
    const duplicate = allItems.some(
      (item) =>
        item.folderId === renameTarget.folderId &&
        item.id !== renameTarget.id &&
        item.name.toLowerCase() === next.toLowerCase()
    );
    if (duplicate) {
      setRenameError('Nama sudah dipakai file lain di folder ini.');
      return;
    }
    onRename?.(renameTarget, next);
    closeManage();
  };

  const submitCreateFolder = (event: React.FormEvent) => {
    event.preventDefault();
    if (!newFolderParent) return;
    const next = newFolderValue.trim();
    if (!next) {
      setNewFolderError('Nama tidak boleh kosong.');
      return;
    }
    const duplicate = folders.some(
      (folder) =>
        folder.parentId === newFolderParent.parentId &&
        folder.name.toLowerCase() === next.toLowerCase()
    );
    if (duplicate) {
      setNewFolderError('Nama sudah dipakai folder lain di folder ini.');
      return;
    }
    // Kontrak publik memakai string; '' menandakan folder root (parentId null).
    onCreateFolder?.(newFolderParent.parentId ?? '', next);
    closeManage();
  };

  const submitConfirm = () => {
    if (!confirmAction) return;
    if (confirmAction.kind === 'delete') {
      onDelete?.(confirmAction.items);
    } else {
      if (!moveTargetId) return;
      onMove?.(confirmAction.items, moveTargetId);
    }
    setSelection([]);
    closeManage();
  };

  const handleUploadDone = (doneItems: UploadQueueItem[]) => {
    const folderId = activeFolderIdRef.current;
    const fresh = doneItems
      .filter((queueItem) => queueItem.status === 'done')
      .map((queueItem) => toFileItem(queueItem, folderId));
    if (fresh.length > 0) {
      setUploadedItems((prev) => [
        ...prev,
        ...fresh.filter((f) => !prev.some((p) => p.id === f.id)),
      ]);
    }
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

  const handleItemKeyDown = (event: React.KeyboardEvent, item: FileItem, index: number) => {
    // Enter pada baris/item membuka preview (AC-02); abaikan bila fokus
    // sedang pada kontrol di dalam baris (checkbox/dll).
    if (event.key === 'Enter') {
      if ((event.target as HTMLElement).closest('button, a, input, [role="checkbox"], [role="menuitem"]')) {
        return;
      }
      event.preventDefault();
      openPreview(item, event.currentTarget as HTMLElement);
      return;
    }
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

  // Quota tiga level (FR-008): normal → primary, ≥80% → warning, penuh → destructive.
  const quotaPercent = quota && quota.total > 0 ? Math.min(100, (quota.used / quota.total) * 100) : 0;
  const quotaLevel = !quota
    ? 'hidden'
    : quota.used >= quota.total
      ? 'full'
      : quotaPercent >= 80
        ? 'warning'
        : 'normal';
  const quotaIndicatorClass =
    quotaLevel === 'warning' ? 'bg-warning' : quotaLevel === 'full' ? 'bg-destructive' : 'bg-primary';
  const quotaMessageClass =
    quotaLevel === 'warning' ? 'text-warning-text' : quotaLevel === 'full' ? 'text-destructive' : 'text-muted-foreground';
  const quotaMessage =
    quotaLevel === 'warning'
      ? 'Hampir penuh — pertimbangkan menghapus file yang tidak lagi diperlukan.'
      : quotaLevel === 'full'
        ? 'Penyimpanan penuh — hapus file untuk dapat mengunggah lagi.'
        : 'Kapasitas masih cukup.';

  const detailItem = selectedItems[0] ?? null;

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
      onClick: () => openConfirm('move', selectedItems),
    },
    {
      id: 'delete',
      label: 'Hapus',
      icon: Trash2,
      variant: 'destructive' as const,
      onClick: () => openConfirm('delete', selectedItems),
    },
  ];

  const renderContextMenu = (item: FileItem) => (
    <ContextMenuContent aria-label={`Aksi ${item.name}`}>
      <ContextMenuItem onSelect={() => openPreview(item)}>
        <Eye className="mr-2 h-4 w-4" aria-hidden="true" />
        Buka / Pratinjau
      </ContextMenuItem>
      <ContextMenuItem onSelect={() => onDownload?.([item])}>
        <Download className="mr-2 h-4 w-4" aria-hidden="true" />
        Unduh
      </ContextMenuItem>
      <ContextMenuItem onSelect={() => openRename(item)}>
        <Pencil className="mr-2 h-4 w-4" aria-hidden="true" />
        Ganti nama
      </ContextMenuItem>
      <ContextMenuItem onSelect={() => openConfirm('move', [item])}>
        <FolderInput className="mr-2 h-4 w-4" aria-hidden="true" />
        Pindah
      </ContextMenuItem>
      <ContextMenuItem variant="destructive" onSelect={() => openConfirm('delete', [item])}>
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
      <Button size="sm" variant="outline" onClick={() => openCreateFolder(null)}>
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
          // Upload compose tersedia di panel konteks (S-005.27.02); CTA di
          // sini membuka panel tersebut di mobile/tablet.
          onAction={() => setContextOpen(true)}
          secondaryActionLabel="Folder baru"
          onSecondaryAction={() => openCreateFolder(activeFolderId || null)}
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

  const contextPanel = (
    <div className="space-y-5 overflow-y-auto p-4">
      <section aria-label="Upload" className="space-y-2">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Upload</h3>
        {uploadHandler ? (
          <FileUpload
            variant="compact"
            uploadHandler={uploadHandler}
            onAllDone={handleUploadDone}
            helperText={`Unggah ke folder ${activeFolder?.name ?? activeFolderId}.`}
          />
        ) : (
          <p className="text-sm text-muted-foreground">Upload tidak tersedia pada pattern ini.</p>
        )}
      </section>

      {quotaLevel !== 'hidden' && (
        <section aria-label="Kuota penyimpanan" className="space-y-2">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Kuota penyimpanan</h3>
          {quotaLoading ? (
            <div aria-busy="true" className="space-y-2">
              <Skeleton className="h-2 w-full" />
              <span className="sr-only">Memuat kuota…</span>
            </div>
          ) : quotaError ? (
            <p role="status" className="text-sm text-destructive">{quotaError}</p>
          ) : quota ? (
            <>
              <dl className="grid grid-cols-3 gap-2 text-sm">
                <div>
                  <dt className="text-xs text-muted-foreground">Total</dt>
                  <dd className="font-medium">{formatSize(quota.total)}</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">Terpakai</dt>
                  <dd className="font-medium">{formatSize(quota.used)}</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">Sisa</dt>
                  <dd className="font-medium">{formatSize(Math.max(0, quota.total - quota.used))}</dd>
                </div>
              </dl>
              <Progress
                value={quotaPercent}
                indicatorClassName={quotaIndicatorClass}
                aria-label={`Kuota penyimpanan ${Math.round(quotaPercent)} persen terpakai`}
              />
              <p className={cn('text-sm', quotaMessageClass)}>{quotaMessage}</p>
            </>
          ) : null}
        </section>
      )}

      <section aria-label="Detail item" className="space-y-2">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Detail item</h3>
        {detailItem ? (
          <dl className="space-y-1.5 text-sm">
            <div className="flex justify-between gap-3">
              <dt className="text-muted-foreground">Nama</dt>
              <dd className="text-right font-medium">{detailItem.name}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-muted-foreground">Tipe</dt>
              <dd>{TYPE_LABELS[detailItem.type]}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-muted-foreground">Ukuran</dt>
              <dd>{formatSize(detailItem.size)}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-muted-foreground">Tanggal</dt>
              <dd>{formatDate(detailItem.updatedAt)}</dd>
            </div>
            {detailItem.dimensions && (
              <div className="flex justify-between gap-3">
                <dt className="text-muted-foreground">Dimensi</dt>
                <dd>{detailItem.dimensions}</dd>
              </div>
            )}
            {detailItem.duration !== undefined && (
              <div className="flex justify-between gap-3">
                <dt className="text-muted-foreground">Durasi</dt>
                <dd>{formatDuration(detailItem.duration)}</dd>
              </div>
            )}
          </dl>
        ) : (
          <p className="text-sm text-muted-foreground">Pilih item untuk melihat detailnya di sini.</p>
        )}
      </section>
    </div>
  );

  const previewMedia = (() => {
    if (!previewItem) return null;
    const src = previewItem.previewUrl;
    const fallback = (
      <div className="flex flex-col items-center justify-center gap-3 rounded-lg bg-muted p-8 text-center">
        <FileIcon className="h-10 w-10 text-muted-foreground" aria-hidden="true" />
        <p className="text-sm text-muted-foreground">
          Pratinjau tidak tersedia untuk tipe file ini. Unduh untuk melihat isinya.
        </p>
      </div>
    );
    if (previewFailed || !src) return fallback;
    switch (previewItem.type) {
      case 'image':
        return (
          <img
            src={src}
            alt={previewItem.name}
            className="max-h-[50vh] w-full rounded-lg object-contain"
            onError={() => setPreviewFailed(true)}
          />
        );
      case 'video':
        return (
          <video
            src={src}
            controls
            title={previewItem.name}
            className="max-h-[50vh] w-full rounded-lg"
            onError={() => setPreviewFailed(true)}
          />
        );
      case 'audio':
        return (
          <audio
            src={src}
            controls
            title={previewItem.name}
            className="w-full"
            onError={() => setPreviewFailed(true)}
          />
        );
      case 'pdf':
        // sandbox tanpa script: dokumen tidak dapat menjalankan JavaScript (D5).
        return (
          <iframe
            src={src}
            title={previewItem.name}
            sandbox=""
            className="h-[50vh] w-full rounded-lg border border-border"
          />
        );
      default:
        return fallback;
    }
  })();

  const previewBody = previewItem ? (
    <div className="space-y-4">
      {previewMedia}
      <dl className="space-y-1.5 text-sm">
        <div className="flex justify-between gap-3">
          <dt className="text-muted-foreground">Nama</dt>
          <dd className="text-right font-medium">{previewItem.name}</dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt className="text-muted-foreground">Tipe</dt>
          <dd>{TYPE_LABELS[previewItem.type]}</dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt className="text-muted-foreground">Ukuran</dt>
          <dd>{formatSize(previewItem.size)}</dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt className="text-muted-foreground">Tanggal</dt>
          <dd>{formatDate(previewItem.updatedAt)}</dd>
        </div>
        {previewItem.dimensions && (
          <div className="flex justify-between gap-3">
            <dt className="text-muted-foreground">Dimensi</dt>
            <dd>{previewItem.dimensions}</dd>
          </div>
        )}
        {previewItem.duration !== undefined && (
          <div className="flex justify-between gap-3">
            <dt className="text-muted-foreground">Durasi</dt>
            <dd>{formatDuration(previewItem.duration)}</dd>
          </div>
        )}
      </dl>
      <div className="flex flex-wrap gap-2">
        {previewItem.previewUrl ? (
          <Button asChild size="sm">
            <a href={previewItem.previewUrl} download={previewItem.name}>
              <Download className="mr-2 h-4 w-4" aria-hidden="true" />
              Unduh
            </a>
          </Button>
        ) : (
          <Button size="sm" onClick={() => onDownload?.([previewItem])}>
            <Download className="mr-2 h-4 w-4" aria-hidden="true" />
            Unduh
          </Button>
        )}
      </div>
    </div>
  ) : null;

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
                        className="transition-colors motion-reduce:transition-none hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
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
          <Button size="sm" variant="outline" className="hidden sm:inline-flex" onClick={() => setContextOpen(true)}>
            <Upload className="h-4 w-4" />
            Upload
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="hidden sm:inline-flex"
            onClick={() => openCreateFolder(activeFolderId || null)}
          >
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
          {contextSlot ?? contextPanel}
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
          {contextSlot ?? contextPanel}
        </SheetContent>
      </Sheet>

      {/* Preview M-001: sheet di desktop, dialog full-screen di mobile (D2) */}
      {isDesktop ? (
        <Sheet
          open={previewItem !== null}
          onOpenChange={(open) => {
            if (!open) closePreview();
          }}
        >
          <SheetContent side="right" className="overflow-y-auto sm:max-w-md">
            <SheetTitle>{previewItem?.name ?? 'Pratinjau'}</SheetTitle>
            {previewBody}
          </SheetContent>
        </Sheet>
      ) : (
        <Dialog
          open={previewItem !== null}
          onOpenChange={(open) => {
            if (!open) closePreview();
          }}
        >
          <DialogContent className="max-h-[100dvh] w-full max-w-none overflow-y-auto rounded-none sm:rounded-none">
            <DialogTitle>{previewItem?.name ?? 'Pratinjau'}</DialogTitle>
            {previewBody}
          </DialogContent>
        </Dialog>
      )}

      {/* M-002: rename / folder baru + validasi nama (FR-013) */}
      <Dialog
        open={renameTarget !== null || newFolderParent !== null}
        onOpenChange={(open) => {
          if (!open) closeManage();
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{renameTarget ? 'Ganti nama' : 'Folder baru'}</DialogTitle>
            <DialogDescription>
              {renameTarget
                ? `Nama baru untuk ${renameTarget.name}. Nama harus unik di folder ini.`
                : 'Buat folder baru di folder aktif. Nama harus unik di folder ini.'}
            </DialogDescription>
          </DialogHeader>
          <form
            className="space-y-3"
            onSubmit={renameTarget ? submitRename : submitCreateFolder}
            noValidate
          >
            <div className="space-y-1.5">
              <Label htmlFor="file-manager-name-input">Nama</Label>
              <Input
                id="file-manager-name-input"
                value={renameTarget ? renameValue : newFolderValue}
                onChange={(event) => {
                  if (renameTarget) {
                    setRenameValue(event.target.value);
                    setRenameError(null);
                  } else {
                    setNewFolderValue(event.target.value);
                    setNewFolderError(null);
                  }
                }}
                aria-invalid={Boolean(renameTarget ? renameError : newFolderError)}
                aria-describedby={
                  renameTarget ? (renameError ? 'file-manager-name-error' : undefined) : newFolderError ? 'file-manager-name-error' : undefined
                }
              />
              {(renameTarget ? renameError : newFolderError) && (
                <p id="file-manager-name-error" role="alert" className="text-sm text-destructive">
                  {renameTarget ? renameError : newFolderError}
                </p>
              )}
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={closeManage}>
                Batal
              </Button>
              <Button type="submit">{renameTarget ? 'Simpan' : 'Buat folder'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* M-003: konfirmasi hapus / pilih folder tujuan move (FR-004/FR-005) */}
      <Dialog
        open={confirmAction !== null}
        onOpenChange={(open) => {
          if (!open) closeManage();
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {confirmAction?.kind === 'delete'
                ? `Hapus ${confirmAction.items.length} item?`
                : `Pindah ${confirmAction?.items.length ?? 0} item ke folder…`}
            </DialogTitle>
            <DialogDescription>
              {confirmAction?.kind === 'delete'
                ? 'Item yang dihapus tidak dapat dikembalikan. Tindakan ini meminta konfirmasi sebelum handler dipanggil.'
                : 'Pilih folder tujuan. Item akan dipindahkan setelah Anda mengonfirmasi.'}
            </DialogDescription>
          </DialogHeader>
          {confirmAction && (
            <ul className="max-h-40 space-y-1 overflow-y-auto rounded-md border border-border p-2 text-sm">
              {confirmAction.items.map((item) => (
                <li key={item.id} className="truncate">
                  {item.name}
                </li>
              ))}
            </ul>
          )}
          {confirmAction?.kind === 'move' && (
            <div className="space-y-1.5" role="radiogroup" aria-label="Folder tujuan">
              {folders
                .filter((folder) => folder.id !== confirmAction.items[0]?.folderId)
                .map((folder) => {
                  const depth = ancestorIds(folders, folder.id).length;
                  return (
                    <label
                      key={folder.id}
                      className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-muted"
                      style={{ paddingLeft: `${depth * 16 + 8}px` }}
                    >
                      <input
                        type="radio"
                        name="file-manager-move-target"
                        value={folder.id}
                        checked={moveTargetId === folder.id}
                        onChange={() => setMoveTargetId(folder.id)}
                      />
                      <span>{folder.name}</span>
                    </label>
                  );
                })}
            </div>
          )}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={closeManage}>
              Batal
            </Button>
            <Button
              type="button"
              variant={confirmAction?.kind === 'delete' ? 'destructive' : 'default'}
              disabled={confirmAction?.kind === 'move' && !moveTargetId}
              onClick={submitConfirm}
            >
              {confirmAction?.kind === 'delete' ? 'Hapus' : 'Pindah'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
