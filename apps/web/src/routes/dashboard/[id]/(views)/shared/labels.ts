import { StaffRole } from "@ota/db/schema";

import { m } from "$i18n/messages";

import type { DashboardData } from "./types";

export function getDashboardVisibilityLabel(dashboard: DashboardData) {
   if (dashboard.tournament.isArchived) {
      return m.common_archived();
   }

   return dashboard.tournament.isPublic ? m.common_public() : m.common_private();
}

export function getDashboardRoleLabel(role: StaffRole) {
   switch (role) {
      case StaffRole.COMMENTATOR:
         return m.tournamentDashboard_role_COMMENTATOR();
      case StaffRole.REFEREE:
         return m.tournamentDashboard_role_REFEREE();
      case StaffRole.PLAYTESTER:
         return m.tournamentDashboard_role_PLAYTESTER();
      case StaffRole.POOLER:
         return m.tournamentDashboard_role_POOLER();
      case StaffRole.ADMIN:
         return m.tournamentDashboard_role_ADMIN();
      case StaffRole.HOST:
         return m.tournamentDashboard_role_HOST();
   }
}
