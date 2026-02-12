/**
 * @fileoverview
 * Staff management and referee availability tracking.
 * Handles tournament personnel and their scheduling preferences.
 */

import { relations } from "drizzle-orm";
import {
   index,
   integer,
   sqliteTable,
   text,
   unique,
} from "drizzle-orm/sqlite-core";

import type { StaffRole, TimeSlot } from "./types";
import { array, json, timestamp } from "../../util";
import { user } from "../auth";
import { round } from "./bracket";
import { tournament } from "./tournament";

/**
 * Staff table - tournament personnel with assigned roles.
 *
 * **Role System:**
 * - Staff can have multiple roles (stored as array)
 * - Roles determine permissions and available actions
 * - See StaffRole enum for available roles
 *
 * **Constraints:**
 * - Unique (tournamentId, userId): Users can only be staff once per tournament
 *
 * @example
 * ```ts
 * const staff = {
 *   id: "staff_123",
 *   userId: "user_456",
 *   tournamentId: "owc2026",
 *   name: "StaffName",
 *   roles: ["REFEREE", "ADMIN"]
 * };
 * ```
 */
export const staff = sqliteTable(
   "staff",
   {
      id: text().primaryKey(),

      /** Display name for tournament */
      name: text().notNull(),

      createdAt: timestamp().notNull(),
      updatedAt: timestamp().notNull(),

      tournamentId: text().notNull(),
      userId: text().notNull(),

      /** Array of assigned roles */
      roles: array<StaffRole>().notNull().default([]),
   },
   (table) => [
      index("staff_tournament_idx").on(table.tournamentId),
      index("staff_user_idx").on(table.userId),
      unique("staff_tournament_user_unique").on(
         table.tournamentId,
         table.userId,
      ),
   ],
);

/**
 * Staff relationships.
 */
export const staffRelations = relations(staff, ({ one, many }) => ({
   tournament: one(tournament, {
      fields: [staff.tournamentId],
      references: [tournament.id],
   }),
   user: one(user, {
      fields: [staff.userId],
      references: [user.id],
   }),
   refereeAvailability: many(refereeAvailability),
}));

/**
 * Referee availability table - tracks when referees can oversee matches.
 *
 * **Flexible Design:**
 * - Round-specific: Set roundId for targeted availability
 * - Weekly recurring: Set weekStart for general availability
 * - Match limiting: Use maxMatches to prevent burnout
 *
 * **Scheduling Logic:**
 * - System checks timeSlots against match times
 * - Considers timezone conversion automatically
 * - Respects maxMatches limit when assigning
 *
 * @example
 * ```ts
 * // Round-specific availability
 * const availability = {
 *   refereeId: "staff_123",
 *   roundId: "round_456",
 *   timezone: "Europe/London",
 *   maxMatches: 5,
 *   timeSlots: [
 *     { start: "2026-02-15T14:00:00Z", end: "2026-02-15T18:00:00Z" }
 *   ]
 * };
 * ```
 */
export const refereeAvailability = sqliteTable(
   "referee_availability",
   {
      id: text().primaryKey(),
      refereeId: text().notNull(),

      /** Specific round (optional) */
      roundId: text(),

      /** Week start for recurring availability (optional) */
      weekStart: timestamp(),

      /** Array of available time windows */
      timeSlots: json<TimeSlot[]>().notNull().default([]),

      /** IANA timezone identifier */
      timezone: text().notNull().default("UTC"),

      /** Maximum matches referee wants to handle */
      maxMatches: integer(),

      createdAt: timestamp().notNull(),
      updatedAt: timestamp().notNull(),
   },
   (table) => [
      index("referee_availability_referee_idx").on(table.refereeId),
      index("referee_availability_round_idx").on(table.roundId),
   ],
);

/**
 * Referee availability relationships.
 */
export const refereeAvailabilityRelations = relations(
   refereeAvailability,
   ({ one }) => ({
      referee: one(staff, {
         fields: [refereeAvailability.refereeId],
         references: [staff.id],
      }),
      round: one(round, {
         fields: [refereeAvailability.roundId],
         references: [round.id],
      }),
   }),
);
