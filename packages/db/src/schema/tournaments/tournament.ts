/**
 * @fileoverview
 * Tournament entity - the root table for all tournament data.
 * Every other entity in the system references a tournament.
 */

import { relations } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

import type { TournamentDiscord } from "./types";
import { boolean, json, timestamp } from "../../util";
import { bracket } from "./bracket";
import { mappool } from "./mappool";
import { player } from "./player";
import { qualifierLobby } from "./qualifier";
import { screening } from "./screening";
import { staff } from "./staff";
import { team } from "./team";

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
export const tournament = sqliteTable("tournament", {
   id: text().primaryKey(),
   name: text().notNull(),

   /** Short identifier (max 4 chars) */
   acronym: text({ length: 4 }),

   /** Edition number (e.g., 16 for OWC 2026) */
   rendition: integer(),

   /** Brief description shown on tournament page */
   description: text({ length: 255 }).notNull(),

   /** Tournament start date */
   startDate: timestamp().notNull(),

   /** Tournament end date */
   endDate: timestamp().notNull(),

   /** Whether tournament is visible to public */
   isPublic: boolean().notNull(),

   /** Whether tournament is archived (read-only) */
   isArchived: boolean().notNull(),

   /** Soft deletion flag */
   isDeleted: boolean().notNull(),

   createdAt: timestamp().notNull(),
   updatedAt: timestamp().notNull(),

   // Tournament Settings
   /** Maximum players per lobby */
   lobbySize: integer().notNull(),

   /** Maximum players per team */
   teamSize: integer().notNull(),

   /** Discord bot integration settings */
   discord: json<TournamentDiscord>(),
});

/**
 * Tournament relationships.
 * Defines one-to-many connections with child entities.
 */
export const tournamentRelations = relations(tournament, ({ many }) => ({
   teams: many(team),
   players: many(player),
   brackets: many(bracket),
   mappools: many(mappool),
   staff: many(staff),
   screenings: many(screening),
   qualifierLobbies: many(qualifierLobby),
}));
