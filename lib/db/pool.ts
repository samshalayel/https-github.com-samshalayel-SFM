import "server-only"
import { Pool, types } from "pg"

// Return timestamps as ISO-ish strings (what the Supabase client used to give us)
types.setTypeParser(1184, (v) => v) // timestamptz
types.setTypeParser(1114, (v) => v) // timestamp

const g = globalThis as unknown as { __sfmPool?: Pool }

export const pool: Pool =
  g.__sfmPool ??
  new Pool({
    connectionString: process.env.DATABASE_URL,
    max: Number(process.env.DATABASE_POOL_MAX || 5),
  })

if (process.env.NODE_ENV !== "production") g.__sfmPool = pool
