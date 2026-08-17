'use client';

import * as React from 'react';
import {
  Alert,
  AlertDescription,
  AlertTitle,
  Avatar,
  AvatarFallback,
  AvatarImage,
  Banner,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  EmptyState,
  ErrorPage,
  NotificationHeader,
  NotificationItem,
  NotificationList,
  PageHeader,
  Progress,
  Skeleton,
  Separator,
  Spinner,
  toast,
} from '@ds/ui';
import {
  Activity,
  AlertCircle,
  AlertTriangle,
  Bell,
  BellRing,
  Blocks,
  CheckCircle2,
  Gauge,
  Inbox,
  Info,
  Sparkles,
} from 'lucide-react';

export default function StatesFeedbackPage() {
  const [progress, setProgress] = React.useState(13);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setProgress((prev) => (prev >= 100 ? 0 : prev + 7));
    }, 600);
    return () => clearTimeout(timer);
  }, [progress]);

  return (
    <div className="space-y-12">
      <Banner variant="info" actionText="Jump to Progress" actionHref="#progress">
        <strong>States &amp; Feedback:</strong> Alerts, banners, notifications, spinners, skeletons, progress, empty states, dan error pages.
      </Banner>

      <PageHeader
        eyebrow="States & Feedback"
        eyebrowIcon={Activity}
        title="Loading, Empty, Alert & Error States"
        description="Pola umpan balik sistem untuk loading, kosong, sukses, peringatan, dan error. Setiap komponen mendukung screen reader announcements, focus management, dan reduced motion compliance."
      />

      {/* 1. Alerts & Banners */}
      <section id="alerts-banners" className="space-y-4 scroll-mt-20">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold text-foreground font-display flex items-center gap-2">
            <BellRing className="h-6 w-6 text-highlight" />
            <span>Alerts & Banners</span>
          </h2>
          <p className="text-sm text-muted-foreground">
            Alert inline dengan variant status (default, success, warning, destructive) dan Banner dismissible untuk announcement.
          </p>
        </div>

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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Dismissible Banners</CardTitle>
              <CardDescription className="text-xs">
                Announcement strip dengan local storage persistence.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Banner variant="primary" actionText="Get Started" actionHref="#empty-state">
                <strong>New:</strong> Design tokens v2 now available.
              </Banner>
              <Banner
                variant="warning"
                actionText="Upgrade Plan"
                actionHref="#empty-state"
                onActionClick={() =>
                  toast({
                    title: 'Upgrade Plan',
                    description: 'Menuju halaman pricing.',
                  })
                }
              >
                API usage at 85% — consider upgrading your plan.
              </Banner>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Info & Highlight</CardTitle>
              <CardDescription className="text-xs">
                Subtle info strip untuk announcement konten.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Banner variant="info">
                Scheduled maintenance window on Saturday 02:00–04:00 UTC.
              </Banner>
              <Banner
                variant="highlight"
                actionText="View Changelog"
                actionHref="#empty-state"
                onActionClick={() =>
                  toast({
                    variant: 'success',
                    title: 'Changelog',
                    description: 'Release v2.4.0 shipped with 12 improvements.',
                  })
                }
              >
                Release v2.4.0 shipped with 12 improvements.
              </Banner>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* 2. Notifications & Activity Feed */}
      <section id="notifications" className="space-y-4 scroll-mt-20">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold text-foreground font-display flex items-center gap-2">
            <Bell className="h-6 w-6 text-highlight" />
            <span>Notifications & Activity Feed</span>
          </h2>
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

      {/* 3. Spinners & Loading Indicators */}
      <section id="spinners" className="space-y-4 scroll-mt-20">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold text-foreground font-display flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-highlight" />
            <span>Spinners & Loading Indicators</span>
          </h2>
          <p className="text-sm text-muted-foreground">
            Accessible loading spinner dengan customizable sizes, status tokens, dan role=&quot;status&quot; screen reader announcements.
          </p>
        </div>

        <Card className="border-border">
          <CardContent className="p-6 space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl border border-border bg-muted/20 flex flex-col items-center justify-center gap-2">
                <Spinner size="sm" variant="default" />
                <span className="text-[11px] font-mono text-muted-foreground">size=&quot;sm&quot;</span>
              </div>
              <div className="p-4 rounded-xl border border-border bg-muted/20 flex flex-col items-center justify-center gap-2">
                <Spinner size="default" variant="primary" />
                <span className="text-[11px] font-mono text-muted-foreground">variant=&quot;primary&quot;</span>
              </div>
              <div className="p-4 rounded-xl border border-border bg-muted/20 flex flex-col items-center justify-center gap-2">
                <Spinner size="md" variant="success" />
                <span className="text-[11px] font-mono text-muted-foreground">variant=&quot;success&quot;</span>
              </div>
              <div className="p-4 rounded-xl border border-border bg-muted/20 flex flex-col items-center justify-center gap-2">
                <Spinner size="lg" variant="destructive" />
                <span className="text-[11px] font-mono text-muted-foreground">size=&quot;lg&quot; destructive</span>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 rounded-lg bg-card border border-border">
              <Button disabled variant="outline" className="gap-2 text-xs">
                <Spinner size="sm" />
                <span>Synchronizing Database...</span>
              </Button>
              <span className="text-xs text-muted-foreground">
                Button with embedded accessible spinner state.
              </span>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* 4. Skeleton Loading Placeholders */}
      <section id="skeletons" className="space-y-4 scroll-mt-20">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold text-foreground font-display flex items-center gap-2">
            <Blocks className="h-6 w-6 text-highlight" />
            <span>Skeleton Loading Placeholders</span>
          </h2>
          <p className="text-sm text-muted-foreground">
            Non-interactive placeholder blocks mirroring the exact shape of incoming content. Uses `animate-pulse` with the `muted` surface token, and respects `prefers-reduced-motion`.
          </p>
        </div>

        <Card className="border-border">
          <CardContent className="p-6 space-y-6">
            <div className="space-y-2">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Basic Shapes
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-4 rounded-xl border border-border bg-muted/20 flex flex-col justify-center gap-3">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-1/2" />
                  <span className="text-[11px] font-mono text-muted-foreground mt-1">text lines</span>
                </div>
                <div className="p-4 rounded-xl border border-border bg-muted/20 flex flex-col items-center justify-center gap-2">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <span className="text-[11px] font-mono text-muted-foreground">circle avatar</span>
                </div>
                <div className="p-4 rounded-xl border border-border bg-muted/20 flex flex-col justify-center gap-2">
                  <Skeleton className="h-24 w-full rounded-lg" />
                  <span className="text-[11px] font-mono text-muted-foreground mt-1">rectangle card</span>
                </div>
                <div className="p-4 rounded-xl border border-border bg-muted/20 flex flex-col justify-center gap-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                  <span className="text-[11px] font-mono text-muted-foreground mt-1">paragraph block</span>
                </div>
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Composite: Card & Table Rows
              </span>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="rounded-xl border border-border bg-card p-5 space-y-3 shadow-xs">
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-3 w-2/3" />
                      <Skeleton className="h-3 w-1/3" />
                    </div>
                  </div>
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-5/6" />
                  <div className="flex gap-2 pt-1">
                    <Skeleton className="h-8 w-24 rounded-md" />
                    <Skeleton className="h-8 w-24 rounded-md" />
                  </div>
                </div>

                <div className="rounded-xl border border-border bg-card p-4 space-y-3 shadow-xs">
                  <div className="flex items-center gap-3 pb-2 border-b border-border">
                    <Skeleton className="h-3 w-1/4" />
                    <Skeleton className="h-3 w-1/5" />
                    <Skeleton className="h-3 w-1/6 ml-auto" />
                  </div>
                  {[0, 1, 2].map((row) => (
                    <div key={row} className="flex items-center gap-3">
                      <Skeleton className="h-3 w-1/4" />
                      <Skeleton className="h-3 w-1/5" />
                      <Skeleton className="h-3 w-1/6 ml-auto" />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 rounded-lg bg-card border border-border">
              <Info className="h-4 w-4 text-highlight mt-0.5 shrink-0" />
              <p className="text-xs text-muted-foreground">
                Tandai kontainer konten dengan <code className="font-mono text-foreground">aria-busy=&quot;true&quot;</code> saat data dimuat, lalu hapus setelah render final. Skeleton wajib meniru posisi & dimensi konten asli (loading.tsx / Suspense fallback) dan otomatis berhenti beranimasi saat user mengaktifkan reduced motion.
              </p>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* 5. Progress */}
      <section id="progress" className="space-y-4 scroll-mt-20">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold text-foreground font-display flex items-center gap-2">
            <Gauge className="h-6 w-6 text-highlight" />
            <span>Progress</span>
          </h2>
          <p className="text-sm text-muted-foreground">
            Progress bar determinate berbasis Radix untuk status pengerjaan, upload, atau tugas berjangka.
          </p>
        </div>

        <Card className="border-border">
          <CardContent className="p-6 space-y-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-foreground">System Health Check</span>
                <span className="font-mono text-muted-foreground">45%</span>
              </div>
              <Progress value={45} aria-label="System health check progress" />
            </div>

            <Separator />

            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-foreground">Database Migration</span>
                <span className="font-mono text-muted-foreground">72%</span>
              </div>
              <Progress value={72} aria-label="Database migration progress" />
            </div>

            <Separator />

            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-foreground">Animated Simulation</span>
                <span className="font-mono text-muted-foreground">{progress}%</span>
              </div>
              <Progress value={progress} aria-label="Animated progress simulation" />
            </div>
          </CardContent>
        </Card>
      </section>

      {/* 6. Empty State */}
      <section id="empty-state" className="space-y-4 scroll-mt-20">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold text-foreground font-display flex items-center gap-2">
            <Inbox className="h-6 w-6 text-highlight" />
            <span>Empty State</span>
          </h2>
          <p className="text-sm text-muted-foreground">
            Placeholder konten kosong dengan ikon, judul, deskripsi, dan primary/secondary action.
          </p>
        </div>

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
      </section>

      {/* 7. Error Page */}
      <section id="error-page" className="space-y-4 scroll-mt-20">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold text-foreground font-display flex items-center gap-2">
            <AlertTriangle className="h-6 w-6 text-highlight" />
            <span>Error Page</span>
          </h2>
          <p className="text-sm text-muted-foreground">
            Error boundary UI dengan pesan error terformat, tombol reset, dan reload.
          </p>
        </div>

        <Card className="border-border">
          <CardContent className="p-6">
            <ErrorPage
              title="Gagal memuat dashboard"
              description="Terjadi kesalahan saat mengambil data analitik. Coba reset komponen atau muat ulang halaman."
              error={new Error('Failed to fetch /api/analytics — 500 Internal Server Error')}
              onReset={() =>
                toast({
                  title: 'Component Reset',
                  description: 'State error berhasil dibersihkan.',
                })
              }
              onReload={() =>
                toast({
                  variant: 'success',
                  title: 'Page Reloaded',
                  description: 'Permintaan data diulang.',
                })
              }
            />
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
