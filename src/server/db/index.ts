import { drizzle } from "drizzle-orm/postgres-js";
import { drizzle as drizzleNeon } from "drizzle-orm/neon-serverless";
import postgres from "postgres";

import { env } from "~/env";
import * as schema from "./schema";
import { Pool } from "@neondatabase/serverless";

/**
 * Cache the database connection in development. This avoids creating a new connection on every HMR
 * update.
 */
const globalForDb = globalThis as unknown as {
  conn: postgres.Sql | undefined;
};

const conn = globalForDb.conn ?? postgres(env.DATABASE_URL);
if (env.NODE_ENV !== "production") globalForDb.conn = conn;

let dbConn

if (env.IS_VERCEL === "true") {
  const pool = new Pool({ connectionString: env.DATABASE_URL });
  dbConn = drizzleNeon(pool, { schema });
} else {
  dbConn = drizzle(conn, { schema });
}
export const db = dbConn
