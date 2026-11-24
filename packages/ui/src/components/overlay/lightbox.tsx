'use client';

import * as React from 'react';
import YarLightbox, { type ControllerRef, type Slide } from 'yet-another-react-lightbox';
import Thumbnails from 'yet-another-react-lightbox/plugins/thumbnails';
import { X } from 'lucide-react';
import { Badge } from '../base/badge';
import type { LightboxProps } from './lightbox-types';

/** K2: preload 1 ke depan + 1 ke belakang via `carousel.preload`. */
const PRELOAD_WINDOW = 1;

/**
 * Wrapper `yet-another-react-lightbox` token-first (K1, PRD 016).
 * Mesin navigasi + thumbnail + swipe milik library; chrome (bar atas,
 * counter, caption), microcopy Bahasa Indonesia, dan CSS override terisolasi
 * (`lightbox.css`) milik DS. Controlled via `openIndex`/`onOpenChange` (K5);
 * navigasi tidak melingkar (C3) lewat `carousel.finite`.
 * Zoom, video, keyboard penuh, dan state loading/error di 016-02.
 */
export function Lightbox({
  items,
  openIndex,
  onOpenChange,
  renderCaption,
  actions,
  closeOnBackdropClick = true,
}: LightboxProps) {
  const total = items.length;
  const controllerRef = React.useRef<ControllerRef | null>(null);

  const clampedIndex = React.useMemo(() => {
    if (openIndex === null || total === 0) return null;
    return Math.min(Math.max(openIndex, 0), total - 1);
  }, [openIndex, total]);

  const open = openIndex !== null && total > 0 && clampedIndex !== null;

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
        `[Lightbox] ${missing.length} item tanpa alt (id: ${missing.map((i) => i.id).join(', ')}); alt wajib diisi.`,
      );
    }
  }, [items]);

  const slides = React.useMemo(
    () =>
      items.map((item) => ({
        // Video: pakai poster sebagai slide gambar sementara; playback di 016-02.
        src: item.type === 'video' ? (item.poster ?? item.src) : item.src,
        alt: item.alt,
        thumbnail: item.poster ?? item.src,
      })),
    [items],
  );

  // YARL `index` hanya index awal; lompatan eksternal saat terbuka
  // diwujudkan lewat remount (key) agar tetap controlled tanpa state ganda.
  const viewRef = React.useRef<number | null>(null);
  const [mountKey, setMountKey] = React.useState(0);

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

  const currentIndex = clampedIndex ?? 0;
  const isFirst = currentIndex === 0;
  const isLast = total > 0 && currentIndex === total - 1;
  const announcement =
    total > 0
      ? `Gambar ${currentIndex + 1} dari ${total}` +
        (isFirst ? ' — Gambar pertama' : isLast ? ' — Gambar terakhir' : '')
      : '';

  const handleView = React.useCallback(
    ({ index }: { index: number }) => {
      viewRef.current = index;
      onOpenChange(index);
    },
    [onOpenChange],
  );

  const handleClose = React.useCallback(() => {
    onOpenChange(null);
  }, [onOpenChange]);

  if (!open) return null;

  return (
    <YarLightbox
      key={mountKey}
      open={open}
      close={handleClose}
      index={currentIndex}
      slides={slides}
      plugins={[Thumbnails]}
      carousel={{ finite: true, preload: PRELOAD_WINDOW }}
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
      on={{ view: handleView }}
      className="ds-lightbox"
      render={{
        buttonClose: () => null,
        controls: () => (
          <div className="ds-lightbox-bar">
            <button
              type="button"
              aria-label="Tutup galeri"
              onClick={() => controllerRef.current?.close()}
              className="flex min-h-11 min-w-11 items-center justify-center rounded-md text-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <X className="size-5" aria-hidden />
            </button>
            <Badge variant="secondary">{`${currentIndex + 1} / ${total}`}</Badge>
            <span aria-live="polite" className="sr-only">
              {announcement}
            </span>
            <span className="flex-1" />
            {actions}
          </div>
        ),
        slideFooter: ({ slide }: { slide: Slide }) => {
          let slideIndex = (slides as readonly unknown[]).indexOf(slide);
          if (slideIndex < 0) {
            const image = slide as { src?: string; alt?: string; thumbnail?: string };
            slideIndex = slides.findIndex(
              (s) => s.src === image.src && s.alt === image.alt && s.thumbnail === image.thumbnail,
            );
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
  );
}
