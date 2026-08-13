import { neon } from "@neondatabase/serverless";

const databaseUrl =
  process.env.REACT_APP_DATABASE_URL ||
  process.env.DATABASE_URL ||
  "";

if (!databaseUrl) {
  console.warn("REACT_APP_DATABASE_URL environment variable is missing.");
}

export const sql = neon(databaseUrl);
