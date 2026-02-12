/**
 * This is the client-side code that uses the inferred types from the server
 */
import { createORPCClient } from "@orpc/client";
import { RPCLink } from "@orpc/client/fetch";
import { RouterClient } from "@orpc/server";

/**
 * We only import the `AppRouter` type from the server - this is not available at runtime
 */
import type { AppRouter } from "../server";

export interface ORPCBuilder {
   /** The application name, e.g. "desktop" or "web" */
   provider?: string;
   /** The environment, e.g. "development" or "production" */
   env?: string;
   /** Auth token */
   token?: string;
   /** Base URL for the API */
   baseUrl?: string;
   /** Auth Cookie */
   cookie?: string;
}

// Initialize the oRPC client
export function orpc({
   provider,
   env,
   token,
   baseUrl = "",
   cookie,
}: ORPCBuilder): RouterClient<AppRouter> {
   return createORPCClient(
      new RPCLink({
         url: `${baseUrl}/api/rpc`,
         headers() {
            const headers = new Map<string, string>();

            if (provider) headers.set("x-orpc-source", provider);
            if (cookie) headers.set("Cookie", cookie);
            if (token) headers.set("Authorization", `Bearer ${token}`);

            return Object.fromEntries(headers);
         },
         fetch: (req, init) => {
            if (env === "development") {
               console.log(`[oRPC] ${req.method} ${req.url}`);
            }
            return fetch(req, init);
         },
      }),
   );
}
