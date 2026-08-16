'use client';

import * as React from 'react';
import {
  Headphones,
  Mail,
  MessageSquare,
  Phone,
  Globe,
  Send,
  Sparkles,
  CheckCheck,
  Search,
  Zap,
  User,
} from 'lucide-react';
import {
  Button,
  Badge,
  Input,
  Textarea,
  Avatar,
  AvatarImage,
  AvatarFallback,
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  DescriptionList,
  toast,
} from '@ds/ui';
import { PageHeader } from '@/components/page-header';
import { useCrm } from '@/scenarios/crm/store/crm-context';
import type { ChannelType, ConversationStatus, Conversation, Lead } from '@/scenarios/crm/types';

const CHANNEL_ICONS: Record<ChannelType, React.ComponentType<{ className?: string }>> = {
  email: Mail,
  whatsapp: MessageSquare,
  webchat: Globe,
  voice: Phone,
};

const CHANNEL_COLORS: Record<ChannelType, string> = {
  email: 'text-info bg-info/10',
  whatsapp: 'text-success bg-success/10',
  webchat: 'text-highlight bg-highlight/10',
  voice: 'text-warning bg-warning/10',
};

const CANNED_RESPONSES = [
  {
    label: 'Support SLA',
    text: 'Hi there! Thanks for reaching out. How can our technical architecture team support you today?',
  },
  {
    label: 'Security & Compliance',
    text: 'Our enterprise plan includes dedicated 99.99% uptime SLA, SOC2 Type II report, and Okta SAML 2.0 SCIM integration.',
  },
  {
    label: 'Schedule Architecture Call',
    text: 'I would be happy to schedule a 15-minute live screen share with our lead solutions architect this afternoon.',
  },
];

interface Customer360Props {
  conversation: Conversation;
  linkedLead: Lead | null;
  onOpenCopilot: () => void;
}

function Customer360Content({ conversation, linkedLead, onOpenCopilot }: Customer360Props) {
  return (
    <div className="space-y-4">
      <div className="space-y-3">
        {/* Profile Card */}
        <div className="p-4 rounded-xl border border-border bg-card space-y-3">
          <div className="flex items-center gap-3">
            <Avatar className="h-11 w-11 border border-border">
              <AvatarImage src={conversation.customerAvatar} alt={conversation.customerName} />
              <AvatarFallback className="font-bold text-xs font-mono">
                {conversation.customerName.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="font-bold text-sm text-foreground truncate">
                {conversation.customerName}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {conversation.customerCompany}
              </p>
            </div>
          </div>

          <div className="text-xs text-muted-foreground space-y-2 pt-3 border-t border-border">
            <p className="flex items-center gap-2 truncate">
              <Mail className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
              <span className="truncate font-mono">{conversation.customerEmail}</span>
            </p>
            {conversation.customerPhone && (
              <p className="flex items-center gap-2 font-mono">
                <Phone className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                <span>{conversation.customerPhone}</span>
              </p>
            )}
          </div>
        </div>

        {/* Linked Lead Pipeline Data */}
        {linkedLead && (
          <div className="p-4 rounded-xl border border-highlight/40 bg-gradient-to-br from-highlight/10 to-transparent space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-foreground font-mono">
                Linked Opportunity
              </span>
              <Badge variant="highlight" className="text-xs font-mono font-bold">
                {linkedLead.aiScore}/100 AI
              </Badge>
            </div>

            <DescriptionList
              columns={1}
              dividers={true}
              items={[
                {
                  label: 'Pipeline Stage',
                  value: (
                    <Badge variant="outline" className="text-xs uppercase font-mono">
                      {linkedLead.stage}
                    </Badge>
                  ),
                },
                {
                  label: 'Deal Value',
                  value: `$${linkedLead.dealValue.toLocaleString()}`,
                },
              ]}
            />
          </div>
        )}

        {/* Tags */}
        <div className="space-y-2">
          <span className="text-xs font-semibold text-muted-foreground uppercase font-mono tracking-wider">
            Conversation Tags
          </span>
          <div className="flex flex-wrap gap-1.5">
            {conversation.tags.map((t) => (
              <Badge key={t} variant="secondary" className="text-xs">
                {t}
              </Badge>
            ))}
          </div>
        </div>

        {/* Quick Copilot button */}
        <Button
          size="sm"
          variant="outline"
          className="w-full text-xs gap-2 border-highlight/40 hover:bg-highlight/10 h-9"
          onClick={onOpenCopilot}
        >
          <Sparkles className="h-4 w-4 text-highlight" />
          <span>Launch Ticket Copilot</span>
        </Button>
      </div>
    </div>
  );
}

export default function ContactCenterPage() {
  const {
    conversations,
    selectedConversationId,
    setSelectedConversationId,
    sendMessage,
    simulateCustomerReply,
    setConversationStatus,
    openAiDrawer,
    leads,
  } = useCrm();

  const [channelFilter, setChannelFilter] = React.useState<string>('all');
  const [searchQuery, setSearchQuery] = React.useState('');
  const [replyText, setReplyText] = React.useState('');
  const [isSimulatingTyping, setIsSimulatingTyping] = React.useState(false);
  const [mobileCustomer360Open, setMobileCustomer360Open] = React.useState(false);

  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  const filteredConversations = React.useMemo(() => {
    return conversations.filter((c) => {
      const q = searchQuery.toLowerCase().trim();
      const matchQuery =
        !q ||
        c.customerName.toLowerCase().includes(q) ||
        c.customerCompany.toLowerCase().includes(q) ||
        c.subject.toLowerCase().includes(q);

      const matchChannel = channelFilter === 'all' || c.channel === channelFilter;
      return matchQuery && matchChannel;
    });
  }, [conversations, searchQuery, channelFilter]);

  const activeConv = React.useMemo(() => {
    return (
      conversations.find((c) => c.id === selectedConversationId) ||
      filteredConversations[0] ||
      conversations[0]
    );
  }, [conversations, selectedConversationId, filteredConversations]);

  // Find linked lead for the 360 customer panel
  const linkedLead = React.useMemo(() => {
    if (!activeConv) return null;
    return (
      leads.find(
        (l) =>
          l.email.toLowerCase() === activeConv.customerEmail.toLowerCase() ||
          l.name.toLowerCase() === activeConv.customerName.toLowerCase()
      ) || null
    );
  }, [leads, activeConv]);

  // Scroll to bottom on new message
  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeConv?.messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !activeConv) return;

    sendMessage(activeConv.id, replyText, false);
    setReplyText('');
  };

  const handleUseSuggestedReply = (suggestion: string) => {
    if (!activeConv) return;
    sendMessage(activeConv.id, suggestion, true);
  };

  const handleSimulateInboundReply = () => {
    if (!activeConv) return;
    setIsSimulatingTyping(true);

    setTimeout(() => {
      simulateCustomerReply(
        activeConv.id,
        `Thanks for the clarification! That matches our team's requirements perfectly. Can you send over the agreement?`
      );
      setIsSimulatingTyping(false);
      toast({
        variant: 'default',
        title: 'New Inbound Message',
        description: `Customer ${activeConv.customerName} replied.`,
      });
    }, 1200);
  };

  return (
    <div className="space-y-8 animate-in fade-in-50 duration-200">
      {/* Official Design System PageHeader */}
      <PageHeader
        eyebrow="Omnichannel Desk"
        eyebrowIcon={Headphones}
        title="Omnichannel Contact Center"
        description="Unified customer communications across Email, WhatsApp, Webchat, and Voice with automated AI triage and contextual CRM insights."
        actions={
          <div className="flex items-center gap-2.5">
            <Button
              size="sm"
              variant="outline"
              onClick={handleSimulateInboundReply}
              disabled={isSimulatingTyping}
              className="h-9 text-xs gap-1.5"
            >
              <Zap className="h-3.5 w-3.5 text-warning" />
              {isSimulatingTyping ? 'Customer typing...' : 'Simulate Customer Inbound'}
            </Button>
          </div>
        }
      />

      {/* 3-Column Master-Detail-Context Workspace */}
      <div className="h-[calc(100vh-16rem)] min-h-[640px] max-h-[850px] flex flex-col lg:grid lg:grid-cols-12 rounded-xl border border-border bg-card shadow-xs overflow-hidden">
        {/* LEFT COLUMN: CONVERSATION LIST (Master, 4 cols) */}
        <div className="lg:col-span-4 border-r border-border flex flex-col h-full bg-muted/10">
          {/* Channel selector filter tabs */}
          <div className="p-3 border-b border-border space-y-2.5">
            <div className="flex items-center gap-1 overflow-x-auto pb-1">
              {(['all', 'email', 'whatsapp', 'webchat', 'voice'] as const).map((ch) => (
                <button
                  key={ch}
                  type="button"
                  onClick={() => setChannelFilter(ch)}
                  className={`rounded-md px-2.5 py-1 text-xs font-semibold capitalize whitespace-nowrap transition-colors ${
                    channelFilter === ch
                      ? 'bg-primary text-primary-foreground shadow-xs'
                      : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                  }`}
                >
                  {ch}
                </button>
              ))}
            </div>

            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search conversations..."
                className="h-9 pl-8 text-xs bg-background"
              />
            </div>
          </div>

          {/* Conversation List items */}
          <div className="flex-1 overflow-y-auto divide-y divide-border/60">
            {filteredConversations.length === 0 ? (
              <div className="p-8 text-center text-xs text-muted-foreground">
                No conversations match current filters.
              </div>
            ) : (
              filteredConversations.map((conv) => {
                const isSelected = activeConv?.id === conv.id;
                const ChannelIcon = CHANNEL_ICONS[conv.channel] || Mail;

                return (
                  <div
                    key={conv.id}
                    onClick={() => setSelectedConversationId(conv.id)}
                    className={`p-3.5 space-y-1.5 cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-primary/10 border-l-2 border-l-primary'
                        : 'hover:bg-accent/50'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Avatar className="h-8 w-8 border border-border shrink-0">
                          <AvatarImage src={conv.customerAvatar} alt={conv.customerName} />
                          <AvatarFallback className="text-xs font-bold font-mono">
                            {conv.customerName.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-bold text-sm text-foreground truncate">
                          {conv.customerName}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <div
                          className={`p-1 rounded-md ${CHANNEL_COLORS[conv.channel]}`}
                          title={`Channel: ${conv.channel}`}
                        >
                          <ChannelIcon className="h-3.5 w-3.5" />
                        </div>
                        {conv.unreadCount > 0 && (
                          <Badge variant="destructive" className="text-xs px-1.5 py-0 font-mono">
                            {conv.unreadCount}
                          </Badge>
                        )}
                      </div>
                    </div>

                    <p className="text-xs font-semibold text-foreground truncate">
                      {conv.subject}
                    </p>

                    <p className="text-xs text-muted-foreground line-clamp-1">
                      {conv.lastMessage.content}
                    </p>

                    <div className="flex items-center justify-between text-xs text-muted-foreground pt-1">
                      <span className="truncate">{conv.customerCompany}</span>
                      <span className="font-mono shrink-0">{conv.lastMessage.timestamp}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* MIDDLE COLUMN: ACTIVE CHAT THREAD (Detail, 5 cols on desktop, flex-1 on mobile) */}
        <div className="lg:col-span-5 flex flex-col h-full bg-card">
          {activeConv ? (
            <>
              {/* Active Conversation Header */}
              <div className="p-3.5 border-b border-border flex items-center justify-between bg-muted/20">
                <div className="flex items-center gap-2.5 min-w-0">
                  <Avatar className="h-9 w-9 border border-border shrink-0">
                    <AvatarImage src={activeConv.customerAvatar} alt={activeConv.customerName} />
                    <AvatarFallback className="text-xs font-bold font-mono">
                      {activeConv.customerName.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <h2 className="font-bold text-sm text-foreground truncate flex items-center gap-1.5">
                      {activeConv.customerName}
                      <span className="text-muted-foreground font-normal text-xs">
                        ({activeConv.customerCompany})
                      </span>
                    </h2>
                    <p className="text-xs text-muted-foreground truncate">
                      {activeConv.subject}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {/* Mobile 360 sheet trigger */}
                  <Button
                    variant="outline"
                    size="sm"
                    className="lg:hidden h-8 text-xs gap-1"
                    onClick={() => setMobileCustomer360Open(true)}
                  >
                    <User className="h-3.5 w-3.5" />
                    <span>Profile</span>
                  </Button>

                  <div className="w-28">
                    <Select
                      value={activeConv.status}
                      onValueChange={(val) =>
                        setConversationStatus(activeConv.id, val as ConversationStatus)
                      }
                    >
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="open">Open</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="resolved">Resolved</SelectItem>
                        <SelectItem value="closed">Closed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* AI Real-time Conversation Summary Banner */}
              {activeConv.aiSummary && (
                <div className="px-3.5 py-2.5 border-b border-highlight/30 bg-highlight/10 flex items-start gap-2 text-xs">
                  <Sparkles className="h-4 w-4 text-highlight mt-0.5 shrink-0" />
                  <p className="text-foreground leading-relaxed">
                    <strong>AI Triage Summary:</strong> {activeConv.aiSummary}
                  </p>
                </div>
              )}

              {/* Message History Thread */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
                {activeConv.messages.map((msg) => {
                  const isAgent = msg.sender === 'agent';
                  const isSystem = msg.sender === 'system';

                  if (isSystem) {
                    return (
                      <div
                        key={msg.id}
                        className="p-2 rounded-lg bg-muted/40 border border-border text-center text-xs text-muted-foreground font-mono"
                      >
                        {msg.content} • {msg.timestamp}
                      </div>
                    );
                  }

                  return (
                    <div
                      key={msg.id}
                      className={`flex gap-2.5 ${isAgent ? 'justify-end' : 'justify-start'}`}
                    >
                      {!isAgent && (
                        <Avatar className="h-7 w-7 border border-border shrink-0 mt-0.5">
                          <AvatarImage src={msg.senderAvatar} alt={msg.senderName} />
                          <AvatarFallback className="text-[10px]">
                            {msg.senderName.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                      )}

                      <div
                        className={`rounded-xl px-4 py-2.5 max-w-[80%] text-sm leading-relaxed ${
                          isAgent
                            ? 'bg-primary text-primary-foreground font-medium'
                            : 'bg-muted/70 text-foreground border border-border'
                        }`}
                      >
                        <p className="whitespace-pre-wrap">{msg.content}</p>
                        <div
                          className={`mt-1 flex items-center justify-end gap-1 text-[11px] font-mono ${
                            isAgent ? 'text-primary-foreground/70' : 'text-muted-foreground'
                          }`}
                        >
                          <span>{msg.timestamp}</span>
                          {isAgent && <CheckCheck className="h-3.5 w-3.5" />}
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* AI Suggested Quick Replies */}
              {activeConv.suggestedReplies && activeConv.suggestedReplies.length > 0 && (
                <div className="px-3.5 py-2.5 border-t border-border bg-muted/15 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground uppercase font-mono tracking-wider">
                    <Sparkles className="h-3.5 w-3.5 text-highlight" />
                    <span>AI Suggested Responses</span>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    {activeConv.suggestedReplies.map((sug, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => handleUseSuggestedReply(sug)}
                        className="text-left text-xs rounded-lg border border-border bg-card p-2 text-foreground hover:border-highlight hover:bg-highlight/5 transition-colors line-clamp-1 flex items-center gap-1.5 cursor-pointer"
                      >
                        <Zap className="h-3.5 w-3.5 text-highlight shrink-0" />
                        <span>&ldquo;{sug}&rdquo;</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Reply Input Bar */}
              <form onSubmit={handleSendMessage} className="p-3 border-t border-border bg-card space-y-2">
                <div className="flex gap-1.5 overflow-x-auto pb-1">
                  {CANNED_RESPONSES.map((canned, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setReplyText(canned.text)}
                      className="shrink-0 text-xs rounded-full border border-border px-2.5 py-1 text-muted-foreground hover:text-foreground bg-muted/30 font-medium cursor-pointer transition-colors"
                    >
                      {canned.label}
                    </button>
                  ))}
                </div>

                <div className="flex gap-2 items-end">
                  <Textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder={`Reply via ${activeConv.channel.toUpperCase()}... (Press Enter to Send)`}
                    rows={2}
                    className="text-sm resize-none"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage(e);
                      }
                    }}
                  />
                  <Button type="submit" size="sm" disabled={!replyText.trim()} className="h-10 px-3.5 shadow-xs">
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </form>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-sm text-muted-foreground">
              Select a conversation to start messaging.
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: CUSTOMER 360 & LINKED LEAD (Desktop only 3 cols) */}
        <div className="hidden lg:flex lg:col-span-3 border-l border-border flex-col h-full bg-muted/10 p-4 space-y-4 overflow-y-auto">
          {activeConv && (
            <>
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground font-mono">
                Customer 360 Profile
              </h3>
              <Customer360Content
                conversation={activeConv}
                linkedLead={linkedLead}
                onOpenCopilot={() =>
                  openAiDrawer({
                    type: 'conversation',
                    entityId: activeConv.id,
                    initialTab: 'chat',
                  })
                }
              />
            </>
          )}
        </div>
      </div>

      {/* Mobile Customer 360 Slide-out Sheet Drawer */}
      <Sheet open={mobileCustomer360Open} onOpenChange={setMobileCustomer360Open}>
        <SheetContent side="right" className="w-full sm:max-w-md p-6 overflow-y-auto">
          <SheetHeader className="mb-4">
            <SheetTitle className="text-lg font-bold">Customer 360 Profile</SheetTitle>
            <SheetDescription className="text-xs text-muted-foreground">
              Omnichannel profile, contact details, and linked pipeline opportunity.
            </SheetDescription>
          </SheetHeader>
          {activeConv && (
            <Customer360Content
              conversation={activeConv}
              linkedLead={linkedLead}
              onOpenCopilot={() => {
                setMobileCustomer360Open(false);
                openAiDrawer({
                  type: 'conversation',
                  entityId: activeConv.id,
                  initialTab: 'chat',
                });
              }}
            />
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
