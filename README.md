# OpenCode Bootstrap — NestJS + Next.js

Konfigurasi OpenCode siap pakai untuk monorepo TypeScript dengan **NestJS (backend)** dan **Next.js (frontend)**. Cukup extract, sesuaikan model/provider, dan langsung productive.

## Quick Start

```bash
# 1. Extract arsip ini ke root project kamu
unzip opencode-bootstrap-nestjs-nextjs.zip -d /path/to/your/project

# 2. Atau copy file-file ke project yang sudah ada
cp -r opencode-bootstrap-nestjs-nextjs/AGENTS.md /path/to/your/project/
cp -r opencode-bootstrap-nestjs-nextjs/opencode.json /path/to/your/project/
cp -r opencode-bootstrap-nestjs-nextjs/.opencode/ /path/to/your/project/

# 3. Sesuaikan provider dan model di opencode.json
#    Edit bagian "provider" section (lihat di bawah)

# 4. Jalankan OpenCode di project kamu
cd /path/to/your/project
opencode
```

## Struktur File

```
project-root/
├── AGENTS.md                          # System prompt universal (dibaca agent setiap session)
├── opencode.json                      # Konfigurasi OpenCode utama
├── README.md                          # File ini
└── .opencode/
    └── skills/
        ├── nestjs-api/SKILL.md        # Pola controller, service, module, DTO
        ├── nextjs-feature/SKILL.md    # Pola page, component, server action
        ├── prisma-schema/SKILL.md     # Schema design, migration, query pattern
        ├── typescript-types/SKILL.md  # Shared types, DTO, type guards
        ├── testing/SKILL.md           # Vitest + Testing Library patterns
        ├── error-handling/SKILL.md    # Exception filter, error boundary
        └── git-workflow/SKILL.md      # Conventional commits, branching
```

## Konfigurasi Provider & Model

Edit `opencode.json`, bagian `provider` dan `agent.code`:

### Anthropic (Claude) — Default
```json
{
  "provider": {
    "default": "anthropic",
    "models": {
      "anthropic": {
        "model": "claude-sonnet-4-20250514",
        "apiKey": "${ANTHROPIC_API_KEY}"
      }
    }
  }
}
```

### OpenAI (GPT)
```json
{
  "provider": {
    "default": "openai",
    "models": {
      "openai": {
        "model": "gpt-4o",
        "apiKey": "${OPENAI_API_KEY}"
      }
    }
  }
}
```

### OpenRouter (Multi-provider)
```json
{
  "provider": {
    "default": "openrouter",
    "models": {
      "openrouter": {
        "model": "anthropic/claude-sonnet-4",
        "apiKey": "${OPENROUTER_API_KEY}",
        "baseURL": "https://openrouter.ai/api/v1"
      }
    }
  }
}
```

### Override via Environment Variable
```bash
# Gunakan model/provider berbeda tanpa edit file
export OPCODE_MODEL="gpt-4o"
export OPCODE_PROVIDER="openai"
opencode
```

## Apa yang Sudah Dikonfigurasi

### Permissions (opencode.json)
| Aksi | Scope | Policy |
|------|-------|--------|
| Read | Semua file | Auto-allow |
| Write | `apps/`, `packages/`, `libs/`, `*.ts`, `*.tsx`, `*.json`, `*.prisma` | Auto-allow |
| Write | `*.env*` | Ask (konfirmasi dulu) |
| Write | Lainnya | Deny |
| Execute | `pnpm test:*`, `pnpm build:*`, `pnpm lint:*`, `npx vitest*`, `npx tsc*` | Auto-allow |
| Execute | `pnpm prisma*`, `git commit*` | Ask |
| Execute | `pnpm db*`, `git push*`, `rm -rf*` | Deny |

### Hooks (Auto-verification)
- **after_write** (backend `*.ts`): Auto type-check `tsc --noEmit` setiap kali agent menulis file backend
- **after_write** (frontend `*.ts/tsx`): Auto type-check setiap kali agent menulis file frontend
- **before_commit**: Jalankan `pnpm lint && pnpm build:types` sebelum commit

### Skills (7 Modul)
| Skill | Dipakai Saat |
|-------|-------------|
| `nestjs-api` | Membuat endpoint, controller, service, module NestJS |
| `nextjs-feature` | Membuat halaman, komponen, API route Next.js |
| `prisma-schema` | Mengubah schema database, membuat migration |
| `typescript-types` | Membuat shared types lintas backend-frontend |
| `testing` | Menulis unit/integration/component test |
| `error-handling` | Menambahkan exception, filter, error boundary |
| `git-workflow` | Commit, branch, PR workflow |

## Adaptasi ke Project Kamu

1. **Path aliases** — AGENTS.md mendefinisikan `@app/`, `@web/`, `@shared/`. Sesuaikan dengan `tsconfig.json` kamu.
2. **Package manager** — Config assume `pnpm`. Ganti ke `npm`/`yarn`/`bun` di opencode.json hooks dan AGENTS.md jika perlu.
3. **Database** — Default PostgreSQL via Prisma. Untuk MySQL/SQLite, sesuaikan di skill `prisma-schema`.
4. **Monorepo structure** — Default `apps/api/` + `apps/web/` + `packages/`. Sesuaikan path di AGENTS.md dan opencode.json jika struktur kamu berbeda.
5. **Framework versions** — Skill ditulis untuk NestJS 10+ dan Next.js 14+. Untuk versi lama, sesuaikan pola di SKILL.md masing-masing.

## Tips Penggunaan

- Agent akan otomatis membaca `AGENTS.md` setiap session. Ini adalah "ground truth" untuk semua konvensi project.
- Skills menggunakan progressive disclosure — agent hanya memuat instruksi penuh saat skill yang bersangkutan dipicu. Ini menghemat context window.
- Jika agent menghasilkan kode yang tidak sesuai konvensi, cek apakah skill yang relevan sudah benar dan AGENTS.md sudah mencakup kasus tersebut.
- Untuk menambah skill baru, buat folder di `.opencode/skills/<nama>/SKILL.md` dengan YAML frontmatter, lalu tambahkan permission di `opencode.json`.

## License

Konfigurasi ini bersifat open. Gunakan dan modifikasi sesuai kebutuhan project kamu.
