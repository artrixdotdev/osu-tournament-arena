import { error } from "@sveltejs/kit";
import { client } from "$lib/server/orpc";

import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ params }) => {
   const tournament = await client.tournament.get({
      id: params.id,
   });

   if (!tournament) {
      error(404, "Tournament not found");
   }

   return {
      tournament,
   };
};
