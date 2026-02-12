/**
 * @fileoverview
 * Player screening system for tournament eligibility verification.
 * Manages the review process for player registrations.
 */

import { relations } from "drizzle-orm";
import { index, sqliteTable, text, unique } from "drizzle-orm/sqlite-core";

import { boolean, enumurate, timestamp } from "../../util";
import { player } from "./player";
import { staff } from "./staff";
import { tournament } from "./tournament";
import { ScreeningStatus } from "./types";

/**
 * Screening table - player eligibility verification.
 *
 * **Workflow:**
 * 1. Player registers → screening created with PENDING status
 * 2. Staff reviews → status updated, reviewedBy and reviewedAt set
 * 3. If rejected → rejectionReason required, isAppealable optional
 * 4. Player can appeal if isAppealable is true
 *
 * **Common Rejection Reasons:**
 * - Account restrictions or bans
 * - Rank outside allowed range
 * - Previous tournament violations
 * - Multi-accounting concerns
 *
 * **Constraints:**
 * - Unique (playerId, tournamentId): One screening per player per tournament
 *
 * @example
 * ```ts
 * // Rejected screening
 * const screening = {
 *   playerId: "player_123",
 *   tournamentId: "owc2026",
 *   status: "REJECTED",
 *   rejectionReason: "Account restricted for cheating",
 *   isAppealable: false,
 *   reviewedBy: "staff_456",
 *   reviewedAt: new Date()
 * };
 * ```
 */
export const screening = sqliteTable(
   "screening",
   {
      id: text().primaryKey(),
      playerId: text().notNull(),
      tournamentId: text().notNull(),

      /** Current screening status */
      status: enumurate(ScreeningStatus)
         .notNull()
         .default(ScreeningStatus.PENDING),

      /** Reason for rejection (required if status is REJECTED) */
      rejectionReason: text(),

      /** Whether player can appeal the rejection */
      isAppealable: boolean().notNull().default(false),

      /** Staff member who reviewed */
      reviewedBy: text(),

      createdAt: timestamp().notNull(),
      updatedAt: timestamp().notNull(),
   },
   (table) => [
      index("screening_player_idx").on(table.playerId),
      index("screening_tournament_idx").on(table.tournamentId),
      index("screening_status_idx").on(table.status),
      unique("screening_player_tournament_unique").on(
         table.playerId,
         table.tournamentId,
      ),
   ],
);

/**
 * Screening relationships.
 */
export const screeningRelations = relations(screening, ({ one }) => ({
   player: one(player, {
      fields: [screening.playerId],
      references: [player.id],
   }),
   tournament: one(tournament, {
      fields: [screening.tournamentId],
      references: [tournament.id],
   }),
   reviewer: one(staff, {
      fields: [screening.reviewedBy],
      references: [staff.id],
   }),
}));

export const screeningAppeal = sqliteTable(
   "screening_appeal",
   {
      id: text().primaryKey(),
      screeningId: text().notNull(),
      tournamentId: text().notNull(),
      playerId: text().notNull(),

      /** Current appeal status */
      status: enumurate(ScreeningStatus)
         .notNull()
         .default(ScreeningStatus.PENDING),

      /** Reason for appeal */
      appealReason: text().notNull(),

      /** Reason for rejection (required if status is REJECTED) */
      rejectionReason: text(),

      /** Staff member who reviewed */
      reviewedBy: text(),

      createdAt: timestamp().notNull(),
      updatedAt: timestamp().notNull(),
   },
   (table) => [
      index("screening_appeal_player_idx").on(table.playerId),
      index("screening_appeal_tournament_idx").on(table.tournamentId),
      index("screening_appeal_status_idx").on(table.status),
      unique("screening_appeal_player_tournament_unique").on(
         table.playerId,
         table.tournamentId,
      ),
   ],
);

/**
 * Screening appeal relationships.
 */
export const screeningAppealRelations = relations(
   screeningAppeal,
   ({ one }) => ({
      screening: one(screening, {
         fields: [screeningAppeal.screeningId],
         references: [screening.id],
      }),
      player: one(player, {
         fields: [screeningAppeal.playerId],
         references: [player.id],
      }),
      tournament: one(tournament, {
         fields: [screeningAppeal.tournamentId],
         references: [tournament.id],
      }),
      reviewer: one(staff, {
         fields: [screeningAppeal.reviewedBy],
         references: [staff.id],
      }),
   }),
);
