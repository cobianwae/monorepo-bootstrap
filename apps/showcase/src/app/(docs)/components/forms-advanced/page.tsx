'use client';

import * as React from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  Combobox,
  DatePicker,
  DateRangePicker,
  InputOTP,
  NumberInput,
  Slider,
  TagInput,
  TimePicker,
  Badge,
  FormSection,
  FormErrorSummary,
  Label,
  type ComboboxOption,
} from '@ds/ui';
import { id } from 'date-fns/locale';
import {
  Box,
  User,
  Tags,
  Calendar,
  Clock,
  Gauge,
  Keyboard,
  Wand2,
  CheckCircle2,
} from 'lucide-react';
import { PageHeader } from '@/components/page-header';

const SECTION_IDS = [
  { id: 'combobox', label: 'Combobox / Autocomplete' },
  { id: 'tags', label: 'Tag Input' },
  { id: 'date', label: 'Date & Range' },
  { id: 'time', label: 'Time & OTP' },
  { id: 'numeric', label: 'Numeric & Slider' },
  { id: 'field-api', label: 'Field API v2' },
];

const MEMBER_OPTIONS: ComboboxOption[] = [
  { value: 'sarah@acme.io', label: 'Sarah Connor', description: 'sarah@acme.io', keywords: ['admin', 'sarah'] },
  { value: 'john@acme.io', label: 'John Doe', description: 'john@acme.io', keywords: ['editor', 'john'] },
  { value: 'nina@acme.io', label: 'Nina Patel', description: 'nina@acme.io', keywords: ['designer', 'nina'] },
  { value: 'omar@acme.io', label: 'Omar Haddad', description: 'omar@acme.io', keywords: ['engineer', 'omar'] },
  { value: 'lina@acme.io', label: 'Lina Kim', description: 'lina@acme.io', keywords: ['pm', 'lina'] },
];

const FRAMEWORK_OPTIONS: ComboboxOption[] = [
  { value: 'react', label: 'React', icon: <Box className="h-4 w-4 text-primary" /> },
  { value: 'vue', label: 'Vue', icon: <Box className="h-4 w-4 text-emerald-600" /> },
  { value: 'svelte', label: 'Svelte', icon: <Box className="h-4 w-4 text-orange-500" /> },
  { value: 'angular', label: 'Angular', icon: <Box className="h-4 w-4 text-red-500" /> },
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

export default function AdvancedFormsPage() {
  const [member, setMember] = React.useState('');
  const [frameworks, setFrameworks] = React.useState<string[]>(['react']);
  const [city, setCity] = React.useState('');
  const [isCityLoading, setIsCityLoading] = React.useState(false);
  const [createdCities, setCreatedCities] = React.useState<string[]>([]);
  const [tags, setTags] = React.useState<string[]>(['Accessibility', 'React']);
  const [date, setDate] = React.useState<Date | null>(new Date(2026, 7, 20));
  const [range, setRange] = React.useState<{ from?: Date; to?: Date } | null>({
    from: new Date(2026, 7, 1),
    to: new Date(2026, 7, 20),
  });
  const [rangeError, setRangeError] = React.useState<string | null>(null);
  const [time, setTime] = React.useState('09:30');
  const [otp, setOtp] = React.useState('');
  const [quantity, setQuantity] = React.useState(3);
  const [price, setPrice] = React.useState(50);
  const [rangeSlider, setRangeSlider] = React.useState([20, 80]);
  const [tagError, setTagError] = React.useState<string | null>(null);

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

  const hasErrors = Boolean(tagError);

  return (
    <div className="space-y-10 animate-in fade-in-50 duration-200">
      <PageHeader
        eyebrow="UI Library"
        eyebrowIcon={Wand2}
        title="Advanced Form Kit"
        description="Production-ready advanced inputs: combobox/autocomplete with async & creatable modes, tag input, date & range pickers, OTP, numeric steppers, sliders, and the Field API v2 — all keyboard accessible with dark mode parity."
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

      {/* Combobox / Autocomplete */}
      <section id="combobox" className="space-y-4 scroll-mt-32">
        <div className="flex items-center gap-2">
          <User className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-bold text-foreground">Combobox / Autocomplete</h2>
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

      {/* Tag Input */}
      <section id="tags" className="space-y-4 scroll-mt-32">
        <div className="flex items-center gap-2">
          <Tags className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-bold text-foreground">Tag Input</h2>
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
            {hasErrors && (
              <FormErrorSummary errors={[tagError ?? '']} title="Tag input has an issue" />
            )}
          </CardContent>
        </Card>
      </section>

      {/* Date & Range */}
      <section id="date" className="space-y-4 scroll-mt-32">
        <div className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-bold text-foreground">Date & Range Pickers</h2>
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

      {/* Time & OTP */}
      <section id="time" className="space-y-4 scroll-mt-32">
        <div className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-bold text-foreground">Time & OTP Inputs</h2>
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

      {/* Numeric & Slider */}
      <section id="numeric" className="space-y-4 scroll-mt-32">
        <div className="flex items-center gap-2">
          <Gauge className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-bold text-foreground">Numeric & Sliders</h2>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card className="border-border">
            <CardHeader className="space-y-1">
              <CardTitle className="text-base">Number Input</CardTitle>
              <CardDescription>Stepper buttons, arrow-key support, min/max clamp.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <NumberInput
                label="Quantity"
                value={quantity}
                onValueChange={setQuantity}
                min={1}
                max={10}
                aria-label="Quantity"
              />
              <NumberInput
                label="Budget (IDR)"
                value={price}
                onValueChange={setPrice}
                min={0}
                max={100}
                step={5}
                prefix="Rp"
                suffix="/user"
                aria-label="Budget"
              />
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardHeader className="space-y-1">
              <CardTitle className="text-base">Slider</CardTitle>
              <CardDescription>Single and range (dual-thumb) variants.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Price: {price}%</Label>
                <Slider value={[price]} onValueChange={(v) => setPrice(v[0])} min={0} max={100} />
              </div>
              <div className="space-y-2">
                <Label>Range: {rangeSlider[0]} – {rangeSlider[1]}%</Label>
                <Slider value={rangeSlider} onValueChange={setRangeSlider} min={0} max={100} />
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Field API v2 */}
      <section id="field-api" className="space-y-4 scroll-mt-32">
        <div className="flex items-center gap-2">
          <Keyboard className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-bold text-foreground">Field API v2 — FormSection & ErrorSummary</h2>
        </div>

        <Card className="border-border">
          <CardContent className="p-6 space-y-4">
            <FormSection
              title="Project Configuration"
              description="Group related fields into visually distinct sections."
            >
              <div className="grid gap-4 md:grid-cols-2">
                <Combobox
                  label="Project lead"
                  options={MEMBER_OPTIONS}
                  value={member}
                  onValueChange={(v) => setMember(v as string)}
                  placeholder="Pick lead..."
                />
                <DatePicker
                  label="Kickoff date"
                  value={date}
                  onValueChange={setDate}
                />
              </div>
            </FormSection>
            <FormSection
              title="Audience"
              description="Tags are validated to a maximum of five."
            >
              <TagInput
                value={tags}
                onChange={handleTagChange}
                maxTags={5}
                error={Boolean(tagError)}
                placeholder="Add audience tags..."
              />
              {tagError && <p className="text-xs font-medium text-destructive">{tagError}</p>}
            </FormSection>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}