import { error } from "@sveltejs/kit";

import { orpc } from "@ota/api/client";

import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({
   cookies,
   fetch,
   locals,
   params,
   url,
}) => {
   const rpc = orpc({
      provider: "server",
      baseUrl: url.origin,
      fetch,
      cookie: cookies.get("session") ?? undefined,
   });

   let canEdit = false;
   let pageData = await rpc.tournament.getContent({ id: params.id });

   if (locals.user) {
      try {
         pageData = await rpc.tournament.getContentForStaff({ id: params.id });
         canEdit = true;
      } catch {
         // Non-staff users can still view public tournaments.
      }
   }

   if (!pageData) {
      error(404, "Tournament not found");
   }

   return {
      canEdit,
      tournament: pageData.tournament,
      content: pageData.content,
   };
};
