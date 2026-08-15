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
  ToastAction,
  toast,
} from '@ds/ui';
import {
  Trash2,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  SlidersHorizontal,
  FolderLock,
} from 'lucide-react';
import { PageHeader } from '../../../components/page-header';

export default function OverlaysPatternPage() {
  const [dbNameInput, setDbNameInput] = React.useState('');
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

  return (
    <div className="space-y-10 animate-in fade-in-50 duration-200">
      <PageHeader
        eyebrow="UX Recipe Scenario"
        eyebrowIcon={Sparkles}
        title="Overlays, Drawers & Toast Feedback"
        description="Comprehensive overlay orchestration: confirmation modals, accessible alert dialogs, slide-out drawer sheets, and centralized toast feedback system."
      />

      {/* Grid of Interactive Trigger Blocks */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Destructive Alert Dialog Scenario */}
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="text-base">Destructive Alert Dialog (WCAG Conforming)</CardTitle>
            <CardDescription className="text-xs">
              Modal requiring deliberate user confirmation for irreversible operations with proper alertdialog role.
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
                    This will permanently delete the <strong>{targetDb}</strong> database and remove all 48,200 records. This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-3 text-xs text-destructive">
                  <div className="flex items-center gap-1.5 font-medium mb-1">
                    <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                    <span>Type "{targetDb}" to confirm deletion:</span>
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

        {/* Slide-out Sheet Drawer Scenario */}
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="text-base">Filter & Configuration Drawer</CardTitle>
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

        {/* Standard Content Dialog Scenario */}
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="text-base">Content & Settings Dialog</CardTitle>
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

        {/* Toast Triggers Box */}
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="text-base">Centralized Toast Feedback Triggers</CardTitle>
            <CardDescription className="text-xs">
              Simulate stackable notifications with persistent errors and undo action support.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap items-center gap-3">
            <Button
              variant="outline"
              onClick={triggerSuccessToast}
            >
              Success Toast (with Undo)
            </Button>

            <Button
              variant="outline"
              onClick={triggerErrorToast}
            >
              Error Toast (with Retry)
            </Button>

            <Button
              variant="outline"
              onClick={triggerInfoToast}
            >
              Info Notification
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
