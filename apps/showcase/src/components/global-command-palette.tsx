'use client';

import { useRouter } from 'next/navigation';
import { Sun, Moon, Laptop } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
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
  const { setTheme } = useTheme();

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
      heading: 'Appearance',
      items: [
        {
          id: 'theme-light',
          label: 'Switch to light theme',
          icon: itemIcon('light'),
          keywords: ['theme', 'light', 'appearance'],
          onSelect: () => setTheme('light'),
        },
        {
          id: 'theme-dark',
          label: 'Switch to dark theme',
          icon: itemIcon('dark'),
          keywords: ['theme', 'dark', 'appearance'],
          onSelect: () => setTheme('dark'),
        },
        {
          id: 'theme-system',
          label: 'Use system theme',
          icon: itemIcon('system'),
          keywords: ['theme', 'system', 'appearance'],
          onSelect: () => setTheme('system'),
        },
      ],
    },
  ];

  return <CommandPalette groups={groups} />;
}