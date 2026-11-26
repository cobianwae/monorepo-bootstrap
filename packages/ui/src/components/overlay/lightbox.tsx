'use client';

import * as React from 'react';
import YarLightbox, { type ControllerRef, type Slide } from 'yet-another-react-lightbox';
import Thumbnails from 'yet-another-react-lightbox/plugins/thumbnails';
import Zoom from 'yet-another-react-lightbox/plugins/zoom';
import Video from 'yet-another-react-lightbox/plugins/video';
import { Minus, Plus, X } from 'lucide-react';
import { Badge } from '../base/badge';
import type { LightboxProps } from './lightbox-types';

/** Bentuk ZoomRef plugin YARL (tidak diekspor sebagai nama tipe). */
interface ZoomRef {
  zoom: number;
  minZoom: number;
  maxZoom: number;
  offsetX: number;
  offsetY: number;
  disabled: boolean;
  zoomIn: () => void;
  zoomOut: () => void;
  changeZoom: (targetZoom: number, rapid?: boolean, dx?: number, dy?: number) => void;
}

/** K2: preload 1 ke depan + 1 ke belakang via `carousel.preload`. */
const PRELOAD_WINDOW = 1;

/** Durasi umumkan zoom ke live region (throttled, FR-005). */
const ZOOM_ANNOUNCE_DELAY_MS = 300;

const ZOOM_BUTTON_CLASS =
  'flex min-h-11 min-w-11 items-center justify-center rounded-md text-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-50';

/**
 * Wrapper `yet-another-react-lightbox` token-first (K1, PRD 016).
 * Mesin navigasi + thumbnail + swipe + zoom + keyboard milik library;
 * chrome (bar atas, counter, caption), microcopy Bahasa Indonesia, dan CSS
 * override terisolasi (`lightbox.css`) milik DS. Controlled via
 * `openIndex`/`onOpenChange` (K5); navigasi tidak melingkar (C3) lewat
 * `carousel.finite`. 016-02: zoom 1–4x + reset, video dasar, fokus kembali,
 * swipe + reduced-motion, dan state empty/loading/error/success.
 */
export function Lightbox({
  items,
  openIndex,
  onOpenChange,
  renderCaption,
  actions,
  closeOnBackdropClick = true,
  loading = false,
  error = null,
  onRetry,
}: LightboxProps) {
  const total = items.length;
  const controllerRef = React.useRef<ControllerRef | null>(null);
  const zoomRef = React.useRef<ZoomRef | null>(null);

  const clampedIndex = React.useMemo(() => {
    if (openIndex === null || total === 0) return null;
    return Math.min(Math.max(openIndex, 0), total - 1);
  }, [openIndex, total]);

  const open = openIndex !== null && total > 0 && clampedIndex !== null;
  const currentIndex = clampedIndex ?? 0;
  const currentItem = total > 0 ? items[currentIndex] : undefined;

  // Peringatan dev: index di luar rentang di-clamp, bukan crash (AC-03).
  React.useEffect(() => {
    if (openIndex !== null && total > 0 && clampedIndex !== null && openIndex !== clampedIndex) {
      console.warn(
        `[Lightbox] openIndex ${openIndex} di luar rentang 0–${total - 1}; di-clamp ke ${clampedIndex}.`,
      );
    }
  }, [openIndex, clampedIndex, total]);

  // Peringatan dev: `alt` wajib untuk a11y (wireframe §2.1).
  React.useEffect(() => {
    const missing = items.filter((item) => !item.alt?.trim());
    if (missing.length > 0) {
      console.warn(
        `[Lightbox] ${missing.length} items missing alt (id: ${missing.map((i) => i.id).join(', ')}); alt is required.`,
      );
    }
  }, [items]);

  const slides = React.useMemo<Slide[]>(
    () =>
      items.map((item) =>
        item.type === 'video'
          ? {
              type: 'video' as const,
              sources: [{ src: item.src, type: 'video/mp4' }],
              poster: item.poster,
              width: item.width ?? 1280,
              height: item.height ?? 720,
              alt: item.alt,
              thumbnail: item.poster ?? item.src,
            }
          : {
              src: item.src,
              alt: item.alt,
              width: item.width,
              height: item.height,
              thumbnail: item.poster ?? item.src,
            },
      ),
    [items],
  );

  // YARL `index` hanya index awal; lompatan eksternal saat terbuka
  // diwujudkan lewat remount (key) agar tetap controlled tanpa state ganda.
  const viewRef = React.useRef<number | null>(null);
  const [mountKey, setMountKey] = React.useState(0);
  const [retryKey, setRetryKey] = React.useState(0);

  React.useEffect(() => {
    if (openIndex === null) {
      viewRef.current = null;
      return;
    }
    if (viewRef.current === null) {
      viewRef.current = clampedIndex;
      return;
    }
    if (clampedIndex !== null && clampedIndex !== viewRef.current) {
      viewRef.current = clampedIndex;
      setMountKey((key) => key + 1);
    }
  }, [openIndex, clampedIndex]);

  // Fokus kembali: simpan pemicu saat dibuka, kembalikan saat ditutup (FR-002).
  const triggerRef = React.useRef<Element | null>(null);
  const wasOpenRef = React.useRef(false);

  React.useEffect(() => {
    if (open && !wasOpenRef.current) {
      triggerRef.current = document.activeElement;
    }
    if (!open && wasOpenRef.current) {
      const trigger = triggerRef.current;
      if (trigger && typeof (trigger as HTMLElement).focus === 'function') {
        (trigger as HTMLElement).focus();
      }
      triggerRef.current = null;
    }
    wasOpenRef.current = open;
  }, [open ]);

  // Reduced-motion: matikan animasi swipe/zoom, ganti instan (FR-007).
  const getReducedMotion = React.useCallback(
    () =>
      typeof window !== 'undefined' &&
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    [],
  );
  const [reducedMotion, setReducedMotion] = React.useState<boolean>(getReducedMotion);

  React.useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return;
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onChange = (event: MediaQueryListEvent) => setReducedMotion(event.matches);
    setReducedMotion(query.matches);
    query.addEventListener('change', onChange);
    return () => query.removeEventListener('change', onChange);
  }, []);

  // Umumkan zoom throttled 300 ms (FR-005).
  const [zoomAnnouncement, setZoomAnnouncement] = React.useState('');
  const zoomTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  React.useEffect(
    () => () => {
      if (zoomTimerRef.current) clearTimeout(zoomTimerRef.current);
    },
    [],
  );

  const announceZoom = React.useCallback((zoom: number) => {
    if (zoomTimerRef.current) clearTimeout(zoomTimerRef.current);
    zoomTimerRef.current = setTimeout(() => {
      setZoomAnnouncement(`Zoom ${Math.round(zoom * 100)} persen`);
    }, ZOOM_ANNOUNCE_DELAY_MS);
  }, []);

  const handleZoom = React.useCallback(
    ({ zoom }: { zoom: number }) => {
      announceZoom(zoom);
    },
    [announceZoom],
  );

  // Hentikan playback video lama saat navigasi menjauh (FR-003).
  const pauseVideos = React.useCallback(() => {
    if (typeof document === 'undefined') return;
    document
      .querySelectorAll<HTMLVideoElement>('.ds-lightbox video')
      .forEach((video) => video.pause());
  }, []);

  const handleView = React.useCallback(
    ({ index }: { index: number }) => {
      pauseVideos();
      // Reset zoom ke pas tiap pindah item (FR-005).
      const zoom = zoomRef.current;
      if (zoom && typeof zoom.changeZoom === 'function' && (zoom.zoom ?? 1) > 1) {
        zoom.changeZoom(1, true);
        setZoomAnnouncement('Zoom reset');
      }
      viewRef.current = index;
      onOpenChange(index);
    },
    [onOpenChange, pauseVideos],
  );

  const handleClose = React.useCallback(() => {
    pauseVideos();
    onOpenChange(null);
  }, [onOpenChange, pauseVideos]);

  const handleRetry = React.useCallback(() => {
    if (onRetry) {
      onRetry(currentIndex);
      return;
    }
    setRetryKey((key) => key + 1);
  }, [currentIndex, onRetry]);

  const handleSkip = React.useCallback(() => {
    if (currentIndex < total - 1) onOpenChange(currentIndex + 1);
  }, [currentIndex, onOpenChange, total]);

  const retryButtonRef = React.useRef<HTMLButtonElement | null>(null);

  React.useEffect(() => {
    if (error) retryButtonRef.current?.focus();
  }, [error, currentIndex]);

  const isFirst = currentIndex === 0;
  const isLast = total > 0 && currentIndex === total - 1;
  const announcement =
    total > 0 && currentItem
      ? `Image ${currentIndex + 1} of ${total}: ${currentItem.alt}` +
        (isFirst ? ' — first image' : isLast ? ' — last image' : '')
      : '';

  // Empty: lightbox tidak dibuka, status untuk SR (FR-008).
  if (total === 0) {
    return (
      <span role="status" className="sr-only">
        No media to display.
      </span>
    );
  }

  if (!open) return null;

  return (
    <>
      <YarLightbox
        key={`${mountKey}-${retryKey}`}
        open={open}
        close={handleClose}
        index={currentIndex}
        slides={slides}
        plugins={[Thumbnails, Zoom, Video]}
        carousel={{ finite: true, preload: PRELOAD_WINDOW }}
        animation={{ swipe: reducedMotion ? 0 : 500, zoom: reducedMotion ? 0 : 500 }}
        zoom={{ ref: zoomRef, maxZoomPixelRatio: 4 }}
        video={{ controls: true, playsInline: true, preload: 'metadata', autoPlay: false }}
        controller={{ ref: controllerRef, closeOnBackdropClick }}
        labels={{
          Previous: 'Gambar sebelumnya',
          Next: 'Gambar berikut',
          Close: 'Tutup galeri',
          Lightbox: 'Galeri gambar',
          Slide: 'Gambar',
          Carousel: 'Galeri gambar',
          Thumbnails: 'Thumbnail galeri',
          'Show thumbnails': 'Tampilkan thumbnail',
          'Hide thumbnails': 'Sembunyikan thumbnail',
          'Zoom in': 'Perbesar',
          'Zoom out': 'Perkecil',
        }}
        thumbnails={{
          position: 'bottom',
          width: 64,
          height: 64,
          gap: 8,
          border: 2,
          showToggle: false,
          hidden: total <= 1,
        }}
        on={{ view: handleView, zoom: handleZoom }}
        className="ds-lightbox"
        render={{
          buttonClose: () => null,
          buttonZoom: (zoom: ZoomRef) => (
            <>
              <button
                type="button"
                aria-label="Perbesar"
                disabled={zoom.disabled || zoom.zoom >= zoom.maxZoom}
                onClick={() => zoom.zoomIn()}
                className={ZOOM_BUTTON_CLASS}
              >
                <Plus className="size-5" aria-hidden />
              </button>
              <button
                type="button"
                aria-label="Perkecil"
                disabled={zoom.disabled || zoom.zoom <= 1}
                onClick={() => zoom.zoomOut()}
                className={ZOOM_BUTTON_CLASS}
              >
                <Minus className="size-5" aria-hidden />
              </button>
            </>
          ),
          controls: () => (
            <div className="ds-lightbox-bar">
              <button
                type="button"
                aria-label="Tutup galeri"
                onClick={() => controllerRef.current?.close()}
                className={ZOOM_BUTTON_CLASS}
              >
                <X className="size-5" aria-hidden />
              </button>
              <Badge variant="secondary">{`${currentIndex + 1} / ${total}`}</Badge>
              <span aria-live="polite" className="sr-only">
                {announcement}
              </span>
              <span aria-live="polite" className="sr-only">
                {zoomAnnouncement}
              </span>
              <span className="flex-1" />
              {actions}
            </div>
          ),
          slideFooter: ({ slide }: { slide: Slide }) => {
            let slideIndex = (slides as readonly unknown[]).indexOf(slide);
            if (slideIndex < 0) {
              const image = slide as { src?: string; alt?: string; thumbnail?: string };
              slideIndex = slides.findIndex((s) => {
                const candidate = s as { src?: string; alt?: string; thumbnail?: string };
                return (
                  candidate.src === image.src &&
                  candidate.alt === image.alt &&
                  candidate.thumbnail === image.thumbnail
                );
              });
            }
            const item = slideIndex >= 0 ? items[slideIndex] : undefined;
            if (!item) return null;
            const customCaption = renderCaption?.(item, slideIndex);
            const hasCaption = Boolean(customCaption) || Boolean(item.caption) || Boolean(item.meta);
            if (!hasCaption) return null;
            return (
              <div className="ds-lightbox-caption">
                {customCaption ?? (
                  <>
                    {item.caption ? <span className="text-foreground">{item.caption}</span> : null}
                    {item.meta ? (
                      <span className="block text-xs text-muted-foreground">{item.meta}</span>
                    ) : null}
                  </>
                )}
              </div>
            );
          },
        }}
      />
      {loading ? (
        <div
          role="status"
          aria-busy="true"
          className="ds-lightbox-state ds-lightbox-state--loading"
        >
          <div className="ds-lightbox-skeleton" aria-hidden />
          <span className="sr-only">Loading image…</span>
        </div>
      ) : null}
      {error ? (
        <div role="alert" className="ds-lightbox-state ds-lightbox-state--error">
          <p className="text-sm font-medium text-foreground">Image failed to load</p>
          <p className="text-xs text-muted-foreground">{error}</p>
          <div className="ds-lightbox-state-actions">
            <button
              ref={retryButtonRef}
              type="button"
              onClick={handleRetry}
              className="min-h-11 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              Try again
            </button>
            <button
              type="button"
              onClick={handleSkip}
              disabled={isLast}
              className="min-h-11 rounded-md border border-border px-4 text-sm font-medium text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-50"
            >
              Skip to next
            </button>
          </div>
        </div>
      ) : null}
    </>
  );
}
