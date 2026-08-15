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
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
  Input,
  Label,
} from '@ds/ui';
import {
  Trash2,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  SlidersHorizontal,
  X,
} from 'lucide-react';
import { PageHeader } from '../../../components/page-header';

export default function OverlaysPatternPage() {
  const [toastMessage, setToastMessage] = React.useState<{
    type: 'success' | 'error' | 'info';
    title: string;
    description: string;
    undoable?: boolean;
  } | null>(null);

  const showToast = (
    type: 'success' | 'error' | 'info',
    title: string,
    description: string,
    undoable = false
  ) => {
    setToastMessage({ type, title, description, undoable });
    setTimeout(() => {
      setToastMessage((prev) => (prev?.title === title ? null : prev));
    }, 4500);
  };

  return (
    <div className="space-y-10 animate-in fade-in-50 duration-200">
      <PageHeader
        eyebrow="UX Recipe Scenario"
        eyebrowIcon={Sparkles}
        title="Overlays, Drawers & Toast Feedback"
        description="Comprehensive overlay orchestration: confirmation modals, filter/edit slide-out sheets, and non-blocking toast notifications with undo actions."
      />

      {/* Floating Toast Notification Simulation Bar */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 max-w-md w-full animate-in slide-in-from-bottom-5 duration-200">
          <div
            className={`flex items-start justify-between gap-3 rounded-xl border p-4 shadow-xl backdrop-blur-md bg-card ${
              toastMessage.type === 'success'
                ? 'border-success/40'
                : toastMessage.type === 'error'
                ? 'border-destructive/40'
                : 'border-info/40'
            }`}
          >
            <div className="flex items-start gap-3">
              {toastMessage.type === 'success' && (
                <CheckCircle2 className="h-5 w-5 text-success mt-0.5 shrink-0" />
              )}
              {toastMessage.type === 'error' && (
                <AlertCircle className="h-5 w-5 text-destructive mt-0.5 shrink-0" />
              )}
              {toastMessage.type === 'info' && (
                <AlertTriangle className="h-5 w-5 text-info mt-0.5 shrink-0" />
              )}
              <div>
                <p className="text-sm font-semibold text-foreground">{toastMessage.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{toastMessage.description}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {toastMessage.undoable && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setToastMessage(null)}
                  className="h-7 px-2 text-xs gap-1"
                >
                  <RotateCcw className="h-3 w-3" />
                  Undo
                </Button>
              )}
              <button
                onClick={() => setToastMessage(null)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Grid of Interactive Trigger Blocks */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Modal Dialog Scenario */}
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="text-base">Destructive Confirmation Dialog</CardTitle>
            <CardDescription className="text-xs">
              Modal requiring deliberate user confirmation for irreversible operations.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="destructive" className="gap-2">
                  <Trash2 className="h-4 w-4" />
                  Delete Project Database
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Are you absolutely sure?</DialogTitle>
                  <DialogDescription>
                    This will permanently delete the <strong>production-db-v1</strong> database and remove all 48,200 records.
                  </DialogDescription>
                </DialogHeader>
                <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-3 text-xs text-destructive">
                  <div className="flex items-center gap-1.5 font-medium mb-1">
                    <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                    <span>Type the project name to confirm deletion:</span>
                  </div>
                  <Input placeholder="production-db-v1" className="mt-2" />
                </div>
                <DialogFooter>
                  <Button variant="outline">Cancel</Button>
                  <Button
                    variant="destructive"
                    onClick={() =>
                      showToast(
                        'error',
                        'Database Deleted',
                        'Database "production-db-v1" was scheduled for purge.',
                        true
                      )
                    }
                  >
                    Confirm Deletion
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
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
                    <Label>Traffic Source</Label>
                    <Input placeholder="e.g. Google Organic, Direct" />
                  </div>
                  <div className="space-y-2">
                    <Label>Minimum Conversion Value ($)</Label>
                    <Input type="number" defaultValue="500" />
                  </div>
                </div>
                <SheetFooter>
                  <Button
                    className="w-full"
                    onClick={() =>
                      showToast(
                        'success',
                        'Filters Applied',
                        'Showing filtered dataset for 14,200 events.'
                      )
                    }
                  >
                    Apply Filters
                  </Button>
                </SheetFooter>
              </SheetContent>
            </Sheet>
          </CardContent>
        </Card>

        {/* Toast Triggers Box */}
        <Card className="border-border md:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Interactive Toast Feedback Triggers</CardTitle>
            <CardDescription className="text-xs">
              Simulate various toast feedback notifications with undo capabilities.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap items-center gap-3">
            <Button
              variant="outline"
              onClick={() =>
                showToast(
                  'success',
                  'Item archived',
                  'Invoice #INV-2025-09 was moved to trash.',
                  true
                )
              }
            >
              Trigger Success Toast (with Undo)
            </Button>

            <Button
              variant="outline"
              onClick={() =>
                showToast(
                  'error',
                  'Upload failed',
                  'Connection timed out after 30 seconds.',
                  false
                )
              }
            >
              Trigger Error Alert Toast
            </Button>

            <Button
              variant="outline"
              onClick={() =>
                showToast(
                  'info',
                  'New update available',
                  'Design System version 1.2 is ready to install.',
                  false
                )
              }
            >
              Trigger Informational Toast
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
