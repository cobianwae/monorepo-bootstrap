import { describe, it, expect, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { OrgChart, type OrgChartInput } from './org-chart';

const flatData: OrgChartInput = [
  { id: 'ceo', parentId: null, title: 'CEO' },
  { id: 'eng', parentId: 'ceo', title: 'Engineering' },
  { id: 'ops', parentId: 'ceo', title: 'Operations' },
  { id: 'fe', parentId: 'eng', title: 'Frontend' },
  { id: 'be', parentId: 'eng', title: 'Backend' },
];

const nestedData: OrgChartInput = {
  id: 'ceo',
  title: 'CEO',
  children: [
    {
      id: 'eng',
      title: 'Engineering',
      children: [
        { id: 'fe', title: 'Frontend' },
        { id: 'be', title: 'Backend' },
      ],
    },
    { id: 'ops', title: 'Operations' },
  ],
};

function nodePositions(container: HTMLElement) {
  return Array.from(container.querySelectorAll('[data-testid="org-chart-node"]')).map((el) => ({
    id: el.getAttribute('data-node-id'),
    left: (el as HTMLElement).style.left,
    top: (el as HTMLElement).style.top,
  }));
}

describe('OrgChart', () => {
  it('AC-01: flat dan nested menghasilkan posisi node identik', () => {
    const flat = render(<OrgChart data={flatData} />);
    const flatPositions = nodePositions(flat.container);
    flat.unmount();

    const nested = render(<OrgChart data={nestedData} />);
    const nestedPositions = nodePositions(nested.container);

    const sortById = (list: typeof flatPositions) =>
      [...list].sort((a, b) => String(a.id).localeCompare(String(b.id)));
    expect(sortById(nestedPositions)).toEqual(sortById(flatPositions));
    expect(nestedPositions).toHaveLength(5);
  });

  it('AC-02: id duplikat ditolak dengan pesan jelas tanpa throw', () => {
    const data: OrgChartInput = [
      { id: 'a', parentId: null, title: 'A' },
      { id: 'a', parentId: 'a', title: 'A lagi' },
    ];
    const { container } = render(<OrgChart data={data} />);
    const alert = screen.getByRole('alert');
    expect(alert.textContent).toContain('duplikat');
    expect(alert.textContent).toContain('"a"');
    expect(container.querySelector('[data-testid="org-chart-node"]')).toBeNull();
  });

  it('AC-02: parent tidak ditemukan ditolak', () => {
    const data: OrgChartInput = [
      { id: 'a', parentId: null, title: 'A' },
      { id: 'b', parentId: 'hilang', title: 'B' },
    ];
    render(<OrgChart data={data} />);
    expect(screen.getByRole('alert').textContent).toContain('"hilang"');
  });

  it('AC-02: siklus ditolak', () => {
    const data: OrgChartInput = [
      { id: 'a', parentId: 'b', title: 'A' },
      { id: 'b', parentId: 'a', title: 'B' },
      { id: 'root', parentId: null, title: 'Root' },
    ];
    render(<OrgChart data={data} />);
    expect(screen.getByRole('alert').textContent).toContain('Siklus');
  });

  it('AC-02: root lebih dari satu ditolak', () => {
    const data: OrgChartInput = [
      { id: 'a', parentId: null, title: 'A' },
      { id: 'b', parentId: null, title: 'B' },
    ];
    render(<OrgChart data={data} />);
    expect(screen.getByRole('alert').textContent).toContain('tepat satu root');
  });

  it('AC-03: layout deterministik pada kedalaman 3', () => {
    const first = render(<OrgChart data={flatData} />);
    const firstPositions = nodePositions(first.container);
    first.unmount();

    const second = render(<OrgChart data={flatData} />);
    expect(nodePositions(second.container)).toEqual(firstPositions);

    const byId = Object.fromEntries(firstPositions.map((p) => [p.id, p]));
    expect(byId['ceo'].top).toBe('0px');
    expect(byId['eng'].top).toBe('128px');
    expect(byId['fe'].top).toBe('256px');
    // Anak terurut stabil mengikuti urutan masuk data: fe sebelum be
    expect(parseFloat(byId['fe'].left)).toBeLessThan(parseFloat(byId['be'].left));
  });

  it('AC-03: node pada cabang collapsed tidak dirender beserta konektornya', () => {
    const { container } = render(<OrgChart data={flatData} defaultCollapsedIds={['eng']} />);
    const ids = Array.from(container.querySelectorAll('[data-testid="org-chart-node"]')).map((el) =>
      el.getAttribute('data-node-id'),
    );
    expect(ids).toEqual(['ceo', 'eng', 'ops']);
    expect(container.querySelectorAll('[data-testid="org-chart-connector"]')).toHaveLength(1);
  });

  it('003-02 AC-01: node kaya menampilkan avatar fallback inisial, badge, dan strip aksen token', () => {
    const data: OrgChartInput = [
      { id: 'ceo', parentId: null, title: 'Sinta Maharani', subtitle: 'CEO', badge: 'Eksekutif', accent: 'success' },
      { id: 'eng', parentId: 'ceo', title: 'Budi Santoso', subtitle: 'CTO', badge: 'Engineering', accent: 'info', avatarSrc: 'https://example.com/budi.png' },
    ];
    const { container } = render(<OrgChart data={data} />);
    expect(screen.getByText('Sinta Maharani')).toBeTruthy();
    expect(screen.getByText('CEO')).toBeTruthy();
    expect(screen.getByText('Eksekutif')).toBeTruthy();
    // Fallback inisial dari dua kata pertama
    expect(screen.getByText('SM')).toBeTruthy();
    const strips = container.querySelectorAll('[data-testid="org-chart-accent-strip"]');
    expect(strips).toHaveLength(2);
    // Token semantik, bukan hex literal inline
    expect(strips[0].className).toContain('bg-success');
    expect(strips[1].className).toContain('bg-info');
    expect(container.querySelector('[style*="background-color"]')).toBeNull();
    // Badge memakai varian semantik sesuai aksen
    expect(screen.getByText('Engineering').className).toContain('bg-info');
  });

  it('003-02 AC-02: renderNode mengganti isi tengah, expander dan strip tetap milik komponen', () => {
    const data: OrgChartInput = [
      { id: 'ceo', parentId: null, title: 'CEO Asli', accent: 'primary' },
      { id: 'eng', parentId: 'ceo', title: 'Engineering' },
    ];
    const { container } = render(
      <OrgChart data={data} renderNode={(node) => <span>Custom {node.id}</span>} />,
    );
    expect(screen.getByText('Custom ceo')).toBeTruthy();
    expect(screen.queryByText('CEO Asli')).toBeNull();
    expect(container.querySelector('[data-testid="org-chart-accent-strip"]')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Collapse CEO Asli' })).toBeTruthy();
  });

  it('003-02 AC-03: expander uncontrolled mengubah subtree dan konektor, onExpandedChange terpanggil', () => {
    const onExpandedChange = vi.fn();
    const { container } = render(<OrgChart data={flatData} onExpandedChange={onExpandedChange} />);
    expect(container.querySelectorAll('[data-testid="org-chart-node"]')).toHaveLength(5);
    fireEvent.click(screen.getByRole('button', { name: 'Collapse Engineering' }));
    const ids = Array.from(container.querySelectorAll('[data-testid="org-chart-node"]')).map((el) =>
      el.getAttribute('data-node-id'),
    );
    expect(ids).toEqual(['ceo', 'eng', 'ops']);
    expect(container.querySelectorAll('[data-testid="org-chart-connector"]')).toHaveLength(1);
    expect(onExpandedChange).toHaveBeenCalledWith(['ceo']);
    // Expand kembali
    fireEvent.click(screen.getByRole('button', { name: 'Perluas Engineering' }));
    expect(container.querySelectorAll('[data-testid="org-chart-node"]')).toHaveLength(5);
    expect(container.querySelectorAll('[data-testid="org-chart-connector"]')).toHaveLength(2);
    expect(onExpandedChange).toHaveBeenLastCalledWith(['ceo', 'eng']);
  });

  it('003-02 AC-03: mode controlled expandedIds tidak berubah tanpa prop baru', () => {
    const onExpandedChange = vi.fn();
    const { container } = render(
      <OrgChart data={flatData} expandedIds={['ceo', 'eng']} onExpandedChange={onExpandedChange} />,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Collapse Engineering' }));
    expect(onExpandedChange).toHaveBeenCalledWith(['ceo']);
    // Controlled: tetap terbuka karena expandedIds tidak berubah
    expect(container.querySelectorAll('[data-testid="org-chart-node"]')).toHaveLength(5);
  });

  it('003-02 AC-03: controlled expandedIds=[] merender hanya root', () => {
    const { container } = render(<OrgChart data={flatData} expandedIds={[]} />);
    const ids = Array.from(container.querySelectorAll('[data-testid="org-chart-node"]')).map((el) =>
      el.getAttribute('data-node-id'),
    );
    expect(ids).toEqual(['ceo']);
    expect(container.querySelectorAll('[data-testid="org-chart-connector"]')).toHaveLength(0);
  });

  it('003-02 AC-04: onSelect menerima node ternormalisasi, selectedId menandai aria-selected, disabled tidak bisa dipilih', () => {
    const onSelect = vi.fn();
    const data: OrgChartInput = [
      { id: 'ceo', parentId: null, title: 'CEO' },
      { id: 'eng', parentId: 'ceo', title: 'Engineering', disabled: true },
    ];
    const { container } = render(<OrgChart data={data} selectedId="ceo" onSelect={onSelect} />);
    const ceoEl = container.querySelector('[data-node-id="ceo"]');
    expect(ceoEl?.getAttribute('aria-selected')).toBe('true');
    expect(ceoEl?.className).toContain('border-primary');
    fireEvent.click(ceoEl as HTMLElement);
    expect(onSelect).toHaveBeenCalledWith(expect.objectContaining({ id: 'ceo', title: 'CEO', hasChildren: true, depth: 0 }));
    const engEl = container.querySelector('[data-node-id="eng"]');
    expect(engEl?.getAttribute('aria-selected')).toBe('false');
    fireEvent.click(engEl as HTMLElement);
    expect(onSelect).toHaveBeenCalledTimes(1);
  });

  it('003-02 AC-04: klik expander tidak memanggil onSelect', () => {
    const onSelect = vi.fn();
    render(<OrgChart data={flatData} onSelect={onSelect} />);
    fireEvent.click(screen.getByRole('button', { name: 'Collapse Engineering' }));
    expect(onSelect).not.toHaveBeenCalled();
  });

  it('003-02 AC-01: expander hanya untuk node beranak dan berukuran minimal 32x32', () => {
    const { container } = render(<OrgChart data={flatData} />);
    const buttons = Array.from(container.querySelectorAll('button'));
    // ceo + eng
    expect(buttons).toHaveLength(2);
    for (const button of buttons) {
      expect(button.className).toContain('h-8');
      expect(button.className).toContain('w-8');
    }
  });

  it('AC-04: satu path elbow per parent dengan stroke token border', () => {
    const { container } = render(<OrgChart data={flatData} />);
    const paths = container.querySelectorAll('[data-testid="org-chart-connector"]');
    // Parent dengan anak: ceo (2 anak) + eng (2 anak)
    expect(paths).toHaveLength(2);
    for (const path of Array.from(paths)) {
      expect(path.getAttribute('stroke')).toBe('var(--border)');
      expect(path.getAttribute('stroke-width')).toBe('2');
      expect(path.getAttribute('d')).toContain('H');
      expect(path.getAttribute('d')).toContain('V');
    }
  });
});
