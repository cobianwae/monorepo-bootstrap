'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  Flame,
  Sparkles,
  ArrowRight,
  Lightbulb,
  Mail,
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
    <Card className={cn('flex flex-col justify-between shadow-xs border-border/80 bg-card/90 backdrop-blur-sm', className)}>
      <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-border/50">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Flame className="h-4 w-4 text-highlight" />
            <CardTitle className="font-display text-base sm:text-lg font-bold text-foreground">
              AI Opportunity Radar & Priority Deals
            </CardTitle>
          </div>
          <CardDescription className="text-xs">
            High-intent deals with contextual catalysts & 1-click Copilot triage
          </CardDescription>
        </div>

        <Badge variant="highlight" className="font-mono text-xs px-2">
          Score ≥ 80
        </Badge>
      </CardHeader>

      <CardContent className="pt-4 space-y-3.5 flex-1 flex flex-col justify-between">
        {highIntentLeads.length === 0 ? (
          <EmptyState
            icon={Sparkles}
            title="No High-Intent Deals Flagged"
            description="All active deals are progressing within standard parameters."
            actionLabel="View All Leads"
            onAction={() => setSelectedLeadId(null)}
            className="py-6"
          />
        ) : (
          <div className="space-y-3">
            {highIntentLeads.map((lead) => (
              <div
                key={lead.id}
                className="group relative rounded-xl border border-border/70 bg-card p-3.5 hover:border-highlight/50 hover:shadow-sm transition-all"
              >
                {/* Top Row: Lead & Company Info + Deal Value */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Avatar className="h-8 w-8 rounded-lg border border-border/60">
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
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-sm text-foreground truncate group-hover:text-primary transition-colors">
                          {lead.company}
                        </span>
                        <Badge variant="outline" className="text-[10px] uppercase font-mono px-1.5 py-0 h-4">
                          {lead.stage}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground truncate">
                        {lead.name} • {lead.title}
                      </p>
                    </div>
                  </div>

                  {/* Deal Value & Score Tag */}
                  <div className="text-right shrink-0">
                    <span className="font-display font-extrabold text-sm text-foreground tabular-nums">
                      ${lead.dealValue.toLocaleString()}
                    </span>
                    <div className="flex items-center justify-end gap-1">
                      <span className="font-mono text-[11px] font-bold text-highlight">
                        {lead.aiScore}/100
                      </span>
                      <span className="text-[10px] text-muted-foreground uppercase font-mono">
                        AI
                      </span>
                    </div>
                  </div>
                </div>

                {/* Middle: AI Key Catalyst / Driver */}
                <div className="mt-2.5 rounded-lg bg-muted/40 p-2 text-xs text-foreground/90 flex items-start gap-1.5 border border-border/40">
                  <Lightbulb className="h-3.5 w-3.5 text-highlight shrink-0 mt-0.5" />
                  <span className="leading-snug text-muted-foreground">
                    <strong className="text-foreground font-medium">Catalyst: </strong>
                    {lead.aiScoreReason}
                  </span>
                </div>

                {/* Bottom Row: 1-Click Action Bar */}
                <div className="mt-3 flex items-center justify-between pt-2 border-t border-border/40 text-xs">
                  <span className="text-[11px] text-muted-foreground font-mono">
                    Owner: {lead.assignedAgentName.split(' ')[0]}
                  </span>

                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 text-xs px-2 gap-1 text-muted-foreground hover:text-foreground"
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
                      className="h-7 text-xs px-2.5 gap-1 border-highlight/30 bg-highlight/5 text-foreground hover:bg-highlight/15 transition-colors shadow-xs"
                      onClick={() => {
                        setSelectedLeadId(lead.id);
                        openAiDrawer({
                          type: 'lead',
                          entityId: lead.id,
                          initialTab: 'lead-scoring',
                        });
                      }}
                    >
                      <Sparkles className="h-3 w-3 text-highlight" />
                      <span>AI Triage</span>
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Narrative Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-border/40 text-xs text-muted-foreground">
          <span className="font-medium text-foreground">
            Total ready-to-close value:{' '}
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
