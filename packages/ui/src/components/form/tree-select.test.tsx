import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { TreeSelect, type TreeSelectNode } from './tree-select';

const OPTIONS: TreeSelectNode[] = [
  { id: 'el', parentId: null, label: 'Elektronik' },
  { id: 'hp', parentId: 'el', label: 'HP' },
  { id: 'android', parentId: 'hp', label: 'Android' },
  { id: 'ios', parentId: 'hp', label: 'iOS' },
  { id: 'laptop', parentId: 'el', label: 'Laptop' },
  { id: 'pakaian', parentId: null, label: 'Pakaian' },
];

function openPopover() {
  fireEvent.click(screen.getByRole('combobox'));
}

describe('TreeSelect', () => {
  it('renders trigger with placeholder', () => {
    render(<TreeSelect options={OPTIONS} placeholder="Pilih kategori" />);
    expect(screen.getByRole('combobox')).toBeDefined();
    expect(screen.getByText('Pilih kategori')).toBeDefined();
  });

  it('selects node, fills value, and closes (single)', () => {
    const onChange = vi.fn();
    render(<TreeSelect options={OPTIONS} onChange={onChange} />);
    openPopover();

    fireEvent.click(screen.getByText('Elektronik'));
    fireEvent.click(screen.getByText('HP'));
    fireEvent.click(screen.getByText('Android'));

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange.mock.calls[0][0]).toBe('android');
    // Popover tertutup setelah memilih
    expect(screen.queryByRole('tree')).toBeNull();
  });

  it('auto-expands ancestors when opened with deep value', () => {
    render(<TreeSelect options={OPTIONS} value="android" onChange={() => undefined} />);
    expect(screen.getByRole('combobox').textContent).toContain('Android');

    openPopover();
    // Ancestors ter-expand: HP dan Android langsung terlihat di dalam tree
    const tree = screen.getByRole('tree');
    expect(within(tree).getByText('HP')).toBeDefined();
    expect(within(tree).getByText('Android')).toBeDefined();
  });

  it('supports multiple with max 3 tags + collapse count', () => {
    const onChange = vi.fn();
    render(
      <TreeSelect
        options={OPTIONS}
        multiple
        value={['android', 'ios', 'laptop', 'pakaian', 'hp']}
        onChange={onChange}
      />
    );
    const trigger = screen.getByRole('combobox');
    expect(trigger.textContent).toContain('Android');
    expect(trigger.textContent).toContain('+2');
    expect(trigger.textContent).not.toContain('Pakaian');
  });

  it('toggles nodes in multiple mode and stays open', () => {
    const onChange = vi.fn();
    render(<TreeSelect options={OPTIONS} multiple value={[]} onChange={onChange} />);
    openPopover();

    fireEvent.click(screen.getByText('Elektronik'));
    fireEvent.click(screen.getByText('Laptop'));

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange.mock.calls[0][0]).toEqual(['laptop']);
    // Tetap terbuka untuk memilih lagi
    expect(screen.getByRole('tree')).toBeDefined();
  });

  it('clears value via clear button', () => {
    const onChange = vi.fn();
    render(<TreeSelect options={OPTIONS} value="android" onChange={onChange} />);
    fireEvent.click(screen.getByLabelText('Bersihkan pilihan'));
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange.mock.calls[0][0]).toBe('');
  });

  it('filters nodes by label', () => {
    render(<TreeSelect options={OPTIONS} onChange={() => undefined} />);
    openPopover();
    fireEvent.change(screen.getByPlaceholderText('Search...'), {
      target: { value: 'lap' },
    });
    expect(screen.getByText('Laptop')).toBeDefined();
    expect(screen.queryByText('Pakaian')).toBeNull();
  });

  // C13: empty string = tidak ada pilihan, placeholder tetap tampil
  it('treats empty string value as no selection and keeps placeholder', () => {
    render(<TreeSelect options={OPTIONS} value="" placeholder="Pilih kategori" />);
    expect(screen.getByText('Pilih kategori')).toBeDefined();
    expect(screen.queryByLabelText('Bersihkan pilihan')).toBeNull();
  });

  it('links error to trigger with aria-invalid and a single alert', () => {
    render(<TreeSelect options={OPTIONS} label="Category" error="Category is required" />);
    const trigger = screen.getByRole('combobox');
    expect(trigger.getAttribute('aria-invalid')).toBe('true');
    const alert = screen.getByRole('alert');
    expect(alert.textContent).toContain('Category is required');
    expect(trigger.getAttribute('aria-describedby')).toBe(alert.id);
    expect(alert.id).not.toBe('');
    // Error tetap satu sumber kebenaran saat popover dibuka
    fireEvent.click(trigger);
    expect(screen.getAllByRole('alert')).toHaveLength(1);
  });

  it('renders clear and tag-remove as sibling buttons outside the trigger', () => {
    const onChange = vi.fn();
    render(
      <TreeSelect
        options={OPTIONS}
        multiple
        value={['android', 'ios']}
        onChange={onChange}
      />
    );
    const trigger = screen.getByRole('combobox');
    const removeButtons = screen.getAllByRole('button', { name: /^Hapus / });
    expect(removeButtons).toHaveLength(2);
    for (const removeButton of removeButtons) {
      expect(removeButton.tagName).toBe('BUTTON');
      expect(trigger.contains(removeButton)).toBe(false);
    }
    fireEvent.click(removeButtons[0]);
    expect(onChange).toHaveBeenCalledWith(['ios'], expect.anything());

    const clear = screen.getByRole('button', { name: 'Bersihkan pilihan' });
    expect(trigger.contains(clear)).toBe(false);
    fireEvent.click(clear);
    expect(document.activeElement).toBe(trigger);
  });

  it('filters out empty strings from multiple values', () => {
    render(
      <TreeSelect options={OPTIONS} multiple value={['', 'android']} placeholder="Pilih kategori" />
    );
    const trigger = screen.getByRole('combobox');
    expect(trigger.textContent).toContain('Android');
    expect(trigger.textContent).not.toContain('Pilih kategori');
    // Hanya 1 tag valid, tidak ada chip kosong
    expect(screen.queryByLabelText('Hapus ')).toBeNull();
  });
});
