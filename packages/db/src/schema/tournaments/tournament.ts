/**
 * @fileoverview
 * Tournament entity - the root table for all tournament data.
 * Every other entity in the system references a tournament.
 */

import { relations, sql } from "drizzle-orm";
import {
   check,
   index,
   integer,
   sqliteTable,
   text,
} from "drizzle-orm/sqlite-core";

import type { TournamentDiscord } from "./types";
import {
   auditTimestamps,
   boolean,
   json,
   positiveCheck,
   timestamp,
} from "../../util";
import { bracket } from "./bracket";
import { mappool } from "./mappool";
import { player } from "./player";
import { qualifierLobby } from "./qualifier";
import { screening } from "./screening";
import { staff } from "./staff";
import { team } from "./team";
import { tournamentContent } from "./tournament-content";

export const TOURNAMENT_ACRONYM_MAX_LENGTH = 6;
export const TOURNAMENT_LOGO_URL_MAX_LENGTH = 1024;

/**
 * Tournament table - central entity for organizing competitive events.
 *
 * **Performance Considerations:**
 * - Most queries filter by tournamentId across all child tables
 * - Soft deletion (isDeleted) prevents cascade issues
 * - Archival (isArchived) separates active tournaments for faster queries
 *
 * **Key Relationships:**
 * - Parent to: teams, players, brackets, mappools, staff, screenings, qualifiers
 *
 * @example
 * ```ts
 * const tournament = {
 *   id: "owc2026",
 *   name: "osu! World Cup 2026",
 *   acronym: "OWC",
 *   rendition: 16,
 *   teamSize: 8,
 *   lobbySize: 16
 * };
 * ```
 */
export const tournament = sqliteTable(
   "tournament",
   {
      id: text().primaryKey(),
      name: text().notNull(),

      /** Short identifier (max 6 chars) */
      acronym: text({ length: TOURNAMENT_ACRONYM_MAX_LENGTH }),

      /** Edition number (e.g., 16 for OWC 2026) */
      rendition: integer(),

      /** Brief description shown on tournament page */
      description: text({ length: 255 }),

      /** Optional tournament logo URL */
      logo: text({ length: TOURNAMENT_LOGO_URL_MAX_LENGTH }),

      /** Tournament start date */
      startDate: timestamp().notNull(),

      /** Tournament end date */
      endDate: timestamp().notNull(),

      /** Whether tournament is visible to public */
      isPublic: boolean().notNull().default(false),

      /** Whether tournament is archived (read-only) */
      isArchived: boolean().notNull().default(false),

      /** Soft deletion flag */
      isDeleted: boolean().notNull().default(false),

      // Tournament Settings
      /** Maximum players per lobby */
      lobbySize: integer().notNull(),

      /** Maximum players per team */
      teamSize: integer().notNull(),

      /** Discord bot integration settings */
      discord: json<TournamentDiscord>(),

      ...auditTimestamps,
   },
   (table) => [
      check(
         "tournament_acronym_len_check",
         sql`length(${table.acronym}) <= ${sql.raw(String(TOURNAMENT_ACRONYM_MAX_LENGTH))}`,
      ),
      positiveCheck("tournaments_lobby_size_positive", table.lobbySize),
      positiveCheck("tournaments_team_size_positive", table.teamSize),
      positiveCheck("tournaments_rendition_positive", table.rendition),
      check(
         "tournaments_dates_ordering",
         sql`${table.startDate} <= ${table.endDate}`,
      ),
      check(
         "tournaments_description_len_check",
         sql`length(${table.description}) <= 255`,
      ),
      check(
         "tournaments_logo_len_check",
         sql`length(${table.logo}) <= ${sql.raw(String(TOURNAMENT_LOGO_URL_MAX_LENGTH))}`,
      ),
      index("tournament_deleted_startdate_idx").on(
         table.isDeleted,
         table.startDate,
      ),
      index("tournament_archived_startdate_idx").on(
         table.isArchived,
         table.startDate,
      ),
      index("tournament_public_startdate_idx").on(
         table.isPublic,
         table.startDate,
      ),
      index("tournament_dates_idx").on(table.startDate, table.endDate),
   ],
);

/**
 * Tournament relationships.
 * Defines one-to-many connections with child entities.
 */
export const tournamentRelations = relations(tournament, ({ many, one }) => ({
   teams: many(team),
   players: many(player),
   brackets: many(bracket),
   mappools: many(mappool),
   staff: many(staff),
   screenings: many(screening),
   qualifierLobbies: many(qualifierLobby),
   content: one(tournamentContent),
}));
