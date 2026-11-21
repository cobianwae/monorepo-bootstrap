import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Cascader, type CascaderNode } from './cascader';

const OPTIONS: CascaderNode[] = [
  { id: 'id', parentId: null, label: 'ID' },
  { id: 'jabar', parentId: 'id', label: 'Jawa Barat' },
  { id: 'jatim', parentId: 'id', label: 'Jawa Timur' },
  { id: 'bdg', parentId: 'jabar', label: 'Bandung', isLeaf: true },
  { id: 'bgr', parentId: 'jabar', label: 'Bogor', isLeaf: true },
  { id: 'sby', parentId: 'jatim', label: 'Surabaya', isLeaf: true },
];

function openDropdown() {
  fireEvent.click(screen.getByRole('combobox'));
}

describe('Cascader', () => {
  it('renders trigger with placeholder', () => {
    render(<Cascader options={OPTIONS} placeholder="Pilih wilayah" />);
    expect(screen.getByRole('combobox')).toBeDefined();
    expect(screen.getByText('Pilih wilayah')).toBeDefined();
  });

  it('navigates 3 levels and selects leaf with full path', async () => {
    const onChange = vi.fn();
    render(<Cascader options={OPTIONS} onChange={onChange} />);
    openDropdown();

    fireEvent.click(await screen.findByRole('option', { name: 'ID' }));
    fireEvent.click(await screen.findByRole('option', { name: 'Jawa Barat' }));
    fireEvent.click(await screen.findByRole('option', { name: 'Bandung' }));

    await waitFor(() => expect(onChange).toHaveBeenCalledTimes(1));
    expect(onChange.mock.calls[0][0]).toEqual(['id', 'jabar', 'bdg']);
  });

  it('supports displayMode last (only leaf label)', () => {
    render(
      <Cascader options={OPTIONS} value={['id', 'jabar', 'bdg']} displayMode="last" onChange={() => undefined} />
    );
    expect(screen.getByRole('combobox').textContent).toContain('Bandung');
    expect(screen.getByRole('combobox').textContent).not.toContain('Jawa Barat');
  });

  it('supports displayMode full (joined path)', () => {
    render(
      <Cascader options={OPTIONS} value={['id', 'jabar', 'bdg']} displayMode="full" onChange={() => undefined} />
    );
    expect(screen.getByRole('combobox').textContent).toContain('ID');
    expect(screen.getByRole('combobox').textContent).toContain('Jawa Barat');
    expect(screen.getByRole('combobox').textContent).toContain('Bandung');
  });

  it('lazy loads children per column', async () => {
    const loadChildren = vi.fn(async (parentId: string | null) => {
      if (parentId === 'id') return [{ id: 'jabar', parentId: 'id', label: 'Jawa Barat' }];
      if (parentId === 'jabar') return [{ id: 'bdg', parentId: 'jabar', label: 'Bandung', isLeaf: true }];
      return [];
    });
    const onChange = vi.fn();
    render(
      <Cascader
        options={[{ id: 'id', parentId: null, label: 'ID' }]}
        loadChildren={loadChildren}
        onChange={onChange}
      />
    );
    openDropdown();

    fireEvent.click(await screen.findByRole('option', { name: 'ID' }));
    await waitFor(() => expect(loadChildren).toHaveBeenCalledWith('id'));
    fireEvent.click(await screen.findByRole('option', { name: 'Jawa Barat' }));
    fireEvent.click(await screen.findByRole('option', { name: 'Bandung' }));

    await waitFor(() => expect(onChange).toHaveBeenCalledTimes(1));
    expect(onChange.mock.calls[0][0]).toEqual(['id', 'jabar', 'bdg']);
  });

  it('clears value via clear button', () => {
    const onChange = vi.fn();
    render(<Cascader options={OPTIONS} value={['id', 'jabar', 'bdg']} onChange={onChange} />);
    fireEvent.click(screen.getByRole('button', { name: 'Clear selection' }));
    expect(onChange).toHaveBeenCalledWith([], []);
  });

  it('disables trigger when disabled', () => {
    render(<Cascader options={OPTIONS} disabled />);
    expect((screen.getByRole('combobox') as HTMLButtonElement).disabled).toBe(true);
  });

  it('shows error message with role alert', () => {
    render(<Cascader options={OPTIONS} error="Wilayah wajib dipilih" />);
    expect(screen.getByRole('alert').textContent).toContain('Wilayah wajib dipilih');
  });

  it('searches flat and selects result with full path', async () => {
    const onChange = vi.fn();
    render(<Cascader options={OPTIONS} onChange={onChange} />);
    openDropdown();
    const input = screen.getByLabelText('Search...');
    fireEvent.change(input, { target: { value: 'bogor' } });
    fireEvent.click(await screen.findByRole('option', { name: /Bogor/ }));
    await waitFor(() => expect(onChange).toHaveBeenCalledTimes(1));
    expect(onChange.mock.calls[0][0]).toEqual(['id', 'jabar', 'bgr']);
  });
});
