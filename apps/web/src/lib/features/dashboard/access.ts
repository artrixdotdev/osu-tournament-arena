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

interface DashboardTabDefinition {
   id: DashboardTabId;
   label: string;
   description: string;
}

const POOLING_ROLES = [
   StaffRole.POOLER,
   StaffRole.PLAYTESTER,
   StaffRole.ADMIN,
   StaffRole.HOST,
] as const;

const SETTINGS_ROLES = [StaffRole.ADMIN, StaffRole.HOST] as const;

const DASHBOARD_TABS: DashboardTabDefinition[] = [
   {
      id: "overview",
      label: "Overview",
      description: "Tournament health, staffing, and readiness at a glance.",
   },
   {
      id: "gfx",
      label: "GFX",
      description: "Public page copy, theming, and presentation controls.",
   },
   {
      id: "pooling",
      label: "Pooling",
      description: "Beatmap and testing workflows for pool-focused staff.",
   },
   {
      id: "settings",
      label: "Settings",
      description: "Tournament-level administrative controls and policy.",
   },
];

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
      ...tab,
      href: getDashboardTabHref(dashboard.tournament.id, tab.id),
   }));
}

export function getDashboardVisibilityLabel(dashboard: DashboardData) {
   if (dashboard.tournament.isArchived) {
      return "Archived";
   }

   return dashboard.tournament.isPublic ? "Public" : "Private";
}

export function getRoleLabel(role: StaffRole) {
   switch (role) {
      case StaffRole.COMMENTATOR:
         return "Commentator";
      case StaffRole.REFEREE:
         return "Referee";
      case StaffRole.PLAYTESTER:
         return "Playtester";
      case StaffRole.POOLER:
         return "Pooler";
      case StaffRole.ADMIN:
         return "Admin";
      case StaffRole.HOST:
         return "Host";
   }
}
