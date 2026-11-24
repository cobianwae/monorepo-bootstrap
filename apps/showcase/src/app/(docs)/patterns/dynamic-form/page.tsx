'use client';

import * as React from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Button,
  AlertDialog,
  AlertDialogContent,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
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
  toast,
  type ComboboxOption,
} from '@ds/ui';
import {
  CheckCircle2,
  Plus,
  Trash2,
  RotateCcw,
  Info,
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
      kickoff: z.date({ message: 'Pick a kickoff date.' }).nullable().refine((value) => value !== null, 'Pick a kickoff date.'),
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

type FormValues = z.input<typeof schema>;

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

function seedValues(): FormValues {
  return {
    project: { name: 'Acme Data Platform', description: 'Unified analytics and reporting for all teams.', tags: ['Analytics', '2026'] },
    schedule: { kickoff: new Date(2026, 8, 1), period: { from: new Date(2026, 8, 1), to: new Date(2026, 11, 31) }, owner: '' },
    audience: { sectors: ['fintech'], notifyEmail: true },
    budget: { amount: 60, headcount: 5 },
    members: [{ email: 'sarah.connor@acme.io', role: 'admin' }, { email: 'john.doe@acme.io', role: 'editor' }],
  };
}

// Drafts may be incomplete or invalid for submission, but must be safe to render.
const draftDate = z.union([z.string().datetime(), z.null()]).transform((value) => value === null ? undefined : new Date(value));
const draftSchema = z.object({
  project: z.object({ name: z.string(), description: z.string(), tags: z.array(z.string()) }).partial().optional(),
  schedule: z.object({
    kickoff: z.union([z.string().datetime(), z.null()]).transform((value) => value === null ? null : new Date(value)),
    period: z.object({ from: draftDate.optional(), to: draftDate.optional() }).nullable().transform((value) => value ?? { from: undefined, to: undefined }).optional(),
    owner: z.string(),
  }).partial().optional(),
  audience: z.object({ sectors: z.array(z.string()), notifyEmail: z.boolean() }).partial().optional(),
  budget: z.object({ amount: z.number().finite(), headcount: z.number().finite() }).partial().optional(),
  members: z.array(z.object({ email: z.string(), role: z.enum(['admin', 'editor', 'viewer']) })).optional(),
});

function serializeDraft(values: unknown) {
  return JSON.stringify(values, (_key, value: unknown) => value === undefined ? null : value);
}

type DraftStatus = 'empty' | 'pending' | 'saved' | 'restored' | 'read-error' | 'save-error' | 'delete-error';
const DRAFT_MESSAGES: Record<DraftStatus, string> = {
  empty: 'No draft saved on this browser.',
  pending: 'Changes are waiting to be saved on this browser.',
  saved: 'Draft saved on this browser.',
  restored: 'Draft restored from this browser.',
  'read-error': "Couldn't read this draft. The demo is showing sample values.",
  'save-error': "Couldn't save this draft. Your changes are still in this tab.",
  'delete-error': "Couldn't delete this draft from this browser. It may return after reload.",
};

export default function DynamicFormPage() {
  const [draftStatus, setDraftStatus] = React.useState<DraftStatus>('empty');
  const [resetOpen, setResetOpen] = React.useState(false);
  const resetTrigger = React.useRef<HTMLButtonElement>(null);
  const timer = React.useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const hasDraft = React.useRef(false);
  const suppressSave = React.useRef(false);

  const form = useForm<FormValues, unknown, z.output<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: seedValues(),
  });

  const { control, watch, handleSubmit, formState, reset } = form;
  const { errors, isDirty } = formState;
  const members = useFieldArray({ control, name: 'members' });

  const watchNotifyEmail = watch('audience.notifyEmail');

  React.useEffect(() => {
    try {
      const raw = window.localStorage.getItem(DRAFT_KEY);
      hasDraft.current = raw !== null;
      if (raw !== null) {
        const draft = draftSchema.parse(JSON.parse(raw));
        const seed = seedValues();
        reset({
          project: { ...seed.project, ...draft.project },
          schedule: { ...seed.schedule, ...draft.schedule },
          audience: { ...seed.audience, ...draft.audience },
          budget: { ...seed.budget, ...draft.budget },
          members: draft.members ?? seed.members,
        });
        setDraftStatus('restored');
      }
    } catch {
      hasDraft.current = true;
      setDraftStatus('read-error');
    }
    let latest = serializeDraft(form.getValues());
    const subscription = watch(() => {
      const snapshot = serializeDraft(form.getValues());
      if (snapshot === latest) return;
      latest = snapshot;
      if (suppressSave.current) return;
      clearTimeout(timer.current);
      setDraftStatus('pending');
      timer.current = setTimeout(() => {
        try {
          window.localStorage.setItem(DRAFT_KEY, snapshot);
          hasDraft.current = true;
          setDraftStatus('saved');
        } catch {
          setDraftStatus('save-error');
        }
      }, 1200);
    });
    return () => {
      clearTimeout(timer.current);
      subscription.unsubscribe();
    };
  }, [form, reset, watch]);

  const clearDraft = () => {
    clearTimeout(timer.current);
    try {
      window.localStorage.removeItem(DRAFT_KEY);
      hasDraft.current = false;
      setDraftStatus('empty');
    } catch {
      hasDraft.current = true;
      setDraftStatus('delete-error');
    }
  };

  const submit = handleSubmit((values) => {
    clearDraft();
    toast({
      variant: 'success',
      title: 'Demo submitted',
      description: `Validation passed for “${values.project.name}”. No project was created and no notifications were sent.`,
    });
  });

  const handleReset = () => {
    clearDraft();
    suppressSave.current = true;
    reset(seedValues());
    suppressSave.current = false;
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
                    value={field.value ?? undefined}
                    onValueChange={(value) => field.onChange(value ?? null)}
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
                    onValueChange={(range) => field.onChange(range ?? { from: undefined, to: undefined })}
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
            <div className="space-y-1">
              <p role="status" aria-live="polite" aria-atomic="true" className="text-sm text-foreground">
                {DRAFT_MESSAGES[draftStatus]}
              </p>
              <p className="text-xs text-muted-foreground">Drafts stay in this browser only. Submit demo validates without creating a project or sending notifications.</p>
            </div>
            <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
              <Button ref={resetTrigger} type="button" variant="ghost" size="sm" onClick={() => {
                if (isDirty || hasDraft.current || draftStatus === 'pending' || draftStatus === 'save-error') setResetOpen(true);
                else handleReset();
              }} className="w-full sm:w-auto">
                <RotateCcw className="h-4 w-4" />
                Reset demo
              </Button>
              <Button type="submit" size="sm" className="w-full sm:w-auto">
                <CheckCircle2 className="h-4 w-4" />
                Submit demo
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
      </section>
      <AlertDialog open={resetOpen} onOpenChange={setResetOpen}>
        <AlertDialogContent onCloseAutoFocus={(event) => {
          event.preventDefault();
          resetTrigger.current?.focus();
        }}>
          <AlertDialogTitle>Reset this demo?</AlertDialogTitle>
          <AlertDialogDescription>Your changes and any draft saved on this browser will be discarded. Sample values will be restored.</AlertDialogDescription>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleReset}>Reset demo</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <section aria-labelledby="try-it" className="scroll-mt-20 space-y-4 max-w-3xl">
        <SectionHeading id="try-it" title="Try it" />
        <ol className="list-decimal space-y-2 pl-5 text-sm text-muted-foreground">
          <li>Pick one or more sectors under Audience &amp; Targeting.</li>
          <li>Turn on email notifications to reveal the guidance block. Nothing is sent.</li>
          <li>Add a team member, then enter an invalid email to see the row message.</li>
          <li>Edit a field, wait for the draft saved status, then reload to resume it in this browser.</li>
          <li>Clear the project name and press Submit demo to see the error summary. Nothing is published.</li>
        </ol>
      </section>
    </div>
  );
}
