import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

// postgres() is lazy by design — it does NOT open a TCP connection
// until the first query is executed. Exporting the real instance (not a Proxy)
// is required so Corsair can pass its internal instanceof check.
export const client = postgres(
  process.env.DATABASE_URL || "postgres://localhost:5432/postgres"
);

export const db = drizzle(client);
