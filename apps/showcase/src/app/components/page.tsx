'use client';

import * as React from 'react';
import {
  Button,
  Badge,
  Input,
  Textarea,
  Label,
  Card,
  CardContent,
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  Alert,
  AlertTitle,
  AlertDescription,
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  Checkbox,
  Switch,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
  Separator,
  EmptyState,
  StatCard,
  Spinner,
  RadioGroup,
  RadioGroupItem,
  toast,
} from '@ds/ui';
import {
  AlertCircle,
  CheckCircle2,
  Info,
  AlertTriangle,
  Mail,
  Plus,
  Inbox,
  Users,
  Box,
} from 'lucide-react';
import { PageHeader } from '../../components/page-header';

const COMPONENT_SECTIONS = [
  { id: 'buttons', label: 'Buttons & Actions' },
  { id: 'badges', label: 'Badges & Status' },
  { id: 'forms', label: 'Form Controls' },
  { id: 'overlays', label: 'Modals & Overlays' },
  { id: 'alerts', label: 'Alerts & Feedback' },
  { id: 'composite', label: 'Composite Primitives' },
];

export default function ComponentsPage() {
  const [switchActive, setSwitchActive] = React.useState(true);
  const [checked, setChecked] = React.useState(true);
  const [activeSection, setActiveSection] = React.useState('buttons');

  return (
    <TooltipProvider>
      <div className="space-y-10 animate-in fade-in-50 duration-200">
        <PageHeader
          eyebrow="UI Library"
          eyebrowIcon={Box}
          title="Core UI Components Catalog"
          description="Accessible, composable UI primitives powered by Radix UI, class-variance-authority, and Tailwind CSS v4. Every component supports full keyboard interaction, focus rings, and dark mode parity."
        />

        {/* Sticky Quick-Jump Anchor Nav Bar */}
        <div className="sticky top-16 z-10 -mx-2 px-2 py-2.5 bg-background/90 backdrop-blur-md border-b border-border/80">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider shrink-0 pl-1">
              Jump To:
            </span>
            {COMPONENT_SECTIONS.map((sec) => (
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

        {/* Buttons Section */}
        <section id="buttons" className="space-y-4 scroll-mt-32">
          <h2 className="text-lg font-bold text-foreground">Buttons & Actions</h2>
          <Card className="border-border">
            <CardContent className="p-6 space-y-6">
              <div className="space-y-2">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Variants
                </span>
                <div className="flex flex-wrap items-center gap-3">
                  <Button variant="default">Primary</Button>
                  <Button variant="secondary">Secondary</Button>
                  <Button variant="outline">Outline</Button>
                  <Button variant="ghost">Ghost</Button>
                  <Button variant="link">Link</Button>
                  <Button variant="destructive">Destructive</Button>
                  <Button variant="success">Success</Button>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Sizes & Icons
                </span>
                <div className="flex flex-wrap items-center gap-3">
                  <Button size="sm">Small (sm)</Button>
                  <Button size="default">Default</Button>
                  <Button size="lg">Large (lg)</Button>
                  <Button size="default" className="gap-2">
                    <Mail className="h-4 w-4" />
                    With Icon
                  </Button>
                  <Button size="icon" variant="outline">
                    <Plus className="h-4 w-4" />
                  </Button>
                  <Button disabled>Disabled</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Badges Section */}
        <section id="badges" className="space-y-4 scroll-mt-32">
          <h2 className="text-lg font-bold text-foreground">Badges & Status Indicators</h2>
          <Card className="border-border">
            <CardContent className="p-6">
              <div className="flex flex-wrap items-center gap-3">
                <Badge variant="default">Default</Badge>
                <Badge variant="secondary">Secondary</Badge>
                <Badge variant="outline">Outline</Badge>
                <Badge variant="success">Active / Success</Badge>
                <Badge variant="warning">Pending / Warning</Badge>
                <Badge variant="destructive">Failed / Error</Badge>
                <Badge variant="info">Info Notice</Badge>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Form Controls Section */}
        <section id="forms" className="space-y-4 scroll-mt-32">
          <h2 className="text-lg font-bold text-foreground">Form Controls & Inputs</h2>
          <Card className="border-border">
            <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="input-default">Standard Input</Label>
                <Input id="input-default" placeholder="Enter full name..." />
              </div>

              <div className="space-y-2">
                <Label htmlFor="input-error" className="text-destructive">
                  Input with Error Validation
                </Label>
                <Input
                  id="input-error"
                  error
                  defaultValue="invalid-email-format"
                  placeholder="name@example.com"
                />
                <p className="text-xs text-destructive">Please enter a valid email address.</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="select-role">Select Menu</Label>
                <Select defaultValue="editor">
                  <SelectTrigger id="select-role">
                    <SelectValue placeholder="Choose a role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Administrator</SelectItem>
                    <SelectItem value="editor">Content Editor</SelectItem>
                    <SelectItem value="viewer">Read-Only Viewer</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="textarea-desc">Textarea Field</Label>
                <Textarea id="textarea-desc" placeholder="Provide brief notes..." rows={3} />
              </div>

              <div className="flex items-center space-x-3">
                <Checkbox
                  id="terms"
                  checked={checked}
                  onCheckedChange={(val) => setChecked(Boolean(val))}
                />
                <Label htmlFor="terms" className="cursor-pointer">
                  Accept enterprise terms and privacy policy
                </Label>
              </div>

              <div className="flex items-center justify-between rounded-lg border border-border p-3">
                <div className="space-y-0.5">
                  <Label htmlFor="notifs" className="text-sm cursor-pointer">
                    Push Notifications
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Receive alert emails for critical events
                  </p>
                </div>
                <Switch
                  id="notifs"
                  checked={switchActive}
                  onCheckedChange={setSwitchActive}
                />
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Overlays & Dialogs */}
        <section id="overlays" className="space-y-4 scroll-mt-32">
          <h2 className="text-lg font-bold text-foreground">Modals, Sheets & Tooltips</h2>
          <Card className="border-border">
            <CardContent className="p-6 flex flex-wrap items-center gap-4">
              {/* Dialog Modal */}
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline">Open Dialog Modal</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Confirm Workspace Deletion</DialogTitle>
                    <DialogDescription>
                      This action cannot be undone. All active projects and API keys will be immediately revoked.
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

              {/* Slide-out Sheet Drawer */}
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline">Open Side Sheet Drawer</Button>
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

              {/* Tooltip */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="secondary">Hover for Tooltip</Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Keyboard accessible hint (Escape to dismiss)</p>
                </TooltipContent>
              </Tooltip>
            </CardContent>
          </Card>
        </section>

        {/* Feedback Alerts */}
        <section id="alerts" className="space-y-4 scroll-mt-32">
          <h2 className="text-lg font-bold text-foreground">Alerts & Banners</h2>
          <div className="space-y-3">
            <Alert variant="default">
              <Info className="h-4 w-4" />
              <AlertTitle>Information Notice</AlertTitle>
              <AlertDescription>
                System maintenance scheduled for Sunday at 02:00 UTC.
              </AlertDescription>
            </Alert>

            <Alert variant="success">
              <CheckCircle2 className="h-4 w-4" />
              <AlertTitle>Deployment Completed</AlertTitle>
              <AlertDescription>
                Production cluster has updated to release v2.4.0 without downtime.
              </AlertDescription>
            </Alert>

            <Alert variant="warning">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>API Rate Limit Approaching</AlertTitle>
              <AlertDescription>
                You have consumed 85% of your allocated monthly API requests.
              </AlertDescription>
            </Alert>

            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Authentication Error</AlertTitle>
              <AlertDescription>
                Invalid security signature provided. Please re-authenticate your session.
              </AlertDescription>
            </Alert>
          </div>
        </section>

        {/* Radio Group & Spinners Demo */}
        <section id="inputs-advanced" className="space-y-4 scroll-mt-32">
          <h2 className="text-lg font-bold text-foreground">Radio Groups & Activity Spinners</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border-border">
              <CardContent className="p-6 space-y-4">
                <p className="text-sm font-medium text-muted-foreground">Radio Group Component</p>
                <RadioGroup defaultValue="comfortable">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="compact" id="r1" />
                    <Label htmlFor="r1">Compact Density</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="comfortable" id="r2" />
                    <Label htmlFor="r2">Comfortable (Default)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="spacious" id="r3" />
                    <Label htmlFor="r3">Spacious Density</Label>
                  </div>
                </RadioGroup>
              </CardContent>
            </Card>

            <Card className="border-border">
              <CardContent className="p-6 space-y-4">
                <p className="text-sm font-medium text-muted-foreground">Activity Spinners with ARIA busy</p>
                <div className="flex items-center gap-6 pt-2">
                  <Spinner size="sm" variant="primary" label="Small spinner" />
                  <Spinner size="default" variant="success" label="Default spinner" />
                  <Spinner size="md" variant="destructive" label="Medium spinner" />
                  <Spinner size="lg" variant="default" label="Large spinner" />
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Custom Craft Components: Empty State & Stat Card */}
        <section id="composite" className="space-y-4 scroll-mt-32">
          <h2 className="text-lg font-bold text-foreground">High-Craft Composite Components</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Stat Card */}
            <StatCard
              title="Total Active Members"
              value="12,840"
              delta={{ value: '+14.2%', trend: 'up', label: 'vs previous quarter' }}
              icon={Users}
            />

            {/* Empty State */}
            <EmptyState
              icon={Inbox}
              title="No Pending Requests"
              description="You have cleared all pending review requests. Great job!"
              actionLabel="Create New Request"
              onAction={() =>
                toast({
                  variant: 'success',
                  title: 'Request Created',
                  description: 'New review ticket has been dispatched.',
                })
              }
            />
          </div>
        </section>
      </div>
    </TooltipProvider>
  );
}
