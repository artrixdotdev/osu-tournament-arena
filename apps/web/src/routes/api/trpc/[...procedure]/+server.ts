import { fetchRequestHandler } from "@trpc/server/adapters/fetch";

import { appRouter } from "@ota/api/server";

import type { RequestHandler } from "./$types";

export const GET: RequestHandler = (event) => {
   return fetchRequestHandler({
      endpoint: "/api/trpc",
      req: event.request,
      router: appRouter,
   });
};

export const POST = GET;
