'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  Card,
  CardHeader,
  CardContent,
  Input,
  Button,
  Badge,
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
  Label,
  Textarea,
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  Tabs,
  TabsList,
  TabsTrigger,
  Alert,
  AlertTitle,
  AlertDescription,
  Skeleton,
  EmptyState,
  ToastAction,
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
  toast,
} from '@ds/ui';
import {
  Search,
  Plus,
  History,
  Edit2,
  Sparkles,
  Inbox,
  RefreshCw,
  Trash2,
  RotateCcw,
  Stethoscope,
  ArrowRight,
} from 'lucide-react';
import { PageHeader } from '@/components/page-header';
import type { MasterDataItem } from '@shared/types';

const INITIAL_ITEMS: MasterDataItem[] = [
  {
    id: 'md_1',
    code: 'CURR-USD',
    name: 'US Dollar',
    category: 'Currency',
    status: 'active',
    description: 'United States standard currency symbol $',
    updatedAt: '2025-02-10 14:20',
    updatedBy: 'Sarah (Admin)',
  },
  {
    id: 'md_2',
    code: 'TAX-VAT-11',
    name: 'Standard Value Added Tax 11%',
    category: 'Tax Code',
    status: 'active',
    description: 'Statutory VAT rate applicable to electronic services',
    updatedAt: '2025-01-28 09:15',
    updatedBy: 'Finance Bot',
  },
  {
    id: 'md_3',
    code: 'WH-WEST-01',
    name: 'West Coast Logistics Hub',
    category: 'Warehouse',
    status: 'active',
    description: 'Primary distribution center in California',
    updatedAt: '2025-02-01 16:45',
    updatedBy: 'Julian (Ops)',
  },
  {
    id: 'md_4',
    code: 'UOM-KG',
    name: 'Kilogram Mass Unit',
    category: 'Unit of Measure',
    status: 'active',
    description: 'SI standard metric kilogram',
    updatedAt: '2024-12-14 11:00',
    updatedBy: 'Sarah (Admin)',
  },
  {
    id: 'md_5',
    code: 'WH-EAST-02',
    name: 'East Coast Secondary Depot',
    category: 'Warehouse',
    status: 'draft',
    description: 'Pending regulatory lease approval',
    updatedAt: '2025-02-12 18:30',
    updatedBy: 'Julian (Ops)',
  },
];

export default function MasterDataPatternPage() {
  const [items, setItems] = React.useState<MasterDataItem[]>(INITIAL_ITEMS);
  const [search, setSearch] = React.useState('');
  const [activeCategory, setActiveCategory] = React.useState('all');
  const [isDrawerOpen, setIsDrawerOpen] = React.useState(false);
  const [editingItem, setEditingItem] = React.useState<MasterDataItem | null>(null);
  const [isAuditOpen, setIsAuditOpen] = React.useState(false);
  const [selectedAuditItem, setSelectedAuditItem] = React.useState<MasterDataItem | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);

  const simulateLoading = () => {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 800);
  };

  // Form State
  const [formCode, setFormCode] = React.useState('');
  const [formName, setFormName] = React.useState('');
  const [formCategory, setFormCategory] = React.useState('Currency');
  const [formDesc, setFormDesc] = React.useState('');
  const [formError, setFormError] = React.useState<string | null>(null);

  const openCreateDrawer = () => {
    setEditingItem(null);
    setFormCode('');
    setFormName('');
    setFormCategory('Currency');
    setFormDesc('');
    setFormError(null);
    setIsDrawerOpen(true);
  };

  const openEditDrawer = (item: MasterDataItem) => {
    setEditingItem(item);
    setFormCode(item.code);
    setFormName(item.name);
    setFormCategory(item.category);
    setFormDesc(item.description ?? '');
    setFormError(null);
    setIsDrawerOpen(true);
  };

  const handleDeleteItem = (item: MasterDataItem) => {
    setItems((prev) => prev.filter((i) => i.id !== item.id));
    toast({
      variant: 'default',
      title: 'Record deleted',
      description: `Master record "${item.code}" was archived.`,
      action: (
        <ToastAction
          altText="Undo deletion"
          onClick={() => {
            setItems((prev) => [item, ...prev]);
            toast({
              variant: 'success',
              title: 'Deletion undone',
              description: `Record "${item.code}" restored.`,
            });
          }}
        >
          <RotateCcw className="h-3 w-3 mr-1" />
          Undo
        </ToastAction>
      ),
    });
  };

  const categories = ['all', 'Currency', 'Tax Code', 'Warehouse', 'Unit of Measure'];

  const filteredItems = React.useMemo(() => {
    return items.filter((item) => {
      const matchesSearch =
        item.code.toLowerCase().includes(search.toLowerCase()) ||
        item.name.toLowerCase().includes(search.toLowerCase()) ||
        item.category.toLowerCase().includes(search.toLowerCase());
      const matchesCat =
        activeCategory === 'all' || item.category === activeCategory;
      return matchesSearch && matchesCat;
    });
  }, [items, search, activeCategory]);

  const handleSaveItem = () => {
    if (!formCode || !formName) {
      setFormError('Please provide both a unique code and a name.');
      return;
    }
    const exists = items.some(
      (i) =>
        i.code.toUpperCase() === formCode.toUpperCase() &&
        i.id !== editingItem?.id
    );
    if (exists) {
      setFormError(`Item code "${formCode.toUpperCase()}" already exists. Codes must be globally unique.`);
      return;
    }

    if (editingItem) {
      const updatedItem: MasterDataItem = {
        ...editingItem,
        code: formCode.toUpperCase(),
        name: formName,
        category: formCategory,
        description: formDesc,
        updatedAt: 'Just now',
        updatedBy: 'Current User',
      };
      setItems((prev) =>
        prev.map((i) => (i.id === editingItem.id ? updatedItem : i))
      );
      setFormError(null);
      setIsDrawerOpen(false);
      setEditingItem(null);
      toast({
        variant: 'success',
        title: 'Record Updated',
        description: `Record "${updatedItem.code}" was updated successfully.`,
      });
      return;
    }

    const newItem: MasterDataItem = {
      id: `md_${Date.now()}`,
      code: formCode.toUpperCase(),
      name: formName,
      category: formCategory,
      status: 'active',
      description: formDesc,
      updatedAt: 'Just now',
      updatedBy: 'Current User',
    };

    setItems([newItem, ...items]);
    setFormCode('');
    setFormName('');
    setFormDesc('');
    setFormError(null);
    setIsDrawerOpen(false);

    toast({
      variant: 'success',
      title: 'Master Record Created',
      description: `Record "${newItem.code}" (${newItem.name}) was registered successfully.`,
    });
  };

  const openAuditLog = (item: MasterDataItem) => {
    setSelectedAuditItem(item);
    setIsAuditOpen(true);
  };

  return (
    <div className="space-y-10 animate-in fade-in-50 duration-200">
      <PageHeader
        eyebrow="UX Recipe Scenario"
        eyebrowIcon={Sparkles}
        title="Master Data & Reference CRUD Management"
        description="Standardized enterprise master data workflow: category tabs, code uniqueness validation, slide-over create form, status badges, and historical audit trail drawer."
      />

      {/* Cross-Link Banner to Clinic Treatments Scenario */}
      <div className="flex items-center justify-between rounded-xl border border-primary/30 bg-gradient-to-r from-primary/10 to-transparent p-4 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Stethoscope className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">
              See Master Data CRUD in the Clinic Treatment Catalog
            </p>
            <p className="text-xs text-muted-foreground">
              Live protocol master data with session durations, IDR margins, category filtering, and drawer editing.
            </p>
          </div>
        </div>
        <Link href="/clinic/treatments">
          <Button variant="outline" size="sm" className="gap-1.5 shrink-0">
            Open Treatment Catalog
            <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </Link>
      </div>

      <Card className="border-border shadow-xs">
        {/* Header Toolbar */}
        <CardHeader className="p-5 border-b border-border space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            {/* Search */}
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search master data code, name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={simulateLoading}
                title="Reload data"
                aria-label="Reload master data records"
                className="h-9 w-9"
              >
                <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              </Button>

              {/* Create Drawer Trigger */}
              <Sheet open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
                <SheetTrigger asChild>
                  <Button className="gap-2" onClick={openCreateDrawer}>
                    <Plus className="h-4 w-4" />
                    Add Master Record
                  </Button>
                </SheetTrigger>
              <SheetContent side="right" className="sm:max-w-md">
                <SheetHeader>
                  <SheetTitle>
                    {editingItem ? 'Edit Master Data Record' : 'Add Master Data Record'}
                  </SheetTitle>
                  <SheetDescription>
                    {editingItem
                      ? `Update reference record ${editingItem.code}. Code must stay unique.`
                      : 'Define a new enterprise reference record. Code must be unique.'}
                  </SheetDescription>
                </SheetHeader>

                <div className="py-6 space-y-4">
                  {formError && (
                    <Alert variant="destructive">
                      <AlertTitle>Validation Error</AlertTitle>
                      <AlertDescription>{formError}</AlertDescription>
                    </Alert>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="code">Reference Code</Label>
                    <Input
                      id="code"
                      placeholder="e.g. WH-SOUTH-03"
                      value={formCode}
                      onChange={(e) => {
                        setFormCode(e.target.value);
                        setFormError(null);
                      }}
                      className="font-mono uppercase"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="name">Display Name</Label>
                    <Input
                      id="name"
                      placeholder="e.g. South Texas Hub"
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cat">Category</Label>
                    <Select value={formCategory} onValueChange={setFormCategory}>
                      <SelectTrigger id="cat">
                        <SelectValue placeholder="Category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Currency">Currency</SelectItem>
                        <SelectItem value="Tax Code">Tax Code</SelectItem>
                        <SelectItem value="Warehouse">Warehouse</SelectItem>
                        <SelectItem value="Unit of Measure">Unit of Measure</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="desc">Description & Usage Notes</Label>
                    <Textarea
                      id="desc"
                      placeholder="Provide context on when to use this record..."
                      value={formDesc}
                      onChange={(e) => setFormDesc(e.target.value)}
                    />
                  </div>
                </div>

                <SheetFooter>
                  <Button variant="outline" onClick={() => setIsDrawerOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleSaveItem}>
                    {editingItem ? 'Save Changes' : 'Save Record'}
                  </Button>
                </SheetFooter>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        {/* Category Tabs */}
          <Tabs value={activeCategory} onValueChange={setActiveCategory}>
            <div className="overflow-x-auto no-scrollbar -mx-1 px-1">
              <TabsList className="h-9 w-max">
                {categories.map((cat) => (
                  <TabsTrigger key={cat} value={cat} className="capitalize text-xs">
                    {cat === 'all' ? 'All Records' : cat}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>
          </Tabs>
        </CardHeader>

        {/* Master Data Grid */}
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Name & Description</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Modified</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <Skeleton className="h-4 w-36" />
                        <Skeleton className="h-3 w-48" />
                      </div>
                    </TableCell>
                    <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-14" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="h-8 w-16 ml-auto" /></TableCell>
                  </TableRow>
                ))
              ) : filteredItems.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-64 text-center">
                    <EmptyState
                      icon={Inbox}
                      title="No master data records found"
                      description="No records match your search criteria or category filter. Try clearing your filters."
                      actionLabel="Reset Filters"
                      onAction={() => {
                        setSearch('');
                        setActiveCategory('all');
                      }}
                    />
                  </TableCell>
                </TableRow>
              ) : (
                filteredItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <span className="font-mono font-semibold text-xs text-primary bg-primary/10 px-2 py-1 rounded">
                        {item.code}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-semibold text-sm text-foreground">
                          {item.name}
                        </span>
                        {item.description && (
                          <span className="text-xs text-muted-foreground line-clamp-1">
                            {item.description}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs">
                        {item.category}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          item.status === 'active'
                            ? 'success'
                            : item.status === 'draft'
                            ? 'warning'
                            : 'muted'
                        }
                        className="capitalize text-xs"
                      >
                        {item.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      <div className="flex flex-col">
                        <span>{item.updatedAt}</span>
                        <span className="text-[11px] opacity-75">{item.updatedBy}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 text-muted-foreground hover:text-foreground"
                          title="View audit history"
                          aria-label={`View audit history for ${item.code}`}
                          onClick={() => openAuditLog(item)}
                        >
                          <History className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 text-muted-foreground hover:text-foreground"
                          title="Edit record"
                          aria-label={`Edit record ${item.code}`}
                          onClick={() => openEditDrawer(item)}
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8 text-muted-foreground hover:text-destructive"
                              title="Delete record"
                              aria-label={`Delete record ${item.code}`}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete master record?</AlertDialogTitle>
                              <AlertDialogDescription>
                                You are about to delete <strong>{item.code}</strong> ({item.name}).
                                This removes the reference record and any dependent references
                                will fail validation. This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                variant="destructive"
                                onClick={() => handleDeleteItem(item)}
                              >
                                Delete Record
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Audit Log Drawer */}
      <Sheet open={isAuditOpen} onOpenChange={setIsAuditOpen}>
        <SheetContent side="right">
          <SheetHeader>
            <SheetTitle>Audit Log & Change History</SheetTitle>
            <SheetDescription>
              Chronological log of changes to master record: {selectedAuditItem?.code}
            </SheetDescription>
          </SheetHeader>

          <div className="py-6 space-y-4">
            <div className="rounded-lg bg-muted/40 p-3 space-y-1 text-xs">
              <span className="text-muted-foreground">Record:</span>
              <p className="font-semibold text-foreground">{selectedAuditItem?.name}</p>
            </div>

            <div className="space-y-4 pt-2">
              <div className="border-l-2 border-primary pl-3 space-y-1">
                <span className="text-xs font-semibold text-foreground">Record Status Activated</span>
                <p className="text-[11px] text-muted-foreground">Changed status from Draft to Active by Sarah (Admin)</p>
                <span className="text-[10px] text-muted-foreground font-mono">2025-02-10 14:20:00 UTC</span>
              </div>

              <div className="border-l-2 border-border pl-3 space-y-1">
                <span className="text-xs font-semibold text-foreground">Description Updated</span>
                <p className="text-[11px] text-muted-foreground">Updated statutory reference notes by Finance Bot</p>
                <span className="text-[10px] text-muted-foreground font-mono">2025-01-28 09:15:22 UTC</span>
              </div>

              <div className="border-l-2 border-border pl-3 space-y-1">
                <span className="text-xs font-semibold text-foreground">Initial Creation</span>
                <p className="text-[11px] text-muted-foreground">Created initial record schema by System Bootstrap</p>
                <span className="text-[10px] text-muted-foreground font-mono">2024-12-01 00:00:00 UTC</span>
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
