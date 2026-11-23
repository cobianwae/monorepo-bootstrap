'use client';

import * as React from 'react';
import { Sparkles } from 'lucide-react';
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  FileManager,
  PageHeader,
  SegmentedControl,
  SegmentedControlItem,
  toast,
  type FileFolder,
  type FileItem,
  type FileManagerView,
} from '@ds/ui';
import { SectionHeading } from '../../../../components/section-heading';

const folders: FileFolder[] = [
  { id: 'documents', name: 'Documents', parentId: null },
  { id: '2026', name: '2026', parentId: 'documents' },
  { id: 'q4', name: 'Q4', parentId: '2026' },
  { id: 'archive', name: 'Archive', parentId: null },
];

const items: FileItem[] = [
  { id: 'f1', folderId: 'q4', name: 'q4-report.pdf', type: 'pdf', size: 204800, updatedAt: '2026-11-01T00:00:00Z', previewUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf' },
  { id: 'f2', folderId: 'q4', name: 'team-photo.jpg', type: 'image', size: 1048576, updatedAt: '2026-11-02T00:00:00Z', dimensions: '4032x3024', previewUrl: 'https://picsum.photos/seed/foto-tim/800/600' },
  { id: 'f3', folderId: 'q4', name: 'demo-recording.mp4', type: 'video', size: 52428800, updatedAt: '2026-10-15T00:00:00Z', duration: 754, previewUrl: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4' },
  { id: 'f4', folderId: 'q4', name: 'podcast-ep1.mp3', type: 'audio', size: 8388608, updatedAt: '2026-11-03T00:00:00Z', duration: 2145, previewUrl: 'https://interactive-examples.mdn.mozilla.net/media/cc0-audio/t-rex-roar.mp3' },
  { id: 'f5', folderId: '2026', name: 'demo-recording.mp4', type: 'video', size: 52428800, updatedAt: '2026-10-15T00:00:00Z', duration: 754, previewUrl: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4' },
  { id: 'f6', folderId: 'documents', name: 'guidelines.docx', type: 'other', size: 51200, updatedAt: '2026-09-01T00:00:00Z' },
];

const sidebarStates = ['normal', 'loading', 'error'] as const;
type SidebarState = (typeof sidebarStates)[number];

const contentStates = ['normal', 'loading', 'empty', 'error'] as const;
type ContentState = (typeof contentStates)[number];

const quotaLevels = ['normal', 'warning', 'full'] as const;
type QuotaLevel = (typeof quotaLevels)[number];

const quotaByLevel: Record<QuotaLevel, { total: number; used: number }> = {
  normal: { total: 10 * 1024 ** 3, used: 2 * 1024 ** 3 },
  warning: { total: 10 * 1024 ** 3, used: 9 * 1024 ** 3 },
  full: { total: 10 * 1024 ** 3, used: 10 * 1024 ** 3 },
};

const previewTypes = ['image', 'pdf', 'video', 'audio', 'other'] as const;

const mockUploadHandler = async (_file: File, { onProgress }: { onProgress: (n: number) => void }) => {
  onProgress(100);
};

function plural(count: number) {
  return `${count} ${count === 1 ? 'item' : 'items'}`;
}

function toastAction(title: string, description?: string) {
  toast({ variant: 'success', title, description });
}

interface DemoControlProps<T extends string> {
  label: string;
  value: T;
  options: readonly T[];
  onChange: (value: T) => void;
}

/** Satu baris kontrol demo: label + segmented single-select (selalu ada satu nilai terpilih). */
function DemoControl<T extends string>({ label, value, options, onChange }: DemoControlProps<T>) {
  return (
    <div className="space-y-1.5">
      <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</span>
      <div className="max-w-full overflow-x-auto">
        <SegmentedControl
          type="single"
          value={value}
          onValueChange={(next) => {
            if (next) onChange(next as T);
          }}
          aria-label={label}
        >
          {options.map((option) => (
            <SegmentedControlItem key={option} value={option} className="capitalize">
              {option}
            </SegmentedControlItem>
          ))}
        </SegmentedControl>
      </div>
    </div>
  );
}

const onOff = ['off', 'on'] as const;
type OnOff = (typeof onOff)[number];

const accessibilityGroups: { title: string; notes: string[] }[] = [
  {
    title: 'Keyboard',
    notes: [
      'The folder tree uses arrow keys to move and Enter or Space to select.',
      'Context menu opens on right-click, or with the Menu key or Shift+F10 on a focused row.',
      'Select many items with Shift or Ctrl-click and Shift+Arrow.',
      'Tab order: toolbar → sidebar → content → context panel → bulk bar (when visible) → modal.',
    ],
  },
  {
    title: 'Screen reader',
    notes: [
      'Breadcrumb is a labelled nav; every segment is a keyboard-reachable button.',
      'Selection changes are announced through an aria-live polite region.',
      'Loading uses skeletons with aria-busy; errors use role alert with a retry button.',
      'Table headers expose aria-sort; grid view is a listbox with item positions (aria-posinset).',
      'Quota shows used, total, and remaining as text, not only as colour.',
    ],
  },
  {
    title: 'Dialogs & preview',
    notes: [
      'Preview opens with Enter on a row or from the Open / Preview menu item. Focus is trapped, Esc closes, and focus returns to the row.',
      'PDFs render in a script-free sandbox with a download button; unsupported types fall back to a generic card.',
      'Rename and new-folder dialogs validate empty and duplicate names inline.',
      'Delete asks for confirmation and Move asks for a target folder. Cancel closes with no effect, and selection clears after the action.',
    ],
  },
  {
    title: 'Responsive & motion',
    notes: [
      'On mobile the sidebar becomes a drawer and the context panel becomes a sheet; no core function is lost.',
      'View and progress transitions respect prefers-reduced-motion.',
      'All states use semantic tokens, so light and dark stay in parity.',
    ],
  },
];

export default function FileManagerPage() {
  const [folderList, setFolderList] = React.useState<FileFolder[]>(folders);
  const [itemList, setItemList] = React.useState<FileItem[]>(items);
  const [activeFolderId, setActiveFolderId] = React.useState('documents');
  const [sidebarState, setSidebarState] = React.useState<SidebarState>('normal');
  const [contentState, setContentState] = React.useState<ContentState>('normal');
  const [view, setView] = React.useState<FileManagerView>('list');
  const [selectedIds, setSelectedIds] = React.useState<string[]>([]);
  const [treeEmpty, setTreeEmpty] = React.useState<OnOff>('off');
  const [quotaLevel, setQuotaLevel] = React.useState<QuotaLevel>('normal');
  const [quotaLoading, setQuotaLoading] = React.useState<OnOff>('off');
  const [quotaError, setQuotaError] = React.useState<OnOff>('off');

  // Open the preview through the same keyboard path a user would take:
  // focus the item row, then dispatch Enter (the pattern handles the rest).
  const openPreviewFor = (item: FileItem) => {
    setActiveFolderId(item.folderId);
    setSelectedIds([item.id]);
    window.requestAnimationFrame(() => {
      const row = Array.from(document.querySelectorAll('tr')).find((tr) =>
        tr.textContent?.includes(item.name)
      );
      row?.focus();
      row?.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', code: 'Enter', bubbles: true }));
    });
  };

  const folderName = (folderId: string) => folderList.find((f) => f.id === folderId)?.name ?? folderId;

  const handleFolderChange = (folderId: string) => {
    setActiveFolderId(folderId);
    toastAction('Folder changed', `Now viewing ${folderName(folderId)}.`);
  };

  const shownItems = contentState === 'empty' ? [] : itemList;

  // Stateful demo handlers: the pattern only calls handlers,
  // the consumer applies changes to its own data.
  const handleRename = (item: FileItem, nextName: string) => {
    setItemList((prev) => prev.map((i) => (i.id === item.id ? { ...i, name: nextName } : i)));
    toastAction('Item renamed', `${item.name} → ${nextName}`);
  };

  const handleCreateFolder = (parentId: string, name: string) => {
    const id = `new-folder-${folderList.length + 1}`;
    setFolderList((prev) => [...prev, { id, name, parentId: parentId || null }]);
    toastAction('Folder created', name);
  };

  const handleDelete = (selected: FileItem[]) => {
    setItemList((prev) => prev.filter((i) => !selected.some((s) => s.id === i.id)));
    toastAction('Deleted', plural(selected.length));
  };

  const handleMove = (selected: FileItem[], targetFolderId: string) => {
    setItemList((prev) =>
      prev.map((i) => (selected.some((s) => s.id === i.id) ? { ...i, folderId: targetFolderId } : i))
    );
    toastAction(`Moved to ${folderName(targetFolderId)}`, plural(selected.length));
  };

  return (
    <div className="animate-in fade-in-50 space-y-10 duration-200">
      <PageHeader
        eyebrow="UX Recipe"
        eyebrowIcon={Sparkles}
        title="File Manager"
        description="Browse folders, select and manage files in bulk, preview images, PDFs, video, and audio, and track uploads and storage quota in one workspace."
      />

      <section id="demo" aria-labelledby="demo-heading" className="space-y-4 scroll-mt-20">
        <SectionHeading
          id="demo-heading"
          title="Interactive demo"
          description="Use the controls to simulate each state, then interact with the manager below."
        />

        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-base">Simulate states</CardTitle>
            <CardDescription>Switch loading, empty, error, and quota conditions on the fly.</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-x-6 gap-y-4 md:grid-cols-2">
            <DemoControl label="Sidebar" value={sidebarState} options={sidebarStates} onChange={setSidebarState} />
            <DemoControl label="Content" value={contentState} options={contentStates} onChange={setContentState} />
            <DemoControl label="Empty folder tree" value={treeEmpty} options={onOff} onChange={setTreeEmpty} />
            <DemoControl label="Quota level" value={quotaLevel} options={quotaLevels} onChange={setQuotaLevel} />
            <DemoControl label="Quota loading" value={quotaLoading} options={onOff} onChange={setQuotaLoading} />
            <DemoControl label="Quota error" value={quotaError} options={onOff} onChange={setQuotaError} />

            <div className="space-y-1.5 md:col-span-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Open preview
              </span>
              <div className="flex flex-wrap gap-2">
                {previewTypes.map((type) => {
                  const item = itemList.find((i) => i.type === type);
                  if (!item) return null;
                  return (
                    <Button
                      key={type}
                      size="sm"
                      variant="outline"
                      className="capitalize"
                      onClick={() => openPreviewFor(item)}
                    >
                      {type}
                    </Button>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>

        <FileManager
          folders={treeEmpty === 'on' ? [] : folderList}
          items={shownItems}
          activeFolderId={activeFolderId}
          view={view}
          selectedIds={selectedIds}
          loading={sidebarState === 'loading' || contentState === 'loading'}
          error={
            sidebarState === 'error'
              ? "Couldn't load folders. Check your connection and try again."
              : contentState === 'error'
                ? "Couldn't load folder contents. Your selection was cleared."
                : null
          }
          onActiveFolderChange={handleFolderChange}
          onSelectionChange={setSelectedIds}
          onViewChange={setView}
          quota={quotaByLevel[quotaLevel]}
          quotaLoading={quotaLoading === 'on'}
          quotaError={quotaError === 'on' ? "Couldn't load quota. Try again later." : null}
          uploadHandler={mockUploadHandler}
          onPreview={(item) => toastAction('Opened', item.name)}
          onDownload={(selected) => toastAction('Download started', plural(selected.length))}
          onMove={handleMove}
          onDelete={handleDelete}
          onRename={handleRename}
          onCreateFolder={handleCreateFolder}
          onRetry={() => {
            setSidebarState('normal');
            setContentState('normal');
          }}
        />
      </section>

      <section id="accessibility" aria-labelledby="accessibility-heading" className="space-y-4 scroll-mt-20">
        <SectionHeading
          id="accessibility-heading"
          title="Accessibility notes"
          description="What the pattern guarantees for keyboard, assistive technology, and small screens."
        />

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {accessibilityGroups.map((group) => (
            <div key={group.title} className="space-y-2">
              <h3 className="text-xl font-bold font-display text-foreground">{group.title}</h3>
              <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                {group.notes.map((note) => (
                  <li key={note}>{note}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
