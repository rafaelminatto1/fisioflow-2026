
import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";
import { logToFile } from "@/lib/logger";

const handlers = toNextJsHandler(auth);

export const POST = async (req: Request) => {
    try {
        logToFile(`[AUTH DEBUG] POST ${req.url}`);
        const res = await handlers.POST(req);

        if (res.status >= 400) {
            logToFile(`[AUTH DEBUG] Error response status: ${res.status}`);
            try {
                const clone = res.clone();
                const text = await clone.text();
                logToFile(`[AUTH DEBUG] Error response body: ${text}`);
            } catch (e) {
                logToFile(`[AUTH DEBUG] Could not read response body: ${e}`);
            }
        }
        return res;
    } catch (error) {
        logToFile(`[AUTH DEBUG] Uncaught error in POST handler: ${error} \nStack: ${error instanceof Error ? error.stack : ''}`);
        return new Response(JSON.stringify({ error: 'Internal Server Error', details: String(error) }), { status: 500 });
    }
};

export const GET = async (req: Request) => {
    try {
        logToFile(`[AUTH DEBUG] GET ${req.url}`);
        return await handlers.GET(req);
    } catch (error) {
        logToFile(`[AUTH DEBUG] Uncaught error in GET handler: ${error}`);
        return new Response(JSON.stringify({ error: 'Internal Server Error', details: String(error) }), { status: 500 });
    }
};
