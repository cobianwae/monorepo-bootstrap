'use client';

import * as React from 'react';
import {
  Stethoscope,
  Plus,
  Search,
  Edit2,
  Trash2,
} from 'lucide-react';
import {
  Button,
  Badge,
  Card,
  Input,
  Label,
  Textarea,
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  Switch,
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  EmptyState,
} from '@ds/ui';
import { PageHeader } from '@ds/ui';
import { useClinic } from '@/scenarios/clinic/store/clinic-context';
import type { Treatment, TreatmentCategory } from '@/scenarios/clinic/types';

const CATEGORY_BADGES: Record<
  TreatmentCategory,
  { label: string; variant: 'highlight' | 'default' | 'secondary' | 'warning' | 'info' | 'success' }
> = {
  injectable: { label: 'Injectable Peptide', variant: 'highlight' },
  'body-contouring': { label: 'Body Contouring', variant: 'info' },
  'rf-therapy': { label: 'RF Lipolysis', variant: 'warning' },
  'metabolic-package': { label: 'Metabolic Package', variant: 'success' },
  'consultation-pack': { label: 'Consultation Pack', variant: 'secondary' },
  'nutrition-lab': { label: 'Nutrition Lab', variant: 'default' },
};

export default function TreatmentsPage() {
  const {
    treatments,
    addTreatment,
    updateTreatment,
    deleteTreatment,
  } = useClinic();

  const [searchTerm, setSearchTerm] = React.useState('');
  const [selectedCategory, setSelectedCategory] = React.useState<string>('all');
  const [isDrawerOpen, setIsDrawerOpen] = React.useState(false);
  const [editingTreatment, setEditingTreatment] = React.useState<Treatment | null>(null);
  const [treatmentToDelete, setTreatmentToDelete] = React.useState<string | null>(null);

  // Form State
  const [code, setCode] = React.useState('');
  const [name, setName] = React.useState('');
  const [category, setCategory] = React.useState<TreatmentCategory>('injectable');
  const [sessions, setSessions] = React.useState('4');
  const [durationMinutes, setDurationMinutes] = React.useState('30');
  const [price, setPrice] = React.useState('4500000');
  const [cost, setCost] = React.useState('2600000');
  const [active, setActive] = React.useState(true);
  const [description, setDescription] = React.useState('');
  const [contraindications, setContraindications] = React.useState('');

  const filteredTreatments = React.useMemo(() => {
    return treatments.filter((t) => {
      const matchesSearch =
        t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.description.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCat = selectedCategory === 'all' || t.category === selectedCategory;
      return matchesSearch && matchesCat;
    });
  }, [treatments, searchTerm, selectedCategory]);

  const handleOpenCreate = () => {
    setEditingTreatment(null);
    setCode(`TRT-${Date.now().toString().slice(-4)}`);
    setName('');
    setCategory('injectable');
    setSessions('4');
    setDurationMinutes('30');
    setPrice('3500000');
    setCost('1500000');
    setActive(true);
    setDescription('');
    setContraindications('');
    setIsDrawerOpen(true);
  };

  const handleOpenEdit = (t: Treatment) => {
    setEditingTreatment(t);
    setCode(t.code);
    setName(t.name);
    setCategory(t.category);
    setSessions(String(t.sessions));
    setDurationMinutes(String(t.durationMinutes));
    setPrice(String(t.price));
    setCost(String(t.cost));
    setActive(t.active);
    setDescription(t.description);
    setContraindications(t.contraindications.join(', '));
    setIsDrawerOpen(true);
  };

  const handleSaveTreatment = (e: React.FormEvent) => {
    e.preventDefault();
    const contraList = contraindications
      .split(',')
      .map((c) => c.trim())
      .filter(Boolean);

    const payload = {
      code,
      name,
      category,
      sessions: parseInt(sessions) || 1,
      durationMinutes: parseInt(durationMinutes) || 30,
      price: parseFloat(price) || 0,
      cost: parseFloat(cost) || 0,
      active,
      description,
      contraindications: contraList,
    };

    if (editingTreatment) {
      updateTreatment(editingTreatment.id, payload);
    } else {
      addTreatment(payload);
    }

    setIsDrawerOpen(false);
  };

  const confirmDelete = () => {
    if (treatmentToDelete) {
      deleteTreatment(treatmentToDelete);
      setTreatmentToDelete(null);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in-50 duration-200">
      {/* Page Header */}
      <PageHeader
        eyebrow="Clinical Master Data & Protocols"
        eyebrowIcon={Stethoscope}
        title="Treatment Catalog & Protocol Master Data"
        description="Configure medical weight loss packages, injectable peptide protocols, body contouring sessions, and clinic pricing margins."
        actions={
          <Button size="sm" variant="highlight" onClick={handleOpenCreate} className="gap-1.5">
            <Plus className="h-3.5 w-3.5" />
            New Treatment Protocol
          </Button>
        }
      />

      {/* Filter Toolbar */}
      <Card className="p-4 bg-card border-border shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by code, protocol name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 h-9 text-xs"
          />
        </div>

        <div className="flex items-center gap-2.5 w-full md:w-auto">
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="h-9 w-48 text-xs">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="injectable">Injectable Peptides</SelectItem>
              <SelectItem value="body-contouring">Body Contouring</SelectItem>
              <SelectItem value="rf-therapy">RF Lipolysis</SelectItem>
              <SelectItem value="metabolic-package">Metabolic Packages</SelectItem>
              <SelectItem value="consultation-pack">Consultation Packs</SelectItem>
              <SelectItem value="nutrition-lab">Nutrition & Labs</SelectItem>
            </SelectContent>
          </Select>

          {(searchTerm || selectedCategory !== 'all') && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('all');
              }}
              className="h-9 text-xs font-mono"
            >
              Reset
            </Button>
          )}
        </div>
      </Card>

      {/* Treatments Data Table */}
      <Card className="border-border bg-card shadow-xs overflow-hidden">
        {filteredTreatments.length === 0 ? (
          <div className="p-12">
            <EmptyState
              icon={Stethoscope}
              title="No Treatments Found"
              description="No clinical protocols match your filter criteria."
              actionLabel="Reset Search"
              onAction={() => {
                setSearchTerm('');
                setSelectedCategory('all');
              }}
            />
          </div>
        ) : (
          <Table variant="striped" size="sm">
            <TableHeader>
              <TableRow>
                <TableHead className="w-32">Code</TableHead>
                <TableHead>Protocol Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Sessions / Duration</TableHead>
                <TableHead>Retail Price (IDR)</TableHead>
                <TableHead>Margin</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTreatments.map((t) => {
                const catInfo = CATEGORY_BADGES[t.category] || {
                  label: t.category,
                  variant: 'default',
                };
                const marginPct = t.price > 0 ? Math.round(((t.price - t.cost) / t.price) * 100) : 0;

                return (
                  <TableRow key={t.id}>
                    <TableCell className="font-mono text-xs font-bold text-foreground">
                      {t.code}
                    </TableCell>

                    <TableCell>
                      <div className="space-y-0.5 max-w-sm">
                        <div className="flex items-center gap-2">
                          <p className="font-display font-semibold text-xs text-foreground">
                            {t.name}
                          </p>
                          {t.popular && (
                            <Badge variant="highlight" size="sm" className="text-[9px] h-3.5 px-1">
                              Popular
                            </Badge>
                          )}
                        </div>
                        <p className="text-[11px] text-muted-foreground line-clamp-1">
                          {t.description}
                        </p>
                      </div>
                    </TableCell>

                    <TableCell>
                      <Badge variant={catInfo.variant} size="sm">
                        {catInfo.label}
                      </Badge>
                    </TableCell>

                    <TableCell className="font-mono text-xs">
                      {t.sessions}x ({t.durationMinutes}m)
                    </TableCell>

                    <TableCell className="font-mono text-xs font-bold text-foreground">
                      Rp {t.price.toLocaleString()}
                    </TableCell>

                    <TableCell className="font-mono text-xs">
                      <span className={marginPct >= 50 ? 'text-success font-semibold' : 'text-foreground'}>
                        {marginPct}%
                      </span>
                    </TableCell>

                    <TableCell>
                      <Badge variant={t.active ? 'success' : 'outline'} size="sm" className="text-[10px]">
                        {t.active ? 'Active' : 'Disabled'}
                      </Badge>
                    </TableCell>

                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOpenEdit(t)}
                          className="h-7 w-7 text-muted-foreground hover:text-foreground"
                          title="Edit Protocol"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setTreatmentToDelete(t.id)}
                          className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                          title="Delete Protocol"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </Card>

      {/* Add / Edit Slide-over Drawer Sheet */}
      <Sheet open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
        <SheetContent side="right" className="w-full sm:max-w-xl overflow-y-auto p-6 space-y-5">
          <form onSubmit={handleSaveTreatment} className="space-y-4">
            <SheetHeader className="space-y-1">
              <SheetTitle className="font-display text-base">
                {editingTreatment ? 'Edit Treatment Protocol' : 'Create Treatment Protocol'}
              </SheetTitle>
              <SheetDescription className="text-xs">
                Configure clinical scope, duration, pricing structure, and contraindications.
              </SheetDescription>
            </SheetHeader>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 py-2">
              <div className="space-y-1">
                <Label htmlFor="code" className="text-xs">Protocol Code *</Label>
                <Input
                  id="code"
                  required
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="h-9 text-xs font-mono uppercase"
                  placeholder="e.g. TRT-GLP1-MONTHLY"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Category *</Label>
                <Select value={category} onValueChange={(v) => setCategory(v as TreatmentCategory)}>
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="injectable">Injectable Peptide</SelectItem>
                    <SelectItem value="body-contouring">Body Contouring</SelectItem>
                    <SelectItem value="rf-therapy">RF Lipolysis</SelectItem>
                    <SelectItem value="metabolic-package">Metabolic Package</SelectItem>
                    <SelectItem value="consultation-pack">Consultation Pack</SelectItem>
                    <SelectItem value="nutrition-lab">Nutrition Lab</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1 sm:col-span-2">
                <Label htmlFor="name" className="text-xs">Protocol Title *</Label>
                <Input
                  id="name"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="h-9 text-xs"
                  placeholder="e.g. GLP-1 Medical Weight Loss Protocol"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="sessions" className="text-xs">Sessions Included *</Label>
                <Input
                  id="sessions"
                  type="number"
                  required
                  value={sessions}
                  onChange={(e) => setSessions(e.target.value)}
                  className="h-9 text-xs font-mono"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="duration" className="text-xs">Duration per Session (mins) *</Label>
                <Input
                  id="duration"
                  type="number"
                  required
                  value={durationMinutes}
                  onChange={(e) => setDurationMinutes(e.target.value)}
                  className="h-9 text-xs font-mono"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="price" className="text-xs">Retail Price (IDR) *</Label>
                <Input
                  id="price"
                  type="number"
                  required
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="h-9 text-xs font-mono"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="cost" className="text-xs">Internal Direct Cost (IDR)</Label>
                <Input
                  id="cost"
                  type="number"
                  value={cost}
                  onChange={(e) => setCost(e.target.value)}
                  className="h-9 text-xs font-mono"
                />
              </div>

              <div className="space-y-1 sm:col-span-2">
                <Label htmlFor="description" className="text-xs">Clinical Scope & Description</Label>
                <Textarea
                  id="description"
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="text-xs resize-none"
                  placeholder="Detailed description of clinical mechanism and what is provided..."
                />
              </div>

              <div className="space-y-1 sm:col-span-2">
                <Label htmlFor="contraindications" className="text-xs">Contraindications (Comma separated)</Label>
                <Input
                  id="contraindications"
                  value={contraindications}
                  onChange={(e) => setContraindications(e.target.value)}
                  className="h-9 text-xs"
                  placeholder="e.g. Pregnancy, MEN2 family history, Pacemaker"
                />
              </div>

              <div className="flex items-center gap-3 sm:col-span-2 pt-2 border-t border-border/40">
                <Switch id="active-toggle" checked={active} onCheckedChange={setActive} />
                <Label htmlFor="active-toggle" className="text-xs cursor-pointer">
                  Active in Treatment Catalog & POS
                </Label>
              </div>
            </div>

            <SheetFooter className="gap-2 pt-4 border-t border-border/40">
              <Button type="button" variant="outline" size="sm" onClick={() => setIsDrawerOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm" variant="highlight">
                {editingTreatment ? 'Save Changes' : 'Create Protocol'}
              </Button>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>

      {/* Delete Confirmation Alert Dialog */}
      <AlertDialog open={Boolean(treatmentToDelete)} onOpenChange={(open) => !open && setTreatmentToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-base font-display">Deactivate Treatment Protocol?</AlertDialogTitle>
            <AlertDialogDescription className="text-xs">
              This treatment will be deactivated from future clinical appointments and POS checkout. Historical records will remain intact.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep Protocol</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Deactivate Protocol
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
