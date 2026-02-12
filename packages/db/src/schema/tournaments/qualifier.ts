/**
 * @fileoverview
 * Qualifier system - seeding tournament through preliminary lobbies.
 * Manages qualifier lobby scheduling and team participation.
 */

import { relations } from "drizzle-orm";
import {
   index,
   integer,
   sqliteTable,
   text,
   unique,
} from "drizzle-orm/sqlite-core";

import { boolean, enumurate, timestamp } from "../../util";
import { mappool } from "./mappool";
import { staff } from "./staff";
import { team } from "./team";
import { tournament } from "./tournament";
import { QualifierLobbyStatus } from "./types";

/**
 * Qualifier lobby table - preliminary rounds for seeding.
 *
 * **Workflow:**
 * 1. Lobbies created with SCHEDULED status
 * 2. Teams sign up via qualifierParticipant
 * 3. Referee starts lobby → IN_PROGRESS
 * 4. All maps played → COMPLETED
 * 5. Scores used to determine seeds
 *
 * **Lobby Management:**
 * - maxParticipants enforces size limits (default 16)
 * - osuMatchId links to actual osu! multiplayer lobby
 * - Multiple lobbies created for different time zones
 *
 * **Referee Assignment:**
 * - Referees volunteer or are assigned
 * - NULL refereeId means lobby needs referee
 *
 * @example
 * ```ts
 * const lobby = {
 *   id: "lobby_123",
 *   tournamentId: "owc2026",
 *   mappoolId: "pool_quals",
 *   name: "Qualifier Lobby #1",
 *   scheduledAt: new Date("2026-02-15T14:00:00Z"),
 *   maxParticipants: 16,
 *   refereeId: "staff_456",
 *   status: "SCHEDULED"
 * };
 * ```
 */
export const qualifierLobby = sqliteTable(
   "qualifier_lobby",
   {
      id: text().primaryKey(),
      tournamentId: text().notNull(),
      mappoolId: text().notNull(),

      /** Display name for lobby */
      name: text().notNull(),

      /** When lobby is scheduled to start */
      scheduledAt: timestamp().notNull(),

      /** Current lobby status */
      status: enumurate(QualifierLobbyStatus)
         .notNull()
         .default(QualifierLobbyStatus.SCHEDULED),

      /** Assigned referee */
      refereeId: text(),

      /** osu! multiplayer lobby ID */
      osuMatchId: integer(),

      /** Maximum teams allowed */
      maxParticipants: integer().notNull().default(16),

      /** Additional notes or instructions */
      notes: text(),

      /** When lobby actually started */
      startedAt: timestamp(),

      /** When all maps were completed */
      completedAt: timestamp(),

      createdAt: timestamp().notNull(),
      updatedAt: timestamp().notNull(),
   },
   (table) => [
      index("qualifier_lobby_tournament_idx").on(table.tournamentId),
      index("qualifier_lobby_mappool_idx").on(table.mappoolId),
      index("qualifier_lobby_scheduled_idx").on(table.scheduledAt),
   ],
);

/**
 * Qualifier lobby relationships.
 */
export const qualifierLobbyRelations = relations(
   qualifierLobby,
   ({ one, many }) => ({
      tournament: one(tournament, {
         fields: [qualifierLobby.tournamentId],
         references: [tournament.id],
      }),
      mappool: one(mappool, {
         fields: [qualifierLobby.mappoolId],
         references: [mappool.id],
      }),
      referee: one(staff, {
         fields: [qualifierLobby.refereeId],
         references: [staff.id],
      }),
      participants: many(qualifierParticipant),
   }),
);

/**
 * Qualifier participant table - team signups for lobbies.
 *
 * **Registration Flow:**
 * 1. Team signs up for lobby → participant created
 * 2. attended defaults to false
 * 3. After lobby completes → attended updated
 * 4. No-shows can be tracked and penalized
 *
 * **Constraints:**
 * - Unique (lobbyId, teamId): Teams cannot double-register
 * - Check maxParticipants before allowing signup
 *
 * @example
 * ```ts
 * const participant = {
 *   lobbyId: "lobby_123",
 *   teamId: "team_456",
 *   attended: true
 * };
 * ```
 */
export const qualifierParticipant = sqliteTable(
   "qualifier_participant",
   {
      id: text().primaryKey(),
      lobbyId: text().notNull(),
      teamId: text().notNull(),

      /** Whether team showed up and played */
      attended: boolean().notNull().default(false),

      createdAt: timestamp().notNull(),
   },
   (table) => [
      index("qualifier_participant_lobby_idx").on(table.lobbyId),
      index("qualifier_participant_team_idx").on(table.teamId),
      unique("qualifier_participant_lobby_team_unique").on(
         table.lobbyId,
         table.teamId,
      ),
   ],
);

/**
 * Qualifier participant relationships.
 */
export const qualifierParticipantRelations = relations(
   qualifierParticipant,
   ({ one }) => ({
      lobby: one(qualifierLobby, {
         fields: [qualifierParticipant.lobbyId],
         references: [qualifierLobby.id],
      }),
      team: one(team, {
         fields: [qualifierParticipant.teamId],
         references: [team.id],
      }),
   }),
);
