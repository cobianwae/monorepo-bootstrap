'use client';

// Org Chart Studio showcase: demo first (state controls + canvas), then guided steps,
// integration recipe and keyboard/a11y reference. Data state is controlled by the page.

import * as React from 'react';
import { Sparkles } from 'lucide-react';
import {
  Alert,
  AlertDescription,
  AlertTitle,
  Button,
  OrgChartStudio,
  PageHeader,
  toast,
  type OrgStudioNodeFlat,
} from '@ds/ui';
import { SectionHeading } from '../../../../components/section-heading';
import { StudioDemoPanel, type StudioDemoKind } from './_components/studio-demo-panel';
import { STUDIO_STEPS, buildStudioExample40, buildStudioInvalid, studioSeedData, type StudioInvalidKind } from './_components/studio-demo-data';
import { StudioRecipe } from './_components/studio-recipe';
import { StudioShortcuts } from './_components/studio-shortcuts';

const EXTERNAL_ERROR_MESSAGE =
  'Could not sync with the server (demo). Your local changes are safe and the last diagram stays visible.';

export default function OrgChartStudioPage() {
  const [data, setData] = React.useState<OrgStudioNodeFlat[]>(studioSeedData);
  const [query, setQuery] = React.useState('');
  const [expandedIds, setExpandedIds] = React.useState<string[] | undefined>(undefined);
  const [kind, setKind] = React.useState<StudioDemoKind>('populated');
  const [invalidKind, setInvalidKind] = React.useState<StudioInvalidKind>('duplicate');
  const [externalError, setExternalError] = React.useState<string | null>(null);
  const [minimap, setMinimap] = React.useState(true);
  const example40 = React.useMemo(() => buildStudioExample40(), []);

  // Consumer-owned presentational search: matches name, title or department.
  // Search only applies to data states; other states disable the input.
  const searchEnabled = kind === 'populated' || kind === 'large';

  const visibleData = React.useMemo<OrgStudioNodeFlat[]>(() => {
    switch (kind) {
      case 'empty':
        return [];
      case 'invalid':
        return buildStudioInvalid(invalidKind);
      default:
        return data;
    }
  }, [kind, data, invalidKind]);

  const highlightedIds = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q || !searchEnabled) return [];
    return visibleData
      .filter(
        (node) =>
          node.title.toLowerCase().includes(q) ||
          (node.subtitle ?? '').toLowerCase().includes(q) ||
          (node.badge ?? '').toLowerCase().includes(q),
      )
      .map((node) => node.id);
  }, [visibleData, query, searchEnabled]);

  const handleKindChange = React.useCallback(
    (next: StudioDemoKind) => {
      if (next === 'large') {
        setData(example40);
        setQuery('');
        setExpandedIds(undefined);
      } else if (next === 'populated' && kind === 'large') {
        setData(studioSeedData);
        setQuery('');
        setExpandedIds(undefined);
      }
      setKind(next);
      setExternalError(next === 'external' ? EXTERNAL_ERROR_MESSAGE : null);
    },
    [example40, kind],
  );

  const resetDemo = React.useCallback(() => {
    setData(studioSeedData);
    setQuery('');
    setExpandedIds(undefined);
    setKind('populated');
    setInvalidKind('duplicate');
    setExternalError(null);
    setMinimap(true);
  }, []);

  const createRoot = React.useCallback(() => {
    const root: OrgStudioNodeFlat[] = [
      { id: 'root', parentId: null, title: 'New unit', subtitle: 'Select the card, then press F2 to rename', badge: 'Executive', accent: 'primary' },
    ];
    setData(root);
    setKind('populated');
    toast({ title: 'Root created', description: 'Focus the card and press F2 to rename it inline.', duration: 4000 });
  }, []);

  const deptCount = React.useMemo(
    () => new Set(visibleData.map((node) => node.badge).filter(Boolean)).size,
    [visibleData],
  );
  const levelCount = React.useMemo(() => {
    if (visibleData.length === 0) return 0;
    const byId = new Map(visibleData.map((node) => [node.id, node]));
    let max = 1;
    for (const node of visibleData) {
      let depth = 1;
      const seen = new Set<string>([node.id]);
      let current = node;
      while (current.parentId) {
        const parent = byId.get(current.parentId);
        if (!parent || seen.has(parent.id)) break;
        seen.add(parent.id);
        depth += 1;
        current = parent;
      }
      if (depth > max) max = depth;
    }
    return max;
  }, [visibleData]);
  const summary =
    kind === 'large'
      ? `${visibleData.length} people · ${levelCount} levels · ${deptCount} departments`
      : `${visibleData.length} ${visibleData.length === 1 ? 'person' : 'people'} · ${levelCount} ${levelCount === 1 ? 'level' : 'levels'} · ${deptCount} ${deptCount === 1 ? 'department' : 'departments'}`;

  const searchStatus = !searchEnabled
    ? 'Search is available in Populated and 40 people.'
    : query.trim() === ''
      ? 'Matches get a ring, a "Match" badge and a dashed path.'
      : highlightedIds.length === 0
        ? 'No results.'
        : `${highlightedIds.length} ${highlightedIds.length === 1 ? 'result' : 'results'}. Ancestor paths open automatically.`;

  return (
    <div className="animate-in fade-in-50 space-y-10 duration-200">
      <PageHeader
        eyebrow="UX Recipe"
        eyebrowIcon={Sparkles}
        title="Org Chart Studio"
        description="Build and edit an org chart on a canvas: add, move, delete and undo, with search and a full keyboard path. Your page owns the data; the component never fetches or saves on its own."
      />

      <section id="demo" aria-labelledby="org-studio-demo" className="space-y-4 scroll-mt-20">
        <SectionHeading
          id="org-studio-demo"
          title="Interactive demo"
          description="Switch states to see how the studio behaves, then edit the chart below."
        />

        <StudioDemoPanel
          kind={kind}
          onKindChange={handleKindChange}
          invalidKind={invalidKind}
          onInvalidKindChange={setInvalidKind}
          minimap={minimap}
          onMinimapChange={setMinimap}
          query={query}
          onQueryChange={setQuery}
          searchStatus={searchStatus}
          searchDisabled={!searchEnabled}
          summary={summary}
          onReset={resetDemo}
        />

        {externalError ? (
          <Alert variant="destructive">
            <AlertTitle>External error (demo)</AlertTitle>
            <AlertDescription>
              <p>{externalError}</p>
              <Button type="button" variant="outline" size="sm" className="mt-2" onClick={() => setExternalError(null)}>
                Try again
              </Button>
            </AlertDescription>
          </Alert>
        ) : null}

        <OrgChartStudio
          data={visibleData}
          onChange={setData}
          expandedIds={expandedIds}
          onExpandedChange={setExpandedIds}
          highlightedIds={highlightedIds}
          loading={kind === 'loading'}
          minimap={minimap}
          emptyActionLabel="Create root"
          onEmptyAction={createRoot}
          ariaLabel="Org chart studio"
        />
      </section>

      <section id="try-it" aria-labelledby="org-studio-steps" className="space-y-4 scroll-mt-20">
        <SectionHeading id="org-studio-steps" title="Try it" description={`${STUDIO_STEPS.length} steps from reading the chart to starting over.`} />
        <ol className="list-decimal space-y-2 pl-5 text-sm text-muted-foreground marker:font-medium marker:text-foreground">
          {STUDIO_STEPS.map((step) => (
            <li key={step.title}>
              <span className="font-medium text-foreground">{step.title}:</span> {step.detail}
            </li>
          ))}
        </ol>
      </section>

      <StudioRecipe />
      <StudioShortcuts />
    </div>
  );
}
