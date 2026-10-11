// Odczyt i zapis plików w repozytorium przez API GitHuba (token z prawem zapisu do repozytorium).
export const REPO = 'mjurczyk11-svg/generator-stron';
export const GALAZ = 'main';
const API = 'https://api.github.com';

// Ten sam token, którym logujesz się w formularzach (Sveltia CMS), działa też tutaj.
export function wczytajToken() {
  try {
    const wlasny = localStorage.getItem('edytor.github');
    if (wlasny) return wlasny;
    const sveltia = JSON.parse(localStorage.getItem('sveltia-cms.user') || 'null');
    return sveltia?.token || '';
  } catch {
    return '';
  }
}

export function zapiszToken(token) {
  try {
    if (token) localStorage.setItem('edytor.github', token);
    else localStorage.removeItem('edytor.github');
  } catch {}
}

export class GitHub {
  constructor(token) {
    this.token = token;
  }

  async zapytanie(sciezka, opcje = {}) {
    const odp = await fetch(API + sciezka, {
      ...opcje,
      headers: {
        Accept: 'application/vnd.github+json',
        Authorization: `Bearer ${this.token}`,
        'X-GitHub-Api-Version': '2022-11-28',
        ...(opcje.body ? { 'Content-Type': 'application/json' } : {}),
      },
      cache: 'no-store',
    });
    if (!odp.ok) {
      const blad = new Error(`GitHub ${odp.status}: ${(await odp.text()).slice(0, 200)}`);
      blad.status = odp.status;
      throw blad;
    }
    return odp.status === 204 ? null : odp.json();
  }

  // Sprawdza token: zwraca true, gdy można zapisywać w repozytorium.
  async sprawdz() {
    const r = await this.zapytanie(`/repos/${REPO}`);
    return Boolean(r.permissions?.push);
  }

  async lista(folder) {
    return this.zapytanie(`/repos/${REPO}/contents/${folder}?ref=${GALAZ}`);
  }

  // Zwraca { tekst, sha } albo null, gdy pliku nie ma.
  async plik(sciezka) {
    try {
      const r = await this.zapytanie(`/repos/${REPO}/contents/${sciezka}?ref=${GALAZ}`);
      const bajty = Uint8Array.from(atob(r.content.replace(/\n/g, '')), (c) => c.charCodeAt(0));
      return { tekst: new TextDecoder().decode(bajty), sha: r.sha };
    } catch (e) {
      if (e.status === 404) return null;
      throw e;
    }
  }

  // Zapisuje kilka plików w jednym commicie. pliki: [{ sciezka, tekst } | { sciezka, base64 }]
  async zapisz(pliki, wiadomosc) {
    for (let proba = 0; proba < 3; proba++) {
      const ref = await this.zapytanie(`/repos/${REPO}/git/ref/heads/${GALAZ}`);
      const rodzic = ref.object.sha;
      const commit = await this.zapytanie(`/repos/${REPO}/git/commits/${rodzic}`);
      const tree = [];
      for (const p of pliki) {
        const blob = await this.zapytanie(`/repos/${REPO}/git/blobs`, {
          method: 'POST',
          body: JSON.stringify(p.base64 != null ? { content: p.base64, encoding: 'base64' } : { content: p.tekst, encoding: 'utf-8' }),
        });
        tree.push({ path: p.sciezka, mode: '100644', type: 'blob', sha: blob.sha });
      }
      const drzewo = await this.zapytanie(`/repos/${REPO}/git/trees`, { method: 'POST', body: JSON.stringify({ base_tree: commit.tree.sha, tree }) });
      const nowy = await this.zapytanie(`/repos/${REPO}/git/commits`, {
        method: 'POST',
        body: JSON.stringify({ message: wiadomosc, tree: drzewo.sha, parents: [rodzic] }),
      });
      try {
        await this.zapytanie(`/repos/${REPO}/git/refs/heads/${GALAZ}`, { method: 'PATCH', body: JSON.stringify({ sha: nowy.sha }) });
        return nowy.sha;
      } catch (e) {
        // Ktoś zapisał coś w tym samym momencie: próbujemy jeszcze raz na najnowszej wersji.
        if (e.status !== 422 || proba === 2) throw e;
      }
    }
  }
}
