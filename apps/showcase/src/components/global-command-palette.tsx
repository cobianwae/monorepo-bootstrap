'use client';

import { useRouter } from 'next/navigation';
import { Sun, Moon, Laptop, Palette } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { THEMES, type ThemeId } from '@ds/tokens';
import { CommandPalette, type CommandPaletteGroup } from '@ds/ui';
import { NAV_SECTIONS } from './showcase-nav-content';
import { useTheme } from './theme-provider';

function itemIcon(kind: 'light' | 'dark' | 'system'): LucideIcon {
  const icons = {
    light: Sun,
    dark: Moon,
    system: Laptop,
  };
  return icons[kind];
}

export function GlobalCommandPalette() {
  const router = useRouter();
  const { setTheme, setPalette } = useTheme();

  const groups: CommandPaletteGroup[] = [
    {
      heading: 'Navigate',
      items: NAV_SECTIONS.flatMap((section) =>
        section.items.map((item) => ({
          id: item.href,
          label: item.title,
          description: section.title,
          icon: item.icon,
          keywords: [section.title.toLowerCase()],
          onSelect: () => router.push(item.href),
        }))
      ),
    },
    {
      heading: 'Art Direction & Themes',
      items: THEMES.map((t) => ({
        id: `palette-${t.id}`,
        label: `Set Art Direction: ${t.name}`,
        description: t.tagline,
        icon: Palette,
        keywords: ['theme', 'palette', 'color', 'art direction', t.name.toLowerCase()],
        onSelect: () => setPalette(t.id as ThemeId),
      })),
    },
    {
      heading: 'Mode (Light / Dark)',
      items: [
        {
          id: 'theme-light',
          label: 'Switch to light mode',
          icon: itemIcon('light'),
          keywords: ['theme', 'light', 'appearance', 'mode'],
          onSelect: () => setTheme('light'),
        },
        {
          id: 'theme-dark',
          label: 'Switch to dark mode',
          icon: itemIcon('dark'),
          keywords: ['theme', 'dark', 'appearance', 'mode'],
          onSelect: () => setTheme('dark'),
        },
        {
          id: 'theme-system',
          label: 'Use system mode',
          icon: itemIcon('system'),
          keywords: ['theme', 'system', 'appearance', 'mode'],
          onSelect: () => setTheme('system'),
        },
      ],
    },
  ];

  return <CommandPalette groups={groups} />;
}
