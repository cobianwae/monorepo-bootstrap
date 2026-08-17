import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider, useTheme } from './theme-provider';
import { PaletteSwitcher } from './palette-switcher';

function ThemeConsumer() {
  const { theme, setTheme, palette, setPalette } = useTheme();
  return (
    <div>
      <span data-testid="theme">{theme}</span>
      <span data-testid="palette">{palette}</span>
      <button onClick={() => setTheme('dark')}>set-dark</button>
      <button onClick={() => setPalette('sunset')}>set-palette</button>
    </div>
  );
}

describe('ThemeProvider', () => {
  beforeEach(() => {
    window.localStorage.clear();
    document.documentElement.classList.remove('dark');
    document.documentElement.removeAttribute('data-theme');
  });

  it('throws when useTheme is used outside provider', () => {
    expect(() => render(<ThemeConsumer />)).toThrow(/useTheme must be used within a ThemeProvider/);
  });

  it('provides context values and applies dark class on setTheme', () => {
    render(
      <ThemeProvider>
        <ThemeConsumer />
      </ThemeProvider>
    );
    expect(screen.getByTestId('theme').textContent).toBe('light');
    fireEvent.click(screen.getByText('set-dark'));
    expect(screen.getByTestId('theme').textContent).toBe('dark');
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });

  it('applies data-theme attribute on setPalette', () => {
    render(
      <ThemeProvider>
        <ThemeConsumer />
      </ThemeProvider>
    );
    fireEvent.click(screen.getByText('set-palette'));
    expect(document.documentElement.getAttribute('data-theme')).toBe('sunset');
    expect(screen.getByTestId('palette').textContent).toBe('sunset');
  });
});

describe('PaletteSwitcher', () => {
  it('renders trigger with current art direction and theme name', () => {
    render(
      <ThemeProvider>
        <PaletteSwitcher />
      </ThemeProvider>
    );
    expect(screen.getByText(/Atelier/)).toBeDefined();
  });

  it('lists art directions and color tones in the dropdown', () => {
    render(
      <ThemeProvider>
        <PaletteSwitcher />
      </ThemeProvider>
    );
    fireEvent.pointerDown(screen.getByRole('button'));
    expect(screen.getByText('Art Direction')).toBeDefined();
    expect(screen.getByText('Color Tones')).toBeDefined();
  });
});
