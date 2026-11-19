---
description: Review artefak dan hasilkan temuan dengan severity
agent: build
---

Artefak: `$ARGUMENTS`

## Langkah

1. Muat skill `reviewer`.
2. Identifikasi artefak dan statusnya (draft/approved/shipped/review/done).
3. Review dengan lensa:
   - **Koherensi dokumen** — PRD, design, story, CR; cakupan FR; konsistensi ID.
   - **Design-system compliance** — token semantik, OKLCH, light/dark, Radix, `cva`, barrel export, tidak ada duplikasi.
   - **UX/UI** — hierarki, spacing, state, microcopy, responsif.
   - **Implementation drift** — kode vs spec, showcase parity, test, docs.
4. Susun tabel temuan:

   ```text
   # | severity | lensa | lokasi | deskripsi | rekomendasi
   ```

5. Temuan pada artefak approved/shipped atau story `review`/`done` harus menjadi **draft CR**, bukan edit langsung.
6. Artefak draft boleh diedit hanya dengan konfirmasi user.
7. Ringkas temuan dan tanyakan next action.

Jangan mengubah kode kecuali diminta eksplisit.
