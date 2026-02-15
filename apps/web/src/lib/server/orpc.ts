import { getRequestEvent } from "$app/server";

import type { appRouter } from "@ota/api/server";
import { orpc } from "@ota/api/client";

import type { RouterClient } from "@orpc/server";

if (typeof window !== "undefined") {
   throw new Error("This file should only be imported on the server");
}

const serverClient: RouterClient<typeof appRouter> = orpc({
   fetch() {
      return getRequestEvent().fetch;
   },
   baseUrl() {
      return getRequestEvent().url.origin;
   },
   cookie() {
      return getRequestEvent().cookies.get("session") ?? undefined;
   },
   provider: "server",
});

globalThis.$client = serverClient;
