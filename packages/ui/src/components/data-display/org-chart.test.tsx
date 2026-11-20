import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
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
    expect(container.querySelectorAll('path')).toHaveLength(1);
  });

  it('AC-04: satu path elbow per parent dengan stroke token border', () => {
    const { container } = render(<OrgChart data={flatData} />);
    const paths = container.querySelectorAll('path');
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
