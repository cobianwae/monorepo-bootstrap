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
    expect(screen.getByText('1/1 done · 0 failed')).toBeDefined();
    expect(screen.getByText('All files uploaded')).toBeDefined();
  });

  it('rejects only invalid files in a mixed batch with per-file reasons', async () => {
    const { container } = render(
      <FileUpload uploadHandler={instantHandler} maxSize={50} accept=".txt" />
    );
    selectFiles(container, [makeFile('ok.txt', 10), makeFile('big.txt', 100)]);

    await waitFor(() => {
      expect(screen.getByText('Selesai')).toBeDefined();
    });
    expect(screen.getByText(/"big\.txt" rejected: exceeds max size/)).toBeDefined();
    expect(screen.getByText('1/2 done · 1 failed')).toBeDefined();
  });

  it('rejects files whose type does not match accept', async () => {
    const { container } = render(
      <FileUpload uploadHandler={instantHandler} accept=".png,image/png" />
    );
    selectFiles(container, [makeFile('notes.txt', 10, 'text/plain')]);

    expect(screen.getByText(/"notes\.txt" rejected: unsupported file type/)).toBeDefined();
  });

  it('rejects files exceeding maxFiles immediately', async () => {
    const { container } = render(
      <FileUpload uploadHandler={instantHandler} maxFiles={1} />
    );
    selectFiles(container, [makeFile('a.txt'), makeFile('b.txt')]);

    expect(screen.getByText(/"b\.txt" rejected: max 1 files/)).toBeDefined();
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
      expect(screen.getByLabelText('Cancel upload a.txt')).toBeDefined();
    });

    fireEvent.click(screen.getByLabelText('Cancel upload a.txt'));

    await waitFor(() => {
      expect(screen.getByText('Dibatalkan')).toBeDefined();
    });
    expect(signals[0].aborted).toBe(true);
    expect(screen.getByText('Mengunggah 0%')).toBeDefined();
    expect(screen.getByLabelText('Cancel upload b.txt')).toBeDefined();
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
    fireEvent.click(screen.getByLabelText('Retry upload a.txt'));

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
      expect(screen.getByLabelText('Remove photo.png')).toBeDefined();
    });
    expect(URL.createObjectURL).toHaveBeenCalled();

    fireEvent.click(screen.getByLabelText('Remove photo.png'));

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
      const bar = screen.getByRole('progressbar', { name: 'Upload progress a.txt' });
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

  it('retries all failed items collectively', async () => {
    let shouldFail = true;
    const handler: UploadHandler = async (file, { onProgress }) => {
      if (shouldFail && file.name.startsWith('gagal')) throw new Error('Jaringan putus');
      onProgress(100);
    };
    const { container } = render(<FileUpload uploadHandler={handler} />);
    selectFiles(container, [makeFile('gagal1.txt'), makeFile('gagal2.txt'), makeFile('ok.txt')]);

    await waitFor(() => {
      expect(screen.getByText('1/3 done · 2 failed')).toBeDefined();
    });

    shouldFail = false;
    fireEvent.click(screen.getByLabelText('Retry all failed files'));

    await waitFor(() => {
      expect(screen.getAllByText('Selesai')).toHaveLength(3);
      expect(screen.queryByText('1/3 done · 2 failed')).toBeNull();
    });
  });

  it('cancels all active items collectively', async () => {
    const handler: UploadHandler = (_file, { signal }) =>
      new Promise<void>((_resolve, reject) => {
        signal.addEventListener('abort', () => reject(new Error('aborted')));
      });
    const { container } = render(<FileUpload uploadHandler={handler} maxConcurrent={3} />);
    selectFiles(container, [makeFile('a.txt'), makeFile('b.txt')]);

    await waitFor(() => {
      expect(screen.getByLabelText('Batalkan semua upload yang sedang berjalan')).toBeDefined();
    });

    fireEvent.click(screen.getByLabelText('Batalkan semua upload yang sedang berjalan'));

    await waitFor(() => {
      expect(screen.getAllByText('Dibatalkan')).toHaveLength(2);
    });
    expect(screen.queryByLabelText('Batalkan semua upload yang sedang berjalan')).toBeNull();
  });

  it('auto-retries up to maxRetries before final error', async () => {
    let calls = 0;
    const handler: UploadHandler = async () => {
      calls += 1;
      throw new Error('Always fails');
    };
    const { container } = render(<FileUpload uploadHandler={handler} maxRetries={2} />);
    selectFiles(container, [makeFile('a.txt')]);

    await waitFor(() => {
      expect(screen.getByText('Always fails')).toBeDefined();
    });
    // 1 percobaan awal + 2 auto-retry = 3 panggilan
    expect(calls).toBe(3);
  });

  it('does not auto-retry when maxRetries is 0 (default)', async () => {
    let calls = 0;
    const handler: UploadHandler = async () => {
      calls += 1;
      throw new Error('Gagal sekali');
    };
    const { container } = render(<FileUpload uploadHandler={handler} />);
    selectFiles(container, [makeFile('a.txt')]);

    await waitFor(() => {
      expect(screen.getByText('Gagal sekali')).toBeDefined();
    });
    expect(calls).toBe(1);
  });

  it('renders drag handles and keyboard reorder buttons when sortable', async () => {
    const { container } = render(<FileUpload uploadHandler={instantHandler} sortable />);
    selectFiles(container, [makeFile('a.txt'), makeFile('b.txt')]);

    // Timeout eksplisit: default waitFor 1000ms terlalu sempit saat suite penuh berjalan paralel.
    await waitFor(
      () => {
        expect(screen.getAllByText('Selesai')).toHaveLength(2);
      },
      { timeout: 5000 },
    );

    expect(screen.getAllByLabelText(/Seret untuk mengurutkan/).length).toBeGreaterThan(0);
    expect(screen.getByLabelText('Move a.txt down')).toBeDefined();
    expect(screen.getByLabelText('Move b.txt up')).toBeDefined();
  });

  it('does not render sortable controls by default', async () => {
    const { container } = render(<FileUpload uploadHandler={instantHandler} />);
    selectFiles(container, [makeFile('a.txt')]);

    await waitFor(() => {
      expect(screen.getByText('Selesai')).toBeDefined();
    });
    expect(screen.queryByLabelText(/Seret untuk mengurutkan/)).toBeNull();
    expect(screen.queryByLabelText(/Pindahkan/)).toBeNull();
  });

  it('reorders items via keyboard move buttons when sortable', async () => {
    const handler: UploadHandler = () => new Promise<void>(() => undefined);
    const { container } = render(<FileUpload uploadHandler={handler} sortable />);
    selectFiles(container, [makeFile('a.txt'), makeFile('b.txt')]);

    await waitFor(() => {
      expect(screen.getByLabelText('Move a.txt down')).toBeDefined();
    });

    fireEvent.click(screen.getByLabelText('Move a.txt down'));

    const names = screen.getAllByText(/\.txt$/).map((el) => el.textContent);
    expect(names).toEqual(['b.txt', 'a.txt']);
  });

  it('renders compact variant without thumbnail by default', async () => {
    const { container } = render(
      <FileUpload uploadHandler={instantHandler} variant="compact" />
    );
    selectFiles(container, [makeFile('pic.png', 10, 'image/png')]);

    await waitFor(() => {
      expect(screen.getByText('Selesai')).toBeDefined();
    });
    // Compact: tanpa thumbnail secara default, status+aksi tetap ada
    expect(container.querySelector('img')).toBeNull();
    expect(screen.getByLabelText('Remove pic.png')).toBeDefined();
  });
});
