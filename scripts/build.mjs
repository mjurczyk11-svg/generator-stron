// Buduje strony.
//   KLIENT=nazwa npm run build  -> jedna strona klienta w dist/ (produkcja, własna domena)
//   npm run build               -> wszystkie strony w dist/<nazwa>/ (podgląd dla klientów, ukryty przed Google)
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const astro = (env) => execSync('npx astro build', { stdio: 'inherit', env: { ...process.env, ...env } });

if (process.env.KLIENT) {
  astro({ KLIENT: process.env.KLIENT, BAZA: '/', WYJSCIE: 'dist' });
} else {
  const klienci = fs.readdirSync('klienci').filter((d) => !d.startsWith('_') && fs.existsSync(path.join('klienci', d, 'strona.yaml')));
  fs.rmSync('dist', { recursive: true, force: true });
  const bledy = [];
  for (const k of klienci) {
    console.log(`\n=== Buduję: ${k} ===`);
    try {
      astro({ KLIENT: k, BAZA: `/${k}/`, WYJSCIE: `dist/${k}`, PODGLAD: '1' });
    } catch {
      bledy.push(k);
    }
  }
  fs.writeFileSync('dist/index.html', '<!doctype html><meta charset="utf-8"><meta name="robots" content="noindex"><title>Podgląd</title><p style="font-family:system-ui;padding:40px">Podgląd stron.</p>');
  fs.writeFileSync('dist/robots.txt', 'User-agent: *\nDisallow: /\n');
  console.log(`\nGotowe: ${klienci.length - bledy.length} z ${klienci.length} stron w dist/`);
  if (bledy.length) {
    console.error(`Nie udało się zbudować: ${bledy.join(', ')} (szczegóły wyżej).`);
    if (bledy.length === klienci.length) process.exitCode = 1;
  }
}
