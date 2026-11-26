import { describe, it, expect, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { OrgChart, getAncestors, type OrgChartInput } from './org-chart';

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

  it('AC-02: id Duplicate ID ditolak dengan pesan jelas tanpa throw', () => {
    const data: OrgChartInput = [
      { id: 'a', parentId: null, title: 'A' },
      { id: 'a', parentId: 'a', title: 'A lagi' },
    ];
    const { container } = render(<OrgChart data={data} />);
    const alert = screen.getByRole('alert');
    expect(alert.textContent).toContain('Duplicate ID');
    expect(alert.textContent).toContain('"a"');
    expect(container.querySelector('[data-testid="org-chart-node"]')).toBeNull();
  });

  it('AC-02: parent was not found ditolak', () => {
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
    expect(screen.getByRole('alert').textContent).toContain('Cycle detected');
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
    const buttons = Array.from(container.querySelectorAll('button')).filter((button) =>
      /^(Collapse|Perluas) /.test(button.getAttribute('aria-label') ?? ''),
    );
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

  it('003-03 AC-01: kanvas role tree + treeitem membawa level/expanded/selected tanpa Duplicate ID', () => {
    const { container } = render(<OrgChart data={flatData} selectedId="eng" />);
    const tree = screen.getByRole('tree', { name: 'Org chart' });
    expect(tree).toBeTruthy();
    // Single source of truth: tidak ada pohon tersembunyi terpisah
    expect(container.querySelectorAll('[role="tree"]')).toHaveLength(1);
    expect(container.querySelector('[role="group"]')).toBeNull();
    const items = screen.getAllByRole('treeitem');
    expect(items).toHaveLength(5);
    const byId = Object.fromEntries(items.map((el) => [el.getAttribute('data-node-id'), el]));
    expect(byId['ceo'].getAttribute('aria-level')).toBe('1');
    expect(byId['eng'].getAttribute('aria-level')).toBe('2');
    expect(byId['fe'].getAttribute('aria-level')).toBe('3');
    expect(byId['ceo'].getAttribute('aria-expanded')).toBe('true');
    expect(byId['fe'].getAttribute('aria-expanded')).toBeNull();
    expect(byId['eng'].getAttribute('aria-selected')).toBe('true');
    expect(byId['ceo'].getAttribute('aria-selected')).toBe('false');
  });

  it('003-03 AC-01: roving tabindex — satu treeitem tabbable, disabled -1', () => {
    const data: OrgChartInput = [
      { id: 'ceo', parentId: null, title: 'CEO' },
      { id: 'eng', parentId: 'ceo', title: 'Engineering', disabled: true },
      { id: 'ops', parentId: 'ceo', title: 'Operations' },
    ];
    const { container } = render(<OrgChart data={data} />);
    const items = Array.from(container.querySelectorAll('[role="treeitem"]')) as HTMLElement[];
    const tabbable = items.filter((el) => el.tabIndex === 0);
    expect(tabbable).toHaveLength(1);
    expect(tabbable[0].getAttribute('data-node-id')).toBe('ceo');
    const eng = items.find((el) => el.getAttribute('data-node-id') === 'eng');
    expect(eng?.tabIndex).toBe(-1);
    expect(eng?.getAttribute('aria-disabled')).toBe('true');
    expect(eng?.className).toContain('focus-visible:ring-ring');
  });

  it('003-03 AC-02: navigasi panah DFS, Home/End, → expand/masuk anak, ← collapse/ke parent', () => {
    const { container } = render(<OrgChart data={flatData} />);
    const node = (id: string) => container.querySelector(`[data-node-id="${id}"]`) as HTMLElement;
    node('ceo').focus();
    expect(document.activeElement).toBe(node('ceo'));
    fireEvent.keyDown(node('ceo'), { key: 'ArrowDown' });
    expect(document.activeElement).toBe(node('eng'));
    fireEvent.keyDown(node('eng'), { key: 'ArrowDown' });
    // Urutan DFS: ceo → eng → fe → be → ops
    expect(document.activeElement).toBe(node('fe'));
    fireEvent.keyDown(node('fe'), { key: 'ArrowDown' });
    expect(document.activeElement).toBe(node('be'));
    fireEvent.keyDown(node('be'), { key: 'ArrowDown' });
    expect(document.activeElement).toBe(node('ops'));
    fireEvent.keyDown(node('ops'), { key: 'ArrowUp' });
    expect(document.activeElement).toBe(node('be'));
    fireEvent.keyDown(node('be'), { key: 'Home' });
    expect(document.activeElement).toBe(node('ceo'));
    fireEvent.keyDown(node('ceo'), { key: 'End' });
    expect(document.activeElement).toBe(node('ops'));
    // ← pada daun kembali ke parent
    fireEvent.keyDown(node('ops'), { key: 'ArrowLeft' });
    expect(document.activeElement).toBe(node('ceo'));
  });

  it('003-03 AC-02: ← collapse parent, → expand ulang via keyboard', () => {
    const { container } = render(<OrgChart data={flatData} />);
    const node = (id: string) => container.querySelector(`[data-node-id="${id}"]`) as HTMLElement;
    node('eng').focus();
    fireEvent.keyDown(node('eng'), { key: 'ArrowLeft' });
    expect(container.querySelector('[data-node-id="fe"]')).toBeNull();
    expect(screen.getByRole('button', { name: 'Perluas Engineering' })).toBeTruthy();
    fireEvent.keyDown(node('eng'), { key: 'ArrowRight' });
    expect(container.querySelector('[data-node-id="fe"]')).toBeTruthy();
    // → pada parent terbuka masuk ke anak pertama
    fireEvent.keyDown(node('eng'), { key: 'ArrowRight' });
    expect(document.activeElement).toBe(node('fe'));
  });

  it('003-03 AC-02: Enter dan Space memanggil onSelect tanpa toggle', () => {
    const onSelect = vi.fn();
    const { container } = render(<OrgChart data={flatData} onSelect={onSelect} />);
    const eng = container.querySelector('[data-node-id="eng"]') as HTMLElement;
    eng.focus();
    fireEvent.keyDown(eng, { key: 'Enter' });
    expect(onSelect).toHaveBeenCalledWith(expect.objectContaining({ id: 'eng' }));
    fireEvent.keyDown(eng, { key: ' ' });
    expect(onSelect).toHaveBeenCalledTimes(2);
    // Expand state tidak berubah oleh Enter/Space
    expect(container.querySelectorAll('[data-testid="org-chart-node"]')).toHaveLength(5);
    expect(screen.getByRole('button', { name: 'Collapse Engineering' })).toBeTruthy();
  });

  it('003-03 AC-02/03: keyboard melewati node disabled', () => {
    const data: OrgChartInput = [
      { id: 'ceo', parentId: null, title: 'CEO' },
      { id: 'eng', parentId: 'ceo', title: 'Engineering', disabled: true },
      { id: 'ops', parentId: 'ceo', title: 'Operations' },
    ];
    const { container } = render(<OrgChart data={data} />);
    const node = (id: string) => container.querySelector(`[data-node-id="${id}"]`) as HTMLElement;
    node('ceo').focus();
    fireEvent.keyDown(node('ceo'), { key: 'ArrowDown' });
    expect(document.activeElement).toBe(node('ops'));
    fireEvent.keyDown(node('ops'), { key: 'ArrowUp' });
    expect(document.activeElement).toBe(node('ceo'));
  });

  it('003-03 AC-03: expander keyboard dapat difokus, label dinamis, focus ring token', () => {
    const { container } = render(<OrgChart data={flatData} />);
    const expander = screen.getByRole('button', { name: 'Collapse Engineering' });
    expect(expander.className).toContain('h-8');
    expect(expander.className).toContain('w-8');
    expect(expander.className).toContain('focus-visible:ring-ring');
    // 2 expander (ceo + eng) + 3 kontrol zoom
    expect(container.querySelectorAll('button')).toHaveLength(5);
    fireEvent.click(expander);
    expect(screen.getByRole('button', { name: 'Perluas Engineering' })).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Perluas Engineering' }));
    expect(screen.getByRole('button', { name: 'Collapse Engineering' })).toBeTruthy();
  });

  it('003-03 AC-04: transisi hanya berlaku dengan motion-safe (reduced-motion dimatikan)', () => {
    const { container } = render(<OrgChart data={flatData} />);
    const node = container.querySelector('[data-testid="org-chart-node"]') as HTMLElement;
    expect(node.className).toContain('motion-safe:transition-colors');
    const buttons = container.querySelectorAll('button');
    for (const button of Array.from(buttons)) {
      expect(button.className).toContain('motion-safe:transition-colors');
    }
    const icons = container.querySelectorAll('button[aria-label^="Collapse"] svg, button[aria-label^="Perluas"] svg');
    expect(icons.length).toBeGreaterThan(0);
    for (const icon of Array.from(icons)) {
      expect((icon as unknown as { className: { baseVal: string } }).className.baseVal ?? icon.getAttribute('class')).toContain('motion-safe:transition-transform');
    }
  });

  describe('003-04 pan/zoom/orientasi', () => {
    function treeEl(container: HTMLElement): HTMLElement {
      return container.querySelector('[role="tree"]') as HTMLElement;
    }

    it('003-04 AC-01: tombol zoom mengubah level dalam batas 0.5–2 step 0.25, reset kembali 100%', () => {
      const { container } = render(<OrgChart data={flatData} />);
      const level = () => screen.getByTestId('org-chart-zoom-level').textContent;
      expect(level()).toBe('100%');
      fireEvent.click(screen.getByRole('button', { name: 'Zoom in' }));
      expect(level()).toBe('125%');
      fireEvent.click(screen.getByRole('button', { name: 'Zoom out' }));
      expect(level()).toBe('100%');
      for (let i = 0; i < 8; i += 1) fireEvent.click(screen.getByRole('button', { name: 'Zoom in' }));
      expect(level()).toBe('200%');
      fireEvent.click(screen.getByRole('button', { name: 'Zoom in' }));
      expect(level()).toBe('200%');
      for (let i = 0; i < 8; i += 1) fireEvent.click(screen.getByRole('button', { name: 'Zoom out' }));
      expect(level()).toBe('50%');
      fireEvent.click(screen.getByRole('button', { name: 'Zoom out' }));
      expect(level()).toBe('50%');
      fireEvent.keyDown(screen.getByRole('region'), { key: 'ArrowRight' });
      fireEvent.click(screen.getByRole('button', { name: 'Reset zoom' }));
      expect(level()).toBe('100%');
      expect(treeEl(container).style.transform).toBe('translate(0px, 0px) scale(1)');
    });

    it('003-04 AC-01: zoomRange kustom mengatur batas', () => {
      render(<OrgChart data={flatData} zoomRange={{ min: 0.75, max: 1.5, step: 0.25 }} />);
      const level = () => screen.getByTestId('org-chart-zoom-level').textContent;
      for (let i = 0; i < 5; i += 1) fireEvent.click(screen.getByRole('button', { name: 'Zoom in' }));
      expect(level()).toBe('150%');
      for (let i = 0; i < 5; i += 1) fireEvent.click(screen.getByRole('button', { name: 'Zoom out' }));
      expect(level()).toBe('75%');
    });

    it('003-04 AC-01: Ctrl/Cmd+wheel zoom, wheel polos tidak dicegat', () => {
      render(<OrgChart data={flatData} />);
      const canvas = screen.getByRole('region');
      const level = () => screen.getByTestId('org-chart-zoom-level').textContent;
      const plain = fireEvent.wheel(canvas, { deltaY: -100 });
      expect(plain).toBe(true);
      expect(level()).toBe('100%');
      const zoomed = fireEvent.wheel(canvas, { ctrlKey: true, deltaY: -100 });
      expect(zoomed).toBe(false);
      expect(level()).toBe('125%');
      fireEvent.wheel(canvas, { metaKey: true, deltaY: 100 });
      expect(level()).toBe('100%');
    });

    it('003-04 AC-02: panah di kanvas menggeser konten 40px, +/−/0 zoom & reset', () => {
      const { container } = render(<OrgChart data={flatData} />);
      const canvas = screen.getByRole('region');
      fireEvent.keyDown(canvas, { key: 'ArrowRight' });
      expect(treeEl(container).style.transform).toBe('translate(40px, 0px) scale(1)');
      fireEvent.keyDown(canvas, { key: 'ArrowDown' });
      expect(treeEl(container).style.transform).toBe('translate(40px, 40px) scale(1)');
      fireEvent.keyDown(canvas, { key: '+' });
      expect(screen.getByTestId('org-chart-zoom-level').textContent).toBe('125%');
      fireEvent.keyDown(canvas, { key: '-' });
      expect(screen.getByTestId('org-chart-zoom-level').textContent).toBe('100%');
      fireEvent.keyDown(canvas, { key: '0' });
      expect(treeEl(container).style.transform).toBe('translate(0px, 0px) scale(1)');
    });

    it('003-04 AC-02: drag pointer menggeser konten', () => {
      const { container } = render(<OrgChart data={flatData} />);
      const canvas = screen.getByRole('region');
      fireEvent.pointerDown(canvas, { button: 0, clientX: 10, clientY: 10, pointerId: 1 });
      fireEvent.pointerMove(canvas, { clientX: 50, clientY: 30, pointerId: 1 });
      expect(treeEl(container).style.transform).toBe('translate(40px, 20px) scale(1)');
      fireEvent.pointerUp(canvas, { pointerId: 1 });
    });

    it('003-04 AC-03: kanvas region dan node adalah stop fokus terpisah; persen aria-live polite', () => {
      const { container } = render(<OrgChart data={flatData} />);
      const canvas = screen.getByRole('region', { name: 'Org chart canvas' });
      expect(canvas.getAttribute('tabindex')).toBe('0');
      expect(canvas.className).toContain('overflow-hidden');
      expect(screen.getByRole('button', { name: 'Zoom in' })).toBeTruthy();
      expect(screen.getByRole('button', { name: 'Zoom out' })).toBeTruthy();
      expect(screen.getByRole('button', { name: 'Reset zoom' })).toBeTruthy();
      const level = screen.getByTestId('org-chart-zoom-level');
      expect(level.getAttribute('aria-live')).toBe('polite');
      const activeNodes = screen.getAllByRole('treeitem').filter((el) => el.getAttribute('tabindex') === '0');
      expect(activeNodes).toHaveLength(1);
      fireEvent.keyDown(activeNodes[0], { key: 'ArrowDown' });
      expect(treeEl(container).style.transform).toBe('translate(0px, 0px) scale(1)');
    });

    it('003-04 AC-04: left-right menukar sumbu dan mirror konektor tanpa merusak layout', () => {
      const td = render(<OrgChart data={flatData} orientation="top-down" />);
      const tdPositions = nodePositions(td.container);
      const tdPaths = Array.from(td.container.querySelectorAll('[data-testid="org-chart-connector"]')).map((el) => el.getAttribute('d'));
      td.unmount();
      const lr = render(<OrgChart data={flatData} orientation="left-right" />);
      const lrPositions = nodePositions(lr.container);
      const lrPaths = Array.from(lr.container.querySelectorAll('[data-testid="org-chart-connector"]')).map((el) => el.getAttribute('d'));
      expect(lrPositions.map((p) => p.id)).toEqual(tdPositions.map((p) => p.id));
      for (let i = 0; i < tdPositions.length; i += 1) {
        expect(lrPositions[i].left).toBe(tdPositions[i].top);
        expect(lrPositions[i].top).toBe(tdPositions[i].left);
      }
      expect(lrPaths).toHaveLength(tdPaths.length);
      for (const d of lrPaths) {
        expect(d).toContain('H');
        expect(d).toContain('V');
      }
      expect(lrPositions[0].id).toBe('ceo');
      expect(lrPositions[0].left).toBe('0px');
    });
  });

  describe('003-05 state matrix, highlight, dan getAncestors', () => {
    it('AC-01: loading menampilkan skeleton 8 kotak dengan aria-busy', () => {
      const { container } = render(<OrgChart data={flatData} loading />);
      const busy = container.querySelector('[aria-busy="true"]');
      expect(busy).toBeTruthy();
      expect(container.querySelectorAll('[data-testid="org-chart-skeleton-box"]')).toHaveLength(8);
      expect(screen.queryByRole('tree')).toBeNull();
    });

    it('AC-01: data kosong menampilkan empty-state role=status dengan CTA keyboard', () => {
      const onEmptyAction = vi.fn();
      render(<OrgChart data={[]} emptyActionLabel="Muat data contoh" onEmptyAction={onEmptyAction} />);
      const status = screen.getByRole('status');
      expect(status.textContent).toContain('Belum ada data organisasi');
      const cta = screen.getByRole('button', { name: 'Muat data contoh' });
      fireEvent.click(cta);
      expect(onEmptyAction).toHaveBeenCalledTimes(1);
    });

    it('AC-01: error invalid menampilkan penyebab dan id pertama', () => {
      const data: OrgChartInput = [
        { id: 'a', parentId: null, title: 'A' },
        { id: 'b', parentId: 'missing', title: 'B' },
      ];
      render(<OrgChart data={data} />);
      const alert = screen.getByRole('alert');
      expect(alert.textContent).toContain('was not found');
      expect(alert.textContent).toContain('"b"');
    });

    it('AC-01: error eksternal tampil di atas kanvas dan diagram tetap tampil', () => {
      render(<OrgChart data={flatData} error="Gagal memuat data organisasi." />);
      expect(screen.getByRole('alert').textContent).toContain('Gagal memuat');
      expect(screen.getByRole('tree')).toBeTruthy();
      expect(screen.getAllByRole('treeitem').length).toBeGreaterThan(0);
    });

    it('AC-02: highlightedIds memberi ring dan data-highlighted pada node target', () => {
      const { container } = render(<OrgChart data={flatData} highlightedIds={['fe']} />);
      const target = container.querySelector('[data-node-id="fe"]');
      expect(target?.getAttribute('data-highlighted')).toBe('true');
      expect(target?.className).toContain('ring-2');
      expect(container.querySelector('[data-node-id="be"]')?.getAttribute('data-highlighted')).toBeNull();
    });

    it('AC-02: getAncestors mengembalikan path root sampai parent', () => {
      const flat = [
        { id: 'ceo', parentId: null, title: 'CEO' },
        { id: 'eng', parentId: 'ceo', title: 'Engineering' },
        { id: 'fe', parentId: 'eng', title: 'Frontend' },
      ];
      expect(getAncestors(flat, 'fe')).toEqual(['ceo', 'eng']);
      expect(getAncestors(flat, 'ceo')).toEqual([]);
      expect(getAncestors(flat, 'unknown')).toEqual([]);
    });
  });
});
