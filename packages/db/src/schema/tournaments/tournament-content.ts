import { relations, sql } from "drizzle-orm";
import { check, index, integer, sqliteTable, text, unique } from "drizzle-orm/sqlite-core";

import { auditTimestamps, json } from "../../util";
import { tournament } from "./tournament";

export const TOURNAMENT_BODY_MAX_LENGTH = 20000;
export const TOURNAMENT_FONT_FAMILY_MAX_LENGTH = 100;

export interface TournamentThemeColors {
   background?: string;
   foreground?: string;
   card?: string;
   cardForeground?: string;
   primary?: string;
   primaryForeground?: string;
   secondary?: string;
   secondaryForeground?: string;
   muted?: string;
   mutedForeground?: string;
   accent?: string;
   accentForeground?: string;
   border?: string;
   input?: string;
   ring?: string;
}

export const tournamentContent = sqliteTable(
   "tournament_content",
   {
      id: integer().primaryKey(),
      tournamentId: text()
         .notNull()
         .references(() => tournament.id, { onDelete: "cascade" }),
      body: text().notNull().default(""),
      fontFamily: text({ length: TOURNAMENT_FONT_FAMILY_MAX_LENGTH }),
      themeColors: json<TournamentThemeColors>(),
      ...auditTimestamps,
   },
   (table) => [
      index("tournament_content_tournament_idx").on(table.tournamentId),
      unique("tournament_content_tournament_unique").on(table.tournamentId),
      check(
         "tournament_content_body_len_check",
         sql`length(${table.body}) <= ${sql.raw(String(TOURNAMENT_BODY_MAX_LENGTH))}`,
      ),
      check(
         "tournament_content_font_len_check",
         sql`length(${table.fontFamily}) <= ${sql.raw(String(TOURNAMENT_FONT_FAMILY_MAX_LENGTH))}`,
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
