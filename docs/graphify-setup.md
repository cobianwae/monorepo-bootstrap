# Graphify Setup

Graphify membuat graph kode on-device dan mengeksposnya lewat MCP.
Graph dipakai untuk pertanyaan struktural (dependency, blast radius, relasi komponen)
sebelum jatuh ke grep.

## Prasyarat

- `graphify` dan `graphify-mcp` tersedia di `~/.local/bin`.
- Graphify dijalankan dari root repo.

Verifikasi:

```bash
graphify --version
command -v graphify-mcp
```

## Build Graph

```bash
graphify extract . --code-only
graphify cluster-only .
```

Output di `graphify-out/`:

| File | Isi |
|---|---|
| `graph.json` | Graph node/edge untuk MCP |
| `graph.html` | Visualisasi |
| `GRAPH_REPORT.md` | Ringkasan community dan statistik |

`graphify-out/` bersifat **per-machine** dan tidak di-commit (lihat `.gitignore`).

## Konfigurasi MCP

Entri di `opencode.json`:

```jsonc
{
  "mcp": {
    "servers": {
      "graphify": {
        "type": "local",
        "command": [
          "sh",
          "-c",
          "~/.local/bin/graphify-mcp \"$(git rev-parse --path-format=absolute --git-common-dir)/../graphify-out/graph.json\""
        ]
      }
    }
  }
}
```

Perintah tersebut resolve graph lewat git common dir, sehingga worktree memakai graph repo utama.

## Verifikasi

```bash
opencode mcp list
```

Pastikan `graphify` berstatus connected. Di sesi agent, pertanyaan struktural harus mencoba
graphify lebih dulu; grep hanya untuk melengkapi.

## Refresh

Setelah perubahan kode signifikan:

```bash
graphify update .
```

Untuk rebuild penuh:

```bash
graphify extract . --code-only
graphify cluster-only .
```

## Troubleshooting

| Gejala | Penyebab umum | Solusi |
|---|---|---|
| MCP tidak connected | `graph.json` belum ada | Jalankan build graph |
| Graph kosong | `graphify-out` salah path | Cek command MCP dan lokasi graph |
| Node tidak muncul | File di-ignore atau tidak didukung | Cek output extract; gunakan grep |
| Community tanpa nama | Tidak ada LLM backend | Biarkan placeholder atau set API key |

## Keterbatasan

- Graphify mengindeks kode, bukan dokumen `docs/`.
- `tokens.css` saat ini dilewati karena ditandai *potentially sensitive*; token CSS tidak muncul di graph.
- Beberapa file CSS dan barrel tanpa simbol tidak terklasifikasi.
- TSX kompleks bisa menghasilkan relasi yang tidak sempurna.
- Graph tidak di-commit; setiap mesin/worktree perlu build sendiri.

## FAQ

**Apakah graph perlu di-commit?**
Tidak. Ukurannya besar dan bergantung pada mesin. Cukup build lokal.

**Apakah agent wajib memakai graphify?**
Untuk pertanyaan struktural, ya — coba graphify dulu. Jika MCP tidak tersedia, catat dan fallback ke grep.

**Apakah graphify menggantikan test?**
Tidak. Graphify hanya alat navigasi kode.
