/**
 * Auto-suggest mapping header CSV → field target.
 *
 * Normalisasi: lowercase → trim → hapus [\s_\-].
 * Skor: persis = 100, sinonim = 90, substring = 70; ambil tertinggi ≥ 70,
 * selain itu null (Abaikan). Field wajib yang belum terpetakan → null
 * (deteksi wajib hilang dilakukan di validate/gate UI).
 *
 * Kamus sinonim Bahasa Indonesia menurut design spec §3 langkah 3:
 * nama/surel/e-mail/tgl lahir/telepon → name/email/dob/phone.
 */

import type { TargetField } from './types';

function normalize(text: string): string {
  return text.toLowerCase().trim().replace(/[\s_\-]+/g, '');
}

// Sinonim header Indonesia → kunci field (skor 90).
// Kunci sudah dalam bentuk ternormalisasi (lowercase, tanpa spasi/_/-/).
const SYNONYM: Record<string, string> = {
  nama: 'name',
  namalengkap: 'name',
  sulam: 'email',
  emailaddress: 'email',
  tgllahir: 'dob',
  tgallahir: 'dob',
  tanggallahir: 'dob',
  birthdate: 'dob',
  dob: 'dob',
  telepon: 'phone',
  phone: 'phone',
  telp: 'phone',
  nomortelepon: 'phone',
  nomorhp: 'phone',
  handphone: 'phone',
  memberid: 'memberId',
  idanggota: 'memberId',
  idmember: 'memberId',
};

export function suggestMapping(
  headers: string[],
  fields: TargetField[]
): Record<string, string | null> {
  const mapping: Record<string, string | null> = {};

  for (const header of headers) {
    const nh = normalize(header);
    let bestKey: string | null = null;
    let bestScore = 0;

    for (const field of fields) {
      const nk = normalize(field.key);
      const nl = normalize(field.label);
      let score = 0;

      // Persis (key atau label) = 100.
      if (nh === nk || nh === nl) {
        score = 100;
      } else if (SYNONYM[nh] === field.key) {
        // Sinonim = 90.
        score = 90;
      } else if (
        nk.length >= 3 &&
        (nh.includes(nk) || nk.includes(nh) || nh.includes(nl) || nl.includes(nh))
      ) {
        // Substring bermakna = 70.
        score = 70;
      }

      if (score > bestScore) {
        bestScore = score;
        bestKey = score >= 70 ? field.key : null;
      }
    }

    mapping[header] = bestKey;
  }

  return mapping;
}

export function getSuggestedKey(header: string, fields: TargetField[]): string | null {
  return suggestMapping([header], fields)[header] ?? null;
}
