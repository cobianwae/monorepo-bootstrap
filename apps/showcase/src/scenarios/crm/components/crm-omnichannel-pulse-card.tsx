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
  Skeleton,
  SegmentedControl,
  SegmentedControlItem,
  type TimelineItem,
  type TimelineItemStatus,
  cn,
} from '@ds/ui';
import { useCrm } from '../store/crm-context';

interface CrmOmnichannelPulseCardProps {
  className?: string;
  isLoading?: boolean;
}

export function CrmOmnichannelPulseCard({ className, isLoading = false }: CrmOmnichannelPulseCardProps) {
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

  if (isLoading) {
    return (
      <Card
        className={cn(
          'flex flex-col justify-between border border-border/80 bg-card p-6 md:p-7 shadow-xs rounded-2xl',
          className
        )}
      >
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-0 pb-4 border-b border-border/60">
          <div className="space-y-1.5">
            <Skeleton className="h-6 w-44" />
            <Skeleton className="h-3.5 w-60" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-5 w-20 rounded-full" />
          </div>
        </CardHeader>

        <CardContent className="p-0 pt-6 space-y-5 flex-1 flex flex-col justify-between">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-18 rounded-lg" />
            ))}
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-24" />
              <div className="flex items-center gap-1 p-1 bg-muted/30 rounded-lg">
                <Skeleton className="h-6 w-12" />
                <Skeleton className="h-6 w-14" />
                <Skeleton className="h-6 w-14" />
              </div>
            </div>

            <div className="space-y-3 pt-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-start gap-3">
                  <Skeleton className="h-6 w-6 rounded-full shrink-0" />
                  <div className="space-y-1.5 flex-1">
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-3 w-56" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-border/30">
            <div className="flex items-center gap-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center gap-1.5">
                  <Skeleton className="h-5 w-5 rounded-full" />
                  <Skeleton className="h-3.5 w-12" />
                </div>
              ))}
            </div>
            <Skeleton className="h-4 w-24" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn('flex flex-col justify-between border border-border/80 bg-card p-6 md:p-7 shadow-xs rounded-2xl transition-all duration-200', className)}>
      <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-0 pb-4 border-b border-border/60">
        <div className="space-y-1">
          <CardTitle className="font-display text-lg sm:text-xl font-bold tracking-tight text-foreground">
            Omnichannel Pulse
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground">
            Multi-channel speed & sales team capacity
          </CardDescription>
        </div>

        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 text-xs text-success font-mono font-medium">
            <span className="h-2 w-2 rounded-full bg-success" />
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
          <div className="rounded-lg border border-border/50 bg-card/70 p-3 shadow-2xs">
            <div className="flex items-center gap-1.5 text-[11px] font-medium text-foreground">
              <MessageSquare className="h-3.5 w-3.5 text-success" />
              <span>WhatsApp</span>
            </div>
            <p className="font-mono text-xs font-bold text-foreground mt-1">89.2% Open</p>
            <span className="text-[10px] text-muted-foreground font-mono">14.5% Conv</span>
          </div>

          <div className="rounded-lg border border-border/50 bg-card/70 p-3 shadow-2xs">
            <div className="flex items-center gap-1.5 text-[11px] font-medium text-foreground">
              <Mail className="h-3.5 w-3.5 text-primary" />
              <span>Email</span>
            </div>
            <p className="font-mono text-xs font-bold text-foreground mt-1">2.4m SLA</p>
            <span className="text-[10px] text-muted-foreground font-mono">1,420 sent</span>
          </div>

          <div className="rounded-lg border border-border/50 bg-card/70 p-3 shadow-2xs">
            <div className="flex items-center gap-1.5 text-[11px] font-medium text-foreground">
              <Radio className="h-3.5 w-3.5 text-highlight" />
              <span>Webchat</span>
            </div>
            <p className="font-mono text-xs font-bold text-foreground mt-1">98.2% CSAT</p>
            <span className="text-[10px] text-muted-foreground font-mono">&lt;45s Reply</span>
          </div>

          <div className="rounded-lg border border-border/50 bg-card/70 p-3 shadow-2xs">
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
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-foreground">Live Activity</span>
            <SegmentedControl
              type="single"
              value={filterType}
              onValueChange={(val) => {
                if (val) setFilterType(val as 'all' | 'deals' | 'chats');
              }}
              className="h-7 bg-muted/50 p-0.5 shadow-2xs"
            >
              <SegmentedControlItem value="all" className="h-6 px-2.5 text-xs font-mono">
                All
              </SegmentedControlItem>
              <SegmentedControlItem value="deals" className="h-6 px-2.5 text-xs font-mono">
                Deals
              </SegmentedControlItem>
              <SegmentedControlItem value="chats" className="h-6 px-2.5 text-xs font-mono">
                Chats
              </SegmentedControlItem>
            </SegmentedControl>
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
