'use client';

// Flow Editor showcase — S-005.29 (final diserahkan ke 005-06).
// State kendali di luar komponen (controlled), FlowEditor hanya presentasi (PRD FR-012).
// `<Toaster>` tidak ditampilkan di sini: host tunggal sudah ada di root layout (AC-05).

import * as React from 'react';
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  FlowEditor,
  PageHeader,
  Separator,
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  Input,
  Label,
  Switch,
  useTheme,
  PaletteSwitcher,
  toast,
  SegmentedControl,
  SegmentedControlItem,
  type FlowEdge,
  type FlowNode,
  type FlowEditorProps,
  type FlowPaletteItem,
  type FlowStatus,
} from '@ds/ui';

type NodeChangeParam = NonNullable<FlowEditorProps['onNodesChange']> extends (changes: infer C) => void ? C : never;
type EdgeChangeParam = NonNullable<FlowEditorProps['onEdgesChange']> extends (changes: infer C) => void ? C : never;
type ConnectParam = NonNullable<FlowEditorProps['onConnect']> extends (connection: infer C) => void ? C : never;

const paletteItems: FlowPaletteItem[] = [
  { type: 'action', title: 'Send email', description: 'Automated email task' },
  { type: 'pending', title: 'Wait', description: 'Pause execution for a while' },
];

const initialNodes: FlowNode[] = [
  { id: 'n1', type: 'action', position: { x: 100, y: 50 }, data: { label: 'Start', kind: 'action' } },
  { id: 'n2', type: 'action', position: { x: 400, y: 50 }, data: { label: 'Send email', kind: 'action' } },
  { id: 'n3', type: 'pending', position: { x: 700, y: 50 }, data: { label: 'Wait 1 day', kind: 'pending', status: 'warning' } },
  { id: 'n4', type: 'action', position: { x: 400, y: 220 }, data: { label: 'Verification branch', kind: 'action' } },
  { id: 'n5', type: 'action', position: { x: 700, y: 220 }, data: { label: 'Done', kind: 'success' } },
];

const initialEdges: FlowEdge[] = [
  { id: 'e1', source: 'n1', target: 'n2', label: 'trigger', animated: false },
  { id: 'e2', source: 'n2', target: 'n3', label: 'wait', animated: false },
  { id: 'e3', source: 'n3', target: 'n4', label: 'continue', animated: false },
  { id: 'e4', source: 'n4', target: 'n5', label: 'done', animated: false },
];

export default function FlowEditorPage() {
  const { resolvedTheme } = useTheme();
  const [nodes, setNodes] = React.useState<FlowNode[]>(initialNodes);
  const [edges, setEdges] = React.useState<FlowEdge[]>(initialEdges);
  const [selected, setSelected] = React.useState<{ nodes: FlowNode[]; edges: FlowEdge[] } | null>(null);
  const [demo, setDemo] = React.useState<'data' | 'loading' | 'empty' | 'error'>('data');
  const [snapToGrid, setSnapToGrid] = React.useState(false);
  const [minimapEnabled, setMinimapEnabled] = React.useState(true);
  const gridSize = 16;
  const [draftTitle, setDraftTitle] = React.useState('');
  const [titleError, setTitleError] = React.useState(false);
  // Id node hasil tambah (palet/drag/[+]); seleksi programatik dari id ini tidak membuka sheet (CR-019 #2).
  const pendingAddIdRef = React.useRef<string | null>(null);

  // Deteksi layar kecil secara inline (pola existing di monorepo; matchMedia di-mock di test).
  const [isMobile, setIsMobile] = React.useState(false);
  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    const mq = window.matchMedia('(max-width: 767px)');
    setIsMobile(mq.matches);
    const onChange = () => setIsMobile(mq.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  const validateTitle = (value: string) => {
    const ok = value.trim().length > 0;
    setTitleError(!ok);
    return ok;
  };

  const handleDelete = React.useCallback((selection: { nodes: FlowNode[]; edges: FlowEdge[] }) => {
    const nodeIds = new Set(selection.nodes.map((n) => n.id));
    const edgeIds = new Set(selection.edges.map((e) => e.id));
    setNodes((prev) => prev.filter((n) => !nodeIds.has(n.id)));
    setEdges((prev) =>
      prev.filter((e) => !edgeIds.has(e.id) && !nodeIds.has(e.source) && !nodeIds.has(e.target)),
    );
    setSelected(null);
    setDraftTitle('');
    setTitleError(false);
    void toast({ title: 'Deleted', description: `${selection.nodes.length} nodes, ${selection.edges.length} edges deleted — Undo`, duration: 4000 });
  }, []);

  const handleSaveTitle = React.useCallback(() => {
    if (!validateTitle(draftTitle)) return;
    if (selected?.nodes.length === 1) {
      const node = selected.nodes[0];
      setNodes((prev) =>
        prev.map((n) => (n.id === node.id ? { ...n, data: { ...n.data, label: draftTitle } } : n)),
      );
    }
    setTitleError(false);
  }, [draftTitle, selected]);

  const onBlurTitle = React.useCallback((value: string) => {
    validateTitle(value);
  }, []);

  const handleCancel = React.useCallback(() => {
    setSelected(null);
    setDraftTitle('');
    setTitleError(false);
  }, []);

  const handleNodesChange = React.useCallback((changes: NodeChangeParam) => {
    // xyflow 13 mengirim Changeset (bukan Array) — normalisasi dengan toArray (CR-016).
    const list = changes.toArray();
    setNodes((prev) => {
      let next = prev;
      for (const change of list) {
        if (change.type === 'position') {
          next = next.map((n) =>
            n.id === change.id ? { ...n, position: { ...n.position, ...change.position } } : n,
          );
        } else if (change.type === 'remove') {
          next = next.filter((n) => n.id !== change.id);
        } else if (change.type === 'select') {
          next = next.map((n) => (n.id === change.id ? { ...n, selected: change.selected } : n));
        }
      }
      return next;
    });
  }, []);

  const handleEdgesChange = React.useCallback((changes: EdgeChangeParam) => {
    const removedIds = new Set(changes.toArray().flatMap((c) => (c.type === 'remove' ? [c.id] : [])));
    setEdges((prev) => prev.filter((e) => !removedIds.has(e.id)));
  }, []);

  const handleConnect = React.useCallback((connection: ConnectParam) => {
    const { source, target, sourceHandle, targetHandle } = connection;
    if (source === target) return;
    const exists = edges.some(
      (e) => e.source === source && e.target === target && e.sourceHandle === sourceHandle && e.targetHandle === targetHandle,
    );
    if (exists) return;
    setEdges((prev) => [
      ...prev,
      { id: `e-${Date.now()}`, source, target, sourceHandle, targetHandle, animated: false },
    ]);
  }, [edges]);

  const handleSelectionChange = React.useCallback((selection: { nodes: FlowNode[]; edges: FlowEdge[] }) => {
    const total = selection.nodes.length + selection.edges.length;
    // Seleksi eksplisit (klik/Enter/rincian/menu) membuka sheet; seleksi node hasil tambah tidak (FR-006, D7).
    const isAddedNodeSelection =
      selection.nodes.length === 1 && selection.edges.length === 0 && selection.nodes[0].id === pendingAddIdRef.current;
    pendingAddIdRef.current = null;
    if (total === 0 || isAddedNodeSelection) {
      setSelected(null);
      setDraftTitle('');
      setTitleError(false);
      return;
    }
    setSelected(selection);
    if (selection.nodes.length === 1) setDraftTitle(selection.nodes[0].data.label);
    else setDraftTitle('');
    setTitleError(false);
  }, []);

  // Tambah node dikendalikan halaman (controlled); id disimpan agar seleksi awalnya tidak membuka sheet.
  const handleAddFromPalette = React.useCallback((item: FlowPaletteItem, position: { x: number; y: number }) => {
    const id = `node-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    pendingAddIdRef.current = id;
    setNodes((prev) => [
      ...prev,
      {
        id,
        type: item.type,
        position,
        data: { label: item.title, description: item.description, kind: item.type },
        selected: true,
      },
    ]);
  }, []);

  // Perubahan node/edge dari inspector langsung ke canvas (live), tanpa menunggu tombol simpan.
  const handlePatchNode = React.useCallback((id: string, patch: Partial<FlowNode['data']>) => {
    setNodes((prev) => prev.map((n) => (n.id === id ? { ...n, data: { ...n.data, ...patch } } : n)));
  }, []);

  const handleEdgeLabel = React.useCallback((id: string, label: string) => {
    setEdges((prev) => prev.map((e) => (e.id === id ? { ...e, label } : e)));
  }, []);

  const handleDuplicate = React.useCallback((node: FlowNode) => {
    const copy: FlowNode = {
      ...node,
      id: `${node.id}-copy-${Date.now()}`,
      position: { x: node.position.x + 40, y: node.position.y + 40 },
      selected: false,
      data: { ...node.data, label: `${node.data.label} (copy)` },
    };
    setNodes((prev) => [...prev, copy]);
    setSelected(null);
    setDraftTitle('');
    setTitleError(false);
    void toast({ title: 'Duplicated', description: `${copy.data.label} added to the canvas.`, duration: 4000 });
  }, []);

  // Seleksi dibaca ulang dari state terbaru agar isi inspector tidak stale setelah diedit.
  const liveSelection = React.useMemo(() => {
    if (!selected) return null;
    return {
      nodes: selected.nodes.flatMap((n) => {
        const live = nodes.find((x) => x.id === n.id);
        return live ? [live] : [];
      }),
      edges: selected.edges.flatMap((e) => {
        const live = edges.find((x) => x.id === e.id);
        return live ? [live] : [];
      }),
    };
  }, [selected, nodes, edges]);
  const selectedCount = liveSelection ? liveSelection.nodes.length + liveSelection.edges.length : 0;

  const handleResetDemo = React.useCallback(() => {
    setNodes(initialNodes);
    setEdges(initialEdges);
    setDemo('data');
    setSnapToGrid(false);
    setMinimapEnabled(true);
    setSelected(null);
    setDraftTitle('');
    setTitleError(false);
  }, []);

  const handleInvalidEdgeDemo = React.useCallback(() => {
    // Simulasi penolakan koneksi tak valid (self-loop) → toast role="alert" (AC-02 panel invalid-edge).
    void toast({
      title: 'Connection rejected',
      description: 'Cannot connect a node to itself (self-loop).',
      duration: 4000,
    });
  }, []);

  const demoNodes = demo === 'data' ? nodes : [];
  const demoEdges = demo === 'data' ? edges : [];
  const isError = demo === 'error';
  const isLoading = demo === 'loading';

  return (
    <div className="space-y-6">
      <PageHeader title="Flow Editor" description="Token-based node canvas with pan/zoom, ≥44px handles, and a state matrix." />

      {/* Kontrol demo + tema + minimap (AC-02/AC-05 panel demo). */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <PaletteSwitcher />
          <Switch
            checked={minimapEnabled}
            onCheckedChange={setMinimapEnabled}
            aria-label={minimapEnabled ? 'Hide minimap' : 'Show minimap'}
            data-testid="flow-minimap-switch"
          />
          <span className="text-xs text-muted-foreground">{resolvedTheme === 'dark' ? 'Dark' : 'Light'}</span>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant={demo === 'data' ? 'default' : 'outline'} size="sm" onClick={() => setDemo('data')}>
            Load example
          </Button>
          <Button variant="outline" size="sm" onClick={() => setDemo('loading')}>
            Simulate loading
          </Button>
          <Button variant="outline" size="sm" onClick={() => setDemo('empty')}>Empty</Button>
          <Button variant="outline" size="sm" onClick={() => setDemo('error')}>Force error</Button>
          <Button variant="destructive" size="sm" onClick={handleInvalidEdgeDemo}>
            Invalid edge
          </Button>
          <Button onClick={handleResetDemo}>Reset demo</Button>
        </div>
      </div>

      {/* Panduan 6 langkah (AC-02, Bahasa Indonesia). */}
      <Card className="border border-info/30 bg-info/5">
        <CardHeader>
          <CardTitle className="text-sm">How to use the demo</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="list-decimal pl-5 space-y-1 text-sm text-foreground/90">
            <li>Start from the <strong>Start</strong> node already on the canvas.</li>
            <li>Add a node from the palette on the canvas (drag a node type or click [+] on an item).</li>
            <li>Connect a source handle to a target handle to build the flow.</li>
            <li>Enable <strong>snap to grid</strong> from the canvas toolbar for tidy placement.</li>
            <li>Open the <strong>minimap</strong> to navigate a large canvas, then drag the viewport.</li>
            <li>Select a node to rename it through the Inspector (right sheet; bottom sheet on small screens).</li>
          </ol>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <section className="lg:col-span-9">
          <Card>
            <CardHeader className="flex flex-col md:flex-row md:items-center justify-between gap-2">
              <div>
                <CardTitle className="text-sm">Flow canvas</CardTitle>
                <CardDescription className="text-xs">
                  {demo === 'data' ? `${nodes.length} node · ${edges.length} edge` : demo} state
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Separator orientation="vertical" className="h-4" />
                <Button
                  variant={snapToGrid ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSnapToGrid((prev) => !prev)}
                  aria-pressed={snapToGrid}
                  data-testid="flow-snap-toggle"
                >
                  Snap grid {snapToGrid ? 'on' : 'off'}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <FlowEditor
                nodes={demoNodes}
                edges={demoEdges}
                onNodesChange={handleNodesChange}
                onEdgesChange={handleEdgesChange}
                onConnect={handleConnect}
                onSelectionChange={handleSelectionChange}
                onDelete={handleDelete}
                onAddFromPalette={handleAddFromPalette}
                paletteItems={paletteItems}
                loading={isLoading}
                error={isError ? 'Could not load the flow from the server.' : null}
                onRetry={() => {
                  setDemo('data');
                  void toast({ title: 'Retried', description: 'Flow reloaded.' });
                }}
                minimap={minimapEnabled}
                snapToGrid={snapToGrid}
                gridSize={gridSize}
                ariaLabel="Demo flow editor"
              />
            </CardContent>
            {/* Satu sumber visual: panel inspector ada di sheet; di kartu hanya live region hitungan (CR-019 #5). */}
            <div role="status" aria-live="polite" className="sr-only" data-testid="flow-selection-count">
              {selectedCount > 0 ? `${selectedCount} selected` : ''}
            </div>
          </Card>
        </section>
      </div>

      {/* Inspector on-demand — bottom-sheet di layar kecil (AC-05), sheet kanan di desktop. */}
      {/* Tutup via X/Esc/overlay meng-clear seleksi dan mengembalikan fokus (CR-019 #1). */}
      <Sheet open={!!liveSelection && selectedCount > 0} onOpenChange={(open) => { if (!open) handleCancel(); }}>
        <SheetTrigger asChild>
          {selected && (
            <Button variant="outline" size="sm" data-testid="flow-inspector-trigger">
              Open inspector
            </Button>
          )}
        </SheetTrigger>
        <SheetContent
          side={isMobile ? 'bottom' : 'right'}
          className={isMobile ? 'h-[60vh] max-h-[60vh]' : 'w-80'}
          data-testid="flow-inspector"
        >
          {liveSelection && selectedCount > 0 ? (
            <InspectorPanel
              selection={liveSelection}
              draftTitle={draftTitle}
              titleError={titleError}
              onChangeTitle={setDraftTitle}
              onBlurTitle={onBlurTitle}
              onSaveTitle={handleSaveTitle}
              onPatchNode={handlePatchNode}
              onChangeEdgeLabel={handleEdgeLabel}
              onDuplicate={handleDuplicate}
              onDelete={handleDelete}
              onCancel={handleCancel}
            />
          ) : null}
        </SheetContent>
      </Sheet>
    </div>
  );
}

// ---------------------------------------------------------------------------
// InspectorSummary + InspectorPanel — komposisi inspector on-demand (story 005-04)
// ---------------------------------------------------------------------------

type InspectorPanelProps = {
  selection: { nodes: FlowNode[]; edges: FlowEdge[] };
  draftTitle: string;
  titleError: boolean;
  onChangeTitle: (value: string) => void;
  onBlurTitle: (value: string) => void;
  onSaveTitle: () => void;
  onPatchNode: (id: string, patch: Partial<FlowNode['data']>) => void;
  onChangeEdgeLabel: (id: string, label: string) => void;
  onDuplicate: (node: FlowNode) => void;
  onDelete: (selection: { nodes: FlowNode[]; edges: FlowEdge[] }) => void;
  onCancel: () => void;
};

const STATUS_OPTIONS: Array<{ value: FlowStatus; label: string }> = [
  { value: 'default', label: 'Default' },
  { value: 'running', label: 'Running' },
  { value: 'success', label: 'Success' },
  { value: 'warning', label: 'Warning' },
  { value: 'error', label: 'Failed' },
];

function InspectorPanel({
  selection,
  draftTitle,
  titleError,
  onChangeTitle,
  onBlurTitle,
  onSaveTitle,
  onPatchNode,
  onChangeEdgeLabel,
  onDuplicate,
  onDelete,
  onCancel,
}: InspectorPanelProps) {
  const isMulti = selection.nodes.length + selection.edges.length > 1;
  const isSingleNode = selection.nodes.length === 1 && selection.edges.length === 0;
  const node = selection.nodes[0];
  const edge = selection.edges[0];
  const edgeCount = node
    ? selection.edges.filter((e) => e.source === node.id || e.target === node.id).length
    : 0;

  const sheetTitle = isMulti
    ? `${selection.nodes.length + selection.edges.length} selected (${selection.nodes.length} nodes, ${selection.edges.length} edges)`
    : isSingleNode
      ? (node?.data.label ?? 'Node')
      : edge
        ? `Edge ${edge.source}→${edge.target}`
        : 'Inspector';

  return (
    <>
      <SheetHeader>
        <SheetTitle className="text-sm">{sheetTitle}</SheetTitle>
        <SheetDescription>
          {isMulti
            ? 'Use Delete all to remove them at once, or clear the selection.'
            : isSingleNode
              ? 'Rename the node. The title cannot be empty.'
              : 'Edit the edge label, or delete the edge from the canvas.'}
        </SheetDescription>
      </SheetHeader>
      <Separator />
      <CardContent className="space-y-3">
        {isMulti ? (
          <>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => {
                onDelete(selection);
                onCancel();
              }}
            >
              Delete all
            </Button>
            <Button variant="outline" size="sm" onClick={onCancel}>
              Clear selection
            </Button>
          </>
        ) : isSingleNode ? (
          <>
            <div className="space-y-1">
              <div className="text-xs font-medium">ID</div>
              <Input readOnly value={node?.id ?? ''} className="text-xs" />
            </div>
            <div className="space-y-1">
              <Label htmlFor="flow-node-title" className="text-xs font-medium">Title</Label>
              <Input
                id="flow-node-title"
                value={draftTitle}
                onChange={(e) => onChangeTitle(e.target.value)}
                onBlur={() => onBlurTitle(draftTitle)}
                className={`text-xs border ${titleError ? 'border-destructive' : ''}`}
                aria-describedby={titleError ? 'err-flow-node-title' : undefined}
                aria-invalid={titleError}
              />
              {titleError && <p id="err-flow-node-title" className="text-xs text-destructive">Title cannot be empty.</p>}
            </div>
            <div className="space-y-1">
              <Label htmlFor="flow-node-description" className="text-xs font-medium">Description</Label>
              <Input
                id="flow-node-description"
                value={node?.data.description ?? ''}
                onChange={(e) => node && onPatchNode(node.id, { description: e.target.value })}
                className="text-xs"
              />
            </div>
            <fieldset className="space-y-1">
              <legend className="text-xs font-medium">Status</legend>
              <SegmentedControl
                type="single"
                value={node?.data.status ?? 'default'}
                onValueChange={(v) => {
                  if (v && node) onPatchNode(node.id, { status: v as FlowStatus });
                }}
                aria-label="Node status"
              >
                {STATUS_OPTIONS.map((opt) => (
                  <SegmentedControlItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SegmentedControlItem>
                ))}
              </SegmentedControl>
            </fieldset>
            <div className="space-y-1">
              <div className="text-xs font-medium">Position</div>
              <Input
                readOnly
                value={`(${Math.round(node?.position.x ?? 0)}, ${Math.round(node?.position.y ?? 0)})`}
                className="text-xs"
              />
            </div>
            <div className="space-y-1">
              <div className="text-xs font-medium">Connections</div>
              <Input readOnly value={String(edgeCount)} className="text-xs" />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button size="sm" onClick={onSaveTitle} disabled={titleError || draftTitle.trim().length === 0}>
                Save title
              </Button>
              <Button variant="outline" size="sm" onClick={() => node && onDuplicate(node)}>
                Duplicate
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => {
                  onDelete({
                    nodes: [node],
                    edges: selection.edges.filter((e) => e.source === node.id || e.target === node.id),
                  });
                  onCancel();
                }}
              >
                Delete node
              </Button>
              <Button variant="outline" size="sm" onClick={onCancel}>
                Cancel
              </Button>
            </div>
          </>
        ) : (
          <>
            <div className="space-y-1">
              <div className="text-xs font-medium">ID</div>
              <Input readOnly value={edge?.id ?? ''} className="text-xs" />
            </div>
            <div className="space-y-1">
              <div className="text-xs font-medium">Source → Target</div>
              <Input readOnly value={`${edge?.source ?? '—'} → ${edge?.target ?? '—'}`} className="text-xs" />
            </div>
            <div className="space-y-1">
              <Label htmlFor="flow-edge-label" className="text-xs font-medium">Label</Label>
              <Input
                id="flow-edge-label"
                value={edge?.label ?? ''}
                onChange={(e) => edge && onChangeEdgeLabel(edge.id, e.target.value)}
                className="text-xs"
              />
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="destructive"
                size="sm"
                onClick={() => {
                  if (edge) onDelete({ nodes: [], edges: [edge] });
                  onCancel();
                }}
              >
                Delete edge
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </>
  );
}
