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
      description: z.string().max(200, 'Description must be at most 200 characters.'),
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
      amount: z.number().min(0, 'Budget must be at least 0%.').max(100, 'Budget must be at most 100%.'),
      headcount: z.number().min(1, 'Headcount must be at least 1 person.').max(50, 'Headcount must be at most 50 people.'),
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
    message: 'Start date must be on or before end date.',
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

const accessibilityGroups: { title: string; notes: string[] }[] = [
  {
    title: 'Errors & validation',
    notes: [
      'Validation runs after blur (onTouched), so fields are not marked invalid before they are touched.',
      'Every invalid field is linked to its message with aria-describedby and aria-invalid.',
      'On submit with errors, focus moves to the error summary region, and each summary link moves focus to its field.',
    ],
  },
  {
    title: 'Conditional & dynamic rows',
    notes: [
      'The email notifications switch reveals a guidance block; no email is sent.',
      'Each member row is labelled by position (Email for member 2, Role for member 2), and the remove button is a 44 px target with its own label.',
      'Adding a member moves focus to the new row\u2019s email field; removing a member moves focus to the next row or back to Add member.',
    ],
  },
  {
    title: 'Autosave & status',
    notes: [
      'Draft status (pending, saved, errors) is announced through a polite live region (role="status").',
      'Drafts are saved to localStorage only, debounced by 1.2 seconds; nothing leaves this browser.',
      'Read, save, and delete failures keep sample values on screen and say so in the status message.',
    ],
  },
];

export default function DynamicFormPage() {
  const [draftStatus, setDraftStatus] = React.useState<DraftStatus>('empty');
  const [resetOpen, setResetOpen] = React.useState(false);
  const resetTrigger = React.useRef<HTMLButtonElement>(null);
  const timer = React.useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const hasDraft = React.useRef(false);
  const suppressSave = React.useRef(false);
  const summaryRef = React.useRef<HTMLDivElement>(null);
  const addMemberRef = React.useRef<HTMLButtonElement>(null);
  const [pendingMemberFocus, setPendingMemberFocus] = React.useState<string | null>(null);

  const form = useForm<FormValues, unknown, z.output<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: seedValues(),
    mode: 'onTouched',
    shouldFocusError: false,
  });

  const { control, watch, handleSubmit, formState, reset } = form;
  const { errors, isDirty } = formState;
  const members = useFieldArray({ control, name: 'members' });

  const watchNotifyEmail = watch('audience.notifyEmail');
  React.useEffect(() => {
    if (!pendingMemberFocus) return;
    if (pendingMemberFocus === 'add') addMemberRef.current?.focus();
    else document.getElementById(pendingMemberFocus)?.focus();
    setPendingMemberFocus(null);
  }, [members.fields, pendingMemberFocus]);

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
  }, () => {
    requestAnimationFrame(() => summaryRef.current?.focus());
  });

  const handleReset = () => {
    clearDraft();
    suppressSave.current = true;
    reset(seedValues());
    suppressSave.current = false;
  };

  const allErrors = React.useMemo(() => {
    const list: { label: string; id: string; message: string }[] = [];
    const add = (label: string, id: string, error: { message?: string } | undefined) => {
      if (error?.message) list.push({ label, id, message: error.message });
    };
    add('Project name', 'project-name', errors.project?.name);
    add('Description', 'project-desc', errors.project?.description);
    add('Discovery tags', 'project-tags', errors.project?.tags);
    add('Kickoff date', 'schedule-kickoff', errors.schedule?.kickoff);
    add('Owner', 'schedule-owner', errors.schedule?.owner);
    add('Engagement window', 'schedule-period', errors.schedule?.period);
    add('Sectors targeted', 'audience-sectors', errors.audience?.sectors);
    add('Budget allocation', 'budget-amount', errors.budget?.amount);
    add('Headcount', 'budget-headcount', errors.budget?.headcount);
    members.fields.forEach((_member, index) => {
      const row = errors.members?.[index];
      add(`Member ${index + 1} email`, `member-${index}-email`, row?.email);
      add(`Member ${index + 1} role`, `member-${index}-role`, row?.role);
    });
    return list;
  }, [errors, members.fields]);

  return (
    <div className="space-y-10 animate-in fade-in-50 duration-200 motion-reduce:animate-none">
      <PageHeader
        eyebrow="UX Recipe Scenario"
        eyebrowIcon={GitFork}
        title="Dynamic Form"
        description="Dynamic member rows, conditional fields, and a draft autosaved in this browser that you can resume after reload. The demo does not send email or publish anything."
      />

      {allErrors.length > 0 && (
        <div ref={summaryRef} tabIndex={-1} role="region" aria-labelledby="error-summary-title" className="rounded-lg border border-destructive bg-card p-4 text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
          <p id="error-summary-title" className="font-semibold">The form needs your attention</p>
          <ul className="mt-2 list-disc space-y-2 pl-5 text-sm">
            {allErrors.map(({ label, id, message }) => (
              <li key={id}>
                <a href={`#${id}`} className="rounded-sm underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" onClick={(event) => {
                  event.preventDefault();
                  document.getElementById(id)?.focus();
                }}>{label}: <span>{message}</span></a>
              </li>
            ))}
          </ul>
        </div>
      )}

      <section aria-labelledby="interactive-demo" className="scroll-mt-20 space-y-4">
        <SectionHeading id="interactive-demo" title="Interactive demo" description="Fill the form below to try field arrays, validation, and autosave in this browser." />
      <form onSubmit={submit} onBlurCapture={(event) => {
        const compositeFields = {
          'schedule-kickoff': 'schedule.kickoff',
          'schedule-owner': 'schedule.owner',
          'schedule-period': 'schedule.period',
          'audience-sectors': 'audience.sectors',
        } as const;
        const id = event.target.id;
        if (id in compositeFields) {
          const name = compositeFields[id as keyof typeof compositeFields];
          form.setValue(name, form.getValues(name), { shouldTouch: true, shouldValidate: true });
        }
      }} className="mx-auto w-full max-w-3xl space-y-6 min-w-0">
        <p className="text-sm text-muted-foreground">Required: project name (at least 3 characters), kickoff date, owner, and at least 1 sector. Other fields are optional or prefilled. Description: at most 200 characters; up to 5 tags. Engagement dates may be the same day. Budget: 0–100%; headcount: 1–50 people. Team members are optional; each added row needs a valid email and a role.</p>
        {/* Project Info */}
        <FormSection title="Project Information" description="Name, description and discovery tags.">
          <div className="grid min-w-0 grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="project-name">
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
                <p id="err-project-name" className="text-xs font-medium text-foreground">{errors.project.name.message}</p>
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
                <p id="err-project-desc" className="text-xs font-medium text-foreground">{errors.project.description.message}</p>
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
                    onBlur={field.onBlur}
                    maxTags={5}
                    error={Boolean(errors.project?.tags)}
                    placeholder="Add tags and press Enter..."
                  />
                )}
              />
              {errors.project?.tags && (
                <p id="err-project-tags" className="text-xs font-medium text-foreground">{errors.project.tags.message}</p>
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
                <p id="err-schedule-kickoff" className="text-xs font-medium text-foreground">{errors.schedule.kickoff.message}</p>
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
                <p id="err-schedule-owner" className="text-xs font-medium text-foreground">{errors.schedule.owner.message}</p>
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
                <p id="err-schedule-period" className="text-xs font-medium text-foreground">{errors.schedule.period.message}</p>
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
                    <p id="err-audience-sectors" className="text-xs font-medium text-foreground">{errors.audience.sectors.message}</p>
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
                    <p id="audience-notify-help" className="text-xs text-muted-foreground">
                      Demo only: reveals a guidance block below. No email is sent.
                    </p>
                  </div>
                  <Switch id="audience-notify" checked={field.value} onCheckedChange={field.onChange} aria-label="Email notifications" aria-describedby="audience-notify-help" />
                </div>
              )}
            />
            {watchNotifyEmail && (
              <div className="rounded-md border border-highlight/30 bg-highlight/5 p-3 animate-in slide-in-from-top-1 fade-in duration-150 motion-reduce:animate-none">
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
                    onBlur={field.onBlur}
                    onValueChange={field.onChange}
                    min={0}
                    max={100}
                    step={5}
                    suffix="%"
                    error={Boolean(errors.budget?.amount)}
                  />
                  {errors.budget?.amount && (
                    <p id="err-budget-amount" className="text-xs font-medium text-foreground">{errors.budget.amount.message}</p>
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
                    onBlur={field.onBlur}
                    onValueChange={field.onChange}
                    min={1}
                    max={50}
                    error={Boolean(errors.budget?.headcount)}
                  />
                  {errors.budget?.headcount && (
                    <p id="err-budget-headcount" className="text-xs font-medium text-foreground">{errors.budget.headcount.message}</p>
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
            {members.fields.length === 0 && <p className="rounded-lg border border-border p-3 text-sm text-muted-foreground">No team members. You can continue without members or add one below.</p>}
            {members.fields.map((field, index) => {
              const rowError = errors.members?.[index];
              return (
                <div
                  key={field.id}
                  className="grid min-w-0 gap-3 rounded-lg border border-border p-3 md:grid-cols-[minmax(0,1fr)_150px_44px] md:items-start"
                >
                  <div className="space-y-1">
                    <Label htmlFor={`member-${index}-email`}>Email <span className="sr-only">for member {index + 1}</span></Label>
                    <Input
                      id={`member-${index}-email`}
                      placeholder={`member-${index + 1}@company.com`}
                      aria-label={`Email for member ${index + 1}`}
                      aria-describedby={rowError?.email ? `err-member-${index}-email` : undefined}
                      error={Boolean(rowError?.email)}
                      {...form.register(`members.${index}.email`)}
                    />
                    {rowError?.email && (
                      <p id={`err-member-${index}-email`} className="text-xs font-medium text-foreground">{rowError.email.message}</p>
                    )}
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor={`member-${index}-role`}>Role <span className="sr-only">for member {index + 1}</span></Label>
                    <Controller control={control} name={`members.${index}.role`} render={({ field: roleField }) => (
                      <Select value={roleField.value} onValueChange={roleField.onChange}>
                        <SelectTrigger id={`member-${index}-role`} ref={roleField.ref} onBlur={roleField.onBlur} className="w-full" aria-label={`Role for member ${index + 1}`} aria-invalid={Boolean(rowError?.role)} aria-describedby={rowError?.role ? `err-member-${index}-role` : undefined}>
                          <SelectValue placeholder="Role" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="admin">Admin</SelectItem>
                          <SelectItem value="editor">Editor</SelectItem>
                          <SelectItem value="viewer">Viewer</SelectItem>
                        </SelectContent>
                      </Select>
                    )} />
                    {rowError?.role && <p id={`err-member-${index}-role`} className="text-xs font-medium text-foreground">{rowError.role.message}</p>}
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      members.remove(index);
                      setPendingMemberFocus(index < members.fields.length - 1 ? `member-${index}-email` : 'add');
                    }}
                    aria-label={`Remove member ${index + 1}`}
                    className="h-11 w-11 text-destructive hover:text-destructive hover:bg-destructive/10 md:mt-6"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              );
            })}
            <div className="flex items-center gap-2">
              <Button
                ref={addMemberRef}
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  members.append(EMPTY_MEMBER, { shouldFocus: false });
                  setPendingMemberFocus(`member-${members.fields.length}-email`);
                }}
              >
                <Plus className="h-4 w-4" />
                Add member
              </Button>
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

      <section id="accessibility" aria-labelledby="accessibility-heading" className="space-y-4 scroll-mt-20">
        <SectionHeading
          id="accessibility-heading"
          title="Accessibility notes"
          description="What the pattern guarantees for errors, dynamic rows, and draft status."
        />

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {accessibilityGroups.map((group) => (
            <div key={group.title} className="space-y-2">
              <h3 className="text-xl font-bold font-display text-foreground">{group.title}</h3>
              <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                {group.notes.map((note) => (
                  <li key={note}>{note}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
