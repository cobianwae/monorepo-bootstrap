/** @vitest-environment jsdom */
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import * as UI from '@ds/ui';

type FlowEditorProps = UI.FlowEditorProps;
import { beforeAll } from 'vitest';
import FlowEditorPage from './page';

// Halaman memakai matchMedia untuk deteksi layar kecil; jsdom tidak menyediakannya.
beforeAll(() => {
  if (!window.matchMedia) {
    window.matchMedia = (query: string) =>
      ({
        matches: false,
        media: query,
        onchange: null,
        addEventListener: () => {},
        removeEventListener: () => {},
        addListener: () => {},
        removeListener: () => {},
        dispatchEvent: () => false,
      }) as unknown as MediaQueryList;
  }
});

function renderPage() {
  return render(
    <UI.ThemeProvider>
      <FlowEditorPage />
    </UI.ThemeProvider>,
  );
}

// FlowEditor di-stub agar seleksi dan tambah bisa dipicu secara deterministik di jsdom.
vi.mock('@ds/ui', async (importOriginal) => {
  const actual = await importOriginal<typeof UI>();
  return {
    ...actual,
    FlowEditor: (props: FlowEditorProps) => {
      const nodes = props.nodes ?? [];
      const edges = props.edges ?? [];
      return (
        <div>
          <div data-testid="flow-stub-nodes">{JSON.stringify(nodes)}</div>
          <div data-testid="flow-stub-edges">{JSON.stringify(edges)}</div>
          <button
            type="button"
            onClick={() => props.onAddFromPalette?.({ type: 'action', title: 'Kirim email', description: 'Tugas' }, { x: 10, y: 10 })}
          >
            Tambah
          </button>
          <button
            type="button"
            onClick={() => {
              const last = nodes[nodes.length - 1];
              props.onSelectionChange?.({ nodes: last ? [last] : [], edges: [] });
            }}
          >
            Seleksi terakhir
          </button>
          <button
            type="button"
            onClick={() => {
              const n1 = nodes.find((n) => n.id === 'n1');
              props.onSelectionChange?.({ nodes: n1 ? [n1] : [], edges: [] });
            }}
          >
            Seleksi n1
          </button>
          <button
            type="button"
            onClick={() => {
              const e1 = edges.find((e) => e.id === 'e1');
              props.onSelectionChange?.({ nodes: [], edges: e1 ? [e1] : [] });
            }}
          >
            Seleksi e1
          </button>
        </div>
      );
    },
  };
});

describe('FlowEditorPage inspector on-demand (CR-019)', () => {
  it('tambah node tidak membuka sheet, seleksi eksplisit membukanya', () => {
    renderPage();
    fireEvent.click(screen.getByRole('button', { name: 'Tambah' }));
    fireEvent.click(screen.getByRole('button', { name: 'Seleksi terakhir' }));
    expect(screen.queryByTestId('flow-inspector')).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'Seleksi n1' }));
    expect(screen.getByTestId('flow-inspector')).toBeTruthy();
  });

  it('Esc menutup sheet dan membersihkan seleksi', () => {
    renderPage();
    fireEvent.click(screen.getByRole('button', { name: 'Seleksi n1' }));
    const sheet = screen.getByTestId('flow-inspector');
    fireEvent.keyDown(sheet, { key: 'Escape' });
    expect(screen.queryByTestId('flow-inspector')).toBeNull();
  });

  it('edge terpilih: label live ke canvas dan [Hapus edge] menghapus edge', () => {
    renderPage();
    fireEvent.click(screen.getByRole('button', { name: 'Seleksi e1' }));
    const label = document.getElementById('flow-edge-label') as HTMLInputElement;
    expect(label).not.toBeNull();
    fireEvent.change(label, { target: { value: 'baru' } });
    expect(screen.getByTestId('flow-stub-edges').textContent).toContain('"label":"baru"');
    fireEvent.click(screen.getByRole('button', { name: 'Hapus edge' }));
    expect(screen.getByTestId('flow-stub-edges').textContent).not.toContain('"id":"e1"');
    expect(screen.queryByTestId('flow-inspector')).toBeNull();
  });

  it('node: deskripsi dan status live ke canvas, Duplikat menambah salinan', () => {
    renderPage();
    fireEvent.click(screen.getByRole('button', { name: 'Seleksi n1' }));
    fireEvent.change(screen.getByLabelText('Deskripsi'), { target: { value: 'Catatan' } });
    fireEvent.click(screen.getByRole('button', { name: 'Peringatan' }));
    const nodesJson = screen.getByTestId('flow-stub-nodes').textContent ?? '';
    expect(nodesJson).toContain('"description":"Catatan"');
    expect(nodesJson).toContain('"status":"warning"');
    fireEvent.click(screen.getByRole('button', { name: 'Duplikat' }));
    expect(screen.getByTestId('flow-stub-nodes').textContent).toContain('(salinan)');
    expect(screen.queryByTestId('flow-inspector')).toBeNull();
  });
});
