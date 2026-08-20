'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  Zap,
  ArrowRight,
  Mail,
  Target,
  Sparkles,
  ShieldAlert,
  FileCheck,
  RefreshCw,
  Flame,
  ArrowUpRight,
  AlertTriangle,
} from 'lucide-react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Badge,
  Button,
  Avatar,
  AvatarFallback,
  AvatarImage,
  EmptyState,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
  toast,
  cn,
} from '@ds/ui';
import { useCrm } from '../store/crm-context';
import type { Lead } from '../types';

export type RadarLens = 'all' | 'closing' | 'risk' | 'plg';

interface CrmDealRadarCardProps {
  className?: string;
}

interface SignalClassification {
  label: string;
  badgeVariant: 'highlight' | 'success' | 'warning-outline' | 'info-outline' | 'destructive-outline' | 'secondary';
  icon: React.ComponentType<{ className?: string }>;
}

interface ConvictionTierStyle {
  textColor: string;
  borderColor: string;
  dotColor: string;
  bgGradient: string;
}

/**
 * Returns color tokens for conviction tiers:
 * - >= 90: Emerald (Top Conviction)
 * - >= 75: Highlight/Indigo (Strong Signal)
 * - >= 50: Amber (Moderate Warning)
 * - < 50: Red (At-Risk Blocker)
 */
function getConvictionTierStyle(score: number): ConvictionTierStyle {
  if (score >= 90) {
    return {
      textColor: 'text-success',
      borderColor: 'border-l-success',
      dotColor: 'bg-success',
      bgGradient: 'bg-gradient-to-r from-success/[0.08] via-success/[0.02] to-transparent',
    };
  }
  if (score >= 75) {
    return {
      textColor: 'text-highlight',
      borderColor: 'border-l-highlight',
      dotColor: 'bg-highlight',
      bgGradient: 'bg-gradient-to-r from-highlight/[0.08] via-highlight/[0.02] to-transparent',
    };
  }
  if (score >= 50) {
    return {
      textColor: 'text-warning-text',
      borderColor: 'border-l-warning',
      dotColor: 'bg-warning',
      bgGradient: 'bg-gradient-to-r from-warning/[0.08] via-warning/[0.02] to-transparent',
    };
  }
  return {
    textColor: 'text-destructive-text',
    borderColor: 'border-l-destructive',
    dotColor: 'bg-destructive',
    bgGradient: 'bg-gradient-to-r from-destructive/[0.08] via-destructive/[0.02] to-transparent',
  };
}

/**
 * Dynamically classifies radar signal types with a balanced mix of solid and outline badges
 */
function classifyLeadSignal(lead: Lead): SignalClassification {
  const reasonLower = lead.aiScoreReason.toLowerCase();
  const tagsLower = lead.tags.map((t) => t.toLowerCase());

  if (
    lead.aiScore < 50 ||
    lead.aiSentiment === 'critical' ||
    tagsLower.includes('competitor threat') ||
    tagsLower.includes('stalled trial')
  ) {
    return {
      label: lead.aiScore < 40 ? 'Stalled Trial' : 'At-Risk Blocker',
      badgeVariant: 'destructive-outline',
      icon: AlertTriangle,
    };
  }

  if (
    tagsLower.some((t) => t.includes('hipaa') || t.includes('on-prem') || t.includes('security')) ||
    reasonLower.includes('hipaa') ||
    reasonLower.includes('compliance')
  ) {
    return {
      label: 'Security Gate',
      badgeVariant: 'warning-outline',
      icon: ShieldAlert,
    };
  }

  if (
    lead.stage === 'negotiation' ||
    reasonLower.includes('redline') ||
    reasonLower.includes('contract') ||
    reasonLower.includes('closing')
  ) {
    return {
      label: 'Redlines Active',
      badgeVariant: 'highlight',
      icon: FileCheck,
    };
  }

  if (
    tagsLower.some((t) => t.includes('fast track') || t.includes('series b') || t.includes('high velocity')) ||
    lead.source === 'Product Trial' ||
    reasonLower.includes('expansion') ||
    reasonLower.includes('team members')
  ) {
    return {
      label: 'Fast-Track',
      badgeVariant: 'success',
      icon: Zap,
    };
  }

  if (lead.stage === 'new' || reasonLower.includes('demo') || reasonLower.includes('15 minutes')) {
    return {
      label: 'Inbound Demo',
      badgeVariant: 'info-outline',
      icon: Sparkles,
    };
  }

  return {
    label: 'High Intent',
    badgeVariant: 'secondary',
    icon: Target,
  };
}

/**
 * Derives the prescriptive Next-Best-Action (NBA) for sales reps
 */
function getNextBestAction(lead: Lead): { actionText: string } {
  const reasonLower = lead.aiScoreReason.toLowerCase();
  const tagsLower = lead.tags.map((t) => t.toLowerCase());

  if (tagsLower.includes('competitor threat') || reasonLower.includes('champion departed')) {
    return { actionText: 'Deploy executive retention offer & competitor gap analysis' };
  }

  if (tagsLower.includes('stalled trial') || reasonLower.includes('inactive for')) {
    return { actionText: 'Trigger solutions engineer SSO integration triage session' };
  }

  if (tagsLower.includes('data residency') || reasonLower.includes('residency')) {
    return { actionText: 'Provide regional data residency compliance addendum' };
  }

  if (tagsLower.includes('hipaa') || reasonLower.includes('hipaa')) {
    return { actionText: 'Deliver HIPAA BAA & multi-tenant security architecture pack' };
  }

  if (lead.stage === 'negotiation' || reasonLower.includes('redlines') || reasonLower.includes('closing')) {
    return { actionText: 'Schedule executive sponsor alignment call to finalize redlines' };
  }

  if (reasonLower.includes('trial engagement') || reasonLower.includes('18 team members')) {
    return { actionText: 'Propose Enterprise Multi-Seat tier with dedicated onboarding' };
  }

  if (tagsLower.includes('soc2 required') || reasonLower.includes('enterprise budget')) {
    return { actionText: 'Confirm OKLCH token specs & provide SOC2 Type II report' };
  }

  if (lead.stage === 'new' && reasonLower.includes('demo')) {
    return { actionText: 'Execute 15-minute fast-track technical demo triage' };
  }

  return { actionText: 'Initiate context-aware Copilot follow-up sequence' };
}

export function CrmDealRadarCard({ className }: CrmDealRadarCardProps) {
  const { leads, openAiDrawer, setSelectedLeadId } = useCrm();
  const [activeLens, setActiveLens] = React.useState<RadarLens>('all');
  const [isScanning, setIsScanning] = React.useState(false);

  // Filter leads dynamically based on active radar lens
  const radarLeads = React.useMemo(() => {
    return leads
      .filter((l) => {
        if (l.stage === 'won' || l.stage === 'lost') return false;

        if (activeLens === 'all') {
          return l.aiScore >= 80 || l.priority === 'urgent' || l.aiSentiment === 'critical';
        }
        if (activeLens === 'closing') {
          return l.stage === 'negotiation' || l.stage === 'proposal';
        }
        if (activeLens === 'risk') {
          const signal = classifyLeadSignal(l);
          return (
            signal.label.includes('Security') ||
            signal.label.includes('At-Risk') ||
            signal.label.includes('Stalled') ||
            l.priority === 'urgent' ||
            l.aiScore < 75 ||
            l.aiSentiment === 'critical'
          );
        }
        if (activeLens === 'plg') {
          const signal = classifyLeadSignal(l);
          return (
            signal.label.includes('Fast-Track') ||
            signal.label.includes('Stalled') ||
            l.source === 'Product Trial' ||
            l.tags.includes('Fast Track') ||
            l.tags.includes('High Velocity') ||
            l.tags.includes('Stalled Trial')
          );
        }
        return true;
      })
      .sort((a, b) => {
        if (activeLens === 'risk') {
          return a.aiScore - b.aiScore; // Lowest score / highest risk first
        }
        if (activeLens === 'all') {
          return b.dealValue - a.dealValue;
        }
        return b.aiScore - a.aiScore;
      })
      .slice(0, 3);
  }, [leads, activeLens]);

  // Aggregate telemetry metrics
  const totalInScopeValue = React.useMemo(() => {
    return radarLeads.reduce((sum, l) => sum + l.dealValue, 0);
  }, [radarLeads]);

  // Counts for each lens filter
  const lensCounts = React.useMemo(() => {
    const activeNonWon = leads.filter((l) => l.stage !== 'won' && l.stage !== 'lost');
    return {
      all: activeNonWon.filter((l) => l.aiScore >= 80 || l.priority === 'urgent' || l.aiSentiment === 'critical').length,
      closing: activeNonWon.filter((l) => l.stage === 'negotiation' || l.stage === 'proposal').length,
      risk: activeNonWon.filter((l) => {
        const s = classifyLeadSignal(l);
        return (
          s.label.includes('Security') ||
          s.label.includes('At-Risk') ||
          s.label.includes('Stalled') ||
          l.priority === 'urgent' ||
          l.aiScore < 75 ||
          l.aiSentiment === 'critical'
        );
      }).length,
      plg: activeNonWon.filter((l) => {
        const s = classifyLeadSignal(l);
        return (
          s.label.includes('Fast-Track') ||
          s.label.includes('Stalled') ||
          l.source === 'Product Trial' ||
          l.tags.includes('Fast Track') ||
          l.tags.includes('High Velocity') ||
          l.tags.includes('Stalled Trial')
        );
      }).length,
    };
  }, [leads]);

  const handleSimulateScan = () => {
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
      toast({
        variant: 'success',
        title: 'Radar Sweep Completed',
        description: `Scanned ${leads.length} accounts. Flagged ${lensCounts.all} high-conviction deal catalysts.`,
      });
    }, 500);
  };

  return (
    <TooltipProvider>
      <Card
        className={cn(
          'relative flex flex-col justify-between rounded-xl border border-border/80 bg-card p-6 shadow-xs transition-all duration-200',
          className
        )}
      >
        {/* =========================================================================
            HEADER: Title, Outline Live Beacon & Clean Filter Lenses
            ========================================================================= */}
        <CardHeader className="p-0 pb-4 space-y-3.5 border-b border-border/60">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2.5 flex-wrap">
                <CardTitle className="font-display text-base sm:text-lg font-bold text-foreground">
                  AI Opportunity Radar
                </CardTitle>

                {/* Outline Live Beacon */}
                <span className="inline-flex items-center gap-1.5 rounded-full border border-foreground/25 bg-background text-foreground px-2.5 py-0.5 text-[10px] font-mono font-bold shadow-2xs">
                  <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
                  LIVE SWEEP
                </span>
              </div>
              <CardDescription className="text-xs text-muted-foreground">
                Predictive catalysts, deal velocity signals & 1-click Copilot execution
              </CardDescription>
            </div>

            {/* Sweep Rescan Action */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSimulateScan}
                  disabled={isScanning}
                  className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-lg shrink-0"
                  aria-label="Rescan pipeline leads"
                >
                  <RefreshCw className={cn('h-3.5 w-3.5', isScanning && 'animate-spin text-highlight')} />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="left" className="text-xs">
                Rescan pipeline for real-time catalysts
              </TooltipContent>
            </Tooltip>
          </div>

          {/* Clean Segmented Filter Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1 p-1 bg-muted/50 rounded-lg border border-border/40">
            <button
              type="button"
              onClick={() => setActiveLens('all')}
              className={cn(
                'flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-md text-xs transition-all cursor-pointer truncate',
                activeLens === 'all'
                  ? 'bg-card text-foreground font-semibold shadow-2xs border border-border/60'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <span>Hotspots</span>
              <span className="font-mono text-[10px] opacity-75">({lensCounts.all})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveLens('closing')}
              className={cn(
                'flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-md text-xs transition-all cursor-pointer truncate',
                activeLens === 'closing'
                  ? 'bg-card text-foreground font-semibold shadow-2xs border border-border/60'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <span>Closing</span>
              <span className="font-mono text-[10px] opacity-75">({lensCounts.closing})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveLens('risk')}
              className={cn(
                'flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-md text-xs transition-all cursor-pointer truncate',
                activeLens === 'risk'
                  ? 'bg-card text-foreground font-semibold shadow-2xs border border-border/60'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <span>Gates</span>
              <span className="font-mono text-[10px] opacity-75">({lensCounts.risk})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveLens('plg')}
              className={cn(
                'flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-md text-xs transition-all cursor-pointer truncate',
                activeLens === 'plg'
                  ? 'bg-card text-foreground font-semibold shadow-2xs border border-border/60'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <span>PLG Fast</span>
              <span className="font-mono text-[10px] opacity-75">({lensCounts.plg})</span>
            </button>
          </div>
        </CardHeader>

        {/* =========================================================================
            CONTENT: Airy, Breathable Intelligence Dossiers (Streamlined & Crisp)
            ========================================================================= */}
        <CardContent className="p-0 pt-4 flex-1 flex flex-col justify-between space-y-4">
          {radarLeads.length === 0 ? (
            <EmptyState
              icon={Target}
              title="No Deals Match Selected Lens"
              description="No active pipeline opportunities match this radar criterion."
              actionLabel="Reset to All Hotspots"
              onAction={() => setActiveLens('all')}
              className="py-8"
            />
          ) : (
            <div className="divide-y divide-border/40">
              {radarLeads.map((lead, index) => {
                const signal = classifyLeadSignal(lead);
                const SignalIcon = signal.icon;
                const nba = getNextBestAction(lead);
                const tier = getConvictionTierStyle(lead.aiScore);

                return (
                  <div
                    key={lead.id}
                    className={cn(
                      'group transition-colors duration-150',
                      index === 0 ? 'pb-4' : index === radarLeads.length - 1 ? 'pt-4' : 'py-4'
                    )}
                  >
                    {/* Row 1: Identity, Signal, Value & Conviction */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2.5 min-w-0">
                        {/* Circle Avatar with Sentiment Ring */}
                        <div className="relative shrink-0">
                          <Avatar className="h-8 w-8 rounded-full border border-border/70 shadow-2xs">
                            <AvatarImage src={lead.avatarUrl} alt={lead.name} className="rounded-full" />
                            <AvatarFallback className="font-mono text-[11px] font-semibold bg-muted text-foreground rounded-full">
                              {lead.company
                                .split(' ')
                                .map((w) => w[0])
                                .slice(0, 2)
                                .join('')}
                            </AvatarFallback>
                          </Avatar>
                          <span
                            className={cn(
                              'absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full ring-2 ring-card',
                              lead.aiSentiment === 'positive'
                                ? 'bg-success'
                                : lead.aiSentiment === 'critical'
                                ? 'bg-destructive'
                                : lead.aiScore < 75
                                ? 'bg-warning'
                                : 'bg-muted-foreground'
                            )}
                          />
                        </div>

                        {/* Company & Signal Badge */}
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-sm text-foreground truncate group-hover:text-primary transition-colors">
                              {lead.company}
                            </span>

                            <Badge
                              variant={signal.badgeVariant}
                              className="text-[9px] font-mono px-1.5 py-0 h-4 inline-flex items-center gap-1 font-bold"
                            >
                              <SignalIcon className="h-2.5 w-2.5" />
                              <span>{signal.label}</span>
                            </Badge>
                          </div>
                          <p className="text-[11px] text-muted-foreground truncate mt-0.5">
                            {lead.name} · <span className="uppercase font-mono text-[10px]">{lead.stage}</span>
                          </p>
                        </div>
                      </div>

                      {/* Right: Deal Value + Dynamic Colored Conviction */}
                      <div className="text-right shrink-0">
                        <div className="font-display font-extrabold text-sm sm:text-base text-foreground tabular-nums">
                          ${lead.dealValue.toLocaleString()}
                        </div>
                        <div className={cn('inline-flex items-center gap-1 text-[11px] font-mono font-bold mt-0.5', tier.textColor)}>
                          <Flame className="h-2.5 w-2.5 shrink-0" />
                          <span>{lead.aiScore}% Conviction</span>
                        </div>
                      </div>
                    </div>

                    {/* Row 2: Unified Catalyst & Next-Action Box (Smooth Tier Gradient) */}
                    <div
                      className={cn(
                        'mt-2.5 rounded-r-lg border-l-2 pl-3.5 pr-3 py-2 text-xs space-y-1 transition-all duration-150',
                        tier.borderColor,
                        tier.bgGradient
                      )}
                    >
                      <p className="text-foreground/90 leading-relaxed">
                        {lead.aiScoreReason}
                      </p>
                      <p className="text-[11px] text-muted-foreground pt-0.5">
                        <strong className="text-foreground font-medium">Next: </strong>
                        {nba.actionText}
                      </p>
                    </div>

                    {/* Row 3: Touchpoint Meta & Ghost Action Triggers */}
                    <div className="mt-2 flex items-center justify-between text-[11px] text-muted-foreground">
                      <span className="font-mono">
                        {lead.assignedAgentName.split(' ')[0]} · Touch: {lead.lastContactedAt}
                      </span>

                      <div className="flex items-center gap-1.5">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 text-xs px-2.5 gap-1.5 text-muted-foreground hover:text-foreground"
                          onClick={() => {
                            setSelectedLeadId(lead.id);
                            openAiDrawer({
                              type: 'lead',
                              entityId: lead.id,
                              initialTab: 'draft',
                            });
                          }}
                        >
                          <Mail className="h-3.5 w-3.5" />
                          <span>Draft</span>
                        </Button>

                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 text-xs px-2.5 gap-1.5 text-muted-foreground hover:text-foreground hover:bg-highlight/10 hover:text-highlight transition-colors"
                          onClick={() => {
                            setSelectedLeadId(lead.id);
                            openAiDrawer({
                              type: 'lead',
                              entityId: lead.id,
                              initialTab: 'lead-scoring',
                            });
                          }}
                        >
                          <Zap className="h-3.5 w-3.5 text-highlight" />
                          <span>AI Triage</span>
                          <ArrowUpRight className="h-3 w-3 opacity-60" />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* =========================================================================
              FOOTER: Clean Single Line Summary
              ========================================================================= */}
          <div className="flex items-center justify-between pt-4 border-t border-border/50 text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <span className="text-foreground font-medium">
                In-Scope Value:{' '}
                <span className="font-mono font-bold text-highlight">
                  ${totalInScopeValue.toLocaleString()}
                </span>
              </span>
              <span className="text-[11px] font-mono text-muted-foreground hidden sm:inline">
                ({radarLeads.length} deals)
              </span>
            </div>

            <Link
              href="/crm/leads"
              className="text-xs font-semibold text-foreground hover:text-primary transition-colors inline-flex items-center gap-1 group"
            >
              <span>Pipeline Kanban</span>
              <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
        </CardContent>
      </Card>
    </TooltipProvider>
  );
}
