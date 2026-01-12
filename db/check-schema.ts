import dotenv from "dotenv";
import path from "path";
import { sql } from "drizzle-orm";

// Load .env.local
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

async function checkSchema() {
    try {
        // Dynamic import to ensure env is loaded first
        const { db } = await import("../lib/db");



        const resultSession = await db.execute(sql`
      SELECT table_schema, column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'session'
      ORDER BY table_schema, column_name;
    `);
        console.log("Session table columns:", resultSession);

        const resultUser = await db.execute(sql`
      SELECT table_schema, column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'user'
      ORDER BY table_schema, column_name;
    `);
        console.log("User table columns:", resultUser);
    } catch (error) {
        console.error("Error checking schema:", error);
    }
    process.exit(0);
}

checkSchema();
