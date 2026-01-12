
import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import * as schema from '../db/schema';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not defined');
}

// prepare: false is required for transaction pooling (port 6543) compatibility
// We also force search_path=public to avoid confusion with neon_auth schema
const connectionString = new URL(process.env.DATABASE_URL);
connectionString.searchParams.set('search_path', 'public');

const client = postgres(connectionString.toString(), { prepare: false });
export const db = drizzle(client, { schema });
