/**
 * @fileoverview
 * Team entity and related tables.
 * Handles team registration, seeding, and Discord integration.
 */

import { relations } from "drizzle-orm";
import {
   index,
   integer,
   sqliteTable,
   text,
   unique,
} from "drizzle-orm/sqlite-core";

import type { TeamDiscord } from "./types";
import { boolean, json, timestamp } from "../../util";
import { player } from "./player";
import { qualifierParticipant } from "./qualifier";
import { tournament } from "./tournament";

/**
 * Team table - represents competing teams.
 *
 * **Indexing Strategy:**
 * - `team_tournament_idx`: Most common query pattern (list by tournament)
 * - `team_seed_idx`: Bracket generation and seeding display
 * - Unique constraint on (name, tournamentId) prevents duplicate team names
 *
 * **Seeding:**
 * - Seed is typically assigned after qualifiers
 * - Lower seed number = higher ranking
 * - NULL seed indicates team has not qualified yet
 *
 * @example
 * ```ts
 * const team = {
 *   id: "team_123",
 *   name: "Team Awesome",
 *   seed: 1,
 *   tournamentId: "owc2026",
 *   isEliminated: false
 * };
 * ```
 */
export const team = sqliteTable(
   "team",
   {
      id: text().primaryKey(),
      name: text().notNull(),

      /** Ranking position after qualifiers (1 = highest seed) */
      seed: integer(),

      /** Whether team has been eliminated from bracket */
      isEliminated: boolean().notNull().default(false),

      createdAt: timestamp().notNull(),
      updatedAt: timestamp().notNull(),

      tournamentId: text().notNull(),

      /** Discord channel and role assignment */
      discord: json<TeamDiscord>(),
   },
   (table) => [
      index("team_tournament_idx").on(table.tournamentId),
      index("team_seed_idx").on(table.seed),
      unique("team_name_tournament_unique").on(table.name, table.tournamentId),
   ],
);

/**
 * Team relationships.
 */
export const teamRelations = relations(team, ({ one, many }) => ({
   tournament: one(tournament, {
      fields: [team.tournamentId],
      references: [tournament.id],
   }),
   players: many(player),
   qualifierParticipants: many(qualifierParticipant),
}));
