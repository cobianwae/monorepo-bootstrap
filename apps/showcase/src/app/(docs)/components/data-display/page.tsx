'use client';

import * as React from 'react';
import {
  ArrowRight,
  AlertTriangle,
  Archive,
  BarChart3,
  Bot,
  Box,
  CheckCircle2,
  Code2,
  Cpu,
  Database,
  DollarSign,
  FileCode2,
  FileText,
  Folder,
  Gauge,
  GitCommit,
  Globe,
  Layers,
  List,
  ListChecks,
  ListTree,
  Rocket,
  ShieldCheck,
  Sparkles,
  Tag,
  Trash2,
  TrendingDown,
  TrendingUp,
  Users,
  Zap,
} from 'lucide-react';
import {
  PageHeader,
  Banner,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Badge,
  Button,
  Separator,
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
  CarouselDots,
  ScrollArea,
  ScrollBar,
  CodeBlock,
  StatCard,
  Avatar,
  AvatarImage,
  AvatarFallback,
  AvatarGroup,
  TreeView,
  type TreeNode,
  SortableList,
  ChatContainer,
  ChatThread,
  ChatMessage,
  ChatTypingIndicator,
  ChatSuggestionList,
  ChatComposer,
  Timeline,
  type TimelineItem,
  DescriptionList,
  type DescriptionListItem,
  MetricTilesCard,
  type MetricTile,
  type MetricTilesCardProgress,
  BulkActionBar,
  type BulkAction,
  ChartA11yTable,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  Checkbox,
  toast,
} from '@ds/ui';

const SECTIONS = [
  { id: 'card-variants', label: 'Card Variants' },
  { id: 'avatars', label: 'Avatars' },
  { id: 'carousel-basic', label: 'Carousel' },
  { id: 'carousel-multi', label: 'Carousel Multi' },
  { id: 'scroll-area', label: 'Scroll Area' },
  { id: 'code-blocks', label: 'Code Blocks' },
  { id: 'stat-cards', label: 'Stat Cards' },
  { id: 'timeline', label: 'Timeline' },
  { id: 'description-list', label: 'Description List' },
  { id: 'metric-tiles', label: 'Metric Tiles' },
  { id: 'bulk-action-bar', label: 'Bulk Actions' },
  { id: 'chart-a11y-table', label: 'Chart A11y' },
  { id: 'tree-view', label: 'TreeView' },
  { id: 'sortable-list', label: 'Sortable List' },
  { id: 'chat-interface', label: 'Chat Suite' },
];

export default function DataDisplayPage() {
  const [activeSection, setActiveSection] = React.useState('card-variants');
  const [selectedCard, setSelectedCard] = React.useState('card-1');

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

  const timelineItems: TimelineItem[] = [
    {
      id: 't1',
      title: 'OKLCH token audit passed',
      description: 'All accent pairs verified against WCAG 2.1 AA contrast rules across light & dark parity.',
      timestamp: 'Aug 17, 09:00',
      icon: CheckCircle2,
      status: 'success',
      badges: [{ label: 'Tokens', variant: 'outline' }],
    },
    {
      id: 't2',
      title: 'Timeline component shipped',
      description: 'Left-aligned and alternate layouts with status dots, custom icons, and badge slots.',
      timestamp: 'Aug 17, 11:30',
      icon: Rocket,
      status: 'info',
      badges: [{ label: 'ui', variant: 'outline' }],
    },
    {
      id: 't3',
      title: 'Contrast warning on accent',
      description: 'Primary/foreground pair on highlight variant falls below 4.5:1 in dark mode.',
      timestamp: 'Aug 17, 14:15',
      icon: AlertTriangle,
      status: 'warning',
      badges: [{ label: 'Needs review', variant: 'secondary' }],
    },
    {
      id: 't4',
      title: 'PostgreSQL migration blocked',
      description: 'Downstream job exceeded the row count limit; rerun after the dedup script.',
      timestamp: 'Aug 17, 16:45',
      icon: ShieldCheck,
      status: 'error',
      badges: [{ label: 'Migration', variant: 'destructive' }],
    },
  ];

  const accountDetails: DescriptionListItem[] = [
    { label: 'Workspace', value: 'Apex Design Systems', hint: 'team-apex.design' },
    { label: 'Plan', value: 'Enterprise Pro', hint: 'Billed monthly' },
    { label: 'Owner', value: 'Alex Rivers', hint: 'alex@company.com' },
    { label: 'Seats', value: '24 of 30 used', hint: '6 invites pending' },
    { label: 'Region', value: 'ap-southeast-1', hint: 'Singapore edge' },
    { label: 'Created', value: 'Jan 12, 2026', hint: 'v1.0 release' },
  ];

  const metricTiles: MetricTile[] = [
    { label: 'Requests', value: '1.2M', unit: 'req', tone: 'primary', highlight: true },
    { label: 'Error rate', value: '0.42', unit: '%', tone: 'success' },
    { label: 'P95 latency', value: '128', unit: 'ms' },
  ];

  const metricProgress: MetricTilesCardProgress = {
    value: 68,
    label: 'Monthly quota',
    sublabel: '68%',
    icon: TrendingUp,
    tone: 'success',
  };

  const bulkRows = [
    { id: 'r1', name: 'button.tsx', type: 'Component', status: 'Synced' },
    { id: 'r2', name: 'timeline.tsx', type: 'Component', status: 'Draft' },
    { id: 'r3', name: 'tokens.css', type: 'Token', status: 'Synced' },
    { id: 'r4', name: 'stat-card.tsx', type: 'Component', status: 'Review' },
    { id: 'r5', name: 'chart-a11y-table.tsx', type: 'Utility', status: 'Synced' },
  ];

  const [selectedIds, setSelectedIds] = React.useState<string[]>(['r2']);

  const toggleRow = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const toggleAll = () => {
    setSelectedIds((prev) =>
      prev.length === bulkRows.length ? [] : bulkRows.map((row) => row.id)
    );
  };

  const bulkActions: BulkAction[] = [
    {
      id: 'assign',
      label: 'Assign',
      icon: Tag,
      onClick: () =>
        toast({
          variant: 'success',
          title: 'Assigned',
          description: `${selectedIds.length} files assigned to Alex Rivers.`,
        }),
    },
    {
      id: 'archive',
      label: 'Archive',
      icon: Archive,
      variant: 'outline',
      onClick: () =>
        toast({
          title: 'Archived',
          description: `${selectedIds.length} files moved to archive.`,
        }),
    },
    {
      id: 'delete',
      label: 'Delete',
      icon: Trash2,
      variant: 'destructive',
      onClick: () =>
        toast({
          variant: 'destructive',
          title: 'Deleted',
          description: `${selectedIds.length} files permanently removed.`,
        }),
    },
  ];

  const chartRows = [
    { month: 'Jan', na: 1240, eu: 980, apac: 1520 },
    { month: 'Feb', na: 1360, eu: 1040, apac: 1680 },
    { month: 'Mar', na: 1490, eu: 1120, apac: 1790 },
    { month: 'Apr', na: 1610, eu: 1200, apac: 1850 },
    { month: 'May', na: 1740, eu: 1290, apac: 1920 },
    { month: 'Jun', na: 1880, eu: 1370, apac: 2040 },
  ];
  const maxValue = 2040;

  const treeNodes: TreeNode[] = [
    {
      id: 'packages',
      label: 'packages',
      icon: Folder,
      children: [
        {
          id: 'ui',
          label: 'ui',
          icon: Folder,
          children: [
            { id: 'button', label: 'button.tsx', icon: FileCode2 },
            { id: 'page-header', label: 'page-header.tsx', icon: FileCode2 },
            { id: 'tree-view', label: 'tree-view.tsx', icon: FileCode2 },
            { id: 'sidebar', label: 'sidebar.tsx', icon: FileCode2 },
          ],
        },
        {
          id: 'tokens',
          label: 'tokens',
          icon: Folder,
          children: [
            { id: 'colors', label: 'colors.ts', icon: FileText },
            { id: 'typography', label: 'typography.ts', icon: FileText },
          ],
        },
      ],
    },
    {
      id: 'apps',
      label: 'apps',
      icon: Folder,
      children: [
        {
          id: 'showcase',
          label: 'showcase',
          icon: Folder,
          children: [
            { id: 'app-router', label: 'layout.tsx', icon: FileCode2 },
            { id: 'docs-page', label: 'page.tsx', icon: FileCode2 },
          ],
        },
        { id: 'web', label: 'web', icon: Folder },
      ],
    },
  ];

  const [selectedNode, setSelectedNode] = React.useState<string>('page-header');

  const [tasks, setTasks] = React.useState([
    { id: 't1', title: 'Audit OKLCH color contrast ratios', tag: 'Tokens' },
    { id: 't2', title: 'Add unit tests for TreeView & SortableList', tag: 'Testing' },
    { id: 't3', title: 'Integrate Radix NavigationMenu composite', tag: 'UI' },
    { id: 't4', title: 'Publish living docs for UX scenario patterns', tag: 'Docs' },
  ]);

  const [messages, setMessages] = React.useState<Array<{
    sender: 'user' | 'assistant' | 'system';
    content: string;
    timestamp: string;
  }>>([
    {
      sender: 'system',
      content: 'Apex Copilot connected to Knowledge Base',
      timestamp: '10:00 AM',
    },
    {
      sender: 'assistant',
      content: 'Hello! I am your Design System AI assistant. How can I help you compose accessible components today?',
      timestamp: '10:01 AM',
    },
    {
      sender: 'user',
      content: 'How do I use TreeView and SortableList in Next.js 15?',
      timestamp: '10:02 AM',
    },
    {
      sender: 'assistant',
      content: 'Both TreeView and SortableList are client components exported from `@ds/ui`. You can import them directly in any `"use client"` file with custom icons and drag handles.',
      timestamp: '10:02 AM',
    },
  ]);
  const [composerInput, setComposerInput] = React.useState('');
  const [isTyping, setIsTyping] = React.useState(false);

  const handleSendMessage = () => {
    if (!composerInput.trim()) return;
    const userMsg = composerInput;
    setMessages((prev) => [
      ...prev,
      {
        sender: 'user',
        content: userMsg,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
    setComposerInput('');
    setIsTyping(true);

    setTimeout(() => {
      setIsTyping(false);
      setMessages((prev) => [
        ...prev,
        {
          sender: 'assistant',
          content: `Here is a recipe for "${userMsg.slice(0, 30)}...": combine Radix primitives with Tailwind v4 for full keyboard navigation and light/dark mode tokens.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    }, 1200);
  };

  return (
    <div className="space-y-12">
      <Banner variant="highlight" actionText="Explore Card Variants" actionHref="#card-variants">
        <strong>Data Display:</strong> Card variants, avatars, carousels, code blocks, stat cards, timelines, bulk actions, and collection primitives.
      </Banner>

      <PageHeader
        eyebrow="Data Display"
        eyebrowIcon={Box}
        title="Data Display Components"
        description="A single category covering card & stat presentations, media scrollers, code snippets, and complex collection primitives such as trees, sortable lists, and AI chat suites."
        actions={
          <div className="flex items-center gap-2">
            <Badge variant="highlight" className="font-mono text-xs">
              Embla / Radix
            </Badge>
            <Badge variant="outline" className="font-mono text-xs">
              @dnd-kit / Core
            </Badge>
          </div>
        }
      />

      {/* Sticky Quick-Jump Anchor Nav Bar */}
      <div className="sticky top-16 z-10 -mx-6 md:-mx-10 px-6 md:px-10 py-2.5 bg-background/90 backdrop-blur-md">
        <div className="border-b border-border/80 pb-2">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar -mx-2 px-2">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider shrink-0 pl-1">
              Jump To:
            </span>
            {SECTIONS.map((sec) => (
              <a
                key={sec.id}
                href={`#${sec.id}`}
                onClick={() => setActiveSection(sec.id)}
                className={`rounded-full px-3 py-1 text-xs font-medium whitespace-nowrap transition-colors ${
                  activeSection === sec.id
                    ? 'bg-primary text-primary-foreground shadow-xs'
                    : 'bg-muted/60 text-muted-foreground hover:bg-accent hover:text-foreground'
                }`}
              >
                {sec.label}
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* 1. Card Variants */}
      <section id="card-variants" className="space-y-4 scroll-mt-20">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold text-foreground font-display flex items-center gap-2">
            <Layers className="h-6 w-6 text-highlight" />
            <span>Card Variants & Interactive States</span>
          </h2>
          <p className="text-sm text-muted-foreground">
            Varian card untuk konteks hierarki konten berbeda: Default, Interactive (hover), Selectable, Glassmorphism, Gradient, and Flat.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card variant="default">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Layers className="h-4 w-4 text-primary" />
                Default Card
              </CardTitle>
              <CardDescription>Standar container berbingkai border token.</CardDescription>
            </CardHeader>
            <CardContent className="text-xs text-muted-foreground">
              Cocok untuk form section, setting panels, dan modular dashboard widgets.
            </CardContent>
          </Card>

          <Card variant="interactive" onClick={() => toast({ title: 'Interactive Card Clicked' })}>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Zap className="h-4 w-4 text-highlight" />
                Interactive Card
              </CardTitle>
              <CardDescription>Hover elevation & slight translation.</CardDescription>
            </CardHeader>
            <CardContent className="text-xs text-muted-foreground">
              Klik kartu ini untuk melihat feedback active state yang tactile.
            </CardContent>
          </Card>

          <Card variant="glass">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                Glassmorphism Card
              </CardTitle>
              <CardDescription>Backdrop blur dengan translucent background.</CardDescription>
            </CardHeader>
            <CardContent className="text-xs text-muted-foreground">
              Sangat estetik untuk floating widgets, hero showcases, dan stats.
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          <Card
            variant="selectable"
            selected={selectedCard === 'card-1'}
            onClick={() => setSelectedCard('card-1')}
          >
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Standard Plan</CardTitle>
                <Badge variant={selectedCard === 'card-1' ? 'default' : 'outline'}>
                  {selectedCard === 'card-1' ? 'Selected' : 'Select'}
                </Badge>
              </div>
              <CardDescription>$29 / bulan · Akses 5 pengguna</CardDescription>
            </CardHeader>
          </Card>

          <Card
            variant="selectable"
            selected={selectedCard === 'card-2'}
            onClick={() => setSelectedCard('card-2')}
          >
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  Enterprise Pro
                  <Badge variant="highlight">Popular</Badge>
                </CardTitle>
                <Badge variant={selectedCard === 'card-2' ? 'default' : 'outline'}>
                  {selectedCard === 'card-2' ? 'Selected' : 'Select'}
                </Badge>
              </div>
              <CardDescription>$99 / bulan · Unlimited seat & dedicated support</CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* 2. Avatars & Avatar Groups */}
      <section id="avatars" className="space-y-4 scroll-mt-20">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold text-foreground font-display flex items-center gap-2">
            <Users className="h-6 w-6 text-highlight" />
            <span>Avatars & Avatar Groups</span>
          </h2>
          <p className="text-sm text-muted-foreground">
            Support 5 ukuran (xs, sm, default, lg, xl), live status indicators (online, away, busy, offline), dan overlapping AvatarGroup.
          </p>
        </div>

        <Card className="border-border">
          <CardContent className="p-6 space-y-6">
            <div className="space-y-2">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Sizes & Presence Indicators
              </span>
              <div className="flex flex-wrap items-center gap-6">
                <Avatar size="xs" status="online">
                  <AvatarFallback>XS</AvatarFallback>
                </Avatar>
                <Avatar size="sm" status="online">
                  <AvatarFallback>SM</AvatarFallback>
                </Avatar>
                <Avatar size="default" status="away">
                  <AvatarFallback>DF</AvatarFallback>
                </Avatar>
                <Avatar size="lg" status="busy">
                  <AvatarFallback>LG</AvatarFallback>
                </Avatar>
                <Avatar size="xl" status="online">
                  <AvatarImage src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150" alt="Sarah" />
                  <AvatarFallback>XL</AvatarFallback>
                </Avatar>
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Avatar Group (with Overflow Counter)
              </span>
              <div className="flex items-center gap-6">
                <AvatarGroup max={4} size="default">
                  <Avatar><AvatarFallback className="bg-primary/20 text-primary">AR</AvatarFallback></Avatar>
                  <Avatar><AvatarFallback className="bg-success/20 text-success">BK</AvatarFallback></Avatar>
                  <Avatar><AvatarFallback className="bg-warning/20 text-warning">CL</AvatarFallback></Avatar>
                  <Avatar><AvatarFallback className="bg-destructive/20 text-destructive">DT</AvatarFallback></Avatar>
                  <Avatar><AvatarFallback>EM</AvatarFallback></Avatar>
                  <Avatar><AvatarFallback>FN</AvatarFallback></Avatar>
                </AvatarGroup>

                <span className="text-xs text-muted-foreground">
                  6 team members · 4 shown + 2 excess
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* 3. Carousel Basic */}
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

      {/* 4. Carousel Multi */}
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

      {/* 5. Scroll Area */}
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

      {/* 6. Code Blocks */}
      <section id="code-blocks" className="space-y-4 scroll-mt-20">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold text-foreground font-display flex items-center gap-2">
            <Code2 className="h-6 w-6 text-highlight" />
            <span>Code Blocks & Snippets</span>
          </h2>
          <p className="text-sm text-muted-foreground">
            Container syntax dengan copy-to-clipboard, file badge label, dan collapsible option.
          </p>
        </div>

        <div className="space-y-4">
          <CodeBlock
            filename="button.tsx"
            language="tsx"
            showLineNumbers
            code={`import { Button } from '@ds/ui';

export function ActionExample() {
  return (
    <Button variant="highlight" size="lg" onClick={() => console.log('Action triggered')}>
      Launch Project
    </Button>
  );
}`}
          />
        </div>
      </section>

      {/* 7. StatCard Variants & Trends */}
      <section id="stat-cards" className="space-y-4 scroll-mt-20">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold text-foreground font-display flex items-center gap-2">
            <DollarSign className="h-6 w-6 text-highlight" />
            <span>StatCard Variants & Trends</span>
          </h2>
          <p className="text-sm text-muted-foreground">
            Pre-built stat presentations with up/down/neutral trend deltas and highlight hero variant.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Revenue (Hero)"
            value="$128,450"
            delta={{ value: '+18.2%', trend: 'up', label: 'vs last month' }}
            icon={DollarSign}
            variant="highlight"
          />

          <StatCard
            title="Active Subscribers"
            value="12,840"
            delta={{ value: '+14.2%', trend: 'up', label: 'vs previous quarter' }}
            icon={Users}
          />

          <StatCard
            title="Churn Rate"
            value="2.4%"
            delta={{ value: '-0.8%', trend: 'down', label: 'vs last quarter' }}
            icon={TrendingDown}
          />

          <StatCard
            title="P99 Response Time"
            value="42ms"
            delta={{ value: 'Stable', trend: 'neutral', label: 'within SLA targets' }}
            icon={Zap}
          />
        </div>
      </section>

      {/* 8. Timeline */}
      <section id="timeline" className="space-y-4 scroll-mt-20">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold text-foreground font-display flex items-center gap-2">
            <GitCommit className="h-6 w-6 text-highlight" />
            <span>Timeline</span>
          </h2>
          <p className="text-sm text-muted-foreground">
            Vertical progress timeline with status dots, custom icons, timestamps, and badge slots; supports left and alternate alignment.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-base">Deployment Timeline</CardTitle>
              <CardDescription>Left-aligned items with connector line.</CardDescription>
            </CardHeader>
            <CardContent>
              <Timeline items={timelineItems} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-base">Alternate Alignment</CardTitle>
              <CardDescription>Items alternate sides using <code className="font-mono text-xs">align=&quot;alternate&quot;</code>.</CardDescription>
            </CardHeader>
            <CardContent>
              <Timeline
                align="alternate"
                items={timelineItems.slice(0, 3)}
              />
            </CardContent>
          </Card>
        </div>
      </section>

      {/* 9. Description List */}
      <section id="description-list" className="space-y-4 scroll-mt-20">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold text-foreground font-display flex items-center gap-2">
            <List className="h-6 w-6 text-highlight" />
            <span>Description List</span>
          </h2>
          <p className="text-sm text-muted-foreground">
            Accessible definition list (`dl`) with configurable columns, dividers, and optional hint rows for detail views.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-base">Workspace Details</CardTitle>
              <CardDescription>Two columns with divider rows.</CardDescription>
            </CardHeader>
            <CardContent>
              <DescriptionList items={accountDetails} columns={2} dividers />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-base">Compact Detail Grid</CardTitle>
              <CardDescription>Three columns without dividers.</CardDescription>
            </CardHeader>
            <CardContent>
              <DescriptionList items={accountDetails} columns={3} />
            </CardContent>
          </Card>
        </div>
      </section>

      {/* 10. Metric Tiles Card */}
      <section id="metric-tiles" className="space-y-4 scroll-mt-20">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold text-foreground font-display flex items-center gap-2">
            <Gauge className="h-6 w-6 text-highlight" />
            <span>Metric Tiles Card</span>
          </h2>
          <p className="text-sm text-muted-foreground">
            Composite metric strip with three tiles, optional progress bar, tone colors, and footer slot.
          </p>
        </div>

        <div className="max-w-2xl">
          <MetricTilesCard
            tiles={metricTiles}
            progress={metricProgress}
            footer={
              <>
                <span className="text-muted-foreground">Last sync 2 min ago</span>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 text-xs"
                  onClick={() => toast({ title: 'Metrics refreshed' })}
                >
                  Refresh
                </Button>
              </>
            }
          />
        </div>
      </section>

      {/* 11. Bulk Action Bar */}
      <section id="bulk-action-bar" className="space-y-4 scroll-mt-20">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold text-foreground font-display flex items-center gap-2">
            <ListChecks className="h-6 w-6 text-highlight" />
            <span>Bulk Action Bar</span>
          </h2>
          <p className="text-sm text-muted-foreground">
            Sticky selection toolbar that appears above data tables with a count label, action buttons, and a clear-selection control.
          </p>
        </div>

        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-base">Selectable File Table</CardTitle>
            <CardDescription>
              Toggle rows with checkboxes to reveal the bulk action bar.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-xl border border-border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-10">
                      <Checkbox
                        aria-label="Select all rows"
                        checked={selectedIds.length === bulkRows.length && bulkRows.length > 0}
                        onCheckedChange={toggleAll}
                      />
                    </TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bulkRows.map((row) => (
                    <TableRow
                      key={row.id}
                      className={selectedIds.includes(row.id) ? 'bg-primary/5' : undefined}
                    >
                      <TableCell>
                        <Checkbox
                          aria-label={`Select ${row.name}`}
                          checked={selectedIds.includes(row.id)}
                          onCheckedChange={() => toggleRow(row.id)}
                        />
                      </TableCell>
                      <TableCell className="font-mono text-xs">{row.name}</TableCell>
                      <TableCell className="text-xs">{row.type}</TableCell>
                      <TableCell>
                        <Badge
                          variant={row.status === 'Synced' ? 'success' : row.status === 'Draft' ? 'warning' : 'info'}
                          className="text-[10px]"
                        >
                          {row.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <BulkActionBar
              open={selectedIds.length > 0}
              count={selectedIds.length}
              actions={bulkActions}
              onClearSelection={() => setSelectedIds([])}
              sticky={false}
            />
          </CardContent>
        </Card>
      </section>

      {/* 12. Chart A11y Table */}
      <section id="chart-a11y-table" className="space-y-4 scroll-mt-20">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold text-foreground font-display flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-highlight" />
            <span>Chart Accessibility Table</span>
          </h2>
          <p className="text-sm text-muted-foreground">
            Screen-reader-only table rendered alongside a visual chart so data remains accessible to assistive technology.
          </p>
        </div>

        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-base">Regional MAU Bar Chart</CardTitle>
            <CardDescription>
              Visual bars pair with a hidden (`sr-only`) data table for screen readers.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-end gap-4 h-40 px-2">
              {chartRows.map((row) => (
                <div key={row.month} className="flex items-end gap-1 flex-1">
                  {[
                    { key: 'na', className: 'bg-primary' },
                    { key: 'eu', className: 'bg-highlight' },
                    { key: 'apac', className: 'bg-success' },
                  ].map((series) => (
                    <div
                      key={series.key}
                      title={series.key.toUpperCase()}
                      className={`flex-1 rounded-t ${series.className}`}
                      style={{
                        height: `${((row[series.key as keyof typeof row] as number) / maxValue) * 128}px`,
                      }}
                    />
                  ))}
                </div>
              ))}
            </div>
            <div className="flex justify-center gap-4 text-[11px] text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-primary" /> North America
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-highlight" /> Europe
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-success" /> APAC
              </span>
            </div>
            <ChartA11yTable
              caption="Monthly active users by region, January through June 2026"
              columns={[
                { key: 'month', header: 'Month' },
                { key: 'na', header: 'North America' },
                { key: 'eu', header: 'Europe' },
                { key: 'apac', header: 'APAC' },
              ]}
              rows={chartRows}
            />
          </CardContent>
        </Card>
      </section>

      {/* 13. TreeView */}
      <section id="tree-view" className="space-y-4 scroll-mt-20">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold text-foreground font-display flex items-center gap-2">
            <ListTree className="h-6 w-6 text-highlight" />
            <span>Hierarchical TreeView</span>
          </h2>
          <p className="text-sm text-muted-foreground">
            Nested directory explorer with keyboard navigation (arrow keys, enter, home/end), icon slots, and selection callbacks.
          </p>
        </div>

        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-base">Interactive File Tree</CardTitle>
            <CardDescription>
              Click folders to expand/collapse or select files to inspect details.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
              <div className="p-4 rounded-xl border border-border bg-card shadow-xs">
                <TreeView
                  nodes={treeNodes}
                  defaultExpandedIds={['packages', 'ui']}
                  selectedId={selectedNode}
                  onSelect={(id) => setSelectedNode(id)}
                />
              </div>

              <div className="p-6 rounded-xl border border-border bg-muted/20 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
                    Selected Node Details
                  </span>
                  <Badge variant="highlight" className="font-mono text-xs">
                    {selectedNode}
                  </Badge>
                </div>
                <div className="p-4 rounded-lg bg-card border border-border space-y-2">
                  <p className="text-xs font-semibold text-foreground font-mono">
                    Node ID: <span className="text-highlight">{selectedNode}</span>
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Supports controlled `expandedIds`, custom node icons, and accessible WAI-ARIA tree roles.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* 14. Sortable List */}
      <section id="sortable-list" className="space-y-4 scroll-mt-20">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold text-foreground font-display flex items-center gap-2">
            <Layers className="h-6 w-6 text-highlight" />
            <span>Drag & Drop Sortable List</span>
          </h2>
          <p className="text-sm text-muted-foreground">
            Reorderable list with smooth animations, touch sensors, keyboard sorting, and drag handles built on `@dnd-kit`.
          </p>
        </div>

        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-base">Task Priority Ordering</CardTitle>
            <CardDescription>
              Drag items by the grip icon or use keyboard Space/Arrow keys to reorder.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="max-w-xl mx-auto p-4 rounded-xl border border-border bg-muted/10">
              <SortableList
                items={tasks}
                onReorder={setTasks}
                renderItem={(item, isDragging) => (
                  <div
                    className={`flex items-center justify-between p-3 rounded-lg border bg-card text-foreground transition-all shadow-xs ${
                      isDragging ? 'border-highlight ring-2 ring-highlight/20 scale-[1.02] shadow-md z-10' : 'border-border'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="h-4 w-4 text-highlight shrink-0" />
                      <span className="text-xs font-medium text-foreground">{item.title}</span>
                    </div>
                    <Badge variant="outline" className="text-[10px] font-mono shrink-0">
                      {item.tag}
                    </Badge>
                  </div>
                )}
              />
            </div>
          </CardContent>
        </Card>
      </section>

      {/* 15. Chat Suite */}
      <section id="chat-interface" className="space-y-4 scroll-mt-20">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold text-foreground font-display flex items-center gap-2">
            <Bot className="h-6 w-6 text-highlight" />
            <span>AI Copilot & Chat Suite</span>
          </h2>
          <p className="text-sm text-muted-foreground">
            Turnkey AI conversational UI featuring chat threads, bubble sender variants, typing indicators, suggested prompts, and multiline composer.
          </p>
        </div>

        <Card>
          <CardContent className="p-6">
            <div className="h-[480px] rounded-xl border border-border overflow-hidden flex flex-col bg-card shadow-xs">
              <div className="h-12 border-b border-border px-4 flex items-center justify-between bg-muted/20">
                <div className="flex items-center gap-2">
                  <div className="h-7 w-7 rounded-lg bg-highlight flex items-center justify-center text-highlight-foreground">
                    <Bot className="h-4 w-4" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-foreground font-display">Apex Copilot</span>
                    <span className="text-[10px] text-muted-foreground font-mono">Active Model: Gemini 2.0</span>
                  </div>
                </div>
                <Badge variant="highlight" className="text-[10px] font-mono">
                  Online
                </Badge>
              </div>

              <ChatContainer className="flex-1">
                <ChatThread>
                  {messages.map((msg, i) => (
                    <ChatMessage
                      key={i}
                      sender={msg.sender}
                      senderName={msg.sender === 'assistant' ? 'Copilot' : undefined}
                      content={msg.content}
                      timestamp={msg.timestamp}
                      copyable={msg.sender === 'assistant'}
                    />
                  ))}
                  {isTyping && <ChatTypingIndicator />}
                </ChatThread>

                <ChatSuggestionList
                  suggestions={[
                    'How do I customize OKLCH tokens?',
                    'Show me how to create a master-detail table view',
                  ]}
                  onSelect={(prompt) => {
                    setComposerInput(prompt);
                  }}
                />

                <ChatComposer
                  value={composerInput}
                  onChange={setComposerInput}
                  onSend={handleSendMessage}
                  placeholder="Ask the AI copilot anything... (Enter to send)"
                />
              </ChatContainer>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}