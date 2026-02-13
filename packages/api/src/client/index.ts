/* eslint-disable @typescript-eslint/no-unsafe-assignment */

/**
 * This is the client-side code that uses the inferred types from the server
 */
import { createORPCClient } from "@orpc/client";
import { RPCLink } from "@orpc/client/fetch";

import type { RouterClient } from "@orpc/server";

/**
 * We only import the `AppRouter` type from the server - this is not available at runtime
 */
import type { AppRouter } from "../server";

type FunctionOrType<T> = (() => T | undefined | null) | T | undefined | null;

export interface ORPCBuilder {
   /** The application name, e.g. "desktop" or "web" */
   provider?: string | null;
   /** The environment, e.g. "development" or "production" */
   env?: string | null;
   /** Auth token */
   token?: FunctionOrType<string>;
   /** Base URL for the API */
   baseUrl?: FunctionOrType<string>;
   /** Auth Cookie */
   cookie?: FunctionOrType<string>;
   fetch?: FunctionOrType<typeof fetch>;
}

/**
 * Helper to resolve a value that might be a function
 */
function resolve<T>(value: FunctionOrType<T>): T | undefined | null {
   if (value === undefined || value === null) return value;
   return typeof value === "function" ? (value as () => T)() : value;
}

// Initialize the oRPC client
export function orpc({
   provider,
   env,
   token,
   baseUrl,
   cookie,
   fetch: localFetch,
}: ORPCBuilder = {}): RouterClient<AppRouter> {
   return createORPCClient(
      new RPCLink({
         url: () => {
            const isServer = typeof globalThis.window === "undefined";

            if (isServer) {
               const resolvedBaseUrl = resolve(baseUrl);
               if (!resolvedBaseUrl) {
                  throw new Error("baseUrl is required on server-side");
               }
               return `${resolvedBaseUrl}/api/rpc`;
            }

            const resolvedBaseUrl =
               resolve(baseUrl) ?? globalThis.window.location.origin;
            return `${resolvedBaseUrl}/api/rpc`;
         },
         headers() {
            const headers = new Map<string, string>();

            const resolvedProvider = resolve(provider);
            const resolvedCookie = resolve(cookie);
            const resolvedToken = resolve(token);

            if (resolvedProvider)
               headers.set("x-orpc-source", resolvedProvider);
            if (resolvedCookie) headers.set("Cookie", resolvedCookie);
            if (resolvedToken)
               headers.set("Authorization", `Bearer ${resolvedToken}`);

            return Object.fromEntries(headers);
         },
         fetch: (req, init) => {
            if (env === "development") {
               console.log(`[oRPC] ${req.method} ${req.url}`);
            }

            const fetchFn = resolve(localFetch) ?? globalThis.fetch;
            return fetchFn(req, init);
         },
      }),
   );
}
