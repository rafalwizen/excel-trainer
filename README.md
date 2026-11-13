# Ćwicz Excel

Aplikacja webowa do nauki Excela przez praktyczne zadania (domena produkcyjna:
**cwicz-excel.pl**). Użytkownik rozwiązuje zadania w arkuszu, który wygląda
i zachowuje się jak prawdziwy Excel (Univer), wybiera tematy, zakłada konto
i śledzi swój postęp. Lekcje są publiczne (SEO), konto zapisuje postęp.

## Stack

- **Next.js** (App Router) + TypeScript + Tailwind CSS
- **Univer** — edytor arkusza (client-side)
- **PostgreSQL** + **Drizzle ORM**
- **better-auth** — konta użytkowników (e-mail + hasło)
- Wdrożenie: Docker Compose (app + PostgreSQL + Caddy) na własnym VPS

## Uruchomienie (development)

```bash
npm install
cp .env.example .env   # uzupełnij DATABASE_URL i BETTER_AUTH_SECRET
npm run dev
```

Wymagana baza PostgreSQL (lokalnie np. `docker run -d --name excel-trainer-db \
  -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=excel_trainer -p 5432:5432 postgres:18-alpine`).

Migracje lokalnie: `npx drizzle-kit migrate` albo `node --env-file=.env scripts/migrate.mjs`.

## Lekcje

Treści lekcji znajdują się w `src/content/lessons/` — nowa lekcja to jeden plik
+ wpis w `index.ts`. Szczegóły w `src/content/schema.ts`.

## Wdrożenie produkcyjne (VPS, Docker Compose)

Stos produkcyjny to cztery usługi: `db` (PostgreSQL), `migrate` (jednorazowe
migracje Drizzle), `app` (Next.js w trybie standalone) i `caddy` (HTTPS
z automatycznym certyfikatem Let's Encrypt).

### Wymagania

- VPS z publicznym adresem IP i Dockerem (z wtyczką compose)
- Domena z rekordem A wskazującym na IP serwera (dla tej instalacji: `cwicz-excel.pl`)
- Otwarte porty 80 i 443

### Konfiguracja

W katalogu projektu utwórz `.env`:

```env
POSTGRES_PASSWORD=<silne hasło do bazy>
BETTER_AUTH_SECRET=<openssl rand -base64 32>
BASE_URL=https://cwicz-excel.pl
```

`BASE_URL` musi wskazywać domenę produkcyjną — steruje adresem witryny
w Caddy, adresem auth, `sitemap.xml`, `robots.txt` i metadanymi.

Wartość `DATABASE_URL` w `.env` dotyczy tylko lokalnego developmentu —
w compose aplikacja i migracje dostają własny adres z hostem `db`.

### Uruchomienie

```bash
docker compose up -d --build
```

Migracje wykonują się automatycznie przed startem aplikacji (usługa `migrate`
musi zakończyć się sukcesem). Certyfikat HTTPS Caddy pobiera przy pierwszym
żądaniu — aplikacja jest dostępna pod `BASE_URL`.

### Aktualizacja wersji

```bash
git pull
docker compose up -d --build
```

### Przydatne komendy

- logi aplikacji: `docker compose logs -f app`
- stan usług: `docker compose ps`
- backup bazy: `docker compose exec db pg_dump -U excel_trainer excel_trainer > backup.sql`
- odtworzenie bazy: `cat backup.sql | docker compose exec -T db psql -U excel_trainer excel_trainer`

> Uwaga: `BASE_URL` jest wypalany w statyczne trasy (`sitemap.xml`, `robots.txt`,
> metadane) podczas budowania obrazu — zmiana domeny wymaga przebudowania
> (`docker compose up -d --build`).

## Google Search Console (po wdrożeniu cwicz-excel.pl)

Ręczna checklista jednorazowa:

1. **Rekord DNS**: `cwicz-excel.pl` (A) → IP VPS; sprawdź `dig cwicz-excel.pl`.
2. **Deploy**: `.env` na VPS z `BASE_URL=https://cwicz-excel.pl`,
   potem `docker compose up -d --build` (pełny rebuild — `BASE_URL` wypalany).
3. **Smoke po deployu**:
   - `https://cwicz-excel.pl/lekcje/logika-jezeli` → 200, HTML zawiera
     `application/ld+json`, `seoDescription`, `<h1>`;
   - `https://cwicz-excel.pl/robots.txt` → brak `Disallow: /lekcje`;
   - `https://cwicz-excel.pl/sitemap.xml` → ~33 URL-e z `cwicz-excel.pl`;
   - `https://cwicz-excel.pl/opengraph-image` → zwraca PNG.
4. **GSC**: dodaj property typu *Domain* (`cwicz-excel.pl`), potwierdź
   rekordem TXT w DNS u rejestratora.
5. **Sitemapa**: w GSC wyślij `https://cwicz-excel.pl/sitemap.xml`.
6. **Indeksowanie**: dla kilku lekcji (np. `logika-jezeli`,
   `wyszukaj-pionowo`, `adresowanie-wzgledne-bezwzgledne`) użyj
   *URL Inspection* → *Request indexing*.
7. Po ~tygodniu sprawdź raport *Pages* i frachy w *Performance*.
