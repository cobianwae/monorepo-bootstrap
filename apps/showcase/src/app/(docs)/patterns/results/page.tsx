'use client';

import * as React from 'react';
import {
  Button,
  Card,
  CardContent,
  EmptyState,
  Alert,
  AlertTitle,
  AlertDescription,
  Badge,
  SegmentedControl,
  SegmentedControlItem,
  toast,
} from '@ds/ui';
import {
  Sparkles,
  Inbox,
  ShieldX,
  AlertTriangle,
  SearchX,
  RotateCcw,
  ArrowLeft,
} from 'lucide-react';
import { PageHeader } from '@/components/page-header';

type ResultState = 'empty' | 'forbidden' | 'error';

export default function ResultsPage() {
  const [state, setState] = React.useState<ResultState>('empty');

  const renderBody = () => {
    switch (state) {
      case 'empty':
        return (
          <Card>
            <CardContent className="p-12">
              <EmptyState
                icon={SearchX}
                title="No results found"
                description="We could not find anything matching your query. Try adjusting the search term or filters."
                actionLabel="Clear search"
                onAction={() => toast({ variant: 'info', title: 'Search cleared' })}
              />
            </CardContent>
          </Card>
        );
      case 'forbidden':
        return (
          <Card>
            <CardContent className="p-12">
              <div className="flex flex-col items-center text-center">
                <span className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
                  <ShieldX className="h-8 w-8 text-destructive" />
                </span>
                <h2 className="mt-6 text-xl font-semibold text-foreground">
                  403 — Access denied
                </h2>
                <p className="mt-2 max-w-sm text-sm text-muted-foreground">
                  You do not have permission to view this workspace. Contact your administrator
                  to request the appropriate role.
                </p>
                <div className="mt-6 flex items-center gap-3">
                  <Button className="gap-1.5">
                    <ArrowLeft className="h-4 w-4" />
                    Back to overview
                  </Button>
                  <Button variant="outline" onClick={() => toast({ variant: 'info', title: 'Access request sent' })}>
                    Request access
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      case 'error':
        return (
          <div className="space-y-4">
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Something went wrong</AlertTitle>
              <AlertDescription>
                The server returned HTTP 500 while processing your request. Our team has been
                notified automatically.
              </AlertDescription>
            </Alert>
            <Card>
              <CardContent className="p-12">
                <div className="flex flex-col items-center text-center">
                  <span className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
                    <AlertTriangle className="h-8 w-8 text-destructive" />
                  </span>
                  <h2 className="mt-6 text-xl font-semibold text-foreground">
                    Unexpected error
                  </h2>
                  <p className="mt-2 max-w-sm text-sm text-muted-foreground">
                    Reference{' '}
                    <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">
                      ERR-8f3a2c
                    </code>{' '}
                    — retry the operation or reload the page.
                  </p>
                  <div className="mt-6 flex items-center gap-3">
                    <Button className="gap-1.5" onClick={() => toast({ variant: 'success', title: 'Recovered', description: 'The operation completed successfully.' })}>
                      <RotateCcw className="h-4 w-4" />
                      Retry
                    </Button>
                    <Button variant="outline" onClick={() => setState('empty')}>
                      Go home
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in-50 duration-200">
      <PageHeader
        eyebrow="UX Recipe Scenario"
        eyebrowIcon={Sparkles}
        title="Result & Error States"
        description="Comprehensive empty, forbidden, and error states with recovery actions — built on EmptyState, Alert, and accessible inline feedback."
      />

      <div className="flex flex-col items-center gap-2">
        <SegmentedControl
          type="single"
          value={state}
          onValueChange={(v) => {
            if (v) setState(v as ResultState);
          }}
          aria-label="Result state preview"
        >
          <SegmentedControlItem value="empty">Empty</SegmentedControlItem>
          <SegmentedControlItem value="forbidden">403</SegmentedControlItem>
          <SegmentedControlItem value="error">Error</SegmentedControlItem>
        </SegmentedControl>
        <Badge variant="secondary" className="text-[10px]">
          Preview: {state}
        </Badge>
      </div>

      {renderBody()}

      <div className="grid gap-4 sm:grid-cols-3">
        {[
          {
            icon: Inbox,
            title: 'Empty inbox',
            desc: 'EmptyState with icon, description, and a single recovery action.',
          },
          {
            icon: ShieldX,
            title: '403 Forbidden',
            desc: 'Role-based access denial with two recovery actions.',
          },
          {
            icon: AlertTriangle,
            title: 'Error recovery',
            desc: 'Destructive alert + retry action with a traceable reference ID.',
          },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <Card key={item.title}>
              <CardContent className="p-4">
                <Icon className="h-5 w-5 text-primary" />
                <h3 className="mt-2 text-sm font-semibold text-foreground">{item.title}</h3>
                <p className="mt-1 text-xs text-muted-foreground">{item.desc}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}