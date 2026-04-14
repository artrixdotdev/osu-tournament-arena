import { error } from "@sveltejs/kit";
import { client } from "$lib/server/orpc";

import { tournamentIdSchema } from "@ota/validators";

import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ params, locals }) => {
   if (!tournamentIdSchema.safeParse({ id: params.id }).success) {
      // Invalid tournament ID
      error(404, "Tournament not found");
   }

   const [tournament, pageContent] = await Promise.all([
      client.tournament.get({
         id: params.id,
      }),
      client.tournament.getContent({
         id: params.id,
      }),
   ]);

   if (tournament) {
      return {
         tournament,
         pageContent,
         isStaffView: false,
      };
   }

   if (!locals.user) {
      error(404, "Tournament not found");
   }

   try {
      const dashboard = await client.tournament.getDashboard({
         id: params.id,
      });

      return {
         tournament: dashboard.tournament,
         pageContent: {
            content: dashboard.content,
            renderedHtml: dashboard.renderedHtml,
         },
         isStaffView: true,
      };
   } catch (cause) {
      const code = (cause as { code?: string }).code;

      if (code === "NOT_FOUND" || code === "FORBIDDEN") {
         error(404, "Tournament not found");
      }

      throw cause;
   }
};
