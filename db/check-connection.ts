
import dotenv from "dotenv";
import path from "path";
import { sql } from "drizzle-orm";

// Load .env.local
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

async function checkConnection() {
    try {
        // Dynamic import to use updated lib/db.ts
        const { db } = await import("../lib/db");

        const result = await db.execute(sql`SHOW search_path`);
        console.log("Current search_path:", result);
    } catch (error) {
        console.error("Error checking connection:", error);
    }
    process.exit(0);
}

checkConnection();
