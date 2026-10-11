// Panel edycji stron (Sveltia CMS) pod adresem <podgląd>/admin/.
// Wywoływany z scripts/build.mjs przy budowaniu podglądu. Pola panelu opisuje panel/pola.mjs.
//   node scripts/panel.mjs [folder]   -> sam panel do dist/admin (albo podanego folderu)
import fs from 'node:fs';
import path from 'node:path';
import { dump } from 'js-yaml';
import { FIELDS } from '../panel/pola.mjs';

const REPO = process.env.PANEL_REPO || 'mjurczyk11-svg/generator-stron';
const GALAZ = process.env.PANEL_GALAZ || 'main';
// Netlify podaje adres strony w zmiennej URL.
const ADRES = (process.env.URL || 'https://lighthearted-gingersnap-5985d7.netlify.app').replace(/\/$/, '');

export function konfiguracja({ backend } = {}) {
  return {
    backend: backend ?? {
      name: 'github',
      repo: REPO,
      branch: GALAZ,
      // Logowanie tokenem GitHub (bez konfiguracji OAuth w Netlify).
      auth_methods: ['token'],
      commit_messages: {
        create: 'Panel: nowy klient {{slug}}',
        update: 'Panel: zmiany na stronie {{slug}}',
        delete: 'Panel: usunięto klienta {{slug}}',
        uploadMedia: 'Panel: nowe zdjęcie {{path}}',
        deleteMedia: 'Panel: usunięto zdjęcie {{path}}',
      },
    },
    site_url: ADRES,
    display_url: ADRES,
    media_folder: 'klienci',
    output: { omit_empty_optional_fields: true },
    // Nazwy folderów i plików bez polskich znaków.
    slug: { encoding: 'ascii', clean_accents: true },
    collections: [
      {
        name: 'klienci',
        label: 'Strony klientów',
        label_singular: 'strony klienta',
        description: 'Każda pozycja to strona jednej firmy. Po zapisaniu strona przebudowuje się sama w ciągu 1–3 minut.',
        icon: 'web',
        folder: 'klienci',
        path: '{{slug}}/strona',
        extension: 'yaml',
        format: 'yaml',
        // Zdjęcia leżą obok pliku strony, w folderze zdjecia/, a w pliku zapisuje się sama nazwa.
        media_folder: 'zdjecia',
        public_folder: '',
        identifier_field: 'firma.nazwa',
        slug: {
          template: '{{fields.firma.nazwa}}',
          editable: ['create'],
          hint: 'Nazwa folderu klienta i końcówka adresu podglądu, np. dentysta-kowalski. Tylko małe litery, cyfry i myślniki. Później nie da się jej zmienić.',
          pattern: ['^[a-z0-9-]+$', 'Tylko małe litery bez polskich znaków, cyfry i myślniki.'],
        },
        summary: '{{firma.nazwa}}',
        thumbnail: 'hero.zdjecie',
        preview_path: '{{dirname}}/',
        sortable_fields: ['firma.nazwa', 'szablon', 'commit_date'],
        view_groups: [{ label: 'Rodzaj strony', field: 'szablon' }],
        editor: { preview: false },
        fields: FIELDS,
      },
    ],
  };
}

export function zbudujPanel(cel = 'dist/admin', opcje = {}) {
  const cms = 'node_modules/@sveltia/cms/dist';
  fs.mkdirSync(cel, { recursive: true });
  fs.copyFileSync(path.join(cms, 'sveltia-cms.js'), path.join(cel, 'sveltia-cms.js'));
  fs.cpSync(path.join(cms, 'chunks'), path.join(cel, 'chunks'), { recursive: true, filter: (p) => !p.endsWith('.map') });
  fs.copyFileSync('panel/index.html', path.join(cel, 'index.html'));
  fs.writeFileSync(path.join(cel, 'config.yml'), '# Plik tworzony automatycznie z panel/pola.mjs. Nie edytuj.\n' + dump(konfiguracja(opcje), { lineWidth: -1, noRefs: true }));
}

if (import.meta.url === `file://${process.argv[1]}`) {
  zbudujPanel(process.argv[2]);
  console.log(`Panel gotowy: ${process.argv[2] || 'dist/admin'}`);
}
