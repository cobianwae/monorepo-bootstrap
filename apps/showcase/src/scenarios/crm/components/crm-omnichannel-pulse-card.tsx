'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  MessageSquare,
  Mail,
  Phone,
  Radio,
  CheckCircle2,
  Megaphone,
  UserPlus,
  ArrowRight,
  Flame,
  Activity,
} from 'lucide-react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Badge,
  Avatar,
  AvatarFallback,
  AvatarImage,
  Timeline,
  type TimelineItem,
  type TimelineItemStatus,
  cn,
} from '@ds/ui';
import { useCrm } from '../store/crm-context';

interface CrmOmnichannelPulseCardProps {
  className?: string;
}

export function CrmOmnichannelPulseCard({ className }: CrmOmnichannelPulseCardProps) {
  const { activities, metrics, agents } = useCrm();
  const [filterType, setFilterType] = React.useState<'all' | 'deals' | 'chats'>('all');

  const filteredActivities = React.useMemo(() => {
    if (filterType === 'deals') {
      return activities.filter((a) => a.type === 'deal_won' || a.type === 'stage_moved');
    }
    if (filterType === 'chats') {
      return activities.filter((a) => a.type === 'message_sent' || a.type === 'campaign_launched');
    }
    return activities;
  }, [activities, filterType]);

  const timelineItems: TimelineItem[] = React.useMemo(() => {
    return filteredActivities.slice(0, 3).map((act) => {
      let status: TimelineItemStatus = 'info';
      let icon = Activity;
      if (act.type === 'deal_won') {
        status = 'success';
        icon = CheckCircle2;
      } else if (act.type === 'campaign_launched') {
        status = 'warning';
        icon = Megaphone;
      } else if (act.type === 'lead_created') {
        status = 'info';
        icon = UserPlus;
      } else if (act.type === 'message_sent') {
        status = 'default';
        icon = MessageSquare;
      } else if (act.type === 'ai_insight') {
        status = 'warning';
        icon = Flame;
      }

      return {
        id: act.id,
        title: act.title,
        description: act.description,
        timestamp: act.timestamp,
        status,
        icon,
        badges: [{ label: act.actorName, variant: 'outline' }],
      };
    });
  }, [filteredActivities]);

  return (
    <Card className={cn('flex flex-col justify-between border border-border/80 bg-card p-6 shadow-xs rounded-xl', className)}>
      <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-0 pb-4 border-b border-border/60">
        <div className="space-y-1">
          <CardTitle className="font-display text-base sm:text-lg font-bold text-foreground">
            Omnichannel Pulse
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground">
            Multi-channel speed & sales team capacity
          </CardDescription>
        </div>

        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 text-xs text-success font-mono font-medium">
            <span className="h-2 w-2 rounded-full bg-success animate-pulse" />
            {metrics.avgResponseTimeMin}m SLA
          </span>
          <Badge variant="outline" className="font-mono text-xs shadow-2xs">
            {metrics.csatScore}% CSAT
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="p-0 pt-6 space-y-5 flex-1 flex flex-col justify-between">
        {/* Channel Barometer Pills (Clean Horizontal Flow with micro-shadow) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="rounded-lg border border-border/50 bg-card/70 p-2.5 shadow-2xs">
            <div className="flex items-center gap-1.5 text-[11px] font-medium text-foreground">
              <MessageSquare className="h-3.5 w-3.5 text-success" />
              <span>WhatsApp</span>
            </div>
            <p className="font-mono text-xs font-bold text-foreground mt-1">89.2% Open</p>
            <span className="text-[10px] text-muted-foreground font-mono">14.5% Conv</span>
          </div>

          <div className="rounded-lg border border-border/50 bg-card/70 p-2.5 shadow-2xs">
            <div className="flex items-center gap-1.5 text-[11px] font-medium text-foreground">
              <Mail className="h-3.5 w-3.5 text-primary" />
              <span>Email</span>
            </div>
            <p className="font-mono text-xs font-bold text-foreground mt-1">2.4m SLA</p>
            <span className="text-[10px] text-muted-foreground font-mono">1,420 sent</span>
          </div>

          <div className="rounded-lg border border-border/50 bg-card/70 p-2.5 shadow-2xs">
            <div className="flex items-center gap-1.5 text-[11px] font-medium text-foreground">
              <Radio className="h-3.5 w-3.5 text-highlight" />
              <span>Webchat</span>
            </div>
            <p className="font-mono text-xs font-bold text-foreground mt-1">98.2% CSAT</p>
            <span className="text-[10px] text-muted-foreground font-mono">&lt;45s Reply</span>
          </div>

          <div className="rounded-lg border border-border/50 bg-card/70 p-2.5 shadow-2xs">
            <div className="flex items-center gap-1.5 text-[11px] font-medium text-foreground">
              <Phone className="h-3.5 w-3.5 text-muted-foreground" />
              <span>Voice HD</span>
            </div>
            <p className="font-mono text-xs font-bold text-foreground mt-1">18m Logged</p>
            <span className="text-[10px] text-muted-foreground font-mono">HIPAA Secured</span>
          </div>
        </div>

        {/* Stream Filter & Timeline */}
        <div className="space-y-3">
          <div className="flex items-center justify-between border-b border-border/30 pb-2">
            <span className="text-xs font-semibold text-foreground">Live Activity</span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setFilterType('all')}
                className={`px-2 py-0.5 rounded text-[11px] font-mono transition-colors cursor-pointer ${
                  filterType === 'all'
                    ? 'bg-primary text-primary-foreground font-semibold shadow-2xs'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                All
              </button>
              <button
                type="button"
                onClick={() => setFilterType('deals')}
                className={`px-2 py-0.5 rounded text-[11px] font-mono transition-colors cursor-pointer ${
                  filterType === 'deals'
                    ? 'bg-primary text-primary-foreground font-semibold shadow-2xs'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Deals
              </button>
              <button
                type="button"
                onClick={() => setFilterType('chats')}
                className={`px-2 py-0.5 rounded text-[11px] font-mono transition-colors cursor-pointer ${
                  filterType === 'chats'
                    ? 'bg-primary text-primary-foreground font-semibold shadow-2xs'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Chats
              </button>
            </div>
          </div>

          <Timeline items={timelineItems} />
        </div>

        {/* Team Capacity Mini-Strip */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-border/30">
          <div className="flex items-center gap-3">
            {agents.slice(0, 3).map((agent) => (
              <div key={agent.id} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Avatar className="h-5 w-5 border border-border/50 shadow-2xs">
                  <AvatarImage src={agent.avatarUrl} alt={agent.name} />
                  <AvatarFallback className="text-[9px]">
                    {agent.name[0]}
                  </AvatarFallback>
                </Avatar>
                <span className="font-medium text-foreground text-[11px]">
                  {agent.name.split(' ')[0]}
                </span>
                <span className="h-1.5 w-1.5 rounded-full bg-success" />
              </div>
            ))}
          </div>

          <Link
            href="/crm/contact-center"
            className="text-xs font-semibold text-foreground hover:text-primary transition-colors inline-flex items-center gap-1"
          >
            Open Inbox
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
