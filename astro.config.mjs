import { defineConfig } from 'astro/config';
import fs from 'node:fs';
import path from 'node:path';
import { load } from 'js-yaml';
import { WYGLADY, MOTYWY, plikiCzcionek } from './src/lib/motywy.mjs';

// Domyślny wygląd każdej niszy (gdy klient nie wybrał motywu ani wyglądu).
const WYGLAD_NISZY = { gabinet: 'spokojny', warsztat: 'mocny', remonty: 'rzemieslniczy' };

// Moduł "virtual:motyw": dołącza do strony tylko czcionki i style motywu, których używa dany klient.
function motywKlienta() {
  const ID = 'virtual:motyw';
  return {
    name: 'motyw-klienta',
    resolveId: (id) => (id === ID ? '\0' + ID : undefined),
    load(id) {
      if (id !== '\0' + ID) return;
      const klient = process.env.KLIENT || fs.readdirSync('klienci').filter((d) => !d.startsWith('_') && fs.existsSync(path.join('klienci', d, 'strona.yaml')))[0];
      let dane = {};
      try {
        dane = load(fs.readFileSync(path.join('klienci', klient, 'strona.yaml'), 'utf8')) ?? {};
      } catch {}
      const motyw = MOTYWY[dane.motyw];
      const wyglad = WYGLADY[dane.wyglad] ?? motyw?.wyglad ?? WYGLADY[WYGLAD_NISZY[dane.szablon] ?? 'spokojny'];
      const importy = plikiCzcionek(wyglad);
      const styl = motyw && path.resolve('src/styles/motywy', `${dane.motyw}.css`);
      if (styl && fs.existsSync(styl)) importy.push(styl);
      return importy.map((p) => `import ${JSON.stringify(p)};`).join('\n');
    },
  };
}

// Ustawienia przychodzą ze skryptu scripts/build.mjs (KLIENT, BAZA, WYJSCIE).
export default defineConfig({
  base: process.env.BAZA || '/',
  outDir: process.env.WYJSCIE || 'dist',
  trailingSlash: 'ignore',
  build: { format: 'directory', inlineStylesheets: 'always' },
  devToolbar: { enabled: false },
  image: { responsiveStyles: false },
  vite: { plugins: [motywKlienta()] },
});
