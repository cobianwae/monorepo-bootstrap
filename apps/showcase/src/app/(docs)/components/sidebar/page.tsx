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
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  TableOfContents,
  Separator,
  Banner,
} from '@ds/ui';

export default function SidebarPage() {
  const [activeItem, setActiveItem] = React.useState('dashboard');

  const tocHeadings = [
    { id: 'overview', text: 'Overview & Features', level: 2 },
    { id: 'standard-sidebar', text: 'Standard Sidebar Layout', level: 2 },
    { id: 'inset-layout', text: 'Inset Layout with Trigger', level: 2 },
    { id: 'icon-collapsed', text: 'Icon Collapsed Variant', level: 2 },
    { id: 'anatomy-api', text: 'Component Anatomy & API', level: 2 },
  ];

  return (
    <div className="space-y-12">
      <Banner variant="highlight" actionText="Explore Layouts" actionHref="#standard-sidebar">
        <strong>Enterprise Primitives:</strong> Multi-tier sidebar architecture with mobile sheet integration and responsive collapse states.
      </Banner>

      <PageHeader
        eyebrow="Layout & Navigation"
        eyebrowIcon={PanelLeft}
        title="Sidebar System"
        description="A composable, responsive sidebar layout system supporting icon collapse, floating and inset variants, mobile drawer sheets, and standardized keyboard navigation."
        actions={
          <div className="flex items-center gap-2">
            <Badge variant="highlight" className="font-mono text-xs">
              14 Composable Primitives
            </Badge>
            <Badge variant="outline" className="font-mono text-xs">
              WCAG AA Accessible
            </Badge>
          </div>
        }
      />

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
        {/* Main Content Area */}
        <div className="xl:col-span-9 space-y-12 min-w-0">
          {/* SECTION 1: OVERVIEW */}
          <section id="overview" className="space-y-4 scroll-mt-20">
            <div className="space-y-1">
              <h2 className="text-2xl font-bold text-foreground font-display flex items-center gap-2">
                <Sparkles className="h-6 w-6 text-highlight" />
                <span>Overview & Architecture</span>
              </h2>
              <p className="text-sm text-muted-foreground">
                The Sidebar component suite coordinates navigation hierarchies across desktop and mobile screens. It integrates seamlessly with Radix UI Sheet for mobile drawers and provides flexible grouping, active state styling, and nested actions.
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
          </section>

          {/* SECTION 2: STANDARD SIDEBAR */}
          <section id="standard-sidebar" className="space-y-4 scroll-mt-20">
            <div className="space-y-1">
              <h2 className="text-2xl font-bold text-foreground font-display flex items-center gap-2">
                <PanelLeft className="h-6 w-6 text-highlight" />
                <span>Standard Sidebar Layout</span>
              </h2>
              <p className="text-sm text-muted-foreground">
                Enterprise admin sidebar layout with header branding, workspace switchers, categorized navigation groups, and user profile footer.
              </p>
            </div>

            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-base">Interactive Sidebar Preview</CardTitle>
                <CardDescription>
                  Click menu items to switch active navigation state.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[460px] rounded-xl border border-border overflow-hidden flex bg-muted/10 shadow-xs">
                  {/* Standalone Sidebar Container */}
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

                  {/* Main Preview Content Area */}
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
          </section>

          {/* SECTION 3: INSET LAYOUT */}
          <section id="inset-layout" className="space-y-4 scroll-mt-20">
            <div className="space-y-1">
              <h2 className="text-2xl font-bold text-foreground font-display flex items-center gap-2">
                <Layers className="h-6 w-6 text-highlight" />
                <span>Inset Layout Pattern</span>
              </h2>
              <p className="text-sm text-muted-foreground">
                Modern elevated card inset styling where the primary content canvas floats within a container margin, with a top utility bar and sidebar trigger button.
              </p>
            </div>

            <Card>
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
          </section>

          {/* SECTION 4: ICON COLLAPSED */}
          <section id="icon-collapsed" className="space-y-4 scroll-mt-20">
            <div className="space-y-1">
              <h2 className="text-2xl font-bold text-foreground font-display flex items-center gap-2">
                <PanelLeft className="h-6 w-6 text-highlight" />
                <span>Icon-Only Collapsed Variant</span>
              </h2>
              <p className="text-sm text-muted-foreground">
                Compact 3.5rem (56px) sidebar state that hides labels and group headings while keeping icon touch targets fully accessible.
              </p>
            </div>

            <Card>
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
          </section>

          {/* SECTION 5: ANATOMY & API */}
          <section id="anatomy-api" className="space-y-4 scroll-mt-20">
            <div className="space-y-1">
              <h2 className="text-2xl font-bold text-foreground font-display flex items-center gap-2">
                <FileText className="h-6 w-6 text-highlight" />
                <span>Component Anatomy & API</span>
              </h2>
              <p className="text-sm text-muted-foreground">
                Overview of all primitives exported from `@ds/ui` for composing enterprise sidebar navigation.
              </p>
            </div>

            <Card>
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
        </div>

        {/* Sticky Table of Contents Sidebar */}
        <div className="hidden xl:block xl:col-span-3 sticky top-20">
          <Card className="p-4 bg-card/60 backdrop-blur-sm border-border">
            <TableOfContents headings={tocHeadings} title="Sidebar Navigation" />
          </Card>
        </div>
      </div>
    </div>
  );
}
