'use client';

import * as React from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import {
  Sparkles,
  Columns3,
  TableProperties,
  Search,
  Flame,
  CheckCircle2,
  Trash2,
  ExternalLink,
  Mail,
  Phone,
  UserPlus,
  Tag,
  X,
  Lightbulb,
} from 'lucide-react';
import {
  Button,
  Badge,
  Input,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  Label,
  Avatar,
  AvatarImage,
  AvatarFallback,
  DataTable,
  KanbanBoard,
  SegmentedControl,
  SegmentedControlItem,
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  DescriptionList,
  TagInput,
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
  type KanbanColumnData,
  type KanbanItemData,
} from '@ds/ui';
import { PageHeader } from '@/components/page-header';
import { useCrm } from '@/scenarios/crm/store/crm-context';
import type { Lead, LeadStage, LeadPriority } from '@/scenarios/crm/types';

const STAGE_CONFIG: Record<
  LeadStage,
  { label: string; badgeVariant: 'secondary' | 'outline' | 'highlight' | 'success' | 'destructive' | 'warning' }
> = {
  new: { label: 'New Inbound', badgeVariant: 'outline' },
  contacted: { label: 'Contacted', badgeVariant: 'secondary' },
  qualified: { label: 'Qualified', badgeVariant: 'warning' },
  proposal: { label: 'Proposal', badgeVariant: 'highlight' },
  negotiation: { label: 'Negotiation', badgeVariant: 'warning' },
  won: { label: 'Closed Won', badgeVariant: 'success' },
  lost: { label: 'Closed Lost', badgeVariant: 'destructive' },
};

const PRIORITY_BADGE_VARIANT: Record<LeadPriority, 'secondary' | 'warning' | 'destructive' | 'outline'> = {
  low: 'secondary',
  medium: 'outline',
  high: 'warning',
  urgent: 'destructive',
};

const ALL_STAGES: LeadStage[] = ['new', 'contacted', 'qualified', 'proposal', 'negotiation', 'won', 'lost'];

export default function LeadsPage() {
  const {
    leads,
    selectedLeadId,
    setSelectedLeadId,
    addLead,
    moveLeadStage,
    convertLead,
    deleteLead,
    openAiDrawer,
    currentAgent,
  } = useCrm();

  const [viewMode, setViewMode] = React.useState<'kanban' | 'table'>('kanban');
  const [searchQuery, setSearchQuery] = React.useState('');
  const [stageFilter, setStageFilter] = React.useState<string>('all');
  const [onlyHighIntent, setOnlyHighIntent] = React.useState(false);
  const [isCreateOpen, setIsCreateOpen] = React.useState(false);
  const [leadToDelete, setLeadToDelete] = React.useState<string | null>(null);

  // New Lead Form state
  const [newLeadForm, setNewLeadForm] = React.useState({
    name: '',
    company: '',
    title: '',
    email: '',
    phone: '',
    dealValue: 50000,
    stage: 'new' as LeadStage,
    priority: 'medium' as LeadPriority,
    source: 'Website Form' as Lead['source'],
    tags: ['Enterprise', 'Inbound'],
  });

  // Filtered Leads
  const filteredLeads = React.useMemo(() => {
    return leads.filter((lead) => {
      const q = searchQuery.toLowerCase().trim();
      const matchQuery =
        !q ||
        lead.name.toLowerCase().includes(q) ||
        lead.company.toLowerCase().includes(q) ||
        lead.email.toLowerCase().includes(q) ||
        lead.tags.some((t) => t.toLowerCase().includes(q));

      const matchStage = stageFilter === 'all' || lead.stage === stageFilter;
      const matchHighIntent = !onlyHighIntent || lead.aiScore >= 80;

      return matchQuery && matchStage && matchHighIntent;
    });
  }, [leads, searchQuery, stageFilter, onlyHighIntent]);

  // Selected Lead for Drawer
  const activeLead = React.useMemo(() => {
    return leads.find((l) => l.id === selectedLeadId) || null;
  }, [leads, selectedLeadId]);

  // Kanban setup with all stages
  const kanbanColumns: KanbanColumnData[] = React.useMemo(() => {
    return ALL_STAGES.map((stage) => ({
      id: stage,
      title: STAGE_CONFIG[stage].label,
      items: filteredLeads.filter((l) => l.stage === stage).map((l) => l.id),
    }));
  }, [filteredLeads]);

  const kanbanItems: Record<string, KanbanItemData> = React.useMemo(() => {
    const map: Record<string, KanbanItemData> = {};
    filteredLeads.forEach((l) => {
      map[l.id] = {
        id: l.id,
        title: l.name,
        label: l.priority,
      };
    });
    return map;
  }, [filteredLeads]);

  const handleKanbanColumnsChange = (nextCols: KanbanColumnData[]) => {
    nextCols.forEach((col) => {
      const targetStage = col.id as LeadStage;
      col.items.forEach((leadId) => {
        const lead = leads.find((l) => l.id === leadId);
        if (lead && lead.stage !== targetStage) {
          moveLeadStage(leadId, targetStage);
        }
      });
    });
  };

  const handleCreateLeadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLeadForm.name || !newLeadForm.company || !newLeadForm.email) return;

    addLead({
      name: newLeadForm.name,
      company: newLeadForm.company,
      title: newLeadForm.title || 'Decision Maker',
      email: newLeadForm.email,
      phone: newLeadForm.phone || '+1 (555) 000-0000',
      stage: newLeadForm.stage,
      priority: newLeadForm.priority,
      dealValue: Number(newLeadForm.dealValue) || 25000,
      aiScore: Math.floor(Math.random() * 30) + 65,
      aiScoreReason: 'Initial inbound qualification criteria matched standard ICP profile.',
      aiSentiment: 'positive',
      assignedAgentId: currentAgent.id,
      assignedAgentName: currentAgent.name,
      source: newLeadForm.source,
      tags: newLeadForm.tags.length > 0 ? newLeadForm.tags : ['Inbound'],
      lastContactedAt: 'Just now',
    });

    setIsCreateOpen(false);
    setNewLeadForm({
      name: '',
      company: '',
      title: '',
      email: '',
      phone: '',
      dealValue: 50000,
      stage: 'new',
      priority: 'medium',
      source: 'Website Form',
      tags: ['Enterprise', 'Inbound'],
    });
  };

  // Table Columns with improved typography
  const tableColumns: ColumnDef<Lead>[] = React.useMemo(
    () => [
      {
        accessorKey: 'name',
        header: 'Lead & Organization',
        cell: ({ row }) => {
          const lead = row.original;
          return (
            <div className="flex items-center gap-3 py-1">
              <Avatar className="h-8 w-8 border border-border">
                <AvatarFallback className="text-xs font-bold font-mono">
                  {lead.name.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <span className="font-semibold text-foreground text-sm block">
                  {lead.name}
                </span>
                <span className="text-xs text-muted-foreground">
                  {lead.company} • {lead.title}
                </span>
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: 'stage',
        header: 'Pipeline Stage',
        cell: ({ row }) => {
          const stage = row.original.stage;
          return (
            <Badge
              variant={STAGE_CONFIG[stage]?.badgeVariant || 'outline'}
              className="text-xs uppercase font-mono"
            >
              {STAGE_CONFIG[stage]?.label || stage}
            </Badge>
          );
        },
      },
      {
        accessorKey: 'aiScore',
        header: 'AI Score',
        cell: ({ row }) => {
          const score = row.original.aiScore;
          return (
            <div className="flex items-center gap-1.5 font-mono text-xs">
              {score >= 80 ? (
                <Flame className="h-3.5 w-3.5 text-highlight" />
              ) : (
                <Sparkles className="h-3.5 w-3.5 text-muted-foreground" />
              )}
              <span className={score >= 80 ? 'font-bold text-highlight' : 'text-foreground'}>
                {score}/100
              </span>
            </div>
          );
        },
      },
      {
        accessorKey: 'dealValue',
        header: 'Deal Value',
        cell: ({ row }) => (
          <span className="font-mono font-bold text-sm text-foreground">
            ${row.original.dealValue.toLocaleString()}
          </span>
        ),
      },
      {
        accessorKey: 'priority',
        header: 'Priority',
        cell: ({ row }) => (
          <Badge
            variant={PRIORITY_BADGE_VARIANT[row.original.priority] || 'secondary'}
            className="text-xs capitalize"
          >
            {row.original.priority}
          </Badge>
        ),
      },
      {
        accessorKey: 'assignedAgentName',
        header: 'Assigned To',
        cell: ({ row }) => (
          <span className="text-sm text-muted-foreground">
            {row.original.assignedAgentName}
          </span>
        ),
      },
      {
        accessorKey: 'lastContactedAt',
        header: 'Last Contacted',
        cell: ({ row }) => (
          <span className="text-xs text-muted-foreground font-mono">
            {row.original.lastContactedAt}
          </span>
        ),
      },
      {
        id: 'actions',
        header: '',
        cell: ({ row }) => {
          const lead = row.original;
          return (
            <div className="flex items-center justify-end gap-1">
              {lead.stage !== 'won' && (
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-8 text-xs text-success hover:bg-success/10"
                  onClick={(e) => {
                    e.stopPropagation();
                    convertLead(lead.id);
                  }}
                  title="Convert to Deal"
                >
                  <CheckCircle2 className="h-4 w-4" />
                </Button>
              )}
              <Button
                size="sm"
                variant="ghost"
                className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedLeadId(lead.id);
                }}
                title="View details"
              >
                <ExternalLink className="h-4 w-4" />
              </Button>
            </div>
          );
        },
      },
    ],
    [convertLead, setSelectedLeadId]
  );

  return (
    <div className="space-y-8 animate-in fade-in-50 duration-200">
      {/* Official Design System PageHeader */}
      <PageHeader
        eyebrow="Opportunity Engine"
        eyebrowIcon={Sparkles}
        title="Leads & Opportunities Pipeline"
        description="Manage sales prospects across deal stages, evaluate AI intent scores, and convert high-probability opportunities into closed revenue."
        actions={
          <div className="flex items-center gap-2.5">
            <SegmentedControl
              type="single"
              value={viewMode}
              onValueChange={(v) => v && setViewMode(v as 'kanban' | 'table')}
              aria-label="View toggle"
            >
              <SegmentedControlItem value="kanban" aria-label="Kanban view">
                <Columns3 className="h-4 w-4" />
                <span className="text-xs font-medium">Kanban</span>
              </SegmentedControlItem>
              <SegmentedControlItem value="table" aria-label="Table view">
                <TableProperties className="h-4 w-4" />
                <span className="text-xs font-medium">Table</span>
              </SegmentedControlItem>
            </SegmentedControl>

            <Button size="sm" onClick={() => setIsCreateOpen(true)} className="h-9 gap-1.5 shadow-xs">
              <UserPlus className="h-4 w-4" />
              <span>Add Lead</span>
            </Button>
          </div>
        }
      />

      {/* Filter and Search Bar with DS Select */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card/60 p-3.5 shadow-xs">
        <div className="flex flex-wrap items-center gap-2.5 flex-1 min-w-[280px]">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search leads, companies, tags..."
              className="h-9 pl-9 text-xs bg-background"
            />
          </div>

          {/* Stage filter with DS Select */}
          <div className="w-44">
            <Select value={stageFilter} onValueChange={setStageFilter}>
              <SelectTrigger className="h-9 text-xs">
                <SelectValue placeholder="All Stages" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Stages ({leads.length})</SelectItem>
                <SelectItem value="new">New Inbound</SelectItem>
                <SelectItem value="contacted">Contacted</SelectItem>
                <SelectItem value="qualified">Qualified</SelectItem>
                <SelectItem value="proposal">Proposal</SelectItem>
                <SelectItem value="negotiation">Negotiation</SelectItem>
                <SelectItem value="won">Closed Won</SelectItem>
                <SelectItem value="lost">Closed Lost</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* High Intent toggle */}
          <Button
            size="sm"
            variant={onlyHighIntent ? 'highlight' : 'outline'}
            onClick={() => setOnlyHighIntent((prev) => !prev)}
            className="h-9 gap-1.5 text-xs"
          >
            <Flame className="h-3.5 w-3.5" />
            High Intent (≥80)
          </Button>

          {(searchQuery || stageFilter !== 'all' || onlyHighIntent) && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                setSearchQuery('');
                setStageFilter('all');
                setOnlyHighIntent(false);
              }}
              className="h-9 text-xs text-muted-foreground hover:text-foreground"
            >
              <X className="h-3.5 w-3.5 mr-1" />
              Clear
            </Button>
          )}
        </div>

        <div className="text-xs text-muted-foreground font-mono">
          Showing {filteredLeads.length} of {leads.length} leads
        </div>
      </div>

      {/* Main Content: Kanban or Table */}
      {viewMode === 'kanban' ? (
        <div className="pt-2">
          <KanbanBoard
            columns={kanbanColumns}
            items={kanbanItems}
            onColumnsChange={handleKanbanColumnsChange}
            onAddItem={(columnId) => {
              setNewLeadForm((prev) => ({ ...prev, stage: columnId as LeadStage }));
              setIsCreateOpen(true);
            }}
            renderItem={(item) => {
              const lead = leads.find((l) => l.id === item.id);
              if (!lead) return null;

              return (
                <div
                  onClick={() => setSelectedLeadId(lead.id)}
                  className="rounded-lg border border-border bg-card p-3.5 shadow-xs hover:shadow-md hover:border-foreground/30 transition-all cursor-pointer space-y-2.5 group"
                >
                  <div className="flex items-start justify-between gap-1.5">
                    <span className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors line-clamp-1">
                      {lead.name}
                    </span>
                    <Badge
                      variant={PRIORITY_BADGE_VARIANT[lead.priority] || 'secondary'}
                      className="text-xs px-1.5 py-0 capitalize"
                    >
                      {lead.priority}
                    </Badge>
                  </div>

                  <p className="text-xs text-muted-foreground truncate">
                    {lead.company}
                  </p>

                  <div className="flex items-center justify-between pt-2 border-t border-border/50 text-xs">
                    <span className="font-mono font-bold text-sm text-foreground">
                      ${lead.dealValue.toLocaleString()}
                    </span>

                    <div className="flex items-center gap-1 font-mono text-xs">
                      {lead.aiScore >= 80 ? (
                        <span className="flex items-center text-highlight font-bold">
                          <Flame className="h-3.5 w-3.5 mr-0.5" />
                          {lead.aiScore}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">{lead.aiScore}</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            }}
          />
        </div>
      ) : (
        <DataTable
          columns={tableColumns}
          data={filteredLeads}
          onRowClick={(row) => setSelectedLeadId(row.id)}
          emptyTitle="No leads match filters"
          emptyDescription="Try clearing your search query or stage filters to view more opportunities."
        />
      )}

      {/* Lead Detail Slide-Over Sheet with DescriptionList */}
      <Sheet
        open={Boolean(selectedLeadId && activeLead)}
        onOpenChange={(open) => !open && setSelectedLeadId(null)}
      >
        <SheetContent side="right" className="w-full sm:max-w-xl p-0 flex flex-col h-full bg-card">
          {activeLead && (
            <>
              <SheetHeader className="p-6 border-b border-border bg-muted/20 pr-10">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12 border border-border">
                      <AvatarImage src={activeLead.avatarUrl} alt={activeLead.name} />
                      <AvatarFallback className="font-bold text-sm font-mono">
                        {activeLead.name.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <SheetTitle className="text-xl font-bold text-foreground">
                        {activeLead.name}
                      </SheetTitle>
                      <SheetDescription className="text-sm text-muted-foreground">
                        {activeLead.title} at <strong className="text-foreground">{activeLead.company}</strong>
                      </SheetDescription>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 pt-3">
                  <Badge
                    variant={STAGE_CONFIG[activeLead.stage]?.badgeVariant || 'outline'}
                    className="text-xs uppercase font-mono"
                  >
                    {STAGE_CONFIG[activeLead.stage]?.label || activeLead.stage}
                  </Badge>
                  <Badge
                    variant={PRIORITY_BADGE_VARIANT[activeLead.priority] || 'secondary'}
                    className="text-xs capitalize"
                  >
                    {activeLead.priority} Priority
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    Source: {activeLead.source}
                  </Badge>
                </div>
              </SheetHeader>

              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {/* AI Intelligence Card */}
                <Card className="border-highlight/40 bg-gradient-to-br from-highlight/10 via-transparent to-transparent shadow-xs">
                  <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-highlight" />
                      <CardTitle className="text-xs font-bold uppercase tracking-wider text-foreground">
                        AI Lead Score & Insights
                      </CardTitle>
                    </div>
                    <span className="text-xl font-extrabold text-highlight font-mono">
                      {activeLead.aiScore}/100
                    </span>
                  </CardHeader>
                  <CardContent className="p-4 pt-2 space-y-3">
                    <p className="text-xs text-foreground bg-card/80 p-3 rounded-lg border border-border flex items-start gap-2 leading-relaxed">
                      <Lightbulb className="h-4 w-4 text-highlight shrink-0 mt-0.5" />
                      <span><strong>Model Assessment:</strong> {activeLead.aiScoreReason}</span>
                    </p>

                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full text-xs gap-2 border-highlight/40 hover:bg-highlight/15"
                      onClick={() =>
                        openAiDrawer({
                          type: 'lead',
                          entityId: activeLead.id,
                          initialTab: 'lead-scoring',
                        })
                      }
                    >
                      <Sparkles className="h-3.5 w-3.5 text-highlight" />
                      Open Full Copilot Breakdown
                    </Button>
                  </CardContent>
                </Card>

                {/* Deal & Contact Details using DS DescriptionList */}
                <div className="space-y-3">
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider font-mono">
                    Contact & Opportunity Details
                  </h3>
                  <div className="rounded-xl border border-border bg-card/60 p-4">
                    <DescriptionList
                      columns={2}
                      dividers={true}
                      items={[
                        {
                          label: 'Estimated Deal Value',
                          value: `$${activeLead.dealValue.toLocaleString()}`,
                          hint: 'Annual contract value in USD',
                        },
                        {
                          label: 'Assigned Sales Rep',
                          value: activeLead.assignedAgentName,
                        },
                        {
                          label: 'Work Email',
                          value: (
                            <span className="flex items-center gap-1.5 font-mono text-xs">
                              <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                              {activeLead.email}
                            </span>
                          ),
                        },
                        {
                          label: 'Phone Contact',
                          value: (
                            <span className="flex items-center gap-1.5 font-mono text-xs">
                              <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                              {activeLead.phone}
                            </span>
                          ),
                        },
                      ]}
                    />
                  </div>
                </div>

                {/* Tags */}
                <div className="space-y-2">
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider font-mono">
                    Tags & Classification
                  </h3>
                  <div className="flex flex-wrap gap-1.5">
                    {activeLead.tags.map((t) => (
                      <Badge key={t} variant="secondary" className="text-xs">
                        <Tag className="h-3 w-3 mr-1" />
                        {t}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Stage Progression Selector */}
                <div className="space-y-2">
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider font-mono">
                    Change Pipeline Stage
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                    {ALL_STAGES.map((st) => (
                      <button
                        key={st}
                        type="button"
                        onClick={() => moveLeadStage(activeLead.id, st)}
                        className={`rounded-md border p-2 text-xs font-medium capitalize transition-all ${
                          activeLead.stage === st
                            ? 'border-primary bg-primary/10 text-foreground font-bold shadow-xs'
                            : 'border-border bg-background text-muted-foreground hover:bg-accent'
                        }`}
                      >
                        {STAGE_CONFIG[st].label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Drawer Footer Actions with clear hierarchy */}
              <div className="p-4 border-t border-border bg-muted/20 flex items-center justify-between">
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                  onClick={() => setLeadToDelete(activeLead.id)}
                >
                  <Trash2 className="h-4 w-4" />
                  Delete Lead
                </Button>

                {activeLead.stage !== 'won' ? (
                  <Button
                    size="sm"
                    className="gap-2 bg-success hover:bg-success/90 text-success-foreground font-semibold"
                    onClick={() => {
                      convertLead(activeLead.id);
                      setSelectedLeadId(null);
                    }}
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    Convert to Won Customer
                  </Button>
                ) : (
                  <Badge variant="success" className="text-xs font-semibold px-3 py-1 flex items-center gap-1">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>Closed Deal Won</span>
                  </Badge>
                )}
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* Delete Lead Confirmation Alert Dialog */}
      <AlertDialog
        open={Boolean(leadToDelete)}
        onOpenChange={(open) => !open && setLeadToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to delete this lead?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The opportunity record, stage progression, and associated activity history will be removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
              onClick={() => {
                if (leadToDelete) {
                  deleteLead(leadToDelete);
                  setLeadToDelete(null);
                  setSelectedLeadId(null);
                }
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Create Lead Modal Dialog with DS Select & TagInput */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-foreground">
              Create New Lead Opportunity
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Add a new prospect to your active sales pipeline with automatic AI intent scoring.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateLeadSubmit} className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="name" className="text-sm font-medium">
                  Full Name *
                </Label>
                <Input
                  id="name"
                  required
                  placeholder="e.g. Clara Oswald"
                  value={newLeadForm.name}
                  onChange={(e) => setNewLeadForm({ ...newLeadForm, name: e.target.value })}
                  className="text-sm"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="company" className="text-sm font-medium">
                  Company Name *
                </Label>
                <Input
                  id="company"
                  required
                  placeholder="e.g. Cyberdyne Systems"
                  value={newLeadForm.company}
                  onChange={(e) =>
                    setNewLeadForm({ ...newLeadForm, company: e.target.value })
                  }
                  className="text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-sm font-medium">
                  Work Email *
                </Label>
                <Input
                  id="email"
                  type="email"
                  required
                  placeholder="name@company.com"
                  value={newLeadForm.email}
                  onChange={(e) =>
                    setNewLeadForm({ ...newLeadForm, email: e.target.value })
                  }
                  className="text-sm"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="dealValue" className="text-sm font-medium">
                  Estimated Deal Value ($)
                </Label>
                <Input
                  id="dealValue"
                  type="number"
                  placeholder="50000"
                  value={newLeadForm.dealValue}
                  onChange={(e) =>
                    setNewLeadForm({ ...newLeadForm, dealValue: Number(e.target.value) })
                  }
                  className="text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="priority" className="text-sm font-medium">
                  Priority
                </Label>
                <Select
                  value={newLeadForm.priority}
                  onValueChange={(val) =>
                    setNewLeadForm({ ...newLeadForm, priority: val as LeadPriority })
                  }
                >
                  <SelectTrigger id="priority" className="text-sm">
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="source" className="text-sm font-medium">
                  Source Channel
                </Label>
                <Select
                  value={newLeadForm.source}
                  onValueChange={(val) =>
                    setNewLeadForm({ ...newLeadForm, source: val as Lead['source'] })
                  }
                >
                  <SelectTrigger id="source" className="text-sm">
                    <SelectValue placeholder="Select source" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Website Form">Website Form</SelectItem>
                    <SelectItem value="LinkedIn InMail">LinkedIn InMail</SelectItem>
                    <SelectItem value="Referral">Referral</SelectItem>
                    <SelectItem value="Cold Outreach">Cold Outreach</SelectItem>
                    <SelectItem value="Webinar">Webinar</SelectItem>
                    <SelectItem value="Product Trial">Product Trial</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm font-medium">
                Tags
              </Label>
              <TagInput
                value={newLeadForm.tags}
                onChange={(tags) => setNewLeadForm({ ...newLeadForm, tags })}
                placeholder="Type a tag and press Enter..."
              />
            </div>

            <DialogFooter className="pt-3">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsCreateOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" size="sm">
                Create Lead
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
