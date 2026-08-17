'use client';

import * as React from 'react';
import {
  PanelLeft,
  Home,
  Layers,
  Users,
  Settings,
  Sparkles,
  Inbox,
  FolderKanban,
  FileText,
  BarChart3,
  LayoutGrid,
  Sidebar as SidebarIcon,
  Compass,
  ShieldCheck,
  Zap,
  Bot,
  Database,
  Code2,
  Workflow,
  Cpu,
  Globe,
  Bell,
  ChevronDown,
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
  Separator,
  Banner,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuTrigger,
  MegaMenu,
  MegaMenuGroup,
  MegaMenuGroupLabel,
  MegaMenuItem,
  MegaMenuFeaturedCard,
  Navbar,
  NavbarBrand,
  NavbarNav,
  NavbarLink,
  NavbarActions,
  AppShell,
  AppShellHeader,
  AppShellMain,
  AppShellInset,
  AppShellFooter,
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
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
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
  Footer,
  FooterGrid,
  FooterColumn,
  FooterLink,
  FooterBottom,
  BottomNavItem,
  NavbarMobile,
  Menubar,
  MenubarMenu,
  MenubarTrigger,
  MenubarContent,
  MenubarItem,
  MenubarSeparator,
  MenubarShortcut,
  MenubarSub,
  MenubarSubTrigger,
  MenubarSubContent,
  AspectRatio,
  SkipLink,
} from '@ds/ui';

const SECTIONS = [
  { id: 'sidebar-system', label: 'Sidebar System' },
  { id: 'mega-menu', label: 'Mega Menu' },
  { id: 'navbar', label: 'Navbar' },
  { id: 'app-shell', label: 'AppShell' },
  { id: 'resizable', label: 'Resizable Panels' },
  { id: 'tabs-accordion', label: 'Tabs & Accordion' },
  { id: 'collapsible-breadcrumb', label: 'Collapsible & Breadcrumb' },
  { id: 'pagination', label: 'Pagination' },
  { id: 'footer', label: 'Footer' },
  { id: 'bottom-nav', label: 'Bottom Nav' },
  { id: 'menubar', label: 'Menubar' },
  { id: 'aspect-ratio-skip-link', label: 'Aspect Ratio & Skip Link' },
];

export default function LayoutNavigationPage() {
  const [activeItem, setActiveItem] = React.useState('dashboard');
  const [activeBottomNav, setActiveBottomNav] = React.useState('home');
  const [collapsibleOpen, setCollapsibleOpen] = React.useState(false);
  const [activePage, setActivePage] = React.useState(2);
  const [activeSection, setActiveSection] = React.useState('sidebar-system');

  return (
    <div className="space-y-12">
      <Banner variant="highlight" actionText="Explore Layouts" actionHref="#sidebar-system">
        <strong>Layout & Navigation Suite:</strong> Sidebar systems, mega menus, navbars, app shells, resizable panels, and mobile drawers in one coherent reference.
      </Banner>

      <PageHeader
        eyebrow="Layout & Navigation"
        eyebrowIcon={Layers}
        title="Layout & Navigation System"
        description="Unified documentation for layout containers, navigation primitives, and mobile shell patterns built with Radix UI and Tailwind CSS."
        actions={
          <div className="flex items-center gap-2">
            <Badge variant="highlight" className="font-mono text-xs">
              12 Sections
            </Badge>
            <Badge variant="outline" className="font-mono text-xs">
              WCAG AA Accessible
            </Badge>
          </div>
        }
      />

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

      <section id="sidebar-system" className="space-y-4 scroll-mt-20">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold text-foreground font-display flex items-center gap-2">
            <PanelLeft className="h-6 w-6 text-highlight" />
            <span>Sidebar System</span>
          </h2>
          <p className="text-sm text-muted-foreground">
            A composable, responsive sidebar layout system supporting icon collapse, floating and inset variants, mobile drawer sheets, and standardized keyboard navigation.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-4 bg-muted/20 border-border">
            <div className="flex items-center gap-2.5 mb-2 text-foreground font-semibold text-sm">
              <Layers className="h-4 w-4 text-highlight" />
              <span>Compound Primitives</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Modular structure with SidebarHeader, Content, Group, Menu, and Footer for high flexibility.
            </p>
          </Card>

          <Card className="p-4 bg-muted/20 border-border">
            <div className="flex items-center gap-2.5 mb-2 text-foreground font-semibold text-sm">
              <PanelLeft className="h-4 w-4 text-highlight" />
              <span>Multiple Variants</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Supports default sidebar, floating card, inset content wrapper, and icon-only collapsed views.
            </p>
          </Card>

          <Card className="p-4 bg-muted/20 border-border">
            <div className="flex items-center gap-2.5 mb-2 text-foreground font-semibold text-sm">
              <Users className="h-4 w-4 text-highlight" />
              <span>Mobile Sheet Integration</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Automatic transition to off-canvas mobile drawer on touch viewports below 768px.
            </p>
          </Card>
        </div>

        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-base">Standard Sidebar Layout</CardTitle>
            <CardDescription>Click menu items to switch active navigation state.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[460px] rounded-xl border border-border overflow-hidden flex bg-muted/10 shadow-xs">
              <div className="w-64 bg-card border-r border-border flex flex-col shrink-0">
                <SidebarHeader>
                  <div className="flex items-center gap-2.5 px-1 py-1">
                    <div className="h-8 w-8 rounded-lg bg-highlight flex items-center justify-center text-highlight-foreground font-bold text-sm shadow-xs">
                      DS
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-xs font-bold font-display text-foreground truncate">
                        Acme Studio
                      </span>
                      <span className="text-[10px] font-mono text-muted-foreground truncate">
                        Enterprise v2.4
                      </span>
                    </div>
                  </div>
                </SidebarHeader>

                <SidebarContent>
                  <SidebarGroup>
                    <SidebarGroupLabel>Core Platform</SidebarGroupLabel>
                    <SidebarMenu>
                      <SidebarMenuItem>
                        <SidebarMenuButton
                          isActive={activeItem === 'dashboard'}
                          onClick={() => setActiveItem('dashboard')}
                        >
                          <Home className="h-4 w-4" />
                          <span>Dashboard</span>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                      <SidebarMenuItem>
                        <SidebarMenuButton
                          isActive={activeItem === 'projects'}
                          onClick={() => setActiveItem('projects')}
                        >
                          <FolderKanban className="h-4 w-4" />
                          <span>Projects</span>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                      <SidebarMenuItem>
                        <SidebarMenuButton
                          isActive={activeItem === 'leads'}
                          onClick={() => setActiveItem('leads')}
                        >
                          <Users className="h-4 w-4" />
                          <span>CRM Leads</span>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                      <SidebarMenuItem>
                        <SidebarMenuButton
                          isActive={activeItem === 'analytics'}
                          onClick={() => setActiveItem('analytics')}
                        >
                          <BarChart3 className="h-4 w-4" />
                          <span>Analytics</span>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    </SidebarMenu>
                  </SidebarGroup>

                  <SidebarGroup>
                    <SidebarGroupLabel>Documents & Content</SidebarGroupLabel>
                    <SidebarMenu>
                      <SidebarMenuItem>
                        <SidebarMenuButton
                          isActive={activeItem === 'reports'}
                          onClick={() => setActiveItem('reports')}
                        >
                          <FileText className="h-4 w-4" />
                          <span>Reports</span>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                      <SidebarMenuItem>
                        <SidebarMenuButton
                          isActive={activeItem === 'inbox'}
                          onClick={() => setActiveItem('inbox')}
                        >
                          <Inbox className="h-4 w-4" />
                          <span>Inbox</span>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    </SidebarMenu>
                  </SidebarGroup>
                </SidebarContent>

                <SidebarFooter>
                  <div className="p-2 rounded-lg bg-muted/40 border border-border/50 flex items-center justify-between">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="h-7 w-7 rounded-full bg-primary/10 text-primary font-bold text-xs flex items-center justify-center">
                        JD
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-xs font-semibold text-foreground truncate">
                          Jane Doe
                        </span>
                        <span className="text-[10px] text-muted-foreground truncate">
                          admin@acme.com
                        </span>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-foreground">
                      <Settings className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </SidebarFooter>
              </div>

              <div className="flex-1 flex flex-col min-w-0 bg-background p-6">
                <div className="flex items-center justify-between pb-4 border-b border-border">
                  <div className="space-y-0.5">
                    <h3 className="text-lg font-bold font-display capitalize text-foreground">
                      {activeItem} View
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      Active section rendered inside main viewport container.
                    </p>
                  </div>
                  <Badge variant="highlight" className="font-mono text-xs capitalize">
                    Active: {activeItem}
                  </Badge>
                </div>

                <div className="flex-1 mt-6 rounded-lg border border-dashed border-border flex items-center justify-center p-8 text-center bg-muted/5">
                  <div className="space-y-2 max-w-sm">
                    <Sparkles className="h-8 w-8 text-highlight mx-auto" />
                    <p className="text-sm font-semibold text-foreground">
                      Main Canvas Area
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Sidebar provides predictable 16rem width contract with fluid flex content expansion.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-base">Inset Layout Pattern</CardTitle>
            <CardDescription>
              Modern elevated card inset styling where the primary content canvas floats within a container margin.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="h-80 rounded-xl border border-border overflow-hidden flex bg-muted/20 p-2 gap-2">
              <div className="w-48 bg-card rounded-lg border border-border p-3 flex flex-col justify-between shadow-xs">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="h-6 w-6 rounded bg-highlight flex items-center justify-center text-highlight-foreground text-xs font-bold">
                      A
                    </div>
                    <span className="text-xs font-bold text-foreground font-display">Apex Inset</span>
                  </div>
                  <div className="space-y-1">
                    <div className="px-2 py-1.5 rounded-md bg-primary text-primary-foreground text-xs font-medium flex items-center gap-2">
                      <Home className="h-3.5 w-3.5" />
                      <span>Overview</span>
                    </div>
                    <div className="px-2 py-1.5 rounded-md text-muted-foreground hover:bg-accent/50 text-xs font-medium flex items-center gap-2">
                      <Users className="h-3.5 w-3.5" />
                      <span>Audience</span>
                    </div>
                    <div className="px-2 py-1.5 rounded-md text-muted-foreground hover:bg-accent/50 text-xs font-medium flex items-center gap-2">
                      <BarChart3 className="h-3.5 w-3.5" />
                      <span>Revenue</span>
                    </div>
                  </div>
                </div>
                <div className="text-[10px] text-muted-foreground font-mono">
                  data-variant=&quot;inset&quot;
                </div>
              </div>

              <div className="flex-1 bg-card rounded-lg border border-border flex flex-col shadow-xs overflow-hidden">
                <div className="h-10 border-b border-border px-4 flex items-center justify-between bg-muted/10">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <PanelLeft className="h-3.5 w-3.5 text-foreground" />
                    <span>/</span>
                    <span className="text-foreground font-semibold">Workspace</span>
                    <span>/</span>
                    <span>Analytics</span>
                  </div>
                  <Badge variant="outline" className="text-[10px] font-mono">
                    Rounded Inset
                  </Badge>
                </div>
                <div className="flex-1 p-4 flex items-center justify-center">
                  <div className="text-center space-y-1">
                    <p className="text-xs font-bold text-foreground">Floating Content Canvas</p>
                    <p className="text-[11px] text-muted-foreground max-w-xs">
                      Content cards stay visually separated from the background navigation container.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-base">Icon-Only Collapsed Variant</CardTitle>
            <CardDescription>
              Compact 3.5rem (56px) sidebar state that hides labels while keeping icon touch targets accessible.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row items-center gap-6 justify-center">
              <div className="w-16 h-72 rounded-xl border border-border bg-card flex flex-col items-center py-3 justify-between shadow-xs">
                <div className="space-y-4 flex flex-col items-center">
                  <div className="h-8 w-8 rounded-lg bg-highlight flex items-center justify-center text-highlight-foreground font-bold text-xs shadow-xs">
                    DS
                  </div>
                  <Separator className="w-8" />
                  <div className="space-y-2 flex flex-col items-center">
                    <Button variant="default" size="icon" className="h-8 w-8 rounded-lg">
                      <Home className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground">
                      <FolderKanban className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground">
                      <Users className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground">
                      <BarChart3 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground">
                  <Settings className="h-4 w-4" />
                </Button>
              </div>

              <div className="max-w-md space-y-3">
                <Badge variant="highlight" className="font-mono text-xs">
                  --sidebar-width-icon: 3.5rem
                </Badge>
                <h4 className="font-bold text-base text-foreground font-display">
                  Space-Efficient Layouts
                </h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  When collapsed to icon mode, text labels automatically transition with CSS cubic-bezier easing. Tooltips can be attached to each icon button to preserve label discoverability.
                </p>
                <div className="p-3 bg-muted/30 rounded-lg text-xs font-mono text-muted-foreground">
                  &lt;Sidebar collapsible=&quot;icon&quot;&gt;
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-base">Component Anatomy & API</CardTitle>
            <CardDescription>
              Overview of all primitives exported from `@ds/ui` for composing enterprise sidebar navigation.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-border text-muted-foreground font-mono">
                    <th className="pb-2 pr-4 font-semibold">Component</th>
                    <th className="pb-2 pr-4 font-semibold">Role</th>
                    <th className="pb-2 font-semibold">Key Props</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50 text-foreground font-mono">
                  <tr>
                    <td className="py-2.5 pr-4 text-highlight font-bold">SidebarProvider</td>
                    <td className="py-2.5 pr-4 text-muted-foreground font-sans">Context provider managing open/collapsed states & mobile detection</td>
                    <td className="py-2.5 text-muted-foreground">defaultOpen, open, onOpenChange</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 pr-4 text-highlight font-bold">Sidebar</td>
                    <td className="py-2.5 pr-4 text-muted-foreground font-sans">Container element adapting to desktop rail or mobile drawer</td>
                    <td className="py-2.5 text-muted-foreground">side, variant, collapsible</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 pr-4 text-highlight font-bold">SidebarTrigger</td>
                    <td className="py-2.5 pr-4 text-muted-foreground font-sans">Accessible button toggling sidebar state via context</td>
                    <td className="py-2.5 text-muted-foreground">ButtonProps</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 pr-4 text-highlight font-bold">SidebarHeader / Footer</td>
                    <td className="py-2.5 pr-4 text-muted-foreground font-sans">Pinned top and bottom slots for branding and user profile</td>
                    <td className="py-2.5 text-muted-foreground">HTMLAttributes</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 pr-4 text-highlight font-bold">SidebarContent</td>
                    <td className="py-2.5 pr-4 text-muted-foreground font-sans">Scrollable container for groups and items</td>
                    <td className="py-2.5 text-muted-foreground">HTMLAttributes</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 pr-4 text-highlight font-bold">SidebarGroup / Label</td>
                    <td className="py-2.5 pr-4 text-muted-foreground font-sans">Categorical section wrapper with uppercase header</td>
                    <td className="py-2.5 text-muted-foreground">HTMLAttributes</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 pr-4 text-highlight font-bold">SidebarMenu / MenuItem</td>
                    <td className="py-2.5 pr-4 text-muted-foreground font-sans">Semantic unordered list container for navigation buttons</td>
                    <td className="py-2.5 text-muted-foreground">HTMLAttributes</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 pr-4 text-highlight font-bold">SidebarMenuButton</td>
                    <td className="py-2.5 pr-4 text-muted-foreground font-sans">Interactive button with active state styling & icon alignment</td>
                    <td className="py-2.5 text-muted-foreground">isActive, variant, size</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 pr-4 text-highlight font-bold">SidebarInset</td>
                    <td className="py-2.5 pr-4 text-muted-foreground font-sans">Main canvas container with margin offsets and shadow</td>
                    <td className="py-2.5 text-muted-foreground">HTMLAttributes</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </section>

      <section id="mega-menu" className="space-y-4 scroll-mt-20">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold text-foreground font-display flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-highlight" />
            <span>Mega Menu (Multi-Column Dropdown)</span>
          </h2>
          <p className="text-sm text-muted-foreground">
            Enterprise navigation menu featuring multi-column categories, rich items with icons, badges, descriptions, and featured promo cards.
          </p>
        </div>

        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-base">Interactive Mega Menu Demo</CardTitle>
            <CardDescription>Hover over &ldquo;Solutions&rdquo; or &ldquo;Architecture&rdquo; to reveal mega menus.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="p-4 rounded-xl border border-border bg-muted/20 flex justify-center">
              <NavigationMenu>
                <NavigationMenuList>
                  <MegaMenu label="Solutions" columns={3}>
                    <MegaMenuGroup>
                      <MegaMenuGroupLabel>AI Capabilities</MegaMenuGroupLabel>
                      <MegaMenuItem
                        icon={Bot}
                        title="Agent Orchestration"
                        description="Autonomous multi-agent workflows"
                        badge="New"
                      />
                      <MegaMenuItem
                        icon={Zap}
                        title="Instant Triage"
                        description="Real-time predictive scoring"
                      />
                      <MegaMenuItem
                        icon={Cpu}
                        title="Vector Intelligence"
                        description="Semantic search and knowledge embeddings"
                      />
                    </MegaMenuGroup>

                    <MegaMenuGroup>
                      <MegaMenuGroupLabel>Enterprise Scale</MegaMenuGroupLabel>
                      <MegaMenuItem
                        icon={Database}
                        title="PostgreSQL Monorepo"
                        description="Prisma ORM multi-tenant architecture"
                      />
                      <MegaMenuItem
                        icon={ShieldCheck}
                        title="Zero-Trust SCIM"
                        description="SOC2 compliant authentication & Okta SAML"
                        badge="v2"
                      />
                      <MegaMenuItem
                        icon={Globe}
                        title="Edge Global CDN"
                        description="Low-latency server components"
                      />
                    </MegaMenuGroup>

                    <MegaMenuFeaturedCard
                      badge="Spring 2026"
                      title="Enterprise AI Suite"
                      description="Transform your omnichannel team with real-time generative copilot and analytics."
                      href="/crm"
                      ctaText="Explore Live CRM"
                    />
                  </MegaMenu>

                  <MegaMenu label="Architecture" columns={2}>
                    <MegaMenuGroup>
                      <MegaMenuGroupLabel>Frontend Systems</MegaMenuGroupLabel>
                      <MegaMenuItem
                        icon={Code2}
                        title="Next.js App Router"
                        description="React 19 Server Components first"
                      />
                      <MegaMenuItem
                        icon={LayoutGrid}
                        title="Tailwind CSS v4"
                        description="OKLCH tokens and @theme directives"
                      />
                    </MegaMenuGroup>

                    <MegaMenuGroup>
                      <MegaMenuGroupLabel>Design Tokens</MegaMenuGroupLabel>
                      <MegaMenuItem
                        icon={Sparkles}
                        title="OKLCH Color Space"
                        description="8 tone palettes with WCAG AA compliance"
                      />
                      <MegaMenuItem
                        icon={Workflow}
                        title="Art Directions"
                        description="Atelier, Aurora, and Blueprint modes"
                      />
                    </MegaMenuGroup>
                  </MegaMenu>

                  <NavigationMenuItem>
                    <NavigationMenuTrigger>Pricing</NavigationMenuTrigger>
                  </NavigationMenuItem>
                </NavigationMenuList>
              </NavigationMenu>
            </div>
          </CardContent>
        </Card>
      </section>

      <section id="navbar" className="space-y-4 scroll-mt-20">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold text-foreground font-display flex items-center gap-2">
            <Globe className="h-6 w-6 text-highlight" />
            <span>Navbar System</span>
          </h2>
          <p className="text-sm text-muted-foreground">
            Responsive header navigation bar supporting sticky, blurred glass, and floating variants with mobile drawer integration.
          </p>
        </div>

        <Card>
          <CardContent className="p-6 space-y-6">
            <div className="rounded-xl border border-border overflow-hidden bg-muted/20">
              <Navbar variant="default" sticky={false}>
                <NavbarBrand href="#">
                  <div className="h-6 w-6 rounded-md bg-highlight flex items-center justify-center text-highlight-foreground font-bold text-xs">
                    DS
                  </div>
                  <span>Apex UI</span>
                </NavbarBrand>
                <NavbarNav>
                  <NavbarLink href="#" active>
                    Overview
                  </NavbarLink>
                  <NavbarLink href="#">Components</NavbarLink>
                  <NavbarLink href="#">Patterns</NavbarLink>
                  <NavbarLink href="#">Docs</NavbarLink>
                </NavbarNav>
                <NavbarActions>
                  <Button size="sm" variant="outline" className="h-8 text-xs">
                    Sign In
                  </Button>
                  <Button size="sm" variant="highlight" className="h-8 text-xs">
                    Get Started
                  </Button>
                </NavbarActions>
              </Navbar>
            </div>

            <div className="rounded-xl border border-border overflow-hidden bg-muted/20 p-4">
              <p className="text-xs font-mono text-muted-foreground mb-3">Floating Variant:</p>
              <Navbar variant="floating" sticky={false}>
                <NavbarBrand href="#">
                  <Sparkles className="h-4 w-4 text-highlight" />
                  <span className="text-sm">Floating Bar</span>
                </NavbarBrand>
                <NavbarNav>
                  <NavbarLink href="#" active>Features</NavbarLink>
                  <NavbarLink href="#">Showcase</NavbarLink>
                </NavbarNav>
                <NavbarActions>
                  <Button size="sm" className="h-7 text-xs">Download</Button>
                </NavbarActions>
              </Navbar>
            </div>
          </CardContent>
        </Card>
      </section>

      <section id="app-shell" className="space-y-4 scroll-mt-20">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold text-foreground font-display flex items-center gap-2">
            <LayoutGrid className="h-6 w-6 text-highlight" />
            <span>AppShell Primitives</span>
          </h2>
          <p className="text-sm text-muted-foreground">
            Standardized application shells coordinating headers, insets, scrolling containers, and footers with dvh-safe height calculations.
          </p>
        </div>

        <Card>
          <CardContent className="p-6">
            <div className="rounded-xl border border-border overflow-hidden bg-card shadow-xs">
              <AppShell layout="default" className="h-72">
                <AppShellHeader height="sm" sticky={false}>
                  <div className="flex items-center justify-between w-full">
                    <span className="font-bold text-xs font-mono">AppShellHeader</span>
                    <Badge variant="outline" className="text-[10px]">Sticky Blur</Badge>
                  </div>
                </AppShellHeader>
                <AppShellMain fixed={false} className="p-4 bg-muted/10">
                  <AppShellInset padding="compact" maxWidth="xl">
                    <div className="p-6 rounded-lg border border-dashed border-border bg-card text-center space-y-2">
                      <p className="font-bold text-sm text-foreground">AppShellMain & Inset Container</p>
                      <p className="text-xs text-muted-foreground">
                        Responsive max-width boundaries with accessible skip link destination.
                      </p>
                    </div>
                  </AppShellInset>
                </AppShellMain>
                <AppShellFooter>
                  <div className="flex justify-between items-center text-xs text-muted-foreground font-mono">
                    <span>AppShellFooter</span>
                    <span>© 2026</span>
                  </div>
                </AppShellFooter>
              </AppShell>
            </div>
          </CardContent>
        </Card>
      </section>

      <section id="resizable" className="space-y-4 scroll-mt-20">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold text-foreground font-display flex items-center gap-2">
            <SidebarIcon className="h-6 w-6 text-highlight" />
            <span>Resizable Split Panels</span>
          </h2>
          <p className="text-sm text-muted-foreground">
            Drag-to-resize split panes powered by react-resizable-panels, supporting horizontal and vertical directions, drag handles, and keyboard accessibility.
          </p>
        </div>

        <Card>
          <CardContent className="p-6">
            <div className="h-64 rounded-xl border border-border overflow-hidden bg-card shadow-xs">
              <ResizablePanelGroup direction="horizontal">
                <ResizablePanel defaultSize="30%" minSize="20%">
                  <div className="flex h-full items-center justify-center p-6 bg-muted/10">
                    <span className="font-semibold text-xs text-muted-foreground font-mono">
                      Panel 1 (30%)
                    </span>
                  </div>
                </ResizablePanel>
                <ResizableHandle withHandle />
                <ResizablePanel defaultSize="45%">
                  <div className="flex h-full items-center justify-center p-6 bg-background">
                    <span className="font-semibold text-xs text-foreground font-mono">
                      Panel 2 (Drag handles to resize)
                    </span>
                  </div>
                </ResizablePanel>
                <ResizableHandle withHandle />
                <ResizablePanel defaultSize="25%" minSize="15%">
                  <div className="flex h-full items-center justify-center p-6 bg-muted/10">
                    <span className="font-semibold text-xs text-muted-foreground font-mono">
                      Panel 3 (25%)
                    </span>
                  </div>
                </ResizablePanel>
              </ResizablePanelGroup>
            </div>
          </CardContent>
        </Card>
      </section>

      <section id="tabs-accordion" className="space-y-4 scroll-mt-20">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold text-foreground font-display flex items-center gap-2">
            <LayoutGrid className="h-6 w-6 text-highlight" />
            <span>Tabs & Accordion</span>
          </h2>
          <p className="text-sm text-muted-foreground">
            Tabs navigation variants (pills, underline, enclosed) and collapsible accordion patterns for FAQ and disclosure workflows.
          </p>
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Tabs Navigation Variants
            </span>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Default (Pills)</CardTitle>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="overview" variant="default">
                    <TabsList className="w-full">
                      <TabsTrigger value="overview" className="flex-1">Overview</TabsTrigger>
                      <TabsTrigger value="analytics" className="flex-1">Analytics</TabsTrigger>
                    </TabsList>
                    <TabsContent value="overview" className="text-xs text-muted-foreground p-2">
                      Ringkasan performa sistem secara umum.
                    </TabsContent>
                    <TabsContent value="analytics" className="text-xs text-muted-foreground p-2">
                      Metrik detail dan conversion funnel.
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Underline</CardTitle>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="account" variant="underline">
                    <TabsList>
                      <TabsTrigger value="account">Account</TabsTrigger>
                      <TabsTrigger value="security">Security</TabsTrigger>
                      <TabsTrigger value="billing">Billing</TabsTrigger>
                    </TabsList>
                    <TabsContent value="account" className="text-xs text-muted-foreground pt-2">
                      Kelola profil publik dan avatar.
                    </TabsContent>
                    <TabsContent value="security" className="text-xs text-muted-foreground pt-2">
                      Pengaturan MFA dan session devices.
                    </TabsContent>
                    <TabsContent value="billing" className="text-xs text-muted-foreground pt-2">
                      Invoice riwayat dan kartu kredit.
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Enclosed (Boxed)</CardTitle>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="day" variant="enclosed">
                    <TabsList className="w-full">
                      <TabsTrigger value="day" className="flex-1">1 Day</TabsTrigger>
                      <TabsTrigger value="week" className="flex-1">1 Week</TabsTrigger>
                      <TabsTrigger value="month" className="flex-1">1 Month</TabsTrigger>
                    </TabsList>
                    <TabsContent value="day" className="text-xs text-muted-foreground p-2">
                      24-hour breakdown timeline.
                    </TabsContent>
                    <TabsContent value="week" className="text-xs text-muted-foreground p-2">
                      7-day aggregated trends.
                    </TabsContent>
                    <TabsContent value="month" className="text-xs text-muted-foreground p-2">
                      30-day billing volume.
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="space-y-2">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Accordion Variants
            </span>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Separated Variant (Card Style)
                </span>
                <Accordion type="single" collapsible defaultValue="faq-1" variant="separated">
                  <AccordionItem value="faq-1">
                    <AccordionTrigger className="px-4">
                      Bagaimana cara mengaktifkan Dark Mode?
                    </AccordionTrigger>
                    <AccordionContent className="px-4">
                      Design system mendukung OKLCH color tokens dengan parity light & dark mode otomatis via kelas CSS `.dark` atau data attribute `theme`.
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="faq-2">
                    <AccordionTrigger className="px-4">
                      Apakah mendukung keyboard navigation?
                    </AccordionTrigger>
                    <AccordionContent className="px-4">
                      Ya, semua komponen interaktif dibangun di atas Radix UI primitives yang memenuhi standar WCAG 2.1 AA (Tab, Space, Enter, Arrow keys).
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </div>

              <div className="space-y-2">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Bordered Variant (Flush)
                </span>
                <Accordion type="single" collapsible variant="bordered">
                  <AccordionItem value="item-1">
                    <AccordionTrigger>
                      Integrasi dengan Tailwind CSS v4
                    </AccordionTrigger>
                    <AccordionContent>
                      Menggunakan direct `@theme` directives di tokens.css tanpa overhead runtime konversi warna.
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="item-2">
                    <AccordionTrigger>
                      Testing Strategy & Vitest
                    </AccordionTrigger>
                    <AccordionContent>
                      Unit tests berjalan dengan Vitest + React Testing Library dengan coverage penuh untuk state & event handling.
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="collapsible-breadcrumb" className="space-y-4 scroll-mt-20">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold text-foreground font-display flex items-center gap-2">
            <ChevronDown className="h-6 w-6 text-highlight" />
            <span>Collapsible & Breadcrumb</span>
          </h2>
          <p className="text-sm text-muted-foreground">
            Accessible expand/collapse triggers with animated content, truncated breadcrumb navigation paths, and table sub-parts with caption and footer.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Breadcrumb Ellipsis</CardTitle>
              <CardDescription className="text-xs">
                Truncated navigation paths hiding intermediate segments.
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
                    <BreadcrumbPage>Layout & Navigation</BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </CardContent>
          </Card>
        </div>

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

      <section id="footer" className="space-y-4 scroll-mt-20">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold text-foreground font-display flex items-center gap-2">
            <Compass className="h-6 w-6 text-highlight" />
            <span>Footer System</span>
          </h2>
          <p className="text-sm text-muted-foreground">
            Multi-column marketing footers with external links, badges, legal text, and bottom bars.
          </p>
        </div>

        <Card>
          <CardContent className="p-6">
            <div className="rounded-xl border border-border overflow-hidden">
              <Footer variant="muted" spacing="compact">
                <FooterGrid columns={4}>
                  <FooterColumn title="Product">
                    <FooterLink href="#">Design Tokens</FooterLink>
                    <FooterLink href="#" badge="New">Components</FooterLink>
                    <FooterLink href="#">UX Scenarios</FooterLink>
                  </FooterColumn>
                  <FooterColumn title="Architecture">
                    <FooterLink href="#">Next.js 15</FooterLink>
                    <FooterLink href="#">Tailwind CSS v4</FooterLink>
                    <FooterLink href="#">NestJS Backend</FooterLink>
                  </FooterColumn>
                  <FooterColumn title="Resources">
                    <FooterLink href="#" external>Documentation</FooterLink>
                    <FooterLink href="#" external>GitHub</FooterLink>
                    <FooterLink href="#">Changelog</FooterLink>
                  </FooterColumn>
                  <FooterColumn title="Legal">
                    <FooterLink href="#">Privacy Policy</FooterLink>
                    <FooterLink href="#">Terms of Service</FooterLink>
                  </FooterColumn>
                </FooterGrid>
                <FooterBottom>
                  <p>© 2026 Design System Monorepo. All rights reserved.</p>
                  <div className="flex gap-4">
                    <a href="#" className="hover:underline">Status</a>
                    <a href="#" className="hover:underline">Security</a>
                  </div>
                </FooterBottom>
              </Footer>
            </div>
          </CardContent>
        </Card>
      </section>

      <section id="bottom-nav" className="space-y-4 scroll-mt-20">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold text-foreground font-display flex items-center gap-2">
            <Home className="h-6 w-6 text-highlight" />
            <span>Bottom Mobile Navigation & Drawer</span>
          </h2>
          <p className="text-sm text-muted-foreground">
            Touch-optimized mobile shell containers with safe-area padding, notification badges, active state indicators, and sheet drawer integration.
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
                <a href="#sidebar-system" className="text-sm font-medium hover:text-highlight">
                  Sidebar
                </a>
                <a href="#mega-menu" className="text-sm font-medium hover:text-highlight">
                  Mega Menu
                </a>
                <a href="#navbar" className="text-sm font-medium hover:text-highlight">
                  Navbar
                </a>
              </NavbarMobile>
            </div>

            <div className="w-full max-w-sm mx-auto rounded-2xl border border-border bg-card p-4 space-y-4 shadow-md">
              <p className="text-xs text-muted-foreground text-center font-mono">Mobile Viewport Preview</p>
              <div className="h-40 rounded-xl bg-muted/20 border border-dashed border-border flex items-center justify-center text-xs text-muted-foreground">
                Active: {activeBottomNav.toUpperCase()}
              </div>
              <div className="relative border-t border-border pt-2">
                <nav className="flex items-center justify-around">
                  <BottomNavItem
                    icon={Home}
                    label="Home"
                    active={activeBottomNav === 'home'}
                    onClick={() => setActiveBottomNav('home')}
                  />
                  <BottomNavItem
                    icon={Layers}
                    label="Leads"
                    badge={4}
                    active={activeBottomNav === 'leads'}
                    onClick={() => setActiveBottomNav('leads')}
                  />
                  <BottomNavItem
                    icon={Bell}
                    label="Alerts"
                    badge="9+"
                    active={activeBottomNav === 'alerts'}
                    onClick={() => setActiveBottomNav('alerts')}
                  />
                  <BottomNavItem
                    icon={Settings}
                    label="Config"
                    active={activeBottomNav === 'config'}
                    onClick={() => setActiveBottomNav('config')}
                  />
                </nav>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      <section id="menubar" className="space-y-4 scroll-mt-20">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold text-foreground font-display flex items-center gap-2">
            <Code2 className="h-6 w-6 text-highlight" />
            <span>Desktop Menubar</span>
          </h2>
          <p className="text-sm text-muted-foreground">
            Native OS-style top menu bar powered by Radix UI with submenus, keyboard shortcuts, and checkbox/radio items.
          </p>
        </div>

        <Card>
          <CardContent className="p-6">
            <Menubar className="max-w-md">
              <MenubarMenu>
                <MenubarTrigger>File</MenubarTrigger>
                <MenubarContent>
                  <MenubarItem>
                    New Lead <MenubarShortcut>⌘N</MenubarShortcut>
                  </MenubarItem>
                  <MenubarItem>
                    New Campaign <MenubarShortcut>⌘T</MenubarShortcut>
                  </MenubarItem>
                  <MenubarSeparator />
                  <MenubarItem>
                    Export CSV <MenubarShortcut>⇧⌘E</MenubarShortcut>
                  </MenubarItem>
                </MenubarContent>
              </MenubarMenu>

              <MenubarMenu>
                <MenubarTrigger>Edit</MenubarTrigger>
                <MenubarContent>
                  <MenubarItem>
                    Undo <MenubarShortcut>⌘Z</MenubarShortcut>
                  </MenubarItem>
                  <MenubarItem>
                    Redo <MenubarShortcut>⇧⌘Z</MenubarShortcut>
                  </MenubarItem>
                  <MenubarSeparator />
                  <MenubarSub>
                    <MenubarSubTrigger>Find</MenubarSubTrigger>
                    <MenubarSubContent>
                      <MenubarItem>Search Global</MenubarItem>
                      <MenubarItem>Filter View</MenubarItem>
                    </MenubarSubContent>
                  </MenubarSub>
                </MenubarContent>
              </MenubarMenu>

              <MenubarMenu>
                <MenubarTrigger>View</MenubarTrigger>
                <MenubarContent>
                  <MenubarItem>Show Copilot Drawer <MenubarShortcut>⌘J</MenubarShortcut></MenubarItem>
                  <MenubarItem>Command Palette <MenubarShortcut>⌘K</MenubarShortcut></MenubarItem>
                </MenubarContent>
              </MenubarMenu>
            </Menubar>
          </CardContent>
        </Card>
      </section>

      <section id="aspect-ratio-skip-link" className="space-y-4 scroll-mt-20">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold text-foreground font-display flex items-center gap-2">
            <ShieldCheck className="h-6 w-6 text-highlight" />
            <span>Aspect Ratio & Skip Link</span>
          </h2>
          <p className="text-sm text-muted-foreground">
            Media aspect ratio containers and accessibility bypass links.
          </p>
        </div>

        <Card>
          <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <p className="text-xs font-mono text-muted-foreground">AspectRatio (16/9)</p>
              <div className="overflow-hidden rounded-xl border border-border bg-muted/30">
                <AspectRatio ratio={16 / 9} className="flex items-center justify-center bg-gradient-to-br from-highlight/20 to-primary/20">
                  <div className="text-center space-y-1">
                    <Sparkles className="h-8 w-8 text-highlight mx-auto" />
                    <span className="text-xs font-mono font-bold">16:9 Aspect Ratio</span>
                  </div>
                </AspectRatio>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-mono text-muted-foreground">SkipLink (Press Tab to test)</p>
              <div className="p-6 rounded-xl border border-border bg-card space-y-3">
                <p className="text-xs text-muted-foreground">
                  Skip link is visually hidden until focused via keyboard Tab key, jumping directly to main content.
                </p>
                <SkipLink targetId="mega-menu" variant="default" />
                <div className="p-3 bg-muted/40 rounded-md text-xs font-mono">
                  &lt;SkipLink targetId=&quot;main-content&quot; /&gt;
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}