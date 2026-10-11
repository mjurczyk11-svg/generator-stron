// Dobiera czytelny kolor tekstu (biały albo ciemny) do koloru tła.
function rgb(hex: string) {
  const h = hex.replace('#', '');
  const p = h.length === 3 ? h.split('').map((c) => c + c).join('') : h;
  return [0, 2, 4].map((i) => parseInt(p.slice(i, i + 2), 16) / 255);
}
function luminancja(hex: string) {
  const [r, g, b] = rgb(hex).map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
export const tekstNa = (hex: string) => (luminancja(hex) > 0.4 ? '#111418' : '#ffffff');
