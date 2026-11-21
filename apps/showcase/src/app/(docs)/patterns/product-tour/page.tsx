'use client';

import * as React from 'react';
import {
  PageHeader,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Button,
  Badge,
  Progress,
  EmptyState,
  Banner,
} from '@ds/ui';
import { Tour, type TourStep, type TourStepStatus } from '@ds/ui';
import { Compass, MousePointerClick, RotateCcw, Copy, Check } from 'lucide-react';

const RESEP = `const [open, setOpen] = useState(false);
<Tour steps={STEPS} open={open}
  onFinish={(s) => {
    localStorage.setItem('tour-done',
      JSON.stringify(s));
    setOpen(false);
  }}
  onSkip={(s, at) => {
    localStorage.setItem('tour-skip',
      JSON.stringify({ at, s }));
    setOpen(false);
  }} />`;

type DemoVariant = 'penuh' | 'tiga-hilang' | 'semua-hilang' | 'kosong' | 'loading';

const VARIANT_LABEL: Record<DemoVariant, string> = {
  penuh: '5 langkah valid',
  'tiga-hilang': 'Langkah 3 hilang',
  'semua-hilang': 'Semua hilang (error)',
  kosong: 'Kosong (empty)',
  loading: 'Pemicu loading singkat',
};

function clickDriver(selector: string) {
  const el = document.querySelector<HTMLElement>(selector);
  el?.click();
}

export default function ProductTourPatternPage() {
  const mulaiRef = React.useRef<HTMLButtonElement>(null);

  const [open, setOpen] = React.useState(false);
  const [variant, setVariant] = React.useState<DemoVariant>('penuh');
  const [sembunyiTiga, setSembunyiTiga] = React.useState(true);
  const [loadingDemo, setLoadingDemo] = React.useState(false);
  const [indeks, setIndeks] = React.useState(0);
  const [status, setStatus] = React.useState<TourStepStatus[]>([]);
  const [hasil, setHasil] = React.useState<string | null>(null);
  const [disalin, setDisalin] = React.useState(false);

  const hilangTiga = variant === 'tiga-hilang' || (variant === 'penuh' && sembunyiTiga);
  const semuaHilang = variant === 'semua-hilang';
  const kosong = variant === 'kosong';

  const steps: TourStep[] = React.useMemo(() => {
    if (kosong) return [];
    const dasar: Array<Omit<TourStep, 'target'>> = [
      { id: 'buat', title: 'Buat proyek', content: 'Mulai dari tombol Buat Proyek di bar aksi contoh ini.' },
      { id: 'cari', title: 'Cari tugas', content: 'Filter daftar tugas contoh tanpa membuka halaman lain.' },
      { id: 'filter', title: 'Filter status', content: 'Saring kartu contoh berdasarkan status aktif.' },
      { id: 'metrik', title: 'Pantau metrik', content: 'Lihat ringkasan angka contoh sebelum lanjut.' },
      { id: 'tabel', title: 'Kelola tabel', content: 'Kelola baris contoh; langkah terakhir tur ini.' },
    ];
    return dasar.map((s) => ({
      ...s,
      target: semuaHilang ? `#tak-ada-${s.id}` : `[data-tour-target="${s.id}"]`,
    }));
  }, [kosong, semuaHilang]);

  const mulaiTur = React.useCallback(() => {
    if (steps.length === 0) return;
    if (variant === 'loading') {
      setLoadingDemo(true);
      window.setTimeout(() => {
        setLoadingDemo(false);
        setHasil(null);
        setStatus([]);
        setOpen(true);
      }, 400);
      return;
    }
    setHasil(null);
    setStatus([]);
    setOpen(true);
    requestAnimationFrame(() => mulaiRef.current?.focus({ preventScroll: true }));
  }, [steps.length, variant]);

  const salinResep = React.useCallback(async () => {
    try {
      await navigator.clipboard.writeText(RESEP);
      setDisalin(true);
      window.setTimeout(() => setDisalin(false), 1500);
    } catch {
      setDisalin(false);
    }
  }, []);


  return (
    <div className="flex flex-col gap-6 p-6">
      <PageHeader
        eyebrow="Pola · S-005.20"
        eyebrowIcon={Compass}
        title="Product Tour — tur 5 langkah (S-005.20)"
        description="Dashboard contoh di bawah adalah area target tur (bukan data produksi). Jalankan skenario 6 langkah, coba semua state demo, lalu audit keyboard dan kontras light & dark via theme toggle."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline">driver.js</Badge>
            <Badge variant="outline">5 langkah</Badge>
          </div>
        }
      />

      <ol className="flex flex-col gap-1 rounded-xl border border-border bg-card p-4 text-sm text-muted-foreground">
        <li>1. Klik Mulai tur — spotlight membuka langkah 1 dari 5.</li>
        <li>2. Lanjut sampai langkah 3 disembunyikan (dilewati + pemberitahuan).</li>
        <li>3. Lanjut ke langkah 5 lalu Selesai (onFinish, fokus kembali ke Mulai tur).</li>
        <li>4. Ulangi, lalu tekan Esc di langkah 3.</li>
        <li>5. Dialog konfirmasi Lewati tur? muncul (progres &gt; 1) — pilih Ya, lewati.</li>
        <li>6. Fokus kembali ke Mulai tur tanpa error.</li>
      </ol>

      <div className="flex flex-wrap items-center gap-2">
        <Button ref={mulaiRef} type="button" onClick={mulaiTur} data-testid="tour-start">
          <MousePointerClick className="h-4 w-4" />
          Mulai tur
        </Button>
        <Button type="button" variant="outline" onClick={() => clickDriver('.driver-popover-next-btn')} data-testid="tour-next">
          Lanjut (demo)
        </Button>
        <Button type="button" variant="outline" onClick={() => clickDriver('.driver-popover-prev-btn')} data-testid="tour-back">
          Kembali (demo)
        </Button>
        <Button type="button" variant="ghost" onClick={() => clickDriver('.driver-popover-close-btn')} data-testid="tour-skip">
          Lewati (demo)
        </Button>
      </div>

      <Card className="border-border">
        <CardHeader>
          <CardTitle>Dashboard contoh — area target tur</CardTitle>
          <CardDescription>Contoh statis untuk sorotan tur; bukan data produksi.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <div data-tour-target="buat" className="rounded-lg border border-border bg-muted/20 px-4 py-3 text-sm font-medium">
              [Buat Proyek] (langkah 1)
            </div>
            <div data-tour-target="cari" className="rounded-lg border border-border bg-muted/20 px-4 py-3 text-sm font-medium">
              [Cari tugas] (langkah 2)
            </div>
            {!hilangTiga && !semuaHilang && (
              <div data-tour-target="filter" className="rounded-lg border border-border bg-muted/20 px-4 py-3 text-sm font-medium">
                [Filter status] (langkah 3)
              </div>
            )}
          </div>
          {!semuaHilang ? (
            <>
              <div data-tour-target="metrik" className="grid grid-cols-3 gap-2">
                {['Aktif 12', 'Selesai 48', 'Arsip 7'].map((m) => (
                  <div key={m} className="rounded-lg border border-border bg-card px-3 py-4 text-center text-sm font-semibold">
                    {m} <span className="block text-xs font-normal text-muted-foreground">(langkah 4)</span>
                  </div>
                ))}
              </div>
              <div data-tour-target="tabel" className="rounded-lg border border-border">
                {['Tugas A — aktif', 'Tugas B — selesai', 'Tugas C — aktif'].map((r) => (
                  <div key={r} className="border-b border-border px-3 py-2 text-sm last:border-0">
                    {r}
                  </div>
                ))}
                <p className="px-3 py-2 text-xs text-muted-foreground">Tabel mini contoh (langkah 5).</p>
              </div>
            </>
          ) : (
            <p className="rounded-lg border border-destructive/40 bg-destructive/5 px-3 py-4 text-sm">Semua target contoh disembunyikan untuk varian error.</p>
          )}
        </CardContent>
      </Card>

      <div data-testid="tour-popover">
        <Tour
          steps={steps}
          open={open}
          onStepChange={(i) => setIndeks(i)}
          onFinish={(s) => {
            setStatus(s);
            setHasil('Tur selesai — status per langkah tersimpan via onFinish.');
            setOpen(false);
            requestAnimationFrame(() => mulaiRef.current?.focus({ preventScroll: true }));
          }}
          onSkip={(s, at) => {
            setStatus(s);
            setHasil(`Tur dilewati pada langkah ${at + 1} — status per langkah tersimpan via onSkip.`);
            setOpen(false);
            requestAnimationFrame(() => mulaiRef.current?.focus({ preventScroll: true }));
          }}
        />
      </div>

      <Card className="border-border">
        <CardHeader>
          <CardTitle>Panel demo — semua state (§3)</CardTitle>
          <CardDescription>Toggle tanpa reload; tiap state teramati di showcase.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2" role="group" aria-label="Varian demo">
            {(Object.keys(VARIANT_LABEL) as DemoVariant[]).map((v) => (
              <Button
                key={v}
                type="button"
                variant={variant === v ? 'default' : 'outline'}
                size="sm"
                aria-pressed={variant === v}
                onClick={() => {
                  setVariant(v);
                  setOpen(false);
                }}
              >
                {VARIANT_LABEL[v]}
              </Button>
            ))}
          </div>
          <label className="flex cursor-pointer items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={sembunyiTiga}
              onChange={(e) => setSembunyiTiga(e.target.checked)}
              className="h-4 w-4 accent-[var(--primary)]"
            />
            Sembunyikan langkah 3 (tanpa reload)
          </label>
          {loadingDemo && <Banner variant="info">Memuat langkah… (aria-busy, kontrol disabled singkat)</Banner>}
          {kosong && (
            <div role="status" className="rounded-lg border border-border px-3 py-2 text-sm">
              Belum ada langkah tur — tombol Mulai tur disabled bila steps kosong.
            </div>
          )}
          <div className="space-y-1" data-testid="tour-progress">
            <p className="text-sm font-medium">
              {steps.length === 0 ? 'Langkah 0 dari 0' : `Langkah ${Math.min(indeks + 1, steps.length)} dari ${steps.length}`}
            </p>
            <Progress value={steps.length === 0 ? 0 : ((Math.min(indeks + 1, steps.length)) / steps.length) * 100} className="h-1.5" />
          </div>
          {hasil && (
            <p role="status" data-testid="tour-confirm" className="rounded-lg border border-border bg-muted/20 px-3 py-2 text-sm">
              {hasil}
            </p>
          )}
          {status.length > 0 && (
            <ul className="space-y-1 text-xs text-muted-foreground">
              {status.map((s) => (
                <li key={s.id} className="font-mono">
                  {s.id} #{s.index + 1} — {s.result}
                </li>
              ))}
            </ul>
          )}
          {(status.some((s) => s.result === 'skipped-missing') || hilangTiga) && (
            <p className="rounded-lg border border-warning/40 bg-warning/10 px-3 py-2 text-sm">
              Langkah 3 dilewati: target tidak ditemukan — teks, bukan warna saja.
            </p>
          )}
          {semuaHilang && (
            <div role="alert" className="rounded-lg border border-destructive/40 bg-destructive/5 px-3 py-2 text-sm">
              Semua target tidak ditemukan — 5 dari 5 target hilang.
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border-border">
        <CardHeader>
          <CardTitle>Resep onFinish / onSkip (15 baris)</CardTitle>
          <CardDescription>Konsumen menyalin pola persistence milik sendiri; komponen tanpa storage internal.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <pre className="overflow-x-auto rounded-lg bg-muted p-3 font-mono text-xs">{RESEP}</pre>
          <Button type="button" variant="outline" size="sm" onClick={salinResep} className="gap-1.5">
            {disalin ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
            {disalin ? 'Tersalin' : 'Salin resep'}
          </Button>
        </CardContent>
      </Card>

      <Card className="border-border">
        <CardHeader>
          <CardTitle>Keyboard, SR &amp; motion</CardTitle>
          <CardDescription>Order fokus: pemicu → popover → dialog → pemicu. Reduced-motion instan.</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
            <li>Tab cycling di footer popover; Enter mengaktifkan tombol fokus.</li>
            <li>Esc masuk alur lewati (dialog hanya bila progres &gt; 1, langsung bila langkah 1).</li>
            <li>Tiap langkah diumumkan + teks progress; error selalu teks + role alert/status.</li>
            <li>Fokus ring primary 2px offset 2; semua tombol ≥ 44px.</li>
            <li>Uji dengan prefers-reduced-motion: spotlight + scroll instan.</li>
          </ul>
          <Button type="button" variant="outline" size="sm" className="mt-3 gap-1.5" onClick={() => setOpen(false)}>
            <RotateCcw className="h-3.5 w-3.5" />
            Tutup tur &amp; kembalikan fokus
          </Button>
          {status.length === 0 && !hasil && (
            <div className="mt-3">
              <EmptyState
                icon={Compass}
                title="Belum ada hasil tur"
                description="Jalankan tur untuk melihat status per langkah di sini."
                actionLabel="Mulai tur"
                onAction={mulaiTur}
              />
            </div>
          )}
        </CardContent>
      </Card>

      <style>{`@media (max-width: 767px) {
        .ds-tour-popover.driver-popover { max-width: calc(100vw - 32px); }
        .ds-tour-popover .driver-popover-footer { display: flex; flex-direction: column; gap: 8px; }
      }`}</style>
    </div>
  );
}
