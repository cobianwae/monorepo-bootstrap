'use client';

import { ArtBackground, useTheme } from '@ds/ui';

export function ArtCanvas() {
  const { artDirection } = useTheme();
  
  return <ArtBackground variant={artDirection === 'atelier' ? 'glow' : artDirection} />;
}
