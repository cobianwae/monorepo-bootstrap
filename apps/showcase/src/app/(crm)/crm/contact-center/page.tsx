'use client';

import * as React from 'react';
import {
  Headphones,
  Mail,
  MessageSquare,
  Phone,
  Globe,
  Sparkles,
  Zap,
  User,
  ArrowLeft,
} from 'lucide-react';
import {
  Button,
  Badge,
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
  PageHeader,
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
  ChatMessage,
  ChatTypingIndicator,
  ChatSuggestionList,
  ChatComposer,
  SearchInput,
} from '@ds/ui';
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
    label: 'Schedule Call',
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
        <div className="p-4 rounded-xl border border-border bg-card space-y-3 shadow-xs">
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
          <div className="p-4 rounded-xl border border-highlight/40 bg-gradient-to-br from-highlight/10 to-transparent space-y-3 shadow-xs">
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
  const [mobileView, setMobileView] = React.useState<'list' | 'detail'>('list');

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

  const handleSendMessage = () => {
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

  // Conversation list UI element
  const conversationListContent = (
    <div className="flex flex-col h-full bg-muted/10">
      {/* Channel selector filter tabs */}
      <div className="p-3 border-b border-border space-y-2.5">
        <div className="flex items-center gap-1 overflow-x-auto pb-1">
          {(['all', 'email', 'whatsapp', 'webchat', 'voice'] as const).map((ch) => (
            <button
              key={ch}
              type="button"
              onClick={() => setChannelFilter(ch)}
              className={`rounded-md px-2.5 py-1 text-xs font-semibold capitalize whitespace-nowrap transition-colors cursor-pointer ${
                channelFilter === ch
                  ? 'bg-primary text-primary-foreground shadow-xs'
                  : 'text-muted-foreground hover:bg-accent hover:text-foreground'
              }`}
            >
              {ch}
            </button>
          ))}
        </div>

        <SearchInput
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search conversations..."
          sizeVariant="sm"
        />
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
                onClick={() => {
                  setSelectedConversationId(conv.id);
                  setMobileView('detail');
                }}
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
  );

  // Chat thread UI element
  const chatThreadContent = activeConv ? (
    <div className="flex flex-col h-full bg-card">
      {/* Active Conversation Header */}
      <div className="p-3.5 border-b border-border flex items-center justify-between bg-muted/20">
        <div className="flex items-center gap-2.5 min-w-0">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden h-8 w-8 shrink-0"
            onClick={() => setMobileView('list')}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
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
        {activeConv.messages.map((msg) => (
          <ChatMessage
            key={msg.id}
            sender={msg.sender === 'agent' ? 'agent' : msg.sender === 'system' ? 'system' : 'user'}
            senderName={msg.senderName}
            avatar={msg.senderAvatar}
            timestamp={msg.timestamp}
            content={msg.content}
            status="read"
            copyable={msg.sender === 'customer'}
          />
        ))}
        {isSimulatingTyping && <ChatTypingIndicator />}
        <div ref={messagesEndRef} />
      </div>

      {/* AI Suggested Quick Replies */}
      {activeConv.suggestedReplies && activeConv.suggestedReplies.length > 0 && (
        <ChatSuggestionList
          suggestions={activeConv.suggestedReplies}
          onSelect={handleUseSuggestedReply}
          title="AI Suggested Responses"
        />
      )}

      {/* Reply Input Bar */}
      <ChatComposer
        value={replyText}
        onChange={setReplyText}
        onSend={handleSendMessage}
        placeholder={`Reply via ${activeConv.channel.toUpperCase()}... (Press Enter to Send)`}
        cannedResponses={CANNED_RESPONSES}
      />
    </div>
  ) : (
    <div className="flex-1 flex items-center justify-center text-sm text-muted-foreground p-8">
      Select a conversation to start messaging.
    </div>
  );

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-200">
      {/* Official Design System PageHeader */}
      <PageHeader
        eyebrow="Omnichannel Desk"
        eyebrowIcon={Headphones}
        title="Omnichannel Contact Center"
        description="Unified customer communications across Email, WhatsApp, Webchat, and Voice with automated AI triage, contextual CRM insights, and resizable layout workspace."
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

      {/* DESKTOP: Resizable 3-Column Split Workspace */}
      <div className="hidden lg:block h-[calc(100dvh-18rem)] min-h-[600px] max-h-[900px] rounded-xl border border-border bg-card shadow-xs overflow-hidden">
        <ResizablePanelGroup direction="horizontal">
          {/* Left Panel: Conversation List */}
          <ResizablePanel defaultSize={30} minSize={20} maxSize={40}>
            {conversationListContent}
          </ResizablePanel>

          <ResizableHandle withHandle />

          {/* Middle Panel: Active Chat Thread */}
          <ResizablePanel defaultSize={45} minSize={30}>
            {chatThreadContent}
          </ResizablePanel>

          <ResizableHandle withHandle />

          {/* Right Panel: Customer 360 */}
          <ResizablePanel defaultSize={25} minSize={20} maxSize={35}>
            <div className="flex flex-col h-full bg-muted/10 p-4 space-y-4 overflow-y-auto">
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
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>

      {/* MOBILE / TABLET: Responsive Two-View Master-Detail */}
      <div className="lg:hidden h-[calc(100dvh-18rem)] min-h-[500px] rounded-xl border border-border bg-card shadow-xs overflow-hidden flex flex-col">
        {mobileView === 'list' ? conversationListContent : chatThreadContent}
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
