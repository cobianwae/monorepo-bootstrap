/** @vitest-environment jsdom */
import { beforeAll, describe, expect, it } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import DynamicFormPage from './page';

// Halaman memakai matchMedia untuk deteksi layar kecil; jsdom tidak menyediakannya.
beforeAll(() => {
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
    fireEvent.click(screen.getByRole('button', { name: /Publish project/i }));

    expect(await screen.findByText('The form needs your attention')).toBeDefined();
    expect(nameInput.getAttribute('aria-invalid')).toBe('true');
    expect(nameInput.getAttribute('aria-describedby')).toBe('err-project-name');
    const message = document.getElementById('err-project-name');
    expect(message?.textContent).toBe('Project name must be at least 3 characters.');
    // Pesan yang sama juga tercantum di summary (li), keduanya satu sumber error.
    expect(screen.getAllByText('Project name must be at least 3 characters.')).toHaveLength(2);
  });

  it('uses one h1, two section h2 headings, and five group h3 headings (CR-071)', () => {
    render(<DynamicFormPage />);
    expect(screen.getAllByRole('heading', { level: 1 }).map((h) => h.textContent)).toEqual(['Dynamic Form']);
    expect(screen.getAllByRole('heading', { level: 2 }).map((h) => h.textContent)).toEqual([
      'Interactive demo',
      'Try it',
    ]);
    expect(screen.getAllByRole('heading', { level: 3 }).map((h) => h.textContent)).toEqual([
      'Project Information',
      'Schedule & Ownership',
      'Audience & Targeting',
      'Budget & Capacity',
      'Team Members',
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
