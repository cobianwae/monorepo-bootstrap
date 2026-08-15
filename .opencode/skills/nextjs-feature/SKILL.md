---
name: nextjs-feature
description: Membuat fitur UI baru di Next.js App Router - page, component, API route, server actions
tags: [next, frontend, ui, react]
compatibility: [next, opencode, claude, cursor]
---

# Next.js Feature

## Kapan Pakai
Saat diminta membuat halaman, komponen UI, API route, server action, atau layout di frontend Next.js.

## Aturan Utama
1. **Server Components default**. Hanya gunakan `'use client'` saat benar-benar butuh: interactivity, event handlers, hooks (useState/useEffect), browser API.
2. **Tidak ada `useEffect` untuk data fetching**. Gunakan Server Component data fetching atau `useSWR`/`React Query` di client.
3. **Colocation**. Komponen private satu halaman tinggal di folder halaman tsb. Komponen reusable ke `components/ui/`.

## Struktur File

### Halaman
```
apps/web/src/app/(dashboard)/<route>/
  page.tsx            # Server component (default)
  loading.tsx         # Suspense fallback
  error.tsx           # Error boundary
  actions.ts          # Server actions (jika ada form mutation)
  <Component>.tsx     # Komponen private halaman ini
```

### Komponen Reusable
```
apps/web/src/components/ui/<component>/
  <component>.tsx
  <component>.test.tsx
  index.ts
```

### API Route
```
apps/web/src/app/api/<resource>/
  route.ts            # GET, POST handler
  [id]/
    route.ts          # GET, PATCH, DELETE by ID
```

## Pola Wajib

### Server Component Page
```tsx
import { Suspense } from 'react';
import { DashboardHeader } from './dashboard-header';
import { RecentOrders } from './recent-orders';
import { RecentOrdersSkeleton } from './recent-orders-skeleton';

export const metadata = {
  title: 'Dashboard - MyApp',
  description: 'Overview dashboard',
};

export default async function DashboardPage() {
  const stats = await getDashboardStats(); // direct DB/fetch call

  return (
    <main className="container mx-auto px-4 py-8">
      <DashboardHeader stats={stats} />
      <Suspense fallback={<RecentOrdersSkeleton />}>
        <RecentOrders />
      </Suspense>
    </main>
  );
}
```

### Client Component (hanya saat perlu)
```tsx
'use client';

import { useState } from 'react';
import { Button } from '@ds/ui';

interface Props {
  initialCount: number;
}

export function Counter({ initialCount }: Props) {
  const [count, setCount] = useState(initialCount);
  return <Button onClick={() => setCount(c => c + 1)}>Count: {count}</Button>;
}
```

### Server Action
```tsx
'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const schema = z.object({
  title: z.string().min(1).max(255),
});

export async function createItem(formData: FormData) {
  const parsed = schema.parse(Object.fromEntries(formData));
  // call API or direct DB
  revalidatePath('/items');
}
```

### API Route
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const querySchema = z.object({ page: z.coerce.number().min(1).default(1) });

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const { page } = querySchema.parse(Object.fromEntries(searchParams));
  // fetch data
  return NextResponse.json({ data: [], page, totalPages: 0 });
}
```

### Theming & Dark Mode Toggle (Client Component)
```tsx
'use client';

import { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';
import { Button } from '@ds/ui';

export function ThemeToggle() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem('theme') as 'light' | 'dark' | null;
    const preferDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initial = stored ?? (preferDark ? 'dark' : 'light');
    setTheme(initial);
    document.documentElement.classList.toggle('dark', initial === 'dark');
  }, []);

  const toggle = () => {
    const next = theme === 'light' ? 'dark' : 'light';
    setTheme(next);
    localStorage.setItem('theme', next);
    document.documentElement.classList.toggle('dark', next === 'dark');
  };

  if (!mounted) return <div className="h-9 w-9" />; // Hindari hydration mismatch

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggle}
      aria-label={`Ganti ke mode ${theme === 'light' ? 'gelap' : 'terang'}`}
    >
      {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
    </Button>
  );
}
```

## Checklist
1. [ ] Apakah ini bisa jadi Server Component? Jika ya, JANGAN tambah 'use client'
2. [ ] Komponen punya `interface Props` yang typed
3. [ ] Loading state dengan `loading.tsx` atau Suspense
4. [ ] Error boundary dengan `error.tsx` untuk halaman
5. [ ] Metadata export untuk SEO (page level)
6. [ ] Form mutations pakai Server Action atau API route + SWR mutation
7. [ ] Client components minimal (hanya yang butuh interactivity)
8. [ ] Tidak ada `useEffect` untuk data fetching

## Yang TIDAK BOLEH
- Tidak boleh `fetch` di client component tanpa cache/SWR strategy
- Tidak boleh `useEffect` untuk initial data loading
- Tidak boleh komponen tanpa Props interface (kecuali tanpa props)
- Tidak boleh hardcoded strings yang seharusnya i18n-ready
- Tidak boleh akses `process.env` langsung (pakai `@web/config/env`)