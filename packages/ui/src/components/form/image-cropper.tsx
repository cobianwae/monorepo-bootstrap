'use client';

import * as React from 'react';
import Cropper, { type Area } from 'react-easy-crop';
import { cn } from '../../lib/utils';
import { Button } from '../base/button';
import { Slider } from '../base/slider';
import { Alert, AlertDescription } from '../feedback/alert';
import { FileInput } from './file-input';
import {
  AVATAR_OUTPUT_SIZE,
  COVER_OUTPUT_SIZE,
  DEFAULT_ACCEPT,
  DEFAULT_MAX_BYTES,
  MAX_ZOOM,
  MIN_ZOOM,
  clampZoom,
  createCropResult,
  formatMegabytes,
  normalizeRotation,
  validateImageFile,
  type CropOutputSize,
  type CropResult,
} from './image-cropper-utils';
import {
  HANDLE_HIT_PX,
  cornerPosition,
  defaultCropSize,
  resizeCropSize,
  type CropSizePx,
  type PointPx,
} from './image-cropper-geometry';

export interface ImageCropperProps {
  /** Rasio terkunci; `'free'` mengikuti rasio asli gambar. Default 1 (avatar). */
  aspect?: 1 | number | 'free';
  /** `round` untuk avatar, `rect` untuk cover. */
  cropShape?: 'rect' | 'round';
  /** Default K2: 512×512 untuk aspek 1:1 dan lainnya, 1280×720 untuk 16:9. */
  outputSize?: CropOutputSize;
  /** Batas ukuran masukan, default K3 10 MB. */
  maxBytes?: number;
  /** Tipe gambar yang diterima, default png/jpeg/webp. */
  accept?: string;
  onComplete?: (result: CropResult) => void;
  onError?: (message: string) => void;
  className?: string;
}

type CropStatus = 'empty' | 'loading' | 'ready' | 'error' | 'success';

const CROPPER_HEIGHT_CLASS = 'h-72';

type Corner = 'nw' | 'ne' | 'sw' | 'se';

const CORNERS: Corner[] = ['nw', 'ne', 'sw', 'se'];

const CORNER_LABEL: Record<Corner, string> = {
  nw: 'Ubah ukuran dari sudut kiri atas',
  ne: 'Ubah ukuran dari sudut kanan atas',
  sw: 'Ubah ukuran dari sudut kiri bawah',
  se: 'Ubah ukuran dari sudut kanan bawah',
};

const CORNER_CURSOR: Record<Corner, string> = {
  nw: 'nwse-resize',
  se: 'nwse-resize',
  ne: 'nesw-resize',
  sw: 'nesw-resize',
};

const ZOOM_STEP = 0.1;
const PAN_STEP = 10;
const PAN_STEP_PRECISE = 1;

function resolveOutputSize(aspect: number | 'free', outputSize?: CropOutputSize): CropOutputSize {
  if (outputSize) return outputSize;
  return aspect === 16 / 9 ? COVER_OUTPUT_SIZE : AVATAR_OUTPUT_SIZE;
}

export const ImageCropper = React.forwardRef<HTMLDivElement, ImageCropperProps>(
  (
    {
      aspect = 1,
      cropShape = 'rect',
      outputSize,
      maxBytes = DEFAULT_MAX_BYTES,
      accept = DEFAULT_ACCEPT,
      onComplete,
      onError,
      className,
    },
    ref
  ) => {
    const [src, setSrc] = React.useState<string | null>(null);
    const [status, setStatus] = React.useState<CropStatus>('empty');
    const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
    const [crop, setCrop] = React.useState({ x: 0, y: 0 });
    const [zoom, setZoom] = React.useState(1);
    const [rotation, setRotation] = React.useState<0 | 90 | 180 | 270>(0);
    const [mediaRatio, setMediaRatio] = React.useState<number | null>(null);
    const [croppedAreaPixels, setCroppedAreaPixels] = React.useState<Area | null>(null);
    const [containerSize, setContainerSize] = React.useState<CropSizePx | null>(null);
    const [cropSize, setCropSize] = React.useState<CropSizePx | null>(null);
    const [liveMessage, setLiveMessage] = React.useState('');

    const containerRef = React.useRef<HTMLDivElement | null>(null);
    const dragCenterRef = React.useRef<PointPx | null>(null);
    const liveTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
    const alertRef = React.useRef<HTMLDivElement | null>(null);
    const successRef = React.useRef<HTMLParagraphElement | null>(null);
    const resetButtonRef = React.useRef<HTMLButtonElement | null>(null);

    const srcRef = React.useRef<string | null>(null);
    srcRef.current = src;

    const revokeSrc = React.useCallback(() => {
      if (srcRef.current) URL.revokeObjectURL(srcRef.current);
    }, []);

    React.useEffect(() => revokeSrc, [revokeSrc]);

    React.useEffect(() => {
      if (status === 'error') alertRef.current?.focus();
      if (status === 'success') successRef.current?.focus();
    }, [status]);

    React.useEffect(
      () => () => {
        if (liveTimerRef.current) clearTimeout(liveTimerRef.current);
      },
      []
    );

    const effectiveAspect = aspect === 'free' ? (mediaRatio ?? 1) : aspect;
    const target = resolveOutputSize(aspect, outputSize);
    const formattedTarget = `${target.width}×${target.height}`;
    const targetDescId = React.useId();
    const isAvatar = cropShape === 'round';

    const activeCropSize: CropSizePx | null =
      cropSize ?? (containerSize ? defaultCropSize(containerSize, effectiveAspect) : null);

    const announce = React.useCallback((message: string) => {
      if (liveTimerRef.current) clearTimeout(liveTimerRef.current);
      liveTimerRef.current = setTimeout(() => setLiveMessage(message), 300);
    }, []);

    const measureContainer = React.useCallback(() => {
      const el = containerRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0) return;
      setContainerSize({ width: rect.width, height: rect.height });
      // Ukuran dihitung ulang dari kontainer terbaru agar tidak melewati viewport.
      setCropSize(null);
    }, []);

    React.useEffect(() => {
      if (status !== 'loading' && status !== 'ready') return;
      measureContainer();
      window.addEventListener('resize', measureContainer);
      return () => window.removeEventListener('resize', measureContainer);
    }, [status, measureContainer]);

    React.useEffect(() => {
      setCropSize(null);
    }, [effectiveAspect]);

    const handleHandlePointerDown = (event: React.PointerEvent<HTMLButtonElement>) => {
      const el = containerRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      dragCenterRef.current = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
      event.currentTarget.setPointerCapture?.(event.pointerId);
      event.preventDefault();
    };

    const handleHandlePointerMove = (event: React.PointerEvent<HTMLButtonElement>) => {
      const center = dragCenterRef.current;
      if (!center || !containerSize) return;
      setCropSize(
        resizeCropSize(
          { x: event.clientX, y: event.clientY },
          center,
          effectiveAspect,
          containerSize
        )
      );
    };

    const handleHandlePointerUp = (event: React.PointerEvent<HTMLButtonElement>) => {
      dragCenterRef.current = null;
      if (event.currentTarget.hasPointerCapture?.(event.pointerId)) {
        event.currentTarget.releasePointerCapture(event.pointerId);
      }
    };

    const fail = (message: string) => {
      setErrorMessage(message);
      setStatus('error');
      onError?.(message);
    };

    const handleFiles = (files: File[]) => {
      const file = files[0];
      if (!file) return;

      const check = validateImageFile(file, { maxBytes, accept });
      if (!check.ok) {
        fail(check.message);
        return;
      }

      revokeSrc();
      setSrc(URL.createObjectURL(file));
      setStatus('loading');
      setErrorMessage(null);
      setCrop({ x: 0, y: 0 });
      setZoom(1);
      setRotation(0);
      setMediaRatio(null);
      setCroppedAreaPixels(null);
      setCropSize(null);
    };

    const handleSave = async () => {
      if (!src || !croppedAreaPixels) return;
      try {
        const result = await createCropResult(src, croppedAreaPixels, rotation, target);
        onComplete?.(result);
        setStatus('success');
      } catch (error) {
        fail(error instanceof Error ? error.message : 'Gagal memproses gambar');
      }
    };

    /** AC-01: reset kembali ke crop 0,0 + zoom 1 + rotation 0 file ini tanpa upload ulang. */
    const handleResetTransforms = () => {
      setCrop({ x: 0, y: 0 });
      setZoom(1);
      setRotation(0);
      announce('Diaturn ulang');
      resetButtonRef.current?.focus();
    };

    const handleRotate = (direction: 1 | -1 = 1) => {
      setRotation((current) => {
        const next = normalizeRotation(current + direction * 90);
        announce(`Diputar ${next} derajat`);
        return next;
      });
    };

    const handleClear = () => {
      revokeSrc();
      setSrc(null);
      setStatus('empty');
      setErrorMessage(null);
      setCroppedAreaPixels(null);
      setRotation(0);
    };

    const handleZoomDelta = (delta: number) => {
      setZoom((current) => {
        const next = clampZoom(Math.round((current + delta) * 10) / 10);
        announce(`Zoom ${Math.round(next * 100)} persen`);
        return next;
      });
    };

    const handleCropKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
      const precise = event.shiftKey && ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key);
      const step = precise ? PAN_STEP_PRECISE : PAN_STEP;
      switch (event.key) {
        case 'ArrowLeft':
          event.preventDefault();
          setCrop((c) => ({ x: c.x - step, y: c.y }));
          announce(`Area ${Math.round(crop.x - step)}, ${Math.round(crop.y)}`);
          break;
        case 'ArrowRight':
          event.preventDefault();
          setCrop((c) => ({ x: c.x + step, y: c.y }));
          announce(`Area ${Math.round(crop.x + step)}, ${Math.round(crop.y)}`);
          break;
        case 'ArrowUp':
          event.preventDefault();
          setCrop((c) => ({ x: c.x, y: c.y - step }));
          announce(`Area ${Math.round(crop.x)}, ${Math.round(crop.y - step)}`);
          break;
        case 'ArrowDown':
          event.preventDefault();
          setCrop((c) => ({ x: c.x, y: c.y + step }));
          announce(`Area ${Math.round(crop.x)}, ${Math.round(crop.y + step)}`);
          break;
        case '+':
        case '=':
          event.preventDefault();
          handleZoomDelta(ZOOM_STEP);
          break;
        case '-':
        case '_':
          event.preventDefault();
          handleZoomDelta(-ZOOM_STEP);
          break;
        case 'R':
        case 'r':
          event.preventDefault();
          handleRotate(event.shiftKey ? -1 : 1);
          break;
        case '0':
          event.preventDefault();
          handleResetTransforms();
          break;
        default:
          break;
      }
    };

    const showCropper = status === 'loading' || status === 'ready';

    return (
      <div ref={ref} className={cn('w-full space-y-4', className)}>
        {status === 'empty' ? (
          <>
            <p role="status" className="text-sm text-muted-foreground">
              Belum ada gambar. Pilih foto untuk mulai memotong.
            </p>
            <FileInput
              value={[]}
              onChange={handleFiles}
              maxFiles={1}
              accept={accept}
              showFileList={false}
              helperText={`PNG, JPG, atau WebP · Maks ${formatMegabytes(maxBytes)}`}
              errorMessage={undefined}
              aria-label="Pilih foto"
            />
          </>
        ) : null}

        {status === 'error' && errorMessage ? (
          <>
            <div ref={alertRef} tabIndex={-1} className="focus-visible:outline-none">
              <Alert variant="destructive" role="alert">
                <AlertDescription>{errorMessage}</AlertDescription>
              </Alert>
            </div>
            <FileInput
              value={[]}
              onChange={handleFiles}
              maxFiles={1}
              accept={accept}
              showFileList={false}
              helperText={`PNG, JPG, atau WebP · Maks ${formatMegabytes(maxBytes)}`}
              errorMessage={undefined}
              aria-label="Pilih foto lain"
            />
          </>
        ) : null}

        {showCropper && src ? (
          <div
            ref={containerRef}
            role="application"
            aria-roledescription="pemotong gambar"
            aria-label="Area crop. Panah geser, tambah kurang zoom, R putar, nol reset."
            aria-describedby={targetDescId}
            aria-busy={status === 'loading'}
            tabIndex={0}
            onKeyDown={handleCropKeyDown}
            className={cn(
              'relative w-full overflow-hidden rounded-xl bg-muted',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
              'motion-reduce:transition-none',
              CROPPER_HEIGHT_CLASS
            )}
          >
            {status === 'loading' ? (
              <>
                <div aria-hidden="true" className="absolute inset-0 animate-pulse bg-muted" />
                <p role="status" className="sr-only">
                  Memuat gambar…
                </p>
              </>
            ) : null}
            <Cropper
              image={src}
              crop={crop}
              zoom={zoom}
              rotation={rotation}
              aspect={effectiveAspect}
              minZoom={MIN_ZOOM}
              maxZoom={MAX_ZOOM}
              cropShape={cropShape}
              showGrid
              restrictPosition
              cropSize={activeCropSize ?? undefined}
              onCropChange={setCrop}
              onZoomChange={(next) => setZoom(clampZoom(next))}
              onMediaLoaded={(size) => {
                setMediaRatio(size.naturalWidth / size.naturalHeight);
                setStatus((current) => (current === 'loading' ? 'ready' : current));
              }}
              onCropComplete={(_area, pixels) => setCroppedAreaPixels(pixels)}
              style={{
                containerStyle: { borderRadius: 'var(--radius-xl)' },
                cropAreaStyle: {
                  border: '2px solid var(--primary)',
                  boxShadow: '0 0 0 9999em color-mix(in oklch, var(--background) 80%, transparent)',
                },
              }}
              classes={{}}
            />

            {status === 'ready' && activeCropSize && containerSize
              ? CORNERS.map((corner) => {
                  const pos = cornerPosition(corner, activeCropSize, containerSize);
                  return (
                    <button
                      key={corner}
                      type="button"
                      aria-label={CORNER_LABEL[corner]}
                      onPointerDown={handleHandlePointerDown}
                      onPointerMove={handleHandlePointerMove}
                      onPointerUp={handleHandlePointerUp}
                      onPointerCancel={handleHandlePointerUp}
                      className="absolute z-10 flex touch-none items-center justify-center rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 motion-reduce:transition-none"
                      style={{
                        left: pos.x,
                        top: pos.y,
                        width: HANDLE_HIT_PX,
                        height: HANDLE_HIT_PX,
                        transform: 'translate(-50%, -50%)',
                        cursor: CORNER_CURSOR[corner],
                      }}
                    >
                      <span
                        aria-hidden="true"
                        className="block size-3 rounded-sm border-2 border-background bg-primary"
                      />
                    </button>
                  );
                })
              : null}
          </div>
        ) : null}

        {showCropper || status === 'success' ? (
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p id={targetDescId} className="text-sm text-muted-foreground">
              Hasil {formattedTarget}
            </p>
            <div className="flex gap-2">
              {status === 'success' ? (
                <Button type="button" variant="outline" onClick={handleClear} className="min-h-11 min-w-11">
                  Pilih foto lain
                </Button>
              ) : (
                <Button
                  type="button"
                  onClick={handleSave}
                  disabled={status !== 'ready' || !croppedAreaPixels}
                  className="min-h-11 min-w-11"
                >
                  Simpan hasil
                </Button>
              )}
            </div>
          </div>
        ) : null}

        {showCropper && src ? (
          <div className="grid gap-4 md:grid-cols-[160px_1fr]">
            <div
              role="region"
              aria-live="polite"
              aria-label="Pratinjau hasil"
              data-testid="crop-preview"
              className="flex items-center gap-3"
            >
              <span
                aria-hidden="true"
                className={cn(
                  'block h-20 w-20 shrink-0 overflow-hidden border border-border bg-muted',
                  isAvatar ? 'rounded-full' : 'rounded-lg'
                )}
              >
                {/* Pratinjau live: gambar sumber diskala mengikuti area (diperbarui tiap onCropComplete). */}
                <img src={src} alt="" className="h-full w-full object-cover motion-reduce:transition-none" />
              </span>
              <span className="text-sm text-muted-foreground">
                {isAvatar ? 'Pratinjau avatar' : 'Pratinjau cover'} · {formattedTarget}
              </span>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  aria-label="Perkecil"
                  onClick={() => handleZoomDelta(-0.2)}
                  disabled={status !== 'ready'}
                  className="min-h-11 min-w-11"
                >
                  −
                </Button>
                <label htmlFor="cropper-zoom" className="text-sm text-muted-foreground">
                  Zoom
                </label>
                <Slider
                  id="cropper-zoom"
                  aria-label="Zoom"
                  min={MIN_ZOOM}
                  max={MAX_ZOOM}
                  step={ZOOM_STEP}
                  value={[zoom]}
                  onValueChange={([next]) => {
                    if (next !== undefined) {
                      setZoom(clampZoom(next));
                      announce(`Zoom ${Math.round(clampZoom(next) * 100)} persen`);
                    }
                  }}
                  disabled={status !== 'ready'}
                  className="min-h-12 flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  aria-label="Perbesar"
                  onClick={() => handleZoomDelta(0.2)}
                  disabled={status !== 'ready'}
                  className="min-h-11 min-w-11"
                >
                  +
                </Button>
                <span aria-hidden="true" className="w-14 text-right text-sm text-muted-foreground">
                  {Math.round(zoom * 100)}%
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleRotate(1)}
                  disabled={status !== 'ready'}
                  className="min-h-11"
                >
                  Putar 90° <kbd aria-hidden="true" className="ml-1 text-xs">R</kbd>
                  <span className="sr-only">Putar 90 derajat</span>
                </Button>
                <Button
                  ref={resetButtonRef}
                  type="button"
                  variant="ghost"
                  onClick={handleResetTransforms}
                  disabled={status !== 'ready'}
                  className="min-h-11"
                >
                  Atur ulang <kbd aria-hidden="true" className="ml-1 text-xs">0</kbd>
                </Button>
              </div>
            </div>
          </div>
        ) : null}

        <p aria-live="polite" className="sr-only">
          {liveMessage}
        </p>

        {status === 'success' ? (
          <p ref={successRef} tabIndex={-1} role="status" className="text-sm text-foreground focus-visible:outline-none">
            {formattedTarget} tersimpan.
          </p>
        ) : null}
      </div>
    );
  }
);
ImageCropper.displayName = 'ImageCropper';
