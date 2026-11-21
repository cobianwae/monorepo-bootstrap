import { clsx, type ClassValue } from 'clsx';
import { extendTailwindMerge } from 'tailwind-merge';

// `text-micro` adalah @utility token (styles.css) berupa font-size. twMerge default tidak
// mengenalnya dan membuangnya saat bertabrakan dengan kelas warna (CR-021 #6), sehingga
// didaftarkan sebagai font-size.
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      'font-size': ['text-micro'],
    },
  },
});

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
