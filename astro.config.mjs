import { defineConfig } from 'astro/config';

// Ustawienia przychodzą ze skryptu scripts/build.mjs (KLIENT, BAZA, WYJSCIE).
export default defineConfig({
  base: process.env.BAZA || '/',
  outDir: process.env.WYJSCIE || 'dist',
  trailingSlash: 'ignore',
  build: { format: 'directory', inlineStylesheets: 'always' },
  devToolbar: { enabled: false },
  image: { responsiveStyles: false },
});
