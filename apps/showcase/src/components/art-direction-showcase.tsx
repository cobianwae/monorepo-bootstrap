'use client';

import { Check } from 'lucide-react';
import { ART_DIRECTIONS, getTonesForArtDirection } from '@ds/tokens';
import type { ArtDirectionId } from '@ds/tokens';
import { useTheme, cn } from '@ds/ui';
import { Reveal } from '@/components/reveal';

export function ArtDirectionShowcase() {
  const { artDirection, setArtDirection, resolvedTheme } = useTheme();

  return (
    <div id="experience" className="scroll-mt-24">
      <div className="mx-auto max-w-2xl text-center space-y-3 mb-12">
        <span className="inline-flex items-center gap-2 rounded-full border border-highlight/30 bg-highlight/10 px-3.5 py-1 text-xs font-semibold text-highlight font-mono tracking-wide">
          EXPERIENCE THE SYSTEM
        </span>
        <h2 className="text-3xl sm:text-4xl font-extrabold font-display tracking-tight text-foreground">
          One system, three voices
        </h2>
        <p className="text-muted-foreground leading-relaxed">
          Every art direction changes the typography, background craft, and color tonality —
          audited for contrast in both modes. Click to feel the difference live.
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-3">
        {ART_DIRECTIONS.map((dir, i) => {
          const isActive = artDirection === dir.id;
          const tones = getTonesForArtDirection(dir.id);
          const isDark = resolvedTheme === 'dark';

          return (
            <Reveal key={dir.id} delay={i * 120}>
              <button
                type="button"
                onClick={() => setArtDirection(dir.id as ArtDirectionId)}
                aria-pressed={isActive}
                className={cn(
                  'group relative w-full overflow-hidden rounded-2xl border bg-card/70 p-6 text-left transition-all duration-300',
                  'hover:-translate-y-1 hover:shadow-lg',
                  isActive
                    ? 'border-highlight/60 shadow-lg shadow-highlight/10 ring-1 ring-highlight/30'
                    : 'border-border hover:border-highlight/40'
                )}
              >
                <div className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-highlight/70 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                      Art direction 0{i + 1}
                    </span>
                    <h3 className="mt-1 text-lg font-bold font-display text-foreground">{dir.name}</h3>
                  </div>
                  {isActive && (
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-highlight text-highlight-foreground shadow-sm">
                      <Check className="h-3.5 w-3.5" />
                    </span>
                  )}
                </div>

                <p className="mt-1 text-sm font-semibold text-highlight">{dir.tagline}</p>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed line-clamp-3">
                  {dir.description}
                </p>

                <div className="mt-5 flex flex-wrap items-center gap-2">
                  {tones.map((tone) => {
                    const primary =
                      isDark ? tone.swatches.primary.darkHex : tone.swatches.primary.lightHex;
                    const highlight =
                      isDark ? tone.swatches.highlight.darkHex : tone.swatches.highlight.lightHex;
                    const surface =
                      isDark ? tone.swatches.surface.darkHex : tone.swatches.surface.lightHex;

                    return (
                      <div
                        key={tone.id}
                        className="flex items-center gap-1.5 rounded-full border border-border bg-card py-1 pl-1.5 pr-2.5"
                      >
                        <span className="flex items-center -space-x-1">
                          <span
                            className="h-3 w-3 rounded-full ring-2 ring-card"
                            style={{ backgroundColor: primary }}
                          />
                          <span
                            className="h-3 w-3 rounded-full ring-2 ring-card"
                            style={{ backgroundColor: highlight }}
                          />
                          <span
                            className="h-3 w-3 rounded-full ring-2 ring-card"
                            style={{ backgroundColor: surface }}
                          />
                        </span>
                        <span className="text-[10px] font-medium text-muted-foreground">
                          {tone.name}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </button>
            </Reveal>
          );
        })}
      </div>

      <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 text-center">
        <p className="text-xs text-muted-foreground font-mono">
          {ART_DIRECTIONS.find((d) => d.id === artDirection)?.art.signature.join(' · ')}
        </p>
      </div>
    </div>
  );
}