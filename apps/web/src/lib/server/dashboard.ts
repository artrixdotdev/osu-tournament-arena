import { error } from "@sveltejs/kit";

import { canAccessDashboardTab } from "@ota/validators";
import type { DashboardData, DashboardTabId } from "@ota/validators";

export function assertDashboardTabAccess(
   dashboard: DashboardData,
   tabId: DashboardTabId,
) {
   if (canAccessDashboardTab(tabId, dashboard.roles, dashboard.permissions)) {
      return;
   }

   error(403, `You do not have access to the ${tabId} dashboard`);
}

export function createDashboardTabGuardLoad(tabId: DashboardTabId) {
   return async ({
      parent,
   }: {
      parent: () => Promise<{ dashboard: DashboardData }>;
   }) => {
      const { dashboard } = await parent();

      assertDashboardTabAccess(dashboard, tabId);

      return {};
   };
}
