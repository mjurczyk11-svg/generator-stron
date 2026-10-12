// Animacje strony: pojawianie się elementów przy przewijaniu, menu po przewinięciu, liczniki.
// Styl animacji zależy od motywu (atrybut data-animacje na <html>, style w animacje.css).
// Gdy ktoś ma w systemie wyłączone animacje, klasa "anim" nie jest dodawana i wszystko jest od razu widoczne.

const html = document.documentElement;

// Te same elementy co w animacje.css (sekcja „Pojawianie się”).
const ELEMENTY = [
  '.sekcja-glowka', '.sekcja .karta', '.usluga-wiersz', '.usluga-num', '.osoba', '.kroki > li', '.galeria > button',
  '.faq details', '.o-nas-zdjecie', '.o-nas-tekst', '.cennik > div', '.kontakt-dane', '.formularz', '.liczby > div',
  '.znaczniki > li', '.info-blok > *', '.obszar > *', '.cta-pas', '.uwagi', '.opinie-podsumowanie',
].join(',');

if (html.classList.contains('anim')) {
  html.classList.add('anim-gotowe');
  const elementy = [...document.querySelectorAll<HTMLElement>(ELEMENTY)].filter((e) => !e.closest('.hero'));
  // Kolejne elementy w jednym rzędzie pojawiają się po sobie.
  for (const e of elementy) {
    const rodzenstwo = [...(e.parentElement?.children ?? [])].filter((x) => x.matches(ELEMENTY));
    e.style.setProperty('--i', String(Math.min(rodzenstwo.indexOf(e), 7)));
  }
  const io = new IntersectionObserver(
    (wpisy) => {
      for (const w of wpisy) {
        if (!w.isIntersecting) continue;
        w.target.classList.add('widoczne');
        // Po pojawieniu się reakcja na najechanie myszką ma być natychmiastowa.
        w.target.addEventListener('transitionend', () => (w.target as HTMLElement).style.setProperty('--i', '0'), { once: true });
        io.unobserve(w.target);
        w.target.querySelectorAll<HTMLElement>('[data-licznik]').forEach(licz);
      }
    },
    { rootMargin: '0px 0px -6% 0px', threshold: 0.08 },
  );
  elementy.forEach((e) => io.observe(e));
  // Liczniki poza animowanymi blokami (np. liczby na pierwszym ekranie).
  const io2 = new IntersectionObserver((wpisy) => wpisy.forEach((w) => { if (w.isIntersecting) { licz(w.target as HTMLElement); io2.unobserve(w.target); } }));
  document.querySelectorAll<HTMLElement>('.hero [data-licznik]').forEach((e) => io2.observe(e));
}

// Licznik: "2 500+" liczy od zera do 2 500, reszta napisu zostaje. W podglądzie edytora wyłączony.
function licz(e: HTMLElement) {
  if (html.hasAttribute('data-podglad') || e.dataset.policzone) return;
  e.dataset.policzone = '1';
  const m = (e.textContent ?? '').trim().match(/^([^\d]*)(\d[\d\s ]*?)([.,]\d+)?(\D*)$/);
  if (!m) return;
  const [, przed, calosc, ulamek = '', po] = m;
  const cel = Number(calosc.replace(/\D/g, ''));
  if (!cel || cel < 3) return;
  const spacje = /[\s ]/.test(calosc);
  const start = performance.now();
  const czas = 1400;
  const krok = (teraz: number) => {
    const p = Math.min(1, (teraz - start) / czas);
    const v = Math.round(cel * (1 - Math.pow(1 - p, 3)));
    const tekst = spacje ? v.toLocaleString('pl-PL').replace(/ /g, ' ') : String(v);
    e.textContent = przed + tekst + (p === 1 ? ulamek : '') + po;
    if (p < 1) requestAnimationFrame(krok);
  };
  requestAnimationFrame(krok);
}

// Menu: po przewinięciu dostaje tło i cień (a nad dużym zdjęciem przestaje być przezroczyste).
const naglowek = document.getElementById('naglowek');
if (naglowek) {
  const sprawdz = () => naglowek.classList.toggle('przewiniety', window.scrollY > 24);
  sprawdz();
  window.addEventListener('scroll', sprawdz, { passive: true });
}
