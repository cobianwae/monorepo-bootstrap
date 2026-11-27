import * as React from 'react';

/** Pasangan saved/draft: daftar `changed` menggerakkan penanda baris, jumlah, dan save bar. */
export function useDraft<T extends Record<string, string | null>>(initialSaved: T, initialDraft: T = initialSaved) {
  const [saved, setSaved] = React.useState(initialSaved);
  const [draft, setDraft] = React.useState(initialDraft);

  const changed = (Object.keys(saved) as (keyof T)[]).filter((key) => draft[key] !== saved[key]);

  function set<K extends keyof T>(key: K, value: T[K]) {
    setDraft((previous) => ({ ...previous, [key]: value }));
  }

  return {
    saved,
    draft,
    changed,
    set,
    discard: () => setDraft(saved),
    commit: (snapshot: T) => setSaved(snapshot),
  };
}
