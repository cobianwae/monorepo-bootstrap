'use client';

import * as React from 'react';
import {
  Layers,
  Sparkles,
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
  Home,
  Settings,
  Bell,
} from 'lucide-react';
import {
  PageHeader,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Button,
  Badge,
  AppShell,
  AppShellHeader,
  AppShellMain,
  AppShellInset,
  AppShellFooter,
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
  AspectRatio,
  SkipLink,
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
  Footer,
  FooterGrid,
  FooterColumn,
  FooterLink,
  FooterBottom,
  BottomNavItem,
  TableOfContents,
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
  Banner,
} from '@ds/ui';

export default function LayoutNavPage() {
  const [activeBottomNav, setActiveBottomNav] = React.useState('home');

  const tocHeadings = [
    { id: 'mega-menu', text: 'Mega Menu', level: 2 },
    { id: 'navbar', text: 'Navbar & Header', level: 2 },
    { id: 'app-shell', text: 'AppShell & Layouts', level: 2 },
    { id: 'resizable', text: 'Resizable Panels', level: 2 },
    { id: 'footer', text: 'Footer System', level: 2 },
    { id: 'bottom-nav', text: 'Bottom Mobile Navigation', level: 2 },
    { id: 'menubar', text: 'Menubar Primitive', level: 2 },
    { id: 'primitives', text: 'Aspect Ratio & Skip Link', level: 2 },
  ];

  return (
    <div className="space-y-12">
      <Banner variant="highlight" actionText="View Changelog" actionHref="#mega-menu">
        <strong>New in v2.2:</strong> Complete Layout Primitives, Mega Menus & Marketing Blocks!
      </Banner>

      <PageHeader
        eyebrow="Architecture & Layout"
        eyebrowIcon={Layers}
        title="Layout & Navigation Primitives"
        description="Comprehensive layout containers, responsive app shells, mega menus, split resizable panels, and navigation primitives built with Radix and Tailwind CSS."
        actions={
          <div className="flex items-center gap-2">
            <Badge variant="highlight" className="font-mono text-xs">
              8 New Primitives
            </Badge>
          </div>
        }
      />

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
        {/* Main Content Area */}
        <div className="xl:col-span-9 space-y-12 min-w-0">
          {/* SECTION 1: MEGA MENU */}
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

          {/* SECTION 2: NAVBAR */}
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

          {/* SECTION 3: APPSHELL */}
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

          {/* SECTION 4: RESIZABLE PANELS */}
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
                    <ResizablePanel defaultSize={30} minSize={20}>
                      <div className="flex h-full items-center justify-center p-6 bg-muted/10">
                        <span className="font-semibold text-xs text-muted-foreground font-mono">
                          Panel 1 (30%)
                        </span>
                      </div>
                    </ResizablePanel>
                    <ResizableHandle withHandle />
                    <ResizablePanel defaultSize={45}>
                      <div className="flex h-full items-center justify-center p-6 bg-background">
                        <span className="font-semibold text-xs text-foreground font-mono">
                          Panel 2 (Drag handles to resize)
                        </span>
                      </div>
                    </ResizablePanel>
                    <ResizableHandle withHandle />
                    <ResizablePanel defaultSize={25} minSize={15}>
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

          {/* SECTION 5: FOOTER */}
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

          {/* SECTION 6: BOTTOM NAV */}
          <section id="bottom-nav" className="space-y-4 scroll-mt-20">
            <div className="space-y-1">
              <h2 className="text-2xl font-bold text-foreground font-display flex items-center gap-2">
                <Home className="h-6 w-6 text-highlight" />
                <span>Bottom Mobile Navigation</span>
              </h2>
              <p className="text-sm text-muted-foreground">
                Fixed mobile bottom navigation bar with notification badges and active state indicators.
              </p>
            </div>

            <Card>
              <CardContent className="p-6 flex justify-center">
                <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-4 space-y-4 shadow-md">
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

          {/* SECTION 7: MENUBAR */}
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

          {/* SECTION 8: PRIMITIVES */}
          <section id="primitives" className="space-y-4 scroll-mt-20">
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

        {/* Sticky Table of Contents Sidebar */}
        <div className="hidden xl:block xl:col-span-3 sticky top-20">
          <Card className="p-4 bg-card/60 backdrop-blur-sm border-border">
            <TableOfContents headings={tocHeadings} title="Layout Navigation" />
          </Card>
        </div>
      </div>
    </div>
  );
}
