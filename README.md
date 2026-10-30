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

## Lekcje

Treści lekcji znajdują się w `src/content/lessons/` — nowa lekcja to jeden plik
+ wpis w `index.ts`. Szczegóły w `src/content/schema.ts`.

> Dokumentacja wdrożenia produkcyjnego (VPS, Docker) — uzupełniana na końcu projektu.
