---
description: Audit kode UI/UX via subagent ui-ux-auditor
agent: plan
---

Scope: `$ARGUMENTS`

## Langkah

1. Delegasikan audit ke subagent `ui-ux-auditor` dengan scope di atas.
2. Auditor bersifat read-only: tidak boleh mengedit file.
3. Laporkan:
   - ringkasan critical/warning/pass,
   - temuan dengan `file:line`,
   - hasil command verification.
4. Jika temuan perlu tindak lanjut, tawarkan draft CR.

Command ini khusus audit kode. Untuk review artefak dokumen, gunakan `/review`.
