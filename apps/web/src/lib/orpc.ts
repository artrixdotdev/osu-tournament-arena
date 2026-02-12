import type { appRouter } from "@ota/api/server";
import { orpc } from "@ota/api/client";

import type { RouterClient } from "@orpc/server";

declare global {
   var $client: RouterClient<typeof appRouter> | undefined;
}

export const client: RouterClient<typeof appRouter> =
   globalThis.$client ??
   orpc({
      provider: "web",
   });
