'use client';

import * as React from 'react';
import {
  SlidersHorizontal,
  Sparkles,
  Layers,
  FileText,
  Compass,
  ArrowRight,
  ShieldCheck,
  Zap,
  Globe,
  Database,
  Cpu,
} from 'lucide-react';
import {
  PageHeader,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Badge,
  Button,
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
  CarouselDots,
  ScrollArea,
  ScrollBar,
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
  TableOfContents,
  Banner,
} from '@ds/ui';

export default function CarouselDocsPage() {
  const [activePage, setActivePage] = React.useState(2);

  const sampleCards = [
    {
      title: 'Vector Intelligence',
      category: 'AI Engine',
      description: 'Semantic vector search and embeddings for omnichannel customer knowledge.',
      icon: Cpu,
      badge: 'v2.4',
    },
    {
      title: 'Zero-Trust SCIM',
      category: 'Security',
      description: 'Automated user provisioning with Okta SAML 2.0 and SOC2 compliance.',
      icon: ShieldCheck,
      badge: 'Enterprise',
    },
    {
      title: 'Real-Time Telemetry',
      category: 'Analytics',
      description: 'Sub-millisecond pipeline latency tracking across global edge clusters.',
      icon: Zap,
      badge: 'Real-Time',
    },
    {
      title: 'Edge Global CDN',
      category: 'Infrastructure',
      description: 'Server component streaming across 300+ edge locations worldwide.',
      icon: Globe,
      badge: 'Global',
    },
    {
      title: 'Prisma Multi-Tenant',
      category: 'Database',
      description: 'Isolated schema database architecture with PostgreSQL connection pooling.',
      icon: Database,
      badge: 'ORM',
    },
  ];

  const tocHeadings = [
    { id: 'carousel-basic', text: 'Interactive Carousel', level: 2 },
    { id: 'carousel-multi', text: 'Multi-Item Card Slider', level: 2 },
    { id: 'scroll-area', text: 'Custom Scroll Area', level: 2 },
    { id: 'pagination', text: 'Pagination Controls', level: 2 },
  ];

  return (
    <div className="space-y-12">
      <Banner variant="highlight" actionText="View Primitives" actionHref="#carousel-basic">
        <strong>Media & Scrolling Primitives:</strong> Touch-ready Embla Carousel, Radix ScrollArea, and accessible Pagination suites.
      </Banner>

      <PageHeader
        eyebrow="Components & Media"
        eyebrowIcon={SlidersHorizontal}
        title="Carousel, Scroll & Pagination"
        description="Touch-friendly slider carousels powered by Embla, customizable cross-browser scroll areas, and accessible pagination components."
        actions={
          <div className="flex items-center gap-2">
            <Badge variant="highlight" className="font-mono text-xs">
              Embla Carousel
            </Badge>
            <Badge variant="outline" className="font-mono text-xs">
              Radix ScrollArea
            </Badge>
          </div>
        }
      />

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
        {/* Main Content Area */}
        <div className="xl:col-span-9 space-y-12 min-w-0">
          {/* SECTION 1: CAROUSEL BASIC */}
          <section id="carousel-basic" className="space-y-4 scroll-mt-20">
            <div className="space-y-1">
              <h2 className="text-2xl font-bold text-foreground font-display flex items-center gap-2">
                <Sparkles className="h-6 w-6 text-highlight" />
                <span>Interactive Carousel</span>
              </h2>
              <p className="text-sm text-muted-foreground">
                Touch-swipe and keyboard navigable carousel with navigation arrows and dot indicators.
              </p>
            </div>

            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-base">Full-Width Feature Carousel</CardTitle>
                <CardDescription>
                  Drag to swipe or use the navigation buttons and keyboard arrow keys.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="px-12 py-4">
                  <Carousel className="w-full max-w-xl mx-auto">
                    <CarouselContent>
                      {sampleCards.slice(0, 3).map((item, index) => {
                        const Icon = item.icon;
                        return (
                          <CarouselItem key={index}>
                            <div className="p-1">
                              <Card className="bg-gradient-to-br from-highlight/10 via-primary/5 to-card border-highlight/20 shadow-sm">
                                <CardContent className="flex flex-col items-start p-6 space-y-4">
                                  <div className="flex items-center justify-between w-full">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-highlight text-highlight-foreground font-bold shadow-xs">
                                      <Icon className="h-5 w-5" />
                                    </div>
                                    <Badge variant="highlight" className="font-mono text-xs">
                                      {item.badge}
                                    </Badge>
                                  </div>
                                  <div className="space-y-1">
                                    <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
                                      {item.category}
                                    </span>
                                    <h3 className="text-lg font-bold font-display text-foreground">
                                      {item.title}
                                    </h3>
                                    <p className="text-xs text-muted-foreground leading-relaxed">
                                      {item.description}
                                    </p>
                                  </div>
                                  <Button size="sm" variant="outline" className="text-xs gap-1.5 mt-2">
                                    <span>Learn more</span>
                                    <ArrowRight className="h-3.5 w-3.5" />
                                  </Button>
                                </CardContent>
                              </Card>
                            </div>
                          </CarouselItem>
                        );
                      })}
                    </CarouselContent>
                    <CarouselPrevious />
                    <CarouselNext />
                    <CarouselDots />
                  </Carousel>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* SECTION 2: MULTI-ITEM CAROUSEL */}
          <section id="carousel-multi" className="space-y-4 scroll-mt-20">
            <div className="space-y-1">
              <h2 className="text-2xl font-bold text-foreground font-display flex items-center gap-2">
                <Layers className="h-6 w-6 text-highlight" />
                <span>Multi-Card Carousel Grid</span>
              </h2>
              <p className="text-sm text-muted-foreground">
                Responsive basis sizing (`basis-full md:basis-1/2 lg:basis-1/3`) for multi-item slider decks.
              </p>
            </div>

            <Card>
              <CardContent className="p-6">
                <div className="px-10">
                  <Carousel opts={{ align: 'start', loop: true }} className="w-full">
                    <CarouselContent className="-ml-3">
                      {sampleCards.map((item, index) => {
                        const Icon = item.icon;
                        return (
                          <CarouselItem key={index} className="pl-3 md:basis-1/2 lg:basis-1/2">
                            <div className="p-4 rounded-xl border border-border bg-card space-y-3 h-full flex flex-col justify-between shadow-xs">
                              <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                  <div className="flex h-8 w-8 items-center justify-center rounded-md border border-border bg-muted/40 text-foreground">
                                    <Icon className="h-4 w-4 text-highlight" />
                                  </div>
                                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                                    {item.badge}
                                  </span>
                                </div>
                                <h4 className="text-sm font-bold font-display text-foreground">
                                  {item.title}
                                </h4>
                                <p className="text-xs text-muted-foreground leading-relaxed">
                                  {item.description}
                                </p>
                              </div>
                              <div className="pt-2 border-t border-border/50 text-[11px] font-semibold text-highlight flex items-center gap-1">
                                <span>Explore docs</span>
                                <ArrowRight className="h-3 w-3" />
                              </div>
                            </div>
                          </CarouselItem>
                        );
                      })}
                    </CarouselContent>
                    <CarouselPrevious />
                    <CarouselNext />
                    <CarouselDots />
                  </Carousel>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* SECTION 3: SCROLL AREA */}
          <section id="scroll-area" className="space-y-4 scroll-mt-20">
            <div className="space-y-1">
              <h2 className="text-2xl font-bold text-foreground font-display flex items-center gap-2">
                <FileText className="h-6 w-6 text-highlight" />
                <span>Custom ScrollArea</span>
              </h2>
              <p className="text-sm text-muted-foreground">
                Cross-browser accessible scrolling container with styled scrollbars, keyboard focus support, and horizontal & vertical modes.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Vertical ScrollArea */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Vertical Scroll Container</CardTitle>
                  <CardDescription className="text-xs">
                    Custom scroll thumb with subtle hover expansion.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-64 rounded-lg border border-border p-4 bg-muted/10">
                    <div className="space-y-3">
                      <h4 className="text-xs font-bold font-mono uppercase text-muted-foreground">
                        Changelog Timeline
                      </h4>
                      {Array.from({ length: 12 }).map((_, i) => (
                        <div
                          key={i}
                          className="p-2.5 rounded-lg border border-border bg-card text-xs flex items-center justify-between"
                        >
                          <div className="space-y-0.5">
                            <span className="font-semibold text-foreground">v2.{12 - i}.0 Release</span>
                            <p className="text-[11px] text-muted-foreground">Fixed layout alignment & added tokens</p>
                          </div>
                          <Badge variant="outline" className="text-[10px] font-mono">
                            Aug {16 - i}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>

              {/* Horizontal ScrollArea */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Horizontal Tag Bar</CardTitle>
                  <CardDescription className="text-xs">
                    Smooth horizontal scroll for tags and filter chips.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ScrollArea className="w-full whitespace-nowrap rounded-lg border border-border p-4 bg-muted/10">
                    <div className="flex gap-2 w-max pb-2">
                      {[
                        'All Solutions',
                        'Artificial Intelligence',
                        'PostgreSQL Monorepo',
                        'Design Tokens OKLCH',
                        'Tailwind CSS v4',
                        'Radix Primitives',
                        'Next.js 15 App Router',
                        'NestJS Microservices',
                        'Vitest Testing Suite',
                      ].map((tag, idx) => (
                        <Button
                          key={idx}
                          size="sm"
                          variant={idx === 0 ? 'highlight' : 'outline'}
                          className="text-xs font-mono shrink-0 h-8"
                        >
                          {tag}
                        </Button>
                      ))}
                    </div>
                    <ScrollBar orientation="horizontal" />
                  </ScrollArea>

                  <div className="p-3 bg-muted/30 rounded-lg text-xs font-mono text-muted-foreground">
                    &lt;ScrollBar orientation=&quot;horizontal&quot; /&gt;
                  </div>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* SECTION 4: PAGINATION */}
          <section id="pagination" className="space-y-4 scroll-mt-20">
            <div className="space-y-1">
              <h2 className="text-2xl font-bold text-foreground font-display flex items-center gap-2">
                <Compass className="h-6 w-6 text-highlight" />
                <span>Pagination Navigation</span>
              </h2>
              <p className="text-sm text-muted-foreground">
                Standardized pagination component suite supporting previous/next arrows, page indicators, and ellipses for large page counts.
              </p>
            </div>

            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-base">Interactive Pagination Suite</CardTitle>
                <CardDescription>
                  Current page: {activePage} of 10
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="p-6 rounded-xl border border-border bg-muted/20 flex justify-center">
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious
                          href="#pagination"
                          onClick={(e) => {
                            e.preventDefault();
                            setActivePage((p) => Math.max(1, p - 1));
                          }}
                        />
                      </PaginationItem>
                      {[1, 2, 3].map((page) => (
                        <PaginationItem key={page}>
                          <PaginationLink
                            href="#pagination"
                            isActive={activePage === page}
                            onClick={(e) => {
                              e.preventDefault();
                              setActivePage(page);
                            }}
                          >
                            {page}
                          </PaginationLink>
                        </PaginationItem>
                      ))}
                      <PaginationItem>
                        <PaginationEllipsis />
                      </PaginationItem>
                      <PaginationItem>
                        <PaginationLink
                          href="#pagination"
                          isActive={activePage === 10}
                          onClick={(e) => {
                            e.preventDefault();
                            setActivePage(10);
                          }}
                        >
                          10
                        </PaginationLink>
                      </PaginationItem>
                      <PaginationItem>
                        <PaginationNext
                          href="#pagination"
                          onClick={(e) => {
                            e.preventDefault();
                            setActivePage((p) => Math.min(10, p + 1));
                          }}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              </CardContent>
            </Card>
          </section>
        </div>

        {/* Sticky Table of Contents Sidebar */}
        <div className="hidden xl:block xl:col-span-3 sticky top-20">
          <Card className="p-4 bg-card/60 backdrop-blur-sm border-border">
            <TableOfContents headings={tocHeadings} title="Carousel & Scroll" />
          </Card>
        </div>
      </div>
    </div>
  );
}
