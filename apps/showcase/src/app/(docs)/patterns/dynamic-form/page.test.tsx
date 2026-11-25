/** @vitest-environment jsdom */
import { afterEach, beforeEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { act, cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import DynamicFormPage from './page';

const DRAFT_KEY = 'ds:dynamic-form-draft';
beforeEach(() => {
  // Isolasi storage antar tes, termasuk Node yang mengekspos Web Storage eksperimental.
  const data = new Map<string, string>();
  vi.stubGlobal('localStorage', {
    getItem: (key: string) => data.get(key) ?? null,
    setItem: (key: string, value: string) => { data.set(key, value); },
    removeItem: (key: string) => { data.delete(key); },
    clear: () => data.clear(),
    key: (index: number) => [...data.keys()][index] ?? null,
    get length() { return data.size; },
  } satisfies Storage);
});
afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

// Halaman memakai matchMedia untuk deteksi layar kecil; jsdom tidak menyediakannya.
beforeAll(() => {
  if (!HTMLElement.prototype.scrollIntoView) HTMLElement.prototype.scrollIntoView = () => {};
  if (!globalThis.ResizeObserver) {
    globalThis.ResizeObserver = class {
      observe() {}
      unobserve() {}
      disconnect() {}
    } as unknown as typeof ResizeObserver;
  }
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

describe('DynamicFormPage (CR-058 C05)', () => {
  it('associates labels with fields', () => {
    render(<DynamicFormPage />);
    expect((screen.getByLabelText('Project name') as HTMLInputElement).id).toBe('project-name');
    expect((screen.getByLabelText('Description') as HTMLTextAreaElement).id).toBe('project-desc');
    expect((screen.getByLabelText('Owner') as HTMLButtonElement).id).toBe('schedule-owner');
    expect((screen.getByLabelText('Sectors targeted') as HTMLButtonElement).id).toBe('audience-sectors');
    expect((screen.getByLabelText('Budget allocation') as HTMLInputElement).id).toBe('budget-amount');
    expect((screen.getByLabelText('Headcount') as HTMLInputElement).id).toBe('budget-headcount');
    expect(screen.getByLabelText('Email for member 1')).toBeDefined();
    expect(screen.getByLabelText('Role for member 1')).toBeDefined();
  });

  it('connects error message to field on invalid submit', async () => {
    render(<DynamicFormPage />);
    const nameInput = screen.getByLabelText('Project name') as HTMLInputElement;
    fireEvent.change(nameInput, { target: { value: '' } });
    fireEvent.click(screen.getByRole('button', { name: /Submit demo/i }));

    expect(await screen.findByText('The form needs your attention')).toBeDefined();
    expect(nameInput.getAttribute('aria-invalid')).toBe('true');
    expect(nameInput.getAttribute('aria-describedby')).toBe('err-project-name');
    const message = document.getElementById('err-project-name');
    expect(message?.textContent).toBe('Project name must be at least 3 characters.');
    // Pesan yang sama juga tercantum di summary (li), keduanya satu sumber error.
    expect(screen.getAllByText('Project name must be at least 3 characters.')).toHaveLength(2);
  });

  it('uses one h1, three section h2 headings, and eight group h3 headings (CR-071, CR-082)', () => {
    render(<DynamicFormPage />);
    expect(screen.getAllByRole('heading', { level: 1 }).map((h) => h.textContent)).toEqual(['Dynamic Form']);
    expect(screen.getAllByRole('heading', { level: 2 }).map((h) => h.textContent)).toEqual([
      'Interactive demo',
      'Try it',
      'Accessibility notes',
    ]);
    expect(screen.getAllByRole('heading', { level: 3 }).map((h) => h.textContent)).toEqual([
      'Project Information',
      'Schedule & Ownership',
      'Audience & Targeting',
      'Budget & Capacity',
      'Team Members',
      'Errors & validation',
      'Conditional & dynamic rows',
      'Autosave & status',
    ]);
  });

  it('describes the demo without production or navigation-guard claims (CR-071)', () => {
    const { container } = render(<DynamicFormPage />);
    const text = container.textContent ?? '';
    expect(text).toContain('The demo does not send email or publish anything.');
    expect(text).toContain('No email is sent.');
    expect(text).not.toMatch(/production-grade|real-time validation|dirty-state guard|navigation/i);
  });

  it('does not mark valid fields as invalid before submit', () => {
    render(<DynamicFormPage />);
    expect(screen.getByLabelText('Project name').getAttribute('aria-invalid')).toBeNull();
    expect(screen.getByLabelText('Project name').getAttribute('aria-describedby')).toBeNull();
  });
});

describe('DynamicFormPage fields and accessibility (CR-073)', () => {
  it('updates a role alone, autosaves it and restores it on reload', async () => {
    const view = render(<DynamicFormPage />);
    fireEvent.click(screen.getByLabelText('Role for member 1'));
    fireEvent.click(await screen.findByRole('option', { name: 'Viewer' }));
    expect(screen.getByLabelText('Role for member 1').textContent).toContain('Viewer');
    await waitFor(() => expect(JSON.parse(localStorage.getItem(DRAFT_KEY) ?? '{}').members?.[0].role).toBe('viewer'), { timeout: 2500 });
    view.unmount();
    render(<DynamicFormPage />);
    expect(screen.getByLabelText('Role for member 1').textContent).toContain('Viewer');
  });

  it('keeps zero members after autosave/reload and focuses new rows', async () => {
    const view = render(<DynamicFormPage />);
    fireEvent.click(screen.getByRole('button', { name: 'Remove member 1' }));
    expect(document.activeElement).toBe(screen.getByLabelText('Email for member 1'));
    fireEvent.click(screen.getByRole('button', { name: 'Remove member 1' }));
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Add member' }));
    expect(screen.getByText(/No team members/)).toBeDefined();
    await waitFor(() => expect(JSON.parse(localStorage.getItem(DRAFT_KEY) ?? '{}').members).toEqual([]), { timeout: 2500 });
    view.unmount();
    render(<DynamicFormPage />);
    expect(screen.queryByLabelText('Email for member 1')).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'Add member' }));
    expect(document.activeElement).toBe(screen.getByLabelText('Email for member 1'));
    expect(screen.getByRole('button', { name: 'Remove member 1' }).className).toContain('h-11 w-11');
  });

  it('focuses Add member when the last row is removed, even with preceding rows', () => {
    render(<DynamicFormPage />);
    fireEvent.click(screen.getByRole('button', { name: 'Remove member 2' }));
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Add member' }));
  });

  it('validates touched fields without marking a new form invalid and associates the switch helper', async () => {
    render(<DynamicFormPage />);
    expect(document.querySelector('[aria-invalid="true"]')).toBeNull();
    const email = screen.getByLabelText('Email for member 1');
    fireEvent.change(email, { target: { value: 'bad' } });
    expect(email.getAttribute('aria-invalid')).toBeNull();
    fireEvent.blur(email);
    await waitFor(() => expect(email.getAttribute('aria-invalid')).toBe('true'));
    expect(email.getAttribute('aria-describedby')).toBe('err-member-0-email');
    fireEvent.change(email, { target: { value: 'valid@example.com' } });
    await waitFor(() => expect(email.getAttribute('aria-invalid')).toBeNull());
    expect(screen.getByRole('switch', { name: 'Email notifications' }).getAttribute('aria-describedby')).toBe('audience-notify-help');
  });

  it('identifies duplicate email errors and links native and composite controls', async () => {
    render(<DynamicFormPage />);
    fireEvent.change(screen.getByLabelText('Email for member 1'), { target: { value: 'bad' } });
    fireEvent.change(screen.getByLabelText('Email for member 2'), { target: { value: 'also-bad' } });
    fireEvent.click(screen.getByRole('button', { name: 'Submit demo' }));
    const summary = await screen.findByRole('region', { name: 'The form needs your attention' });
    await waitFor(() => expect(document.activeElement).toBe(summary));
    const links = within(summary).getAllByRole('link');
    expect(links.map((link) => link.textContent)).toEqual([
      'Owner: Assign an owner.',
      'Member 1 email: Invalid email address.',
      'Member 2 email: Invalid email address.',
    ]);
    for (const link of links) {
      fireEvent.click(link);
      expect(document.activeElement?.id).toBe(link.getAttribute('href')?.slice(1));
    }
    expect(screen.queryByText(/2 invalid emails/)).toBeNull();
  });

  it('accepts a 200-character description and a same-day engagement window', async () => {
    const date = new Date(2026, 8, 1).toISOString();
    localStorage.setItem(DRAFT_KEY, JSON.stringify({
      project: { description: 'x'.repeat(200) },
      schedule: { owner: 'sarah@acme.io', period: { from: date, to: date } },
    }));
    render(<DynamicFormPage />);
    fireEvent.click(screen.getByRole('button', { name: 'Submit demo' }));
    await waitFor(() => expect(localStorage.getItem(DRAFT_KEY)).toBeNull());
    expect(screen.queryByRole('region', { name: 'The form needs your attention' })).toBeNull();
  });

  it('respects reduced motion on the route and conditional panel', () => {
    const { container } = render(<DynamicFormPage />);
    expect(container.firstElementChild?.className).toContain('motion-reduce:animate-none');
    expect(screen.getByText('Conditional section').closest('.animate-in')?.className).toContain('motion-reduce:animate-none');
  });
});

describe('DynamicFormPage draft lifecycle (CR-072)', () => {
  const editName = (value: string) => fireEvent.change(screen.getByLabelText('Project name'), { target: { value } });
  const advance = (ms = 1200) => act(() => vi.advanceTimersByTime(ms));

  it('debounces the latest edit and restores ordinary empty and invalid fields on remount', () => {
    vi.useFakeTimers();
    const view = render(<DynamicFormPage />);
    editName('First edit');
    advance(1000);
    editName('');
    advance(1000);
    expect(localStorage.getItem(DRAFT_KEY)).toBeNull();
    expect(screen.getByRole('status').textContent).toContain('waiting');
    advance(200);
    expect(screen.getByRole('status').textContent).toBe('Draft saved on this browser.');
    view.unmount();
    render(<DynamicFormPage />);
    expect((screen.getByLabelText('Project name') as HTMLInputElement).value).toBe('');
    expect(screen.getByRole('status').textContent).toContain('restored');
    expect(screen.queryByText('Unsaved changes')).toBeNull();
  });

  it.each([null, { from: null, to: null }])('restores partial drafts and explicitly cleared dates without using seed dates (%j)', (period) => {
    localStorage.setItem(DRAFT_KEY, JSON.stringify({ project: { name: 'x', description: '' }, schedule: { kickoff: null, period, owner: '' } }));
    render(<DynamicFormPage />);
    expect((screen.getByLabelText('Project name') as HTMLInputElement).value).toBe('x');
    expect((screen.getByLabelText('Description') as HTMLTextAreaElement).value).toBe('');
    expect(screen.getByRole('status').textContent).toContain('restored');
    expect(screen.getByLabelText('Kickoff date').textContent).not.toContain('2026');
    expect(screen.getByLabelText('Engagement window').textContent).not.toContain('2026');
  });

  it.each(['corrupt', 'unsafe shape', 'invalid date', 'unreadable'])('handles %s storage without claiming restoration', (kind) => {
    if (kind === 'corrupt') localStorage.setItem(DRAFT_KEY, '{bad');
    else if (kind === 'unsafe shape') localStorage.setItem(DRAFT_KEY, JSON.stringify({ project: { tags: 'not-an-array' } }));
    else if (kind === 'invalid date') localStorage.setItem(DRAFT_KEY, JSON.stringify({ schedule: { kickoff: 'not-a-date' } }));
    else vi.spyOn(localStorage, 'getItem').mockImplementation(() => { throw new Error('denied'); });
    render(<DynamicFormPage />);
    expect(screen.getByRole('status').textContent).toContain("Couldn't read");
    expect((screen.getByLabelText('Project name') as HTMLInputElement).value).toBe('Acme Data Platform');
  });

  it('reports write failure and can save after the next edit', () => {
    vi.useFakeTimers();
    const write = vi.spyOn(localStorage, 'setItem').mockImplementation(() => { throw new DOMException('Full', 'QuotaExceededError'); });
    render(<DynamicFormPage />);
    editName('Unsaved');
    advance();
    expect(screen.getByRole('status').textContent).toContain("Couldn't save");
    write.mockRestore();
    editName('Recovered');
    advance();
    expect(screen.getByRole('status').textContent).toBe('Draft saved on this browser.');
  });

  it('cancels pending writes on unmount', () => {
    vi.useFakeTimers();
    const view = render(<DynamicFormPage />);
    editName('Pending');
    view.unmount();
    advance();
    expect(localStorage.getItem(DRAFT_KEY)).toBeNull();
  });

  it('cancel preserves values and draft; confirm restores seed and prevents a pending write', async () => {
    localStorage.setItem(DRAFT_KEY, JSON.stringify({ project: { name: 'Stored' } }));
    render(<DynamicFormPage />);
    const trigger = screen.getByRole('button', { name: 'Reset demo' });
    fireEvent.click(trigger);
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect((screen.getByLabelText('Project name') as HTMLInputElement).value).toBe('Stored');
    expect(localStorage.getItem(DRAFT_KEY)).toContain('Stored');
    await waitFor(() => expect(document.activeElement).toBe(trigger));
    vi.useFakeTimers();
    editName('Pending');
    fireEvent.click(trigger);
    fireEvent.click(within(screen.getByRole('alertdialog')).getByRole('button', { name: 'Reset demo' }));
    advance(2400);
    expect((screen.getByLabelText('Project name') as HTMLInputElement).value).toBe('Acme Data Platform');
    expect(localStorage.getItem(DRAFT_KEY)).toBeNull();
    expect(screen.getByRole('status').textContent).toBe('No draft saved on this browser.');
    editName('Pending');
    advance();
    expect(localStorage.getItem(DRAFT_KEY)).toContain('Pending');
  });

  it('does not claim deletion succeeded if reset cannot remove storage', () => {
    localStorage.setItem(DRAFT_KEY, JSON.stringify({ project: { name: 'Stored' } }));
    vi.spyOn(localStorage, 'removeItem').mockImplementation(() => { throw new Error('denied'); });
    render(<DynamicFormPage />);
    fireEvent.click(screen.getByRole('button', { name: 'Reset demo' }));
    fireEvent.click(within(screen.getByRole('alertdialog')).getByRole('button', { name: 'Reset demo' }));
    expect(screen.getByRole('status').textContent).toContain("Couldn't delete");
    expect(localStorage.getItem(DRAFT_KEY)).toContain('Stored');
  });

  it('invalid submit preserves the draft', async () => {
    localStorage.setItem(DRAFT_KEY, JSON.stringify({ project: { name: '' } }));
    render(<DynamicFormPage />);
    fireEvent.click(screen.getByRole('button', { name: 'Submit demo' }));
    await screen.findByText('The form needs your attention');
    expect(localStorage.getItem(DRAFT_KEY)).not.toBeNull();
  });

  it.each([false, true])('valid submit cancels debounce and preserves displayed values (delete failure: %s)', async (deleteFails) => {
    localStorage.setItem(DRAFT_KEY, JSON.stringify({ schedule: { owner: 'sarah@acme.io' } }));
    if (deleteFails) vi.spyOn(localStorage, 'removeItem').mockImplementation(() => { throw new Error('denied'); });
    vi.useFakeTimers();
    render(<DynamicFormPage />);
    editName('Submitted demo');
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Submit demo' }));
    });
    advance(2400);
    expect((screen.getByLabelText('Project name') as HTMLInputElement).value).toBe('Submitted demo');
    expect(screen.getByRole('status').textContent).toContain(deleteFails ? "Couldn't delete" : 'No draft saved');
    if (!deleteFails) expect(localStorage.getItem(DRAFT_KEY)).toBeNull();
    editName('New edit');
    advance();
    expect(screen.getByRole('status').textContent).toBe('Draft saved on this browser.');
  });
});
