---
name: testing
description: Strategi dan pola testing untuk NestJS backend dan Next.js frontend dengan Vitest + Testing Library
tags: [test, vitest, jest, testing-library, spec]
compatibility: [vitest, opencode, claude, cursor]
---

# Testing Strategy

## Kapan Pakai
Saat diminta menulis test, menambah coverage, membuat test stub, atau setup testing infrastructure.

## Stack
- **Runner**: Vitest (config di `vitest.config.ts` per app)
- **Backend**: Vitest + Supertest (API integration)
- **Frontend**: Vitest + Testing Library + jsdom
- **Mocking**: `vitest` built-in (`vi.mock`, `vi.fn`)

## Konvensi

### Nama File
- Unit test: `<filename>.spec.ts` (satu file dengan source)
- Integration test: `<resource>.e2e-spec.ts` (di folder `test/`)
- Component test: `<component>.test.tsx`

### Struktur Test
```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('FooService', () => {
  let service: FooService;
  let prisma: DeepMockProxy<PrismaClient>;

  beforeEach(() => {
    prisma = mockDeep<PrismaClient>();
    service = new FooService(prisma as any);
  });

  describe('create', () => {
    it('should create and return a foo', async () => {
      const dto: CreateFooDto = { name: 'Test' };
      prisma.foo.create.mockResolvedValue({ id: '1', ...dto, createdAt: new Date() });

      const result = await service.create(dto);

      expect(result.name).toBe('Test');
      expect(prisma.foo.create).toHaveBeenCalledWith({ data: dto });
    });

    it('should throw NotFoundException when prisma rejects', async () => {
      prisma.foo.create.mockRejectedValue(new Error('Not found'));

      await expect(service.create({ name: 'X' })).rejects.toThrow();
    });
  });
});
```

### API Integration Test (NestJS)
```typescript
import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { AppModule } from '@app/app.module';
import * as request from 'supertest';

describe('FooController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = module.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();
  });

  afterAll(async () => { await app.close(); });

  it('POST /foos returns 201', () => {
    return request(app.getHttpServer())
      .post('/foos')
      .send({ name: 'Test Foo' })
      .expect(201)
      .expect((res) => {
        expect(res.body.name).toBe('Test Foo');
      });
  });
});
```

### Component Test (React/Next.js)
```tsx
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Counter } from './counter';

describe('Counter', () => {
  it('increments on click', async () => {
    const user = userEvent.setup();
    render(<Counter initialCount={0} />);

    const button = screen.getByRole('button');
    await user.click(button);

    await waitFor(() => {
      expect(screen.getByText('Count: 1')).toBeInTheDocument();
    });
  });
});
```

## Prioritas Testing
1. **Services** (unit) - business logic, edge cases
2. **API endpoints** (integration) - happy path + error cases
3. **Shared utils** (unit) - pure functions
4. **UI components** (component) - user interaction, conditional rendering
5. **E2E flows** - hanya untuk critical paths

## Checklist
1. [ ] Test file mengikuti konvensi nama (.spec.ts / .test.tsx)
2. [ ] Menggunakan `describe` block yang bermakna
3. [ ] Setiap test punya satu assertion minimal
4. [ ] Mock dependencies, bukan internal logic
5. [ ] Test error cases, bukan hanya happy path
6. [ ] Test cleanup (afterEach/afterAll) jika ada side effects

## Yang TIDAK BOLEH
- Tidak boleh `it.skip` tanpa komentar TODO
- Tidak boleh `expect(true).toBe(true)` (meaningless test)
- Tidak boleh test yang bergantung pada execution order
- Tidak boleh mock `Date.now()` global tanpa restore
- Tidak boleh import implementasi di test file (import type/interface only)
