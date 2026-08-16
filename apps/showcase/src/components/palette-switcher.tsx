'use client';

import { Palette, Check, Wand2 } from 'lucide-react';
import { THEMES, ART_DIRECTIONS, type ThemeId, type ArtDirectionId, getArtDirection, getTonesForArtDirection } from '@ds/tokens';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Button,
} from '@ds/ui';
import { useTheme } from './theme-provider';

export function PaletteSwitcher() {
  const { palette, setPalette, resolvedTheme, artDirection, setArtDirection } = useTheme();

  const currentDirection = getArtDirection(artDirection);
  const currentTheme = THEMES.find((t) => t.id === palette) || THEMES[0];
  const isDark = resolvedTheme === 'dark';
  
  const availableTones = getTonesForArtDirection(artDirection);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="h-8 gap-2 border-border/80 bg-card px-2.5 font-normal text-xs text-foreground hover:bg-accent hover:text-accent-foreground"
        >
          <div className="flex items-center gap-1.5">
            <span
              className="h-2.5 w-2.5 rounded-full shadow-xs ring-1 ring-border"
              style={{
                backgroundColor: isDark
                  ? currentTheme.swatches.highlight.darkHex
                  : currentTheme.swatches.highlight.lightHex,
              }}
            />
            <span className="hidden sm:inline font-medium">
              {currentDirection.name} / {currentTheme.name}
            </span>
          </div>
          <Palette className="h-3.5 w-3.5 text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-64 p-1.5">
        <DropdownMenuLabel className="px-2 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
          <Wand2 className="h-3.5 w-3.5" />
          Art Direction
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="my-1" />

        {ART_DIRECTIONS.map((dir) => {
          const isSelected = dir.id === artDirection;

          return (
            <DropdownMenuItem
              key={dir.id}
              onClick={() => setArtDirection(dir.id as ArtDirectionId)}
              className="flex items-center justify-between gap-2 px-2.5 py-2 cursor-pointer rounded-md focus:bg-accent"
            >
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-semibold text-foreground truncate">
                  {dir.name}
                </span>
                <span className="text-[10px] text-muted-foreground truncate">
                  {dir.tagline}
                </span>
              </div>
              {isSelected && <Check className="h-3.5 w-3.5 text-highlight shrink-0" />}
            </DropdownMenuItem>
          );
        })}
        
        <DropdownMenuSeparator className="my-1" />
        <DropdownMenuLabel className="px-2 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
          <Palette className="h-3.5 w-3.5" />
          Color Tones
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="my-1" />

        {availableTones.map((theme) => {
          const isSelected = theme.id === palette;
          const primaryColor = isDark
            ? theme.swatches.primary.darkHex
            : theme.swatches.primary.lightHex;
          const highlightColor = isDark
            ? theme.swatches.highlight.darkHex
            : theme.swatches.highlight.lightHex;
          const surfaceColor = isDark
            ? theme.swatches.surface.darkHex
            : theme.swatches.surface.lightHex;

          return (
            <DropdownMenuItem
              key={theme.id}
              onClick={() => setPalette(theme.id as ThemeId)}
              className="flex items-center justify-between gap-2 px-2.5 py-2 cursor-pointer rounded-md focus:bg-accent"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                {/* Color swatch trio */}
                <div className="flex items-center -space-x-1 shrink-0">
                  <span
                    className="h-3.5 w-3.5 rounded-full ring-2 ring-card shadow-xs"
                    style={{ backgroundColor: primaryColor }}
                    title="Primary"
                  />
                  <span
                    className="h-3.5 w-3.5 rounded-full ring-2 ring-card shadow-xs"
                    style={{ backgroundColor: highlightColor }}
                    title="Highlight"
                  />
                  <span
                    className="h-3.5 w-3.5 rounded-full ring-2 ring-card shadow-xs"
                    style={{ backgroundColor: surfaceColor }}
                    title="Surface"
                  />
                </div>

                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-semibold text-foreground truncate">
                    {theme.name}
                  </span>
                  <span className="text-[10px] text-muted-foreground truncate">
                    {theme.tagline}
                  </span>
                </div>
              </div>

              {isSelected && <Check className="h-3.5 w-3.5 text-highlight shrink-0" />}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
