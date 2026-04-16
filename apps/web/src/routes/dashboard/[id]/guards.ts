import type { DashboardTabId } from "$lib/features/dashboard/access";
import type { DashboardData } from "$lib/features/dashboard/types";
import { error } from "@sveltejs/kit";
import { canAccessDashboardTab } from "$lib/features/dashboard/access";

export function assertDashboardTabAccess(
   dashboard: DashboardData,
   tabId: DashboardTabId,
) {
   if (canAccessDashboardTab(tabId, dashboard.roles, dashboard.permissions)) {
      return;
   }

   error(403, `You do not have access to the ${tabId} dashboard`);
}
