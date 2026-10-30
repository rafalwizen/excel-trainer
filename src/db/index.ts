import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

// Connection is lazy — constructing the client does not touch the database.
// The fallback keeps local tooling (build, drizzle-kit) working without .env.
const client = postgres(
  process.env.DATABASE_URL ??
    "postgres://postgres:postgres@localhost:5432/excel_trainer",
  {
    onnotice: () => {}, // silence NOTICE messages in dev output
  },
);

export const db = drizzle({ client, schema });
