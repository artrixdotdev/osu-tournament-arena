import { relations, sql } from "drizzle-orm";
import {
   check,
   index,
   integer,
   sqliteTable,
   text,
   unique,
} from "drizzle-orm/sqlite-core";

import { auditTimestamps, json } from "../../util";
import { tournament } from "./tournament";

export const TOURNAMENT_PAGE_BODY_MAX_LENGTH = 50000;
export const TOURNAMENT_PAGE_FONT_MAX_LENGTH = 120;

export interface TournamentThemeTokens {
   background?: string;
   foreground?: string;
   card?: string;
   cardForeground?: string;
   popover?: string;
   popoverForeground?: string;
   primary?: string;
   primaryForeground?: string;
   secondary?: string;
   secondaryForeground?: string;
   muted?: string;
   mutedForeground?: string;
   accent?: string;
   accentForeground?: string;
   destructive?: string;
   border?: string;
   input?: string;
   ring?: string;
}

export interface TournamentPageTheme {
   radius?: number | null;
   light?: TournamentThemeTokens | null;
   dark?: TournamentThemeTokens | null;
}

export const tournamentContent = sqliteTable(
   "tournament_content",
   {
      id: integer().primaryKey(),
      tournamentId: text()
         .notNull()
         .references(() => tournament.id, { onDelete: "cascade" }),
      body: text().notNull().default(""),
      fontFamily: text({ length: TOURNAMENT_PAGE_FONT_MAX_LENGTH }),
      theme: json<TournamentPageTheme>(),
      ...auditTimestamps,
   },
   (table) => [
      index("tournament_content_tournament_idx").on(table.tournamentId),
      unique("tournament_content_tournament_unique").on(table.tournamentId),
      check(
         "tournament_content_body_length_check",
         sql`length(${table.body}) <= ${sql.raw(String(TOURNAMENT_PAGE_BODY_MAX_LENGTH))}`,
      ),
      check(
         "tournament_content_font_length_check",
         sql`length(${table.fontFamily}) <= ${sql.raw(String(TOURNAMENT_PAGE_FONT_MAX_LENGTH))}`,
      ),
   ],
);

export const tournamentContentRelations = relations(
   tournamentContent,
   ({ one }) => ({
      tournament: one(tournament, {
         fields: [tournamentContent.tournamentId],
         references: [tournament.id],
      }),
   }),
);
