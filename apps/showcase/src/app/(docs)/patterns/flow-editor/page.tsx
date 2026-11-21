'use client';

// Flow Editor showcase draf — S-005.29 (story 005-01, final diserahkan ke 005-06).
// Resep konsumen: state kendali di luar komponen (controlled), FlowEditor hanya
// presentasi + komposisi tanpa persistensi internal (PRD FR-012).

import * as React from 'react';
import { Plus } from 'lucide-react';
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
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
  Input,
  Label,
  toast,
  type FlowEdge,
  type FlowNode,
  type FlowEditorProps,
  type FlowPaletteItem,
} from '@ds/ui';

type NodeChangeParam = NonNullable<FlowEditorProps['onNodesChange']> extends (changes: infer C) => void ? C : never;
type EdgeChangeParam = NonNullable<FlowEditorProps['onEdgesChange']> extends (changes: infer C) => void ? C : never;
type ConnectParam = NonNullable<FlowEditorProps['onConnect']> extends (connection: infer C) => void ? C : never;

const paletteItems: FlowPaletteItem[] = [
  { type: 'action', title: 'Kirim email', description: 'Tugas otomatisasi email' },
  { type: 'pending', title: 'Tunda', description: 'Jeda eksekusi sejumlah waktu' },
];

const initialNodes: FlowNode[] = [
  { id: 'n1', type: 'action', position: { x: 100, y: 50 }, data: { label: 'Mulai', kind: 'action' } },
  { id: 'n2', type: 'action', position: { x: 400, y: 50 }, data: { label: 'Kirim email', kind: 'action' } },
  { id: 'n3', type: 'pending', position: { x: 700, y: 50 }, data: { label: 'Tunggu 1 hari', kind: 'pending', status: 'warning' } },
  { id: 'n4', type: 'action', position: { x: 400, y: 220 }, data: { label: 'Cabang verifikasi', kind: 'action' } },
  { id: 'n5', type: 'action', position: { x: 700, y: 220 }, data: { label: 'Selesai', kind: 'success' } },
];

const initialEdges: FlowEdge[] = [
  { id: 'e1', source: 'n1', target: 'n2', label: 'trigger', animated: false },
  { id: 'e2', source: 'n2', target: 'n3', label: 'tunda', animated: false },
  { id: 'e3', source: 'n3', target: 'n4', label: 'lanjut', animated: false },
  { id: 'e4', source: 'n4', target: 'n5', label: 'selesai', animated: false },
];

export default function FlowEditorPage() {
  const [nodes, setNodes] = React.useState<FlowNode[]>(initialNodes);
  const [edges, setEdges] = React.useState<FlowEdge[]>(initialEdges);
  const [selected, setSelected] = React.useState<{ nodes: FlowNode[]; edges: FlowEdge[] } | null>(null);
  const [demo, setDemo] = React.useState<'data' | 'loading' | 'empty' | 'error'>('data');
  const [snapToGrid, setSnapToGrid] = React.useState(false);
  const gridSize = 16;
  const [draftTitle, setDraftTitle] = React.useState('');
  const [titleError, setTitleError] = React.useState(false);

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
    void toast({ title: 'Dihapus', description: `${selection.nodes.length} node, ${selection.edges.length} edge dihapus — Urungkan`, duration: 4000 });
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
    setNodes((prev) => {
      let next = prev;
      for (const change of (changes as unknown as { type: string; id: string; position?: { x: number; y: number }; selected?: boolean }[])) {
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
    setEdges((prev) =>
      prev.filter((e) => !((changes as unknown as { type: string; id: string }[]).some((c) => c.type === 'remove' && c.id === e.id))),
    );
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
    setSelected(selection);
    if (selection.nodes.length === 1) setDraftTitle(selection.nodes[0].data.label);
    else setDraftTitle('');
    setTitleError(false);
  }, []);

  const demoNodes = demo === 'data' ? nodes : [];
  const demoEdges = demo === 'data' ? edges : [];
  const isError = demo === 'error';
  const isLoading = demo === 'loading';

  return (
    <div className="space-y-6">
      <PageHeader title="Flow Editor" description="Canvas node berbasis token dengan pan/zoom, handle ≥44px, dan state matrix." />
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <aside className="lg:col-span-3 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Palette</CardTitle>
              <CardDescription>Tambah jenis node ke kanvas (demo).</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {paletteItems.map((item) => (
                <button
                  key={item.type}
                  type="button"
                  className="flex w-full items-center gap-2 rounded-md border border-border px-3 py-2 text-sm text-foreground hover:bg-accent"
                  onClick={() => {
                    const node: FlowNode = {
                      id: `n-${Date.now()}`,
                      type: item.type,
                      position: { x: 400, y: 300 },
                      data: { label: item.title, kind: item.type },
                    };
                    setNodes((prev) => [...prev, node]);
                    void toast({ title: 'Ditambah', description: item.title });
                  }}
                >
                  <Plus className="h-4 w-4 shrink-0" />
                  <span>{item.title}</span>
                </button>
              ))}
            </CardContent>
          </Card>
        </aside>

        <section className="lg:col-span-9">
          <Card>
            <CardHeader className="flex flex-col md:flex-row md:items-center justify-between gap-2">
              <div>
                <CardTitle className="text-sm">Kanvas alur</CardTitle>
                <CardDescription className="text-xs">{demo} state · {nodes.length} node, {edges.length} edge</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Separator orientation="vertical" className="h-4" />
                <Button variant="outline" size="sm" onClick={() => setDemo('data')}>Muat contoh</Button>
                <Button variant="outline" size="sm" onClick={() => setDemo('loading')}>Simulasi memuat</Button>
                <Button variant="outline" size="sm" onClick={() => setDemo('empty')}>Kosongkan</Button>
                <Button variant="outline" size="sm" onClick={() => setDemo('error')}>Paksa error</Button>
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
            <CardContent>
              <FlowEditor
                nodes={demoNodes}
                edges={demoEdges}
                onNodesChange={handleNodesChange}
                onEdgesChange={handleEdgesChange}
                onConnect={handleConnect}
                onSelectionChange={handleSelectionChange}
                onDelete={handleDelete}
                paletteItems={paletteItems}
                loading={isLoading}
                error={isError ? 'Gagal memuat flow dari server.' : null}
                onRetry={() => {
                  setDemo('data');
                  void toast({ title: 'Diretry', description: 'Flow dimuat ulang.' });
                }}
                minimap
                snapToGrid={snapToGrid}
                gridSize={gridSize}
                ariaLabel="Editor alur demonstrasi"
              />
            </CardContent>
            {selected && (
              <CardFooter className="flex flex-col gap-2 pt-2 border-t">
                <CardTitle className="text-sm">Inspector (onSelectionChange)</CardTitle>
                <InspectorSummary selection={selected} />
              </CardFooter>
            )}
          </Card>
        </section>
      </div>

      {/* Inspector sheet on-demand (story 005-04): hanya buka saat seleksi eksplisit. */}
      <Sheet open={!!selected}>
        <SheetContent side="right" className="w-80">
          {selected ? (
            <InspectorPanel
              selection={selected}
              draftTitle={draftTitle}
              titleError={titleError}
              onChangeTitle={setDraftTitle}
              onBlurTitle={onBlurTitle}
              onSaveTitle={handleSaveTitle}
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
// InspectorPanel — komposisi inspector on-demand (story 005-04)
// ---------------------------------------------------------------------------

type InspectorPanelProps = {
  selection: { nodes: FlowNode[]; edges: FlowEdge[] };
  draftTitle: string;
  titleError: boolean;
  onChangeTitle: (value: string) => void;
  onBlurTitle: (value: string) => void;
  onSaveTitle: () => void;
  onDelete: (selection: { nodes: FlowNode[]; edges: FlowEdge[] }) => void;
  onCancel: () => void;
};

function InspectorSummary({ selection }: { selection: { nodes: FlowNode[]; edges: FlowEdge[] } }) {
  const total = selection.nodes.length + selection.edges.length;
  return (
    <div className="text-xs text-muted-foreground space-y-1">
      <div>
        {selection.nodes.length > 0 || selection.edges.length > 0
          ? `${total} terpilih (${selection.nodes.length} node, ${selection.edges.length} edge)`
          : '—'}
      </div>
      {selection.nodes.length > 0 && (
        <div className="truncate" title={selection.nodes.map((n) => n.data.label).join(', ')}>
          Node: {selection.nodes.map((n) => n.data.label).join(', ')}
        </div>
      )}
      {selection.edges.length > 0 && (
        <div className="truncate" title={selection.edges.map((e) => `${e.source}→${e.target}`).join(', ')}>
          Edge: {selection.edges.map((e) => `${e.source}→${e.target}`).join(', ')}
        </div>
      )}
    </div>
  );
}

function InspectorPanel({
  selection,
  draftTitle,
  titleError,
  onChangeTitle,
  onBlurTitle,
  onSaveTitle,
  onDelete,
  onCancel,
}: InspectorPanelProps) {
  const isMulti = selection.nodes.length > 1 || selection.edges.length > 0;
  const isSingleNode = selection.nodes.length === 1 && selection.edges.length === 0;
  const node = selection.nodes[0];
  const edge = selection.edges[0];
  const edgeCount = node
    ? selection.edges.filter((e) => e.source === node.id || e.target === node.id).length
    : 0;

  const sheetTitle = isMulti
    ? `${selection.nodes.length + selection.edges.length} terpilih (${selection.nodes.length} node, ${selection.edges.length} edge)`
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
            ? 'Gunakan [Hapus semua] untuk menghapus atomik, atau [Batalkan seleksi].'
            : isSingleNode
              ? 'Ubah judul node. Judul tidak boleh kosong.'
              : 'Properti edge (baca saja).'}
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
              Hapus semua
            </Button>
            <Button variant="outline" size="sm" onClick={onCancel}>
              Batalkan seleksi
            </Button>
          </>
        ) : isSingleNode ? (
          <>
            <div className="space-y-1">
              <div className="text-xs font-medium">ID</div>
              <Input readOnly value={node?.id ?? ''} className="text-xs" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-medium">Judul</Label>
              <Input
                value={draftTitle}
                onChange={(e) => onChangeTitle(e.target.value)}
                onBlur={() => onBlurTitle(draftTitle)}
                className={`text-xs border ${titleError ? 'border-destructive' : ''}`}
                aria-invalid={titleError}
              />
              {titleError && <p className="text-xs text-destructive">Judul tidak boleh kosong.</p>}
            </div>
            <div className="space-y-1">
              <div className="text-xs font-medium">Posisi</div>
              <Input
                readOnly
                value={`(${Math.round(node?.position.x ?? 0)}, ${Math.round(node?.position.y ?? 0)})`}
                className="text-xs"
              />
            </div>
            <div className="space-y-1">
              <div className="text-xs font-medium">Koneksi</div>
              <Input readOnly value={String(edgeCount)} className="text-xs" />
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                onClick={onSaveTitle}
                disabled={titleError || draftTitle.trim().length === 0}
              >
                Simpan
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
                Hapus node
              </Button>
              <Button variant="outline" size="sm" onClick={onCancel}>
                Batal
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
              <div className="text-xs font-medium">Sumber → Target</div>
              <Input readOnly value={`${edge?.source ?? '—'} → ${edge?.target ?? '—'}`} className="text-xs" />
            </div>
            <div className="space-y-1">
              <div className="text-xs font-medium">Label</div>
              <Input readOnly value={edge?.label ?? ''} className="text-xs" />
            </div>
          </>
        )}
      </CardContent>
    </>
  );
}
