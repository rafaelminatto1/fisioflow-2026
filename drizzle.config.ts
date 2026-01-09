
import { defineConfig } from "drizzle-kit";

// Use process.env.DATABASE_URL
// Local: Create .env.local with DATABASE_URL='postgresql://neondb_owner:npg_g2AChXk8rnIx@ep-young-bush-ahg5irbc-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require'

export default defineConfig({
  dialect: "postgresql",
  schema: "./db/schema.ts",
  out: "./drizzle",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
