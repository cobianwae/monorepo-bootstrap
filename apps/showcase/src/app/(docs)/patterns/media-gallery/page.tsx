'use client';

import * as React from 'react';
import type { LucideIcon } from 'lucide-react';
import {
  PageHeader,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  Button,
  Badge,
  Input,
  Checkbox,
  Skeleton,
  EmptyState,
  BulkActionBar,
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
  Kbd,
  Lightbox,
  CodeBlock,
  DemoSection,
  SegmentedControl,
  SegmentedControlItem,
  useTheme,
  toast,
  type LightboxItem,
} from '@ds/ui';
import {
  Images,
  Monitor,
  Network,
  PenTool,
  LayoutGrid,
  Maximize2,
  Search,
  CheckSquare,
  X,
  Trash2,
  Download,
  ImageOff,
  Play,
} from 'lucide-react';
import { SectionHeading } from '../../../../components/section-heading';

type GalleryCategory = 'Screenshot' | 'Diagram' | 'Mockup';

type CategoryFilter = 'All' | GalleryCategory;

type GalleryKind = 'image' | 'video' | 'broken';

interface GalleryItem {
  id: string;
  filename: string;
  category: GalleryCategory;
  description: string;
  /** Pasangan warna placeholder gradien (grid + slide SVG lokal). */
  colors: [string, string];
  kind: GalleryKind;
}

const CATEGORIES: CategoryFilter[] = ['All', 'Screenshot', 'Diagram', 'Mockup'];

const CATEGORY_ICONS: Record<GalleryCategory, LucideIcon> = {
  Screenshot: Monitor,
  Diagram: Network,
  Mockup: PenTool,
};

const VIDEO_SRC = '/examples/media-gallery/demo-video.mp4';
const BROKEN_SRC = '/examples/media-gallery/missing-image.png';

/** Placeholder SVG lokal (offline, tanpa aset eksternal) untuk slide lightbox. */
function placeholderSrc(item: GalleryItem): string {
  const [c1, c2] = item.colors;
  const svg = [
    '<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="720" viewBox="0 0 1280 720">',
    '<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">',
    `<stop offset="0" stop-color="${c1}"/><stop offset="1" stop-color="${c2}"/>`,
    '</linearGradient></defs>',
    '<rect width="1280" height="720" fill="url(#g)"/>',
    '<circle cx="640" cy="320" r="92" fill="#ffffff" fill-opacity="0.85"/>',
    `<text x="640" y="500" font-family="sans-serif" font-size="38" fill="#ffffff" text-anchor="middle">${item.filename}</text>`,
    `<text x="640" y="548" font-family="sans-serif" font-size="26" fill="#ffffff" fill-opacity="0.85" text-anchor="middle">${item.category}</text>`,
    '</svg>',
  ].join('');
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

const GALLERY_ITEMS: GalleryItem[] = [
  { id: 'g1', filename: 'dashboard-analytics.png', category: 'Screenshot', description: 'Analytics dashboard with live KPI charts and a dense data table.', colors: ['#6366f1', '#a855f7'], kind: 'image' },
  { id: 'g2', filename: 'settings-night-mode.png', category: 'Screenshot', description: 'Settings panel captured in dark mode with OKLCH token parity.', colors: ['#a855f7', '#6366f1'], kind: 'image' },
  { id: 'g3', filename: 'onboarding-flow.png', category: 'Screenshot', description: 'Three-step onboarding wizard with progress stepper and skeletons.', colors: ['#8b5cf6', '#3b82f6'], kind: 'image' },
  { id: 'g4', filename: 'report-export.png', category: 'Screenshot', description: 'Export dialog with format picker, date range, and delivery options.', colors: ['#3b82f6', '#a855f7'], kind: 'image' },
  { id: 'g5', filename: 'architecture-overview.png', category: 'Diagram', description: 'High-level service architecture: web, API, and shared packages.', colors: ['#22c55e', '#14b8a6'], kind: 'image' },
  { id: 'g6', filename: 'data-model.png', category: 'Diagram', description: 'Prisma schema relations diagram for the clinic domain.', colors: ['#14b8a6', '#6366f1'], kind: 'image' },
  { id: 'g7', filename: 'auth-sequence.png', category: 'Diagram', description: 'OAuth token exchange sequence across client, API, and provider.', colors: ['#06b6d4', '#22c55e'], kind: 'image' },
  { id: 'g8', filename: 'deploy-pipeline.png', category: 'Diagram', description: 'CI/CD pipeline stages from lint to preview deployment.', colors: ['#22c55e', '#eab308'], kind: 'image' },
  { id: 'g9', filename: 'landing-hero.png', category: 'Mockup', description: 'Landing page hero concept with gradient art and CTA band.', colors: ['#06b6d4', '#f59e0b'], kind: 'image' },
  { id: 'g10', filename: 'pricing-cards.png', category: 'Mockup', description: 'Three-tier pricing layout with highlight variant on the middle plan.', colors: ['#f59e0b', '#ec4899'], kind: 'image' },
  { id: 'g11', filename: 'profile-mobile.png', category: 'Mockup', description: 'Mobile profile screen mock with avatar group and stat cards.', colors: ['#ec4899', '#6366f1'], kind: 'image' },
  { id: 'g12', filename: 'onboarding-mobile.png', category: 'Mockup', description: 'Mobile sign-up flow with bottom nav and empty state guidance.', colors: ['#f59e0b', '#06b6d4'], kind: 'image' },
];

/** Dataset panel demo (di luar pola grid): 12 gambar + 1 video lokal + 1 item rusak. */
const DEMO_ITEMS: GalleryItem[] = [
  ...GALLERY_ITEMS,
  { id: 'g13', filename: 'product-tour.mp4', category: 'Mockup', description: 'Short locally generated product tour clip with native playback controls.', colors: ['#6366f1', '#ec4899'], kind: 'video' },
  { id: 'g14', filename: 'corrupted-upload.png', category: 'Screenshot', description: 'Deliberately broken item used to demonstrate the lightbox error state.', colors: ['#64748b', '#334155'], kind: 'broken' },
];

function toLightboxItem(item: GalleryItem): LightboxItem {
  if (item.kind === 'video') {
    return {
      id: item.id,
      src: VIDEO_SRC,
      alt: `${item.filename} — ${item.description}`,
      type: 'video',
      poster: placeholderSrc(item),
      caption: item.description,
      meta: `${item.filename} • ${item.category}`,
      width: 640,
      height: 360,
    };
  }
  return {
    id: item.id,
    src: item.kind === 'broken' ? BROKEN_SRC : placeholderSrc(item),
    alt: `${item.filename} — ${item.description}`,
    caption: item.description,
    meta: `${item.filename} • ${item.category}`,
    width: 1280,
    height: 720,
  };
}

/** Resep controlled `openIndex`/`onOpenChange` untuk konsumen (15 baris). */
const LIGHTBOX_RECIPE = [
  'const [openIndex, setOpenIndex] = React.useState<number | null>(null);',
  'const items: LightboxItem[] = files.map((file) => ({',
  '  id: file.id,',
  '  src: file.url,',
  '  alt: file.name,',
  '  type: file.kind, // "image" | "video"',
  '  caption: file.description,',
  '  meta: `${file.name} • ${file.category}`,',
  '}));',
  'return (',
  '  <>',
  '    {files.map((file, index) => (',
  '      <button key={file.id} onClick={() => setOpenIndex(index)}>',
  '        <img src={file.thumb} alt={file.name} />',
  '      </button>',
  '    ))}',
  '    <Lightbox items={items} openIndex={openIndex} onOpenChange={setOpenIndex} />',
  '  </>',
  ');',
].join('\n');

export default function MediaGalleryPage() {
  const { theme, setTheme } = useTheme();
  const [items, setItems] = React.useState<GalleryItem[]>(GALLERY_ITEMS);
  const [activeCategory, setActiveCategory] = React.useState<CategoryFilter>('All');
  const [query, setQuery] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(true);
  const [selectionMode, setSelectionMode] = React.useState(false);
  const [selectedIds, setSelectedIds] = React.useState<string[]>([]);
  const [openIndex, setOpenIndex] = React.useState<number | null>(null);
  const [demoOpenIndex, setDemoOpenIndex] = React.useState<number | null>(null);
  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const [demoLoading, setDemoLoading] = React.useState(false);
  const [retrying, setRetrying] = React.useState(false);
  const timersRef = React.useRef<number[]>([]);

  React.useEffect(() => {
    const timer = window.setTimeout(() => setIsLoading(false), 600);
    return () => window.clearTimeout(timer);
  }, []);

  React.useEffect(
    () => () => {
      timersRef.current.forEach((timer) => window.clearTimeout(timer));
    },
    [],
  );

  const later = React.useCallback((fn: () => void, ms: number) => {
    const timer = window.setTimeout(fn, ms);
    timersRef.current.push(timer);
  }, []);

  const filteredItems = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter((item) => {
      const matchesCategory = activeCategory === 'All' || item.category === activeCategory;
      const matchesQuery =
        q === '' ||
        item.filename.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q);
      return matchesCategory && matchesQuery;
    });
  }, [items, activeCategory, query]);

  const lightboxItems = React.useMemo(() => filteredItems.map(toLightboxItem), [filteredItems]);
  const demoLightboxItems = React.useMemo(() => DEMO_ITEMS.map(toLightboxItem), []);

  const activeItem =
    openIndex !== null && filteredItems.length > 0
      ? filteredItems[Math.min(openIndex, filteredItems.length - 1)]
      : undefined;
  const demoActiveItem =
    demoOpenIndex !== null ? DEMO_ITEMS[Math.min(demoOpenIndex, DEMO_ITEMS.length - 1)] : undefined;
  const demoActiveIsBroken = demoActiveItem?.kind === 'broken';

  const openLightbox = (index: number) => {
    setRetrying(false);
    setOpenIndex(index);
  };

  const handleOpenChange = (index: number | null) => {
    setOpenIndex(index);
  };

  const handleDemoOpenChange = (index: number | null) => {
    if (index === null) {
      setDemoLoading(false);
      setRetrying(false);
    }
    setDemoOpenIndex(index);
  };

  /** Coba lagi pada item rusak: muat ulang tiruan, lalu error kembali (src tetap 404). */
  const handleRetry = () => {
    setRetrying(true);
    later(() => setRetrying(false), 900);
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id],
    );
  };

  const handleTileClick = (index: number) => {
    if (selectionMode) {
      toggleSelect(filteredItems[index].id);
    } else {
      openLightbox(index);
    }
  };

  const confirmDelete = () => {
    const count = selectedIds.length;
    setItems((prev) => prev.filter((item) => !selectedIds.includes(item.id)));
    setSelectedIds([]);
    setConfirmOpen(false);
    setOpenIndex(null);
    toast({
      variant: 'success',
      title: `${count} file${count === 1 ? '' : 's'} deleted`,
      description: 'The selected files were removed from the gallery.',
    });
  };

  const resetFilters = () => {
    setQuery('');
    setActiveCategory('All');
  };

  const demoSuccess = () => {
    setDemoLoading(false);
    setRetrying(false);
    // Item ke-3 dari 12 gambar (langkah 1–2 alur end-to-end di bawah).
    setDemoOpenIndex(2);
  };

  const demoLoadingState = () => {
    setDemoLoading(true);
    setDemoOpenIndex(0);
    later(() => setDemoLoading(false), 1600);
  };

  const demoVideo = () => {
    setDemoLoading(false);
    setDemoOpenIndex(DEMO_ITEMS.findIndex((item) => item.kind === 'video'));
  };

  const demoError = () => {
    setRetrying(false);
    setDemoOpenIndex(DEMO_ITEMS.findIndex((item) => item.kind === 'broken'));
  };

  const demoEmpty = () => {
    setDemoOpenIndex(null);
    setOpenIndex(null);
    setQuery('no-such-media-demo');
    document.getElementById('gallery')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="space-y-10 animate-in fade-in-50 duration-200 motion-reduce:animate-none">
      <PageHeader
        eyebrow="UX Recipe Scenario"
        eyebrowIcon={Images}
        title="Media Gallery &amp; Lightbox"
        description="An interactive photo/video gallery with category filters, search, multi-select bulk actions, and the reusable Lightbox overlay — powered by locally generated placeholders and one local clip."
        actions={<Badge variant="secondary">yet-another-react-lightbox</Badge>}
      />

      <section id="gallery" className="space-y-4 scroll-mt-20">
        <SectionHeading title="Gallery Grid" />

        <Card className="border-border">
          <CardHeader className="gap-1.5">
            <CardTitle>Media library</CardTitle>
            <CardDescription>
              Filter by category, search filenames, and enter selection mode to bulk-delete with confirmation.
              Select any tile to open it in the reusable lightbox.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Filter by category">
                {CATEGORIES.map((category) => {
                  const active = activeCategory === category;
                  const ChipIcon =
                    category === 'All' ? LayoutGrid : CATEGORY_ICONS[category];
                  return (
                    <Button
                      key={category}
                      size="sm"
                      variant={active ? 'highlight' : 'outline'}
                      onClick={() => setActiveCategory(category)}
                      className={active ? '' : 'text-muted-foreground'}
                    >
                      <ChipIcon className="h-3.5 w-3.5" />
                      {category}
                    </Button>
                  );
                })}
              </div>

              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <Input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search files..."
                  startAdornment={<Search className="h-4 w-4" />}
                  className="sm:w-64"
                  aria-label="Search media files"
                />
                <Button
                  size="sm"
                  variant={selectionMode ? 'highlight' : 'outline'}
                  onClick={() => {
                    setSelectionMode((mode) => !mode);
                    setSelectedIds([]);
                  }}
                  className="shrink-0"
                >
                  {selectionMode ? <X className="h-4 w-4" /> : <CheckSquare className="h-4 w-4" />}
                  {selectionMode ? 'Done' : 'Select'}
                </Button>
              </div>
            </div>

            <p className="text-xs text-muted-foreground">
              {isLoading
                ? 'Loading media...'
                : `${filteredItems.length} of ${items.length} file${items.length === 1 ? '' : 's'} match`}
            </p>

            {isLoading ? (
              <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
                {Array.from({ length: 8 }).map((_, index) => (
                  <div key={index} className="space-y-2">
                    <Skeleton className="aspect-video w-full rounded-xl" />
                    <Skeleton className="h-3 w-3/4 rounded-md" />
                    <Skeleton className="h-2.5 w-1/2 rounded-md" />
                  </div>
                ))}
              </div>
            ) : filteredItems.length === 0 ? (
              <EmptyState
                icon={ImageOff}
                title="No files found"
                description={`No ${activeCategory === 'All' ? 'media' : `${activeCategory.toLowerCase()}s`} match your current search or filter.`}
                actionLabel="Reset filters"
                onAction={resetFilters}
              />
            ) : (
              <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
                {filteredItems.map((item, index) => {
                  const Icon = CATEGORY_ICONS[item.category];
                  const isSelected = selectedIds.includes(item.id);
                  return (
                    <div
                      key={item.id}
                      className={[
                        'group relative overflow-hidden rounded-xl border bg-card shadow-xs transition-all duration-200',
                        isSelected ? 'border-highlight ring-2 ring-highlight/50' : 'border-border hover:shadow-md',
                      ].join(' ')}
                    >
                      <button
                        type="button"
                        onClick={() => handleTileClick(index)}
                        aria-label={
                          selectionMode
                            ? `${isSelected ? 'Deselect' : 'Select'} ${item.filename}`
                            : `Open ${item.filename} in lightbox`
                        }
                        aria-pressed={selectionMode ? isSelected : undefined}
                        className="block w-full text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-highlight focus-visible:ring-offset-2"
                      >
                        <div
                          style={{
                            backgroundImage: `linear-gradient(135deg, ${item.colors[0]} 0%, ${item.colors[1]} 100%)`,
                          }}
                          className="relative flex aspect-video items-center justify-center"
                        >
                          {item.kind === 'video' ? (
                            <Play className="h-10 w-10 text-white/85 transition-transform duration-200 group-hover:scale-110" strokeWidth={1.5} />
                          ) : (
                            <Icon
                              className="h-10 w-10 text-white/85 transition-transform duration-200 group-hover:scale-110"
                              strokeWidth={1.5}
                            />
                          )}
                          <span className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/40 via-black/0 to-black/10 opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => openLightbox(index)}
                        aria-label={`Preview ${item.filename}`}
                        className="absolute right-2 top-2 z-10 flex h-11 w-11 items-center justify-center rounded-md bg-background/80 text-foreground opacity-0 shadow-sm backdrop-blur transition-opacity duration-200 hover:bg-background focus-visible:opacity-100 group-hover:opacity-100"
                      >
                        <Maximize2 className="h-3.5 w-3.5" />
                      </button>

                      {selectionMode && (
                        <span className="absolute left-2 top-2 z-10 rounded-md bg-background/85 p-1 shadow-sm">
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={() => toggleSelect(item.id)}
                            aria-label={`Select ${item.filename}`}
                          />
                        </span>
                      )}

                      <div className="space-y-0.5 border-t border-border p-3">
                        <p className="truncate text-xs font-semibold text-foreground">
                          {item.filename}
                        </p>
                        <p className="text-xs uppercase tracking-wide text-muted-foreground">
                          {item.kind === 'video' ? 'Video' : item.category}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        <BulkActionBar
          open={selectionMode && selectedIds.length > 0}
          count={selectedIds.length}
          onClearSelection={() => setSelectedIds([])}
          actions={[
            {
              id: 'delete',
              label: 'Delete',
              icon: Trash2,
              variant: 'destructive',
              onClick: () => setConfirmOpen(true),
            },
          ]}
        />
      </section>

      <section id="lightbox" className="space-y-4 scroll-mt-20">
        <SectionHeading title="Lightbox &amp; Keyboard Navigation" />

        <Card className="border-border">
          <CardHeader className="gap-1.5">
            <CardTitle>Preview &amp; navigate</CardTitle>
            <CardDescription>
              Click any tile to open it in the reusable Lightbox. Browse with the arrow keys, zoom with
              + and −, and press Escape to close — focus returns to the triggering thumbnail.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-wrap items-center gap-2">
                <Kbd>←</Kbd>
                <span className="text-xs text-muted-foreground">Previous item</span>
                <Kbd>→</Kbd>
                <span className="text-xs text-muted-foreground">Next item</span>
                <Kbd>+</Kbd>
                <Kbd>−</Kbd>
                <span className="text-xs text-muted-foreground">Zoom in / out</span>
                <Kbd>Esc</Kbd>
                <span className="text-xs text-muted-foreground">Close</span>
              </div>
              <Button
                size="sm"
                onClick={() => openLightbox(0)}
                disabled={filteredItems.length === 0}
                className="shrink-0"
              >
                <Maximize2 className="h-4 w-4" />
                Open first item
              </Button>
            </div>

            <ol className="list-decimal space-y-1 pl-5 text-sm text-muted-foreground">
              <li>Click the third thumbnail in the grid.</li>
              <li>Confirm the counter reads “3 / 12” for the image set.</li>
              <li>Press the right arrow to move to item 4 (neighbours preload).</li>
              <li>Zoom to 2x with + and drag the enlarged image.</li>
              <li>Move to the next item — zoom resets to fit.</li>
              <li>Press Esc — focus returns to the triggering thumbnail.</li>
            </ol>
          </CardContent>
        </Card>
      </section>

      <section id="demo" className="space-y-4 scroll-mt-20">
        <SectionHeading title="Demo States" />

        <DemoSection
          label="Panel demo"
          description="Trigger each lightbox state, switch theme, then copy the controlled recipe below."
        >
          <div className="space-y-6 p-4">
            <div className="flex flex-wrap items-center gap-2">
              <Button type="button" variant="outline" size="sm" className="h-11" onClick={demoSuccess}>
                Success (item 3)
              </Button>
              <Button type="button" variant="outline" size="sm" className="h-11" onClick={demoLoadingState}>
                Loading (slow load)
              </Button>
              <Button type="button" variant="outline" size="sm" className="h-11" onClick={demoVideo}>
                Video (item 13)
              </Button>
              <Button type="button" variant="outline" size="sm" className="h-11" onClick={demoError}>
                Error (broken item)
              </Button>
              <Button type="button" variant="outline" size="sm" className="h-11" onClick={demoEmpty}>
                Empty (filter to none)
              </Button>
              <SegmentedControl
                type="single"
                value={theme === 'dark' ? 'dark' : 'light'}
                onValueChange={(value) => {
                  if (value === 'light' || value === 'dark') setTheme(value);
                }}
                aria-label="Demo theme"
              >
                <SegmentedControlItem value="light">Light</SegmentedControlItem>
                <SegmentedControlItem value="dark">Dark</SegmentedControlItem>
              </SegmentedControl>
            </div>

            <p className="text-sm text-muted-foreground">
              Loading uses a mocked slow load; Empty filters the grid above to no results; Error opens the
              deliberately broken item with Retry / Skip actions; Success opens item 3. Captions, the
              thumbnail strip, and the counter stay in sync in both themes, and slide content sits on a
              solid card surface — never text over the translucent backdrop.
            </p>

            <CodeBlock filename="media-gallery.tsx" language="tsx" code={LIGHTBOX_RECIPE} />
          </div>
        </DemoSection>
      </section>

      <Lightbox
        items={lightboxItems}
        openIndex={openIndex}
        onOpenChange={handleOpenChange}
        actions={
          activeItem ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() =>
                toast({
                  variant: 'success',
                  title: 'Download started',
                  description: `${activeItem.filename} is being prepared.`,
                })
              }
            >
              <Download className="h-4 w-4" />
              Download
            </Button>
          ) : undefined
        }
      />

      <Lightbox
        items={demoLightboxItems}
        openIndex={demoOpenIndex}
        onOpenChange={handleDemoOpenChange}
        loading={demoLoading || retrying}
        error={
          demoActiveIsBroken && !retrying
            ? 'The file could not be loaded (404). It may have been moved or corrupted.'
            : null
        }
        onRetry={demoActiveIsBroken ? handleRetry : undefined}
      />

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Delete {selectedIds.length} selected file{selectedIds.length === 1 ? '' : 's'}?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The files will be permanently removed from the gallery.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={confirmDelete}>
              <Trash2 className="h-4 w-4" />
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
