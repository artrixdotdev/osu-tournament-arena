import { error } from "@sveltejs/kit";

import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ locals, params }) => {
   const rpc = $client;

   if (!rpc) {
      error(500, "RPC client unavailable");
   }

   if (!locals.user) {
      error(403, "Sign in required");
   }

   try {
      const dashboard = await rpc.tournament.getDashboard({ id: params.id });

      return {
         dashboard,
      };
   } catch {
      const tournament = await rpc.tournament.get({ id: params.id });

      if (!tournament) {
         error(404, "Tournament not found");
      }

      error(403, "You do not have access to this dashboard");
   }
};
