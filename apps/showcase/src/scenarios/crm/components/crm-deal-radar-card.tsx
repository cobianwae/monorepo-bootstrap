'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  Zap,
  ArrowRight,
  Mail,
  Target,
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
  cn,
} from '@ds/ui';
import { useCrm } from '../store/crm-context';

interface CrmDealRadarCardProps {
  className?: string;
}

export function CrmDealRadarCard({ className }: CrmDealRadarCardProps) {
  const { leads, openAiDrawer, setSelectedLeadId } = useCrm();

  const highIntentLeads = React.useMemo(() => {
    return leads
      .filter((l) => l.aiScore >= 80 && l.stage !== 'won' && l.stage !== 'lost')
      .sort((a, b) => b.aiScore - a.aiScore)
      .slice(0, 3);
  }, [leads]);

  const totalActionableValue = React.useMemo(() => {
    return highIntentLeads.reduce((sum, l) => sum + l.dealValue, 0);
  }, [highIntentLeads]);

  return (
    <Card className={cn('flex flex-col justify-between border border-border/80 bg-card p-6 shadow-xs rounded-xl', className)}>
      <CardHeader className="flex flex-row items-center justify-between p-0 pb-4 border-b border-border/60">
        <div className="space-y-1">
          <CardTitle className="font-display text-base sm:text-lg font-bold text-foreground">
            AI Opportunity Radar
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground">
            High-conviction deals with key catalysts and 1-click Copilot triage
          </CardDescription>
        </div>

        <Badge variant="highlight-outline" className="font-mono text-xs px-2 shadow-2xs">
          Score ≥ 80
        </Badge>
      </CardHeader>

      <CardContent className="p-0 pt-6 space-y-4 flex-1 flex flex-col justify-between">
        {highIntentLeads.length === 0 ? (
          <EmptyState
            icon={Target}
            title="No High-Intent Deals Flagged"
            description="All active deals are progressing within standard parameters."
            actionLabel="View All Leads"
            onAction={() => setSelectedLeadId(null)}
            className="py-6"
          />
        ) : (
          <div className="space-y-3.5">
            {highIntentLeads.map((lead) => {
              // Differentiated sentiment / health signals
              const isWarning = lead.id === 'lead-102'; // Apex Health has HIPAA block
              const isFastTrack = lead.id === 'lead-101'; // FinTech Velocity is positive

              return (
                <div
                  key={lead.id}
                  className="group relative rounded-xl border border-border/50 bg-card/90 p-4 shadow-2xs hover:border-highlight/40 hover:shadow-xs transition-all"
                >
                  {/* Top Row: Lead & Company Info + Deal Value */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <Avatar className="h-9 w-9 rounded-lg border border-border/60 shadow-2xs">
                        <AvatarImage src={lead.avatarUrl} alt={lead.name} />
                        <AvatarFallback className="font-mono text-xs font-bold bg-muted">
                          {lead.company
                            .split(' ')
                            .map((w) => w[0])
                            .slice(0, 2)
                            .join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm text-foreground truncate group-hover:text-primary transition-colors">
                            {lead.company}
                          </span>
                          <Badge variant="outline" className="text-[10px] uppercase font-mono px-1.5 py-0 h-4">
                            {lead.stage}
                          </Badge>
                          {isWarning ? (
                            <Badge variant="warning-outline" className="text-[9px] font-mono px-1.5 py-0 h-4">
                              Review Needed
                            </Badge>
                          ) : isFastTrack ? (
                            <Badge variant="success-outline" className="text-[9px] font-mono px-1.5 py-0 h-4">
                              Fast-Track
                            </Badge>
                          ) : null}
                        </div>
                        <p className="text-xs text-muted-foreground truncate">
                          {lead.name} · {lead.title}
                        </p>
                      </div>
                    </div>

                    {/* Deal Value & AI Score */}
                    <div className="text-right shrink-0">
                      <span className="font-display font-extrabold text-sm text-foreground tabular-nums">
                        ${lead.dealValue.toLocaleString()}
                      </span>
                      <div className="flex items-center justify-end gap-1 mt-0.5">
                        <span className="font-mono text-[11px] font-bold text-highlight">
                          {lead.aiScore}/100
                        </span>
                        <span className="text-[10px] text-muted-foreground font-mono">
                          AI
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Middle: 1-line Catalyst */}
                  <p className="mt-2.5 text-xs text-muted-foreground leading-relaxed">
                    <span className="text-foreground font-medium">Catalyst: </span>
                    {lead.aiScoreReason}
                  </p>

                  {/* Bottom Row: Actions */}
                  <div className="mt-3 flex items-center justify-between pt-2.5 border-t border-border/30 text-xs">
                    <span className="text-[11px] text-muted-foreground font-mono">
                      Owner: {lead.assignedAgentName.split(' ')[0]}
                    </span>

                    <div className="flex items-center gap-2">
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
                        <Mail className="h-3 w-3" />
                        <span>Draft Email</span>
                      </Button>

                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 text-xs px-2.5 gap-1.5 border-highlight/30 bg-highlight/5 text-foreground hover:bg-highlight/15 transition-colors shadow-2xs"
                        onClick={() => {
                          setSelectedLeadId(lead.id);
                          openAiDrawer({
                            type: 'lead',
                            entityId: lead.id,
                            initialTab: 'lead-scoring',
                          });
                        }}
                      >
                        <Zap className="h-3 w-3 text-highlight" />
                        <span>AI Triage</span>
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Narrative Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-border/40 text-xs text-muted-foreground">
          <span className="font-medium text-foreground">
            Closing Value:{' '}
            <span className="font-mono font-bold text-highlight">
              ${totalActionableValue.toLocaleString()}
            </span>
          </span>
          <Link
            href="/crm/leads"
            className="text-xs font-semibold text-foreground hover:text-primary transition-colors inline-flex items-center gap-1"
          >
            All Pipeline Leads
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
