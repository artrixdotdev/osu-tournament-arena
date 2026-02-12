import { onError } from "@orpc/server";
import { RPCHandler } from "@orpc/server/fetch";
import { error } from "@sveltejs/kit";

import { appRouter } from "@ota/api/server";

import type { RequestHandler } from "./$types";

const handler = new RPCHandler(appRouter, {
   interceptors: [
      onError((error) => {
         console.error(error);
      }),
   ],
});

const handle: RequestHandler = async ({ request }) => {
   const { response } = await handler.handle(request, {
      prefix: "/api/rpc",
      context: {},
   });

   return response ?? error(404, "Not Found");
};

export const GET = handle;
export const POST = handle;
export const PUT = handle;
export const PATCH = handle;
export const DELETE = handle;
