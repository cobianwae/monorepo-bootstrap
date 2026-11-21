'use client';

import * as React from 'react';
import Cropper, { type Area } from 'react-easy-crop';
import { cn } from '../../lib/utils';
import { Button } from '../base/button';
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
    const [mediaRatio, setMediaRatio] = React.useState<number | null>(null);
    const [croppedAreaPixels, setCroppedAreaPixels] = React.useState<Area | null>(null);
    const [containerSize, setContainerSize] = React.useState<CropSizePx | null>(null);
    const [cropSize, setCropSize] = React.useState<CropSizePx | null>(null);

    const containerRef = React.useRef<HTMLDivElement | null>(null);
    const dragCenterRef = React.useRef<PointPx | null>(null);

    const srcRef = React.useRef<string | null>(null);
    srcRef.current = src;

    const revokeSrc = React.useCallback(() => {
      if (srcRef.current) URL.revokeObjectURL(srcRef.current);
    }, []);

    React.useEffect(() => revokeSrc, [revokeSrc]);

    const effectiveAspect = aspect === 'free' ? (mediaRatio ?? 1) : aspect;
    const target = resolveOutputSize(aspect, outputSize);
    const formattedTarget = `${target.width}×${target.height}`;

    const activeCropSize: CropSizePx | null =
      cropSize ?? (containerSize ? defaultCropSize(containerSize, effectiveAspect) : null);

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
      setMediaRatio(null);
      setCroppedAreaPixels(null);
      setCropSize(null);
    };

    const handleSave = async () => {
      if (!src || !croppedAreaPixels) return;
      try {
        const result = await createCropResult(src, croppedAreaPixels, 0, target);
        onComplete?.(result);
        setStatus('success');
      } catch (error) {
        fail(error instanceof Error ? error.message : 'Gagal memproses gambar');
      }
    };

    const handleReset = () => {
      revokeSrc();
      setSrc(null);
      setStatus('empty');
      setErrorMessage(null);
      setCroppedAreaPixels(null);
    };

    const showCropper = status === 'loading' || status === 'ready';

    return (
      <div ref={ref} className={cn('w-full space-y-4', className)}>
        {status === 'empty' || status === 'error' ? (
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
        ) : null}

        {status === 'error' && errorMessage ? (
          <Alert variant="destructive" role="alert">
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        ) : null}

        {showCropper && src ? (
          <div
            ref={containerRef}
            aria-busy={status === 'loading'}
            className={cn(
              'relative w-full overflow-hidden rounded-xl bg-muted',
              CROPPER_HEIGHT_CLASS
            )}
          >
            {status === 'loading' ? (
              <p role="status" className="sr-only">
                Memuat gambar…
              </p>
            ) : null}
            <Cropper
              image={src}
              crop={crop}
              zoom={zoom}
              rotation={0}
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
                      className="absolute z-10 flex touch-none items-center justify-center rounded-full"
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
            <p className="text-sm text-muted-foreground">Hasil {formattedTarget}</p>
            <div className="flex gap-2">
              {status === 'success' ? (
                <Button type="button" variant="outline" onClick={handleReset}>
                  Pilih foto lain
                </Button>
              ) : (
                <Button
                  type="button"
                  onClick={handleSave}
                  disabled={status !== 'ready' || !croppedAreaPixels}
                >
                  Simpan hasil
                </Button>
              )}
            </div>
          </div>
        ) : null}

        {status === 'success' ? (
          <p role="status" className="text-sm text-foreground">
            {formattedTarget} tersimpan.
          </p>
        ) : null}
      </div>
    );
  }
);
ImageCropper.displayName = 'ImageCropper';
