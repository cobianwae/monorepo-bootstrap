'use client';

import * as React from 'react';
import {
  Megaphone,
  Plus,
  Sparkles,
  DollarSign,
  TrendingUp,
  Mail,
  MessageSquare,
  Smartphone,
  Layers,
  CheckCircle2,
  Trash2,
  Play,
  Pause,
  ArrowRight,
  ArrowLeft,
  Search,
  X,
} from 'lucide-react';
import {
  Button,
  Badge,
  Input,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  StatCard,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  Label,
  Stepper,
  Textarea,
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  EmptyState,
  DescriptionList,
  toast,
} from '@ds/ui';
import { PageHeader } from '@/components/page-header';
import { useCrm } from '@/scenarios/crm/store/crm-context';
import type { CampaignStatus, CampaignChannel } from '@/scenarios/crm/types';

const CHANNEL_CONFIG: Record<
  CampaignChannel,
  { label: string; icon: React.ComponentType<{ className?: string }>; color: string }
> = {
  email: { label: 'Email Broadcast', icon: Mail, color: 'text-info' },
  whatsapp: { label: 'WhatsApp Direct', icon: MessageSquare, color: 'text-success' },
  sms: { label: 'SMS Alert', icon: Smartphone, color: 'text-warning' },
  multichannel: { label: 'Omnichannel Sync', icon: Layers, color: 'text-highlight' },
};

const STATUS_BADGE: Record<
  CampaignStatus,
  { label: string; variant: 'success' | 'warning' | 'secondary' | 'outline' | 'destructive' }
> = {
  active: { label: 'Active Live', variant: 'success' },
  scheduled: { label: 'Scheduled', variant: 'warning' },
  draft: { label: 'Draft', variant: 'outline' },
  paused: { label: 'Paused', variant: 'secondary' },
  completed: { label: 'Completed', variant: 'secondary' },
};

const WIZARD_STEPS = [
  { id: '1', title: 'Audience & Channel', description: 'Define target criteria' },
  { id: '2', title: 'Content Studio', description: 'Subject & AI messaging' },
  { id: '3', title: 'Schedule & Budget', description: 'Timing and allocation' },
  { id: '4', title: 'Review & Launch', description: 'Verify setup' },
];

export default function CampaignsPage() {
  const {
    campaigns,
    addCampaign,
    updateCampaignStatus,
    deleteCampaign,
    openAiDrawer,
  } = useCrm();

  const [searchQuery, setSearchQuery] = React.useState('');
  const [channelFilter, setChannelFilter] = React.useState<string>('all');
  const [statusFilter, setStatusFilter] = React.useState<string>('all');

  // Wizard state
  const [isWizardOpen, setIsWizardOpen] = React.useState(false);
  const [wizardStep, setWizardStep] = React.useState(0);
  const [isGeneratingAi, setIsGeneratingAi] = React.useState(false);

  const [wizardForm, setWizardForm] = React.useState({
    name: '',
    channel: 'email' as CampaignChannel,
    targetAudience: 'Enterprise Contacts with >50 Seats',
    audienceCount: 1250,
    budget: 3500,
    subject: '',
    previewText: '',
    body: '',
    scheduledFor: 'Immediate',
  });

  const filteredCampaigns = React.useMemo(() => {
    return campaigns.filter((c) => {
      const q = searchQuery.toLowerCase().trim();
      const matchQuery = !q || c.name.toLowerCase().includes(q) || c.targetAudience.toLowerCase().includes(q);
      const matchChannel = channelFilter === 'all' || c.channel === channelFilter;
      const matchStatus = statusFilter === 'all' || c.status === statusFilter;
      return matchQuery && matchChannel && matchStatus;
    });
  }, [campaigns, searchQuery, channelFilter, statusFilter]);

  const totalCampaignRevenue = React.useMemo(() => {
    return campaigns.reduce((acc, c) => acc + c.revenueGenerated, 0);
  }, [campaigns]);

  const activeCampaigns = React.useMemo(() => {
    return campaigns.filter((c) => c.status === 'active');
  }, [campaigns]);

  const handleAiCopywriter = () => {
    setIsGeneratingAi(true);
    setTimeout(() => {
      if (wizardForm.channel === 'whatsapp') {
        setWizardForm((prev) => ({
          ...prev,
          previewText: 'Exclusive 15-minute architectural review on design tokens',
          body: `Hi there! We have just unlocked enterprise token governance in Acme CRM. Join our live hands-on walkthrough this Thursday to see how leading engineering teams speed up delivery by 40%. Reply YES to claim your VIP seat!`,
        }));
      } else {
        setWizardForm((prev) => ({
          ...prev,
          subject: 'Unlock Verified WCAG AAA Accessibility & OKLCH Tokens',
          previewText: 'Save 12 hours per engineer every sprint with our integrated UI stack.',
          body: `Hi {{firstName}},\n\nIs your frontend team currently building bespoke components from scratch?\n\nOur fullstack monorepo design system provides 50+ accessible primitives, validated OKLCH color palettes, and real-time CRM workflow recipes.\n\nWould you like a personalized 15-minute walkthrough of our enterprise tier this week?\n\nBest regards,\nThe Acme Team`,
        }));
      }
      setIsGeneratingAi(false);
      toast({
        variant: 'success',
        title: 'AI Draft Generated',
        description: 'Copy filled with high-conversion prompt template.',
      });
    }, 600);
  };

  const handleLaunchWizardCampaign = () => {
    addCampaign({
      name: wizardForm.name || 'New Enterprise Outreach Wave',
      channel: wizardForm.channel,
      status: wizardForm.scheduledFor === 'Immediate' ? 'active' : 'scheduled',
      targetAudience: wizardForm.targetAudience,
      audienceCount: Number(wizardForm.audienceCount) || 1000,
      budget: Number(wizardForm.budget) || 2000,
      subject: wizardForm.subject,
      previewText: wizardForm.previewText,
      launchedAt: wizardForm.scheduledFor === 'Immediate' ? new Date().toISOString() : undefined,
      scheduledFor: wizardForm.scheduledFor !== 'Immediate' ? '2025-02-28T10:00:00Z' : undefined,
    });

    setIsWizardOpen(false);
    setWizardStep(0);
    setWizardForm({
      name: '',
      channel: 'email',
      targetAudience: 'Enterprise Contacts with >50 Seats',
      audienceCount: 1250,
      budget: 3500,
      subject: '',
      previewText: '',
      body: '',
      scheduledFor: 'Immediate',
    });
  };

  return (
    <div className="space-y-8 animate-in fade-in-50 duration-200">
      {/* Official Design System PageHeader */}
      <PageHeader
        eyebrow="Campaign Workspace"
        eyebrowIcon={Megaphone}
        title="Marketing Campaigns & Performance"
        description="Launch targeted multi-channel outreach campaigns, monitor conversion rates in real time, and track pipeline ROI across all touchpoints."
        actions={
          <div className="flex items-center gap-2.5">
            <Button
              variant="outline"
              size="sm"
              onClick={() => openAiDrawer({ type: 'campaign' })}
              className="h-9 gap-2 border-highlight/40 bg-highlight/10 text-foreground hover:bg-highlight/20"
            >
              <Sparkles className="h-4 w-4 text-highlight" />
              <span>AI Copywriter</span>
            </Button>

            <Button size="sm" onClick={() => setIsWizardOpen(true)} className="h-9 gap-2 shadow-xs">
              <Plus className="h-4 w-4" />
              <span>Create Campaign</span>
            </Button>
          </div>
        }
      />

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Campaign Revenue"
          value={`$${totalCampaignRevenue.toLocaleString()}`}
          delta={{
            value: '+28.4%',
            trend: 'up',
            label: 'attributed pipeline',
          }}
          icon={DollarSign}
        />

        <StatCard
          title="Active Live Broadcasts"
          value={activeCampaigns.length}
          delta={{
            value: `${campaigns.length} total campaigns`,
            trend: 'neutral',
          }}
          icon={Megaphone}
        />

        <StatCard
          title="Average Open Rate"
          value="66.2%"
          delta={{
            value: '+14.5% vs benchmark',
            trend: 'up',
          }}
          icon={TrendingUp}
        />

        <StatCard
          title="Top Performing Channel"
          value="WhatsApp (19.3x)"
          delta={{
            value: '89.2% open rate',
            trend: 'up',
          }}
          icon={MessageSquare}
        />
      </div>

      {/* Filters Bar with DS Select */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card/60 p-3.5 shadow-xs">
        <div className="flex flex-wrap items-center gap-2.5 flex-1 min-w-[280px]">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search campaigns by name or audience..."
              className="h-9 pl-9 text-xs bg-background"
            />
          </div>

          <div className="w-40">
            <Select value={channelFilter} onValueChange={setChannelFilter}>
              <SelectTrigger className="h-9 text-xs">
                <SelectValue placeholder="All Channels" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Channels</SelectItem>
                <SelectItem value="email">Email</SelectItem>
                <SelectItem value="whatsapp">WhatsApp</SelectItem>
                <SelectItem value="sms">SMS</SelectItem>
                <SelectItem value="multichannel">Omnichannel</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="w-40">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="h-9 text-xs">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="active">Active Live</SelectItem>
                <SelectItem value="scheduled">Scheduled</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="paused">Paused</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {(searchQuery || channelFilter !== 'all' || statusFilter !== 'all') && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                setSearchQuery('');
                setChannelFilter('all');
                setStatusFilter('all');
              }}
              className="h-9 text-xs text-muted-foreground hover:text-foreground"
            >
              <X className="h-3.5 w-3.5 mr-1" />
              Clear
            </Button>
          )}
        </div>

        <div className="text-xs text-muted-foreground font-mono">
          Showing {filteredCampaigns.length} of {campaigns.length} campaigns
        </div>
      </div>

      {/* Campaigns Grid or EmptyState */}
      {filteredCampaigns.length === 0 ? (
        <EmptyState
          icon={Megaphone}
          title="No campaigns match filters"
          description="Try adjusting your channel, status filters, or search terms to see matching marketing campaigns."
          actionLabel="Reset Filters"
          onAction={() => {
            setSearchQuery('');
            setChannelFilter('all');
            setStatusFilter('all');
          }}
          secondaryActionLabel="Create New Campaign"
          onSecondaryAction={() => setIsWizardOpen(true)}
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredCampaigns.map((cmp) => {
            const ChannelIcon = CHANNEL_CONFIG[cmp.channel]?.icon || Megaphone;
            const statusInfo = STATUS_BADGE[cmp.status] || STATUS_BADGE.draft;

            return (
              <Card
                key={cmp.id}
                className="flex flex-col justify-between shadow-xs hover:shadow-md transition-shadow border-border"
              >
                <CardHeader className="p-5 pb-3 space-y-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className={`p-1.5 rounded-md bg-muted/60 ${CHANNEL_CONFIG[cmp.channel]?.color}`}>
                        <ChannelIcon className="h-4 w-4" />
                      </div>
                      <Badge variant={statusInfo.variant} className="text-xs uppercase font-mono">
                        {statusInfo.label}
                      </Badge>
                    </div>

                    {cmp.roi > 0 && (
                      <Badge variant="highlight" className="text-xs font-mono font-bold">
                        {cmp.roi}x ROI
                      </Badge>
                    )}
                  </div>

                  <div>
                    <CardTitle className="text-base font-bold text-foreground font-display line-clamp-1">
                      {cmp.name}
                    </CardTitle>
                    <CardDescription className="text-xs line-clamp-1 mt-0.5">
                      Audience: {cmp.targetAudience}
                    </CardDescription>
                  </div>
                </CardHeader>

                <CardContent className="p-5 pt-0 space-y-4 flex-1 flex flex-col justify-between">
                  {/* Metrics Matrix */}
                  <div className="grid grid-cols-3 gap-2 p-3 rounded-lg bg-muted/20 border border-border/60 text-center">
                    <div>
                      <span className="text-xs text-muted-foreground block font-mono">Audience</span>
                      <span className="font-mono font-bold text-sm text-foreground">
                        {cmp.audienceCount.toLocaleString()}
                      </span>
                    </div>
                    <div>
                      <span className="text-xs text-muted-foreground block font-mono">Open Rate</span>
                      <span className="font-mono font-bold text-sm text-foreground">
                        {cmp.openRate > 0 ? `${cmp.openRate}%` : '—'}
                      </span>
                    </div>
                    <div>
                      <span className="text-xs text-muted-foreground block font-mono">Revenue</span>
                      <span className="font-mono font-bold text-sm text-success">
                        {cmp.revenueGenerated > 0
                          ? `$${(cmp.revenueGenerated / 1000).toFixed(0)}k`
                          : '—'}
                      </span>
                    </div>
                  </div>

                  {/* Status Switcher & Action buttons */}
                  <div className="flex items-center justify-between pt-2 border-t border-border/60 text-xs">
                    <div className="flex items-center gap-1.5">
                      {cmp.status === 'active' ? (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 px-2.5 text-xs text-muted-foreground hover:text-foreground"
                          onClick={() => updateCampaignStatus(cmp.id, 'paused')}
                        >
                          <Pause className="h-3.5 w-3.5 mr-1" />
                          Pause
                        </Button>
                      ) : cmp.status === 'paused' || cmp.status === 'draft' ? (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 px-2.5 text-xs text-success hover:bg-success/10"
                          onClick={() => updateCampaignStatus(cmp.id, 'active')}
                        >
                          <Play className="h-3.5 w-3.5 mr-1" />
                          Launch
                        </Button>
                      ) : (
                        <span className="text-muted-foreground font-mono text-xs">
                          {cmp.status.toUpperCase()}
                        </span>
                      )}
                    </div>

                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                      onClick={() => deleteCampaign(cmp.id)}
                      title="Delete campaign"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Multi-Step Campaign Wizard Dialog */}
      <Dialog open={isWizardOpen} onOpenChange={setIsWizardOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-foreground flex items-center gap-2">
              <Megaphone className="h-5 w-5 text-primary" />
              Campaign Builder Studio
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Follow the 4-step wizard to configure, AI-generate copy, and dispatch your campaign.
            </DialogDescription>
          </DialogHeader>

          {/* Stepper Header */}
          <div className="py-2 border-b border-border">
            <Stepper
              steps={WIZARD_STEPS}
              currentStep={wizardStep}
              onStepClick={(s) => setWizardStep(s)}
            />
          </div>

          {/* Step 0: Audience & Channel */}
          {wizardStep === 0 && (
            <div className="space-y-4 py-3">
              <div className="space-y-1.5">
                <Label htmlFor="camp-name" className="text-sm font-medium">
                  Campaign Name *
                </Label>
                <Input
                  id="camp-name"
                  placeholder="e.g. Q1 Enterprise Design System Upsell"
                  value={wizardForm.name}
                  onChange={(e) => setWizardForm({ ...wizardForm, name: e.target.value })}
                  className="text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="camp-channel" className="text-sm font-medium">
                    Delivery Channel
                  </Label>
                  <Select
                    value={wizardForm.channel}
                    onValueChange={(val) =>
                      setWizardForm({ ...wizardForm, channel: val as CampaignChannel })
                    }
                  >
                    <SelectTrigger id="camp-channel" className="text-sm">
                      <SelectValue placeholder="Select channel" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="email">Email Broadcast</SelectItem>
                      <SelectItem value="whatsapp">WhatsApp Direct</SelectItem>
                      <SelectItem value="sms">SMS Flash Alert</SelectItem>
                      <SelectItem value="multichannel">Omnichannel Sync</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="camp-count" className="text-sm font-medium">
                    Target Audience Reach (Seats)
                  </Label>
                  <Input
                    id="camp-count"
                    type="number"
                    value={wizardForm.audienceCount}
                    onChange={(e) =>
                      setWizardForm({ ...wizardForm, audienceCount: Number(e.target.value) })
                    }
                    className="text-sm"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="camp-audience" className="text-sm font-medium">
                  Audience Segment Criteria
                </Label>
                <Input
                  id="camp-audience"
                  value={wizardForm.targetAudience}
                  onChange={(e) =>
                    setWizardForm({ ...wizardForm, targetAudience: e.target.value })
                  }
                  className="text-sm"
                />
              </div>
            </div>
          )}

          {/* Step 1: Content Studio & AI Generator */}
          {wizardStep === 1 && (
            <div className="space-y-4 py-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider font-mono">
                  Copywriting & Creative
                </span>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={handleAiCopywriter}
                  disabled={isGeneratingAi}
                  className="h-8 gap-1.5 text-xs border-highlight/40 bg-highlight/10 text-foreground hover:bg-highlight/20"
                >
                  <Sparkles className="h-3.5 w-3.5 text-highlight" />
                  {isGeneratingAi ? 'AI Generating...' : '1-Click AI Copy Generation'}
                </Button>
              </div>

              {wizardForm.channel === 'email' && (
                <div className="space-y-1.5">
                  <Label htmlFor="camp-subj" className="text-sm font-medium">
                    Email Subject Line
                  </Label>
                  <Input
                    id="camp-subj"
                    placeholder="e.g. Accelerate your Design Tokens Pipeline"
                    value={wizardForm.subject}
                    onChange={(e) => setWizardForm({ ...wizardForm, subject: e.target.value })}
                    className="text-sm"
                  />
                </div>
              )}

              <div className="space-y-1.5">
                <Label htmlFor="camp-body" className="text-sm font-medium">
                  Message Body & Call To Action
                </Label>
                <Textarea
                  id="camp-body"
                  rows={5}
                  placeholder="Write your campaign messaging or click 1-Click AI Copy Generation above..."
                  value={wizardForm.body}
                  onChange={(e) => setWizardForm({ ...wizardForm, body: e.target.value })}
                  className="text-sm"
                />
              </div>
            </div>
          )}

          {/* Step 2: Budget & Scheduling */}
          {wizardStep === 2 && (
            <div className="space-y-4 py-3">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="camp-budget" className="text-sm font-medium">
                    Campaign Budget Allocation ($)
                  </Label>
                  <Input
                    id="camp-budget"
                    type="number"
                    value={wizardForm.budget}
                    onChange={(e) =>
                      setWizardForm({ ...wizardForm, budget: Number(e.target.value) })
                    }
                    className="text-sm font-mono"
                  />
                  <p className="text-xs text-muted-foreground">
                    Estimated ROI multiplier: <strong className="text-foreground">14x–20x</strong>
                  </p>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="camp-timing" className="text-sm font-medium">
                    Launch Timing
                  </Label>
                  <Select
                    value={wizardForm.scheduledFor}
                    onValueChange={(val) =>
                      setWizardForm({ ...wizardForm, scheduledFor: val })
                    }
                  >
                    <SelectTrigger id="camp-timing" className="text-sm">
                      <SelectValue placeholder="Select launch timing" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Immediate">Dispatch Immediately</SelectItem>
                      <SelectItem value="Scheduled">Schedule for Next Tuesday 10:00 AM</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Final Review & Confirmation with DescriptionList */}
          {wizardStep === 3 && (
            <div className="space-y-4 py-3">
              <Card className="border-highlight/30 bg-muted/20 p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-border pb-3">
                  <span className="font-bold text-base text-foreground font-display">
                    {wizardForm.name || 'Untitled Campaign'}
                  </span>
                  <Badge variant="highlight" className="text-xs uppercase font-mono">
                    {wizardForm.channel}
                  </Badge>
                </div>

                <DescriptionList
                  columns={2}
                  dividers={false}
                  items={[
                    {
                      label: 'Target Audience',
                      value: wizardForm.targetAudience,
                    },
                    {
                      label: 'Estimated Reach',
                      value: `${wizardForm.audienceCount.toLocaleString()} contacts`,
                    },
                    {
                      label: 'Budget Allocation',
                      value: `$${wizardForm.budget.toLocaleString()} USD`,
                    },
                    {
                      label: 'Scheduled Dispatch',
                      value: wizardForm.scheduledFor,
                    },
                  ]}
                />

                {wizardForm.subject && (
                  <div className="text-sm pt-2 border-t border-border">
                    <span className="text-xs font-semibold text-muted-foreground uppercase font-mono block">
                      Subject Line
                    </span>
                    <p className="text-foreground font-medium mt-0.5">{wizardForm.subject}</p>
                  </div>
                )}
              </Card>
            </div>
          )}

          {/* Wizard Navigation Footer */}
          <DialogFooter className="pt-4 border-t border-border flex items-center justify-between sm:justify-between">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={wizardStep === 0}
              onClick={() => setWizardStep((s) => Math.max(0, s - 1))}
              className="gap-1.5"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Previous
            </Button>

            <div className="flex items-center gap-2">
              {wizardStep < 3 ? (
                <Button
                  type="button"
                  size="sm"
                  onClick={() => setWizardStep((s) => Math.min(3, s + 1))}
                  className="gap-1.5"
                >
                  Next Step
                  <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              ) : (
                <Button
                  type="button"
                  size="sm"
                  onClick={handleLaunchWizardCampaign}
                  className="gap-1.5 bg-success hover:bg-success/90 text-success-foreground"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  Launch Campaign
                </Button>
              )}
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
