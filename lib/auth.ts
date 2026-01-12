
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "./db";
import * as schema from "../db/schema";

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
    trustedOrigins: [
        process.env.BETTER_AUTH_URL || "http://localhost:3000",
        ...(process.env.VERCEL_URL ? [`https://${process.env.VERCEL_URL}`] : []),
        "https://fisioflow-2026.vercel.app"
    ],
    // Ajuste de rate limiting para evitar bloqueios durante testes
    rateLimit: {
        enabled: true,
        window: 30, // 30 segundos
        max: 10, // 10 tentativas por janela
        storage: "memory"
    }
});
