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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
  Kbd,
  toast,
} from '@ds/ui';
import {
  Images,
  Monitor,
  Network,
  PenTool,
  LayoutGrid,
  Expand,
  Maximize2,
  ChevronLeft,
  ChevronRight,
  Search,
  CheckSquare,
  X,
  Trash2,
  Download,
  ImageOff,
} from 'lucide-react';

type GalleryCategory = 'Screenshot' | 'Diagram' | 'Mockup';

type CategoryFilter = 'All' | GalleryCategory;

interface GalleryItem {
  id: string;
  filename: string;
  category: GalleryCategory;
  description: string;
  gradient: string;
}

const CATEGORIES: CategoryFilter[] = ['All', 'Screenshot', 'Diagram', 'Mockup'];

const CATEGORY_ICONS: Record<GalleryCategory, LucideIcon> = {
  Screenshot: Monitor,
  Diagram: Network,
  Mockup: PenTool,
};

const CATEGORY_BADGE: Record<GalleryCategory, 'info-outline' | 'success-outline' | 'warning-outline'> = {
  Screenshot: 'info-outline',
  Diagram: 'success-outline',
  Mockup: 'warning-outline',
};

const GALLERY_ITEMS: GalleryItem[] = [
  {
    id: 'g1',
    filename: 'dashboard-analytics.png',
    category: 'Screenshot',
    description: 'Analytics dashboard with live KPI charts and a dense data table.',
    gradient: 'linear-gradient(135deg, oklch(0.66 0.17 262) 0%, oklch(0.55 0.24 292) 100%)',
  },
  {
    id: 'g2',
    filename: 'settings-night-mode.png',
    category: 'Screenshot',
    description: 'Settings panel captured in dark mode with OKLCH token parity.',
    gradient: 'linear-gradient(135deg, oklch(0.62 0.18 250) 0%, oklch(0.5 0.22 280) 100%)',
  },
  {
    id: 'g3',
    filename: 'onboarding-flow.png',
    category: 'Screenshot',
    description: 'Three-step onboarding wizard with progress stepper and skeletons.',
    gradient: 'linear-gradient(135deg, oklch(0.7 0.15 225) 0%, oklch(0.58 0.2 270) 100%)',
  },
  {
    id: 'g4',
    filename: 'report-export.png',
    category: 'Screenshot',
    description: 'Export dialog with format picker, date range, and delivery options.',
    gradient: 'linear-gradient(135deg, oklch(0.64 0.19 245) 0%, oklch(0.52 0.24 290) 100%)',
  },
  {
    id: 'g5',
    filename: 'architecture-overview.png',
    category: 'Diagram',
    description: 'High-level service architecture: web, API, and shared packages.',
    gradient: 'linear-gradient(135deg, oklch(0.72 0.16 155) 0%, oklch(0.6 0.2 145) 100%)',
  },
  {
    id: 'g6',
    filename: 'data-model.png',
    category: 'Diagram',
    description: 'Prisma schema relations diagram for the clinic domain.',
    gradient: 'linear-gradient(135deg, oklch(0.68 0.17 150) 0%, oklch(0.55 0.22 175) 100%)',
  },
  {
    id: 'g7',
    filename: 'auth-sequence.png',
    category: 'Diagram',
    description: 'OAuth token exchange sequence across client, API, and provider.',
    gradient: 'linear-gradient(135deg, oklch(0.75 0.15 160) 0%, oklch(0.62 0.2 140) 100%)',
  },
  {
    id: 'g8',
    filename: 'deploy-pipeline.png',
    category: 'Diagram',
    description: 'CI/CD pipeline stages from lint to preview deployment.',
    gradient: 'linear-gradient(135deg, oklch(0.7 0.16 148) 0%, oklch(0.57 0.21 165) 100%)',
  },
  {
    id: 'g9',
    filename: 'landing-hero.png',
    category: 'Mockup',
    description: 'Landing page hero concept with gradient art and CTA band.',
    gradient: 'linear-gradient(135deg, oklch(0.74 0.16 28) 0%, oklch(0.62 0.2 45) 100%)',
  },
  {
    id: 'g10',
    filename: 'pricing-cards.png',
    category: 'Mockup',
    description: 'Three-tier pricing layout with highlight variant on the middle plan.',
    gradient: 'linear-gradient(135deg, oklch(0.72 0.18 22) 0%, oklch(0.6 0.24 335) 100%)',
  },
  {
    id: 'g11',
    filename: 'profile-mobile.png',
    category: 'Mockup',
    description: 'Mobile profile screen mock with avatar group and stat cards.',
    gradient: 'linear-gradient(135deg, oklch(0.7 0.19 330) 0%, oklch(0.58 0.22 350) 100%)',
  },
  {
    id: 'g12',
    filename: 'onboarding-mobile.png',
    category: 'Mockup',
    description: 'Mobile sign-up flow with bottom nav and empty state guidance.',
    gradient: 'linear-gradient(135deg, oklch(0.76 0.15 15) 0%, oklch(0.64 0.19 30) 100%)',
  },
];

export default function MediaGalleryPage() {
  const [items, setItems] = React.useState<GalleryItem[]>(GALLERY_ITEMS);
  const [activeCategory, setActiveCategory] = React.useState<CategoryFilter>('All');
  const [query, setQuery] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(true);
  const [selectionMode, setSelectionMode] = React.useState(false);
  const [selectedIds, setSelectedIds] = React.useState<string[]>([]);
  const [lightboxIndex, setLightboxIndex] = React.useState(0);
  const [lightboxOpen, setLightboxOpen] = React.useState(false);
  const [confirmOpen, setConfirmOpen] = React.useState(false);

  React.useEffect(() => {
    const timer = window.setTimeout(() => setIsLoading(false), 600);
    return () => window.clearTimeout(timer);
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

  const lightboxItem =
    lightboxOpen && filteredItems.length > 0
      ? filteredItems[Math.min(lightboxIndex, filteredItems.length - 1)]
      : null;
  const LightboxIcon = lightboxItem ? CATEGORY_ICONS[lightboxItem.category] : null;

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  const goPrev = () => {
    setLightboxIndex((i) => (i - 1 + filteredItems.length) % filteredItems.length);
  };

  const goNext = () => {
    setLightboxIndex((i) => (i + 1) % filteredItems.length);
  };

  React.useEffect(() => {
    if (!lightboxOpen || filteredItems.length <= 1) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        setLightboxIndex((i) => (i - 1 + filteredItems.length) % filteredItems.length);
      } else if (event.key === 'ArrowRight') {
        event.preventDefault();
        setLightboxIndex((i) => (i + 1) % filteredItems.length);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [lightboxOpen, filteredItems.length]);

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
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

  return (
    <div className="space-y-10 animate-in fade-in-50 duration-200">
      <PageHeader
        eyebrow="UX Recipe Scenario"
        eyebrowIcon={Images}
        title="Media Gallery &amp; Lightbox"
        description="An interactive photo/video gallery with category filters, search, multi-select bulk actions, and a keyboard-accessible Dialog lightbox — all powered by locally generated gradient placeholders."
      />

      <section id="gallery" className="space-y-4 scroll-mt-20">
        <h2 className="text-2xl font-bold text-foreground font-display flex items-center gap-2">
          <LayoutGrid className="h-6 w-6 text-highlight" />
          <span>Gallery Grid</span>
        </h2>

        <Card className="border-border">
          <CardHeader className="gap-1.5">
            <CardTitle>Media library</CardTitle>
            <CardDescription>
              Filter by category, search filenames, and enter selection mode to bulk-delete with confirmation.
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
                          style={{ backgroundImage: item.gradient }}
                          className="relative flex aspect-video items-center justify-center"
                        >
                          <Icon
                            className="h-10 w-10 text-white/85 transition-transform duration-200 group-hover:scale-110"
                            strokeWidth={1.5}
                          />
                          <span className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/40 via-black/0 to-black/10 opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => openLightbox(index)}
                        aria-label={`Preview ${item.filename}`}
                        className="absolute right-2 top-2 z-10 flex h-7 w-7 items-center justify-center rounded-md bg-background/80 text-foreground opacity-0 shadow-sm backdrop-blur transition-opacity duration-200 hover:bg-background focus-visible:opacity-100 group-hover:opacity-100"
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
                        <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
                          {item.category}
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
        <h2 className="text-2xl font-bold text-foreground font-display flex items-center gap-2">
          <Expand className="h-6 w-6 text-highlight" />
          <span>Lightbox &amp; Keyboard Navigation</span>
        </h2>

        <Card className="border-border">
          <CardHeader className="gap-1.5">
            <CardTitle>Preview &amp; navigate</CardTitle>
            <CardDescription>
              Click any tile to open it in the Dialog lightbox. Use the arrow keys to browse without
              touching the pointer; Escape closes the dialog.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap items-center gap-2">
              <Kbd>←</Kbd>
              <span className="text-xs text-muted-foreground">Previous item</span>
              <Kbd>→</Kbd>
              <span className="text-xs text-muted-foreground">Next item</span>
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
          </CardContent>
        </Card>
      </section>

      <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
        {lightboxItem && (
          <DialogContent className="max-w-[min(48rem,calc(100%_-_2rem))] gap-0 overflow-hidden p-0 text-white sm:rounded-xl">
            <div
              style={{ backgroundImage: lightboxItem.gradient }}
              className="relative flex aspect-video items-center justify-center"
            >
              {LightboxIcon && (
                <LightboxIcon
                  className="h-16 w-16 text-white/80"
                  strokeWidth={1.25}
                />
              )}
              <Badge
                variant={CATEGORY_BADGE[lightboxItem.category]}
                size="sm"
                className="absolute left-4 top-4"
              >
                {lightboxItem.category}
              </Badge>
            </div>

            <div className="space-y-4 bg-card p-6 text-foreground">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
                <DialogHeader className="text-left">
                  <DialogTitle className="font-mono text-base">
                    {lightboxItem.filename}
                  </DialogTitle>
                  <DialogDescription>{lightboxItem.description}</DialogDescription>
                </DialogHeader>
                <span className="shrink-0 self-start rounded-md border border-border bg-muted/40 px-2 py-1 font-mono text-xs text-muted-foreground">
                  {lightboxIndex + 1} / {filteredItems.length}
                </span>
              </div>

              <DialogFooter className="flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={goPrev}
                    disabled={filteredItems.length <= 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={goNext}
                    disabled={filteredItems.length <= 1}
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() =>
                    toast({
                      variant: 'success',
                      title: 'Download started',
                      description: `${lightboxItem.filename} is being prepared.`,
                    })
                  }
                >
                  <Download className="h-4 w-4" />
                  Download
                </Button>
              </DialogFooter>
            </div>
          </DialogContent>
        )}
      </Dialog>

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