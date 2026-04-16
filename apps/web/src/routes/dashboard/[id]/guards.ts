import type { DashboardTabId } from "./(views)/shared/access";
import type { DashboardData } from "./(views)/shared/types";
import { error } from "@sveltejs/kit";
import { canAccessDashboardTab } from "./(views)/shared/access";

export function assertDashboardTabAccess(
   dashboard: DashboardData,
   tabId: DashboardTabId,
) {
   if (canAccessDashboardTab(tabId, dashboard.roles, dashboard.permissions)) {
      return;
   }

   error(403, `You do not have access to the ${tabId} dashboard`);
}
