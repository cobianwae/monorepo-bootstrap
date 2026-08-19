'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  Headphones,
  MessageSquare,
  Mail,
  Phone,
  Radio,
  CheckCircle2,
  Megaphone,
  UserPlus,
  Sparkles,
  ArrowRight,
  Flame,
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
  const [filterType, setFilterType] = React.useState<'all' | 'deals' | 'ai' | 'messages'>('all');

  const filteredActivities = React.useMemo(() => {
    if (filterType === 'deals') {
      return activities.filter((a) => a.type === 'deal_won' || a.type === 'stage_moved');
    }
    if (filterType === 'ai') {
      return activities.filter((a) => a.type === 'ai_insight');
    }
    if (filterType === 'messages') {
      return activities.filter((a) => a.type === 'message_sent' || a.type === 'campaign_launched');
    }
    return activities;
  }, [activities, filterType]);

  const timelineItems: TimelineItem[] = React.useMemo(() => {
    return filteredActivities.slice(0, 4).map((act) => {
      let status: TimelineItemStatus = 'info';
      let icon = Sparkles;
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
    <Card className={cn('flex flex-col justify-between shadow-xs border-border/80 bg-card/90 backdrop-blur-sm', className)}>
      <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-3 border-b border-border/50">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Headphones className="h-4 w-4 text-primary" />
            <CardTitle className="font-display text-base sm:text-lg font-bold text-foreground">
              Omnichannel Pulse & Team Activity
            </CardTitle>
          </div>
          <CardDescription className="text-xs">
            Live multi-channel response velocity & sales team capacity
          </CardDescription>
        </div>

        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 text-xs text-success font-mono font-medium">
            <span className="h-2 w-2 rounded-full bg-success animate-pulse" />
            {metrics.avgResponseTimeMin}m avg SLA
          </span>
          <Badge variant="outline" className="font-mono text-xs">
            {metrics.csatScore}% CSAT
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="pt-4 space-y-4 flex-1 flex flex-col justify-between">
        {/* Multi-Channel Barometer (Nested Well) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 rounded-xl border border-border/60 bg-muted/30 p-3">
          <div className="space-y-1 bg-card/70 p-2 rounded-lg border border-border/40">
            <div className="flex items-center justify-between text-[11px] font-medium text-foreground">
              <span className="flex items-center gap-1">
                <MessageSquare className="h-3 w-3 text-success" />
                WhatsApp
              </span>
              <span className="font-mono text-success text-[10px]">Active</span>
            </div>
            <p className="font-mono text-xs font-bold text-foreground">89.2% Open</p>
            <span className="text-[10px] text-muted-foreground block font-mono">14.5% Conv</span>
          </div>

          <div className="space-y-1 bg-card/70 p-2 rounded-lg border border-border/40">
            <div className="flex items-center justify-between text-[11px] font-medium text-foreground">
              <span className="flex items-center gap-1">
                <Mail className="h-3 w-3 text-primary" />
                Email
              </span>
              <span className="font-mono text-muted-foreground text-[10px]">48.6% Open</span>
            </div>
            <p className="font-mono text-xs font-bold text-foreground">2.4m SLA</p>
            <span className="text-[10px] text-muted-foreground block font-mono">1,420 sent</span>
          </div>

          <div className="space-y-1 bg-card/70 p-2 rounded-lg border border-border/40">
            <div className="flex items-center justify-between text-[11px] font-medium text-foreground">
              <span className="flex items-center gap-1">
                <Radio className="h-3 w-3 text-highlight" />
                Webchat
              </span>
              <span className="font-mono text-highlight text-[10px]">Instant</span>
            </div>
            <p className="font-mono text-xs font-bold text-foreground">98.2% CSAT</p>
            <span className="text-[10px] text-muted-foreground block font-mono">&lt;45s First Reply</span>
          </div>

          <div className="space-y-1 bg-card/70 p-2 rounded-lg border border-border/40">
            <div className="flex items-center justify-between text-[11px] font-medium text-foreground">
              <span className="flex items-center gap-1">
                <Phone className="h-3 w-3 text-secondary-foreground" />
                Voice HD
              </span>
              <span className="font-mono text-muted-foreground text-[10px]">HIPAA</span>
            </div>
            <p className="font-mono text-xs font-bold text-foreground">18m Logged</p>
            <span className="text-[10px] text-muted-foreground block font-mono">Auto Transcribed</span>
          </div>
        </div>

        {/* Activity Filter Tabs & Timeline Feed */}
        <div className="space-y-3">
          <div className="flex items-center justify-between border-b border-border/40 pb-2">
            <span className="text-xs font-semibold text-foreground">Live Audit Stream</span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setFilterType('all')}
                className={`px-2 py-0.5 rounded text-[11px] font-mono transition-colors cursor-pointer ${
                  filterType === 'all'
                    ? 'bg-primary text-primary-foreground font-semibold'
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
                    ? 'bg-primary text-primary-foreground font-semibold'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Deals
              </button>
              <button
                type="button"
                onClick={() => setFilterType('ai')}
                className={`px-2 py-0.5 rounded text-[11px] font-mono transition-colors cursor-pointer ${
                  filterType === 'ai'
                    ? 'bg-primary text-primary-foreground font-semibold'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                AI Alerts
              </button>
              <button
                type="button"
                onClick={() => setFilterType('messages')}
                className={`px-2 py-0.5 rounded text-[11px] font-mono transition-colors cursor-pointer ${
                  filterType === 'messages'
                    ? 'bg-primary text-primary-foreground font-semibold'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Chats
              </button>
            </div>
          </div>

          <Timeline items={timelineItems} />
        </div>

        {/* Team Capacity Mini-Leaderboard */}
        <div className="space-y-2 pt-2 border-t border-border/40">
          <span className="text-[11px] font-semibold text-muted-foreground uppercase font-mono tracking-wider block">
            Team Workload & Status
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {agents.slice(0, 3).map((agent) => (
              <div
                key={agent.id}
                className="flex items-center justify-between p-2 rounded-lg border border-border/40 bg-muted/20 text-xs"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={agent.avatarUrl} alt={agent.name} />
                    <AvatarFallback className="text-[10px]">
                      {agent.name
                        .split(' ')
                        .map((n) => n[0])
                        .join('')}
                    </AvatarFallback>
                  </Avatar>
                  <span className="truncate font-medium text-foreground">
                    {agent.name.split(' ')[0]}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 shrink-0 font-mono text-[11px]">
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${
                      agent.status === 'available'
                        ? 'bg-success'
                        : agent.status === 'busy'
                        ? 'bg-warning'
                        : 'bg-muted-foreground'
                    }`}
                  />
                  <span className="text-muted-foreground">({agent.activeChatsCount} chats)</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Narrative Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-border/40 text-xs text-muted-foreground">
          <span className="font-mono text-[11px]">
            Showing 4 of {activities.length} recent system events
          </span>
          <Link
            href="/crm/contact-center"
            className="text-xs font-semibold text-foreground hover:text-primary transition-colors inline-flex items-center gap-1"
          >
            Open Contact Center
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
