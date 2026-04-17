import { createSelectSchema } from "drizzle-zod";
import { z } from "zod";

import {
   screeningRequirements as screeningRequirementsTable,
   StaffRole,
   tournament as tournamentTable,
   tournamentContent as tournamentContentTable,
} from "@ota/db/schema";

import { tournamentPageThemeSchema } from "./tournament";
import type { tournamentThemeTokensSchema } from "./tournament";

const dashboardTournamentSchema = createSelectSchema(tournamentTable);

const dashboardContentSchema = createSelectSchema(tournamentContentTable, {
   theme: tournamentPageThemeSchema.nullable(),
});

const dashboardScreeningRequirementsSchema = createSelectSchema(
   screeningRequirementsTable,
);

const dashboardPersonPreviewSchema = z.object({
   id: z.number().int(),
   name: z.string(),
   image: z.string().nullable(),
});

const dashboardTeamPreviewSchema = z.object({
   id: z.number().int(),
   name: z.string(),
});

export const dashboardCustomizationCoverageIdSchema = z.enum([
   "body",
   "theme",
   "font",
]);

export const dashboardPermissionsSchema = z.object({
   canCustomizePage: z.boolean(),
   canManageTournament: z.boolean(),
   canViewStaffInsights: z.boolean(),
});

export const dashboardMetricsSchema = z.object({
   playerCount: z.number().int().nonnegative(),
   teamCount: z.number().int().nonnegative(),
   staffCount: z.number().int().nonnegative(),
   playerPreview: z.array(dashboardPersonPreviewSchema),
   teamPreview: z.array(dashboardTeamPreviewSchema),
   staffPreview: z.array(dashboardPersonPreviewSchema),
   customizationCoverage: z.array(
      z.object({
         id: dashboardCustomizationCoverageIdSchema,
         value: z.number().min(0).max(1),
      }),
   ),
   staffRoleCounts: z.array(
      z.object({
         role: z.nativeEnum(StaffRole),
         total: z.number().int().nonnegative(),
      }),
   ),
});

export const dashboardDataSchema = z.object({
   tournament: dashboardTournamentSchema,
   content: dashboardContentSchema.nullable(),
   renderedHtml: z.string(),
   screeningRequirements: dashboardScreeningRequirementsSchema.nullable(),
   roles: z.array(z.nativeEnum(StaffRole)),
   permissions: dashboardPermissionsSchema,
   metrics: dashboardMetricsSchema,
});

export const dashboardTabIdSchema = z.enum([
   "overview",
   "gfx",
   "pooling",
   "settings",
]);

const POOLING_ROLES = [
   StaffRole.POOLER,
   StaffRole.PLAYTESTER,
   StaffRole.ADMIN,
   StaffRole.HOST,
] as const;

const SETTINGS_ROLES = [StaffRole.ADMIN, StaffRole.HOST] as const;

export const DASHBOARD_TAB_IDS = dashboardTabIdSchema.options;

export type DashboardData = z.infer<typeof dashboardDataSchema>;
export type DashboardPermissions = z.infer<typeof dashboardPermissionsSchema>;
export type DashboardMetrics = z.infer<typeof dashboardMetricsSchema>;
export type DashboardTabId = z.infer<typeof dashboardTabIdSchema>;
export type DashboardThemeState = z.infer<typeof tournamentThemeTokensSchema>;

function hasAnyRole(roles: readonly StaffRole[], allowedRoles: readonly StaffRole[]) {
   return allowedRoles.some((role) => roles.includes(role));
}

export function getDashboardTabHref(
   tournamentId: string,
   tabId: DashboardTabId,
) {
   return tabId === "overview"
      ? `/dashboard/${tournamentId}`
      : `/dashboard/${tournamentId}/${tabId}`;
}

export function getDashboardTabFromPath(pathname: string): DashboardTabId {
   const lastSegment = pathname.split("/").filter(Boolean).at(-1);
   const parsedTabId = dashboardTabIdSchema.safeParse(lastSegment);

   return parsedTabId.success ? parsedTabId.data : "overview";
}

export function canAccessDashboardTab(
   tabId: DashboardTabId,
   roles: readonly StaffRole[],
   permissions: DashboardPermissions,
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
   return DASHBOARD_TAB_IDS.filter((tabId) =>
      canAccessDashboardTab(tabId, dashboard.roles, dashboard.permissions),
   ).map((tabId) => ({
      id: tabId,
      href: getDashboardTabHref(dashboard.tournament.id, tabId),
   }));
}
