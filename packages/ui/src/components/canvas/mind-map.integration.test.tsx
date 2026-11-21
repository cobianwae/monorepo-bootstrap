import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { MindMap, type MindNodeFlat } from './mind-map';

// ReactFlow dan useReactFlow asli: fireEvent sendiri tidak menghormati
// pointer-events, sehingga style wrapper wajib diperiksa sebelum klik.
const data: MindNodeFlat[] = [
  { id: 'root', parentId: null, label: 'Peluncuran Q1' },
  { id: 'child', parentId: 'root', label: 'Riset' },
];

describe('MindMap integrasi ReactFlow (CR-020)', () => {
  it('wrapper node menerima pointer; tambah dan expander tetap berfungsi', () => {
    const { container } = render(<MindMap data={data} />);
    const wrappers = container.querySelectorAll<HTMLElement>('.react-flow__node');
    expect(wrappers.length).toBe(2);
    for (const wrapper of wrappers) {
      expect(wrapper.style.pointerEvents).toBe('all');
    }
    fireEvent.click(screen.getByRole('button', { name: 'Tambah anak Riset' }));
    expect(screen.getByRole('textbox')).toBe(document.activeElement);
    fireEvent.keyDown(document.activeElement!, { key: 'Escape' });
    fireEvent.click(screen.getByRole('button', { name: 'Lipat Peluncuran Q1' }));
    expect(container.querySelector('[data-node-id="child"]')).toBeNull();
    fireEvent.click(screen.getByTestId('mind-map-expander-root'));
    expect(container.querySelector('[data-node-id="child"]')).not.toBeNull();
  });

  it('toggle mobile menampilkan minimap tanpa hidden; prop false tetap menonaktifkan', () => {
    const { container, rerender } = render(<MindMap data={data} />);
    const toggle = screen.getByRole('button', { name: 'Tampilkan peta mini' });
    const minimap = () => container.querySelector('.react-flow__minimap')!;
    expect(minimap().classList.contains('hidden')).toBe(true);
    fireEvent.click(toggle);
    expect(toggle.getAttribute('aria-pressed')).toBe('true');
    expect(minimap().classList.contains('hidden')).toBe(false);
    fireEvent.click(toggle);
    expect(minimap().classList.contains('hidden')).toBe(true);
    rerender(<MindMap data={data} minimap={false} />);
    expect(container.querySelector('.react-flow__minimap')).toBeNull();
    expect(screen.queryByRole('button', { name: 'Tampilkan peta mini' })).toBeNull();
  });

  it('viewport asli berpindah dari hasil pan ke target edit, tanpa mengubah zoom', async () => {
    // jsdom tidak mengukur kanvas/minimap; pengukuran visual diuji di browser.
    const { container } = render(<MindMap data={data} minimap={false} />);
    const viewport = container.querySelector<HTMLElement>('.react-flow__viewport')!;
    const initial = viewport.style.transform;
    fireEvent.keyDown(screen.getByTestId('mind-map-viewport'), { key: 'ArrowRight' });
    await waitFor(() => expect(viewport.style.transform).not.toBe(initial));
    const panned = viewport.style.transform;
    const scale = panned.match(/scale\(([^)]+)\)/)?.[1];
    fireEvent.keyDown(container.querySelector('[data-node-id="child"]')!, { key: 'F2' });
    await waitFor(() => expect(viewport.style.transform).not.toBe(panned));
    expect(viewport.style.transform.match(/scale\(([^)]+)\)/)?.[1]).toBe(scale);
    expect(screen.getByRole('textbox')).toBe(document.activeElement);
  });
});
