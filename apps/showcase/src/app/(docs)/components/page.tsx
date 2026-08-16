'use client';

import * as React from 'react';
import {
  Button,
  Badge,
  Input,
  Textarea,
  Label,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  Alert,
  AlertTitle,
  AlertDescription,
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  Checkbox,
  Switch,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
  Separator,
  EmptyState,
  StatCard,
  toast,
  // Enhanced & New Components
  Avatar,
  AvatarImage,
  AvatarFallback,
  AvatarGroup,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
  Toggle,
  Kbd,
  Rating,
  CodeBlock,
  FileInput,
  NotificationItem,
  NotificationHeader,
  NotificationList,
} from '@ds/ui';
import {
  AlertCircle,
  CheckCircle2,
  Info,
  AlertTriangle,
  Mail,
  Plus,
  Inbox,
  Users,
  Box,
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Sparkles,
  Zap,
  Layers,
} from 'lucide-react';
import { PageHeader } from '@/components/page-header';

const COMPONENT_SECTIONS = [
  { id: 'buttons', label: 'Buttons & Actions' },
  { id: 'cards', label: 'Card Variants' },
  { id: 'avatars', label: 'Avatars & Groups' },
  { id: 'tabs', label: 'Tabs & Navigation' },
  { id: 'accordions', label: 'Accordions & Disclosure' },
  { id: 'ratings', label: 'Rating & Feedback' },
  { id: 'file-uploads', label: 'File Uploads' },
  { id: 'code-blocks', label: 'Code Blocks' },
  { id: 'notifications', label: 'Notifications' },
  { id: 'badges', label: 'Badges & Status' },
  { id: 'forms', label: 'Form Controls' },
  { id: 'overlays', label: 'Modals & Overlays' },
  { id: 'alerts', label: 'Alerts & Feedback' },
  { id: 'composite', label: 'Composite Primitives' },
];

export default function ComponentsPage() {
  const [switchActive, setSwitchActive] = React.useState(true);
  const [checked, setChecked] = React.useState(true);
  const [activeSection, setActiveSection] = React.useState('buttons');
  const [selectedCard, setSelectedCard] = React.useState('card-1');
  const [ratingVal, setRatingVal] = React.useState(4);
  const [uploadedFiles, setUploadedFiles] = React.useState<File[]>([]);

  return (
    <TooltipProvider>
      <div className="space-y-12 animate-in fade-in-50 duration-200">
        <PageHeader
          eyebrow="UI Library"
          eyebrowIcon={Box}
          title="Core UI Components Catalog"
          description="Accessible, composable UI primitives powered by Radix UI, class-variance-authority, and Tailwind CSS v4. Every component supports full keyboard interaction, focus rings, and dark mode parity."
        />

        {/* Sticky Quick-Jump Anchor Nav Bar */}
        <div className="sticky top-16 z-10 -mx-6 md:-mx-10 px-6 md:px-10 py-2.5 bg-background/90 backdrop-blur-md">
          <div className="border-b border-border/80 pb-2">
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar -mx-2 px-2">
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider shrink-0 pl-1">
                Jump To:
              </span>
              {COMPONENT_SECTIONS.map((sec) => (
                <a
                  key={sec.id}
                  href={`#${sec.id}`}
                  onClick={() => setActiveSection(sec.id)}
                  className={`rounded-full px-3 py-1 text-xs font-medium whitespace-nowrap transition-colors ${
                    activeSection === sec.id
                      ? 'bg-primary text-primary-foreground shadow-xs'
                      : 'bg-muted/60 text-muted-foreground hover:bg-accent hover:text-foreground'
                  }`}
                >
                  {sec.label}
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* 1. Buttons Section */}
        <section id="buttons" className="space-y-4 scroll-mt-32">
          <h2 className="text-lg font-bold text-foreground">Buttons & Actions</h2>
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
                  Standalone Toggles & Keyboard Shortcuts (Kbd)
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

        {/* 2. Cards & Variants Section */}
        <section id="cards" className="space-y-4 scroll-mt-32">
          <div className="space-y-1">
            <h2 className="text-lg font-bold text-foreground">Card Variants & Interactive States</h2>
            <p className="text-sm text-muted-foreground">
              Varian card untuk konteks hierarki konten berbeda: Default, Interactive (hover), Selectable, Glassmorphism, Gradient, and Flat.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Default Card */}
            <Card variant="default">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Layers className="h-4 w-4 text-primary" />
                  Default Card
                </CardTitle>
                <CardDescription>Standar container berbingkai border token.</CardDescription>
              </CardHeader>
              <CardContent className="text-xs text-muted-foreground">
                Cocok untuk form section, setting panels, dan modular dashboard widgets.
              </CardContent>
            </Card>

            {/* Interactive Card */}
            <Card variant="interactive" onClick={() => toast({ title: 'Interactive Card Clicked' })}>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Zap className="h-4 w-4 text-highlight" />
                  Interactive Card
                </CardTitle>
                <CardDescription>Hover elevation & slight translation.</CardDescription>
              </CardHeader>
              <CardContent className="text-xs text-muted-foreground">
                Klik kartu ini untuk melihat feedback active state yang tactile.
              </CardContent>
            </Card>

            {/* Glass Card */}
            <Card variant="glass">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  Glassmorphism Card
                </CardTitle>
                <CardDescription>Backdrop blur dengan translucent background.</CardDescription>
              </CardHeader>
              <CardContent className="text-xs text-muted-foreground">
                Sangat estetik untuk floating widgets, hero showcases, dan stats.
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            {/* Selectable Cards (Radio Card Pattern) */}
            <Card
              variant="selectable"
              selected={selectedCard === 'card-1'}
              onClick={() => setSelectedCard('card-1')}
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Standard Plan</CardTitle>
                  <Badge variant={selectedCard === 'card-1' ? 'default' : 'outline'}>
                    {selectedCard === 'card-1' ? 'Selected' : 'Select'}
                  </Badge>
                </div>
                <CardDescription>$29 / bulan · Akses 5 pengguna</CardDescription>
              </CardHeader>
            </Card>

            <Card
              variant="selectable"
              selected={selectedCard === 'card-2'}
              onClick={() => setSelectedCard('card-2')}
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2">
                    Enterprise Pro
                    <Badge variant="highlight">Popular</Badge>
                  </CardTitle>
                  <Badge variant={selectedCard === 'card-2' ? 'default' : 'outline'}>
                    {selectedCard === 'card-2' ? 'Selected' : 'Select'}
                  </Badge>
                </div>
                <CardDescription>$99 / bulan · Unlimited seat & dedicated support</CardDescription>
              </CardHeader>
            </Card>
          </div>
        </section>

        {/* 3. Avatars & Avatar Groups */}
        <section id="avatars" className="space-y-4 scroll-mt-32">
          <div className="space-y-1">
            <h2 className="text-lg font-bold text-foreground">Avatars & Avatar Groups</h2>
            <p className="text-sm text-muted-foreground">
              Support 5 ukuran (xs, sm, default, lg, xl), live status indicators (online, away, busy, offline), dan overlapping AvatarGroup.
            </p>
          </div>

          <Card className="border-border">
            <CardContent className="p-6 space-y-6">
              {/* Sizes & Status Dots */}
              <div className="space-y-2">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Sizes & Presence Indicators
                </span>
                <div className="flex flex-wrap items-center gap-6">
                  <Avatar size="xs" status="online">
                    <AvatarFallback>XS</AvatarFallback>
                  </Avatar>
                  <Avatar size="sm" status="online">
                    <AvatarFallback>SM</AvatarFallback>
                  </Avatar>
                  <Avatar size="default" status="away">
                    <AvatarFallback>DF</AvatarFallback>
                  </Avatar>
                  <Avatar size="lg" status="busy">
                    <AvatarFallback>LG</AvatarFallback>
                  </Avatar>
                  <Avatar size="xl" status="online">
                    <AvatarImage src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150" alt="Sarah" />
                    <AvatarFallback>XL</AvatarFallback>
                  </Avatar>
                </div>
              </div>

              <Separator />

              {/* Overlap Group Stack */}
              <div className="space-y-2">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Avatar Group (with Overflow Counter)
                </span>
                <div className="flex items-center gap-6">
                  <AvatarGroup max={4} size="default">
                    <Avatar><AvatarFallback className="bg-primary/20 text-primary">AR</AvatarFallback></Avatar>
                    <Avatar><AvatarFallback className="bg-success/20 text-success">BK</AvatarFallback></Avatar>
                    <Avatar><AvatarFallback className="bg-warning/20 text-warning">CL</AvatarFallback></Avatar>
                    <Avatar><AvatarFallback className="bg-destructive/20 text-destructive">DT</AvatarFallback></Avatar>
                    <Avatar><AvatarFallback>EM</AvatarFallback></Avatar>
                    <Avatar><AvatarFallback>FN</AvatarFallback></Avatar>
                  </AvatarGroup>

                  <span className="text-xs text-muted-foreground">
                    6 team members · 4 shown + 2 excess
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* 4. Tabs & Navigation Variants */}
        <section id="tabs" className="space-y-4 scroll-mt-32">
          <div className="space-y-1">
            <h2 className="text-lg font-bold text-foreground">Tabs Navigation Variants</h2>
            <p className="text-sm text-muted-foreground">
              3 Varian visual: Default (pills dalam muted container), Underline (clean minimalist line), dan Enclosed (segmented border).
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Default Pills Variant */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Default (Pills)</CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="overview" variant="default">
                  <TabsList className="w-full">
                    <TabsTrigger value="overview" className="flex-1">Overview</TabsTrigger>
                    <TabsTrigger value="analytics" className="flex-1">Analytics</TabsTrigger>
                  </TabsList>
                  <TabsContent value="overview" className="text-xs text-muted-foreground p-2">
                    Ringkasan performa sistem secara umum.
                  </TabsContent>
                  <TabsContent value="analytics" className="text-xs text-muted-foreground p-2">
                    Metrik detail dan conversion funnel.
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            {/* Underline Variant */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Underline</CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="account" variant="underline">
                  <TabsList>
                    <TabsTrigger value="account">Account</TabsTrigger>
                    <TabsTrigger value="security">Security</TabsTrigger>
                    <TabsTrigger value="billing">Billing</TabsTrigger>
                  </TabsList>
                  <TabsContent value="account" className="text-xs text-muted-foreground pt-2">
                    Kelola profil publik dan avatar.
                  </TabsContent>
                  <TabsContent value="security" className="text-xs text-muted-foreground pt-2">
                    Pengaturan MFA dan session devices.
                  </TabsContent>
                  <TabsContent value="billing" className="text-xs text-muted-foreground pt-2">
                    Invoice riwayat dan kartu kredit.
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            {/* Enclosed Variant */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Enclosed (Boxed)</CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="day" variant="enclosed">
                  <TabsList className="w-full">
                    <TabsTrigger value="day" className="flex-1">1 Day</TabsTrigger>
                    <TabsTrigger value="week" className="flex-1">1 Week</TabsTrigger>
                    <TabsTrigger value="month" className="flex-1">1 Month</TabsTrigger>
                  </TabsList>
                  <TabsContent value="day" className="text-xs text-muted-foreground p-2">
                    24-hour breakdown timeline.
                  </TabsContent>
                  <TabsContent value="week" className="text-xs text-muted-foreground p-2">
                    7-day aggregated trends.
                  </TabsContent>
                  <TabsContent value="month" className="text-xs text-muted-foreground p-2">
                    30-day billing volume.
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* 5. Accordions & Disclosure */}
        <section id="accordions" className="space-y-4 scroll-mt-32">
          <div className="space-y-1">
            <h2 className="text-lg font-bold text-foreground">Accordions & Collapsible Sections</h2>
            <p className="text-sm text-muted-foreground">
              Pola FAQ dan collapsible filters dengan smooth height animation dan full keyboard a11y.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Separated Card Style Accordion */}
            <div className="space-y-2">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Separated Variant (Card Style)
              </span>
              <Accordion type="single" collapsible defaultValue="faq-1" variant="separated">
                <AccordionItem value="faq-1">
                  <AccordionTrigger className="px-4">
                    Bagaimana cara mengaktifkan Dark Mode?
                  </AccordionTrigger>
                  <AccordionContent className="px-4">
                    Design system mendukung OKLCH color tokens dengan parity light & dark mode otomatis via kelas CSS `.dark` atau data attribute `theme`.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="faq-2">
                  <AccordionTrigger className="px-4">
                    Apakah mendukung keyboard navigation?
                  </AccordionTrigger>
                  <AccordionContent className="px-4">
                    Ya, semua komponen interaktif dibangun di atas Radix UI primitives yang memenuhi standar WCAG 2.1 AA (Tab, Space, Enter, Arrow keys).
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>

            {/* Bordered Flush Accordion */}
            <div className="space-y-2">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Bordered Variant (Flush)
              </span>
              <Accordion type="single" collapsible variant="bordered">
                <AccordionItem value="item-1">
                  <AccordionTrigger>
                    Integrasi dengan Tailwind CSS v4
                  </AccordionTrigger>
                  <AccordionContent>
                    Menggunakan direct `@theme` directives di tokens.css tanpa overhead runtime konversi warna.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-2">
                  <AccordionTrigger>
                    Testing Strategy & Vitest
                  </AccordionTrigger>
                  <AccordionContent>
                    Unit tests berjalan dengan Vitest + React Testing Library dengan coverage penuh untuk state & event handling.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </div>
        </section>

        {/* 6. Ratings & Feedback */}
        <section id="ratings" className="space-y-4 scroll-mt-32">
          <div className="space-y-1">
            <h2 className="text-lg font-bold text-foreground">Rating & Star Feedback</h2>
            <p className="text-sm text-muted-foreground">
              Komponen review interaktif dengan hover preview, precision half-star, keyboard navigation, dan read-only display mode.
            </p>
          </div>

          <Card className="border-border">
            <CardContent className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
              <div className="space-y-2">
                <Label>Interactive Rating (Click or Hover)</Label>
                <div className="flex items-center gap-3 pt-1">
                  <Rating
                    value={ratingVal}
                    onChange={setRatingVal}
                    size="lg"
                    showValueText
                  />
                </div>
                <p className="text-xs text-muted-foreground">Nilai terpilih: {ratingVal} dari 5 bintang</p>
              </div>

              <div className="space-y-2">
                <Label>Half-star Precision (0.5)</Label>
                <div className="pt-1">
                  <Rating
                    defaultValue={4.5}
                    allowHalf
                    size="default"
                    showValueText
                  />
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

        {/* 7. File Uploads */}
        <section id="file-uploads" className="space-y-4 scroll-mt-32">
          <div className="space-y-1">
            <h2 className="text-lg font-bold text-foreground">File Upload Inputs</h2>
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

        {/* 8. Code Blocks */}
        <section id="code-blocks" className="space-y-4 scroll-mt-32">
          <div className="space-y-1">
            <h2 className="text-lg font-bold text-foreground">Code Blocks & Snippets</h2>
            <p className="text-sm text-muted-foreground">
              Container syntax dengan copy-to-clipboard, file badge label, dan collapsible option.
            </p>
          </div>

          <div className="space-y-4">
            <CodeBlock
              filename="button.tsx"
              language="tsx"
              showLineNumbers
              code={`import { Button } from '@ds/ui';

export function ActionExample() {
  return (
    <Button variant="highlight" size="lg" onClick={() => console.log('Action triggered')}>
      Launch Project
    </Button>
  );
}`}
            />
          </div>
        </section>

        {/* 9. Notifications */}
        <section id="notifications" className="space-y-4 scroll-mt-32">
          <div className="space-y-1">
            <h2 className="text-lg font-bold text-foreground">Notifications & Activity Feed</h2>
            <p className="text-sm text-muted-foreground">
              Pola feed notifikasi dengan unread indicator dot, timestamp, tindakan langsung, dan dismissal.
            </p>
          </div>

          <Card className="border-border">
            <CardContent className="p-6 space-y-4">
              <NotificationHeader
                unreadCount={2}
                onMarkAllAsRead={() => toast({ title: 'Semua notifikasi ditandai dibaca' })}
              />

              <NotificationList>
                <NotificationItem
                  title="Deployment Berhasil"
                  description="Aplikasi versi v1.8.0 telah aktif di cluster produksi tanpa kendala."
                  timestamp="2 menit lalu"
                  type="success"
                  read={false}
                  onRead={() => toast({ title: 'Notifikasi dibaca' })}
                  onDismiss={() => toast({ title: 'Notifikasi dihapus' })}
                />

                <NotificationItem
                  title="Permintaan Kolaborasi Baru"
                  description="Sarah Jenkins mengundang Anda ke workspace 'Design System v2'."
                  timestamp="1 jam lalu"
                  avatar={
                    <Avatar size="sm">
                      <AvatarImage src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100" />
                      <AvatarFallback>SJ</AvatarFallback>
                    </Avatar>
                  }
                  read={false}
                  actions={
                    <>
                      <Button size="sm" variant="default" className="h-7 text-xs">
                        Terima
                      </Button>
                      <Button size="sm" variant="outline" className="h-7 text-xs">
                        Tolak
                      </Button>
                    </>
                  }
                  onDismiss={() => toast({ title: 'Notifikasi dihapus' })}
                />

                <NotificationItem
                  title="Tagihan Bulanan Tersedia"
                  description="Invoice #INV-2026-08 untuk paket Enterprise telah dibuat."
                  timestamp="Kemarin"
                  type="info"
                  read={true}
                  onDismiss={() => toast({ title: 'Notifikasi dihapus' })}
                />
              </NotificationList>
            </CardContent>
          </Card>
        </section>

        {/* 10. Badges Section */}
        <section id="badges" className="space-y-4 scroll-mt-32">
          <h2 className="text-lg font-bold text-foreground">Badges & Status Indicators</h2>
          <Card className="border-border">
            <CardContent className="p-6">
              <div className="flex flex-wrap items-center gap-3">
                <Badge variant="default">Default</Badge>
                <Badge variant="secondary">Secondary</Badge>
                <Badge variant="outline">Outline</Badge>
                <Badge variant="highlight">Highlight</Badge>
                <Badge variant="highlight-outline">Highlight Outline</Badge>
                <Badge variant="success">Active / Success</Badge>
                <Badge variant="warning">Pending / Warning</Badge>
                <Badge variant="destructive">Failed / Error</Badge>
                <Badge variant="info">Info Notice</Badge>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* 11. Form Controls Section */}
        <section id="forms" className="space-y-4 scroll-mt-32">
          <h2 className="text-lg font-bold text-foreground">Form Controls & Inputs</h2>
          <Card className="border-border">
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

        {/* 12. Overlays & Dialogs */}
        <section id="overlays" className="space-y-4 scroll-mt-32">
          <h2 className="text-lg font-bold text-foreground">Modals, Sheets & Tooltips</h2>
          <Card className="border-border">
            <CardContent className="p-6 flex flex-wrap items-center gap-4">
              {/* Dialog Modal */}
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline">Open Dialog Modal</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Confirm Workspace Deletion</DialogTitle>
                    <DialogDescription>
                      This action cannot be undone. All active projects and API keys will be immediately revoked.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <DialogClose asChild>
                      <Button variant="outline">Cancel</Button>
                    </DialogClose>
                    <DialogClose asChild>
                      <Button
                        variant="destructive"
                        onClick={() =>
                          toast({
                            variant: 'destructive',
                            title: 'Workspace Deleted',
                            description: 'All assets and credentials were permanently revoked.',
                          })
                        }
                      >
                        Delete Workspace
                      </Button>
                    </DialogClose>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              {/* Slide-out Sheet Drawer */}
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline">Open Side Sheet Drawer</Button>
                </SheetTrigger>
                <SheetContent side="right">
                  <SheetHeader>
                    <SheetTitle>User Preferences</SheetTitle>
                    <SheetDescription>
                      Manage notification preferences and security keys.
                    </SheetDescription>
                  </SheetHeader>
                  <div className="py-6 space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="pref-name">Display Name</Label>
                      <Input id="pref-name" defaultValue="Alex Rivers" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="pref-email">Email</Label>
                      <Input id="pref-email" defaultValue="alex@company.com" disabled />
                    </div>
                  </div>
                </SheetContent>
              </Sheet>

              {/* Tooltip */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="secondary">Hover for Tooltip</Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Keyboard accessible hint (Escape to dismiss)</p>
                </TooltipContent>
              </Tooltip>
            </CardContent>
          </Card>
        </section>

        {/* 13. Feedback Alerts */}
        <section id="alerts" className="space-y-4 scroll-mt-32">
          <h2 className="text-lg font-bold text-foreground">Alerts & Banners</h2>
          <div className="space-y-3">
            <Alert variant="default">
              <Info className="h-4 w-4" />
              <AlertTitle>Information Notice</AlertTitle>
              <AlertDescription>
                System maintenance scheduled for Sunday at 02:00 UTC.
              </AlertDescription>
            </Alert>

            <Alert variant="success">
              <CheckCircle2 className="h-4 w-4" />
              <AlertTitle>Deployment Completed</AlertTitle>
              <AlertDescription>
                Production cluster has updated to release v2.4.0 without downtime.
              </AlertDescription>
            </Alert>

            <Alert variant="warning">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>API Rate Limit Approaching</AlertTitle>
              <AlertDescription>
                You have consumed 85% of your allocated monthly API requests.
              </AlertDescription>
            </Alert>

            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Authentication Error</AlertTitle>
              <AlertDescription>
                Invalid security signature provided. Please re-authenticate your session.
              </AlertDescription>
            </Alert>
          </div>
        </section>

        {/* 14. Custom Craft Components: Empty State & Stat Card */}
        <section id="composite" className="space-y-4 scroll-mt-32">
          <h2 className="text-lg font-bold text-foreground">High-Craft Composite Components</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Stat Card */}
            <StatCard
              title="Total Active Members"
              value="12,840"
              delta={{ value: '+14.2%', trend: 'up', label: 'vs previous quarter' }}
              icon={Users}
            />

            {/* Empty State */}
            <EmptyState
              icon={Inbox}
              title="No Pending Requests"
              description="You have cleared all pending review requests. Great job!"
              actionLabel="Create New Request"
              onAction={() =>
                toast({
                  variant: 'success',
                  title: 'Request Created',
                  description: 'New review ticket has been dispatched.',
                })
              }
            />
          </div>
        </section>
      </div>
    </TooltipProvider>
  );
}
