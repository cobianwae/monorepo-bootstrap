'use client';

import * as React from 'react';
import { Network, Search } from 'lucide-react';
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
  Timeline,
  getAncestors,
  type MindNodeFlat,
} from '@ds/ui';
import { MindDemoPanel } from './_components/mind-map-demo-panel';
import { MindMapRecipe } from './_components/mind-map-recipe';
import { MindMapShortcuts } from './_components/mind-map-shortcuts';
import { MindMapUseCases } from './_components/mind-map-use-cases';
import { EXAMPLE, LARGE, STEPS, type DemoState } from './_components/mind-map-demo-data';
import { SectionHeading } from '../../../../components/section-heading';

export default function MindMapPatternPage() {
  const [data, setData] = React.useState<MindNodeFlat[]>(EXAMPLE);
  const [expanded, setExpanded] = React.useState<string[]>(['q1', 'riset', 'produk', 'marketing']);
  const [query, setQuery] = React.useState('');
  const [demoState, setDemoState] = React.useState<DemoState>('Q1 example');
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
    else if (state === 'Q1 example') load(EXAMPLE, state);
    else if (state === 'Populated') load(EXAMPLE.slice(0, 4), state);
    else {
      if (demoState === 'Invalid' || demoState === 'Empty') load(EXAMPLE, state);
      else setDemoState(state);
    }
  };

  const searchSlot = (
    <div className="flex flex-wrap items-end gap-x-4 gap-y-2">
      <div className="min-w-0 basis-64 flex-1 space-y-1 sm:max-w-sm">
        <Label htmlFor="mind-search">Search ideas</Label>
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
            placeholder="E.g. Market research"
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
            ? `${matches.length} matching results`
            : 'No results'
          : `${data.length} ideas · search by idea name`}
      </p>
    </div>
  );

  return (
    <div className="animate-in fade-in-50 space-y-10 duration-200">
      <PageHeader
        eyebrow="UX Recipe Scenario"
        eyebrowIcon={Network}
        title="Mind Map"
        description="Turn a brainstorm into a map of ideas you can search, collapse, and edit on the canvas."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="highlight" className="font-mono text-xs">6 demo states</Badge>
            <Badge variant="outline" className="font-mono text-xs">Screen reader tree</Badge>
          </div>
        }
      />

      <section aria-labelledby="mind-demo">
        <Card>
          <CardHeader className="space-y-1 pb-4">
            <SectionHeading id="mind-demo" title="Interactive demo" />
            <CardDescription>
              Choose a data state or display option, then try it on the canvas.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <MindDemoPanel
              demoState={demoState}
              onSelectState={selectState}
              onLoadLarge={() => load(LARGE, 'Populated')}
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
                  demoState === 'External error'
                    ? 'Changes have not been saved. The map is still available; try saving again in the consuming app.'
                    : null
                }
                minimap={minimap}
                searchSlot={searchSlot}
              />
            </div>
          </CardContent>
        </Card>
      </section>

      <MindMapUseCases />

      <section aria-labelledby="mind-steps" className="space-y-3">
        <div className="space-y-1">
          <SectionHeading id="mind-steps" title="Try it" />
          <p className="text-sm text-muted-foreground">
            Follow these six steps to develop a central idea into a structured plan.
          </p>
        </div>
        <Timeline
          items={STEPS.map((step, index) => ({
            id: `step-${index}`,
            title: step.title,
            description: step.detail,
          }))}
        />
      </section>

      <MindMapShortcuts />
      <MindMapRecipe />
    </div>
  );
}
