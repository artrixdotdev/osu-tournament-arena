import { StaffRole } from "@ota/db/schema";

import type { DashboardData } from "./types";

export const DASHBOARD_TAB_IDS = [
   "overview",
   "gfx",
   "pooling",
   "settings",
] as const;

export type DashboardTabId = (typeof DASHBOARD_TAB_IDS)[number];

type DashboardPermissionSnapshot = DashboardData["permissions"];

const POOLING_ROLES = [
   StaffRole.POOLER,
   StaffRole.PLAYTESTER,
   StaffRole.ADMIN,
   StaffRole.HOST,
] as const;

const SETTINGS_ROLES = [StaffRole.ADMIN, StaffRole.HOST] as const;

const DASHBOARD_TABS = [
   { id: "overview" },
   { id: "gfx" },
   { id: "pooling" },
   { id: "settings" },
] satisfies { id: DashboardTabId }[];

function hasAnyRole(roles: StaffRole[], allowedRoles: readonly StaffRole[]) {
   return allowedRoles.some((role) => roles.includes(role));
}

export function getDashboardTabHref(
   tournamentId: string,
   tabId: DashboardTabId,
) {
   if (tabId === "overview") {
      return `/dashboard/${tournamentId}`;
   }

   return `/dashboard/${tournamentId}/${tabId}`;
}

export function getDashboardTabFromPath(pathname: string): DashboardTabId {
   if (pathname.endsWith("/gfx")) {
      return "gfx";
   }

   if (pathname.endsWith("/pooling")) {
      return "pooling";
   }

   if (pathname.endsWith("/settings")) {
      return "settings";
   }

   return "overview";
}

export function canAccessDashboardTab(
   tabId: DashboardTabId,
   roles: StaffRole[],
   permissions: DashboardPermissionSnapshot,
) {
   switch (tabId) {
      case "overview":
         return roles.length > 0;
      case "gfx":
         return permissions.canCustomizePage;
      case "pooling":
         return hasAnyRole(roles, POOLING_ROLES);
      case "settings":
         return (
            permissions.canManageTournament || hasAnyRole(roles, SETTINGS_ROLES)
         );
   }
}

export function getVisibleDashboardTabs(dashboard: DashboardData) {
   return DASHBOARD_TABS.filter((tab) =>
      canAccessDashboardTab(tab.id, dashboard.roles, dashboard.permissions),
   ).map((tab) => ({
      id: tab.id,
      href: getDashboardTabHref(dashboard.tournament.id, tab.id),
   }));
}
