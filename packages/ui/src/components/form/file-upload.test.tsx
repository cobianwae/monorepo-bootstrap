import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
import { FileUpload, type UploadHandler } from './file-upload';

function makeFile(name: string, size = 100, type = 'text/plain'): File {
  return new File([new Uint8Array(size)], name, { type });
}

function selectFiles(container: HTMLElement, files: File[]) {
  const dropzone = container.querySelector('[aria-label="File upload dropzone"]');
  expect(dropzone).not.toBeNull();
  fireEvent.drop(dropzone as Element, { dataTransfer: { files } });
}

const instantHandler: UploadHandler = async (_file, { onProgress }) => {
  onProgress(100);
};

describe('FileUpload component', () => {
  beforeEach(() => {
    class MockURL extends URL {
      static createObjectURL = vi.fn(() => 'blob:fake-url');
      static revokeObjectURL = vi.fn();
    }
    vi.stubGlobal('URL', MockURL);
  });

  // Catatan: jangan unstub URL di afterEach — cleanup unmount RTL berjalan
  // setelahnya dan butuh URL.revokeObjectURL. Isolasi per file vitest
  // membuat stub ini aman.

  it('queues files and completes upload (queued -> uploading -> done)', async () => {
    const { container } = render(<FileUpload uploadHandler={instantHandler} />);
    selectFiles(container, [makeFile('rapport.pdf')]);

    await waitFor(() => {
      expect(screen.getByText('Selesai')).toBeDefined();
    });
    expect(screen.getByText('1/1 selesai · 0 gagal')).toBeDefined();
    expect(screen.getByText('Semua file selesai diunggah')).toBeDefined();
  });

  it('rejects only invalid files in a mixed batch with per-file reasons', async () => {
    const { container } = render(
      <FileUpload uploadHandler={instantHandler} maxSize={50} accept=".txt" />
    );
    selectFiles(container, [makeFile('ok.txt', 10), makeFile('big.txt', 100)]);

    await waitFor(() => {
      expect(screen.getByText('Selesai')).toBeDefined();
    });
    expect(screen.getByText(/"big\.txt" ditolak: melebihi ukuran maksimum/)).toBeDefined();
    expect(screen.getByText('1/2 selesai · 1 gagal')).toBeDefined();
  });

  it('rejects files whose type does not match accept', async () => {
    const { container } = render(
      <FileUpload uploadHandler={instantHandler} accept=".png,image/png" />
    );
    selectFiles(container, [makeFile('notes.txt', 10, 'text/plain')]);

    expect(screen.getByText(/"notes\.txt" ditolak: tipe file tidak didukung/)).toBeDefined();
  });

  it('rejects files exceeding maxFiles immediately', async () => {
    const { container } = render(
      <FileUpload uploadHandler={instantHandler} maxFiles={1} />
    );
    selectFiles(container, [makeFile('a.txt'), makeFile('b.txt')]);

    expect(screen.getByText(/"b\.txt" ditolak: maksimal 1 file/)).toBeDefined();
    await waitFor(() => expect(screen.getByText('Selesai')).toBeDefined());
  });

  it('limits concurrent uploads to maxConcurrent (FIFO)', async () => {
    const resolvers: Array<() => void> = [];
    const handler: UploadHandler = (_file, { onProgress }) =>
      new Promise<void>((resolve) => {
        resolvers.push(() => {
          onProgress(100);
          resolve();
        });
      });

    const { container } = render(
      <FileUpload uploadHandler={handler} maxConcurrent={1} />
    );
    selectFiles(container, [makeFile('a.txt'), makeFile('b.txt')]);

    await waitFor(() => {
      expect(screen.getByText('Mengunggah 0%')).toBeDefined();
    });
    expect(screen.getByText('Menunggu')).toBeDefined();

    await act(async () => resolvers[0]());
    await waitFor(() => {
      expect(screen.getAllByText('Selesai')).toHaveLength(1);
      expect(screen.getByText('Mengunggah 0%')).toBeDefined();
    });

    await act(async () => resolvers[1]());
    await waitFor(() => {
      expect(screen.getAllByText('Selesai')).toHaveLength(2);
    });
  });

  it('cancels an uploading item via AbortSignal without affecting others', async () => {
    const signals: AbortSignal[] = [];
    const handler: UploadHandler = (_file, { signal }) =>
      new Promise<void>((_resolve, reject) => {
        signals.push(signal);
        signal.addEventListener('abort', () => reject(new Error('aborted')));
      });

    const { container } = render(
      <FileUpload uploadHandler={handler} maxConcurrent={2} />
    );
    selectFiles(container, [makeFile('a.txt'), makeFile('b.txt')]);

    await waitFor(() => {
      expect(screen.getByLabelText('Batalkan upload a.txt')).toBeDefined();
    });

    fireEvent.click(screen.getByLabelText('Batalkan upload a.txt'));

    await waitFor(() => {
      expect(screen.getByText('Dibatalkan')).toBeDefined();
    });
    expect(signals[0].aborted).toBe(true);
    expect(screen.getByText('Mengunggah 0%')).toBeDefined();
    expect(screen.getByLabelText('Batalkan upload b.txt')).toBeDefined();
  });

  it('isolates per-file errors and supports retry per item', async () => {
    let shouldFail = true;
    const handler: UploadHandler = async (file, { onProgress }) => {
      if (file.name === 'a.txt' && shouldFail) throw new Error('Jaringan putus');
      onProgress(100);
    };

    const { container } = render(<FileUpload uploadHandler={handler} />);
    selectFiles(container, [makeFile('a.txt'), makeFile('b.txt')]);

    await waitFor(() => {
      expect(screen.getByText('Jaringan putus')).toBeDefined();
      expect(screen.getByText('Selesai')).toBeDefined();
    });

    shouldFail = false;
    fireEvent.click(screen.getByLabelText('Ulangi upload a.txt'));

    await waitFor(() => {
      expect(screen.getAllByText('Selesai')).toHaveLength(2);
    });
  });

  it('removes an uploading item (abort first) and revokes its preview URL', async () => {
    const handler: UploadHandler = (_file, { signal }) =>
      new Promise<void>((_resolve, reject) => {
        signal.addEventListener('abort', () => reject(new Error('aborted')));
      });

    const { container } = render(<FileUpload uploadHandler={handler} />);
    selectFiles(container, [makeFile('photo.png', 10, 'image/png')]);

    await waitFor(() => {
      expect(screen.getByLabelText('Hapus photo.png')).toBeDefined();
    });
    expect(URL.createObjectURL).toHaveBeenCalled();

    fireEvent.click(screen.getByLabelText('Hapus photo.png'));

    await waitFor(() => {
      expect(screen.queryByText('photo.png')).toBeNull();
    });
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:fake-url');
  });

  it('exposes progressbar semantics per uploading item', async () => {
    const handler: UploadHandler = (_file, { onProgress }) => {
      onProgress(42);
      return new Promise<void>(() => undefined);
    };

    const { container } = render(<FileUpload uploadHandler={handler} />);
    selectFiles(container, [makeFile('a.txt')]);

    await waitFor(() => {
      const bar = screen.getByRole('progressbar', { name: 'Progres upload a.txt' });
      expect(bar.getAttribute('aria-valuenow')).toBe('42');
    });
  });

  it('shows generic icon for non-image files and thumbnail for images', async () => {
    const { container } = render(<FileUpload uploadHandler={instantHandler} />);
    selectFiles(container, [
      makeFile('doc.pdf', 10, 'application/pdf'),
      makeFile('pic.png', 10, 'image/png'),
    ]);

    await waitFor(() => {
      expect(screen.getAllByText('Selesai')).toHaveLength(2);
    });
    expect(container.querySelector('img')).not.toBeNull();
  });
});
