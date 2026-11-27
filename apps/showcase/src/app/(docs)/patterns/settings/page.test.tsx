/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeAll, afterEach } from 'vitest';
import { act, cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import SettingsPage from './page';

vi.mock('@ds/ui', async (importOriginal) => {
  const original = await importOriginal<Record<string, unknown>>();
  return {
    ...original,
    useTheme: () => ({
      theme: 'light',
      setTheme: () => {},
      resolvedTheme: 'light',
      artDirection: 'atelier',
      setArtDirection: () => {},
    }),
  };
});

beforeAll(() => {
  // Radix memakai ResizeObserver yang tidak tersedia di jsdom.
  globalThis.ResizeObserver ??= class {
    observe() {}
    unobserve() {}
    disconnect() {}
  } as unknown as typeof ResizeObserver;
});

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

const nav = () => screen.getByRole('navigation', { name: 'Settings sections' });
const openSection = (name: RegExp) => fireEvent.click(within(nav()).getByRole('button', { name }));
const jobTitle = () => screen.getByLabelText('Job title') as HTMLInputElement;
const panelTitle = (name: string) => screen.getByRole('heading', { level: 2, name });

describe('SettingsPage', () => {
  it('dibuka dengan satu draft belum disimpan, penanda, dan save bar', () => {
    render(<SettingsPage />);
    expect(jobTitle().value).toBe('Design Lead');
    expect(screen.getByText('was “Product Designer”')).toBeTruthy();
    expect(jobTitle().getAttribute('aria-describedby')).toContain('profile-title-was');
    expect(screen.getByText('1 unsaved change')).toBeTruthy();
    expect(screen.getByText('1 unsaved change in Profile').getAttribute('role')).toBe('status');
    expect(within(nav()).getByRole('button', { name: /Profile.*unsaved changes/ })).toBeTruthy();
    expect(screen.getByRole('heading', { level: 2, name: 'Track what changed' })).toBeTruthy();
    expect(screen.getByRole('heading', { level: 2, name: 'Keyboard & screen readers' })).toBeTruthy();
  });

  it('Discard mengembalikan nilai tersimpan dan menyembunyikan save bar', () => {
    render(<SettingsPage />);
    fireEvent.click(screen.getByRole('button', { name: 'Discard' }));
    expect(jobTitle().value).toBe('Product Designer');
    expect(screen.queryByRole('button', { name: 'Save changes' })).toBeNull();
    expect(within(nav()).queryByText(', unsaved changes')).toBeNull();
  });

  it('Save menyimpan setelah loading dan fokus pindah ke judul panel', () => {
    vi.useFakeTimers();
    render(<SettingsPage />);
    const save = screen.getByRole('button', { name: 'Save changes' });
    save.focus();
    fireEvent.click(save);
    act(() => {
      vi.advanceTimersByTime(800);
    });
    expect(screen.queryByText('1 unsaved change')).toBeNull();
    expect(jobTitle().value).toBe('Design Lead');
    expect(document.activeElement).toBe(panelTitle('Profile'));
  });

  it('Save dengan field invalid menampilkan error terhubung dan memfokuskan yang pertama', () => {
    render(<SettingsPage />);
    const name = screen.getByLabelText('Full name');
    fireEvent.change(name, { target: { value: '' } });
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'ava' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save changes' }));
    expect(screen.getByText('Name is required.').id).toBe('profile-name-error');
    expect(name.getAttribute('aria-describedby')).toContain('profile-name-error');
    expect(screen.getByLabelText('Email').getAttribute('aria-describedby')).toContain('profile-email-error');
    expect(document.activeElement).toBe(name);
  });

  it('upload avatar menolak tipe dan ukuran yang tidak sesuai', () => {
    render(<SettingsPage />);
    const upload = screen.getByLabelText('Upload avatar');
    fireEvent.change(upload, { target: { files: [new File(['x'], 'a.webp', { type: 'image/webp' })] } });
    expect(screen.getByText('Choose a JPG, PNG or GIF file.')).toBeTruthy();
    const big = new File([new Uint8Array(2 * 1024 * 1024 + 1)], 'a.png', { type: 'image/png' });
    fireEvent.change(upload, { target: { files: [big] } });
    expect(screen.getByText('Choose an image of 2 MB or less.')).toBeTruthy();
    expect(screen.queryByText('New photo selected')).toBeNull();
  });

  it('navigasi menandai aria-current dan draft bertahan saat berpindah panel', () => {
    render(<SettingsPage />);
    fireEvent.change(jobTitle(), { target: { value: 'Head of Design' } });
    openSection(/^Security/);
    expect(within(nav()).getByRole('button', { name: /^Security/ }).getAttribute('aria-current')).toBe('page');
    expect(within(nav()).getByRole('button', { name: /^Profile/ }).getAttribute('aria-current')).toBeNull();
    expect(screen.queryByRole('button', { name: 'Save changes' })).toBeNull();
    openSection(/^Profile/);
    expect(jobTitle().value).toBe('Head of Design');
  });

  it('General menolak nama workspace kosong', () => {
    render(<SettingsPage />);
    openSection(/^General/);
    expect(screen.queryByRole('button', { name: 'Save changes' })).toBeNull();
    const input = screen.getByLabelText('Workspace name');
    fireEvent.change(input, { target: { value: '' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save changes' }));
    expect(screen.getByText('Workspace name is required.')).toBeTruthy();
    expect(input.getAttribute('aria-describedby')).toContain('workspace-name-error');
    expect(document.activeElement).toBe(input);
  });

  it('pencarian menampilkan hasil lintas panel lalu memfokuskan kontrolnya', () => {
    render(<SettingsPage />);
    const search = screen.getByRole('textbox', { name: 'Find a setting' });
    fireEvent.change(search, { target: { value: 'timeout' } });
    expect(screen.getByText('1 result')).toBeTruthy();
    expect(screen.queryByRole('navigation', { name: 'Settings sections' })).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: /Session timeout.*Security/ }));
    expect(panelTitle('Security')).toBeTruthy();
    expect(document.activeElement).toBe(screen.getByRole('switch', { name: 'Session timeout' }));
    fireEvent.keyDown(search, { key: 'Escape' });
    expect(nav()).toBeTruthy();
  });

  it('pencarian tanpa hasil menampilkan empty state yang bisa dibersihkan', () => {
    render(<SettingsPage />);
    fireEvent.change(screen.getByRole('textbox', { name: 'Find a setting' }), { target: { value: 'zzz' } });
    expect(screen.getByText('0 results')).toBeTruthy();
    expect(screen.getByText('No settings match')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Show all settings' }));
    expect(nav()).toBeTruthy();
  });

  it('All settings mengembalikan fokus ke item asal', () => {
    render(<SettingsPage />);
    openSection(/^Members/);
    expect(document.activeElement).toBe(panelTitle('Members'));
    fireEvent.click(screen.getByRole('button', { name: 'All settings' }));
    expect(document.activeElement).toBe(within(nav()).getByRole('button', { name: /^Members/ }));
  });

  it('menolak undangan duplikat dan menghitung member baru', () => {
    render(<SettingsPage />);
    openSection(/^Members/);
    const input = screen.getByLabelText('New member email');
    fireEvent.change(input, { target: { value: 'sarah@acme.io' } });
    fireEvent.click(screen.getByRole('button', { name: 'Invite' }));
    expect(screen.getByText('That member is already in the workspace.')).toBeTruthy();
    expect(input.getAttribute('aria-describedby')).toBe('new-member-email-error');
    fireEvent.change(input, { target: { value: 'lee@acme.io' } });
    fireEvent.click(screen.getByRole('button', { name: 'Invite' }));
    expect(within(nav()).getByRole('button', { name: /^Members.*4 members/ })).toBeTruthy();
  });

  it('menampilkan empty state setelah semua member dihapus', () => {
    render(<SettingsPage />);
    openSection(/^Members/);
    for (const email of ['sarah', 'marcus', 'priya']) {
      fireEvent.click(screen.getByRole('button', { name: `Remove ${email}@acme.io` }));
    }
    expect(screen.getByText('No members in this workspace')).toBeTruthy();
  });

  it('Verify dengan kode kurang dari 6 digit menampilkan error yang terhubung ke input', () => {
    render(<SettingsPage />);
    openSection(/^Security/);
    fireEvent.click(screen.getByRole('switch', { name: 'Two-factor authentication' }));
    fireEvent.click(screen.getByRole('button', { name: 'Verify & enable' }));
    expect(screen.getByText('Enter all 6 digits to continue.').id).toBe('otp-error');
    const first = screen.getByLabelText('Verification code digit 1 of 6');
    expect(first.getAttribute('aria-describedby')).toBe('otp-error');
    expect(document.activeElement).toBe(first);
  });

  it('menutup dialog 2FA mengembalikan fokus ke switch', async () => {
    render(<SettingsPage />);
    openSection(/^Security/);
    const toggle = screen.getByRole('switch', { name: 'Two-factor authentication' });
    fireEvent.click(toggle);
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    await waitFor(() => expect(document.activeElement).toBe(toggle));
    expect(toggle.getAttribute('aria-checked')).toBe('false');
  });

  it('Delete workspace baru aktif setelah DELETE diketik', () => {
    render(<SettingsPage />);
    openSection(/^Danger zone/);
    fireEvent.click(screen.getByRole('button', { name: 'Delete workspace' }));
    const dialog = screen.getByRole('alertdialog');
    const confirm = within(dialog).getByRole('button', { name: 'Delete workspace' }) as HTMLButtonElement;
    expect(confirm.disabled).toBe(true);
    fireEvent.change(within(dialog).getByRole('textbox'), { target: { value: 'DELETE' } });
    expect(confirm.disabled).toBe(false);
  });
});
