import { error } from "@sveltejs/kit";

import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ locals, params }) => {
   const rpc = $client;
   if (!rpc) {
      return;
   }

   let canManage = false;
   let pageData = null;

   if (locals.user) {
      try {
         const dashboard = await rpc.tournament.getDashboard({ id: params.id });
         pageData = {
            tournament: dashboard.tournament,
            content: dashboard.content,
         };
         canManage = true;
      } catch {
         pageData = null;
      }
   }

   if (!pageData) {
      pageData = await rpc.tournament.getContent({ id: params.id });
   }

   if (!pageData) {
      error(404, "Tournament not found");
   }

   return {
      canManage,
      tournament: pageData.tournament,
      content: pageData.content,
   };
};
