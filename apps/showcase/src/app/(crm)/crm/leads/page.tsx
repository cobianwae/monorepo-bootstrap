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
  MoreVertical,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  AlertCircle,
  MoveRight,
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
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationPrevious,
  PaginationNext,
  SegmentedControl,
  SegmentedControlItem,
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  DescriptionList,
  TagInput,
  NumberInput,
  Checkbox,
  BulkActionBar,
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  HoverCard,
  HoverCardTrigger,
  HoverCardContent,
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuSub,
  ContextMenuSubTrigger,
  ContextMenuSubContent,
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
  ToastAction,
  GradientText,
  toast,
  type KanbanColumnData,
  type KanbanItemData,
} from '@ds/ui';
import { PageHeader } from '@ds/ui';
import { useCrm } from '@/scenarios/crm/store/crm-context';
import { useDebounce } from '@ds/ui';
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

type SortField = 'name' | 'dealValue' | 'aiScore' | 'stage' | 'lastContactedAt';
type SortOrder = 'asc' | 'desc';

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
  const debouncedSearch = useDebounce(searchQuery, 300);
  const [stageFilter, setStageFilter] = React.useState<string>('all');
  const [onlyHighIntent, setOnlyHighIntent] = React.useState(false);
  const [isCreateOpen, setIsCreateOpen] = React.useState(false);
  const [leadToDelete, setLeadToDelete] = React.useState<Lead | null>(null);

  // Sorting & Selection state for Table
  const [sortField, setSortField] = React.useState<SortField>('aiScore');
  const [sortOrder, setSortOrder] = React.useState<SortOrder>('desc');
  const [selectedRowIds, setSelectedRowIds] = React.useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = React.useState(1);
  const pageSize = 10;

  // New Lead Form state & Validation
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
  const [formErrors, setFormErrors] = React.useState<Record<string, string>>({});

  // Filtered Leads
  const filteredLeads = React.useMemo(() => {
    return leads.filter((lead) => {
      const q = debouncedSearch.toLowerCase().trim();
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
  }, [leads, debouncedSearch, stageFilter, onlyHighIntent]);

  // Sorted Leads
  const sortedLeads = React.useMemo(() => {
    const list = [...filteredLeads];
    list.sort((a, b) => {
      let aVal = a[sortField] as string | number;
      let bVal = b[sortField] as string | number;
      if (sortField === 'name') {
        aVal = a.name.toLowerCase();
        bVal = b.name.toLowerCase();
      }
      if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
    return list;
  }, [filteredLeads, sortField, sortOrder]);

  // Paginated Leads
  const totalPages = Math.max(1, Math.ceil(sortedLeads.length / pageSize));
  const paginatedLeads = React.useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedLeads.slice(start, start + pageSize);
  }, [sortedLeads, currentPage, pageSize]);

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

  const handleToggleSort = React.useCallback(
    (field: SortField) => {
      if (sortField === field) {
        setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
      } else {
        setSortField(field);
        setSortOrder('desc');
      }
    },
    [sortField]
  );

  const validateLeadForm = (): boolean => {
    const errors: Record<string, string> = {};
    if (!newLeadForm.name.trim()) errors.name = 'Full name is required.';
    if (!newLeadForm.company.trim()) errors.company = 'Company name is required.';
    if (!newLeadForm.email.trim()) {
      errors.email = 'Work email is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newLeadForm.email)) {
      errors.email = 'Please enter a valid work email address.';
    }
    if (!newLeadForm.dealValue || newLeadForm.dealValue <= 0) {
      errors.dealValue = 'Deal value must be greater than 0.';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCreateLeadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateLeadForm()) return;

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
    setFormErrors({});

    toast({
      variant: 'success',
      title: 'Lead Opportunity Created',
      description: `"${newLeadForm.name}" has been added to the pipeline.`,
    });
  };

  const handleDeleteLeadConfirmed = () => {
    if (!leadToDelete) return;
    const backupLead = { ...leadToDelete };
    deleteLead(leadToDelete.id);
    setLeadToDelete(null);
    setSelectedLeadId(null);

    toast({
      variant: 'default',
      title: 'Lead deleted',
      description: `"${backupLead.name}" was removed from the pipeline.`,
      action: (
        <ToastAction
          altText="Undo delete lead"
          onClick={() => {
            addLead(backupLead);
            toast({
              variant: 'success',
              title: 'Lead restored',
              description: `"${backupLead.name}" has been restored.`,
            });
          }}
        >
          Undo
        </ToastAction>
      ),
    });
  };

  // Bulk operations
  const handleSelectAllRows = React.useCallback(
    (checked: boolean) => {
      if (checked) {
        setSelectedRowIds(new Set(paginatedLeads.map((l) => l.id)));
      } else {
        setSelectedRowIds(new Set());
      }
    },
    [paginatedLeads]
  );

  const handleToggleRowSelect = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedRowIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleBulkMoveStage = (targetStage: LeadStage) => {
    selectedRowIds.forEach((id) => moveLeadStage(id, targetStage));
    toast({
      variant: 'success',
      title: 'Bulk Stage Update',
      description: `Moved ${selectedRowIds.size} leads to "${STAGE_CONFIG[targetStage].label}".`,
    });
    setSelectedRowIds(new Set());
  };

  const handleBulkConvertWon = () => {
    selectedRowIds.forEach((id) => convertLead(id));
    toast({
      variant: 'success',
      title: 'Bulk Conversion',
      description: `Converted ${selectedRowIds.size} opportunities to Closed Won.`,
    });
    setSelectedRowIds(new Set());
  };

  const handleBulkDelete = () => {
    selectedRowIds.forEach((id) => deleteLead(id));
    toast({
      variant: 'default',
      title: 'Leads Deleted',
      description: `Removed ${selectedRowIds.size} leads from the system.`,
    });
    setSelectedRowIds(new Set());
  };

  // Table Columns with Sortable Headers, Checkboxes, HoverCards, and DropdownMenu
  const tableColumns: ColumnDef<Lead>[] = React.useMemo(
    () => [
      {
        id: 'select',
        header: () => (
          <div className="px-1" onClick={(e) => e.stopPropagation()}>
            <Checkbox
              checked={
                paginatedLeads.length > 0 &&
                paginatedLeads.every((l) => selectedRowIds.has(l.id))
              }
              onCheckedChange={(checked) => handleSelectAllRows(Boolean(checked))}
              aria-label="Select all rows"
            />
          </div>
        ),
        cell: ({ row }) => (
          <div className="px-1" onClick={(e) => handleToggleRowSelect(row.original.id, e)}>
            <Checkbox
              checked={selectedRowIds.has(row.original.id)}
              aria-label={`Select ${row.original.name}`}
            />
          </div>
        ),
      },
      {
        accessorKey: 'name',
        header: () => (
          <button
            type="button"
            onClick={() => handleToggleSort('name')}
            className="flex items-center gap-1.5 font-semibold text-xs text-foreground hover:text-primary transition-colors cursor-pointer"
          >
            <span>Lead & Organization</span>
            {sortField === 'name' ? (
              sortOrder === 'asc' ? <ArrowUp className="h-3.5 w-3.5" /> : <ArrowDown className="h-3.5 w-3.5" />
            ) : (
              <ArrowUpDown className="h-3.5 w-3.5 text-muted-foreground opacity-60" />
            )}
          </button>
        ),
        cell: ({ row }) => {
          const lead = row.original;
          return (
            <HoverCard>
              <HoverCardTrigger asChild>
                <div
                  className="flex items-center gap-3 py-1 cursor-pointer group"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedLeadId(lead.id);
                  }}
                >
                  <Avatar className="h-8 w-8 border border-border group-hover:border-primary transition-colors">
                    <AvatarImage src={lead.avatarUrl} alt={lead.name} />
                    <AvatarFallback className="text-xs font-bold font-mono">
                      {lead.name.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <span className="font-semibold text-foreground text-sm block group-hover:text-primary transition-colors">
                      {lead.name}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {lead.company} • {lead.title}
                    </span>
                  </div>
                </div>
              </HoverCardTrigger>
              <HoverCardContent className="w-80 p-4 space-y-3" align="start">
                <div className="flex items-center justify-between border-b border-border pb-2.5">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={lead.avatarUrl} alt={lead.name} />
                      <AvatarFallback className="font-mono text-xs">
                        {lead.name.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h4 className="text-sm font-bold text-foreground">{lead.name}</h4>
                      <p className="text-xs text-muted-foreground">{lead.company}</p>
                    </div>
                  </div>
                  <Badge variant={STAGE_CONFIG[lead.stage]?.badgeVariant || 'outline'} className="text-[10px] uppercase font-mono">
                    {STAGE_CONFIG[lead.stage]?.label}
                  </Badge>
                </div>
                <div className="text-xs space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Deal Value:</span>
                    <span className="font-mono font-bold">${lead.dealValue.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">AI Conversion Score:</span>
                    <span className="font-mono font-bold text-highlight">{lead.aiScore}/100</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Assigned Rep:</span>
                    <span>{lead.assignedAgentName}</span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1 pt-1">
                  {lead.tags.map((t) => (
                    <Badge key={t} variant="secondary" className="text-[10px]">
                      {t}
                    </Badge>
                  ))}
                </div>
              </HoverCardContent>
            </HoverCard>
          );
        },
      },
      {
        accessorKey: 'stage',
        header: () => (
          <button
            type="button"
            onClick={() => handleToggleSort('stage')}
            className="flex items-center gap-1.5 font-semibold text-xs text-foreground hover:text-primary transition-colors cursor-pointer"
          >
            <span>Pipeline Stage</span>
            {sortField === 'stage' ? (
              sortOrder === 'asc' ? <ArrowUp className="h-3.5 w-3.5" /> : <ArrowDown className="h-3.5 w-3.5" />
            ) : (
              <ArrowUpDown className="h-3.5 w-3.5 text-muted-foreground opacity-60" />
            )}
          </button>
        ),
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
        header: () => (
          <button
            type="button"
            onClick={() => handleToggleSort('aiScore')}
            className="flex items-center gap-1.5 font-semibold text-xs text-foreground hover:text-primary transition-colors cursor-pointer"
          >
            <span>AI Score</span>
            {sortField === 'aiScore' ? (
              sortOrder === 'asc' ? <ArrowUp className="h-3.5 w-3.5" /> : <ArrowDown className="h-3.5 w-3.5" />
            ) : (
              <ArrowUpDown className="h-3.5 w-3.5 text-muted-foreground opacity-60" />
            )}
          </button>
        ),
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
        header: () => (
          <button
            type="button"
            onClick={() => handleToggleSort('dealValue')}
            className="flex items-center gap-1.5 font-semibold text-xs text-foreground hover:text-primary transition-colors cursor-pointer"
          >
            <span>Deal Value</span>
            {sortField === 'dealValue' ? (
              sortOrder === 'asc' ? <ArrowUp className="h-3.5 w-3.5" /> : <ArrowDown className="h-3.5 w-3.5" />
            ) : (
              <ArrowUpDown className="h-3.5 w-3.5 text-muted-foreground opacity-60" />
            )}
          </button>
        ),
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
            <div className="flex items-center justify-end" onClick={(e) => e.stopPropagation()}>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                    aria-label={`Actions for ${lead.name}`}
                  >
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onClick={() => setSelectedLeadId(lead.id)}>
                    <ExternalLink className="h-4 w-4 mr-2" />
                    <span>View 360 Details</span>
                  </DropdownMenuItem>

                  {lead.stage !== 'won' && (
                    <DropdownMenuItem
                      onClick={() => convertLead(lead.id)}
                      className="text-success focus:text-success"
                    >
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      <span>Convert to Won Deal</span>
                    </DropdownMenuItem>
                  )}

                  <DropdownMenuItem
                    onClick={() =>
                      openAiDrawer({
                        type: 'lead',
                        entityId: lead.id,
                        initialTab: 'lead-scoring',
                      })
                    }
                  >
                    <Sparkles className="h-4 w-4 mr-2 text-highlight" />
                    <span>AI Copilot Analysis</span>
                  </DropdownMenuItem>

                  <DropdownMenuSub>
                    <DropdownMenuSubTrigger>
                      <MoveRight className="h-4 w-4 mr-2" />
                      <span>Move Stage</span>
                    </DropdownMenuSubTrigger>
                    <DropdownMenuSubContent>
                      {ALL_STAGES.map((st) => (
                        <DropdownMenuItem
                          key={st}
                          disabled={lead.stage === st}
                          onClick={() => moveLeadStage(lead.id, st)}
                        >
                          {STAGE_CONFIG[st].label}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuSubContent>
                  </DropdownMenuSub>

                  <DropdownMenuSeparator />

                  <DropdownMenuItem
                    onClick={() => setLeadToDelete(lead)}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    <span>Delete Opportunity</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          );
        },
      },
    ],
    [
      paginatedLeads,
      selectedRowIds,
      sortField,
      sortOrder,
      convertLead,
      moveLeadStage,
      openAiDrawer,
      setSelectedLeadId,
      handleSelectAllRows,
      handleToggleSort,
    ]
  );

  const hasActiveFilters = searchQuery !== '' || stageFilter !== 'all' || onlyHighIntent;

  return (
    <div className="space-y-8 animate-in fade-in-50 duration-200">
      {/* Official Design System PageHeader */}
      <PageHeader
        eyebrow="Opportunity Engine"
        eyebrowIcon={Sparkles}
        title={
          <span>
            Leads &amp; Opportunities <GradientText>Pipeline</GradientText>
          </span>
        }
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

      {/* Filter and Search Bar with Active Filter Chips */}
      <div className="space-y-2.5">
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card/60 p-3.5 shadow-xs">
          <div className="flex flex-wrap items-center gap-2.5 flex-1 min-w-[280px]">
            <div className="relative flex-1 max-w-xs">
              <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search leads, companies, tags..."
                className="h-9 pl-9 text-xs bg-background"
                aria-label="Search leads"
              />
            </div>

            {/* Stage filter with DS Select */}
            <div className="w-44">
              <Select value={stageFilter} onValueChange={setStageFilter}>
                <SelectTrigger className="h-9 text-xs" aria-label="Filter by stage">
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
              aria-pressed={onlyHighIntent}
            >
              <Flame className="h-3.5 w-3.5" />
              High Intent (≥80)
            </Button>

            {hasActiveFilters && (
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
                Reset All
              </Button>
            )}
          </div>

          <div className="text-xs text-muted-foreground font-mono">
            Showing {filteredLeads.length} of {leads.length} leads
          </div>
        </div>

        {/* Active Filter Chips */}
        {hasActiveFilters && (
          <div className="flex flex-wrap items-center gap-2 pt-1 px-1">
            <span className="text-xs text-muted-foreground font-mono">Active Filters:</span>
            {searchQuery && (
              <Badge variant="secondary" className="text-xs gap-1 py-0.5">
                Query: &quot;{searchQuery}&quot;
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="hover:text-foreground ml-0.5"
                  aria-label="Remove search filter"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {stageFilter !== 'all' && (
              <Badge variant="secondary" className="text-xs gap-1 py-0.5">
                Stage: {STAGE_CONFIG[stageFilter as LeadStage]?.label || stageFilter}
                <button
                  type="button"
                  onClick={() => setStageFilter('all')}
                  className="hover:text-foreground ml-0.5"
                  aria-label="Remove stage filter"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {onlyHighIntent && (
              <Badge variant="highlight" className="text-xs gap-1 py-0.5">
                <Flame className="h-3 w-3 mr-0.5" /> High Intent (≥80)
                <button
                  type="button"
                  onClick={() => setOnlyHighIntent(false)}
                  className="hover:text-foreground ml-0.5"
                  aria-label="Remove high intent filter"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
          </div>
        )}
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
                <ContextMenu key={lead.id}>
                  <ContextMenuTrigger asChild>
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
                  </ContextMenuTrigger>
                  <ContextMenuContent className="w-48">
                    <ContextMenuItem onClick={() => setSelectedLeadId(lead.id)}>
                      <ExternalLink className="h-4 w-4 mr-2" />
                      View 360 Details
                    </ContextMenuItem>
                    {lead.stage !== 'won' && (
                      <ContextMenuItem
                        onClick={() => convertLead(lead.id)}
                        className="text-success focus:text-success"
                      >
                        <CheckCircle2 className="h-4 w-4 mr-2" />
                        Convert to Won Deal
                      </ContextMenuItem>
                    )}
                    <ContextMenuItem
                      onClick={() =>
                        openAiDrawer({
                          type: 'lead',
                          entityId: lead.id,
                          initialTab: 'lead-scoring',
                        })
                      }
                    >
                      <Sparkles className="h-4 w-4 mr-2 text-highlight" />
                      AI Copilot Analysis
                    </ContextMenuItem>
                    <ContextMenuSub>
                      <ContextMenuSubTrigger>
                        <MoveRight className="h-4 w-4 mr-2" />
                        Move Stage
                      </ContextMenuSubTrigger>
                      <ContextMenuSubContent>
                        {ALL_STAGES.map((st) => (
                          <ContextMenuItem
                            key={st}
                            disabled={lead.stage === st}
                            onClick={() => moveLeadStage(lead.id, st)}
                          >
                            {STAGE_CONFIG[st].label}
                          </ContextMenuItem>
                        ))}
                      </ContextMenuSubContent>
                    </ContextMenuSub>
                    <ContextMenuSeparator />
                    <ContextMenuItem
                      onClick={() => setLeadToDelete(lead)}
                      className="text-destructive focus:text-destructive"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Lead
                    </ContextMenuItem>
                  </ContextMenuContent>
                </ContextMenu>
              );
            }}
          />
        </div>
      ) : (
        <div className="space-y-4">
          <DataTable
            columns={tableColumns}
            data={paginatedLeads}
            variant="default"
            size="sm"
            pagination={{ show: false }}
            onRowClick={(row) => setSelectedLeadId(row.id)}
            emptyTitle="No leads match filters"
            emptyDescription="Try clearing your search query or stage filters to view more opportunities."
          />

          {/* Table Footer: Pagination & Item Count */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-2 text-xs text-muted-foreground">
            <span className="font-mono">
              Showing {(currentPage - 1) * pageSize + 1}–{Math.min(currentPage * pageSize, sortedLeads.length)} of {sortedLeads.length} leads
            </span>

            {totalPages > 1 && (
              <Pagination className="mx-0 w-auto justify-end">
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      aria-disabled={currentPage === 1}
                      className={currentPage === 1 ? 'pointer-events-none opacity-50' : undefined}
                      onClick={() => {
                        if (currentPage > 1) setCurrentPage((p) => Math.max(1, p - 1));
                      }}
                    />
                  </PaginationItem>
                  <PaginationItem>
                    <span className="font-mono px-2 text-xs">
                      Page {currentPage} of {totalPages}
                    </span>
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationNext
                      aria-disabled={currentPage === totalPages}
                      className={currentPage === totalPages ? 'pointer-events-none opacity-50' : undefined}
                      onClick={() => {
                        if (currentPage < totalPages) setCurrentPage((p) => Math.min(totalPages, p + 1));
                      }}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            )}
          </div>
        </div>
      )}

      {/* Bulk Action Bar (when rows are selected) */}
      <BulkActionBar
        open={selectedRowIds.size > 0}
        count={selectedRowIds.size}
        onClearSelection={() => setSelectedRowIds(new Set())}
        actions={[
          {
            id: 'qualify',
            label: 'Mark Qualified',
            onClick: () => handleBulkMoveStage('qualified'),
            variant: 'outline',
          },
          {
            id: 'proposal',
            label: 'Send Proposal',
            onClick: () => handleBulkMoveStage('proposal'),
            variant: 'outline',
          },
          {
            id: 'convert',
            label: 'Convert to Won',
            icon: CheckCircle2,
            onClick: handleBulkConvertWon,
            variant: 'default',
          },
          {
            id: 'delete',
            label: 'Delete',
            icon: Trash2,
            onClick: handleBulkDelete,
            variant: 'destructive',
          },
        ]}
      />

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

                {/* Stage Progression Selector with accessible radio semantics */}
                <div className="space-y-2">
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider font-mono">
                    Change Pipeline Stage
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5" role="radiogroup" aria-label="Pipeline stage">
                    {ALL_STAGES.map((st) => (
                      <button
                        key={st}
                        type="button"
                        role="radio"
                        aria-checked={activeLead.stage === st}
                        onClick={() => moveLeadStage(activeLead.id, st)}
                        className={`rounded-md border p-2 text-xs font-medium capitalize transition-all cursor-pointer ${
                          activeLead.stage === st
                            ? 'border-primary bg-primary/10 text-foreground font-bold shadow-xs ring-1 ring-primary'
                            : 'border-border bg-background text-muted-foreground hover:bg-accent hover:text-foreground'
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
                  onClick={() => setLeadToDelete(activeLead)}
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
            <AlertDialogTitle>Delete Lead Opportunity</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{leadToDelete?.name}&quot; ({leadToDelete?.company})? The opportunity record, stage progression, and activity history will be removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
              onClick={handleDeleteLeadConfirmed}
            >
              Delete Lead
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Create Lead Modal Dialog with Real-time Validation & DS NumberInput */}
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
                  placeholder="e.g. Clara Oswald"
                  value={newLeadForm.name}
                  onChange={(e) => {
                    setNewLeadForm({ ...newLeadForm, name: e.target.value });
                    if (formErrors.name) setFormErrors((prev) => ({ ...prev, name: '' }));
                  }}
                  className={`text-sm ${formErrors.name ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                />
                {formErrors.name && (
                  <p className="text-xs text-destructive flex items-center gap-1 mt-1">
                    <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                    <span>{formErrors.name}</span>
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="company" className="text-sm font-medium">
                  Company Name *
                </Label>
                <Input
                  id="company"
                  placeholder="e.g. Cyberdyne Systems"
                  value={newLeadForm.company}
                  onChange={(e) => {
                    setNewLeadForm({ ...newLeadForm, company: e.target.value });
                    if (formErrors.company) setFormErrors((prev) => ({ ...prev, company: '' }));
                  }}
                  className={`text-sm ${formErrors.company ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                />
                {formErrors.company && (
                  <p className="text-xs text-destructive flex items-center gap-1 mt-1">
                    <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                    <span>{formErrors.company}</span>
                  </p>
                )}
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
                  placeholder="name@company.com"
                  value={newLeadForm.email}
                  onChange={(e) => {
                    setNewLeadForm({ ...newLeadForm, email: e.target.value });
                    if (formErrors.email) setFormErrors((prev) => ({ ...prev, email: '' }));
                  }}
                  className={`text-sm ${formErrors.email ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                />
                {formErrors.email && (
                  <p className="text-xs text-destructive flex items-center gap-1 mt-1">
                    <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                    <span>{formErrors.email}</span>
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="dealValue" className="text-sm font-medium">
                  Estimated Deal Value ($) *
                </Label>
                <NumberInput
                  id="dealValue"
                  value={newLeadForm.dealValue}
                  onValueChange={(val) => {
                    setNewLeadForm({ ...newLeadForm, dealValue: val || 0 });
                    if (formErrors.dealValue) setFormErrors((prev) => ({ ...prev, dealValue: '' }));
                  }}
                  min={1000}
                  step={5000}
                  prefix="$"
                  error={Boolean(formErrors.dealValue)}
                />
                {formErrors.dealValue && (
                  <p className="text-xs text-destructive flex items-center gap-1 mt-1">
                    <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                    <span>{formErrors.dealValue}</span>
                  </p>
                )}
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
