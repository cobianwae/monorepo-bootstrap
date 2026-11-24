'use client';

import * as React from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Button,
  Card,
  CardContent,
  Input,
  Label,
  Textarea,
  Switch,
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  Combobox,
  DatePicker,
  DateRangePicker,
  TagInput,
  NumberInput,
  FormSection,
  FormErrorSummary,
  Badge,
  toast,
  type ComboboxOption,
} from '@ds/ui';
import {
  CheckCircle2,
  Plus,
  Trash2,
  Save,
  RotateCcw,
  ShieldCheck,
  Info,
  AlertTriangle,
  GitFork,
} from 'lucide-react';
import { PageHeader } from '@ds/ui';
import { SectionHeading } from '../../../../components/section-heading';

const DRAFT_KEY = 'ds:dynamic-form-draft';

const schema = z
  .object({
    project: z.object({
      name: z.string().min(3, 'Project name must be at least 3 characters.'),
      description: z.string().max(200, 'Description must be under 200 characters.'),
      tags: z.array(z.string()).max(5, 'Maximum 5 tags.').optional(),
    }),
    schedule: z.object({
      kickoff: z.date({ message: 'Pick a kickoff date.' }),
      period: z
        .object({
          from: z.date().optional(),
          to: z.date().optional(),
        })
        .optional(),
      owner: z.string().min(1, 'Assign an owner.'),
    }),
    audience: z.object({
      sectors: z.array(z.string()).min(1, 'Add at least one sector.'),
      notifyEmail: z.boolean().optional(),
    }),
    budget: z.object({
      amount: z.number().min(0).max(100),
      headcount: z.number().min(1).max(50),
    }),
    members: z.array(
      z.object({
        email: z.string().email('Invalid email address.'),
        role: z.enum(['admin', 'editor', 'viewer']),
      })
    ),
  })
  .refine((d) => !d.schedule.period?.from || !d.schedule.period?.to || d.schedule.period.from <= d.schedule.period.to, {
    path: ['schedule', 'period'],
    message: 'Start date must be before end date.',
  });

type FormValues = z.infer<typeof schema>;

const OWNER_OPTIONS: ComboboxOption[] = [
  { value: 'sarah@acme.io', label: 'Sarah Connor', description: 'sarah@acme.io' },
  { value: 'john@acme.io', label: 'John Doe', description: 'john@acme.io' },
  { value: 'omar@acme.io', label: 'Omar Haddad', description: 'omar@acme.io' },
];

const SECTOR_OPTIONS: ComboboxOption[] = [
  { value: 'fintech', label: 'Fintech' },
  { value: 'health', label: 'Healthcare' },
  { value: 'retail', label: 'Retail' },
  { value: 'logistics', label: 'Logistics' },
  { value: 'edtech', label: 'EdTech' },
];

const EMPTY_MEMBER = { email: '', role: 'editor' as const };

function loadDraft(): Partial<FormValues> | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(DRAFT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed as Partial<FormValues>;
  } catch {
    return null;
  }
}

function saveDraft(values: Partial<FormValues>) {
  try {
    window.localStorage.setItem(DRAFT_KEY, JSON.stringify(values));
  } catch {
    // storage full or unavailable — ignore
  }
}

function clearDraft() {
  try {
    window.localStorage.removeItem(DRAFT_KEY);
  } catch {
    // ignore
  }
}

export default function DynamicFormPage() {
  const [lastSavedAt, setLastSavedAt] = React.useState<string | null>(null);
  const [isResetting, setIsResetting] = React.useState(false);

  const draft = React.useMemo(loadDraft, []);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      project: {
        name: draft?.project?.name ?? 'Acme Data Platform',
        description: draft?.project?.description ?? 'Unified analytics and reporting for all teams.',
        tags: draft?.project?.tags ?? ['Analytics', '2026'],
      },
      schedule: {
        kickoff: draft?.schedule?.kickoff ? new Date(draft.schedule.kickoff) : new Date(2026, 8, 1),
        period: draft?.schedule?.period
          ? {
              from: draft.schedule.period.from ? new Date(draft.schedule.period.from) : undefined,
              to: draft.schedule.period.to ? new Date(draft.schedule.period.to) : undefined,
            }
          : { from: new Date(2026, 8, 1), to: new Date(2026, 11, 31) },
        owner: draft?.schedule?.owner ?? '',
      },
      audience: {
        sectors: draft?.audience?.sectors ?? ['fintech'],
        notifyEmail: draft?.audience?.notifyEmail ?? true,
      },
      budget: {
        amount: draft?.budget?.amount ?? 60,
        headcount: draft?.budget?.headcount ?? 5,
      },
      members: draft?.members?.length
        ? draft.members
        : [
            { email: 'sarah.connor@acme.io', role: 'admin' },
            { email: 'john.doe@acme.io', role: 'editor' },
          ],
    },
  });

  const { control, watch, handleSubmit, formState, reset } = form;
  const { errors, isDirty } = formState;
  const members = useFieldArray({ control, name: 'members' });

  const watchNotifyEmail = watch('audience.notifyEmail');

  // Autosave draft every 1.2s when dirty
  React.useEffect(() => {
    if (!isDirty) return;
    const id = window.setTimeout(() => {
      const values = form.getValues();
      saveDraft(values);
      setLastSavedAt(new Date().toLocaleTimeString());
    }, 1200);
    return () => window.clearTimeout(id);
  }, [isDirty, formState, form]);

  const submit = handleSubmit((values) => {
    clearDraft();
    setLastSavedAt(null);
    toast({
      variant: 'success',
      title: 'Project published',
      description: `“${values.project.name}” was created with ${values.members.length} members.`,
    });
  });

  const handleReset = () => {
    clearDraft();
    reset({
      project: { name: '', description: '', tags: [] },
      schedule: { kickoff: new Date(), period: { from: undefined, to: undefined }, owner: '' },
      audience: { sectors: [], notifyEmail: true },
      budget: { amount: 50, headcount: 3 },
      members: [{ email: '', role: 'editor' }],
    });
    setIsResetting(true);
    window.setTimeout(() => setIsResetting(false), 400);
    toast({ variant: 'info', title: 'Draft cleared', description: 'All fields reset.' });
  };

  const memberErrorCount = errors.members?.length ?? 0;
  const allErrors = React.useMemo(() => {
    const list: string[] = [];
    const walk = (node: unknown, path = '') => {
      if (!node || typeof node !== 'object') return;
      const obj = node as Record<string, unknown>;
      if (typeof obj.message === 'string') {
        list.push(obj.message);
        return;
      }
      for (const [key, value] of Object.entries(obj)) {
        if (Array.isArray(value)) {
          value.forEach((item, i) => walk(item, `${path}.${key}[${i}]`));
        } else {
          walk(value, `${path}.${key}`);
        }
      }
    };
    walk(errors);
    return list;
  }, [errors]);

  return (
    <div className="space-y-10 animate-in fade-in-50 duration-200">
      <PageHeader
        eyebrow="UX Recipe Scenario"
        eyebrowIcon={GitFork}
        title="Dynamic Form"
        description="A React Hook Form and Zod recipe with dynamic member rows, conditional fields, validation after submit, and a draft saved to localStorage that you can resume. The demo does not send email or publish anything."
        actions={
          <div className="flex items-center gap-2">
            {isDirty && (
              <Badge variant="secondary" className="gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-warning animate-pulse" />
                Unsaved changes
              </Badge>
            )}
            {lastSavedAt && (
              <Badge variant="outline" className="gap-1.5 text-muted-foreground">
                <Save className="h-3 w-3" />
                Draft saved {lastSavedAt}
              </Badge>
            )}
          </div>
        }
      />

      {allErrors.length > 0 && (
        <FormErrorSummary
          title="The form needs your attention"
          errors={allErrors}
        />
      )}

      <section aria-labelledby="interactive-demo" className="scroll-mt-20 space-y-4">
        <SectionHeading id="interactive-demo" title="Interactive demo" />
      <form onSubmit={submit} className="mx-auto w-full max-w-3xl space-y-6 min-w-0">
        {/* Project Info */}
        <FormSection title="Project Information" description="Name, description and discovery tags.">
          <div className="grid min-w-0 grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="project-name" className={errors.project?.name ? 'text-destructive' : ''}>
                Project name
              </Label>
              <Input
                id="project-name"
                error={Boolean(errors.project?.name)}
                aria-describedby={errors.project?.name ? 'err-project-name' : undefined}
                {...form.register('project.name')}
                placeholder="e.g. Customer 360 Platform"
              />
              {errors.project?.name && (
                <p id="err-project-name" className="text-xs font-medium text-destructive">{errors.project.name.message}</p>
              )}
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="project-desc">Description</Label>
              <Textarea
                id="project-desc"
                error={Boolean(errors.project?.description)}
                aria-describedby={errors.project?.description ? 'err-project-desc' : undefined}
                {...form.register('project.description')}
                rows={3}
                placeholder="What does this project deliver?"
              />
              {errors.project?.description && (
                <p id="err-project-desc" className="text-xs font-medium text-destructive">{errors.project.description.message}</p>
              )}
            </div>
            <div className="md:col-span-2 space-y-2">
              <Controller
                control={control}
                name="project.tags"
                render={({ field }) => (
                  <TagInput
                    label="Discovery tags"
                    id="project-tags"
                    aria-describedby={errors.project?.tags ? 'err-project-tags' : undefined}
                    value={field.value ?? []}
                    onChange={field.onChange}
                    maxTags={5}
                    error={Boolean(errors.project?.tags)}
                    placeholder="Add tags and press Enter..."
                  />
                )}
              />
              {errors.project?.tags && (
                <p id="err-project-tags" className="text-xs font-medium text-destructive">{errors.project.tags.message}</p>
              )}
            </div>
          </div>
        </FormSection>

        {/* Schedule */}
        <FormSection title="Schedule & Ownership" description="Timeline and who leads the project.">
          <div className="grid min-w-0 grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Controller
                control={control}
                name="schedule.kickoff"
                render={({ field }) => (
                  <DatePicker
                    label="Kickoff date"
                    id="schedule-kickoff"
                    aria-describedby={errors.schedule?.kickoff ? 'err-schedule-kickoff' : undefined}
                    value={field.value}
                    onValueChange={field.onChange}
                    error={Boolean(errors.schedule?.kickoff)}
                    presets={[
                      { label: 'Today', from: new Date() },
                      { label: '+1 month', from: new Date(Date.now() + 30 * 86400000) },
                    ]}
                  />
                )}
              />
              {errors.schedule?.kickoff && (
                <p id="err-schedule-kickoff" className="text-xs font-medium text-destructive">{errors.schedule.kickoff.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Controller
                control={control}
                name="schedule.owner"
                render={({ field }) => (
                  <Combobox
                    label="Owner"
                    id="schedule-owner"
                    aria-describedby={errors.schedule?.owner ? 'err-schedule-owner' : undefined}
                    options={OWNER_OPTIONS}
                    value={field.value}
                    onValueChange={(v) => field.onChange(v as string)}
                    placeholder="Assign owner..."
                    error={Boolean(errors.schedule?.owner)}
                  />
                )}
              />
              {errors.schedule?.owner && (
                <p id="err-schedule-owner" className="text-xs font-medium text-destructive">{errors.schedule.owner.message}</p>
              )}
            </div>
            <div className="md:col-span-2 space-y-2">
              <Controller
                control={control}
                name="schedule.period"
                render={({ field }) => (
                  <DateRangePicker
                    label="Engagement window"
                    id="schedule-period"
                    aria-describedby={errors.schedule?.period ? 'err-schedule-period' : undefined}
                    value={field.value}
                    onValueChange={(r) => field.onChange(r)}
                    error={Boolean(errors.schedule?.period)}
                  />
                )}
              />
              {errors.schedule?.period && (
                <p id="err-schedule-period" className="text-xs font-medium text-destructive">{errors.schedule.period.message}</p>
              )}
            </div>
          </div>
        </FormSection>

        {/* Conditional audience */}
        <FormSection title="Audience & Targeting" description="Conditional fields that adapt to your selections.">
          <div className="space-y-4">
            <Controller
              control={control}
              name="audience.sectors"
              render={({ field }) => (
                <div className="space-y-2">
                  <Combobox
                    label="Sectors targeted"
                    id="audience-sectors"
                    aria-describedby={errors.audience?.sectors ? 'err-audience-sectors' : undefined}
                    multiple
                    options={SECTOR_OPTIONS}
                    value={field.value}
                    onValueChange={(v) => field.onChange(v as string[])}
                    placeholder="Select sectors..."
                    error={Boolean(errors.audience?.sectors)}
                  />
                  {errors.audience?.sectors && (
                    <p id="err-audience-sectors" className="text-xs font-medium text-destructive">{errors.audience.sectors.message}</p>
                  )}
                </div>
              )}
            />
            <Controller
              control={control}
              name="audience.notifyEmail"
              render={({ field }) => (
                <div className="flex items-center justify-between rounded-lg border border-border p-3">
                  <div>
                    <p className="text-sm font-medium text-foreground">Email notifications</p>
                    <p className="text-xs text-muted-foreground">
                      Demo only: reveals a guidance block below. No email is sent.
                    </p>
                  </div>
                  <Switch id="audience-notify" checked={field.value} onCheckedChange={field.onChange} aria-label="Email notifications" />
                </div>
              )}
            />
            {watchNotifyEmail && (
              <div className="rounded-md border border-highlight/30 bg-highlight/5 p-3 animate-in slide-in-from-top-1 fade-in duration-200">
                <div className="flex items-start gap-2">
                  <Info className="h-4 w-4 text-highlight mt-0.5" />
                  <div className="text-xs text-muted-foreground">
                    <p className="font-medium text-foreground">Conditional section</p>
                    <p>Shown because email notifications are on. This demo does not send email.</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </FormSection>

        {/* Budget */}
        <FormSection title="Budget & Capacity" description="Numerical constraints with live feedback.">
          <div className="grid min-w-0 grid-cols-1 gap-4 md:grid-cols-2">
            <Controller
              control={control}
              name="budget.amount"
              render={({ field }) => (
                <div className="space-y-2">
                  <NumberInput
                    label="Budget allocation"
                    id="budget-amount"
                    aria-describedby={errors.budget?.amount ? 'err-budget-amount' : undefined}
                    value={field.value}
                    onValueChange={field.onChange}
                    min={0}
                    max={100}
                    step={5}
                    suffix="%"
                    error={Boolean(errors.budget?.amount)}
                  />
                  {errors.budget?.amount && (
                    <p id="err-budget-amount" className="text-xs font-medium text-destructive">{errors.budget.amount.message}</p>
                  )}
                </div>
              )}
            />
            <Controller
              control={control}
              name="budget.headcount"
              render={({ field }) => (
                <div className="space-y-2">
                  <NumberInput
                    label="Headcount"
                    id="budget-headcount"
                    aria-describedby={errors.budget?.headcount ? 'err-budget-headcount' : undefined}
                    value={field.value}
                    onValueChange={field.onChange}
                    min={1}
                    max={50}
                    error={Boolean(errors.budget?.headcount)}
                  />
                  {errors.budget?.headcount && (
                    <p id="err-budget-headcount" className="text-xs font-medium text-destructive">{errors.budget.headcount.message}</p>
                  )}
                </div>
              )}
            />
          </div>
        </FormSection>

        {/* Dynamic member rows */}
        <FormSection
          title="Team Members"
          description={
            members.fields.length > 0
              ? `${members.fields.length} member${members.fields.length > 1 ? 's' : ''} · add or remove rows dynamically.`
              : 'Add team members to the project.'
          }
        >
          <div className="space-y-3">
            {members.fields.map((field, index) => {
              const rowError = errors.members?.[index];
              return (
                <div
                  key={field.id}
                  className="grid gap-3 rounded-lg border border-border p-3 md:grid-cols-[1fr_150px_36px] md:items-center"
                >
                  <div className="space-y-1">
                    <Input
                      id={`member-${index}-email`}
                      placeholder={`member-${index + 1}@company.com`}
                      aria-label={`Email for member ${index + 1}`}
                      aria-describedby={rowError?.email ? `err-member-${index}-email` : undefined}
                      error={Boolean(rowError?.email)}
                      {...form.register(`members.${index}.email`)}
                    />
                    {rowError?.email && (
                      <p id={`err-member-${index}-email`} className="text-xs font-medium text-destructive">{rowError.email.message}</p>
                    )}
                  </div>
                  <Select
                    value={field.role}
                    onValueChange={(v) => form.setValue(`members.${index}.role`, v as FormValues['members'][number]['role'])}
                  >
                    <SelectTrigger className="w-full" aria-label={`Role for member ${index + 1}`}>
                      <SelectValue placeholder="Role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="editor">Editor</SelectItem>
                      <SelectItem value="viewer">Viewer</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => members.remove(index)}
                    aria-label={`Remove member ${index + 1}`}
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              );
            })}
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => members.append(EMPTY_MEMBER)}
              >
                <Plus className="h-4 w-4" />
                Add member
              </Button>
              {memberErrorCount > 0 && (
                <span className="text-xs text-destructive">
                  {memberErrorCount} invalid email{memberErrorCount > 1 ? 's' : ''}
                </span>
              )}
            </div>
          </div>
        </FormSection>

        <Card className="border-border">
          <CardContent className="p-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-2">
              {isDirty ? (
                <AlertTriangle className="h-4 w-4 text-warning-text mt-0.5" />
              ) : (
                <ShieldCheck className="h-4 w-4 text-highlight mt-0.5" />
              )}
              <p className="text-xs text-muted-foreground">
                {isDirty
                  ? 'You have unsaved changes. They will be auto-saved as a draft you can resume later.'
                  : 'All changes are saved. Nothing pending.'}
              </p>
            </div>
            <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
              <Button type="button" variant="ghost" size="sm" onClick={handleReset} disabled={isResetting} className="w-full sm:w-auto">
                <RotateCcw className="h-4 w-4" />
                Reset & clear draft
              </Button>
              <Button type="submit" size="sm" className="w-full sm:w-auto">
                <CheckCircle2 className="h-4 w-4" />
                Publish project
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
      </section>

      <section aria-labelledby="try-it" className="scroll-mt-20 space-y-4 max-w-3xl">
        <SectionHeading id="try-it" title="Try it" />
        <ol className="list-decimal space-y-2 pl-5 text-sm text-muted-foreground">
          <li>Pick one or more sectors under Audience &amp; Targeting.</li>
          <li>Turn on email notifications to reveal the guidance block. Nothing is sent.</li>
          <li>Add a team member, then enter an invalid email to see the row message.</li>
          <li>Clear the project name and press Publish project to see the error summary.</li>
        </ol>
      </section>
    </div>
  );
}