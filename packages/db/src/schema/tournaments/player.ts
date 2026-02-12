/**
 * @fileoverview
 * Player entity and availability tracking.
 * Links users to tournaments and manages scheduling preferences.
 */

import { relations } from "drizzle-orm";
import { index, sqliteTable, text, unique } from "drizzle-orm/sqlite-core";

import type { TimeSlot } from "./types";
import { boolean, json, timestamp } from "../../util";
import { user } from "../auth";
import { round } from "./bracket";
import { screening } from "./screening";
import { team } from "./team";
import { tournament } from "./tournament";

/**
 * Player table - links users to tournament participation.
 *
 * **Important Constraints:**
 * - Unique (userId, tournamentId): Users can only register once per tournament
 * - Foreign key to team: Players can be assigned to teams or remain free agents
 *
 * **Index Performance:**
 * - `player_tournament_team_idx`: Optimizes team roster queries
 * - `player_user_idx`: Fast lookup of user's tournament history
 *
 * @example
 * ```ts
 * const player = {
 *   id: "player_123",
 *   userId: "user_456",
 *   tournamentId: "owc2026",
 *   teamId: "team_789",
 *   isCaptain: true,
 *   name: "PlayerName"
 * };
 * ```
 */
export const player = sqliteTable(
   "player",
   {
      id: text().primaryKey(),

      /** Display name for the tournament */
      name: text().notNull(),

      createdAt: timestamp().notNull(),
      updatedAt: timestamp().notNull(),

      tournamentId: text().notNull(),

      /** NULL if player is a free agent */
      teamId: text(),

      /** Reference to authenticated user */
      userId: text().notNull(),

      /** Whether player is team captain */
      isCaptain: boolean().notNull().default(false),
   },
   (table) => [
      index("player_tournament_idx").on(table.tournamentId),
      index("player_team_idx").on(table.teamId),
      index("player_user_idx").on(table.userId),
      index("player_tournament_team_idx").on(table.tournamentId, table.teamId),
      unique("player_user_tournament_unique").on(
         table.userId,
         table.tournamentId,
      ),
   ],
);

/**
 * Player relationships.
 */
export const playerRelations = relations(player, ({ one, many }) => ({
   tournament: one(tournament, {
      fields: [player.tournamentId],
      references: [tournament.id],
   }),
   team: one(team, {
      fields: [player.teamId],
      references: [team.id],
   }),
   user: one(user, {
      fields: [player.userId],
      references: [user.id],
   }),
   availability: many(playerAvailability),
   screening: one(screening),
}));

/**
 * Player availability table - tracks when players can compete.
 *
 * **Use Cases:**
 * - Match scheduling automation
 * - Finding optimal match times for both teams
 * - Referee assignment based on availability
 *
 * **Constraints:**
 * - Unique (playerId, roundId): One availability record per player per round
 *
 * @example
 * ```ts
 * const availability = {
 *   playerId: "player_123",
 *   roundId: "round_456",
 *   timeSlots: [
 *     { start: "2026-02-15T14:00:00Z", end: "2026-02-15T18:00:00Z" },
 *     { start: "2026-02-16T14:00:00Z", end: "2026-02-16T18:00:00Z" }
 *   ]
 * };
 * ```
 */
export const playerAvailability = sqliteTable(
   "player_availability",
   {
      id: text().primaryKey(),
      playerId: text().notNull(),
      roundId: text().notNull(),

      /** Array of available time windows */
      timeSlots: json<TimeSlot[]>().notNull().default([]),

      createdAt: timestamp().notNull(),
      updatedAt: timestamp().notNull(),
   },
   (table) => [
      index("player_availability_player_idx").on(table.playerId),
      index("player_availability_round_idx").on(table.roundId),
      unique("player_availability_unique").on(table.playerId, table.roundId),
   ],
);

/**
 * Player availability relationships.
 */
export const playerAvailabilityRelations = relations(
   playerAvailability,
   ({ one }) => ({
      player: one(player, {
         fields: [playerAvailability.playerId],
         references: [player.id],
      }),
      round: one(round, {
         fields: [playerAvailability.roundId],
         references: [round.id],
      }),
   }),
);
