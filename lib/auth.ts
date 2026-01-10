
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "./db";
import * as schema from "../db/schema";
import { logToFile } from "./logger";

export const auth = betterAuth({
    database: drizzleAdapter(db, {
        provider: "pg",
        schema: {
            user: schema.user,
            session: schema.session,
            account: schema.account,
            verification: schema.verification
        }
    }),
    emailAndPassword: {
        enabled: true,
        autoSignIn: true
    },
    // Configurações para produção na Vercel
    baseURL: process.env.BETTER_AUTH_URL,
    trustedOrigins: [process.env.BETTER_AUTH_URL || "http://localhost:3000"],
    onAPIError: {
        throw: true, // Should we throw? If we throw, it might be caught by the route handler wrapper
        onError: (error, ctx) => {
            const errorMessage = error instanceof Error ? error.message : String(error);
            logToFile(`[BETTER-AUTH ERROR] Context: ${JSON.stringify(ctx)} - Error: ${errorMessage}`);
            if (error instanceof Error && error.stack) {
                logToFile(`[BETTER-AUTH STACK] ${error.stack}`);
            }
        }
    },
    // databaseHooks removed to fix build type errors
});
