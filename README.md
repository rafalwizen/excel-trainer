# Excel Trainer

Aplikacja webowa do nauki Excela przez praktyczne zadania. Użytkownik rozwiązuje
zadania w arkuszu, który wygląda i zachowuje się jak prawdziwy Excel (Univer),
wybiera tematy, zakłada konto i śledzi swój postęp.

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
- Domena z rekordem A wskazującym na IP serwera
- Otwarte porty 80 i 443

### Konfiguracja

W katalogu projektu utwórz `.env`:

```env
POSTGRES_PASSWORD=<silne hasło do bazy>
BETTER_AUTH_SECRET=<openssl rand -base64 32>
BASE_URL=https://twoja-domena.pl
```

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
