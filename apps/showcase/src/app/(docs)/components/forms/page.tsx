'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { id } from 'date-fns/locale';
import {
  Wand2,
  CheckCircle2,
  Layers,
  Sparkles,
  ShieldCheck,
  Send,
  TextCursorInput,
  Upload,
  User,
  Tags,
  Calendar,
  Clock,
  Filter as FilterIcon,
} from 'lucide-react';
import {
  PageHeader,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Badge,
  Button,
  Input,
  Textarea,
  Label,
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
  FormSection,
  FormErrorSummary,
  RadioGroup,
  RadioGroupItem,
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  Checkbox,
  Switch,
  FileInput,
  Combobox,
  DatePicker,
  DateRangePicker,
  InputOTP,
  TimePicker,
  TagInput,
  FilterBuilder,
  type ComboboxOption,
  type FilterChip,
  type FilterFieldDefinition,
  type SavedFilterView,
} from '@ds/ui';

interface FormSchema {
  fullName: string;
  email: string;
  plan: 'starter' | 'pro' | 'enterprise';
  organization: string;
  notes: string;
}

const SECTION_IDS = [
  { id: 'form-primitives', label: 'Form Field System' },
  { id: 'radio-group', label: 'RadioGroup' },
  { id: 'forms', label: 'Form Controls' },
  { id: 'file-uploads', label: 'File Uploads' },
  { id: 'form-sections', label: 'Form Sections' },
  { id: 'combobox', label: 'Combobox' },
  { id: 'tags', label: 'Tag Input' },
  { id: 'date', label: 'Date & Range' },
  { id: 'time', label: 'Time & OTP' },
  { id: 'filter-builder', label: 'Filter Builder' },
];

const MEMBER_OPTIONS: ComboboxOption[] = [
  { value: 'sarah@acme.io', label: 'Sarah Connor', description: 'sarah@acme.io', keywords: ['admin', 'sarah'] },
  { value: 'john@acme.io', label: 'John Doe', description: 'john@acme.io', keywords: ['editor', 'john'] },
  { value: 'nina@acme.io', label: 'Nina Patel', description: 'nina@acme.io', keywords: ['designer', 'nina'] },
  { value: 'omar@acme.io', label: 'Omar Haddad', description: 'omar@acme.io', keywords: ['engineer', 'omar'] },
  { value: 'lina@acme.io', label: 'Lina Kim', description: 'lina@acme.io', keywords: ['pm', 'lina'] },
];

const FRAMEWORK_OPTIONS: ComboboxOption[] = [
  { value: 'react', label: 'React', icon: <TextCursorInput className="h-4 w-4 text-primary" /> },
  { value: 'vue', label: 'Vue', icon: <TextCursorInput className="h-4 w-4 text-emerald-600" /> },
  { value: 'svelte', label: 'Svelte', icon: <TextCursorInput className="h-4 w-4 text-orange-500" /> },
  { value: 'angular', label: 'Angular', icon: <TextCursorInput className="h-4 w-4 text-red-500" /> },
];

const ASYNC_OPTIONS: ComboboxOption[] = [
  { value: 'tokyo', label: 'Tokyo, Japan', keywords: ['asia'] },
  { value: 'jakarta', label: 'Jakarta, Indonesia', keywords: ['asia'] },
  { value: 'singapore', label: 'Singapore', keywords: ['asia'] },
  { value: 'berlin', label: 'Berlin, Germany', keywords: ['europe'] },
  { value: 'london', label: 'London, UK', keywords: ['europe'] },
  { value: 'nyc', label: 'New York, USA', keywords: ['america'] },
  { value: 'sf', label: 'San Francisco, USA', keywords: ['america'] },
  { value: 'sydney', label: 'Sydney, Australia', keywords: ['oceania'] },
  { value: 'auckland', label: 'Auckland, NZ', keywords: ['oceania'] },
];

const FILTER_FIELDS: FilterFieldDefinition[] = [
  {
    id: 'status',
    label: 'Status',
    operators: ['eq', 'neq'],
    options: [
      { value: 'active', label: 'Active' },
      { value: 'archived', label: 'Archived' },
    ],
  },
  {
    id: 'priority',
    label: 'Priority',
    operators: ['eq', 'gte', 'lte'],
    options: [
      { value: 'high', label: 'High' },
      { value: 'medium', label: 'Medium' },
      { value: 'low', label: 'Low' },
    ],
  },
  { id: 'owner', label: 'Owner', operators: ['eq', 'contains'] },
];

export default function FormsPage() {
  const [submittedData, setSubmittedData] = React.useState<FormSchema | null>(null);
  const [selectedPlan, setSelectedPlan] = React.useState('pro');
  const [switchActive, setSwitchActive] = React.useState(true);
  const [checked, setChecked] = React.useState(true);
  const [uploadedFiles, setUploadedFiles] = React.useState<File[]>([]);

  const [member, setMember] = React.useState('');
  const [frameworks, setFrameworks] = React.useState<string[]>(['react']);
  const [city, setCity] = React.useState('');
  const [isCityLoading, setIsCityLoading] = React.useState(false);
  const [createdCities, setCreatedCities] = React.useState<string[]>([]);
  const [tags, setTags] = React.useState<string[]>(['Accessibility', 'React']);
  const [tagError, setTagError] = React.useState<string | null>(null);
  const [date, setDate] = React.useState<Date | null>(new Date(2026, 7, 20));
  const [range, setRange] = React.useState<{ from?: Date; to?: Date } | null>({
    from: new Date(2026, 7, 1),
    to: new Date(2026, 7, 20),
  });
  const [rangeError, setRangeError] = React.useState<string | null>(null);
  const [time, setTime] = React.useState('09:30');
  const [otp, setOtp] = React.useState('');

  const [filterChips, setFilterChips] = React.useState<FilterChip[]>([
    { id: 'fc-1', fieldId: 'status', operator: 'eq', value: 'active' },
  ]);
  const [savedFilterViews, setSavedFilterViews] = React.useState<SavedFilterView[]>([
    { id: 'fv-1', name: 'Active tasks', chips: [{ id: 'fc-1', fieldId: 'status', operator: 'eq', value: 'active' }] },
  ]);
  const [activeViewId, setActiveViewId] = React.useState<string | undefined>(undefined);

  const form = useForm<FormSchema>({
    defaultValues: {
      fullName: '',
      email: '',
      plan: 'pro',
      organization: '',
      notes: '',
    },
  });

  const onSubmit = (data: FormSchema) => {
    setSubmittedData(data);
  };

  const allCities = React.useMemo<ComboboxOption[]>(() => {
    const created = createdCities.map((c) => ({ value: c.toLowerCase(), label: c }));
    return [...ASYNC_OPTIONS, ...created];
  }, [createdCities]);

  const onCitySearch = React.useCallback((q: string) => {
    if (!q.trim()) {
      setIsCityLoading(false);
      return;
    }
    setIsCityLoading(true);
    const t = setTimeout(() => setIsCityLoading(false), 600);
    return () => clearTimeout(t);
  }, []);

  const handleCreateCity = React.useCallback(
    (label: string) => {
      setCreatedCities((prev) => [...prev, label]);
      setCity(label.toLowerCase());
    },
    []
  );

  const handleTagChange = (next: string[]) => {
    setTags(next);
    setTagError(next.length > 5 ? 'Maximum 5 tags allowed.' : null);
  };

  const handleSaveView = React.useCallback((name: string, chips: FilterChip[]) => {
    setSavedFilterViews((prev) => [...prev, { id: `view-${Date.now()}`, name, chips }]);
  }, []);

  const handleApplyView = React.useCallback((view: SavedFilterView) => {
    setActiveViewId(view.id);
  }, []);

  const handleDeleteView = React.useCallback(
    (id: string) => {
      setSavedFilterViews((prev) => prev.filter((v) => v.id !== id));
      if (activeViewId === id) setActiveViewId(undefined);
    },
    [activeViewId]
  );

  const handleUpdateView = React.useCallback((id: string, chips: FilterChip[]) => {
    setSavedFilterViews((prev) => prev.map((v) => (v.id === id ? { ...v, chips } : v)));
  }, []);

  return (
    <div className="space-y-12 animate-in fade-in-50 duration-200">
      <PageHeader
        eyebrow="Forms & Inputs"
        eyebrowIcon={Wand2}
        title="Forms"
        description="Type-safe, accessible form primitives and production-ready advanced inputs: field descriptors, error messaging, radio groups, combobox with async & creatable modes, tag input, date & range pickers, OTP, file uploads, and a filter builder — all keyboard accessible with dark mode parity."
        actions={
          <div className="flex items-center gap-2">
            <Badge variant="highlight" className="font-mono text-xs">
              React Hook Form
            </Badge>
            <Badge variant="outline" className="font-mono text-xs">
              WAI-ARIA aria-describedby
            </Badge>
          </div>
        }
      />

      {/* Quick Jump */}
      <div className="sticky top-16 z-10 -mx-6 md:-mx-10 px-6 md:px-10 py-2.5 bg-background/90 backdrop-blur-md">
        <div className="border-b border-border/80 pb-2">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar -mx-2 px-2">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider shrink-0 pl-1">
              Jump To:
            </span>
            {SECTION_IDS.map((sec) => (
              <a
                key={sec.id}
                href={`#${sec.id}`}
                className="rounded-full px-3 py-1 text-xs font-medium whitespace-nowrap bg-muted/60 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
              >
                {sec.label}
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* 1. Form Field System */}
      <section id="form-primitives" className="space-y-4 scroll-mt-20">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold text-foreground font-display flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-highlight" />
            <span>Form Field System</span>
          </h2>
          <p className="text-sm text-muted-foreground">
            Automatic coordination of `id`, `aria-describedby`, and `aria-invalid` between labels, inputs, descriptions, and validation messages.
          </p>
        </div>

        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-base">Interactive Registration Form</CardTitle>
            <CardDescription>
              Try submitting with empty fields to trigger accessible validation errors.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="fullName"
                    rules={{ required: 'Full name is required' }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. Alex Morgan" {...field} />
                        </FormControl>
                        <FormDescription>Your official name or handle.</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="email"
                    rules={{
                      required: 'Email address is required',
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: 'Invalid email address format',
                      },
                    }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Work Email</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="alex@company.com" {...field} />
                        </FormControl>
                        <FormDescription>We will send account confirmation here.</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="organization"
                  rules={{ required: 'Organization name is required' }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Organization Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Acme Global Inc." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Project Notes (Optional)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Tell us about your team size and use case..."
                          rows={3}
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>Max 500 characters.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" variant="highlight" className="gap-2">
                  <Send className="h-4 w-4" />
                  <span>Submit Application</span>
                </Button>
              </form>
            </Form>

            {submittedData && (
              <div className="p-4 rounded-xl border border-success/40 bg-success/10 space-y-2">
                <div className="flex items-center gap-2 text-success font-semibold text-xs font-mono">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Form Submitted Successfully</span>
                </div>
                <pre className="p-3 rounded-lg bg-card border border-border text-xs font-mono overflow-x-auto text-foreground">
                  {JSON.stringify(submittedData, null, 2)}
                </pre>
              </div>
            )}
          </CardContent>
        </Card>
      </section>

      {/* 2. RadioGroup Primitives */}
      <section id="radio-group" className="space-y-4 scroll-mt-20">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold text-foreground font-display flex items-center gap-2">
            <Layers className="h-6 w-6 text-highlight" />
            <span>RadioGroup Primitives</span>
          </h2>
          <p className="text-sm text-muted-foreground">
            Accessible single-choice selectors supporting card tiles, descriptions, and keyboard arrow selection.
          </p>
        </div>

        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-base">Card-Style Plan Selector</CardTitle>
            <CardDescription>
              Custom visual container with accessible Radix RadioGroupItem beneath.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <RadioGroup
              value={selectedPlan}
              onValueChange={setSelectedPlan}
              className="grid grid-cols-1 md:grid-cols-3 gap-4"
            >
              {[
                {
                  id: 'starter',
                  title: 'Starter',
                  price: '$29/mo',
                  desc: 'Up to 5 team members with standard OKLCH tokens.',
                },
                {
                  id: 'pro',
                  title: 'Professional',
                  price: '$79/mo',
                  desc: 'Unlimited seats, custom themes, and AI copilot.',
                },
                {
                  id: 'enterprise',
                  title: 'Enterprise',
                  price: 'Custom',
                  desc: 'Dedicated SCIM SSO, SLA guarantees, and multi-tenant DB.',
                },
              ].map((plan) => {
                const isChecked = selectedPlan === plan.id;
                return (
                  <label
                    key={plan.id}
                    htmlFor={`plan-${plan.id}`}
                    className={`relative flex flex-col justify-between p-4 rounded-xl border cursor-pointer transition-all shadow-xs ${
                      isChecked
                        ? 'border-highlight bg-highlight/5 ring-2 ring-highlight/20'
                        : 'border-border bg-card hover:bg-muted/30'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <span className="font-bold text-sm text-foreground font-display">
                          {plan.title}
                        </span>
                        <p className="text-xs text-muted-foreground">{plan.desc}</p>
                      </div>
                      <RadioGroupItem value={plan.id} id={`plan-${plan.id}`} />
                    </div>
                    <div className="mt-4 pt-3 border-t border-border/50 text-xs font-bold font-mono text-highlight">
                      {plan.price}
                    </div>
                  </label>
                );
              })}
            </RadioGroup>

            <div className="p-3 bg-muted/30 rounded-lg text-xs font-mono text-muted-foreground">
              Selected plan: <span className="text-highlight font-bold uppercase">{selectedPlan}</span>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* 3. Basic Form Controls */}
      <section id="forms" className="space-y-4 scroll-mt-20">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold text-foreground font-display flex items-center gap-2">
            <TextCursorInput className="h-6 w-6 text-highlight" />
            <span>Basic Form Controls</span>
          </h2>
          <p className="text-sm text-muted-foreground">
            Fundamental input controls: text input, error state, select menu, textarea, checkbox, and switch.
          </p>
        </div>

        <Card>
          <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="input-default">Standard Input</Label>
              <Input id="input-default" placeholder="Enter full name..." />
            </div>

            <div className="space-y-2">
              <Label htmlFor="input-error" className="text-destructive">
                Input with Error Validation
              </Label>
              <Input
                id="input-error"
                error
                defaultValue="invalid-email-format"
                placeholder="name@example.com"
              />
              <p className="text-xs text-destructive">Please enter a valid email address.</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="select-role">Select Menu</Label>
              <Select defaultValue="editor">
                <SelectTrigger id="select-role">
                  <SelectValue placeholder="Choose a role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Administrator</SelectItem>
                  <SelectItem value="editor">Content Editor</SelectItem>
                  <SelectItem value="viewer">Read-Only Viewer</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="textarea-desc">Textarea Field</Label>
              <Textarea id="textarea-desc" placeholder="Provide brief notes..." rows={3} />
            </div>

            <div className="flex items-center space-x-3">
              <Checkbox
                id="terms"
                checked={checked}
                onCheckedChange={(val) => setChecked(Boolean(val))}
              />
              <Label htmlFor="terms" className="cursor-pointer">
                Accept enterprise terms and privacy policy
              </Label>
            </div>

            <div className="flex items-center justify-between rounded-lg border border-border p-3">
              <div className="space-y-0.5">
                <Label htmlFor="notifs" className="text-sm cursor-pointer">
                  Push Notifications
                </Label>
                <p className="text-xs text-muted-foreground">
                  Receive alert emails for critical events
                </p>
              </div>
              <Switch
                id="notifs"
                checked={switchActive}
                onCheckedChange={setSwitchActive}
              />
            </div>
          </CardContent>
        </Card>
      </section>

      {/* 4. File Uploads */}
      <section id="file-uploads" className="space-y-4 scroll-mt-20">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold text-foreground font-display flex items-center gap-2">
            <Upload className="h-6 w-6 text-highlight" />
            <span>File Uploads</span>
          </h2>
          <p className="text-sm text-muted-foreground">
            Dropzone terpadu dengan drag & drop, file size validation, multiple file list dengan removal feedback.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Dropzone Variant</CardTitle>
              <CardDescription>Cocok untuk area upload utama dokumen.</CardDescription>
            </CardHeader>
            <CardContent>
              <FileInput
                value={uploadedFiles}
                onChange={setUploadedFiles}
                accept=".png,.jpg,.pdf"
                maxSize={5 * 1024 * 1024}
                helperText="PNG, JPG, PDF hingga 5MB"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Compact Variant</CardTitle>
              <CardDescription>Ringkas untuk modal atau form sempit.</CardDescription>
            </CardHeader>
            <CardContent>
              <FileInput
                variant="compact"
                accept=".csv,.xlsx"
                helperText="Upload data tabular CSV/Excel"
              />
            </CardContent>
          </Card>
        </div>
      </section>

      {/* 5. Form Sections & Error Summary */}
      <section id="form-sections" className="space-y-4 scroll-mt-20">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold text-foreground font-display flex items-center gap-2">
            <ShieldCheck className="h-6 w-6 text-highlight" />
            <span>Form Sections & Error Summary</span>
          </h2>
          <p className="text-sm text-muted-foreground">
            High-level layout wrappers for grouping related form fields and announcing multiple errors at the top of long forms.
          </p>
        </div>

        <Card>
          <CardContent className="p-6 space-y-6">
            <FormErrorSummary
              title="3 issues prevented saving your settings"
              errors={[
                'First name is required before continuing',
                'Work email domain must match enterprise SSO whitelist',
                'You must select at least one workspace role',
              ]}
            />

            <FormSection
              title="Security & Single Sign-On"
              description="Configure enterprise SAML 2.0 endpoints and identity providers."
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>IdP Metadata URL</Label>
                  <Input placeholder="https://auth.okta.com/app/sso" defaultValue="https://idp.acme.corp/saml" />
                </div>
                <div className="space-y-2">
                  <Label>Entity ID</Label>
                  <Input placeholder="urn:acme:sso" defaultValue="urn:apex:sp" />
                </div>
              </div>
            </FormSection>
          </CardContent>
        </Card>
      </section>

      {/* 6. Combobox / Autocomplete */}
      <section id="combobox" className="space-y-4 scroll-mt-20">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold text-foreground font-display flex items-center gap-2">
            <User className="h-6 w-6 text-highlight" />
            <span>Combobox / Autocomplete</span>
          </h2>
          <p className="text-sm text-muted-foreground">
            Search-as-you-type across label, description & keywords, plus multi select with chips, async loading, and creatable modes.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card className="border-border">
            <CardHeader className="space-y-1">
              <CardTitle className="text-base">Single Select with Search</CardTitle>
              <CardDescription>Search-as-you-type across label, description & keywords.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Combobox
                label="Assign owner"
                placeholder="Search members..."
                options={MEMBER_OPTIONS}
                value={member}
                onValueChange={(v) => setMember(v as string)}
              />
              {member && (
                <Badge variant="secondary" className="gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
                  Selected: {member}
                </Badge>
              )}
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardHeader className="space-y-1">
              <CardTitle className="text-base">Multi Select with Chips</CardTitle>
              <CardDescription>Toggle between options; selected items render as removable chips.</CardDescription>
            </CardHeader>
            <CardContent>
              <Combobox
                label="Frameworks"
                multiple
                options={FRAMEWORK_OPTIONS}
                value={frameworks}
                onValueChange={(v) => setFrameworks(v as string[])}
                placeholder="Select frameworks..."
              />
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardHeader className="space-y-1">
              <CardTitle className="text-base">Async + Loading State</CardTitle>
              <CardDescription>Simulated network search — debounced load indicator inside the list.</CardDescription>
            </CardHeader>
            <CardContent>
              <Combobox
                label="Search city"
                options={allCities}
                value={city}
                onValueChange={(v) => setCity(v as string)}
                onSearchChange={onCitySearch}
                loading={isCityLoading}
                placeholder="Type to search cities..."
                searchPlaceholder="Search cities..."
              />
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardHeader className="space-y-1">
              <CardTitle className="text-base">Creatable</CardTitle>
              <CardDescription>Create a new option on the fly when nothing matches.</CardDescription>
            </CardHeader>
            <CardContent>
              <Combobox
                label="Add new city"
                options={allCities}
                value={city}
                onValueChange={(v) => setCity(v as string)}
                onSearchChange={onCitySearch}
                loading={isCityLoading}
                creatable
                onCreate={handleCreateCity}
                placeholder="Search or create city..."
              />
            </CardContent>
          </Card>
        </div>
      </section>

      {/* 7. Tag Input */}
      <section id="tags" className="space-y-4 scroll-mt-20">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold text-foreground font-display flex items-center gap-2">
            <Tags className="h-6 w-6 text-highlight" />
            <span>Tag Input</span>
          </h2>
          <p className="text-sm text-muted-foreground">
            Free-form tag entry with Enter to add, Backspace to remove, paste support, and max-tag validation.
          </p>
        </div>

        <Card className="border-border">
          <CardHeader className="space-y-1">
            <CardTitle className="text-base">Free-form Tags</CardTitle>
            <CardDescription>
              Press Enter to add, Backspace to remove the last tag, or paste a comma-separated list. Max 5 tags.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <TagInput
              label="Skills & labels"
              value={tags}
              onChange={handleTagChange}
              maxTags={5}
              error={Boolean(tagError)}
              placeholder="Type a tag and press Enter..."
            />
            {tagError && <p className="text-xs font-medium text-destructive">{tagError}</p>}
            {Boolean(tagError) && (
              <FormErrorSummary errors={[tagError ?? '']} title="Tag input has an issue" />
            )}
          </CardContent>
        </Card>
      </section>

      {/* 8. Date & Range Pickers */}
      <section id="date" className="space-y-4 scroll-mt-20">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold text-foreground font-display flex items-center gap-2">
            <Calendar className="h-6 w-6 text-highlight" />
            <span>Date & Range Pickers</span>
          </h2>
          <p className="text-sm text-muted-foreground">
            Clearable calendars with Indonesian locale, presets, and range validation.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card className="border-border">
            <CardHeader className="space-y-1">
              <CardTitle className="text-base">Single Date</CardTitle>
              <CardDescription>Clearable calendar with Indonesian locale example.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <DatePicker
                label="Due date"
                value={date}
                onValueChange={setDate}
                locale={id}
                presets={[
                  { label: 'Today', from: new Date() },
                  { label: '+7d', from: new Date(Date.now() + 7 * 86400000) },
                ]}
              />
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardHeader className="space-y-1">
              <CardTitle className="text-base">Date Range</CardTitle>
              <CardDescription>Two-month view with range presets and apply button.</CardDescription>
            </CardHeader>
            <CardContent>
              <DateRangePicker
                label="Report period"
                value={range}
                onValueChange={(r) => {
                  if (r && r.from && r.to && r.from > r.to) {
                    setRangeError('Start date must be before end date.');
                  } else {
                    setRangeError(null);
                  }
                  setRange(r);
                }}
                locale={id}
                presets={[
                  { label: 'Today', from: new Date() },
                  { label: '7d', from: new Date(Date.now() - 7 * 86400000), to: new Date() },
                  { label: '30d', from: new Date(Date.now() - 30 * 86400000), to: new Date() },
                  { label: 'This month', from: new Date(2026, 7, 1), to: new Date(2026, 7, 31) },
                ]}
              />
              {rangeError && <p className="text-xs font-medium text-destructive">{rangeError}</p>}
            </CardContent>
          </Card>
        </div>
      </section>

      {/* 9. Time & OTP Inputs */}
      <section id="time" className="space-y-4 scroll-mt-20">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold text-foreground font-display flex items-center gap-2">
            <Clock className="h-6 w-6 text-highlight" />
            <span>Time & OTP Inputs</span>
          </h2>
          <p className="text-sm text-muted-foreground">
            Spin-button segmented time input with clamping, plus auto-advance OTP with paste support.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card className="border-border">
            <CardHeader className="space-y-1">
              <CardTitle className="text-base">Time Picker</CardTitle>
              <CardDescription>Spin-button segmented time input with min/max clamping.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <TimePicker
                label="Start time"
                value={time}
                onValueChange={setTime}
                format="24h"
                minTime="08:00"
                maxTime="18:00"
              />
              <p className="text-xs text-muted-foreground">Current value: {time}</p>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardHeader className="space-y-1">
              <CardTitle className="text-base">OTP Input</CardTitle>
              <CardDescription>Auto-advance, backspace-to-previous, paste support. Enter 6 digits.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <InputOTP
                label="2FA code"
                value={otp}
                onChange={setOtp}
                length={6}
              />
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Entered:</span>
                <code className="rounded bg-muted px-1.5 py-0.5 text-xs font-mono">
                  {otp || '—'}
                </code>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* 10. Filter Builder */}
      <section id="filter-builder" className="space-y-4 scroll-mt-20">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold text-foreground font-display flex items-center gap-2">
            <FilterIcon className="h-6 w-6 text-highlight" />
            <span>Filter Builder</span>
          </h2>
          <p className="text-sm text-muted-foreground">
            Build complex filter queries from field/operator/value rows, then save and reapply them as reusable views.
          </p>
        </div>

        <Card className="border-border">
          <CardHeader className="space-y-1">
            <CardTitle className="text-base">Query Builder with Saved Views</CardTitle>
            <CardDescription>
              Add filter chips, clear all, and persist named views via the dropdown menu.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FilterBuilder
              fields={FILTER_FIELDS}
              chips={filterChips}
              onChipsChange={setFilterChips}
              savedViews={savedFilterViews}
              onSaveView={handleSaveView}
              onApplyView={handleApplyView}
              onDeleteView={handleDeleteView}
              onUpdateView={handleUpdateView}
              activeViewId={activeViewId}
              maxChips={10}
              label="Task filters"
            />
            <div className="p-3 bg-muted/30 rounded-lg text-xs font-mono text-muted-foreground">
              Active chips: <span className="text-highlight font-bold">{filterChips.length}</span> ·{' '}
              Saved views: <span className="text-highlight font-bold">{savedFilterViews.length}</span>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}