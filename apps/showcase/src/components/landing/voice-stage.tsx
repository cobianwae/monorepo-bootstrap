'use client';

import { Check } from 'lucide-react';
import { ART_DIRECTIONS, getTonesForArtDirection } from '@ds/tokens';
import type { ArtDirectionId } from '@ds/tokens';
import { cn, SectionNumber, useTheme } from '@ds/ui';
import { Reveal } from '@/components/reveal';

/**
 * "One system, three voices" — the art direction stage. Each poster is a
 * typographic specimen rendered in that direction's OWN display font, so all
 * three typefaces are visible side by side. Selecting a poster transforms
 * the entire page live.
 */
export function VoiceStage() {
  const { artDirection, setArtDirection, resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';
  const active = ART_DIRECTIONS.find((d) => d.id === artDirection);

  return (
    <div>
      <div className="mx-auto mb-12 max-w-2xl space-y-4 text-center">
        <SectionNumber number={1} label="Art Direction" className="justify-center" />
        <h2 className="font-display text-3xl font-extrabold tracking-tight text-foreground sm:text-5xl">
          One system, three voices
        </h2>
        <p className="leading-relaxed text-muted-foreground">
          Every direction swaps the typography, background craft, and color tonality — contrast
          audited in both modes. Pick one and watch this entire page transform.
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-3">
        {ART_DIRECTIONS.map((dir, i) => {
          const isActive = artDirection === dir.id;
          const tones = getTonesForArtDirection(dir.id);

          return (
            <Reveal key={dir.id} delay={i * 120}>
              <button
                type="button"
                onClick={() => setArtDirection(dir.id as ArtDirectionId)}
                aria-pressed={isActive}
                aria-label={`Switch to ${dir.name} art direction`}
                className={cn(
                  'group relative w-full overflow-hidden rounded-3xl border p-8 text-left transition-all duration-300',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
                  isActive
                    ? 'border-highlight/60 bg-card shadow-xl shadow-highlight/10 ring-1 ring-highlight/30'
                    : 'border-border bg-card/50 hover:-translate-y-1 hover:border-highlight/30 hover:bg-card hover:shadow-lg'
                )}
              >
                <div className="flex items-start justify-between">
                  <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                    Voice 0{i + 1}
                  </span>
                  {isActive && (
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-highlight text-highlight-foreground shadow-sm">
                      <Check className="h-3.5 w-3.5" aria-hidden="true" />
                    </span>
                  )}
                </div>

                {/* Typographic specimen in the direction's own display font */}
                <span
                  aria-hidden="true"
                  style={{ fontFamily: dir.typography.display }}
                  className={cn(
                    'mt-6 block text-[6.5rem] font-bold leading-none tracking-tight transition-all duration-500',
                    isActive ? 'text-highlight' : 'text-foreground group-hover:text-highlight'
                  )}
                >
                  Aa
                </span>

                <h3 className="mt-6 font-display text-xl font-bold text-foreground">{dir.name}</h3>
                <p className="mt-0.5 text-sm font-semibold text-highlight">{dir.tagline}</p>
                <p className="mt-2 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                  {dir.typography.displayName} / {dir.typography.bodyName}
                </p>

                {/* Tone strip */}
                <div className="mt-6 flex items-center gap-1.5" aria-hidden="true">
                  {tones.map((tone) => (
                    <span
                      key={tone.id}
                      className="h-1.5 flex-1 rounded-full"
                      style={{
                        backgroundColor: isDark
                          ? tone.swatches.highlight.darkHex
                          : tone.swatches.highlight.lightHex,
                      }}
                    />
                  ))}
                </div>
              </button>
            </Reveal>
          );
        })}
      </div>

      <p
        aria-live="polite"
        className="mt-8 text-center font-mono text-xs text-muted-foreground"
      >
        {active?.art.signature.join(' · ')}
      </p>
    </div>
  );
}
