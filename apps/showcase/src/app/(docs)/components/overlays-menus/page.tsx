'use client';

import * as React from 'react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Button,
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
  Input,
  Label,
  Separator,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
  Popover,
  PopoverTrigger,
  PopoverContent,
  HoverCard,
  HoverCardTrigger,
  HoverCardContent,
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuSeparator,
  ContextMenuCheckboxItem,
  ContextMenuSub,
  ContextMenuSubTrigger,
  ContextMenuSubContent,
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuGroup,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  CommandPalette,
  type CommandPaletteGroup,
  openCommandPalette,
  Banner,
  ToastAction,
  toast,
  Avatar,
  AvatarImage,
  AvatarFallback,
} from '@ds/ui';
import {
  Settings2,
  FolderLock,
  Trash2,
  AlertTriangle,
  RotateCcw,
  SlidersHorizontal,
  MessageSquare,
  AtSign,
  MousePointer2,
  MoreHorizontal,
  HelpCircle,
  Command,
  Megaphone,
  Bell,
  Sparkles,
  Pencil,
  Copy,
  Share2,
  UserRound,
  Palette,
  FolderOpen,
  FileText,
  Sun,
  Moon,
} from 'lucide-react';
import { PageHeader } from '@ds/ui';

const SECTIONS = [
  { id: 'dialogs', label: 'Dialogs' },
  { id: 'alert-dialog', label: 'Alert Dialog' },
  { id: 'sheets', label: 'Sheets' },
  { id: 'popover', label: 'Popover' },
  { id: 'hover-card', label: 'Hover Card' },
  { id: 'context-menu', label: 'Context Menu' },
  { id: 'dropdown-menu', label: 'Dropdown Menu' },
  { id: 'tooltip', label: 'Tooltip' },
  { id: 'command-palette', label: 'Command Palette' },
  { id: 'banner', label: 'Banner' },
  { id: 'toast-triggers', label: 'Toast Feedback' },
];

export default function OverlaysMenusPage() {
  const [dbNameInput, setDbNameInput] = React.useState('');
  const [activeSection, setActiveSection] = React.useState('dialogs');
  const [showBookmarks, setShowBookmarks] = React.useState(true);
  const [showFullUrls, setShowFullUrls] = React.useState(false);
  const [sortOrder, setSortOrder] = React.useState('recent');
  const targetDb = 'production-db-v1';

  const triggerSuccessToast = () => {
    toast({
      variant: 'success',
      title: 'Item archived',
      description: 'Invoice #INV-2025-09 was moved to trash.',
      action: (
        <ToastAction
          altText="Undo operation"
          onClick={() => {
            toast({
              title: 'Action Undone',
              description: 'Invoice #INV-2025-09 was restored to active items.',
              variant: 'info',
            });
          }}
        >
          <RotateCcw className="h-3 w-3 mr-1" />
          Undo
        </ToastAction>
      ),
    });
  };

  const triggerErrorToast = () => {
    toast({
      variant: 'destructive',
      title: 'Database connection failed',
      description: 'Connection timed out after 30 seconds. Click to retry.',
      action: (
        <ToastAction
          altText="Retry request"
          onClick={() => {
            toast({
              title: 'Reconnecting...',
              description: 'Attempting to re-establish pool connection.',
              variant: 'info',
            });
          }}
        >
          Retry
        </ToastAction>
      ),
    });
  };

  const triggerInfoToast = () => {
    toast({
      variant: 'info',
      title: 'Design tokens synchronized',
      description: 'All OKLCH semantic tokens updated to version 1.4.',
    });
  };

  const commandGroups: CommandPaletteGroup[] = [
    {
      heading: 'Actions',
      items: [
        {
          id: 'action-create',
          label: 'Create new project',
          description: 'Start from a blank canvas',
          icon: FolderOpen,
          keywords: ['new', 'project', 'add', 'create'],
          shortcut: '⌘N',
          onSelect: () =>
            toast({
              variant: 'success',
              title: 'New project created',
              description: 'Blank canvas scaffolded for you.',
            }),
        },
        {
          id: 'action-export',
          label: 'Export design tokens',
          description: 'Sync OKLCH tokens to packages',
          icon: FileText,
          keywords: ['tokens', 'export', 'sync', 'oklch'],
          onSelect: () =>
            toast({
              variant: 'success',
              title: 'Tokens exported',
              description: 'OKLCH semantic tokens synced to v1.4.',
            }),
        },
      ],
    },
    {
      heading: 'Appearance',
      items: [
        {
          id: 'appearance-light',
          label: 'Switch to light mode',
          icon: Sun,
          keywords: ['theme', 'light', 'appearance', 'mode'],
          onSelect: () => toast({ variant: 'info', title: 'Light mode selected' }),
        },
        {
          id: 'appearance-dark',
          label: 'Switch to dark mode',
          icon: Moon,
          keywords: ['theme', 'dark', 'appearance', 'mode'],
          onSelect: () => toast({ variant: 'info', title: 'Dark mode selected' }),
        },
        {
          id: 'appearance-art',
          label: 'Set art direction: Aurora',
          icon: Palette,
          keywords: ['art', 'direction', 'palette', 'theme'],
          onSelect: () => toast({ variant: 'info', title: 'Aurora art direction applied' }),
        },
      ],
    },
  ];

  return (
    <TooltipProvider>
      <div className="space-y-12 animate-in fade-in-50 duration-200">
        <Banner variant="highlight" actionText="Jump to Triggers" actionHref="#toast-triggers">
          <strong>Overlays &amp; Menus:</strong> All modal, drawer, popover, menu, tooltip, command
          palette, banner, and toast feedback components consolidated in one category page.
        </Banner>

        <PageHeader
          eyebrow="Overlays & Menus"
          eyebrowIcon={Sparkles}
          title="Overlays, Menus & Feedback Triggers"
          description="Accessible layered UI built on Radix primitives: confirmation and alert dialogs, slide-out drawers, popovers, hover cards, context and dropdown menus, tooltips, a command palette, banners, and centralized toast feedback."
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

        <section id="dialogs" className="space-y-4 scroll-mt-20">
          <h2 className="text-2xl font-bold text-foreground font-display flex items-center gap-2">
            <Settings2 className="h-6 w-6 text-primary" />
            <span>Dialogs &amp; Content Modals</span>
          </h2>
          <p className="text-sm text-muted-foreground">
            Standard modal dialogs with interactive form elements, accessible focus trap, and
            escape-dismiss behavior for content and settings flows.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border-border">
              <CardHeader>
                <CardTitle className="text-base">Content &amp; Settings Dialog</CardTitle>
                <CardDescription className="text-xs">
                  Standard modal dialog with interactive form elements and accessible focus trap.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="secondary" className="gap-2">
                      <FolderLock className="h-4 w-4" />
                      Edit Security Permissions
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Workspace Access Permissions</DialogTitle>
                      <DialogDescription>
                        Manage team member role assignments and API access tokens.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-3 py-2">
                      <div className="space-y-1.5">
                        <Label htmlFor="workspace-name">Workspace Name</Label>
                        <Input id="workspace-name" defaultValue="Core Design Engineering" />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="admin-email">Admin Contact</Label>
                        <Input id="admin-email" defaultValue="lead-engineer@design-system.io" />
                      </div>
                    </div>
                    <DialogFooter>
                      <DialogClose asChild>
                        <Button variant="outline">Cancel</Button>
                      </DialogClose>
                      <DialogClose asChild>
                        <Button
                          onClick={() =>
                            toast({
                              variant: 'success',
                              title: 'Permissions Saved',
                              description: 'Workspace security settings updated successfully.',
                            })
                          }
                        >
                          Save Changes
                        </Button>
                      </DialogClose>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>

            <Card className="border-border">
              <CardHeader>
                <CardTitle className="text-base">Destructive Confirmation Modal</CardTitle>
                <CardDescription className="text-xs">
                  Modal confirmation for irreversible workspace-level actions.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="gap-2">
                      <Trash2 className="h-4 w-4" />
                      Delete Workspace
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Confirm Workspace Deletion</DialogTitle>
                      <DialogDescription>
                        This action cannot be undone. All active projects and API keys will be
                        immediately revoked.
                      </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                      <DialogClose asChild>
                        <Button variant="outline">Cancel</Button>
                      </DialogClose>
                      <DialogClose asChild>
                        <Button
                          variant="destructive"
                          onClick={() =>
                            toast({
                              variant: 'destructive',
                              title: 'Workspace Deleted',
                              description: 'All assets and credentials were permanently revoked.',
                            })
                          }
                        >
                          Delete Workspace
                        </Button>
                      </DialogClose>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>
          </div>
        </section>

        <section id="alert-dialog" className="space-y-4 scroll-mt-20">
          <h2 className="text-2xl font-bold text-foreground font-display flex items-center gap-2">
            <AlertTriangle className="h-6 w-6 text-primary" />
            <span>Destructive Alert Dialog</span>
          </h2>
          <p className="text-sm text-muted-foreground">
            WCAG-conforming alertdialog requiring deliberate user confirmation for irreversible
            operations, with a type-to-confirm guard rail.
          </p>
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="text-base">Destructive Alert Dialog (WCAG Conforming)</CardTitle>
              <CardDescription className="text-xs">
                Modal requiring deliberate user confirmation for irreversible operations with proper
                alertdialog role.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" className="gap-2">
                    <Trash2 className="h-4 w-4" />
                    Delete Project Database
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will permanently delete the <strong>{targetDb}</strong> database and
                      remove all 48,200 records. This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-3 text-xs text-destructive">
                    <div className="flex items-center gap-1.5 font-medium mb-1">
                      <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                      <span>Type &quot;{targetDb}&quot; to confirm deletion:</span>
                    </div>
                    <Input
                      placeholder={targetDb}
                      value={dbNameInput}
                      onChange={(e) => setDbNameInput(e.target.value)}
                      className="mt-2"
                    />
                  </div>
                  <AlertDialogFooter>
                    <AlertDialogCancel onClick={() => setDbNameInput('')}>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      variant="destructive"
                      disabled={dbNameInput !== targetDb}
                      onClick={() => {
                        setDbNameInput('');
                        toast({
                          variant: 'destructive',
                          title: 'Database Purged',
                          description: `Database "${targetDb}" was scheduled for immediate purge.`,
                        });
                      }}
                    >
                      Confirm Deletion
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </CardContent>
          </Card>
        </section>

        <section id="sheets" className="space-y-4 scroll-mt-20">
          <h2 className="text-2xl font-bold text-foreground font-display flex items-center gap-2">
            <SlidersHorizontal className="h-6 w-6 text-primary" />
            <span>Sheets &amp; Drawers</span>
          </h2>
          <p className="text-sm text-muted-foreground">
            Non-modal side drawers for complex configurations and preference management without
            losing page context.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border-border">
              <CardHeader>
                <CardTitle className="text-base">Filter &amp; Configuration Drawer</CardTitle>
                <CardDescription className="text-xs">
                  Non-modal side drawer for complex configurations without losing page context.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="outline" className="gap-2">
                      <SlidersHorizontal className="h-4 w-4" />
                      Open Filter Drawer
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="right">
                    <SheetHeader>
                      <SheetTitle>Filter Analytics Data</SheetTitle>
                      <SheetDescription>
                        Configure dimensions, metric aggregations, and date ranges.
                      </SheetDescription>
                    </SheetHeader>
                    <div className="py-6 space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="traffic-source">Traffic Source</Label>
                        <Input id="traffic-source" placeholder="e.g. Google Organic, Direct" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="min-conversion">Minimum Conversion Value ($)</Label>
                        <Input id="min-conversion" type="number" defaultValue="500" />
                      </div>
                    </div>
                    <SheetFooter>
                      <Button
                        className="w-full"
                        onClick={() =>
                          toast({
                            variant: 'success',
                            title: 'Filters Applied',
                            description: 'Showing filtered dataset for 14,200 events.',
                          })
                        }
                      >
                        Apply Filters
                      </Button>
                    </SheetFooter>
                  </SheetContent>
                </Sheet>
              </CardContent>
            </Card>

            <Card className="border-border">
              <CardHeader>
                <CardTitle className="text-base">User Preferences Drawer</CardTitle>
                <CardDescription className="text-xs">
                  Slide-out sheet for lightweight account and notification settings.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="outline" className="gap-2">
                      <Settings2 className="h-4 w-4" />
                      Open Preferences
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="right">
                    <SheetHeader>
                      <SheetTitle>User Preferences</SheetTitle>
                      <SheetDescription>
                        Manage notification preferences and security keys.
                      </SheetDescription>
                    </SheetHeader>
                    <div className="py-6 space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="pref-name">Display Name</Label>
                        <Input id="pref-name" defaultValue="Alex Rivers" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="pref-email">Email</Label>
                        <Input id="pref-email" defaultValue="alex@company.com" disabled />
                      </div>
                    </div>
                  </SheetContent>
                </Sheet>
              </CardContent>
            </Card>
          </div>
        </section>

        <section id="popover" className="space-y-4 scroll-mt-20">
          <h2 className="text-2xl font-bold text-foreground font-display flex items-center gap-2">
            <MessageSquare className="h-6 w-6 text-primary" />
            <span>Popover</span>
          </h2>
          <p className="text-sm text-muted-foreground">
            Dismissible floating panel anchored to a trigger, ideal for lightweight settings and
            contextual forms that do not require modal focus trapping.
          </p>
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="text-base">Settings Popover</CardTitle>
              <CardDescription className="text-xs">
                Focus-managed popover with a small form, closing on outside click or Escape.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="gap-2">
                    <Settings2 className="h-4 w-4" />
                    Open Settings
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80">
                  <div className="grid gap-4">
                    <div className="space-y-2">
                      <h4 className="font-medium leading-none">Dimensions</h4>
                      <p className="text-sm text-muted-foreground">
                        Set the dimensions for the active layer.
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <Label htmlFor="popover-width">Width</Label>
                        <Input id="popover-width" defaultValue="100%" />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="popover-maxwidth">Max width</Label>
                        <Input id="popover-maxwidth" defaultValue="300px" />
                      </div>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            </CardContent>
          </Card>
        </section>

        <section id="hover-card" className="space-y-4 scroll-mt-20">
          <h2 className="text-2xl font-bold text-foreground font-display flex items-center gap-2">
            <UserRound className="h-6 w-6 text-primary" />
            <span>Hover Card</span>
          </h2>
          <p className="text-sm text-muted-foreground">
            Rich preview card that appears on hover or focus, giving contextual user and entity
            details without navigating away.
          </p>
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="text-base">User Profile Hover Card</CardTitle>
              <CardDescription className="text-xs">
                Hover or focus the mention to preview the profile card with a 400ms open delay.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <HoverCard>
                <HoverCardTrigger asChild>
                  <Button variant="link" className="gap-2 px-0 text-foreground">
                    <AtSign className="h-4 w-4" />
                    @alexrivers
                  </Button>
                </HoverCardTrigger>
                <HoverCardContent className="w-80">
                  <div className="flex justify-between space-x-4">
                    <Avatar>
                      <AvatarImage src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150" />
                      <AvatarFallback>AR</AvatarFallback>
                    </Avatar>
                    <div className="space-y-1">
                      <h4 className="text-sm font-semibold">Alex Rivers</h4>
                      <p className="text-sm text-muted-foreground">
                        Design engineer building accessible UI foundations at Acme Inc.
                      </p>
                      <div className="flex items-center pt-2">
                        <span className="text-xs text-muted-foreground">
                          Joined December 2024 · 128 contributions
                        </span>
                      </div>
                    </div>
                  </div>
                  <Separator className="my-3" />
                  <p className="text-xs text-muted-foreground">
                    Keyboard focus also opens the card, keeping the pattern accessible.
                  </p>
                </HoverCardContent>
              </HoverCard>
            </CardContent>
          </Card>
        </section>

        <section id="context-menu" className="space-y-4 scroll-mt-20">
          <h2 className="text-2xl font-bold text-foreground font-display flex items-center gap-2">
            <MousePointer2 className="h-6 w-6 text-primary" />
            <span>Context Menu</span>
          </h2>
          <p className="text-sm text-muted-foreground">
            Right-click menu with checkbox items and nested submenus, fully keyboard navigable via
            the context menu key.
          </p>
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="text-base">Right-Click Actions</CardTitle>
              <CardDescription className="text-xs">
                Right-click (or context-menu key) inside the dashed zone to open the menu.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ContextMenu>
                <ContextMenuTrigger asChild>
                  <div className="rounded-lg border-2 border-dashed border-border p-10 text-center text-sm text-muted-foreground select-none cursor-context-menu">
                    Right-click anywhere in this zone to open the context menu
                  </div>
                </ContextMenuTrigger>
                <ContextMenuContent className="w-64">
                  <ContextMenuItem inset onSelect={() => toast({ title: 'Navigated back' })}>
                    Back
                  </ContextMenuItem>
                  <ContextMenuItem inset disabled>
                    Forward
                  </ContextMenuItem>
                  <ContextMenuItem inset onSelect={() => toast({ title: 'Page reloaded' })}>
                    Reload
                  </ContextMenuItem>
                  <ContextMenuSub>
                    <ContextMenuSubTrigger inset>More Tools</ContextMenuSubTrigger>
                    <ContextMenuSubContent className="w-48">
                      <ContextMenuItem onSelect={() => toast({ title: 'Saved page as PDF' })}>
                        Save Page As...
                      </ContextMenuItem>
                      <ContextMenuItem onSelect={() => toast({ title: 'Source opened' })}>
                        View Page Source
                      </ContextMenuItem>
                    </ContextMenuSubContent>
                  </ContextMenuSub>
                  <ContextMenuSeparator />
                  <ContextMenuCheckboxItem
                    checked={showBookmarks}
                    onCheckedChange={(val) => setShowBookmarks(Boolean(val))}
                  >
                    Show Bookmarks Bar
                  </ContextMenuCheckboxItem>
                  <ContextMenuCheckboxItem
                    checked={showFullUrls}
                    onCheckedChange={(val) => setShowFullUrls(Boolean(val))}
                  >
                    Show Full URLs
                  </ContextMenuCheckboxItem>
                  <ContextMenuSeparator />
                  <ContextMenuLabel>Developer</ContextMenuLabel>
                  <ContextMenuItem
                    variant="destructive"
                    onSelect={() =>
                      toast({
                        variant: 'destructive',
                        title: 'Service worker unregistered',
                      })
                    }
                  >
                    Clear Site Data
                  </ContextMenuItem>
                </ContextMenuContent>
              </ContextMenu>
            </CardContent>
          </Card>
        </section>

        <section id="dropdown-menu" className="space-y-4 scroll-mt-20">
          <h2 className="text-2xl font-bold text-foreground font-display flex items-center gap-2">
            <MoreHorizontal className="h-6 w-6 text-primary" />
            <span>Dropdown Menu</span>
          </h2>
          <p className="text-sm text-muted-foreground">
            Click-triggered action menu with grouped items, separator, nested submenu, and a radio
            group for single-choice state.
          </p>
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="text-base">Account Actions Menu</CardTitle>
              <CardDescription className="text-xs">
                Menu items, a share submenu, and a radio group for sort ordering.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="gap-2">
                    <MoreHorizontal className="h-4 w-4" />
                    Open Actions Menu
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuGroup>
                    <DropdownMenuItem
                      onSelect={() => toast({ title: 'Profile editor opened' })}
                      className="gap-2"
                    >
                      <Pencil className="h-4 w-4" />
                      Edit Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onSelect={() => toast({ variant: 'success', title: 'Link copied' })}
                      className="gap-2"
                    >
                      <Copy className="h-4 w-4" />
                      Copy Link
                    </DropdownMenuItem>
                    <DropdownMenuItem disabled className="gap-2">
                      <Trash2 className="h-4 w-4" />
                      Delete Account
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator />
                  <DropdownMenuSub>
                    <DropdownMenuSubTrigger className="gap-2">
                      <Share2 className="h-4 w-4" />
                      Share
                    </DropdownMenuSubTrigger>
                    <DropdownMenuSubContent>
                      <DropdownMenuItem onSelect={() => toast({ title: 'Shared via email' })}>
                        Email
                      </DropdownMenuItem>
                      <DropdownMenuItem onSelect={() => toast({ title: 'Shared via message' })}>
                        Message
                      </DropdownMenuItem>
                    </DropdownMenuSubContent>
                  </DropdownMenuSub>
                  <DropdownMenuSeparator />
                  <DropdownMenuRadioGroup value={sortOrder} onValueChange={setSortOrder}>
                    <DropdownMenuLabel inset>Sort By</DropdownMenuLabel>
                    <DropdownMenuRadioItem value="recent">Most Recent</DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="name">Name</DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="size">Size</DropdownMenuRadioItem>
                  </DropdownMenuRadioGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </CardContent>
          </Card>
        </section>

        <section id="tooltip" className="space-y-4 scroll-mt-20">
          <h2 className="text-2xl font-bold text-foreground font-display flex items-center gap-2">
            <HelpCircle className="h-6 w-6 text-primary" />
            <span>Tooltip</span>
          </h2>
          <p className="text-sm text-muted-foreground">
            Compact hints that appear on hover and keyboard focus, dismissible with Escape and
            screen-reader friendly.
          </p>
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="text-base">Keyboard Accessible Hints</CardTitle>
              <CardDescription className="text-xs">
                Hover or tab-focus each trigger to reveal its tooltip.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap items-center gap-4">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="secondary">Hover for Tooltip</Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Keyboard accessible hint (Escape to dismiss)</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" className="gap-2">
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Irreversible action — archives the selected record</p>
                </TooltipContent>
              </Tooltip>
            </CardContent>
          </Card>
        </section>

        <section id="command-palette" className="space-y-4 scroll-mt-20">
          <h2 className="text-2xl font-bold text-foreground font-display flex items-center gap-2">
            <Command className="h-6 w-6 text-primary" />
            <span>Command Palette</span>
          </h2>
          <p className="text-sm text-muted-foreground">
            Keyboard-driven dialog for searching and executing actions, navigable with arrow keys
            and Enter, and opened with ⌘K / Ctrl+K.
          </p>
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="text-base">Self-Contained Command Palette</CardTitle>
              <CardDescription className="text-xs">
                The palette mounts its own dialog and registers the global ⌘K / Ctrl+K shortcut.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap items-center gap-3">
              <Button variant="default" className="gap-2" onClick={openCommandPalette}>
                <Command className="h-4 w-4" />
                Open Command Palette
              </Button>
              <span className="text-xs text-muted-foreground">
                Press ⌘K / Ctrl+K anywhere on this page
              </span>
            </CardContent>
          </Card>
          <CommandPalette groups={commandGroups} />
        </section>

        <section id="banner" className="space-y-4 scroll-mt-20">
          <h2 className="text-2xl font-bold text-foreground font-display flex items-center gap-2">
            <Megaphone className="h-6 w-6 text-primary" />
            <span>Banner</span>
          </h2>
          <p className="text-sm text-muted-foreground">
            Page-level announcement strips with optional action links and dismissible state that can
            persist via storage key.
          </p>
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="text-base">Banner Variants</CardTitle>
              <CardDescription className="text-xs">
                Highlight and info variants; each banner is individually dismissible.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg border border-border overflow-hidden">
                <Banner
                  variant="highlight"
                  icon={Megaphone}
                  actionText="View Alert Dialog"
                  actionHref="#alert-dialog"
                >
                  Deprecation notice: raw alert banners are being replaced by the new Banner
                  primitive.
                </Banner>
              </div>
              <div className="rounded-lg border border-border overflow-hidden">
                <Banner
                  variant="info"
                  icon={Bell}
                  actionText="Open Palette"
                  actionHref="#command-palette"
                >
                  Tip: press ⌘K to open the command palette from anywhere.
                </Banner>
              </div>
            </CardContent>
          </Card>
        </section>

        <section id="toast-triggers" className="space-y-4 scroll-mt-20">
          <h2 className="text-2xl font-bold text-foreground font-display flex items-center gap-2">
            <Bell className="h-6 w-6 text-primary" />
            <span>Toast Feedback Triggers</span>
          </h2>
          <p className="text-sm text-muted-foreground">
            Simulate stackable notifications with persistent errors and undo action support via the
            centralized toast system.
          </p>
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="text-base">Centralized Toast Feedback Triggers</CardTitle>
              <CardDescription className="text-xs">
                Simulate stackable notifications with persistent errors and undo action support.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap items-center gap-3">
              <Button variant="outline" onClick={triggerSuccessToast}>
                Success Toast (with Undo)
              </Button>
              <Button variant="outline" onClick={triggerErrorToast}>
                Error Toast (with Retry)
              </Button>
              <Button variant="outline" onClick={triggerInfoToast}>
                Info Notification
              </Button>
            </CardContent>
          </Card>
        </section>
      </div>
    </TooltipProvider>
  );
}