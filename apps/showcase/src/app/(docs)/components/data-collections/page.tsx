'use client';

import * as React from 'react';
import {
  ListTree,
  Folder,
  FileCode2,
  FileText,
  Bot,
  CheckCircle2,
  Layers,
} from 'lucide-react';
import {
  PageHeader,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Badge,
  TreeView,
  type TreeNode,
  SortableList,
  ChatContainer,
  ChatThread,
  ChatMessage,
  ChatTypingIndicator,
  ChatSuggestionList,
  ChatComposer,
  TableOfContents,
  Banner,
} from '@ds/ui';

export default function DataCollectionsPage() {
  // TreeView State
  const [selectedNode, setSelectedNode] = React.useState<string>('page-header');
  const treeNodes: TreeNode[] = [
    {
      id: 'packages',
      label: 'packages',
      icon: Folder,
      children: [
        {
          id: 'ui',
          label: 'ui',
          icon: Folder,
          children: [
            { id: 'button', label: 'button.tsx', icon: FileCode2 },
            { id: 'page-header', label: 'page-header.tsx', icon: FileCode2 },
            { id: 'tree-view', label: 'tree-view.tsx', icon: FileCode2 },
            { id: 'sidebar', label: 'sidebar.tsx', icon: FileCode2 },
          ],
        },
        {
          id: 'tokens',
          label: 'tokens',
          icon: Folder,
          children: [
            { id: 'colors', label: 'colors.ts', icon: FileText },
            { id: 'typography', label: 'typography.ts', icon: FileText },
          ],
        },
      ],
    },
    {
      id: 'apps',
      label: 'apps',
      icon: Folder,
      children: [
        {
          id: 'showcase',
          label: 'showcase',
          icon: Folder,
          children: [
            { id: 'app-router', label: 'layout.tsx', icon: FileCode2 },
            { id: 'docs-page', label: 'page.tsx', icon: FileCode2 },
          ],
        },
        { id: 'web', label: 'web', icon: Folder },
      ],
    },
  ];

  // SortableList State
  const [tasks, setTasks] = React.useState([
    { id: 't1', title: 'Audit OKLCH color contrast ratios', tag: 'Tokens' },
    { id: 't2', title: 'Add unit tests for TreeView & SortableList', tag: 'Testing' },
    { id: 't3', title: 'Integrate Radix NavigationMenu composite', tag: 'UI' },
    { id: 't4', title: 'Publish living docs for UX scenario patterns', tag: 'Docs' },
  ]);

  // Chat State
  const [messages, setMessages] = React.useState<Array<{
    sender: 'user' | 'assistant' | 'system';
    content: string;
    timestamp: string;
  }>>([
    {
      sender: 'system',
      content: 'Apex Copilot connected to Knowledge Base',
      timestamp: '10:00 AM',
    },
    {
      sender: 'assistant',
      content: 'Hello! I am your Design System AI assistant. How can I help you compose accessible components today?',
      timestamp: '10:01 AM',
    },
    {
      sender: 'user',
      content: 'How do I use TreeView and SortableList in Next.js 15?',
      timestamp: '10:02 AM',
    },
    {
      sender: 'assistant',
      content: 'Both TreeView and SortableList are client components exported from `@ds/ui`. You can import them directly in any `"use client"` file with custom icons and drag handles.',
      timestamp: '10:02 AM',
    },
  ]);
  const [composerInput, setComposerInput] = React.useState('');
  const [isTyping, setIsTyping] = React.useState(false);

  const handleSendMessage = () => {
    if (!composerInput.trim()) return;
    const userMsg = composerInput;
    setMessages((prev) => [
      ...prev,
      {
        sender: 'user',
        content: userMsg,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
    setComposerInput('');
    setIsTyping(true);

    setTimeout(() => {
      setIsTyping(false);
      setMessages((prev) => [
        ...prev,
        {
          sender: 'assistant',
          content: `Here is a recipe for "${userMsg.slice(0, 30)}...": combine Radix primitives with Tailwind v4 for full keyboard navigation and light/dark mode tokens.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    }, 1200);
  };

  const tocHeadings = [
    { id: 'tree-view', text: 'Hierarchical TreeView', level: 2 },
    { id: 'sortable-list', text: 'Drag-and-Drop SortableList', level: 2 },
    { id: 'chat-interface', text: 'AI Copilot & Chat Suite', level: 2 },
  ];

  return (
    <div className="space-y-12">
      <Banner variant="highlight" actionText="Explore Tree & Chat" actionHref="#tree-view">
        <strong>Data Collections:</strong> Hierarchical trees, DnD reorderable lists, and full-featured AI chat interfaces.
      </Banner>

      <PageHeader
        eyebrow="Data & Collections"
        eyebrowIcon={ListTree}
        title="Tree, Sortable & Chat Suites"
        description="Complex collection primitives for hierarchical data browsing, accessible drag-and-drop ordering powered by @dnd-kit, and enterprise AI conversation components."
        actions={
          <div className="flex items-center gap-2">
            <Badge variant="highlight" className="font-mono text-xs">
              @dnd-kit / Core
            </Badge>
            <Badge variant="outline" className="font-mono text-xs">
              Accessible Tree A11y
            </Badge>
          </div>
        }
      />

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
        {/* Main Content Area */}
        <div className="xl:col-span-9 space-y-12 min-w-0">
          {/* SECTION 1: TREEVIEW */}
          <section id="tree-view" className="space-y-4 scroll-mt-20">
            <div className="space-y-1">
              <h2 className="text-2xl font-bold text-foreground font-display flex items-center gap-2">
                <ListTree className="h-6 w-6 text-highlight" />
                <span>Hierarchical TreeView</span>
              </h2>
              <p className="text-sm text-muted-foreground">
                Nested directory explorer with keyboard navigation (arrow keys, enter, home/end), icon slots, and selection callbacks.
              </p>
            </div>

            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-base">Interactive File Tree</CardTitle>
                <CardDescription>
                  Click folders to expand/collapse or select files to inspect details.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                  <div className="p-4 rounded-xl border border-border bg-card shadow-xs">
                    <TreeView
                      nodes={treeNodes}
                      defaultExpandedIds={['packages', 'ui']}
                      selectedId={selectedNode}
                      onSelect={(id) => setSelectedNode(id)}
                    />
                  </div>

                  <div className="p-6 rounded-xl border border-border bg-muted/20 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
                        Selected Node Details
                      </span>
                      <Badge variant="highlight" className="font-mono text-xs">
                        {selectedNode}
                      </Badge>
                    </div>
                    <div className="p-4 rounded-lg bg-card border border-border space-y-2">
                      <p className="text-xs font-semibold text-foreground font-mono">
                        Node ID: <span className="text-highlight">{selectedNode}</span>
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Supports controlled `expandedIds`, custom node icons, and accessible WAI-ARIA tree roles.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* SECTION 2: SORTABLE LIST */}
          <section id="sortable-list" className="space-y-4 scroll-mt-20">
            <div className="space-y-1">
              <h2 className="text-2xl font-bold text-foreground font-display flex items-center gap-2">
                <Layers className="h-6 w-6 text-highlight" />
                <span>Drag & Drop Sortable List</span>
              </h2>
              <p className="text-sm text-muted-foreground">
                Reorderable list with smooth animations, touch sensors, keyboard sorting, and drag handles built on `@dnd-kit`.
              </p>
            </div>

            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-base">Task Priority Ordering</CardTitle>
                <CardDescription>
                  Drag items by the grip icon or use keyboard Space/Arrow keys to reorder.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="max-w-xl mx-auto p-4 rounded-xl border border-border bg-muted/10">
                  <SortableList
                    items={tasks}
                    onReorder={setTasks}
                    renderItem={(item, isDragging) => (
                      <div
                        className={`flex items-center justify-between p-3 rounded-lg border bg-card text-foreground transition-all shadow-xs ${
                          isDragging ? 'border-highlight ring-2 ring-highlight/20 scale-[1.02] shadow-md z-10' : 'border-border'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <CheckCircle2 className="h-4 w-4 text-highlight shrink-0" />
                          <span className="text-xs font-medium text-foreground">{item.title}</span>
                        </div>
                        <Badge variant="outline" className="text-[10px] font-mono shrink-0">
                          {item.tag}
                        </Badge>
                      </div>
                    )}
                  />
                </div>
              </CardContent>
            </Card>
          </section>

          {/* SECTION 3: CHAT INTERFACE */}
          <section id="chat-interface" className="space-y-4 scroll-mt-20">
            <div className="space-y-1">
              <h2 className="text-2xl font-bold text-foreground font-display flex items-center gap-2">
                <Bot className="h-6 w-6 text-highlight" />
                <span>AI Copilot & Chat Suite</span>
              </h2>
              <p className="text-sm text-muted-foreground">
                Turnkey AI conversational UI featuring chat threads, bubble sender variants, typing indicators, suggested prompts, and multiline composer.
              </p>
            </div>

            <Card>
              <CardContent className="p-6">
                <div className="h-[480px] rounded-xl border border-border overflow-hidden flex flex-col bg-card shadow-xs">
                  <div className="h-12 border-b border-border px-4 flex items-center justify-between bg-muted/20">
                    <div className="flex items-center gap-2">
                      <div className="h-7 w-7 rounded-lg bg-highlight flex items-center justify-center text-highlight-foreground">
                        <Bot className="h-4 w-4" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-foreground font-display">Apex Copilot</span>
                        <span className="text-[10px] text-muted-foreground font-mono">Active Model: Gemini 2.0</span>
                      </div>
                    </div>
                    <Badge variant="highlight" className="text-[10px] font-mono">
                      Online
                    </Badge>
                  </div>

                  {/* Thread Area */}
                  <ChatContainer className="flex-1">
                    <ChatThread>
                      {messages.map((msg, i) => (
                        <ChatMessage
                          key={i}
                          sender={msg.sender}
                          senderName={msg.sender === 'assistant' ? 'Copilot' : undefined}
                          content={msg.content}
                          timestamp={msg.timestamp}
                          copyable={msg.sender === 'assistant'}
                        />
                      ))}
                      {isTyping && <ChatTypingIndicator />}
                    </ChatThread>

                    <ChatSuggestionList
                      suggestions={[
                        'How do I customize OKLCH tokens?',
                        'Show me how to create a master-detail table view',
                      ]}
                      onSelect={(prompt) => {
                        setComposerInput(prompt);
                      }}
                    />

                    <ChatComposer
                      value={composerInput}
                      onChange={setComposerInput}
                      onSend={handleSendMessage}
                      placeholder="Ask the AI copilot anything... (Enter to send)"
                    />
                  </ChatContainer>
                </div>
              </CardContent>
            </Card>
          </section>
        </div>

        {/* Sticky Table of Contents Sidebar */}
        <div className="hidden xl:block xl:col-span-3 sticky top-20">
          <Card className="p-4 bg-card/60 backdrop-blur-sm border-border">
            <TableOfContents headings={tocHeadings} title="Data Collections" />
          </Card>
        </div>
      </div>
    </div>
  );
}
