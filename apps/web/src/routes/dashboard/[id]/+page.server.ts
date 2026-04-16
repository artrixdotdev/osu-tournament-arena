import { error, redirect } from "@sveltejs/kit";
import { client } from "$lib/server/orpc";

import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ params, locals }) => {
   if (!locals.user) {
      redirect(302, "/signup");
   }

   try {
      const dashboard = await client.tournament.getDashboard({
         id: params.id,
      });

      return {
         dashboard,
      };
   } catch (cause) {
      const code = (cause as { code?: string }).code;

      if (code === "NOT_FOUND") {
         error(404, "Tournament not found");
      }

      if (code === "FORBIDDEN") {
         error(403, "You do not have access to this dashboard");
      }

      throw cause;
   }
};
