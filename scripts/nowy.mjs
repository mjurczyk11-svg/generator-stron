// Tworzy folder nowego klienta na podstawie przykładu z wybranej niszy.
//   npm run nowy -- nazwa-klienta gabinet|warsztat|remonty
import fs from 'node:fs';
import path from 'node:path';

const [nazwa, nisza = 'gabinet'] = process.argv.slice(2);
if (!nazwa || !/^[a-z0-9-]+$/.test(nazwa)) {
  console.error('Podaj nazwę folderu klienta małymi literami, bez polskich znaków i spacji, np.: npm run nowy -- dentysta-kowalski gabinet');
  process.exit(1);
}
const wzor = path.join('klienci', `przyklad-${nisza}`, 'strona.yaml');
if (!fs.existsSync(wzor)) {
  console.error(`Nieznana nisza "${nisza}". Dostępne: gabinet, warsztat, remonty.`);
  process.exit(1);
}
const cel = path.join('klienci', nazwa);
if (fs.existsSync(cel)) {
  console.error(`Folder ${cel} już istnieje.`);
  process.exit(1);
}
fs.mkdirSync(path.join(cel, 'zdjecia'), { recursive: true });
fs.writeFileSync(
  path.join(cel, 'strona.yaml'),
  fs.readFileSync(wzor, 'utf8').replace(/^#\s+UWAGA: to przykładowa, zmyślona firma\.\n/m, ''),
);
console.log(`Gotowe: ${cel}/strona.yaml. Uzupełnij dane i wrzuć zdjęcia do ${cel}/zdjecia/.`);
