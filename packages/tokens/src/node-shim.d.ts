// Shim tipe minimal agar test membaca tokens.css lewat node:fs tanpa menambah
// dependency @types/node (CR-033). Hanya mendeklarasikan yang dipakai test.
declare module 'node:fs' {
  export function readFileSync(path: string, encoding: 'utf8'): string;
}

interface ImportMeta {
  readonly dirname: string;
}
