/** @vitest-environment jsdom */
import { afterEach, describe, expect, it, vi } from 'vitest';
import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import RichTextEditorPage from './page';

type EditorElement = HTMLElement & {
  editor: { commands: { setContent: (content: string) => void } };
};

async function renderPage() {
  const view = render(<RichTextEditorPage />);
  await waitFor(() => expect(screen.getByText('47 words')).toBeTruthy());
  return view;
}

function option(group: string, name: string) {
  return within(screen.getByRole('radiogroup', { name: group })).getByRole('radio', { name });
}

function setEditorContent(container: HTMLElement, content: string) {
  const element = container.querySelector('.ProseMirror') as EditorElement;
  act(() => element.editor.commands.setContent(content));
}

function reset() {
  fireEvent.click(screen.getByRole('button', { name: 'Reset demo' }));
}

describe('RichTextEditorPage CR-096', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('starts with the example document and a word count that follows the content', async () => {
    const { container } = await renderPage();
    expect(screen.getByRole('heading', { name: 'Formatting in practice' })).toBeTruthy();

    setEditorContent(container, '<p>one two</p>');
    await waitFor(() => expect(screen.getByText('2 words')).toBeTruthy());
  });

  it('provides a text fallback when the example image fails', async () => {
    const { container } = await renderPage();
    const image = container.querySelector('img');
    expect(image?.getAttribute('src')).toBe('/examples/rich-text-document.svg');
    expect(image?.getAttribute('alt')).toContain('Document');

    fireEvent.error(image!);
    expect(screen.getByText(/The example image is unavailable/)).toBeTruthy();

    reset();
    expect(screen.queryByText(/The example image is unavailable/)).toBeNull();
  });

  it('hides the toolbar in read only mode and restores mode, limit and content on reset', async () => {
    const { container } = await renderPage();
    setEditorContent(container, '<p>changed</p>');
    await waitFor(() => expect(screen.getByText('1 words')).toBeTruthy());

    fireEvent.click(option('Mode', 'Read only'));
    fireEvent.click(option('Character limit', '50'));
    expect(screen.queryByRole('toolbar', { name: 'Text formatting' })).toBeNull();

    reset();
    await waitFor(() => expect(screen.getByText('47 words')).toBeTruthy());
    expect(screen.getByRole('toolbar', { name: 'Text formatting' })).toBeTruthy();
    expect(option('Mode', 'Editable').getAttribute('aria-checked')).toBe('true');
    expect(option('Character limit', '10,000').getAttribute('aria-checked')).toBe('true');
  });

  it('keeps a value selected when the active option is pressed again', async () => {
    await renderPage();
    fireEvent.click(option('Mode', 'Editable'));
    expect(option('Mode', 'Editable').getAttribute('aria-checked')).toBe('true');
  });

  it('recovers from a load error through Try again and a finite loading state', async () => {
    await renderPage();
    vi.useFakeTimers();

    fireEvent.click(option('State', 'Load error'));
    expect(screen.getByText('Check your connection, then try again.')).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: 'Try again' }));
    expect(screen.getByText('Loading editor…')).toBeTruthy();
    expect(option('State', 'Loading').getAttribute('aria-checked')).toBe('true');

    act(() => {
      vi.advanceTimersByTime(1500);
    });
    expect(screen.queryByText('Loading editor…')).toBeNull();
    expect(screen.queryByText('Check your connection, then try again.')).toBeNull();
    expect(option('State', 'Idle').getAttribute('aria-checked')).toBe('true');
  });

  it('cancels the loading timer when another state is chosen first', async () => {
    await renderPage();
    vi.useFakeTimers();

    fireEvent.click(option('State', 'Loading'));
    fireEvent.click(option('State', 'Load error'));
    act(() => {
      vi.advanceTimersByTime(1500);
    });

    expect(screen.getByText('Check your connection, then try again.')).toBeTruthy();
    expect(option('State', 'Load error').getAttribute('aria-checked')).toBe('true');
  });

  it('warns when the content is over the 50 character limit', async () => {
    await renderPage();
    expect(screen.queryByTestId('rte-counter-alert')).toBeNull();

    fireEvent.click(option('Character limit', '50'));
    await waitFor(() =>
      expect(screen.getByTestId('rte-counter-alert').textContent).toContain('characters over the limit'),
    );
  });
});
