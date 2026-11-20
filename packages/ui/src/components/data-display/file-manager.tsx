'use client';

import * as React from 'react';
import { FolderPlus, PanelLeft, PanelRight, Search, Upload } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Button } from '../base/button';
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

export function FileManager({
  folders,
  items,
  activeFolderId,
  loading = false,
  error = null,
  onActiveFolderChange,
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

  const handleSelect = (folderId: string) => {
    onActiveFolderChange?.(folderId);
  };

  const treeNodes = React.useMemo(() => buildTree(folders), [folders]);
  const activeItems = items.filter((item) => item.folderId === activeFolderId);

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
          {contentSlot ?? (
            <div className="space-y-2">
              <h2 className="text-sm font-semibold">{activeFolder?.name ?? 'Folder'}</h2>
              <p className="text-sm text-muted-foreground">
                {activeItems.length} item di folder aktif. Konten list/grid diisi pada story 002-02.
              </p>
              {activeItems.length > 0 && (
                <ul className="space-y-1">
                  {activeItems.map((item) => (
                    <li key={item.id} className="text-sm">
                      {item.name}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
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
