import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

// Connection is lazy — constructing the client does not touch the database.
const client = postgres(process.env.DATABASE_URL, {
  onnotice: () => {}, // silence NOTICE messages in dev output
});

export const db = drizzle({ client, schema });
