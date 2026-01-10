
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
            logToFile(`[BETTER-AUTH ERROR] ${ctx.path}: ${error.message || error}`);
            if (error instanceof Error && error.stack) {
                logToFile(`[BETTER-AUTH STACK] ${error.stack}`);
            }
        }
    },
    databaseHooks: {
        user: {
            create: {
                before: async (user) => {
                    logToFile(`[BETTER-AUTH] Creating user: ${JSON.stringify(user)}`);
                    return user;
                }
            }
        }
    }
});
