import type { PageServerLoad } from "./$types";
import { assertDashboardTabAccess } from "../guards";

export const load: PageServerLoad = async ({ parent }) => {
   const { dashboard } = await parent();

   assertDashboardTabAccess(dashboard, "gfx");

   return {};
};
