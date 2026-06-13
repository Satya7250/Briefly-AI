import { db } from "@/db";
import { sql } from "drizzle-orm";

export async function checkDatabaseHealth() {
  const result = await db.execute(sql`SELECT NOW()`);
  return result;
}
