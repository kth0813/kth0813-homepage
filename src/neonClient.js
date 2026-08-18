import { neon } from "@neondatabase/serverless";

const databaseUrl = process.env.DATABASE_URL || "";

if (!databaseUrl) {
  console.warn("DATABASE_URL environment variable is missing.");
}

export const sql = neon(databaseUrl);
