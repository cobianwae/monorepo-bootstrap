'use client';

import * as React from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import {
  Rows3,
  Package,
  RefreshCw,
  Search,
  Box,
  Database,
  Zap,
  Layers,
  CheckCircle2,
  PackageX,
} from 'lucide-react';
import {
  PageHeader,
  Button,
  Badge,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Skeleton,
  EmptyState,
} from '@ds/ui';

interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  status: 'in_stock' | 'low_stock' | 'out_of_stock';
  updated: string;
}

const CATEGORIES = ['Design', 'Engineering', 'Marketing', 'Sales', 'Analytics', 'Infrastructure', 'Support', 'Finance'];
const NAMES = [
  'Lumen Button', 'Contrast Kit', 'Radix Field', 'OKLCH Palette', 'Skeleton Board', 'Token Vault',
  'Art Direction', 'Variant Studio', 'Focus Ring', 'Density Swatch', 'Gradient Bloom', 'Elevation Deck',
  'Motion Curve', 'Icon Lattice', 'Prose Canvas', 'Grid Rhythms', 'Shadow Atlas', 'Type Specimen',
  'Hue Compass', 'Mono Sheet', 'Spacing Ruler', 'Radius Blender', 'Banner Weave', 'Toast Forge',
  'Empty State', 'Kbd Keycap', 'Badge Press', 'Tooltip Lens', 'Popover Nest', 'Dialog Chapel',
];
const STATUS_META = {
  in_stock: { label: 'In stock', badge: 'success' as const },
  low_stock: { label: 'Low stock', badge: 'outline' as const },
  out_of_stock: { label: 'Out of stock', badge: 'destructive' as const },
};

function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function buildCatalog(count: number): Product[] {
  const rand = mulberry32(42);
  return Array.from({ length: count }, (_, i) => {
    const status = rand() < 0.7 ? 'in_stock' : rand() < 0.85 ? 'low_stock' : 'out_of_stock';
    return {
      id: `PRD-${String(1000 + i).padStart(5, '0')}`,
      name: `${NAMES[i % NAMES.length]} ${String((i / NAMES.length) | 0).padStart(3, '0')}`,
      category: CATEGORIES[i % CATEGORIES.length],
      price: Math.round((4 + rand() * 240) * 100) / 100,
      status,
      updated: `Aug ${String(1 + ((i * 7) % 17)).padStart(2, '0')}, 2026`,
    };
  });
}

export default function VirtualizedListPage() {
  const TOTAL = 10000;
  const [rows, setRows] = React.useState<Product[]>([]);
  const [query, setQuery] = React.useState('');
  const [dense, setDense] = React.useState(false);
  const parentRef = React.useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    const t = setTimeout(() => {
      setRows(buildCatalog(TOTAL));
      setMounted(true);
    }, 600);
    return () => clearTimeout(t);
  }, []);

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter(
      (r) =>
        r.name.toLowerCase().includes(q) ||
        r.id.toLowerCase().includes(q) ||
        r.category.toLowerCase().includes(q)
    );
  }, [rows, query]);

  const rowVirtualizer = useVirtualizer({
    count: filtered.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => (dense ? 40 : 56),
    overscan: 12,
  });

  const renderedCount = rowVirtualizer.getVirtualItems().length;
  const scrollOffset = rowVirtualizer.scrollOffset ?? 0;

  const resetFilters = () => setQuery('');

  return (
    <div className="space-y-10 animate-in fade-in-50 duration-200">
      <PageHeader
        eyebrow="UX Recipe Scenario"
        eyebrowIcon={Rows3}
        title="Virtualized List & Data Grid"
        description="Render 10,000 rows with just a handful of DOM nodes using @tanstack/react-virtual — windowing that keeps scroll performance smooth regardless of data size."
        actions={
          <div className="flex items-center gap-2">
            <Badge variant="highlight" className="font-mono text-xs">
              {TOTAL.toLocaleString()} rows
            </Badge>
            <Badge variant="outline" className="font-mono text-xs">
              {renderedCount} mounted
            </Badge>
          </div>
        }
      />

      {/* Stats strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: Database, label: 'Total records', value: rows.length.toLocaleString(), accent: 'text-highlight' },
          { icon: Box, label: 'DOM nodes mounted', value: renderedCount, accent: 'text-primary' },
          { icon: Layers, label: 'Virtual height', value: `${Math.round(rowVirtualizer.getTotalSize() / 1000)}px`, accent: 'text-success' },
          { icon: Zap, label: 'Scroll offset', value: `${Math.round(scrollOffset)}px`, accent: 'text-muted-foreground' },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} className="border-border">
              <CardContent className="p-4 flex items-center gap-3">
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted/30 ${stat.accent}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-lg font-extrabold font-display text-foreground leading-none">{stat.value}</p>
                  <p className="mt-1 truncate text-xs text-muted-foreground">{stat.label}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card className="border-border">
        <CardHeader className="pb-3 border-b border-border/60 bg-muted/10">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="space-y-1">
              <CardTitle className="text-sm flex items-center gap-2">
                <Package className="h-4 w-4 text-highlight" />
                Virtualized product catalog
              </CardTitle>
              <CardDescription className="text-xs">
                Scroll through 10,000 products — only the visible window is rendered.
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative w-52">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Filter name / id / category…"
                  aria-label="Filter products"
                  className="w-full rounded-lg border border-input bg-background pl-9 pr-3 py-1.5 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 text-xs"
                onClick={() => setDense((d) => !d)}
              >
                <Rows3 className="h-3.5 w-3.5" />
                {dense ? 'Dense' : 'Comfortable'}
              </Button>
            </div>
          </div>
        </CardHeader>

        {!mounted ? (
          <CardContent className="p-6 space-y-2">
            {Array.from({ length: 10 }).map((_, i) => (
              <Skeleton key={i} className="h-11 w-full rounded-md" />
            ))}
          </CardContent>
        ) : filtered.length === 0 ? (
          <CardContent className="p-10">
            <EmptyState
              icon={PackageX}
              title="No products match"
              description={`Nothing matched "${query}". Try a different search term.`}
              actionLabel="Clear search"
              onAction={resetFilters}
            />
          </CardContent>
        ) : (
          <div className="p-0">
            {/* Header */}
            <div className={`grid grid-cols-[110px_minmax(0,1fr)_140px_110px_130px_140px] gap-3 border-b border-border/60 bg-muted/10 px-4 py-2.5 text-[11px] font-bold uppercase tracking-wider text-muted-foreground font-mono`}>
              <span>SKU</span>
              <span>Product</span>
              <span>Category</span>
              <span>Price</span>
              <span>Status</span>
              <span>Updated</span>
            </div>

            {/* Virtualized body */}
            <div ref={parentRef} className="h-[480px] overflow-auto overscroll-contain">
              <div
                className="relative w-full"
                style={{ height: `${rowVirtualizer.getTotalSize()}px` }}
              >
                {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                  const product = filtered[virtualRow.index];
                  const meta = STATUS_META[product.status];
                  const rowHeight = dense ? 40 : 56;
                  return (
                    <div
                      key={virtualRow.key}
                      data-index={virtualRow.index}
                      ref={rowVirtualizer.measureElement}
                      className="absolute left-0 top-0 w-full"
                      style={{ height: rowHeight, transform: `translateY(${virtualRow.start}px)` }}
                    >
                      <div className={`grid grid-cols-[110px_minmax(0,1fr)_140px_110px_130px_140px] items-center gap-3 border-b border-border/40 px-4 text-sm hover:bg-muted/20 transition-colors ${dense ? 'py-1' : 'py-2.5'}`}>
                        <span className="font-mono text-xs text-muted-foreground">{product.id}</span>
                        <span className="truncate font-medium text-foreground">{product.name}</span>
                        <span className="truncate text-xs text-muted-foreground">{product.category}</span>
                        <span className="font-mono text-xs text-foreground">${product.price.toFixed(2)}</span>
                        <span>
                          <Badge variant={meta.badge} className="text-[10px] px-2 py-0.5 font-mono">
                            {meta.label}
                          </Badge>
                        </span>
                        <span className="font-mono text-xs text-muted-foreground">{product.updated}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        <div className="flex flex-wrap items-center gap-4 border-t border-border/60 bg-muted/10 px-6 py-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <Zap className="h-3.5 w-3.5 text-highlight" />
            Windowed rendering: {renderedCount} of {filtered.length} rows in the DOM
          </span>
          <span className="ml-auto flex items-center gap-1.5">
            <CheckCircle2 className="h-3.5 w-3.5 text-success" />
            Scroll to the bottom — 10,000 rows, no jank
          </span>
        </div>
      </Card>

      {/* Pattern notes */}
      <Card className="border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <RefreshCw className="h-4 w-4 text-highlight" />
            Why windowing matters
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-muted-foreground leading-relaxed">
          <p>
            <strong className="text-foreground">Constant DOM:</strong> mounting 10,000 table rows freezes
            layout for seconds. Windowing keeps ~20 rows mounted, so scroll stays at 60fps.
          </p>
          <p>
            <strong className="text-foreground">measureElement:</strong> each row self-measures via{' '}
            <code className="font-mono">data-index</code>, so variable-height rows (wrapped text) are
            handled correctly without manual measurement.
          </p>
          <p>
            <strong className="text-foreground">Compose with filters:</strong> filtering happens on the data
            model before virtualization — the window simply re-sizes to the new result count.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}