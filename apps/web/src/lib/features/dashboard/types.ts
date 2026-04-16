import type {
   StaffRole,
   TournamentPageTheme,
   TournamentThemeTokens,
} from "@ota/db/schema";

export interface DashboardData {
   tournament: {
      id: string;
      name: string;
      acronym: string | null;
      description: string | null;
      iconUrl: string | null;
      isPublic: boolean;
      isArchived: boolean;
   };
   content: {
      body: string;
      fontFamily: string | null;
      theme: TournamentPageTheme | null;
   } | null;
   renderedHtml: string;
   screeningRequirements: {
      minimumRank: number | null;
      maximumRank: number | null;
      useBws: boolean | null;
   } | null;
   roles: StaffRole[];
   permissions: {
      canCustomizePage: boolean;
      canManageTournament: boolean;
      canViewStaffInsights: boolean;
   };
   metrics: {
      playerCount: number;
      teamCount: number;
      staffCount: number;
      customizationCoverage: {
         id: string;
         value: number;
      }[];
      staffRoleCounts: {
         role: StaffRole;
         total: number;
      }[];
   };
}

export type DashboardThemeState = Partial<TournamentThemeTokens>;
