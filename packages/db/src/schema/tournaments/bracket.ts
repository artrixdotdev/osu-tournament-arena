/**
 * @fileoverview
 * Bracket, round, and match system.
 * Handles tournament progression, match scheduling, and results tracking.
 */

import { relations } from "drizzle-orm";
import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

import { boolean, enumurate, timestamp } from "../../util";
import { map, mappool } from "./mappool";
import { playerAvailability } from "./player";
import { refereeAvailability, staff } from "./staff";
import { team } from "./team";
import { tournament } from "./tournament";
import {
   BracketSide,
   BracketType,
   MatchStatus,
   PickBanAction,
   TeamColor,
} from "./types";

/**
 * Bracket table - tournament progression structure.
 *
 * **Bracket Types:**
 * - Single Elimination: One loss = elimination
 * - Double Elimination: Two losses = elimination
 * - Round Robin: Everyone plays everyone
 * - Swiss: Matched by similar records
 *
 * **Settings:**
 * - isActive: Only one bracket active at a time
 * - grandFinalsReset: If true, losers bracket winner must win twice
 *
 * @example
 * ```ts
 * const bracket = {
 *   id: "bracket_main",
 *   tournamentId: "owc2026",
 *   name: "Main Bracket",
 *   type: "DOUBLE_ELIMINATION",
 *   grandFinalsReset: true,
 *   isActive: true
 * };
 * ```
 */
export const bracket = sqliteTable(
   "bracket",
   {
      id: text().primaryKey(),
      tournamentId: text().notNull(),

      /** Display name */
      name: text().notNull(),

      /** Bracket format */
      type: enumurate(BracketType).notNull(),

      /** Whether this is the active bracket */
      isActive: boolean().notNull().default(true),

      /** Whether grand finals requires bracket reset */
      grandFinalsReset: boolean().notNull().default(true),

      createdAt: timestamp().notNull(),
      updatedAt: timestamp().notNull(),
   },
   (table) => [index("bracket_tournament_idx").on(table.tournamentId)],
);

/**
 * Bracket relationships.
 */
export const bracketRelations = relations(bracket, ({ one, many }) => ({
   tournament: one(tournament, {
      fields: [bracket.tournamentId],
      references: [tournament.id],
   }),
   matches: many(match),
   rounds: many(round),
}));

/**
 * Round table - stage within a bracket.
 *
 * **Round Organization:**
 * - order determines progression sequence
 * - Earlier rounds have higher numbers
 * - Example: Round of 16 (order: 4), Quarterfinals (order: 3)
 *
 * **Best Of:**
 * - Number of points needed to win
 * - BO7 = first to 4, BO9 = first to 5, etc.
 *
 * **Scheduling:**
 * - weekStart marks beginning of round week
 * - Used for availability tracking and deadlines
 *
 * @example
 * ```ts
 * const round = {
 *   id: "round_ro16",
 *   bracketId: "bracket_main",
 *   mappoolId: "pool_ro16",
 *   name: "Round of 16",
 *   order: 4,
 *   bestOf: 9,
 *   weekStart: new Date("2026-03-01")
 * };
 * ```
 */
export const round = sqliteTable(
   "round",
   {
      id: text().primaryKey(),
      bracketId: text().notNull(),

      /** Mappool used for this round */
      mappoolId: text(),

      /** Display name (e.g., "Quarterfinals") */
      name: text().notNull(),

      /** Progression order (higher = earlier) */
      order: integer().notNull(),

      /** Points needed to win (e.g., 4 for BO7) */
      bestOf: integer().notNull().default(1),

      /** Week start for scheduling */
      weekStart: timestamp(),

      createdAt: timestamp().notNull(),
      updatedAt: timestamp().notNull(),
   },
   (table) => [
      index("round_bracket_idx").on(table.bracketId),
      index("round_mappool_idx").on(table.mappoolId),
      index("round_bracket_order_idx").on(table.bracketId, table.order),
   ],
);

/**
 * Round relationships.
 */
export const roundRelations = relations(round, ({ one, many }) => ({
   bracket: one(bracket, {
      fields: [round.bracketId],
      references: [bracket.id],
   }),
   mappool: one(mappool, {
      fields: [round.mappoolId],
      references: [mappool.id],
   }),
   matches: many(match),
   playerAvailability: many(playerAvailability),
   refereeAvailability: many(refereeAvailability),
}));

/**
 * Match table - core competitive event.
 *
 * **Match Positioning:**
 * - roundNumber + matchNumber uniquely identify position
 * - bracketSide indicates WINNERS/LOSERS/GRAND_FINALS
 *
 * **Team Assignment:**
 * - Direct: teamRedId and teamBlueId set explicitly
 * - Inherited: Teams come from previous matches via FromMatchId fields
 * - IsWinner flags indicate if team is winner or loser of previous match
 *
 * **Match Progression:**
 * - Winner advances via winnerToMatchId
 * - Loser advances via loserToMatchId (double elimination)
 * - NULL means match is final or doesn't progress
 *
 * **Status Workflow:**
 * - PENDING → IN_PROGRESS → COMPLETED
 * - Can become NO_SHOW if team doesn't appear
 * - Can become DISPUTED if result is contested
 *
 * **Performance Indexes:**
 * - (status, scheduledAt): Upcoming matches query
 * - (bracketId, roundNumber): Bracket visualization
 * - Individual foreign keys for joins
 *
 * @example
 * ```ts
 * const match = {
 *   bracketId: "bracket_main",
 *   tournamentId: "owc2026",
 *   roundNumber: 4,
 *   matchNumber: 1,
 *   bracketSide: "WINNERS",
 *   teamRedId: "team_123",
 *   teamBlueId: "team_456",
 *   scheduledAt: new Date("2026-03-15T18:00:00Z"),
 *   refereeId: "staff_789"
 * };
 * ```
 */
export const match = sqliteTable(
   "match",
   {
      id: text().primaryKey(),
      bracketId: text().notNull(),
      tournamentId: text().notNull(),

      /** Round this match belongs to */
      roundId: text(),

      /** Round number in bracket */
      roundNumber: integer().notNull(),

      /** Match number within round */
      matchNumber: integer().notNull(),

      /** Which bracket side */
      bracketSide: enumurate(BracketSide).notNull(),

      // Team Assignment
      teamRedId: text(),
      teamBlueId: text(),

      /** Current score */
      teamRedScore: integer().default(0),
      teamBlueScore: integer().default(0),

      /** Winning team */
      winnerId: text(),

      /** Current match status */
      status: enumurate(MatchStatus).notNull().default(MatchStatus.PENDING),

      // Match Dependencies
      /** Red team comes from this match */
      teamRedFromMatchId: text(),

      /** Blue team comes from this match */
      teamBlueFromMatchId: text(),

      /** True if red team is winner of previous match */
      teamRedFromMatchIsWinner: boolean(),

      /** True if blue team is winner of previous match */
      teamBlueFromMatchIsWinner: boolean(),

      /** Winner advances to this match */
      winnerToMatchId: text(),

      /** Loser advances to this match (double elim) */
      loserToMatchId: text(),

      // Match Logistics
      /** Assigned referee */
      refereeId: text(),

      /** Twitch/YouTube stream URL */
      streamUrl: text(),

      /** osu! multiplayer lobby ID */
      multiplayerLobbyId: text(),

      // Timestamps
      scheduledAt: timestamp(),
      startedAt: timestamp(),
      completedAt: timestamp(),

      createdAt: timestamp().notNull(),
      updatedAt: timestamp().notNull(),
   },
   (table) => [
      index("match_bracket_idx").on(table.bracketId),
      index("match_tournament_idx").on(table.tournamentId),
      index("match_round_idx").on(table.roundId),
      index("match_status_idx").on(table.status),
      index("match_scheduled_idx").on(table.scheduledAt),
      index("match_bracket_round_idx").on(table.bracketId, table.roundNumber),
      index("match_status_scheduled_idx").on(table.status, table.scheduledAt),
      index("match_team_red_idx").on(table.teamRedId),
      index("match_team_blue_idx").on(table.teamBlueId),
      index("match_referee_idx").on(table.refereeId),
   ],
);

/**
 * Match relationships.
 */
export const matchRelations = relations(match, ({ one, many }) => ({
   bracket: one(bracket, {
      fields: [match.bracketId],
      references: [bracket.id],
   }),
   tournament: one(tournament, {
      fields: [match.tournamentId],
      references: [tournament.id],
   }),
   round: one(round, {
      fields: [match.roundId],
      references: [round.id],
   }),
   teamRed: one(team, {
      fields: [match.teamRedId],
      references: [team.id],
   }),
   teamBlue: one(team, {
      fields: [match.teamBlueId],
      references: [team.id],
   }),
   winner: one(team, {
      fields: [match.winnerId],
      references: [team.id],
   }),
   referee: one(staff, {
      fields: [match.refereeId],
      references: [staff.id],
   }),
   pickBans: many(matchPickBan),
   mapResults: many(matchMapResult),
}));

/**
 * Match pick/ban table - pre-match map selection phase.
 *
 * **Pick/Ban Phase:**
 * - Teams alternate banning and picking maps
 * - Order field tracks chronological sequence
 * - PROTECT action prevents opponent from banning
 *
 * **Common Patterns:**
 * - Ban phase: Each team removes unwanted maps
 * - Protect phase: Teams save preferred maps
 * - Pick phase: Teams select maps to play
 *
 * @example
 * ```ts
 * // First ban
 * const ban = {
 *   matchId: "match_123",
 *   mapId: "map_456",
 *   team: "RED",
 *   action: "BAN",
 *   order: 1
 * };
 *
 * // First pick
 * const pick = {
 *   matchId: "match_123",
 *   mapId: "map_789",
 *   team: "BLUE",
 *   action: "PICK",
 *   order: 5
 * };
 * ```
 */
export const matchPickBan = sqliteTable(
   "match_pick_ban",
   {
      id: text().primaryKey(),
      matchId: text().notNull(),
      mapId: text().notNull(),

      /** Which team performed action */
      team: enumurate(TeamColor).notNull(),

      /** Action type */
      action: enumurate(PickBanAction).notNull(),

      /** Chronological order */
      order: integer().notNull(),

      createdAt: timestamp().notNull(),
   },
   (table) => [
      index("match_pick_ban_match_idx").on(table.matchId),
      index("match_pick_ban_map_idx").on(table.mapId),
      index("match_pick_ban_match_order_idx").on(table.matchId, table.order),
   ],
);

/**
 * Match pick/ban relationships.
 */
export const matchPickBanRelations = relations(matchPickBan, ({ one }) => ({
   match: one(match, {
      fields: [matchPickBan.matchId],
      references: [match.id],
   }),
   map: one(map, {
      fields: [matchPickBan.mapId],
      references: [map.id],
   }),
}));

/**
 * Match map result table - individual beatmap scores.
 *
 * **Score Tracking:**
 * - Each row represents one beatmap played
 * - Order maintains play sequence
 * - Scores aggregate to match.teamRedScore and match.teamBlueScore
 *
 * **Winner Determination:**
 * - winnerId set to team with higher score
 * - Used to increment team's overall match score
 *
 * **Timeline:**
 * - startedAt: When beatmap started
 * - completedAt: When beatmap finished
 * - Used for match duration calculations
 *
 * @example
 * ```ts
 * const mapResult = {
 *   matchId: "match_123",
 *   mapId: "map_456",
 *   order: 1,
 *   teamRedScore: 987654,
 *   teamBlueScore: 1234567,
 *   winnerId: "team_blue",
 *   pickedByTeam: "RED",
 *   startedAt: new Date("2026-03-15T18:15:00Z"),
 *   completedAt: new Date("2026-03-15T18:20:00Z")
 * };
 * ```
 */
export const matchMapResult = sqliteTable(
   "match_map_result",
   {
      id: text().primaryKey(),
      matchId: text().notNull(),
      mapId: text().notNull(),

      /** Play order within match */
      order: integer().notNull(),

      /** Total team score for this map */
      teamRedScore: integer().notNull().default(0),
      teamBlueScore: integer().notNull().default(0),

      /** Team that won this map */
      winnerId: text(),

      /** Which team picked this map */
      pickedByTeam: enumurate(TeamColor),

      /** When map started */
      startedAt: timestamp(),

      /** When map finished */
      completedAt: timestamp(),

      createdAt: timestamp().notNull(),
      updatedAt: timestamp().notNull(),
   },
   (table) => [
      index("match_map_result_match_idx").on(table.matchId),
      index("match_map_result_map_idx").on(table.mapId),
      index("match_map_result_match_order_idx").on(table.matchId, table.order),
   ],
);

/**
 * Match map result relationships.
 */
export const matchMapResultRelations = relations(matchMapResult, ({ one }) => ({
   match: one(match, {
      fields: [matchMapResult.matchId],
      references: [match.id],
   }),
   map: one(map, {
      fields: [matchMapResult.mapId],
      references: [map.id],
   }),
   winner: one(team, {
      fields: [matchMapResult.winnerId],
      references: [team.id],
   }),
}));
