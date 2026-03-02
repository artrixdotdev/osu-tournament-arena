/**
 * @fileoverview
 * Player screening system for tournament eligibility verification.
 * Manages the review process for player registrations.
 */

import { relations } from "drizzle-orm";
import {
   index,
   integer,
   real,
   sqliteTable,
   text,
   unique,
} from "drizzle-orm/sqlite-core";

import { array, auditTimestamps, boolean, enumurate } from "../../util";
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
      id: integer().primaryKey(),
      playerId: integer().notNull(),
      tournamentId: text()
         .notNull()
         .references(() => tournament.id),

      /** Current screening status */
      status: enumurate(ScreeningStatus)
         .notNull()
         .default(ScreeningStatus.PENDING),

      /** Reason for rejection (required if status is REJECTED) */
      rejectionReason: text(),

      /** Whether player can appeal the rejection */
      isAppealable: boolean().notNull().default(false),

      /** Staff member who reviewed */
      reviewedBy: integer(),

      ...auditTimestamps,
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
      id: integer().primaryKey(),
      screeningId: integer().notNull(),
      tournamentId: text().notNull(),
      playerId: integer().notNull(),

      /** Current appeal status */
      status: enumurate(ScreeningStatus)
         .notNull()
         .default(ScreeningStatus.PENDING),

      /** Reason for appeal */
      appealReason: text().notNull(),

      /** Reason for rejection (required if status is REJECTED) */
      rejectionReason: text(),

      /** Staff member who reviewed */
      reviewedBy: integer(),

      ...auditTimestamps,
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

/**
 * Screening requirements table - tournament eligibility criteria.
 *
 * Defines the automated criteria used to evaluate player eligibility
 * for a specific tournament during the screening process.
 *
 * **Fields:**
 * - `minimumRank` / `maximumRank`: Allowed osu! rank range (inclusive)
 * - `minimumRating` / `maximumRating`: Allowed OTR (osu! Tournament Rating) range (inclusive)
 * - `allowedCountries`: Restrict to specific country codes (null = all allowed)
 * - `useBws`: Enable Badge Weighted Seeding for tournament
 * - `minimumBadges`: Minimum badge count required for BWS seeding (optional)
 * - `bwsExponent`: Exponent used in BWS calculation (default: 0.9937)
 *
 * **Constraints:**
 * - One requirements entry per tournament
 *
 * @example
 * ```ts
 * const requirements = {
 *   tournamentId: "owc2026",
 *   minimumRank: 1,
 *   maximumRank: 10000,
 *   minimumRating: 0,
 *   maximumRating: 5000,
 *   allowedCountries: ["US", "CA", "GB"],
 *   useBws: true,
 *   minimumBadges: 1,
 *   bwsExponent: 0.9937,
 * };
 * ```
 */
export const screeningRequirements = sqliteTable(
   "screening_requirements",
   {
      id: integer().primaryKey(),
      tournamentId: text().notNull(),

      /** Minimum osu! rank allowed (inclusive) */
      minimumRank: integer(),

      /** Maximum osu! rank allowed (inclusive) */
      maximumRank: integer(),

      /** Maximum OTR (osu! Tournament Rating) allowed (inclusive) */
      maximumRating: integer(),

      /** Minimum OTR (osu! Tournament Rating) allowed (inclusive) */
      minimumRating: integer(),

      /** Allowed country codes (null = no restriction) */
      allowedCountries: array<string>(),

      /** Enable Badge Weighted Seeding (BWS) for tournament */
      useBws: boolean().notNull().default(false),

      /** Minimum badge count required for BWS seeding */
      minimumBadges: integer(),

      /** Exponent used in BWS calculation (typically 0.9-0.9999, default 0.9937) */
      bwsExponent: real().notNull().default(0.9937),
   },
   (table) => [
      index("screening_requirements_tournament_idx").on(table.tournamentId),
      unique("screening_requirements_tournament_unique").on(table.tournamentId),
   ],
);

/**
 * Screening requirements relationships.
 */
export const screeningRequirementsRelations = relations(
   screeningRequirements,
   ({ one }) => ({
      tournament: one(tournament, {
         fields: [screeningRequirements.tournamentId],
         references: [tournament.id],
      }),
   }),
);
