'use client';

import * as React from 'react';
import { type ThemeId, type ArtDirectionId, getTonesForArtDirection } from '@ds/tokens';

type Theme = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  resolvedTheme: 'light' | 'dark';
  palette: ThemeId;
  setPalette: (palette: ThemeId) => void;
  artDirection: ArtDirectionId;
  setArtDirection: (dir: ArtDirectionId) => void;
}

const ThemeContext = React.createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = React.useState<Theme>('light');
  const [resolvedTheme, setResolvedTheme] = React.useState<'light' | 'dark'>('light');
  const [palette, setPaletteState] = React.useState<ThemeId>('pulse');
  const [artDirection, setArtDirectionState] = React.useState<ArtDirectionId>('atelier');

  React.useEffect(() => {
    const storedTheme = localStorage.getItem('ds-theme') as Theme | null;
    if (storedTheme) {
      setThemeState(storedTheme);
    } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setThemeState('dark');
    }

    const storedArtDirection = localStorage.getItem('ds-art-direction') as ArtDirectionId | null;
    if (storedArtDirection && ['atelier', 'aurora', 'blueprint'].includes(storedArtDirection)) {
      setArtDirectionState(storedArtDirection);
    }

    const storedPalette = localStorage.getItem('ds-palette') as ThemeId | null;
    if (storedPalette) {
      setPaletteState(storedPalette);
    }
  }, []);

  React.useEffect(() => {
    const root = document.documentElement;
    let effectiveTheme: 'light' | 'dark' = 'light';

    if (theme === 'system') {
      effectiveTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light';
    } else {
      effectiveTheme = theme;
    }

    setResolvedTheme(effectiveTheme);
    if (effectiveTheme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }

    localStorage.setItem('ds-theme', theme);
  }, [theme]);

  React.useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-theme', palette);
    localStorage.setItem('ds-palette', palette);
  }, [palette]);

  React.useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-art-direction', artDirection);
    localStorage.setItem('ds-art-direction', artDirection);

    const availableTones = getTonesForArtDirection(artDirection);
    if (!availableTones.find((t) => t.id === palette)) {
      setPaletteState(availableTones[0].id);
    }
  }, [artDirection, palette]);

  return (
    <ThemeContext.Provider
      value={{ theme, setTheme: setThemeState, resolvedTheme, palette, setPalette: setPaletteState, artDirection, setArtDirection: setArtDirectionState }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = React.useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
