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
import { PageHeader } from '../../../components/page-header';

export default function WorkspacePatternPage() {
  const [selectedFile, setSelectedFile] = React.useState('schema.prisma');
  const [sidebarOpen, setSidebarOpen] = React.useState(true);

  const fileTree = [
    { name: 'schema.prisma', icon: Database, size: '2.4 KB' },
    { name: 'auth.controller.ts', icon: FileCode, size: '5.1 KB' },
    { name: 'tokens.css', icon: FileCode, size: '3.8 KB' },
    { name: 'button.tsx', icon: FileCode, size: '1.9 KB' },
  ];

  return (
    <div className="space-y-10 animate-in fade-in-50 duration-200">
      <PageHeader
        eyebrow="UX Recipe Scenario"
        eyebrowIcon={Sparkles}
        title="Workspace / Multi-Panel IDE Layout"
        description="Dense, ergonomic workspace layout designed for power users: collapsible file tree, integrated command bar, breadcrumbs, split panes, and status bar."
      />

      {/* Interactive Workspace Mockup Frame */}
      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-lg">
        {/* Workspace Top Toolbar */}
        <div className="flex h-12 items-center justify-between border-b border-border bg-muted/40 px-4">
          <div className="flex items-center gap-3">
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8"
              aria-label={sidebarOpen ? 'Collapse explorer panel' : 'Expand explorer panel'}
              aria-expanded={sidebarOpen}
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <PanelLeft className="h-4 w-4" />
            </Button>

            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink href="#">Acme Corp</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink href="#">API Service</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>{selectedFile}</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>

          {/* Quick Search Trigger */}
          <button
            type="button"
            aria-label="Search files or commands (Shortcut: Cmd+K)"
            onClick={() =>
              toast({
                title: 'Command Palette',
                description: 'Press Cmd+K or Ctrl+K to trigger global search.',
                variant: 'info',
              })
            }
            className="hidden sm:flex items-center gap-2 rounded-md border border-input bg-background px-3 py-1 text-xs text-muted-foreground shadow-xs w-64 hover:border-border cursor-pointer transition-colors"
          >
            <Search className="h-3.5 w-3.5" />
            <span>Search files or commands...</span>
            <kbd className="ml-auto rounded bg-muted px-1.5 py-0.5 text-[10px] font-mono border">
              ⌘K
            </kbd>
          </button>

          <div className="flex items-center gap-2">
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
              Share
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
              Run Build
            </Button>
          </div>
        </div>

        {/* Workspace Body (Split View) */}
        <div className="flex h-[480px]">
          {/* Collapsible Left Panel */}
          {sidebarOpen && (
            <div className="w-60 border-r border-border bg-muted/20 p-3 space-y-4 animate-in slide-in-from-left-2 duration-150 flex flex-col justify-between">
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
                          onClick={() => setSelectedFile(file.name)}
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

              <div className="rounded-lg bg-card border border-border p-2.5 text-xs space-y-1.5">
                <div className="flex items-center justify-between font-medium text-foreground">
                  <span>Container Status</span>
                  <CheckCircle className="h-3.5 w-3.5 text-success" />
                </div>
                <p className="text-[11px] text-muted-foreground">Memory: 412 MB / 1 GB</p>
              </div>
            </div>
          )}

          {/* Center Work Area */}
          <div className="flex-1 flex flex-col overflow-hidden bg-background">
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
                <p><span className="text-success font-bold" aria-label="Success">✓</span> Compiled @ds/ui successfully in 240ms</p>
                <p><span className="text-info font-bold" aria-label="Info">ℹ</span> Watching for file changes across workspace...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
