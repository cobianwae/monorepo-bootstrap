'use client';

import * as React from 'react';
import {
  Sparkles,
  Layers,
  ChevronDown,
  Home,
  Settings,
  Bell,
  Code2,
  FileText,
  Palette,
  Blocks,
  Info,
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
  Spinner,
  Skeleton,
  Prose,
  Separator,
  DotPattern,
  StatementCard,
  BottomNavItem,
  NavbarMobile,
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
  BreadcrumbEllipsis,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  TableCaption,
  TableFooter,
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectGroup,
  SelectLabel,
  SelectItem,
  TableOfContents,
  Banner,
} from '@ds/ui';

export default function PrimitivesPage() {
  const [collapsibleOpen, setCollapsibleOpen] = React.useState(false);
  const [activeBottomTab, setActiveBottomTab] = React.useState('home');

  const tocHeadings = [
    { id: 'spinners', text: 'Spinners & Loading Indicators', level: 2 },
    { id: 'skeletons', text: 'Skeleton Loading Placeholders', level: 2 },
    { id: 'prose', text: 'Prose Rich Text Typography', level: 2 },
    { id: 'patterns-cards', text: 'DotPattern & StatementCard', level: 2 },
    { id: 'mobile-primitives', text: 'BottomNav & Mobile Drawer', level: 2 },
    { id: 'subcomponents', text: 'Collapsible, Breadcrumb & Table Sub-parts', level: 2 },
  ];

  return (
    <div className="space-y-12">
      <Banner variant="highlight" actionText="Explore Primitives" actionHref="#spinners">
        <strong>UI Utilities & Foundations:</strong> Spinners, skeleton placeholders, Prose typography, SVG dot patterns, elevated statement cards, and mobile shell containers.
      </Banner>

      <PageHeader
        eyebrow="Foundation & Utilities"
        eyebrowIcon={Layers}
        title="Primitives & Utility Components"
        description="Core helper components and foundational display primitives including accessible loading spinners, skeleton loading placeholders, typographic prose wrappers, generative SVG patterns, and specialized sub-components."
        actions={
          <div className="flex items-center gap-2">
            <Badge variant="highlight" className="font-mono text-xs">
              10+ Primitives
            </Badge>
            <Badge variant="outline" className="font-mono text-xs">
              Full Spectrum
            </Badge>
          </div>
        }
      />

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
        {/* Main Content Area */}
        <div className="xl:col-span-9 space-y-12 min-w-0">
          {/* SECTION 1: SPINNERS */}
          <section id="spinners" className="space-y-4 scroll-mt-20">
            <div className="space-y-1">
              <h2 className="text-2xl font-bold text-foreground font-display flex items-center gap-2">
                <Sparkles className="h-6 w-6 text-highlight" />
                <span>Spinners & Progress Indicators</span>
              </h2>
              <p className="text-sm text-muted-foreground">
                Accessible loading spinner with customizable sizes, status tokens, and `role=&quot;status&quot;` screen reader announcements.
              </p>
            </div>

            <Card>
              <CardContent className="p-6 space-y-6">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="p-4 rounded-xl border border-border bg-muted/20 flex flex-col items-center justify-center gap-2">
                    <Spinner size="sm" variant="default" />
                    <span className="text-[11px] font-mono text-muted-foreground">size=&quot;sm&quot;</span>
                  </div>
                  <div className="p-4 rounded-xl border border-border bg-muted/20 flex flex-col items-center justify-center gap-2">
                    <Spinner size="default" variant="primary" />
                    <span className="text-[11px] font-mono text-muted-foreground">variant=&quot;primary&quot;</span>
                  </div>
                  <div className="p-4 rounded-xl border border-border bg-muted/20 flex flex-col items-center justify-center gap-2">
                    <Spinner size="md" variant="success" />
                    <span className="text-[11px] font-mono text-muted-foreground">variant=&quot;success&quot;</span>
                  </div>
                  <div className="p-4 rounded-xl border border-border bg-muted/20 flex flex-col items-center justify-center gap-2">
                    <Spinner size="lg" variant="destructive" />
                    <span className="text-[11px] font-mono text-muted-foreground">size=&quot;lg&quot; destructive</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 rounded-lg bg-card border border-border">
                  <Button disabled variant="outline" className="gap-2 text-xs">
                    <Spinner size="sm" />
                    <span>Synchronizing Database...</span>
                  </Button>
                  <span className="text-xs text-muted-foreground">
                    Button with embedded accessible spinner state.
                  </span>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* SECTION 2: SKELETONS */}
          <section id="skeletons" className="space-y-4 scroll-mt-20">
            <div className="space-y-1">
              <h2 className="text-2xl font-bold text-foreground font-display flex items-center gap-2">
                <Blocks className="h-6 w-6 text-highlight" />
                <span>Skeleton Loading Placeholders</span>
              </h2>
              <p className="text-sm text-muted-foreground">
                Non-interactive placeholder blocks mirroring the exact shape of incoming content. Uses `animate-pulse` with the `muted` surface token, and respects `prefers-reduced-motion`.
              </p>
            </div>

            <Card>
              <CardContent className="p-6 space-y-6">
                <div className="space-y-2">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Basic Shapes
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="p-4 rounded-xl border border-border bg-muted/20 flex flex-col justify-center gap-3">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-1/2" />
                      <span className="text-[11px] font-mono text-muted-foreground mt-1">text lines</span>
                    </div>
                    <div className="p-4 rounded-xl border border-border bg-muted/20 flex flex-col items-center justify-center gap-2">
                      <Skeleton className="h-12 w-12 rounded-full" />
                      <span className="text-[11px] font-mono text-muted-foreground">circle avatar</span>
                    </div>
                    <div className="p-4 rounded-xl border border-border bg-muted/20 flex flex-col justify-center gap-2">
                      <Skeleton className="h-24 w-full rounded-lg" />
                      <span className="text-[11px] font-mono text-muted-foreground mt-1">rectangle card</span>
                    </div>
                    <div className="p-4 rounded-xl border border-border bg-muted/20 flex flex-col justify-center gap-2">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-2/3" />
                      <span className="text-[11px] font-mono text-muted-foreground mt-1">paragraph block</span>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Composite: Card & Table Rows
                  </span>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="rounded-xl border border-border bg-card p-5 space-y-3 shadow-xs">
                      <div className="flex items-center gap-3">
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <div className="space-y-2 flex-1">
                          <Skeleton className="h-3 w-2/3" />
                          <Skeleton className="h-3 w-1/3" />
                        </div>
                      </div>
                      <Skeleton className="h-3 w-full" />
                      <Skeleton className="h-3 w-5/6" />
                      <div className="flex gap-2 pt-1">
                        <Skeleton className="h-8 w-24 rounded-md" />
                        <Skeleton className="h-8 w-24 rounded-md" />
                      </div>
                    </div>

                    <div className="rounded-xl border border-border bg-card p-4 space-y-3 shadow-xs">
                      <div className="flex items-center gap-3 pb-2 border-b border-border">
                        <Skeleton className="h-3 w-1/4" />
                        <Skeleton className="h-3 w-1/5" />
                        <Skeleton className="h-3 w-1/6 ml-auto" />
                      </div>
                      {[0, 1, 2].map((row) => (
                        <div key={row} className="flex items-center gap-3">
                          <Skeleton className="h-3 w-1/4" />
                          <Skeleton className="h-3 w-1/5" />
                          <Skeleton className="h-3 w-1/6 ml-auto" />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 rounded-lg bg-card border border-border">
                  <Info className="h-4 w-4 text-highlight mt-0.5 shrink-0" />
                  <p className="text-xs text-muted-foreground">
                    Tandai kontainer konten dengan <code className="font-mono text-foreground">aria-busy=&quot;true&quot;</code> saat data dimuat, lalu hapus setelah render final. Skeleton wajib meniru posisi & dimensi konten asli (loading.tsx / Suspense fallback) dan otomatis berhenti beranimasi saat user mengaktifkan reduced motion.
                  </p>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* SECTION 3: PROSE */}
          <section id="prose" className="space-y-4 scroll-mt-20">
            <div className="space-y-1">
              <h2 className="text-2xl font-bold text-foreground font-display flex items-center gap-2">
                <FileText className="h-6 w-6 text-highlight" />
                <span>Prose Rich-Text Container</span>
              </h2>
              <p className="text-sm text-muted-foreground">
                Tailwind CSS typographic wrapper automatically styling markdown, headings, blockquotes, code spans, lists, and links.
              </p>
            </div>

            <Card>
              <CardContent className="p-6">
                <Prose className="max-w-2xl">
                  <h2>Enterprise Design Architecture</h2>
                  <p>
                    The <strong>Apex Design System</strong> combines <em>Tailwind CSS v4</em> with OKLCH tokens, guaranteed WCAG AA color contrast, and Radix UI primitives for uncompromising accessibility.
                  </p>
                  <blockquote>
                    &ldquo;Good design is accessible design — built for every viewport and assistive device.&rdquo;
                  </blockquote>
                  <ul>
                    <li>Standardized 4px spatial rhythm and predictable component props</li>
                    <li>Automatic dark mode and light mode parity across 8 tone palettes</li>
                    <li>Type-safe monorepo shared between Next.js frontend and NestJS API</li>
                  </ul>
                </Prose>
              </CardContent>
            </Card>
          </section>

          {/* SECTION 3: PATTERNS & CARDS */}
          <section id="patterns-cards" className="space-y-4 scroll-mt-20">
            <div className="space-y-1">
              <h2 className="text-2xl font-bold text-foreground font-display flex items-center gap-2">
                <Palette className="h-6 w-6 text-highlight" />
                <span>DotPattern & StatementCard</span>
              </h2>
              <p className="text-sm text-muted-foreground">
                High-impact visual containers and generative SVG background matrices with gradient masking.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* DotPattern Preview */}
              <div className="relative h-64 rounded-xl border border-border overflow-hidden bg-card p-6 flex flex-col justify-between shadow-xs">
                <DotPattern fade="radial" width={16} height={16} cx={1} cy={1} cr={1} />
                <Badge variant="highlight" className="w-fit font-mono text-xs">
                  DotPattern Matrix
                </Badge>
                <div className="relative z-10 space-y-1">
                  <h4 className="text-base font-bold text-foreground font-display">
                    Radial Masked Dots
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    Hardware-accelerated SVG pattern seamlessly blending into background.
                  </p>
                </div>
              </div>

              {/* StatementCard Neon */}
              <StatementCard variant="neon" glow className="flex flex-col justify-between h-64">
                <div className="flex items-center justify-between">
                  <Badge variant="highlight" className="font-mono text-xs">
                    variant=&quot;neon&quot;
                  </Badge>
                  <Sparkles className="h-5 w-5 text-highlight" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-lg font-bold font-display text-foreground">
                    Elevated Hero Card
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    Subtle corner ambient glow with interactive border highlight transitions.
                  </p>
                </div>
              </StatementCard>
            </div>
          </section>

          {/* SECTION 4: MOBILE PRIMITIVES */}
          <section id="mobile-primitives" className="space-y-4 scroll-mt-20">
            <div className="space-y-1">
              <h2 className="text-2xl font-bold text-foreground font-display flex items-center gap-2">
                <Home className="h-6 w-6 text-highlight" />
                <span>BottomNav & NavbarMobile Drawer</span>
              </h2>
              <p className="text-sm text-muted-foreground">
                Touch-optimized mobile shell containers with safe-area padding and sheet trigger integration.
              </p>
            </div>

            <Card>
              <CardContent className="p-6 space-y-6">
                <div className="flex items-center justify-between p-4 rounded-xl border border-border bg-muted/20">
                  <div className="space-y-1">
                    <h4 className="text-sm font-bold text-foreground font-display">
                      NavbarMobile Sheet Drawer
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      Click the drawer button to test the mobile menu slide-out sheet.
                    </p>
                  </div>
                  <NavbarMobile title="Showcase Navigation">
                    <a href="#spinners" className="text-sm font-medium hover:text-highlight">
                      Spinners
                    </a>
                    <a href="#prose" className="text-sm font-medium hover:text-highlight">
                      Prose Typography
                    </a>
                    <a href="#patterns-cards" className="text-sm font-medium hover:text-highlight">
                      Patterns & Cards
                    </a>
                  </NavbarMobile>
                </div>

                <div className="p-4 rounded-xl border border-border bg-card max-w-sm mx-auto space-y-3 shadow-xs">
                  <div className="text-center text-xs text-muted-foreground font-mono">
                    Active Tab: <span className="text-highlight font-bold uppercase">{activeBottomTab}</span>
                  </div>
                  <div className="flex items-center justify-around border-t border-border pt-2">
                    <BottomNavItem
                      icon={Home}
                      label="Home"
                      active={activeBottomTab === 'home'}
                      onClick={() => setActiveBottomTab('home')}
                    />
                    <BottomNavItem
                      icon={Bell}
                      label="Alerts"
                      badge={3}
                      active={activeBottomTab === 'alerts'}
                      onClick={() => setActiveBottomTab('alerts')}
                    />
                    <BottomNavItem
                      icon={Settings}
                      label="Config"
                      active={activeBottomTab === 'config'}
                      onClick={() => setActiveBottomTab('config')}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* SECTION 5: SUB-COMPONENTS */}
          <section id="subcomponents" className="space-y-4 scroll-mt-20">
            <div className="space-y-1">
              <h2 className="text-2xl font-bold text-foreground font-display flex items-center gap-2">
                <Code2 className="h-6 w-6 text-highlight" />
                <span>Collapsible, Breadcrumb & Table Sub-parts</span>
              </h2>
              <p className="text-sm text-muted-foreground">
                Documenting sub-components: `CollapsibleTrigger`, `BreadcrumbEllipsis`, `TableCaption`, `TableFooter`, `SelectGroup`, and `SectionHeader`.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Collapsible Demo */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Collapsible Primitive</CardTitle>
                  <CardDescription className="text-xs">
                    Accessible expand/collapse trigger and animated content container.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Collapsible open={collapsibleOpen} onOpenChange={setCollapsibleOpen}>
                    <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-muted/10">
                      <span className="text-xs font-semibold text-foreground font-mono">
                        Security Credentials (API Keys)
                      </span>
                      <CollapsibleTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                          <ChevronDown
                            className={`h-4 w-4 transition-transform duration-200 ${
                              collapsibleOpen ? 'rotate-180' : ''
                            }`}
                          />
                        </Button>
                      </CollapsibleTrigger>
                    </div>
                    <CollapsibleContent className="pt-2 space-y-2">
                      <div className="p-3 rounded-lg border border-border bg-card text-xs font-mono space-y-1">
                        <p className="text-muted-foreground">sk_live_98a72b6c5e4d1f0</p>
                        <p className="text-[10px] text-muted-foreground">Created Aug 16, 2026 • Full Access</p>
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                </CardContent>
              </Card>

              {/* Breadcrumb Ellipsis & SelectGroup */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Breadcrumb Ellipsis & SelectGroup</CardTitle>
                  <CardDescription className="text-xs">
                    Truncated navigation paths and grouped option dropdowns.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Breadcrumb>
                    <BreadcrumbList>
                      <BreadcrumbItem>
                        <BreadcrumbLink href="#">Home</BreadcrumbLink>
                      </BreadcrumbItem>
                      <BreadcrumbSeparator />
                      <BreadcrumbItem>
                        <BreadcrumbEllipsis />
                      </BreadcrumbItem>
                      <BreadcrumbSeparator />
                      <BreadcrumbItem>
                        <BreadcrumbPage>Primitives</BreadcrumbPage>
                      </BreadcrumbItem>
                    </BreadcrumbList>
                  </Breadcrumb>

                  <Select defaultValue="oklch">
                    <SelectTrigger className="w-full text-xs">
                      <SelectValue placeholder="Select Color Mode" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Color Models</SelectLabel>
                        <SelectItem value="oklch">OKLCH Perceptual</SelectItem>
                        <SelectItem value="rgb">sRGB Standard</SelectItem>
                        <SelectItem value="hsl">HSL Cylindrical</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </CardContent>
              </Card>
            </div>

            {/* Table with Caption & Footer */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Table with Caption & Footer</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableCaption>Summary of system resource allocation</TableCaption>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Cluster Node</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Memory Usage</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-mono text-xs">ap-southeast-1a</TableCell>
                      <TableCell><Badge variant="outline" className="text-[10px]">Healthy</Badge></TableCell>
                      <TableCell className="text-right font-mono text-xs">4.2 GB</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-mono text-xs">us-east-1b</TableCell>
                      <TableCell><Badge variant="outline" className="text-[10px]">Healthy</Badge></TableCell>
                      <TableCell className="text-right font-mono text-xs">6.8 GB</TableCell>
                    </TableRow>
                  </TableBody>
                  <TableFooter>
                    <TableRow>
                      <TableCell colSpan={2}>Total Allocated Memory</TableCell>
                      <TableCell className="text-right font-mono font-bold text-xs">11.0 GB</TableCell>
                    </TableRow>
                  </TableFooter>
                </Table>
              </CardContent>
            </Card>
          </section>
        </div>

        {/* Sticky Table of Contents Sidebar */}
        <div className="hidden xl:block xl:col-span-3 sticky top-20">
          <Card className="p-4 bg-card/60 backdrop-blur-sm border-border">
            <TableOfContents headings={tocHeadings} title="Primitives" />
          </Card>
        </div>
      </div>
    </div>
  );
}
