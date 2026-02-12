/**
 * @fileoverview
 * Mappool system - beatmap collection management.
 * Handles map selection, organization, and pooler assignments.
 */

import { relations } from "drizzle-orm";
import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

import { enumurate, json, timestamp } from "../../util";
import { round } from "./bracket";
import { qualifierLobby } from "./qualifier";
import { staff } from "./staff";
import { tournament } from "./tournament";
import { Mods } from "./types";

/**
 * Mappool table - container for grouped beatmaps.
 *
 * **Usage:**
 * - Rounds reference a mappool for that stage
 * - Qualifier lobbies use a qualifier-specific mappool
 * - Mappools can be reused across multiple rounds
 *
 * **Common Patterns:**
 * - One mappool per round (Quarterfinals, Semifinals, etc.)
 * - Separate qualifier mappool
 * - Grand Finals may reuse Finals mappool
 *
 * @example
 * ```ts
 * const mappool = {
 *   id: "pool_ro16",
 *   tournamentId: "owc2026"
 * };
 * ```
 */
export const mappool = sqliteTable(
   "mappool",
   {
      id: text().primaryKey(),
      tournamentId: text().notNull(),
      createdAt: timestamp().notNull(),
      updatedAt: timestamp().notNull(),
   },
   (table) => [index("mappool_tournament_idx").on(table.tournamentId)],
);

/**
 * Mappool relationships.
 */
export const mappoolRelations = relations(mappool, ({ one, many }) => ({
   tournament: one(tournament, {
      fields: [mappool.tournamentId],
      references: [tournament.id],
   }),
   maps: many(map),
   rounds: many(round),
   qualifierLobbies: many(qualifierLobby),
}));

/**
 * Map table - individual beatmap within a mappool.
 *
 * **Map Organization:**
 * - Slot identifies position (e.g., "NM1", "HD2", "DT3")
 * - Mod determines required game modifiers
 * - Rendition tracks map version updates
 *
 * **Multipliers:**
 * - Custom scoring adjustments per mod combination
 * - Used for calculating weighted scores
 * - Format: { "NM": 1.0, "HD": 1.06, "HR": 1.12, ... }
 *
 * **Pooler Assignment:**
 * - Maps are assigned to staff members for selection
 * - NULL poolerId means map not yet assigned
 *
 * @example
 * ```ts
 * const map = {
 *   mappoolId: "pool_ro16",
 *   mapId: 3574361, // osu! beatmap ID
 *   slot: "NM1",
 *   mod: "NM",
 *   poolerId: "staff_123",
 *   multipliers: {
 *     "NM": 1.0,
 *     "HD": 1.06,
 *     "HR": 1.12
 *   }
 * };
 * ```
 */
export const map = sqliteTable(
   "map",
   {
      id: text().primaryKey(),
      mappoolId: text().notNull(),

      /** osu! beatmap ID */
      mapId: integer().notNull(),

      /** Staff member who selected this map */
      poolerId: text(),

      /** Pool slot identifier (e.g., "NM1", "HD2") */
      slot: text(),

      /** Required game modifier */
      mod: enumurate(Mods).notNull().default(Mods.NM),

      /** Score multipliers per mod combination */
      multipliers: json<Record<keyof typeof Mods, number>>(),
   },
   (table) => [
      index("map_mappool_idx").on(table.mappoolId),
      index("map_pooler_idx").on(table.poolerId),
   ],
);

/**
 * Map relationships.
 */
export const mapRelations = relations(map, ({ one }) => ({
   mappool: one(mappool, {
      fields: [map.mappoolId],
      references: [mappool.id],
   }),
   pooler: one(staff, {
      fields: [map.poolerId],
      references: [staff.id],
   }),
}));
