'use client';

import * as React from 'react';
import {
  Button,
  Badge,
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
  Sheet,
  SheetContent,
  SheetTitle,
  toast,
} from '@ds/ui';
import {
  FileCode,
  Search,
  Database,
  Terminal,
  Play,
  Share2,
  Sparkles,
  PanelLeft,
  CheckCircle,
} from 'lucide-react';
import { PageHeader } from '@/components/page-header';

const fileTree = [
  { name: 'schema.prisma', icon: Database, size: '2.4 KB' },
  { name: 'auth.controller.ts', icon: FileCode, size: '5.1 KB' },
  { name: 'tokens.css', icon: FileCode, size: '3.8 KB' },
  { name: 'button.tsx', icon: FileCode, size: '1.9 KB' },
];

function FileExplorer({
  selectedFile,
  onSelect,
  showContainerStatus = true,
}: {
  selectedFile: string;
  onSelect: (name: string) => void;
  showContainerStatus?: boolean;
}) {
  return (
    <div className="flex flex-col justify-between space-y-4 p-3">
      <div className="space-y-3">
        <div className="flex items-center justify-between px-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          <span>Explorer</span>
          <Badge variant="outline" className="text-[10px] h-4 px-1">
            Git main
          </Badge>
        </div>

        <ul className="space-y-1">
          {fileTree.map((file) => {
            const Icon = file.icon;
            const isSelected = selectedFile === file.name;
            return (
              <li key={file.name}>
                <button
                  type="button"
                  aria-current={isSelected ? 'true' : undefined}
                  onClick={() => onSelect(file.name)}
                  className={`flex w-full items-center justify-between rounded-md px-2.5 py-1.5 text-xs transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-primary text-primary-foreground font-medium shadow-xs'
                      : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Icon className="h-3.5 w-3.5" />
                    <span>{file.name}</span>
                  </div>
                  <span className="text-[10px] opacity-70 font-mono">{file.size}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      {showContainerStatus && (
        <div className="rounded-lg bg-card border border-border p-2.5 text-xs space-y-1.5">
          <div className="flex items-center justify-between font-medium text-foreground">
            <span>Container Status</span>
            <CheckCircle className="h-3.5 w-3.5 text-success" />
          </div>
          <p className="text-[11px] text-muted-foreground">Memory: 412 MB / 1 GB</p>
        </div>
      )}
    </div>
  );
}

export default function WorkspacePatternPage() {
  const [selectedFile, setSelectedFile] = React.useState('schema.prisma');
  const [sidebarOpen, setSidebarOpen] = React.useState(true);
  const [mobileExplorerOpen, setMobileExplorerOpen] = React.useState(false);

  const openCommandPalette = () => {
    window.dispatchEvent(new CustomEvent('ds:open-command-palette'));
  };

  return (
    <div className="space-y-10 animate-in fade-in-50 duration-200">
      <PageHeader
        eyebrow="UX Recipe Scenario"
        eyebrowIcon={Sparkles}
        title="Workspace / Multi-Panel IDE Layout"
        description="Dense, ergonomic workspace layout designed for power users: collapsible file tree, integrated command bar, breadcrumbs, split panes, and status bar. On mobile the explorer opens as a slide-over drawer."
      />

      {/* Interactive Workspace Mockup Frame */}
      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-lg">
        {/* Workspace Top Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border bg-muted/40 px-3 py-2 sm:px-4">
          <div className="flex min-w-0 items-center gap-2">
            {/* Mobile explorer trigger */}
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8 md:hidden"
              aria-label="Open explorer panel"
              onClick={() => setMobileExplorerOpen(true)}
            >
              <PanelLeft className="h-4 w-4" />
            </Button>

            {/* Desktop explorer toggle */}
            <Button
              size="icon"
              variant="ghost"
              className="hidden h-8 w-8 md:inline-flex"
              aria-label={sidebarOpen ? 'Collapse explorer panel' : 'Expand explorer panel'}
              aria-expanded={sidebarOpen}
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <PanelLeft className="h-4 w-4" />
            </Button>

            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden sm:inline-flex">
                  <BreadcrumbLink href="#">Acme Corp</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden sm:block" />
                <BreadcrumbItem>
                  <BreadcrumbLink href="#" className="hidden sm:inline-flex">
                    API Service
                  </BreadcrumbLink>
                  <BreadcrumbPage className="sm:hidden">{selectedFile}</BreadcrumbPage>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden sm:block" />
                <BreadcrumbItem className="hidden sm:inline-flex">
                  <BreadcrumbPage>{selectedFile}</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>

          <div className="flex items-center gap-2">
            {/* Quick Search Trigger */}
            <button
              type="button"
              aria-label="Search files or commands (Shortcut: Cmd+K)"
              onClick={openCommandPalette}
              className="flex items-center gap-2 rounded-md border border-input bg-background px-3 py-1 text-xs text-muted-foreground shadow-xs sm:w-56 cursor-pointer transition-colors hover:border-border"
            >
              <Search className="h-3.5 w-3.5 shrink-0" />
              <span className="hidden sm:inline">Search files or commands...</span>
              <kbd className="ml-auto hidden rounded bg-muted px-1.5 py-0.5 text-[10px] font-mono border sm:inline">
                ⌘K
              </kbd>
            </button>

            <Button
              size="sm"
              variant="outline"
              className="gap-1.5 h-8"
              onClick={() =>
                toast({
                  variant: 'success',
                  title: 'Workspace Link Copied',
                  description: 'Shareable session link copied to clipboard.',
                })
              }
            >
              <Share2 className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Share</span>
            </Button>
            <Button
              size="sm"
              className="gap-1.5 h-8"
              onClick={() =>
                toast({
                  variant: 'success',
                  title: 'Build Triggered',
                  description: 'Turborepo task pipeline running for @ds/api...',
                })
              }
            >
              <Play className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Run Build</span>
            </Button>
          </div>
        </div>

        {/* Workspace Body (Split View) */}
        <div className="flex h-auto flex-col md:h-[480px] md:flex-row">
          {/* Collapsible Left Panel — desktop */}
          {sidebarOpen && (
            <div className="hidden w-60 border-r border-border bg-muted/20 md:flex animate-in slide-in-from-left-2 duration-150">
              <FileExplorer
                selectedFile={selectedFile}
                onSelect={(name) => setSelectedFile(name)}
              />
            </div>
          )}

          {/* Center Work Area */}
          <div className="flex min-w-0 flex-1 flex-col overflow-hidden bg-background">
            {/* Tab Bar */}
            <div className="flex items-center border-b border-border bg-card/50 px-2 h-9">
              <div className="flex items-center gap-1">
                <div className="flex items-center gap-2 rounded-t-md border-t-2 border-primary bg-background px-3 py-1 text-xs font-medium text-foreground border-x border-border">
                  <FileCode className="h-3.5 w-3.5 text-primary" />
                  <span>{selectedFile}</span>
                </div>
              </div>
            </div>

            {/* Code / Editor Area */}
            <div className="flex-1 p-4 font-mono text-xs overflow-y-auto bg-card/20 space-y-1">
              <p className="text-muted-foreground">// Active file: {selectedFile}</p>
              <p className="text-primary">export interface Config &#123;</p>
              <p className="text-foreground pl-4">clusterId: string;</p>
              <p className="text-foreground pl-4">replicas: number;</p>
              <p className="text-foreground pl-4">region: &apos;us-east-1&apos; | &apos;eu-central-1&apos;;</p>
              <p className="text-foreground pl-4">autoScale: boolean;</p>
              <p className="text-primary">&#125;</p>
              <br />
              <p className="text-muted-foreground">// Ready for continuous deployment</p>
              <p className="text-foreground">export const defaultConfig: Config = &#123;</p>
              <p className="text-foreground pl-4">clusterId: &apos;cls_9281a8c&apos;,</p>
              <p className="text-foreground pl-4">replicas: 3,</p>
              <p className="text-foreground pl-4">region: &apos;us-east-1&apos;,</p>
              <p className="text-foreground pl-4">autoScale: true,</p>
              <p className="text-foreground">&#125;;</p>
            </div>

            {/* Bottom Terminal Drawer */}
            <div className="h-28 border-t border-border bg-card/90 p-3 font-mono text-[11px]">
              <div className="flex items-center justify-between text-muted-foreground pb-2 border-b border-border/50">
                <div className="flex items-center gap-2">
                  <Terminal className="h-3.5 w-3.5" />
                  <span className="font-semibold uppercase tracking-wider">Terminal Output</span>
                </div>
                <span className="text-[10px] text-success">● Live (port 3000)</span>
              </div>
              <div className="pt-2 text-muted-foreground space-y-0.5">
                <p>
                  <span className="text-success font-bold" aria-label="Success">
                    ✓
                  </span>{' '}
                  Compiled @ds/ui successfully in 240ms
                </p>
                <p>
                  <span className="text-info font-bold" aria-label="Info">
                    ℹ
                  </span>{' '}
                  Watching for file changes across workspace...
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile explorer slide-over */}
      <Sheet open={mobileExplorerOpen} onOpenChange={setMobileExplorerOpen}>
        <SheetContent side="left" className="flex flex-col p-0 sm:max-w-sm md:hidden">
          <SheetTitle className="sr-only">Explorer</SheetTitle>
          <div className="flex h-12 items-center border-b border-border px-4">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Explorer
            </span>
          </div>
          <FileExplorer
            selectedFile={selectedFile}
            onSelect={(name) => {
              setSelectedFile(name);
              setMobileExplorerOpen(false);
            }}
          />
        </SheetContent>
      </Sheet>
    </div>
  );
}