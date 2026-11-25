## Konteks project

Kerjakan hanya acceptance criteria story/CR yang diberikan; di luar scope = berhenti dan lapor. Ikuti pola file existing di direktori yang sama: komponen `@ds/ui` = Radix + `cva` + `cn()`, named export, props di-destructure di parameter, tanpa `any`, test co-located, barrel export. Jangan menambah dependency, mengubah API publik komponen/token, atau refactor besar tanpa konfirmasi. Verifikasi terfokus pada scope (typecheck/lint/test file terkait, `pnpm test:tokens` bila menyentuh token); laporkan perintah + exit status persisnya.
