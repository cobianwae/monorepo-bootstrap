'use client';

import * as React from 'react';
import {
  Badge,
  Banner,
  Button,
  Card,
  CardContent,
  Checkbox,
  InputOTP,
  Kbd,
  Label,
  NumberInput,
  PageHeader,
  RadioGroup,
  RadioGroupItem,
  Rating,
  SearchInput,
  SegmentedControl,
  SegmentedControlItem,
  Separator,
  Slider,
  Switch,
  Toggle,
} from '@ds/ui';
import {
  BadgeCheck,
  Bold,
  Check,
  Hash,
  Italic,
  KeyRound,
  LayoutGrid,
  ListChecks,
  ListOrdered,
  Mail,
  MousePointerClick,
  Plus,
  Search,
  SlidersHorizontal,
  Star,
  ToggleRight,
  Underline as UnderlineIcon,
} from 'lucide-react';

export default function ActionsInputsPage() {
  const [switchActive, setSwitchActive] = React.useState(true);
  const [checked, setChecked] = React.useState(true);
  const [ratingVal, setRatingVal] = React.useState(4);
  const [boldActive, setBoldActive] = React.useState(false);
  const [italicActive, setItalicActive] = React.useState(false);
  const [underlineActive, setUnderlineActive] = React.useState(false);
  const [segment, setSegment] = React.useState('day');
  const [sliderVal, setSliderVal] = React.useState(40);
  const [qty, setQty] = React.useState(3);
  const [price, setPrice] = React.useState(49.5);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [otpValue, setOtpValue] = React.useState('');

  return (
    <div className="space-y-12">
      <Banner variant="highlight" actionText="Jump to OTP" actionHref="#otp-input">
        <strong>Actions &amp; Inputs:</strong> Buttons, badges, ratings, toggles, switches, radio groups, sliders, segmented controls, and selection-style inputs.
      </Banner>

      <PageHeader
        eyebrow="Actions & Inputs"
        eyebrowIcon={MousePointerClick}
        title="Actions, Selection & Input Controls"
        description="Interactive action triggers and lightweight selection inputs: buttons, badges, ratings, toggles, switches, checkboxes, radio groups, sliders, segmented controls, steppers, search, and OTP entry. Semua berbasis Radix UI dengan dukungan penuh keyboard navigation, focus ring, dan dark mode parity."
      />

      {/* 1. Buttons & Actions */}
      <section id="buttons" className="space-y-4 scroll-mt-20">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold text-foreground font-display flex items-center gap-2">
            <MousePointerClick className="h-6 w-6 text-highlight" />
            <span>Buttons & Actions</span>
          </h2>
          <p className="text-sm text-muted-foreground">
            Action trigger dengan variant status, ukuran, ikon, tombol toggle, dan keyboard shortcut (Kbd).
          </p>
        </div>

        <Card className="border-border">
          <CardContent className="p-6 space-y-6">
            <div className="space-y-2">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Variants
              </span>
              <div className="flex flex-wrap items-center gap-3">
                <Button variant="default">Primary</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="ghost">Ghost</Button>
                <Button variant="link">Link</Button>
                <Button variant="destructive">Destructive</Button>
                <Button variant="success">Success</Button>
                <Button variant="highlight">Highlight</Button>
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Sizes & Icons
              </span>
              <div className="flex flex-wrap items-center gap-3">
                <Button size="sm">Small (sm)</Button>
                <Button size="default">Default</Button>
                <Button size="lg">Large (lg)</Button>
                <Button size="default" className="gap-2">
                  <Mail className="h-4 w-4" />
                  With Icon
                </Button>
                <Button size="icon" variant="outline">
                  <Plus className="h-4 w-4" />
                </Button>
                <Button disabled>Disabled</Button>
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Toggle Buttons & Keyboard Shortcuts
              </span>
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-1 rounded-lg border border-border p-1 bg-card">
                  <Toggle aria-label="Toggle bold" size="sm">
                    <Bold className="h-4 w-4" />
                  </Toggle>
                  <Toggle aria-label="Toggle italic" size="sm">
                    <Italic className="h-4 w-4" />
                  </Toggle>
                  <Toggle aria-label="Toggle underline" size="sm">
                    <UnderlineIcon className="h-4 w-4" />
                  </Toggle>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">Shortcuts:</span>
                  <Kbd size="sm">⌘K</Kbd>
                  <Kbd size="sm">Ctrl+S</Kbd>
                  <Kbd size="default">Esc</Kbd>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* 2. Badges & Status */}
      <section id="badges" className="space-y-4 scroll-mt-20">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold text-foreground font-display flex items-center gap-2">
            <BadgeCheck className="h-6 w-6 text-highlight" />
            <span>Badges & Status</span>
          </h2>
          <p className="text-sm text-muted-foreground">
            Label status kecil dengan variant filled, outline, dan semantic token untuk success, warning, destructive, serta info.
          </p>
        </div>

        <Card className="border-border">
          <CardContent className="p-6">
            <div className="flex flex-wrap items-center gap-3">
              <Badge variant="default">Default</Badge>
              <Badge variant="secondary">Secondary</Badge>
              <Badge variant="outline">Outline</Badge>
              <Badge variant="highlight">Highlight</Badge>
              <Badge variant="highlight-outline">Highlight Outline</Badge>
              <Badge variant="success">Active / Success</Badge>
              <Badge variant="success-outline">Success Outline</Badge>
              <Badge variant="warning">Pending / Warning</Badge>
              <Badge variant="warning-outline">Warning Outline</Badge>
              <Badge variant="destructive">Failed / Error</Badge>
              <Badge variant="destructive-outline">Destructive Outline</Badge>
              <Badge variant="info">Info Notice</Badge>
              <Badge variant="info-outline">Info Outline</Badge>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* 3. Rating & Star Feedback */}
      <section id="ratings" className="space-y-4 scroll-mt-20">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold text-foreground font-display flex items-center gap-2">
            <Star className="h-6 w-6 text-highlight" />
            <span>Rating & Star Feedback</span>
          </h2>
          <p className="text-sm text-muted-foreground">
            Komponen review interaktif dengan hover preview, precision half-star, keyboard navigation, dan read-only display mode.
          </p>
        </div>

        <Card className="border-border">
          <CardContent className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            <div className="space-y-2">
              <Label>Interactive Rating (Click or Hover)</Label>
              <div className="flex items-center gap-3 pt-1">
                <Rating value={ratingVal} onChange={setRatingVal} size="lg" showValueText />
              </div>
              <p className="text-xs text-muted-foreground">Nilai terpilih: {ratingVal} dari 5 bintang</p>
            </div>

            <div className="space-y-2">
              <Label>Half-star Precision (0.5)</Label>
              <div className="pt-1">
                <Rating defaultValue={4.5} allowHalf size="default" showValueText />
              </div>
              <p className="text-xs text-muted-foreground">Support nilai desimal akurat</p>
            </div>

            <div className="space-y-2">
              <Label>Read-Only Score Badge</Label>
              <div className="pt-1 flex items-center gap-2">
                <Rating defaultValue={5} readOnly size="sm" />
                <span className="text-xs font-semibold text-foreground">5.0 (1,240 ulasan)</span>
              </div>
              <p className="text-xs text-muted-foreground">Cocok untuk card produk & profil</p>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* 4. Toggle & Toggle Group */}
      <section id="toggles" className="space-y-4 scroll-mt-20">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold text-foreground font-display flex items-center gap-2">
            <ToggleRight className="h-6 w-6 text-highlight" />
            <span>Toggle & Toggle Group</span>
          </h2>
          <p className="text-sm text-muted-foreground">
            Tombol toggle terisolasi dengan variant outline/ghost, ukuran, dan status pressed yang dapat dikontrol. Untuk grup eksklusif gunakan SegmentedControl (berbasis Radix ToggleGroup).
          </p>
        </div>

        <Card className="border-border">
          <CardContent className="p-6 space-y-6">
            <div className="space-y-2">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Controlled Single Toggle
              </span>
              <div className="flex items-center gap-3">
                <Toggle
                  pressed={boldActive}
                  onPressedChange={setBoldActive}
                  variant="outline"
                  aria-label="Toggle bold"
                >
                  <Bold className="h-4 w-4" />
                </Toggle>
                <span className="text-xs text-muted-foreground">
                  {boldActive ? 'Bold enabled' : 'Bold disabled'}
                </span>
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Variants & Sizes
              </span>
              <div className="flex flex-wrap items-center gap-3">
                <Toggle variant="default" aria-label="Default variant">
                  <Check className="h-4 w-4" />
                </Toggle>
                <Toggle variant="outline" aria-label="Outline variant">
                  <Check className="h-4 w-4" />
                </Toggle>
                <Toggle variant="ghost" aria-label="Ghost variant">
                  <Check className="h-4 w-4" />
                </Toggle>
                <Toggle size="sm" aria-label="Small size">
                  <Check className="h-4 w-4" />
                </Toggle>
                <Toggle size="default" aria-label="Default size">
                  <Check className="h-4 w-4" />
                </Toggle>
                <Toggle size="lg" aria-label="Large size">
                  <Check className="h-4 w-4" />
                </Toggle>
                <Toggle disabled aria-label="Disabled">
                  <Check className="h-4 w-4" />
                </Toggle>
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Formatting Toolbar (Multiple Toggles)
              </span>
              <div className="flex items-center gap-1 rounded-lg border border-border p-1 bg-card w-fit">
                <Toggle
                  pressed={boldActive}
                  onPressedChange={setBoldActive}
                  aria-label="Toggle bold"
                  size="sm"
                >
                  <Bold className="h-4 w-4" />
                </Toggle>
                <Toggle
                  pressed={italicActive}
                  onPressedChange={setItalicActive}
                  aria-label="Toggle italic"
                  size="sm"
                >
                  <Italic className="h-4 w-4" />
                </Toggle>
                <Toggle
                  pressed={underlineActive}
                  onPressedChange={setUnderlineActive}
                  aria-label="Toggle underline"
                  size="sm"
                >
                  <UnderlineIcon className="h-4 w-4" />
                </Toggle>
              </div>
              <p className="text-xs text-muted-foreground">
                Belum ada export ToggleGroup terpisah, jadi toolbar disusun dari beberapa Toggle independen.
              </p>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* 5. Switch & Checkbox */}
      <section id="switch-checkbox" className="space-y-4 scroll-mt-20">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold text-foreground font-display flex items-center gap-2">
            <ListChecks className="h-6 w-6 text-highlight" />
            <span>Switch & Checkbox</span>
          </h2>
          <p className="text-sm text-muted-foreground">
            Switch untuk preferensi on/off dan Checkbox untuk multi-seleksi dalam daftar opsi.
          </p>
        </div>

        <Card className="border-border">
          <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Switch Toggles
              </span>
              <div className="space-y-3">
                <div className="flex items-center justify-between rounded-lg border border-border p-3">
                  <div className="space-y-0.5">
                    <Label htmlFor="notifs" className="text-sm cursor-pointer">
                      Push Notifications
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Receive alert emails for critical events
                    </p>
                  </div>
                  <Switch id="notifs" checked={switchActive} onCheckedChange={setSwitchActive} />
                </div>
                <div className="flex items-center justify-between rounded-lg border border-border p-3">
                  <div className="space-y-0.5">
                    <Label htmlFor="weekly-digest" className="text-sm cursor-pointer">
                      Weekly Digest
                    </Label>
                    <p className="text-xs text-muted-foreground">Summary of last week activity</p>
                  </div>
                  <Switch id="weekly-digest" defaultChecked />
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Checkbox Options
              </span>
              <div className="space-y-2">
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
                <div className="flex items-center space-x-3">
                  <Checkbox id="newsletter" defaultChecked />
                  <Label htmlFor="newsletter" className="cursor-pointer">
                    Subscribe to product newsletter
                  </Label>
                </div>
                <div className="flex items-center space-x-3">
                  <Checkbox id="disabled-checkbox" disabled />
                  <Label
                    htmlFor="disabled-checkbox"
                    className="cursor-pointer text-muted-foreground"
                  >
                    Disabled option
                  </Label>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* 6. Radio Group */}
      <section id="radio-group" className="space-y-4 scroll-mt-20">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold text-foreground font-display flex items-center gap-2">
            <ListOrdered className="h-6 w-6 text-highlight" />
            <span>Radio Group</span>
          </h2>
          <p className="text-sm text-muted-foreground">
            Seleksi tunggal eksklusif dalam daftar vertikal dengan keyboard arrow navigation.
          </p>
        </div>

        <Card className="border-border">
          <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Layout Preference
              </span>
              <RadioGroup defaultValue="comfortable">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="compact" id="layout-compact" />
                  <Label htmlFor="layout-compact">Compact density</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="comfortable" id="layout-comfortable" />
                  <Label htmlFor="layout-comfortable">Comfortable density</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="spacious" id="layout-spacious" />
                  <Label htmlFor="layout-spacious">Spacious density</Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-3">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Payment Method
              </span>
              <RadioGroup defaultValue="card">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="card" id="pay-card" />
                  <Label htmlFor="pay-card">Credit / Debit Card</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="bank" id="pay-bank" />
                  <Label htmlFor="pay-bank">Bank Transfer</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="wallet" id="pay-wallet" />
                  <Label htmlFor="pay-wallet">E-Wallet</Label>
                </div>
              </RadioGroup>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* 7. Slider */}
      <section id="slider" className="space-y-4 scroll-mt-20">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold text-foreground font-display flex items-center gap-2">
            <SlidersHorizontal className="h-6 w-6 text-highlight" />
            <span>Slider</span>
          </h2>
          <p className="text-sm text-muted-foreground">
            Slider single value dan range berbasis Radix dengan keyboard arrow support dan touch-friendly thumb.
          </p>
        </div>

        <Card className="border-border">
          <CardContent className="p-6 space-y-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="volume-slider" className="text-sm">
                  Volume Control
                </Label>
                <span className="text-xs font-mono text-muted-foreground">{sliderVal}%</span>
              </div>
              <Slider
                id="volume-slider"
                value={[sliderVal]}
                onValueChange={(value) => setSliderVal(value[0])}
                min={0}
                max={100}
                step={1}
                aria-label="Volume"
              />
            </div>

            <Separator />

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Price Range
                </span>
                <span className="text-xs font-mono text-muted-foreground">$20 — $60</span>
              </div>
              <Slider defaultValue={[20, 60]} min={0} max={100} step={1} aria-label="Price range" />
            </div>
          </CardContent>
        </Card>
      </section>

      {/* 8. Segmented Control */}
      <section id="segmented-control" className="space-y-4 scroll-mt-20">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold text-foreground font-display flex items-center gap-2">
            <LayoutGrid className="h-6 w-6 text-highlight" />
            <span>Segmented Control</span>
          </h2>
          <p className="text-sm text-muted-foreground">
            Kontrol grup eksklusif berbasis Radix ToggleGroup untuk mode tampilan, durasi, atau scope.
          </p>
        </div>

        <Card className="border-border">
          <CardContent className="p-6 space-y-6">
            <div className="space-y-2">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Controlled (Single Select)
              </span>
              <SegmentedControl
                type="single"
                value={segment}
                onValueChange={(value) => setSegment(value)}
              >
                <SegmentedControlItem value="day">1 Day</SegmentedControlItem>
                <SegmentedControlItem value="week">1 Week</SegmentedControlItem>
                <SegmentedControlItem value="month">1 Month</SegmentedControlItem>
              </SegmentedControl>
              <p className="text-xs text-muted-foreground">
                Aktif: <span className="font-mono text-foreground">{segment}</span>
              </p>
            </div>

            <Separator />

            <div className="space-y-2">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Multiple Select
              </span>
              <SegmentedControl type="multiple" defaultValue={['table', 'cards']}>
                <SegmentedControlItem value="table">Table</SegmentedControlItem>
                <SegmentedControlItem value="cards">Cards</SegmentedControlItem>
                <SegmentedControlItem value="split">Split</SegmentedControlItem>
              </SegmentedControl>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* 9. Number Input */}
      <section id="number-input" className="space-y-4 scroll-mt-20">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold text-foreground font-display flex items-center gap-2">
            <Hash className="h-6 w-6 text-highlight" />
            <span>Number Input</span>
          </h2>
          <p className="text-sm text-muted-foreground">
            Stepper input numerik dengan tombol increment/decrement, keyboard arrow, clamping, prefix & suffix.
          </p>
        </div>

        <Card className="border-border">
          <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <NumberInput
                id="qty-input"
                label="Quantity"
                value={qty}
                onValueChange={setQty}
                min={1}
                max={99}
                step={1}
              />
              <p className="text-xs text-muted-foreground">Nilai terpilih: {qty}</p>
            </div>

            <div className="space-y-2">
              <NumberInput
                id="price-input"
                label="Unit Price"
                value={price}
                onValueChange={setPrice}
                min={0}
                step={0.5}
                prefix="$"
                suffix="USD"
              />
              <p className="text-xs text-muted-foreground">
                Total: <span className="font-mono text-foreground">${(qty * price).toFixed(2)}</span>
              </p>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* 10. Search Input */}
      <section id="search-input" className="space-y-4 scroll-mt-20">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold text-foreground font-display flex items-center gap-2">
            <Search className="h-6 w-6 text-highlight" />
            <span>Search Input</span>
          </h2>
          <p className="text-sm text-muted-foreground">
            Input pencarian dengan ikon, clear button, dan shortcut Kbd; tersedia 3 ukuran.
          </p>
        </div>

        <Card className="border-border">
          <CardContent className="p-6 space-y-6">
            <div className="space-y-2">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Controlled
              </span>
              <SearchInput
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search components..."
              />
              <p className="text-xs text-muted-foreground">
                Query: <span className="font-mono text-foreground">{searchQuery || '—'}</span>
              </p>
            </div>

            <Separator />

            <div className="space-y-2">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Sizes & Custom Shortcut
              </span>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <SearchInput sizeVariant="lg" placeholder="Search large..." shortcut="/" />
                <SearchInput sizeVariant="sm" placeholder="Search small..." shortcut="⌘K" />
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* 11. OTP Input */}
      <section id="otp-input" className="space-y-4 scroll-mt-20">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold text-foreground font-display flex items-center gap-2">
            <KeyRound className="h-6 w-6 text-highlight" />
            <span>OTP Input</span>
          </h2>
          <p className="text-sm text-muted-foreground">
            Input kode verifikasi 6 digit dengan auto-focus berpindah, backspace navigation, dan paste support.
          </p>
        </div>

        <Card className="border-border">
          <CardContent className="p-6 space-y-4">
            <InputOTP
              value={otpValue}
              onChange={setOtpValue}
              length={6}
              label="Two-factor authentication code"
            />
            <div className="flex items-center gap-2">
              {otpValue.length === 6 ? (
                <Badge variant="success">Code Verified</Badge>
              ) : (
                <span className="text-xs text-muted-foreground">
                  Masukkan kode 6 digit untuk verifikasi
                </span>
              )}
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
