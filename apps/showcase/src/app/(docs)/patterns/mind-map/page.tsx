'use client';

import * as React from 'react';
import { ListOrdered, Network, Search } from 'lucide-react';
import {
  Badge,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  Input,
  Label,
  MindMap,
  PageHeader,
  getAncestors,
  type MindNodeFlat,
} from '@ds/ui';
import { MindDemoPanel } from './_components/mind-map-demo-panel';
import { MindMapRecipe } from './_components/mind-map-recipe';
import { MindMapShortcuts } from './_components/mind-map-shortcuts';
import { EXAMPLE, LARGE, STEPS, type DemoState } from './_components/mind-map-demo-data';

export default function MindMapPatternPage() {
  const [data, setData] = React.useState<MindNodeFlat[]>(EXAMPLE);
  const [expanded, setExpanded] = React.useState<string[]>(['q1', 'riset', 'produk', 'marketing']);
  const [query, setQuery] = React.useState('');
  const [demoState, setDemoState] = React.useState<DemoState>('Contoh Q1');
  const [dark, setDark] = React.useState(false);
  const [minimap, setMinimap] = React.useState(true);
  const matches = query.trim()
    ? data.filter((node) => node.label.toLocaleLowerCase('id').includes(query.trim().toLocaleLowerCase('id')))
    : [];

  const search = (text: string) => {
    setQuery(text);
    const normalized = text.trim().toLocaleLowerCase('id');
    if (!normalized) return;
    // Adapter hanya di batas util: getAncestors Studio memakai title, MindMap label.
    const studioNodes = data.map((node) => ({ ...node, title: node.label }));
    const ancestors = data.filter((node) => node.label.toLocaleLowerCase('id').includes(normalized))
      .flatMap((node) => getAncestors(studioNodes, node.id));
    setExpanded((current) => [...new Set([...current, ...ancestors])]);
  };
  const load = (next: MindNodeFlat[], state: DemoState) => {
    setData(next);
    setExpanded([...new Set(next.flatMap((node) => (node.parentId ? [node.parentId] : [])))]);
    setQuery('');
    setDemoState(state);
  };
  const selectState = (state: DemoState) => {
    if (state === 'Empty') load([], state);
    else if (state === 'Invalid') load([...EXAMPLE, { ...EXAMPLE[0] }], state);
    else if (state === 'Contoh Q1') load(EXAMPLE, state);
    else if (state === 'Berisi') load(EXAMPLE.slice(0, 4), state);
    else {
      if (demoState === 'Invalid' || demoState === 'Empty') load(EXAMPLE, state);
      else setDemoState(state);
    }
  };

  const searchSlot = (
    <div className="flex flex-wrap items-end gap-x-4 gap-y-2">
      <div className="min-w-0 basis-64 flex-1 space-y-1 sm:max-w-sm">
        <Label htmlFor="mind-search">Cari ide</Label>
        <div className="relative">
          <Search
            aria-hidden="true"
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            id="mind-search"
            type="search"
            className="pl-9"
            value={query}
            onChange={(event) => search(event.target.value)}
            placeholder="Cth: Riset pasar"
            aria-describedby="mind-search-status"
            disabled={demoState === 'Loading' || demoState === 'Invalid'}
          />
        </div>
      </div>
      <p
        role="status"
        aria-live="polite"
        id="mind-search-status"
        data-testid="mind-search-results"
        className="text-sm text-muted-foreground"
      >
        {query.trim()
          ? matches.length
            ? `${matches.length} hasil cocok`
            : 'Tidak ada hasil'
          : `${data.length} ide · cari berdasarkan nama ide`}
      </p>
    </div>
  );

  return (
    <div className="animate-in fade-in-50 space-y-10 duration-200">
      <PageHeader
        eyebrow="UX Recipe Scenario"
        eyebrowIcon={Network}
        title="Mind Map"
        description="Ubah curah pendapat menjadi peta ide yang bisa dicari, dilipat, dan dikelola langsung di kanvas."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="highlight" className="font-mono text-xs">6 state demo</Badge>
            <Badge variant="outline" className="font-mono text-xs">Pohon pembaca layar</Badge>
          </div>
        }
      />

      <section aria-labelledby="mind-demo">
        <Card>
          <CardHeader className="space-y-1 pb-4">
            <h2 id="mind-demo" className="flex items-center gap-2 font-display text-2xl font-bold text-foreground">
              <Network aria-hidden="true" className="h-6 w-6 text-highlight" />
              <span>Demo interaktif</span>
            </h2>
            <CardDescription>
              Pilih status data atau tampilan di panel, lalu coba langsung di kanvas.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <MindDemoPanel
              demoState={demoState}
              onSelectState={selectState}
              onLoadLarge={() => load(LARGE, 'Berisi')}
              dark={dark}
              onDarkChange={setDark}
              minimap={minimap}
              onMinimapChange={setMinimap}
            />
            <div
              data-theme="pulse"
              className={`${dark ? 'dark' : 'light'} text-foreground`}
              style={{ colorScheme: dark ? 'dark' : 'light' }}
            >
              <MindMap
                data={data}
                onChange={setData}
                expandedIds={expanded}
                onExpandedChange={setExpanded}
                highlightedIds={matches.map((node) => node.id)}
                loading={demoState === 'Loading'}
                error={
                  demoState === 'Error eksternal'
                    ? 'Perubahan belum tersimpan. Peta tetap tersedia; coba simpan lagi melalui aplikasi konsumen.'
                    : null
                }
                minimap={minimap}
                searchSlot={searchSlot}
              />
            </div>
          </CardContent>
        </Card>
      </section>

      <section aria-labelledby="mind-steps" className="space-y-3">
        <div className="space-y-1">
          <h2 id="mind-steps" className="flex items-center gap-2 font-display text-2xl font-bold text-foreground">
            <ListOrdered aria-hidden="true" className="h-6 w-6 text-highlight" />
            <span>Alur brainstorming</span>
          </h2>
          <p className="text-sm text-muted-foreground">
            Ikuti enam langkah ini untuk mengembangkan ide pusat menjadi rencana yang terstruktur.
          </p>
        </div>
        <ol className="space-y-3">
          {STEPS.map((step, index) => (
            <li key={step.title} className="flex items-start gap-3 text-sm">
              <span aria-hidden="true" className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-medium text-foreground">
                {index + 1}
              </span>
              <p className="pt-0.5 text-muted-foreground">
                <span className="font-medium text-foreground">{step.title}:</span> {step.detail}
              </p>
            </li>
          ))}
        </ol>
      </section>

      <MindMapShortcuts />
      <MindMapRecipe />
    </div>
  );
}
