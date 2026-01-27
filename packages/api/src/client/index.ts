/**
 * This is the client-side code that uses the inferred types from the server
 */
import { createTRPCClient, httpBatchLink, loggerLink } from "@trpc/client";
import superjson from "superjson";

/**
 * We only import the `AppRouter` type from the server - this is not available at runtime
 */
import type { AppRouter } from "../server";

export interface TRPCBuilder {
   /** The application name, e.g. "desktop" or "web" */
   provider?: string;
   /** The environment, e.g. "development" or "production" */
   env?: string;
   /** Auth token */
   token?: string;
   /** Base URL for the API */
   baseUrl?: string;
}

// Initialize the tRPC client
export const trpc = ({ provider, env, token, baseUrl = "" }: TRPCBuilder) =>
   createTRPCClient<AppRouter>({
      links: [
         loggerLink({
            enabled: (opts) =>
               env === "development" ||
               (opts.direction === "down" && opts.result instanceof Error),
            colorMode: "ansi",
         }),
         httpBatchLink({
            transformer: superjson,
            url: `${baseUrl}/api/trpc`,
            headers() {
               const headers = new Map<string, string>();

               if (provider) headers.set("x-trpc-source", provider);
               if (token) headers.set("Authorization", `Bearer ${token}`);

               return Object.fromEntries(headers);
            },
         }),
      ],
   });
