import * as React from 'react';
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { Lightbox } from './lightbox';
import type { LightboxItem, LightboxProps } from './lightbox-types';

type CapturedProps = {
  open?: boolean;
  index?: number;
  slides?: Array<{ src?: string; alt: string; thumbnail?: string; type?: string; sources?: Array<{ src: string; type: string }>; poster?: string }>;
  carousel?: { finite?: boolean; preload?: number };
  thumbnails?: { position?: string; hidden?: boolean };
  animation?: { swipe?: number; zoom?: number };
  zoom?: { maxZoomPixelRatio?: number };
  video?: { controls?: boolean; preload?: string; autoPlay?: boolean };
  plugins?: unknown[];
  labels?: Record<string, string>;
  close?: () => void;
  on?: { view?: (props: { index: number }) => void; zoom?: (props: { zoom: number }) => void };
  controller?: { ref?: React.RefObject<{ close: () => void } | null> };
  render?: {
    controls?: () => React.ReactNode;
    buttonZoom?: (zoom: {
      zoom: number;
      maxZoom: number;
      disabled: boolean;
      zoomIn: () => void;
      zoomOut: () => void;
      changeZoom: (targetZoom: number, rapid?: boolean) => void;
    }) => React.ReactNode;
    slideFooter?: (props: {
      slide: { src: string; alt: string; thumbnail?: string };
    }) => React.ReactNode;
  };
};

let capturedProps: CapturedProps = {};

/**
 * Mock YARL: meniru perilaku yang dipakai wrapper — `open`, tombol prev/next
 * (disabled di ujung bila finite), strip thumbnail dengan `aria-current`,
 * `on.view` tiap pindah, dan controller ref `close()`.
 */
vi.mock('yet-another-react-lightbox', () => ({
  default: function MockYarLightbox(props: CapturedProps) {
    capturedProps = props;
    const slides = props.slides ?? [];
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [idx, setIdx] = React.useState(props.index ?? 0);
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [zoomLevel, setZoomLevel] = React.useState(1);
    // eslint-disable-next-line react-hooks/rules-of-hooks
    React.useEffect(() => {
      const ref = props.controller?.ref;
      if (ref && typeof ref === 'object') {
        ref.current = { close: () => props.close?.() };
      }
    }, [props]);
    // eslint-disable-next-line react-hooks/rules-of-hooks
    React.useEffect(() => {
      const zoomPropRef = (props as { zoom?: { ref?: React.RefObject<unknown> } }).zoom?.ref;
      if (zoomPropRef && typeof zoomPropRef === 'object') {
        (zoomPropRef as React.RefObject<unknown>).current = zoomRef;
      }
    });
    if (!props.open) return null;
    const go = (next: number) => {
      setIdx(next);
      props.on?.view?.({ index: next });
    };
    const changeZoom = (next: number) => {
      const clamped = Math.min(Math.max(next, 1), 4);
      setZoomLevel(clamped);
      props.on?.zoom?.({ zoom: clamped });
    };
    const zoomRef = {
      zoom: zoomLevel,
      maxZoom: 4,
      disabled: false,
      zoomIn: () => changeZoom(zoomLevel * 2),
      zoomOut: () => changeZoom(zoomLevel / 2),
      changeZoom: (target: number) => changeZoom(target),
    };
    const activeSlide = slides[idx];
    return (
      <div data-testid="yarl-mock" className="ds-lightbox">
        <button
          type="button"
          aria-label={props.labels?.['Previous']}
          disabled={idx === 0}
          onClick={() => go(idx - 1)}
        >
          prev
        </button>
        <button
          type="button"
          aria-label={props.labels?.['Next']}
          disabled={idx === slides.length - 1}
          onClick={() => go(idx + 1)}
        >
          next
        </button>
        {activeSlide?.type === 'video' ? (
          <video data-testid="mock-video" src={activeSlide.sources?.[0]?.src} poster={activeSlide.poster} controls preload="metadata" />
        ) : null}
        {props.render?.buttonZoom?.(zoomRef)}
        <div role="group" aria-label={props.labels?.['Thumbnails']}>
          {slides.map((slide, i) => (
            <button
              key={i}
              type="button"
              aria-label={`thumb-${i}`}
              aria-current={i === idx ? true : undefined}
              onClick={() => go(i)}
            >
              {slide.alt}
            </button>
          ))}
        </div>
        {props.render?.controls?.()}
        {props.render?.slideFooter?.({
          slide: slides[idx] as { src: string; alt: string; thumbnail?: string },
        })}
      </div>
    );
  },
}));

vi.mock('yet-another-react-lightbox/plugins/thumbnails', () => ({
  default: () => undefined,
}));

vi.mock('yet-another-react-lightbox/plugins/zoom', () => ({
  default: () => undefined,
}));

vi.mock('yet-another-react-lightbox/plugins/video', () => ({
  default: () => undefined,
}));

function makeItems(count: number, withCaption = true): LightboxItem[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `item-${i}`,
    src: `https://example.com/${i}.jpg`,
    alt: `Foto ${i + 1}`,
    caption: withCaption ? `Caption ${i + 1}` : undefined,
    meta: withCaption ? `PNG • ${i + 1} MB` : undefined,
  }));
}

function Harness({
  items,
  initialIndex,
  renderCaption,
  actions,
}: {
  items: LightboxItem[];
  initialIndex: number | null;
  renderCaption?: LightboxProps['renderCaption'];
  actions?: React.ReactNode;
}) {
  const [openIndex, setOpenIndex] = React.useState<number | null>(initialIndex);
  return (
    <>
      <button type="button" onClick={() => setOpenIndex(7)}>
        lompat ke 7
      </button>
      <Lightbox
        items={items}
        openIndex={openIndex}
        onOpenChange={setOpenIndex}
        renderCaption={renderCaption}
        actions={actions}
      />
    </>
  );
}

beforeEach(() => {
  capturedProps = {};
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('Lightbox', () => {
  it('AC-01: navigasi 12 item ujung-ke-ujung, counter benar, ujung disabled + diumumkan', () => {
    render(<Harness items={makeItems(12)} initialIndex={2} />);

    expect(screen.getByText('3 / 12')).toBeTruthy();
    expect(screen.getByText(/Image 3 of 12/)).toBeTruthy();

    fireEvent.click(screen.getByLabelText('Gambar berikut'));
    expect(screen.getByText('4 / 12')).toBeTruthy();

    // Mundur ke ujung pertama.
    fireEvent.click(screen.getByLabelText('Gambar sebelumnya'));
    fireEvent.click(screen.getByLabelText('Gambar sebelumnya'));
    fireEvent.click(screen.getByLabelText('Gambar sebelumnya'));
    expect(screen.getByText('1 / 12')).toBeTruthy();
    expect(screen.getByLabelText('Gambar sebelumnya')).toHaveProperty('disabled', true);
    expect(screen.getByText(/first image/)).toBeTruthy();

    // Maju ke ujung terakhir.
    for (let i = 0; i < 11; i += 1) {
      fireEvent.click(screen.getByLabelText('Gambar berikut'));
    }
    expect(screen.getByText('12 / 12')).toBeTruthy();
    expect(screen.getByLabelText('Gambar berikut')).toHaveProperty('disabled', true);
    expect(screen.getByText(/last image/)).toBeTruthy();
  });

  it('AC-01: tidak melingkar — tombol ujung disabled, bukan kembali ke awal', () => {
    render(<Harness items={makeItems(12)} initialIndex={11} />);
    expect(screen.getByLabelText('Gambar berikut')).toHaveProperty('disabled', true);
    expect(screen.getByText('12 / 12')).toBeTruthy();
  });

  it('AC-02: klik thumbnail melompat + caption dan aria-current sinkron', () => {
    render(<Harness items={makeItems(12)} initialIndex={0} />);

    fireEvent.click(screen.getByLabelText('thumb-5'));
    expect(screen.getByText('6 / 12')).toBeTruthy();
    expect(screen.getByText('Caption 6')).toBeTruthy();
    expect(screen.getByText('PNG • 6 MB')).toBeTruthy();
    expect(screen.getByLabelText('thumb-5').getAttribute('aria-current')).toBe('true');
    expect(screen.getByLabelText('thumb-0').getAttribute('aria-current')).toBeNull();

    // Panah keyboard (simulasi via tombol berikut) ikut menggeser strip.
    fireEvent.click(screen.getByLabelText('Gambar berikut'));
    expect(screen.getByLabelText('thumb-6').getAttribute('aria-current')).toBe('true');
    expect(screen.getByText('Caption 7')).toBeTruthy();
  });

  it('AC-02: tanpa caption tidak ada bar caption kosong', () => {
    const { container } = render(<Harness items={makeItems(3, false)} initialIndex={0} />);
    expect(container.querySelector('.ds-lightbox-caption')).toBeNull();
  });

  it('AC-02: renderCaption kustom dipakai bila tersedia', () => {
    render(
      <Harness
        items={makeItems(3)}
        initialIndex={1}
        renderCaption={(item) => `Kustom ${item.id}`}
      />,
    );
    expect(screen.getByText('Kustom item-1')).toBeTruthy();
  });

  it('AC-03: openIndex null = tertutup tanpa overlay', () => {
    render(
      <Lightbox
        items={makeItems(12)}
        openIndex={null}
        onOpenChange={() => undefined}
      />,
    );
    expect(screen.queryByTestId('yarl-mock')).toBeNull();
    expect(screen.queryByText(/\/ 12/)).toBeNull();
  });

  it('AC-03: index di luar rentang di-clamp + peringatan dev tanpa crash', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    render(
      <Lightbox items={makeItems(12)} openIndex={99} onOpenChange={() => undefined} />,
    );
    expect(capturedProps.index).toBe(11);
    expect(screen.getByText('12 / 12')).toBeTruthy();
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('di-clamp'));
  });

  it('AC-03: index negatif di-clamp ke 0', () => {
    vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    render(
      <Lightbox items={makeItems(12)} openIndex={-5} onOpenChange={() => undefined} />,
    );
    expect(capturedProps.index).toBe(0);
    expect(screen.getByText('1 / 12')).toBeTruthy();
  });

  it('AC-03: preload 1+1 (K2) dan navigasi finite diteruskan ke library', () => {
    render(<Harness items={makeItems(12)} initialIndex={0} />);
    expect(capturedProps.carousel).toEqual({ finite: true, preload: 1 });
    expect(capturedProps.thumbnails).toMatchObject({ position: 'bottom', hidden: false });
    expect(capturedProps.labels).toMatchObject({
      Previous: 'Gambar sebelumnya',
      Next: 'Gambar berikut',
      Close: 'Tutup galeri',
    });
  });

  it('strip disembunyikan otomatis untuk galeri 1 item', () => {
    render(<Harness items={makeItems(1)} initialIndex={0} />);
    expect(capturedProps.thumbnails).toMatchObject({ hidden: true });
  });

  it('tutup lewat tombol Tutup galeri memanggil onOpenChange(null)', () => {
    const onOpenChange = vi.fn();
    render(
      <Lightbox items={makeItems(3)} openIndex={0} onOpenChange={onOpenChange} />,
    );
    fireEvent.click(screen.getByLabelText('Tutup galeri'));
    expect(onOpenChange).toHaveBeenCalledWith(null);
  });

  it('slot actions milik konsumen dirender di bar atas', () => {
    render(
      <Harness
        items={makeItems(3)}
        initialIndex={0}
        actions={<button type="button">Unduh</button>}
      />,
    );
    expect(screen.getByText('Unduh')).toBeTruthy();
  });

  it('lompatan eksternal openIndex saat terbuka ikut pindah (controlled)', () => {
    render(<Harness items={makeItems(12)} initialIndex={0} />);
    expect(screen.getByText('1 / 12')).toBeTruthy();
    fireEvent.click(screen.getByText('lompat ke 7'));
    expect(screen.getByText('8 / 12')).toBeTruthy();
  });

  it('daftar kosong tidak dibuka', () => {
    render(<Lightbox items={[]} openIndex={0} onOpenChange={() => undefined} />);
    expect(screen.queryByTestId('yarl-mock')).toBeNull();
  });

  it('item tanpa alt memicu peringatan dev', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const items = [{ id: 'x', src: 'https://example.com/x.jpg', alt: '' }];
    render(<Lightbox items={items} openIndex={0} onOpenChange={() => undefined} />);
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('missing alt'));
  });

  it('AC-01: live region mengumumkan posisi + alt, fokus kembali ke pemicu saat tutup', () => {
    function FocusHarness() {
      const [openIndex, setOpenIndex] = React.useState<number | null>(null);
      return (
        <>
          <button type="button" onClick={() => setOpenIndex(1)}>
            buka galeri
          </button>
          <Lightbox items={makeItems(3)} openIndex={openIndex} onOpenChange={setOpenIndex} />
        </>
      );
    }
    render(<FocusHarness />);
    const trigger = screen.getByText('buka galeri');
    trigger.focus();
    fireEvent.click(trigger);
    expect(screen.getByText(/Image 2 of 3: Foto 2/)).toBeTruthy();
    fireEvent.click(screen.getByLabelText('Gambar berikut'));
    expect(screen.getByText(/Image 3 of 3: Foto 3/)).toBeTruthy();
    fireEvent.click(screen.getByLabelText('Tutup galeri'));
    expect(document.activeElement).toBe(trigger);
  });

  it('AC-02: item video memakai slide video native tanpa autoplay bersuara', () => {
    const items: LightboxItem[] = [
      ...makeItems(1),
      {
        id: 'video-1',
        src: 'https://example.com/movie.mp4',
        alt: 'Video demo',
        type: 'video',
        poster: 'https://example.com/poster.jpg',
      },
    ];
    render(<Lightbox items={items} openIndex={1} onOpenChange={() => undefined} />);
    const videoSlide = capturedProps.slides?.[1];
    expect(videoSlide?.type).toBe('video');
    expect(videoSlide?.sources?.[0]?.src).toBe('https://example.com/movie.mp4');
    expect(capturedProps.video).toMatchObject({ controls: true, preload: 'metadata', autoPlay: false });
    expect(screen.getByTestId('mock-video')).toBeTruthy();
    // Navigasi menjauh memanggil pause() pada elemen video.
    const video = screen.getByTestId('mock-video') as HTMLVideoElement;
    const pause = vi.spyOn(video, 'pause').mockImplementation(() => undefined);
    fireEvent.click(screen.getByLabelText('Gambar sebelumnya'));
    expect(pause).toHaveBeenCalled();
  });

  it('AC-03: tombol Perbesar/Perkecil mengubah zoom, pindah item mereset + mengumumkan', () => {
    vi.useFakeTimers();
    try {
      render(<Harness items={makeItems(3)} initialIndex={0} />);
      expect(capturedProps.zoom).toMatchObject({ maxZoomPixelRatio: 4 });
      fireEvent.click(screen.getByLabelText('Perbesar'));
      act(() => {
        vi.advanceTimersByTime(300);
      });
      expect(screen.getByText('Zoom 200 persen')).toBeTruthy();
      fireEvent.click(screen.getByLabelText('Perbesar'));
      act(() => {
        vi.advanceTimersByTime(300);
      });
      expect(screen.getByText('Zoom 400 persen')).toBeTruthy();
      // Perkecil kembali ke 200 lalu pindah: reset diumumkan.
      fireEvent.click(screen.getByLabelText('Perkecil'));
      fireEvent.click(screen.getByLabelText('Gambar berikut'));
      expect(screen.getByText('Zoom reset')).toBeTruthy();
    } finally {
      vi.useRealTimers();
    }
  });

  it('AC-04: reduced-motion mematikan animasi swipe dan zoom', () => {
    const listeners: Array<(event: { matches: boolean }) => void> = [];
    vi.stubGlobal('matchMedia', (query: string) => ({
      matches: true,
      media: query,
      addEventListener: (_type: string, cb: (event: { matches: boolean }) => void) =>
        listeners.push(cb),
      removeEventListener: () => undefined,
    }));
    try {
      render(<Lightbox items={makeItems(3)} openIndex={0} onOpenChange={() => undefined} />);
      expect(capturedProps.animation).toEqual({ swipe: 0, zoom: 0 });
    } finally {
      vi.unstubAllGlobals();
    }
  });

  it('AC-05: empty role=status tanpa overlay, loading aria-busy, error alert + fokus Try again', () => {
    const { unmount } = render(
      <Lightbox items={[]} openIndex={0} onOpenChange={() => undefined} />,
    );
    expect(screen.getByRole('status')).toBeTruthy();
    expect(screen.queryByTestId('yarl-mock')).toBeNull();
    unmount();

    const { unmount: unmountLoading } = render(
      <Lightbox items={makeItems(3)} openIndex={0} onOpenChange={() => undefined} loading />,
    );
    const loadingRegion = screen.getByRole('status');
    expect(loadingRegion.getAttribute('aria-busy')).toBe('true');
    expect(screen.getByText('Loading image…')).toBeTruthy();
    unmountLoading();

    const onRetry = vi.fn();
    const onOpenChange = vi.fn();
    render(
      <Lightbox
        items={makeItems(3)}
        openIndex={0}
        onOpenChange={onOpenChange}
        error="Gagal memuat https://example.com/0.jpg"
        onRetry={onRetry}
      />,
    );
    expect(screen.getByRole('alert')).toBeTruthy();
    expect(screen.getByText(/Gagal memuat/)).toBeTruthy();
    const retry = screen.getByText('Try again');
    expect(document.activeElement).toBe(retry);
    fireEvent.click(retry);
    expect(onRetry).toHaveBeenCalledWith(0);
    fireEvent.click(screen.getByText('Skip to next'));
    expect(onOpenChange).toHaveBeenCalledWith(1);
  });
});
