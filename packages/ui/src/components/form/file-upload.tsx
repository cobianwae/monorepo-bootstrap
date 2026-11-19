'use client';

/**
 * FileUpload — antrean upload per file (PRD 001, design D1–D6).
 *
 * Komponen ini mengelola status, progres, dan scheduler konkurensi untuk
 * daftar file. Transport upload sepenuhnya milik konsumen lewat prop
 * `uploadHandler`: komponen tidak pernah memanggil fetch/XHR sendiri.
 *
 * Kontrak penting untuk konsumen:
 * - Handler wajib menghormati `signal` (AbortSignal). Saat user menekan
 *   Batal (atau menghapus item yang sedang uploading), signal di-abort dan
 *   handler diharapkan menghentikan request-nya.
 * - `onProgress(percent)` hanya boleh memajukan progres item (0–100).
 */

import * as React from 'react';
import {
  AlertCircle,
  ArrowDown,
  ArrowUp,
  Ban,
  CheckCircle2,
  File as FileIcon,
  FileText,
  GripVertical,
  Image as ImageIcon,
  Loader2,
  RotateCcw,
  Trash2,
  XCircle,
} from 'lucide-react';
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';
import { Alert, AlertDescription, AlertTitle } from '../feedback/alert';
import { Badge } from '../base/badge';
import { Button } from '../base/button';
import { Progress } from '../base/progress';
import { FileInput } from './file-input';

export type UploadItemStatus = 'queued' | 'uploading' | 'done' | 'error' | 'canceled';

export interface UploadQueueItem {
  id: string;
  file: File;
  status: UploadItemStatus;
  /** 0–100 */
  progress: number;
  /** Alasan spesifik: validasi ATAU kegagalan upload. */
  error?: string;
  /** Object URL untuk item gambar (direvoke saat hapus/unmount). */
  previewUrl?: string;
  attempts: number;
}

export type UploadHandler = (
  file: File,
  context: { onProgress: (percent: number) => void; signal: AbortSignal }
) => Promise<void>;

export interface FileUploadProps extends VariantProps<typeof fileUploadVariants> {
  uploadHandler: UploadHandler;
  /** Controlled opsional; bila tidak diisi komponen mengelola state sendiri. */
  value?: UploadQueueItem[];
  onChange?: (items: UploadQueueItem[]) => void;
  maxFiles?: number;
  /** dalam bytes */
  maxSize?: number;
  accept?: string;
  /** Default 3 (design D3). */
  maxConcurrent?: number;
  /** Auto-retry hingga batas ini pada kegagalan upload (FR-013). Default 0 = tanpa auto-retry. */
  maxRetries?: number;
  /** Urutan antrean dapat diubah via drag + keyboard sensor (FR-011). Default false. */
  sortable?: boolean;
  showThumbnails?: boolean;
  disabled?: boolean;
  onAllDone?: (items: UploadQueueItem[]) => void;
  onItemError?: (item: UploadQueueItem) => void;
  helperText?: string;
  className?: string;
}

export const fileUploadVariants = cva('w-full space-y-3', {
  variants: {
    variant: {
      dropzone: '',
      compact: 'space-y-2',
    },
  },
  defaultVariants: {
    variant: 'dropzone',
  },
});

const STATUS_LABEL: Record<UploadItemStatus, string> = {
  queued: 'Menunggu',
  uploading: 'Mengunggah',
  done: 'Selesai',
  error: 'Gagal',
  canceled: 'Dibatalkan',
};

const STATUS_BADGE_VARIANT: Record<
  UploadItemStatus,
  'outline' | 'default' | 'success' | 'destructive' | 'muted'
> = {
  queued: 'outline',
  uploading: 'default',
  done: 'success',
  error: 'destructive',
  canceled: 'muted',
};

function formatBytes(bytes: number, decimals = 1): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

function matchesAccept(file: File, accept?: string): boolean {
  if (!accept) return true;
  const candidates = accept
    .split(',')
    .map((part) => part.trim().toLowerCase())
    .filter(Boolean);
  if (candidates.length === 0) return true;
  const type = file.type.toLowerCase();
  const name = file.name.toLowerCase();
  return candidates.some((candidate) => {
    if (candidate.startsWith('.')) return name.endsWith(candidate);
    if (candidate.endsWith('/*')) return type.startsWith(candidate.slice(0, -1));
    if (candidate === '*/*') return true;
    return type === candidate;
  });
}

function genericIconFor(file: File) {
  if (file.type.includes('pdf')) return FileText;
  if (file.type.startsWith('image/')) return ImageIcon;
  return FileIcon;
}

export function FileUpload({
  uploadHandler,
  value,
  onChange,
  maxFiles,
  maxSize,
  accept,
  maxConcurrent = 3,
  maxRetries = 0,
  sortable = false,
  showThumbnails = true,
  variant = 'dropzone',
  disabled = false,
  onAllDone,
  onItemError,
  helperText,
  className,
}: FileUploadProps) {
  const [internalItems, setInternalItems] = React.useState<UploadQueueItem[]>(value ?? []);
  const items = value ?? internalItems;

  const idCounter = React.useRef(0);
  const controllers = React.useRef(new Map<string, AbortController>());
  const inFlight = React.useRef(new Set<string>());
  const itemRefs = React.useRef(new Map<string, HTMLLIElement>());
  const prevAllDone = React.useRef(false);
  const [announcedSummary, setAnnouncedSummary] = React.useState('');

  const update = React.useCallback(
    (next: UploadQueueItem[]) => {
      if (value === undefined) setInternalItems(next);
      onChange?.(next);
    },
    [onChange, value]
  );

  // Sinkronkan state internal bila controlled value berubah dari luar.
  React.useEffect(() => {
    if (value !== undefined) setInternalItems(value);
  }, [value]);

  // Revoke semua object URL saat unmount.
  const itemsRef = React.useRef(items);
  React.useEffect(() => {
    itemsRef.current = items;
  }, [items]);
  React.useEffect(() => {
    const controllersSnapshot = controllers.current;
    return () => {
      controllersSnapshot.forEach((controller) => controller.abort());
      itemsRef.current.forEach((item) => {
        if (item.previewUrl) URL.revokeObjectURL(item.previewUrl);
      });
    };
  }, []);

  const doneCount = items.filter((item) => item.status === 'done').length;
  const failedCount = items.filter((item) => item.status === 'error').length;
  const summaryText =
    items.length > 0 ? `${doneCount}/${items.length} selesai · ${failedCount} gagal` : '';

  // Debounced aria-live: umumkan ringkasan, bukan tiap tick progres.
  React.useEffect(() => {
    if (!summaryText) return;
    const timer = window.setTimeout(() => setAnnouncedSummary(summaryText), 300);
    return () => window.clearTimeout(timer);
  }, [summaryText]);

  // onAllDone sekali per transisi ke "semua selesai".
  React.useEffect(() => {
    const allDone = items.length > 0 && items.every((item) => item.status === 'done');
    if (allDone && !prevAllDone.current) onAllDone?.(items);
    prevAllDone.current = allDone;
  }, [items, onAllDone]);

  // Scheduler: tandai queued -> uploading saat slot konkurensi bebas (FIFO).
  React.useEffect(() => {
    const uploadingCount = items.filter((item) => item.status === 'uploading').length;
    const slots = Math.max(0, maxConcurrent - uploadingCount);
    if (slots === 0) return;
    const queued = items.filter((item) => item.status === 'queued').slice(0, slots);
    if (queued.length === 0) return;
    const starting = new Set(queued.map((item) => item.id));
    update(
      items.map((item) =>
        starting.has(item.id) ? { ...item, status: 'uploading' as const } : item
      )
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items, maxConcurrent]);

  // Jalankan handler untuk item uploading yang belum in-flight.
  React.useEffect(() => {
    items.forEach((item) => {
      if (item.status !== 'uploading' || inFlight.current.has(item.id)) return;
      inFlight.current.add(item.id);
      const controller = new AbortController();
      controllers.current.set(item.id, controller);

      const finishError = (reason: unknown) => {
        inFlight.current.delete(item.id);
        controllers.current.delete(item.id);
        if (controller.signal.aborted) return;
        const message =
          reason instanceof Error && reason.message
            ? reason.message
            : `Upload gagal untuk "${item.file.name}".`;
        const latest = itemsRef.current.find((entry) => entry.id === item.id) ?? item;
        // Auto-retry (FR-013): coba ulang otomatis sampai batas maxRetries.
        if (latest.attempts < maxRetries) {
          const retrying: UploadQueueItem = {
            ...latest,
            status: 'queued',
            progress: 0,
            error: undefined,
            attempts: latest.attempts + 1,
          };
          update(itemsRef.current.map((entry) => (entry.id === item.id ? retrying : entry)));
          return;
        }
        const failed: UploadQueueItem = { ...latest, status: 'error', error: message };
        update(itemsRef.current.map((entry) => (entry.id === item.id ? failed : entry)));
        onItemError?.(failed);
      };

      uploadHandler(item.file, {
        onProgress: (percent) => {
          if (controller.signal.aborted) return;
          const clamped = Math.min(100, Math.max(0, percent));
          update(
            itemsRef.current.map((entry) =>
              entry.id === item.id && entry.status === 'uploading'
                ? { ...entry, progress: clamped }
                : entry
            )
          );
        },
        signal: controller.signal,
      })
        .then(() => {
          inFlight.current.delete(item.id);
          controllers.current.delete(item.id);
          if (controller.signal.aborted) return;
          update(
            itemsRef.current.map((entry) =>
              entry.id === item.id
                ? { ...entry, status: 'done' as const, progress: 100, error: undefined }
                : entry
            )
          );
        })
        .catch(finishError);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items, uploadHandler, maxRetries]);

  const handleFilesSelected = (files: File[]) => {
    if (disabled || files.length === 0) return;
    const accepted: UploadQueueItem[] = [];
    let runningTotal = items.length;

    for (const file of files) {
      const id = `upload_${idCounter.current++}`;
      const previewUrl =
        showThumbs && file.type.startsWith('image/')
          ? URL.createObjectURL(file)
          : undefined;

      let error: string | undefined;
      if (maxFiles && runningTotal >= maxFiles) {
        error = `"${file.name}" ditolak: maksimal ${maxFiles} file diizinkan.`;
      } else if (!matchesAccept(file, accept)) {
        error = `"${file.name}" ditolak: tipe file tidak didukung (${file.type || 'tipe tidak dikenal'}).`;
      } else if (maxSize && file.size > maxSize) {
        error = `"${file.name}" ditolak: melebihi ukuran maksimum (${formatBytes(maxSize)}).`;
      }

      if (error) {
        if (previewUrl) URL.revokeObjectURL(previewUrl);
        accepted.push({
          id,
          file,
          status: 'error',
          progress: 0,
          error,
          attempts: 0,
        });
      } else {
        runningTotal += 1;
        accepted.push({
          id,
          file,
          status: 'queued',
          progress: 0,
          previewUrl,
          attempts: 0,
        });
      }
    }

    update([...items, ...accepted]);
  };

  const cancelItem = (id: string) => {
    controllers.current.get(id)?.abort();
    update(
      items.map((item) =>
        item.id === id ? { ...item, status: 'canceled' as const, error: undefined } : item
      )
    );
  };

  const retryItem = (id: string) => {
    update(
      items.map((item) =>
        item.id === id
          ? {
              ...item,
              status: 'queued' as const,
              progress: 0,
              error: undefined,
              attempts: item.attempts + 1,
            }
          : item
      )
    );
  };

  const removeItem = (id: string) => {
    const index = items.findIndex((item) => item.id === id);
    const target = items[index];
    if (!target) return;
    if (target.status === 'uploading') controllers.current.get(id)?.abort();
    inFlight.current.delete(id);
    controllers.current.delete(id);
    if (target.previewUrl) URL.revokeObjectURL(target.previewUrl);
    update(items.filter((item) => item.id !== id));

    // Fokus pindah ke item tetangga (design a11y).
    const neighbor = items[index + 1] ?? items[index - 1];
    if (neighbor) {
      window.setTimeout(() => {
        itemRefs.current.get(neighbor.id)?.querySelector('button')?.focus();
      }, 0);
    }
  };

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) return;
    const oldIndex = itemsRef.current.findIndex((item) => item.id === active.id);
    const newIndex = itemsRef.current.findIndex((item) => item.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;
    update(arrayMove(itemsRef.current, oldIndex, newIndex));
  };

  const moveItem = (id: string, direction: -1 | 1) => {
    const index = itemsRef.current.findIndex((item) => item.id === id);
    const target = index + direction;
    if (index === -1 || target < 0 || target >= itemsRef.current.length) return;
    update(arrayMove(itemsRef.current, index, target));
  };

  const retryAllFailed = () => {
    update(
      itemsRef.current.map((item) =>
        item.status === 'error'
          ? { ...item, status: 'queued' as const, progress: 0, error: undefined, attempts: item.attempts + 1 }
          : item
      )
    );
  };

  const cancelAll = () => {
    itemsRef.current.forEach((item) => {
      if (item.status === 'uploading') controllers.current.get(item.id)?.abort();
    });
    update(
      itemsRef.current.map((item) =>
        item.status === 'uploading' || item.status === 'queued'
          ? { ...item, status: 'canceled' as const, error: undefined }
          : item
      )
    );
  };

  const hasError = items.some((item) => item.status === 'error');
  const hasActive = items.some(
    (item) => item.status === 'queued' || item.status === 'uploading'
  );
  const isCompact = variant === 'compact';
  const showThumbs = isCompact ? false : showThumbnails;

  const allDone = items.length > 0 && items.every((item) => item.status === 'done');

  return (
    <div className={cn(fileUploadVariants({ variant }), className)}>
      <FileInput
        variant={variant}
        accept={accept}
        disabled={disabled}
        showFileList={false}
        helperText={helperText}
        onChange={handleFilesSelected}
      />

      {items.length > 0 && (
        <>
          <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
            <p className="text-muted-foreground">{summaryText}</p>
            <span className="sr-only" aria-live="polite">
              {announcedSummary}
            </span>
            {!disabled && (hasError || hasActive) && (
              <div className="flex items-center gap-1">
                {hasError && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={retryAllFailed}
                    aria-label="Ulang semua file yang gagal"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    Ulang semua yang gagal
                  </Button>
                )}
                {hasActive && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={cancelAll}
                    aria-label="Batalkan semua upload yang sedang berjalan"
                  >
                    <Ban className="h-3.5 w-3.5" />
                    Batal semua
                  </Button>
                )}
              </div>
            )}
          </div>

          {sortable ? (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext items={items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
                <ul className="space-y-2" aria-label="Antrean upload">
                  {items.map((item) => {
              const Icon = genericIconFor(item.file);
              return (
                <SortableQueueItem
                  key={item.id}
                  id={item.id}
                  itemRef={(itemId, node) => {
                    if (node) itemRefs.current.set(itemId, node);
                    else itemRefs.current.delete(itemId);
                  }}
                  className={cn(
                    'flex items-start gap-3 rounded-lg border border-border bg-card',
                    isCompact ? 'px-2 py-1.5' : 'px-3 py-2.5'
                  )}
                >
                  {item.previewUrl && !isCompact ? (
                    <img
                      src={item.previewUrl}
                      alt=""
                      className="h-10 w-10 shrink-0 rounded-md object-cover"
                    />
                  ) : (
                    <div
                      className={cn(
                        'flex shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground',
                        isCompact ? 'h-8 w-8' : 'h-10 w-10'
                      )}
                    >
                      <Icon className={isCompact ? 'h-4 w-4' : 'h-5 w-5'} />
                    </div>
                  )}

                  <div className="min-w-0 flex-1 space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate text-sm font-medium text-foreground">
                        {item.file.name}
                      </p>
                      <Badge variant={STATUS_BADGE_VARIANT[item.status]} size="sm">
                        {STATUS_LABEL[item.status]}
                        {item.status === 'uploading' ? ` ${Math.round(item.progress)}%` : ''}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {formatBytes(item.file.size)}
                      {item.attempts > 0 ? ` · percobaan ${item.attempts + 1}` : ''}
                    </p>

                    {(item.status === 'uploading' || item.status === 'done') && (
                      <Progress
                        value={item.progress}
                        className="h-1.5"
                        aria-label={`Progres upload ${item.file.name}`}
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-valuenow={Math.round(item.progress)}
                      />
                    )}

                    {item.status === 'error' && item.error && (
                      <p role="status" className="flex items-start gap-1.5 text-xs text-destructive">
                        <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                        <span>{item.error}</span>
                      </p>
                    )}

                    {sortable && !disabled && (
                      <div className="flex items-center gap-1">
                        <SortableDragHandle id={item.id} fileName={item.file.name} />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => moveItem(item.id, -1)}
                          aria-label={`Pindahkan ${item.file.name} ke atas`}
                        >
                          <ArrowUp className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => moveItem(item.id, 1)}
                          aria-label={`Pindahkan ${item.file.name} ke bawah`}
                        >
                          <ArrowDown className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    )}

                    <div className="flex items-center gap-1">
                      {item.status === 'uploading' && (
                        <span className="mr-1 text-primary" aria-hidden="true">
                          <Loader2 className="h-4 w-4 animate-spin" />
                        </span>
                      )}
                      {item.status === 'done' && (
                        <span className="mr-1 text-success" aria-hidden="true">
                          <CheckCircle2 className="h-4 w-4" />
                        </span>
                      )}
                      {item.status === 'error' && (
                        <span className="mr-1 text-destructive" aria-hidden="true">
                          <XCircle className="h-4 w-4" />
                        </span>
                      )}
                      {item.status === 'canceled' && (
                        <span className="mr-1 text-muted-foreground" aria-hidden="true">
                          <Ban className="h-4 w-4" />
                        </span>
                      )}

                      {!disabled && item.status === 'uploading' && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => cancelItem(item.id)}
                          aria-label={`Batalkan upload ${item.file.name}`}
                        >
                          Batal
                        </Button>
                      )}
                      {!disabled && (item.status === 'error' || item.status === 'canceled') && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => retryItem(item.id)}
                          aria-label={`Ulangi upload ${item.file.name}`}
                        >
                          <RotateCcw className="h-3.5 w-3.5" />
                          Ulang
                        </Button>
                      )}
                      {!disabled && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeItem(item.id)}
                          aria-label={`Hapus ${item.file.name}`}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          Hapus
                        </Button>
                      )}
                    </div>
                  </div>
                </SortableQueueItem>
              );
            })}
                </ul>
              </SortableContext>
            </DndContext>
          ) : (
            <ul className="space-y-2" aria-label="Antrean upload">
            {items.map((item) => {
              const Icon = genericIconFor(item.file);
              return (
                <li
                  key={item.id}
                  ref={(node) => {
                    if (node) itemRefs.current.set(item.id, node);
                    else itemRefs.current.delete(item.id);
                  }}
                  className={cn(
                    'flex items-start gap-3 rounded-lg border border-border bg-card',
                    isCompact ? 'px-2 py-1.5' : 'px-3 py-2.5'
                  )}
                >
                  {item.previewUrl && !isCompact ? (
                    <img src={item.previewUrl} alt="" className="h-10 w-10 shrink-0 rounded-md object-cover" />
                  ) : (
                    <div className={cn('flex shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground', isCompact ? 'h-8 w-8' : 'h-10 w-10')}>
                      <Icon className={isCompact ? 'h-4 w-4' : 'h-5 w-5'} />
                    </div>
                  )}
                  <div className="min-w-0 flex-1 space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate text-sm font-medium text-foreground">{item.file.name}</p>
                      <Badge variant={STATUS_BADGE_VARIANT[item.status]} size="sm">
                        {STATUS_LABEL[item.status]}
                        {item.status === 'uploading' ? ` ${Math.round(item.progress)}%` : ''}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {formatBytes(item.file.size)}
                      {item.attempts > 0 ? ` · percobaan ${item.attempts + 1}` : ''}
                    </p>
                    {(item.status === 'uploading' || item.status === 'done') && (
                      <Progress value={item.progress} className="h-1.5" aria-label={`Progres upload ${item.file.name}`} aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(item.progress)} />
                    )}
                    {item.status === 'error' && item.error && (
                      <p role="status" className="flex items-start gap-1.5 text-xs text-destructive">
                        <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" /><span>{item.error}</span>
                      </p>
                    )}
                    <div className="flex items-center gap-1">
                      {item.status === 'uploading' && (<span className="mr-1 text-primary" aria-hidden="true"><Loader2 className="h-4 w-4 animate-spin" /></span>)}
                      {item.status === 'done' && (<span className="mr-1 text-success" aria-hidden="true"><CheckCircle2 className="h-4 w-4" /></span>)}
                      {item.status === 'error' && (<span className="mr-1 text-destructive" aria-hidden="true"><XCircle className="h-4 w-4" /></span>)}
                      {item.status === 'canceled' && (<span className="mr-1 text-muted-foreground" aria-hidden="true"><Ban className="h-4 w-4" /></span>)}
                      {!disabled && item.status === 'uploading' && (
                        <Button type="button" variant="ghost" size="sm" onClick={() => cancelItem(item.id)} aria-label={`Batalkan upload ${item.file.name}`}>Batal</Button>
                      )}
                      {!disabled && (item.status === 'error' || item.status === 'canceled') && (
                        <Button type="button" variant="outline" size="sm" onClick={() => retryItem(item.id)} aria-label={`Ulangi upload ${item.file.name}`}><RotateCcw className="h-3.5 w-3.5" />Ulang</Button>
                      )}
                      {!disabled && (
                        <Button type="button" variant="ghost" size="sm" onClick={() => removeItem(item.id)} aria-label={`Hapus ${item.file.name}`}><Trash2 className="h-3.5 w-3.5" />Hapus</Button>
                      )}
                    </div>
                  </div>
                </li>
              );
            })}
            </ul>
          )}

          {allDone && (
            <Alert variant="success">
              <CheckCircle2 className="h-4 w-4" />
              <AlertTitle>Semua file selesai diunggah</AlertTitle>
              <AlertDescription>
                {items.length} file berhasil diunggah.
              </AlertDescription>
            </Alert>
          )}
        </>
      )}
    </div>
  );
}


interface SortableQueueItemProps {
  id: string;
  children: React.ReactNode;
  className?: string;
  itemRef: (itemId: string, node: HTMLLIElement | null) => void;
}

type SortableHandleValue = {
  attributes: ReturnType<typeof useSortable>['attributes'];
  listeners: ReturnType<typeof useSortable>['listeners'];
};

const SortableHandleContext = React.createContext<SortableHandleValue | null>(null);

function SortableQueueItem({ id, children, className, itemRef }: SortableQueueItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id });
  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
  };
  return (
    <SortableHandleContext.Provider value={{ attributes, listeners }}>
      <li
        ref={(node) => {
          setNodeRef(node);
          itemRef(id, node);
        }}
        style={style}
        className={cn(className, isDragging && 'z-10 opacity-70')}
      >
        {children}
      </li>
    </SortableHandleContext.Provider>
  );
}

function SortableDragHandle({ fileName }: { id: string; fileName: string }) {
  const handle = React.useContext(SortableHandleContext);
  if (!handle) return null;
  const { attributes, listeners } = handle;
  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      aria-label={`Seret untuk mengurutkan ${fileName}`}
      className="touch-manipulation cursor-grab active:cursor-grabbing"
      {...attributes}
      {...listeners}
    >
      <GripVertical className="h-4 w-4" />
    </Button>
  );
}
