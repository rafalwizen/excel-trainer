// One-shot production migration runner (docker compose "migrate" service).
// Locally: node --env-file=.env scripts/migrate.mjs
import { fileURLToPath } from "node:url";
import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL is not set");
  process.exit(1);
}

const client = postgres(url, { max: 1, onnotice: () => {} });
try {
  const migrationsFolder = fileURLToPath(new URL("../drizzle", import.meta.url));
  await migrate(drizzle({ client }), { migrationsFolder });
  console.log("Migrations applied.");
} finally {
  await client.end();
}
