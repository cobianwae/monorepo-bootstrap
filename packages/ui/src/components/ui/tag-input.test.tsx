import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { useState } from 'react';
import { TagInput } from './tag-input';

function StatefulTagInput(props: Omit<React.ComponentProps<typeof TagInput>, 'value' | 'onChange'>) {
  const [value, setValue] = useState<string[]>([]);
  return <TagInput {...props} value={value} onChange={setValue} />;
}

describe('TagInput component', () => {
  it('renders existing tags', () => {
    render(<TagInput value={['React', 'Vue']} onChange={() => undefined} />);
    expect(screen.getByText('React')).toBeDefined();
    expect(screen.getByText('Vue')).toBeDefined();
  });

  it('adds a tag when pressing Enter', () => {
    const onChange = vi.fn();
    render(<TagInput value={[]} onChange={onChange} />);
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'Svelte' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(onChange).toHaveBeenCalledWith(['Svelte']);
  });

  it('splits comma-separated input on paste', () => {
    const onChange = vi.fn();
    render(<TagInput value={[]} onChange={onChange} />);
    const input = screen.getByRole('textbox');
    fireEvent.paste(input, {
      clipboardData: { getData: () => 'React, Vue, Svelte' },
    });
    expect(onChange).toHaveBeenCalledWith(['React', 'Vue', 'Svelte']);
  });

  it('removes the last tag with Backspace on empty input', () => {
    const onChange = vi.fn();
    render(<TagInput value={['React', 'Vue']} onChange={onChange} />);
    const input = screen.getByRole('textbox');
    fireEvent.keyDown(input, { key: 'Backspace' });
    expect(onChange).toHaveBeenCalledWith(['React']);
  });

  it('respects maxTags limit with controlled state', () => {
    render(<StatefulTagInput maxTags={3} />);
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'React' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    fireEvent.change(input, { target: { value: 'Vue' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    fireEvent.change(input, { target: { value: 'Svelte' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    fireEvent.change(input, { target: { value: 'Angular' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    act(() => undefined);
    expect(screen.getByText('React')).toBeDefined();
    expect(screen.getByText('Vue')).toBeDefined();
    expect(screen.getByText('Svelte')).toBeDefined();
    expect(screen.queryByText('Angular')).toBeNull();
  });

  it('prevents duplicates by default', () => {
    const onChange = vi.fn();
    render(<TagInput value={['React']} onChange={onChange} />);
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'React' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(onChange).not.toHaveBeenCalled();
  });
});