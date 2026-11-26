---
description: Bootstrap sesi dengan membaca STATUS, BACKLOG aktif, dan kondisi git
agent: plan
---

Bootstrap sesi kerja. Jangan mengubah file apa pun dalam tahap ini.

Langkah:
1. Baca `docs/STATUS.md` (snapshot). Jangan memuat `docs/STATUS-LOG.md`/`docs/BACKLOG-ARCHIVE.md` penuh. Dari `docs/BACKLOG.md`, ambil hanya baris aktif (status selain `done`/`shipped`) via grep/read bertarget.
2. Jalankan `git log --oneline -10`, `git status --short`, dan `git branch --show-current` untuk konteks terkini; sebutkan branch aktif dan posisinya terhadap `visual-polish`.
3. Sajikan ringkasan singkat:
   - milestone aktif dan posisi proyek sekarang,
   - yang sedang berjalan / terakhir selesai,
   - 2–3 kandidat langkah berikutnya (urut dari bagian **Next** di STATUS).
4. Tanya user mau lanjut yang mana. JANGAN mulai mengerjakan apa pun sebelum user memilih.
