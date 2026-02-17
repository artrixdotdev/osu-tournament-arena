import { OpenAPIHandler } from "@orpc/openapi/fetch";
import { onError } from "@orpc/server";
import { RequestHeadersPlugin } from "@orpc/server/plugins";
import { error } from "@sveltejs/kit";

import { appRouter } from "@ota/api/server";

import type { RequestHandler } from "./$types";

const handler = new OpenAPIHandler(appRouter, {
   interceptors: [onError(console.error)],
   plugins: [new RequestHeadersPlugin()],
});

const handle: RequestHandler = async ({ request }) => {
   const { matched, response } = await handler.handle(request, {
      prefix: "/api",
      context: {},
   });

   if (matched) {
      return response;
   }

   return error(404, "Not Found");
};

export const GET = handle;
export const POST = handle;
export const PUT = handle;
export const PATCH = handle;
export const DELETE = handle;
