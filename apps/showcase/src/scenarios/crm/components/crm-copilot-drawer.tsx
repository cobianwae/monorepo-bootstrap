'use client';

import * as React from 'react';
import {
  Sparkles,
  Send,
  Zap,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Copy,
  Flame,
  Lightbulb,
} from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  Button,
  Input,
  Badge,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  toast,
  ChatMessage as UiChatMessage,
  ChatTypingIndicator,
} from '@ds/ui';
import { useCrm } from '../store/crm-context';
import { streamAiDraftReply } from '../lib/mock-api';

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
}

const PRESET_PROMPTS = [
  'How do I close FinTech Velocity Ltd faster?',
  'Draft enterprise SLA confirmation for Alister',
  'What is our pipeline win-rate projection this month?',
];

export function CrmCopilotDrawer() {
  const {
    isAiDrawerOpen,
    closeAiDrawer,
    openAiDrawer,
    aiContext,
    leads,
  } = useCrm();

  const [activeTab, setActiveTab] = React.useState<string>('chat');
  const [inputVal, setInputVal] = React.useState('');
  const [isStreaming, setIsStreaming] = React.useState(false);

  const [selectedLeadForScore, setSelectedLeadForScore] = React.useState<string>(
    aiContext?.entityId || leads[0]?.id || ''
  );

  const [chatMessages, setChatMessages] = React.useState<ChatMessage[]>([
    {
      id: 'm1',
      sender: 'assistant',
      text: "Hello Sarah! I'm your CRM AI Copilot. I can analyze leads, generate personalized outreach, and forecast revenue pipeline in real-time. How can I help you today?",
    },
  ]);

  // Sync tab and lead when context changes
  React.useEffect(() => {
    if (aiContext?.initialTab) {
      setActiveTab(aiContext.initialTab);
    }
    if (aiContext?.type === 'lead' && aiContext.entityId) {
      setSelectedLeadForScore(aiContext.entityId);
      setActiveTab('lead-scoring');
    }
  }, [aiContext]);

  // Global shortcut ⌘J / Ctrl+J
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'j') {
        e.preventDefault();
        if (isAiDrawerOpen) {
          closeAiDrawer();
        } else {
          openAiDrawer({ type: 'general' });
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAiDrawerOpen, openAiDrawer, closeAiDrawer]);

  const activeLead = React.useMemo(() => {
    return leads.find((l) => l.id === selectedLeadForScore) || leads[0];
  }, [leads, selectedLeadForScore]);

  const handleSendPrompt = async (promptText: string) => {
    if (!promptText.trim() || isStreaming) return;

    const userMsgId = `usr-${Date.now()}`;
    const botMsgId = `bot-${Date.now()}`;

    setChatMessages((prev) => [
      ...prev,
      { id: userMsgId, sender: 'user', text: promptText },
      { id: botMsgId, sender: 'assistant', text: '' },
    ]);

    setInputVal('');
    setIsStreaming(true);

    let accumulatedText = '';
    await streamAiDraftReply(
      promptText,
      (chunk) => {
        accumulatedText += chunk;
        setChatMessages((prev) =>
          prev.map((m) => (m.id === botMsgId ? { ...m, text: accumulatedText } : m))
        );
      },
      () => {
        setIsStreaming(false);
      }
    );
  };

  const handleCopy = (text: string, _id?: string) => {
    navigator.clipboard.writeText(text);
    toast({
      variant: 'success',
      title: 'Copied to Clipboard',
      description: 'Draft ready to paste into email or chat.',
    });
  };

  return (
    <Sheet open={isAiDrawerOpen} onOpenChange={(open) => !open && closeAiDrawer()}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-lg p-0 flex flex-col h-full bg-card border-l border-border shadow-2xl"
      >
        {/* Drawer Header */}
        <SheetHeader className="p-5 border-b border-border bg-gradient-to-r from-primary/10 via-highlight/10 to-transparent">
          <div className="flex items-center justify-between pr-8">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-highlight/20 text-highlight border border-highlight/30 shadow-xs">
                <Sparkles className="h-5 w-5 animate-pulse" />
              </div>
              <div>
                <SheetTitle className="text-base font-bold text-foreground font-display flex items-center gap-2">
                  CRM AI Copilot
                  <Badge variant="highlight" className="text-xs font-mono px-1.5 py-0">
                    Live Model
                  </Badge>
                </SheetTitle>
                <SheetDescription className="text-xs text-muted-foreground">
                  Contextual lead scoring, generative drafts &amp; pipeline intelligence
                </SheetDescription>
              </div>
            </div>
          </div>
        </SheetHeader>

        {/* Tab Navigation */}
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="flex-1 flex flex-col overflow-hidden"
        >
          <div className="px-5 pt-3 border-b border-border bg-card">
            <TabsList className="grid grid-cols-3 w-full h-9">
              <TabsTrigger value="chat" className="text-xs">
                Copilot Chat
              </TabsTrigger>
              <TabsTrigger value="lead-scoring" className="text-xs">
                Lead Intelligence
              </TabsTrigger>
              <TabsTrigger value="insights" className="text-xs">
                Action Feed
              </TabsTrigger>
            </TabsList>
          </div>

          {/* TAB 1: COPILOT CHAT */}
          <TabsContent
            value="chat"
            className="flex-1 flex flex-col m-0 p-0 overflow-hidden"
          >
            {/* Message History */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {chatMessages.map((msg) => (
                <UiChatMessage
                  key={msg.id}
                  sender={msg.sender}
                  senderName={msg.sender === 'assistant' ? 'CRM Copilot' : undefined}
                  content={msg.text || (isStreaming ? 'AI is thinking...' : '')}
                  copyable={msg.sender === 'assistant' && Boolean(msg.text)}
                />
              ))}
              {isStreaming && <ChatTypingIndicator />}
            </div>

            {/* Prompt presets */}
            <div className="px-4 py-2 border-t border-border bg-muted/20 flex gap-1.5 overflow-x-auto">
              {PRESET_PROMPTS.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => handleSendPrompt(p)}
                  disabled={isStreaming}
                  className="shrink-0 text-xs rounded-full border border-border bg-background px-2.5 py-1 text-muted-foreground hover:text-foreground hover:border-highlight transition-colors"
                >
                  {p}
                </button>
              ))}
            </div>

            {/* Input Bar */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendPrompt(inputVal);
              }}
              className="p-4 border-t border-border bg-card flex gap-2 items-center"
            >
              <Input
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                placeholder="Ask AI Copilot anything..."
                disabled={isStreaming}
                className="text-xs h-10"
              />
              <Button
                type="submit"
                size="sm"
                disabled={isStreaming || !inputVal.trim()}
                className="h-10 px-3 shrink-0 gap-1.5"
              >
                <Send className="h-3.5 w-3.5" />
                <span className="sr-only sm:not-sr-only text-xs">Send</span>
              </Button>
            </form>
          </TabsContent>

          {/* TAB 2: LEAD INTELLIGENCE */}
          <TabsContent
            value="lead-scoring"
            className="flex-1 overflow-y-auto p-4 space-y-4 m-0"
          >
            {/* Select lead */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Select Lead to Analyze
              </label>
              <select
                value={selectedLeadForScore}
                onChange={(e) => setSelectedLeadForScore(e.target.value)}
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-xs font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              >
                {leads.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.name} — {l.company} (${l.dealValue.toLocaleString()})
                  </option>
                ))}
              </select>
            </div>

            {activeLead && (
              <div className="space-y-4">
                {/* Score & Sentiment Card */}
                <Card className="border-highlight/30 bg-gradient-to-br from-highlight/5 to-transparent">
                  <CardHeader className="p-4 pb-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-sm font-bold text-foreground">
                          {activeLead.name}
                        </CardTitle>
                        <p className="text-xs text-muted-foreground">{activeLead.company} • {activeLead.title}</p>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-1.5 justify-end">
                          <Flame className="h-4 w-4 text-highlight" />
                          <span className="text-xl font-extrabold text-foreground font-mono">
                            {activeLead.aiScore}/100
                          </span>
                        </div>
                        <Badge
                          variant={activeLead.aiScore >= 80 ? 'highlight' : 'secondary'}
                          className="text-xs font-mono"
                        >
                          {activeLead.aiScore >= 80 ? 'High Intent' : 'Nurture Lead'}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 pt-2 space-y-3">
                    <p className="text-xs text-foreground/90 bg-muted/40 p-2.5 rounded-lg border border-border/60 flex items-start gap-2">
                      <Lightbulb className="h-4 w-4 text-highlight shrink-0 mt-0.5" />
                      <span><strong>AI Analysis:</strong> {activeLead.aiScoreReason}</span>
                    </p>

                    <div className="space-y-1.5">
                      <span className="text-xs font-semibold text-muted-foreground uppercase font-mono tracking-wider">
                        Key Conversion Drivers
                      </span>
                      <ul className="space-y-1 text-xs text-foreground">
                        <li className="flex items-center gap-2">
                          <CheckCircle2 className="h-3.5 w-3.5 text-success shrink-0" />
                          Budget Qualified: ${activeLead.dealValue.toLocaleString()} deal value
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle2 className="h-3.5 w-3.5 text-success shrink-0" />
                          Acquisition Channel: {activeLead.source}
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle2 className="h-3.5 w-3.5 text-success shrink-0" />
                          Tags: {activeLead.tags.join(', ')}
                        </li>
                      </ul>
                    </div>

                    {/* Auto Generated Draft */}
                    <div className="space-y-2 pt-2 border-t border-border">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-foreground">
                          AI Suggested Follow-Up Email
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 text-xs gap-1"
                          onClick={() =>
                            handleCopy(
                              `Subject: Accelerating ${activeLead.company}'s Architecture\n\nHi ${activeLead.name},\n\nI noticed ${activeLead.company} is evaluating modern UI design systems. Let's schedule 15 minutes to review our enterprise token pipeline.`,
                              'auto-email'
                            )
                          }
                        >
                          <Copy className="h-3 w-3" />
                          Copy Draft
                        </Button>
                      </div>
                      <div className="rounded-lg border border-border bg-muted/30 p-3 text-xs font-mono text-muted-foreground space-y-1">
                        <p className="font-semibold text-foreground">
                          Subject: Accelerating {activeLead.company}&apos;s Architecture
                        </p>
                        <p>
                          Hi {activeLead.name}, I noticed {activeLead.company} is evaluating modern UI
                          design systems. Let&apos;s schedule 15 minutes to review our enterprise token
                          pipeline.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          {/* TAB 3: ACTION FEED */}
          <TabsContent
            value="insights"
            className="flex-1 overflow-y-auto p-4 space-y-3 m-0"
          >
            <div className="space-y-2">
              <span className="text-xs font-semibold text-muted-foreground uppercase font-mono tracking-wider">
                Automated Pipeline Recommendations
              </span>

              <Card className="p-3.5 space-y-2 border-warning/30 bg-warning/5">
                <div className="flex items-start gap-2.5">
                  <AlertTriangle className="h-4 w-4 text-warning mt-0.5 shrink-0" />
                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-foreground font-display">
                      Follow Up on 2 Stalled Proposals
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Apex Health Systems & Solaria Solar Dynamics proposals sent &gt;48h ago. AI recommends dispatching token security compliance sheets.
                    </p>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full text-xs h-8"
                  onClick={() => {
                    handleSendPrompt('Draft follow-up emails for stalled proposals at Apex Health and Solaria Solar');
                    setActiveTab('chat');
                  }}
                >
                  Generate Stalled Proposal Emails
                </Button>
              </Card>

              <Card className="p-3.5 space-y-2 border-success/30 bg-success/5">
                <div className="flex items-start gap-2.5">
                  <TrendingUp className="h-4 w-4 text-success mt-0.5 shrink-0" />
                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-foreground font-display">
                      High Conversion Probability: WhatsApp Channel
                    </p>
                    <p className="text-xs text-muted-foreground">
                      WhatsApp campaigns generated 19.3x ROI this quarter vs 15.7x email. Recommend shifting 20% budget to WhatsApp flash events.
                    </p>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full text-xs h-8"
                  onClick={() => {
                    handleSendPrompt('Analyze WhatsApp campaign ROI and recommend new audience segments');
                    setActiveTab('chat');
                  }}
                >
                  Analyze WhatsApp Budget Shift
                </Button>
              </Card>

              <Card className="p-3.5 space-y-2 border-highlight/30 bg-highlight/5">
                <div className="flex items-start gap-2.5">
                  <Zap className="h-4 w-4 text-highlight mt-0.5 shrink-0" />
                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-foreground">
                      AI Lead Triage: 3 Inbound Leads Ready to Qualify
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Damon Vance-Cruz and Samuel Thorne downloaded developer docs and meet target ICP criteria.
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}
