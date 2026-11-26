import { describe, it, expect, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { FileInput } from './file-input';

function selectFile(container: HTMLElement, file: File) {
  const input = container.querySelector('input[type="file"]');
  if (!input) throw new Error('file input not found');
  fireEvent.change(input, { target: { files: [file] } });
}

const englishMessages = {
  dropzoneLabel: 'CSV upload dropzone',
  clickToUpload: 'Click to upload',
  dragAndDrop: 'or drag and drop',
  removeFile: (name: string) => `Remove ${name}`,
  fileTooLarge: (name: string, max: string) => `${name} exceeds ${max}`,
  tooManyFiles: (max: number) => `At most ${max} files`,
};

describe('FileInput component', () => {
  it('keeps Indonesian default copy and append behaviour without new props', () => {
    const onChange = vi.fn();
    const existing = new File(['a'], 'a.csv', { type: 'text/csv' });
    const next = new File(['b'], 'b.csv', { type: 'text/csv' });
    const { container } = render(<FileInput value={[existing]} onChange={onChange} />);

    expect(screen.getByRole('region', { name: 'File upload dropzone' })).toBeDefined();
    expect(screen.getByText('Click to upload')).toBeDefined();
    expect(screen.getByRole('button', { name: 'Remove a.csv' })).toBeDefined();

    selectFile(container, next);
    expect(onChange).toHaveBeenCalledWith([existing, next]);
  });

  it('replaces the active file when replaceOnSelect is enabled', () => {
    const onChange = vi.fn();
    const existing = new File(['a'], 'a.csv', { type: 'text/csv' });
    const next = new File(['b'], 'b.csv', { type: 'text/csv' });
    const { container } = render(
      <FileInput value={[existing]} onChange={onChange} maxFiles={1} replaceOnSelect />
    );

    selectFile(container, next);
    expect(onChange).toHaveBeenCalledWith([next]);
  });

  it('keeps the active file when a replacement is invalid', () => {
    const onChange = vi.fn();
    const existing = new File(['a'], 'a.csv', { type: 'text/csv' });
    const tooBig = new File(['123456'], 'big.csv', { type: 'text/csv' });
    const { container } = render(
      <FileInput
        value={[existing]}
        onChange={onChange}
        maxFiles={1}
        maxSize={5}
        replaceOnSelect
        messages={englishMessages}
      />
    );

    selectFile(container, tooBig);
    expect(onChange).not.toHaveBeenCalled();
    expect(screen.getByRole('alert').textContent).toContain('big.csv exceeds');
    expect(screen.getByText('a.csv')).toBeDefined();
  });

  it('uses configured messages for dropzone, list, remove, and too-many errors', () => {
    const fileA = new File(['a'], 'a.csv', { type: 'text/csv' });
    const fileB = new File(['b'], 'b.csv', { type: 'text/csv' });
    const { container } = render(
      <FileInput value={[fileA]} maxFiles={1} messages={englishMessages} onChange={vi.fn()} />
    );

    expect(screen.getByRole('region', { name: 'CSV upload dropzone' })).toBeDefined();
    expect(screen.getByText('Click to upload')).toBeDefined();
    const remove = screen.getByRole('button', { name: 'Remove a.csv' });
    expect(remove.className).toContain('h-11');
    expect(remove.className).toContain('w-11');

    selectFile(container, fileB);
    expect(screen.getByRole('alert').textContent).toContain('At most 1 files');
  });

  it('removes a file and links helper/error descriptions to the input', () => {
    const onChange = vi.fn();
    const existing = new File(['a'], 'a.csv', { type: 'text/csv' });
    const { container } = render(
      <FileInput id="upload" value={[existing]} onChange={onChange} helperText="CSV only" />
    );

    const input = container.querySelector('input[type="file"]');
    expect(input?.getAttribute('aria-describedby')).toContain('-helper');
    fireEvent.click(screen.getByRole('button', { name: 'Remove a.csv' }));
    expect(onChange).toHaveBeenCalledWith([]);
  });

  it('supports keyboard activation of the dropzone', () => {
    const { container } = render(<FileInput value={[]} />);
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;
    const clickSpy = vi.spyOn(input, 'click');
    fireEvent.keyDown(screen.getByRole('region', { name: 'File upload dropzone' }), { key: 'Enter' });
    expect(clickSpy).toHaveBeenCalled();
  });
});
