// Zdjęcia klienta leżą w klienci/<KLIENT>/zdjecia/. W pliku strona.yaml podajemy samą nazwę pliku.
import type { ImageMetadata } from 'astro';
import { KLIENT } from './dane';

const wszystkie = import.meta.glob<{ default: ImageMetadata }>('/klienci/*/zdjecia/**/*.{jpg,jpeg,png,webp,avif,svg,JPG,JPEG,PNG,WEBP}');

export async function zdjecie(plik?: string | null): Promise<ImageMetadata | undefined> {
  if (!plik) return undefined;
  const f = wszystkie[`/klienci/${KLIENT}/zdjecia/${plik}`];
  if (!f) {
    console.warn(`[${KLIENT}] Brak zdjęcia: zdjecia/${plik}`);
    return undefined;
  }
  return (await f()).default;
}
