import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { ImageCropper } from './image-cropper';

interface MockCropperProps {
  zoom: number;
  onZoomChange?: (zoom: number) => void;
  onMediaLoaded?: (size: { naturalWidth: number; naturalHeight: number; width: number; height: number }) => void;
  onCropComplete?: (area: unknown, pixels: { x: number; y: number; width: number; height: number }) => void;
}

vi.mock('react-easy-crop', async () => {
  const React = await import('react');
  function MockCropper(props: MockCropperProps) {
    return React.createElement(
      'div',
      { 'data-testid': 'mock-cropper' },
      React.createElement('span', { 'data-testid': 'zoom' }, String(props.zoom)),
      React.createElement(
        'button',
        {
          type: 'button',
          onClick: () =>
            props.onMediaLoaded?.({ naturalWidth: 1600, naturalHeight: 900, width: 400, height: 225 }),
        },
        'mock-media-loaded'
      ),
      React.createElement(
        'button',
        {
          type: 'button',
          onClick: () =>
            props.onCropComplete?.(
              { x: 0, y: 0, width: 0, height: 0 },
              { x: 0, y: 0, width: 900, height: 900 }
            ),
        },
        'mock-crop-complete'
      ),
      React.createElement(
        'button',
        { type: 'button', onClick: () => props.onZoomChange?.(7) },
        'mock-zoom-7'
      )
    );
  }
  return { default: MockCropper };
});

const SOURCE_SIZE = { naturalWidth: 1600, naturalHeight: 900 };

function makeFile(name: string, type: string, size: number): File {
  const file = new File(['x'], name, { type });
  Object.defineProperty(file, 'size', { value: size });
  return file;
}

function dropFile(file: File) {
  const dropzone = screen.getByRole('region', { name: 'File upload dropzone' });
  fireEvent.drop(dropzone, { dataTransfer: { files: [file] } });
}

beforeEach(() => {
  vi.stubGlobal(
    'Image',
    class {
      naturalWidth = SOURCE_SIZE.naturalWidth;
      naturalHeight = SOURCE_SIZE.naturalHeight;
      onload: (() => void) | null = null;
      onerror: (() => void) | null = null;
      set src(_value: string) {
        queueMicrotask(() => this.onload?.());
      }
    }
  );
  HTMLCanvasElement.prototype.getContext = vi.fn(
    () =>
      ({
        translate: vi.fn(),
        rotate: vi.fn(),
        drawImage: vi.fn(),
        imageSmoothingQuality: '',
      }) as unknown as CanvasRenderingContext2D
  ) as unknown as HTMLCanvasElement['getContext'];
  HTMLCanvasElement.prototype.toBlob = function (this: HTMLCanvasElement, callback: BlobCallback) {
    callback(new Blob(['png'], { type: 'image/png' }));
  };
  HTMLCanvasElement.prototype.toDataURL = vi.fn(() => 'data:image/png;base64,AAAA');
  URL.createObjectURL = vi.fn(() => 'blob:fake-url');
  URL.revokeObjectURL = vi.fn();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('ImageCropper', () => {
  it('menampilkan state kosong dengan pemilih foto dan batas ukuran', () => {
    render(<ImageCropper />);
    expect(screen.getByRole('region', { name: 'File upload dropzone' })).toBeTruthy();
    expect(screen.getByText(/PNG, JPG, atau WebP · Maks 10 MB/)).toBeTruthy();
    expect(screen.queryByTestId('mock-cropper')).not.toBeTruthy();
  });

  it('menolak file bukan gambar dengan pesan dan memanggil onError', () => {
    const onError = vi.fn();
    render(<ImageCropper onError={onError} />);
    dropFile(makeFile('dokumen.pdf', 'application/pdf', 1_000));
    expect(screen.getByRole('alert').textContent).toContain(
      'Format tidak didukung. Pilih gambar PNG, JPG, atau WebP.'
    );
    expect(onError).toHaveBeenCalledWith('Format tidak didukung. Pilih gambar PNG, JPG, atau WebP.');
    expect(screen.queryByTestId('mock-cropper')).not.toBeTruthy();
  });

  it('menolak file di atas 10 MB sebelum decode', () => {
    const onError = vi.fn();
    render(<ImageCropper onError={onError} />);
    dropFile(makeFile('besar.png', 'image/png', 12_300_000));
    expect(screen.getByRole('alert').textContent).toContain(
      'File melebihi 10 MB (ukuran aktual 12.3 MB).'
    );
    expect(URL.createObjectURL).not.toHaveBeenCalled();
  });

  it('masuk state loading lalu ready setelah gambar dimuat', async () => {
    render(<ImageCropper />);
    dropFile(makeFile('avatar.png', 'image/png', 1_000));

    const cropper = await screen.findByTestId('mock-cropper');
    expect(cropper.parentElement?.getAttribute('aria-busy')).toBe('true');
    expect((screen.getByRole('button', { name: 'Simpan hasil' }) as HTMLButtonElement).disabled).toBe(true);

    fireEvent.click(screen.getByText('mock-media-loaded'));
    await waitFor(() =>
      expect(cropper.parentElement?.getAttribute('aria-busy')).toBe('false')
    );
    expect((screen.getByRole('button', { name: 'Simpan hasil' }) as HTMLButtonElement).disabled).toBe(true);

    fireEvent.click(screen.getByText('mock-crop-complete'));
    expect((screen.getByRole('button', { name: 'Simpan hasil' }) as HTMLButtonElement).disabled).toBe(false);
  });

  it('menjaga zoom di batas maksimum saat onZoomChange melebihi batas', async () => {
    render(<ImageCropper />);
    dropFile(makeFile('avatar.png', 'image/png', 1_000));
    await screen.findByTestId('mock-cropper');

    fireEvent.click(screen.getByText('mock-zoom-7'));
    expect(screen.getByTestId('zoom').textContent).toBe('5');
  });

  it('menyimpan hasil crop via onComplete dengan dimensi avatar default 512×512', async () => {
    const onComplete = vi.fn();
    render(<ImageCropper onComplete={onComplete} />);
    dropFile(makeFile('avatar.png', 'image/png', 1_000));
    await screen.findByTestId('mock-cropper');
    fireEvent.click(screen.getByText('mock-media-loaded'));
    fireEvent.click(screen.getByText('mock-crop-complete'));

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Simpan hasil' }));
    });

    await waitFor(() => expect(onComplete).toHaveBeenCalledTimes(1));
    expect(onComplete.mock.calls[0][0]).toMatchObject({
      width: 512,
      height: 512,
      aspect: 1,
      dataURL: 'data:image/png;base64,AAAA',
    });
    expect(screen.getByRole('status').textContent).toContain('512×512 tersimpan.');
  });

  it('memakai default cover 1280×720 untuk aspek 16:9', async () => {
    const onComplete = vi.fn();
    render(<ImageCropper aspect={16 / 9} cropShape="rect" onComplete={onComplete} />);
    dropFile(makeFile('cover.jpg', 'image/jpeg', 1_000));
    await screen.findByTestId('mock-cropper');
    fireEvent.click(screen.getByText('mock-media-loaded'));
    fireEvent.click(screen.getByText('mock-crop-complete'));
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Simpan hasil' }));
    });

    await waitFor(() => expect(onComplete).toHaveBeenCalledTimes(1));
    expect(onComplete.mock.calls[0][0]).toMatchObject({ width: 1280, height: 720 });
  });

  it('menampilkan kontrol zoom, putar, dan atur ulang dengan label Indonesia', async () => {
    render(<ImageCropper />);
    dropFile(makeFile('avatar.png', 'image/png', 1_000));
    await screen.findByTestId('mock-cropper');
    fireEvent.click(screen.getByText('mock-media-loaded'));
    fireEvent.click(screen.getByText('mock-crop-complete'));

    expect(screen.getByText('Zoom')).toBeTruthy();
    expect(screen.getByRole('slider')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Perkecil' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Perbesar' })).toBeTruthy();
    expect(screen.getByRole('button', { name: /Putar 90 derajat/ })).toBeTruthy();
    expect(screen.getByRole('button', { name: /Atur ulang/ })).toBeTruthy();
  });

  it('mengatur ulang ke crop 0,0 + zoom 1 tanpa upload ulang', async () => {
    render(<ImageCropper />);
    dropFile(makeFile('avatar.png', 'image/png', 1_000));
    await screen.findByTestId('mock-cropper');
    fireEvent.click(screen.getByText('mock-media-loaded'));
    fireEvent.click(screen.getByText('mock-crop-complete'));

    fireEvent.click(screen.getByRole('button', { name: 'Perbesar' }));
    expect(screen.getByText('120%')).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: /Atur ulang/ }));
    await waitFor(() => expect(screen.getByText('100%')).toBeTruthy());
    // Tanpa upload ulang: cropper tetap tampil, bukan kembali ke empty.
    expect(screen.getByTestId('mock-cropper')).toBeTruthy();
  });

  it('menampilkan pratinjau live dengan label dimensi target', async () => {
    render(<ImageCropper />);
    dropFile(makeFile('avatar.png', 'image/png', 1_000));
    await screen.findByTestId('mock-cropper');
    fireEvent.click(screen.getByText('mock-media-loaded'));
    fireEvent.click(screen.getByText('mock-crop-complete'));

    const preview = screen.getByTestId('crop-preview');
    expect(preview.getAttribute('aria-label')).toBe('Pratinjau hasil');
    expect(preview.textContent).toContain('512×512');
  });

  it('mendukung keyboard panah dan zoom di area crop', async () => {
    render(<ImageCropper />);
    dropFile(makeFile('avatar.png', 'image/png', 1_000));
    await screen.findByTestId('mock-cropper');
    fireEvent.click(screen.getByText('mock-media-loaded'));
    fireEvent.click(screen.getByText('mock-crop-complete'));

    const area = screen.getByRole('application');
    expect(area.getAttribute('aria-label')).toContain('Area crop');
    area.focus();
    fireEvent.keyDown(area, { key: 'ArrowRight' });
    fireEvent.keyDown(area, { key: '+' });
    expect(screen.getByText('110%')).toBeTruthy();
    fireEvent.keyDown(area, { key: '0' });
    await waitFor(() => expect(screen.getByText('100%')).toBeTruthy());
  });

  it('menampilkan error format dengan role alert dan fokus ke alert', async () => {
    render(<ImageCropper />);
    dropFile(makeFile('dokumen.pdf', 'application/pdf', 1_000));
    const alert = screen.getByRole('alert');
    expect(alert.textContent).toContain('Format tidak didukung');
    await waitFor(() => expect(document.activeElement?.contains(alert) || document.activeElement === alert || alert.parentElement === document.activeElement).toBeTruthy());
  });
});
