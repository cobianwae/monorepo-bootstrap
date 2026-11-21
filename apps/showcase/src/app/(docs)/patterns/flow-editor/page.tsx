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
                paletteItems={paletteItems}
                loading={isLoading}
                error={isError ? 'Gagal memuat flow dari server.' : null}
                onRetry={() => {
                  setDemo('data');
                  void toast({ title: 'Diretry', description: 'Flow dimuat ulang.' });
                }}
                minimap
                ariaLabel="Editor alur demonstrasi"
              />
            </CardContent>
            {selected && (
              <CardFooter className="flex flex-col gap-2 pt-2 border-t">
                <CardTitle className="text-sm">Inspector (onSelectionChange)</CardTitle>
                <div className="text-xs text-muted-foreground space-y-1">
                  <div>Node terpilih: {selected.nodes.map((n) => n.data.label).join(', ') || '—'}</div>
                  <div>Edge terpilih: {selected.edges.length}</div>
                </div>
              </CardFooter>
            )}
          </Card>
        </section>
      </div>

      {/* Inspector sheet on-demand (story 005-04): hanya buka saat seleksi eksplisit. */}
      <Sheet open={!!selected}>
        <SheetContent side="right" className="w-80">
          <SheetHeader>
            <SheetTitle>{selected?.nodes[0]?.data.label ?? 'Inspector'}</SheetTitle>
            <SheetDescription>Ubah properti node secara live (konsumen menyediakan form).</SheetDescription>
          </SheetHeader>
          <Separator />
          <CardContent className="space-y-2">
            <div className="text-xs font-medium">ID</div>
            <input
              readOnly
              value={selected?.nodes[0]?.id ?? ''}
              className="w-full border border-input bg-background px-2 py-1 text-xs rounded"
            />
            <div className="text-xs font-medium">Judul</div>
            <input
              readOnly
              value={selected?.nodes[0]?.data.label ?? ''}
              className="w-full border border-input bg-background px-2 py-1 text-xs rounded"
            />
          </CardContent>
        </SheetContent>
      </Sheet>
    </div>
  );
}
