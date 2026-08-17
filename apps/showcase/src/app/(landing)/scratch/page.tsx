'use client';

export default function ScratchPage() {
  return (
    <div className="p-8 space-y-4 bg-background">
      <span
        aria-hidden="true"
        style={{ fontFamily: 'var(--font-sora)' }}
        className="block text-[6.5rem] font-bold leading-none tracking-tight text-foreground"
      >
        Aa
      </span>
      <h3 className="font-display text-xl font-bold text-foreground">Control h3</h3>
      <span
        aria-hidden="true"
        style={{ fontFamily: 'var(--font-sora)' }}
        className="block text-[6.5rem] font-bold leading-none tracking-tight text-highlight"
      >
        Aa
      </span>
    </div>
  );
}
