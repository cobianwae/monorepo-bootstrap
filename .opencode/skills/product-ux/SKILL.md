---
name: product-ux
description: Business context untuk UX — user personas, jobs-to-be-done, business metrics, user journey mapping, conversion patterns, dan feature prioritization
tags: [design-system, product, ux, business, personas, journey, metrics, conversion]
compatibility: [next, opencode, claude, cursor]
---

# Product UX & Business Context

## Kapan Pakai
Saat memulai fitur baru, mendesain user flow, mengoptimasi conversion, atau memastikan desain aligned dengan business goals. WAJIB digunakan sebelum visual design atau implementation untuk memastikan problem space dipahami.

> Detail (persona, JTBD, metrik bisnis, journey map, dan pola konversi) ada di `references/reference.md` di folder skill ini. Muat file itu hanya saat butuh templat atau contoh rinci.

## Feature Prioritization

### RICE Framework
```
RICE Score = (Reach × Impact × Confidence) / Effort

Reach: How many users affected? (per quarter)
  - 1000s = 10, 100s = 5, dozens = 1

Impact: How much will it move the metric?
  - Massive = 3, High = 2, Medium = 1, Low = 0.5, Minimal = 0.25

Confidence: How confident are you?
  - High = 100%, Medium = 80%, Low = 50%

Effort: How much work? (person-months)
  - 2 weeks = 0.5, 1 month = 1, 3 months = 3
```

### ICE Framework (Simplified)
```
ICE Score = Impact × Confidence × Ease

Impact: 1-10
Confidence: 1-10
Ease: 1-10 (how easy to implement)
```

### Opportunity Scoring
```yaml
For each opportunity:
  1. Importance: How important is this to users? (1-10)
  2. Satisfaction: How satisfied are users with current solutions? (1-10)
  3. Opportunity Score = Importance + (Importance - Satisfaction)

Highest scores = Best opportunities
```

---

## Business Analysis (Requirements Framing)

Gunakan sebelum implementasi untuk menjawab "apa yang dibangun dan kenapa". Ringan — cukup untuk membingkai, bukan menggantikan proses BA formal.

### MoSCoW Prioritization

Klasifikasi kebutuhan ke 4 kategori (must/should/could/won't):

| Kategori | Definisi | Contoh |
|----------|----------|-------|
| **Must Have** | Non-negotiable, produk gagal tanpa ini | Login, core flow, a11y wajib, security, legal |
| **Should Have** | Penting tapi bisa rilis tanpa ini | Key UX improvements, performance optimization |
| **Could Have** | Nice-to-have, mudah dipotong | Visual polish, delight feature, edge case |
| **Won't Have** | Eksplisit out of scope (didokumentasikan) | Fitur mahal, belum jelas valuenya |

**Aturan pakai:**
- Prioritaskan per outcome, bukan per stakeholder preference
- MoSCoW harus konsisten dengan metrics — must-have = yang paling besar dampak ke North Star
- Won't have wajib dicatat & dikomunikasikan (bukan dilupakan)
- Revisi saat ada temuan baru (research, constraint teknis)

### User Stories

Format: **`Sebagai <role>, saya ingin <capability>, sehingga <benefit>`**

```yaml
Sebagai admin,
saya ingin filter tabel transaksi berdasarkan tanggal,
sehingga saya bisa menemukan transaksi yang bermasalah dengan cepat.
```

Aturan INVEST (setiap story harus):
- **I**ndependent — bisa di-schedule sendiri
- **N**egotiable — detail bisa diadjust
- **V**aluable — punya value ke user/bisnis
- **E**stimable — bisa diperkirakan effort-nya
- **S**mall — selesai dalam 1 sprint
- **T**estable — bisa diverifikasi

Jangan tulis solusi teknis di story. Story = apa yang user butuhkan; solusi ada di design/implementation.

### Acceptance Criteria (Given/When/Then)

Setiap story WAJIB punya AC — definisi "selesai" yang bisa diverifikasi:

```gherkin
Scenario: Filter transaksi berdasarkan tanggal
  Given ada 10 transaksi dengan tanggal berbeda
  When saya memilih rentang tanggal "1-7 Jan"
  Then tabel menampilkan hanya transaksi di rentang itu
  And tabel menampilkan empty state jika tidak ada hasil
```

- AC berfokus pada perilaku teramati (bukan implementasi)
- Sertakan edge case: kosong, error, batas maksimum
- Kalau bisa jadi test otomatis → itulah test yang harus ditulis

### Functional vs Non-Functional Requirements

| Tipe | Cakupan | Contoh di repo ini |
|------|---------|--------------------|
| **Functional** | Apa yang sistem LAKUKAN | "User bisa export table ke CSV", "Form validasi email" |
| **Non-Functional** | KUALITAS sistem | Kontras WCAG AA (a11y), performance, dark mode parity, security, accessibility |

Jangan hanya menulis functional requirements — a11y & performance adalah non-functional requirements yang wajib di checklist.

### Story Mapping (ringkas)

Susun stories per user journey stage (kiri ke kanan = alur), lalu prioritaskan per baris:
- Baris 1: Must have (backbone)
- Baris 2: Should have
- Baris 3+: Could have / Won't have
Memberi gambaran MVP = jalur backbone lengkap tanpa boleh ada gap.

### Definition of Ready / Done

- **DoR**: story siap dikerjakan jika AC jelas, dependencies jelas, ukuran kecil
- **DoD**: selesai jika AC lolos, a11y audit lolos, test hijau, didokumentasikan di showcase (untuk pattern baru)

---

## Anti-Patterns

- ✗ Building features without understanding the problem
- ✗ Optimizing metrics that don't connect to value
- ✗ Persona theater (creating personas but not using them)
- ✗ Vanity metrics (page views without context)
- ✗ Copying competitors without understanding why
- ✗ Prioritizing stakeholder opinions over user needs
- ✗ Confusing user wants with user needs

---

## Integration with Other Skills

### Batas dengan Workflow Design System

- `product-ux` membingkai masalah, persona, JTBD, metrik, MoSCoW, user story, dan acceptance criteria.
- `prd-writer` memiliki template PRD, penomoran `FR-NNN`, dan Gate 1. Jangan menduplikasi template PRD di sini.
- Untuk perubahan kecil (bug, a11y, token, docs, microcopy), gunakan CR langsung; tidak perlu PRD penuh.

### Before Design:
1. Use `product-ux` to understand users and business
2. Use `ux-psychology` to understand cognitive factors
3. Use `ux-research` to validate assumptions

### During Design:
1. Use `ux-patterns` for interaction patterns
2. Use `visual-design` for aesthetics
3. Use `decision-framework` for trade-offs

### After Launch:
1. Use `ux-research` to measure success
2. Update personas and journey maps based on data

---

## Checklist
1. [ ] User personas defined (at least 1)
2. [ ] JTBD identified for key flows
3. [ ] Business metrics connected to UX improvements
4. [ ] User journey mapped for critical paths
5. [ ] Conversion patterns applied where relevant
6. [ ] Features prioritized with RICE/ICE
7. [ ] Problem statement clear before designing solution
8. [ ] Requirement diklasifikasi MoSCoW (must/should/could/won't)
9. [ ] User story ditulis (role + capability + benefit, INVEST)
10. [ ] Acceptance criteria Given/When/Then + edge cases
