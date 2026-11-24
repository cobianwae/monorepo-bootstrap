---
name: decision-framework
description: Integration layer untuk memilih skill yang tepat — trade-off analysis, prioritization matrix, decision trees untuk visual vs UX vs a11y vs business, dan routing fullstack (shared-types, NestJS, Prisma, testing, CI)
tags: [design-system, decision, framework, trade-offs, prioritization, integration]
compatibility: [next, opencode, claude, cursor]
---

# Decision Framework & Skill Integration

## Kapan Pakai
Saat menghadapi keputusan desain yang kompleks, konflik antar prinsip (visual vs UX vs a11y vs business), atau ketika perlu memutuskan skill mana yang harus di-prioritize. Gunakan sebagai "meta-skill" untuk navigasi skill lainnya.

## Decision Trees

### 0. Design System Change Routing

```
START: Perubahan apa yang akan dilakukan?
│
├─ Bug, regresi, a11y, nilai token, docs, microcopy, varian kecil?
│   └─→ CR langsung: docs/cr/CR-NNN-slug.md + skill terkait
│
├─ Komponen baru tanpa pattern baru?
│   └─→ designer (spec singkat) → story-writer (1 story) → implementasi
│
└─ Fitur/pattern baru, area app baru, lintas package, dependency baru?
    └─→ prd-writer (gate 1) → designer (gate 2) → story-writer (gate 3) → implementasi
```

Gunakan `decision-framework` untuk memilih jalur, lalu panggil skill domain yang relevan.

### 0b. Fullstack Change Routing

```
START: Perubahan menyentuh area mana?
│
├─ Tipe/DTO di packages/shared-types?
│   └─→ shared-types → cek consumer (api/web/showcase) → monorepo-ci (typecheck workspace)
│
├─ Endpoint/service/module di apps/api?
│   └─→ shared-types (kontrak dulu) → backend-nestjs → api-testing → monorepo-ci
│
├─ Schema/migration database?
│   └─→ prisma-schema (konfirmasi dependency bila first-time) → shared-types (sinkron tipe) → backend-nestjs → api-testing
│
├─ Test API saja?
│   └─→ api-testing → monorepo-ci
│
└─ Komponen UI / token / showcase?
    └─→ kembali ke routing Design System (0a) di atas
```

Urutan tetap mengikuti gate: PRD → design → story → implementasi. Skill fullstack tidak membuat gate baru.

**Aturan decision points**: detail implementasi (authn, authz engine, rate limit, idempotency, storage, dll) adalah keputusan yang ditentukan di PRD/design — skills hanya memetakan opsi dan edge cases, tidak memilih. Bila PRD belum menjawab decision point yang relevan, agent berhenti dan bertanya.

### 1. Skill Selection Decision Tree

```
START: Apa yang sedang kamu kerjakan?
│
├─ Memulai fitur baru?
│   └─→ 1. prd-writer (PRD + gate 1)
│       2. product-ux (personas, JTBD, metrics)
│       3. designer (object model, sitemap, flow, wireframe)
│       4. ux-psychology (cognitive considerations)
│       5. ux-patterns (interaction patterns)
│       6. visual-design (aesthetics)
│       7. story-writer (story + gate 3)
│       8. ui-component (implementation)
│
├─ Mengaudit UX existing?
│   └─→ 1. ux-research (analytics, testing)
│       2. accessibility (WCAG compliance)
│       3. product-ux (metric alignment)
│
├─ Desain tidak convert?
│   └─→ 1. ux-psychology (trust, persuasion)
│       2. ux-research (A/B test, usability)
│       3. product-ux (conversion patterns)
│
├─ User mengeluh kompleksitas?
│   └─→ 1. ux-psychology (cognitive load)
│       2. ux-patterns (simplification)
│       3. ux-research (usability testing)
│
├─ Masalah visual/aesthetics?
│   └─→ 1. visual-design (principles)
│       2. design-tokens (colors, typography)
│       3. ui-component (implementation)
│
├─ Masalah aksesibilitas?
│   └─→ 1. accessibility (WCAG)
│       2. design-tokens (contrast)
│       3. ux-psychology (inclusive design)
│
└─ Perlu validasi?
    └─→ ux-research (appropriate method)
```

### 2. Visual vs UX Priority Decision Tree

```
Question: Apa yang lebih penting saat ini?

PRIORITY: VISUAL (When)
├─ First impression critical (landing page, marketing)
├─ Brand differentiation needed
├─ Existing UX is solid
├─ Users are happy, but product looks dated
└─ Competitive visual landscape

PRIORITY: UX (When)
├─ Users confused or struggling
├─ Low conversion or engagement
├─ High support ticket volume
├─ Task completion rates low
└─ New user onboarding issues

BALANCED (When)
├─ Product redesign from scratch
├─ Major feature launch
├─ New market entry
└─ Brand repositioning
```

### 3. Perfection vs Speed Decision Tree

```
Context Analysis:

HIGH QUALITY REQUIRED (Take time, do it right)
├─ Safety-critical systems
├─ Healthcare, finance
├─ Legal/compliance implications
├─ High-traffic core flows
├─ Brand-defining moments
└─ Unlikely to change soon

SPEED PRIORITIZED (Ship, iterate later)
├─ MVP / hypothesis testing
├─ Low-risk features
├─ Internal tools
├─ Temporary solutions
├─ Learning experiments
└─ Will definitely iterate

BALANCED APPROACH
├─ Core flows: Quality
├─ Edge cases: Speed with follow-up
├─ High-visibility: Quality
├─ Low-visibility: Speed
└─ Always: Do no harm (a11y, security)
```

---

> Detail (trade-off matrix, framework prioritas, pola keputusan, dan workflow lintas skill) ada di `references/frameworks.md` di folder skill ini. Muat file itu hanya saat butuh templat atau contoh rinci.

## Anti-Patterns

- ✗ Skipping discovery because "we know what users want"
- ✗ Prioritizing visual over usability
- ✗ Sacrificing a11y for any reason
- ✗ Gold-plating low-impact features
- ✗ Perfectionism causing analysis paralysis
- ✗ Speed without clear what-to-cut
- ✗ Ignoring trade-offs (they exist, acknowledge them)
- ✗ Not documenting decisions and rationale

---

## Checklist

1. [ ] Skill yang tepat dipilih untuk masalah
2. [ ] Trade-offs explicitly identified
3. [ ] Prioritization framework applied
4. [ ] A11y tidak dikompromikan
5. [ ] Decision documented dengan rationale
6. [ ] Plan untuk revisit jika perlu
