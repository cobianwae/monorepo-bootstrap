'use client';

import { ArtBackground } from '@ds/ui';
import { useTheme } from './theme-provider';

export function ArtCanvas() {
  const { artDirection } = useTheme();
  
  return <ArtBackground variant={artDirection === 'atelier' ? 'glow' : artDirection} />;
}
