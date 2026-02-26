import { createInsertSchema, createUpdateSchema } from "drizzle-zod";
import { z } from "zod";

import { StaffRole, tournament as tournamentTable } from "@ota/db/schema";

const baseDiscordSchema = z.object({
   serverId: z.string(),
   channels: z.object({
      matchResults: z.string(),
      matchPings: z.string(),
   }),
   roles: z.record(
      z.union([
         z.literal(StaffRole.ADMIN),
         z.literal(StaffRole.COMMENTATOR),
         z.literal(StaffRole.HOST),
         z.literal(StaffRole.PLAYTESTER),
         z.literal(StaffRole.POOLER),
         z.literal(StaffRole.REFEREE),
         z.literal("SPECTATOR"),
         z.literal("PLAYER"),
         z.literal("CAPTAIN"),
      ]),
      z.string(),
   ),
});

export const createTournamentSchema = createInsertSchema(tournamentTable, {
   id: (schema) =>
      schema.slugify().min(1).describe("Unique tournament identifier"),
   name: (schema) => schema.min(1).describe("Full tournament name"),
   acronym: (schema) =>
      schema.length(4).describe("Short acronym (exactly 4 characters)"),
   rendition: (schema) =>
      schema.int().positive().optional().describe("Edition number"),
   description: (schema) => schema.max(255).describe("Brief description"),
   startDate: (schema) => schema.describe("Tournament start date"),
   endDate: (schema) => schema.describe("Tournament end date"),
   isPublic: (schema) =>
      schema.describe("Whether tournament is visible to public"),
   isArchived: (schema) => schema.describe("Whether tournament is archived"),
   lobbySize: (schema) =>
      schema.int().positive().describe("Maximum players per lobby"),
   teamSize: (schema) =>
      schema.int().positive().describe("Maximum players per team"),
   discord: baseDiscordSchema
      .optional()
      .describe("Discord bot integration settings"),
});

export const updateTournamentSchema = createUpdateSchema(tournamentTable, {
   id: (schema) => schema.describe("Tournament ID to update"),
   name: (schema) => schema.min(1).optional().describe("Full tournament name"),
   acronym: (schema) => schema.length(4).optional().describe("Short acronym"),
   rendition: (schema) =>
      schema.int().positive().optional().describe("Edition number"),
   description: (schema) =>
      schema.max(255).optional().describe("Brief description"),
   startDate: (schema) => schema.optional().describe("Tournament start date"),
   endDate: (schema) => schema.optional().describe("Tournament end date"),
   isPublic: (schema) =>
      schema.optional().describe("Whether tournament is visible to public"),
   isArchived: (schema) =>
      schema.optional().describe("Whether tournament is archived"),
   lobbySize: (schema) =>
      schema.int().positive().optional().describe("Maximum players per lobby"),
   teamSize: (schema) =>
      schema.int().positive().optional().describe("Maximum players per team"),
   discord: baseDiscordSchema
      .nullable()
      .optional()
      .describe("Discord bot integration settings"),
});

export const tournamentIdSchema = updateTournamentSchema
   .pick({ id: true })
   .required({ id: true });

export const tournamentListSchema = z.object({
   limit: z
      .number()
      .int()
      .positive()
      .max(50)
      .default(20)
      .describe("Maximum results to return"),
   cursor: z
      .string()
      .optional()
      .describe("Cursor for pagination (tournament ID)"),
});

export const updateTournamentDetailsSchema = updateTournamentSchema
   .pick({
      id: true,
      name: true,
      acronym: true,
      rendition: true,
      description: true,
   })
   .required({ id: true });

export const updateTournamentScheduleSchema = updateTournamentSchema
   .pick({ id: true, startDate: true, endDate: true })
   .required({ id: true });

export const updateTournamentSettingsSchema = updateTournamentSchema
   .pick({ id: true, lobbySize: true, teamSize: true })
   .required({ id: true });

export const updateTournamentVisibilitySchema = updateTournamentSchema
   .pick({ id: true, isPublic: true })
   .required({ id: true, isPublic: true });

export const updateTournamentDiscordSchema = updateTournamentSchema
   .pick({ id: true, discord: true })
   .required({ id: true });

export type CreateTournamentInput = z.infer<typeof createTournamentSchema>;
export type UpdateTournamentInput = z.infer<typeof updateTournamentSchema>;
export type TournamentIdInput = z.infer<typeof tournamentIdSchema>;
export type TournamentListInput = z.infer<typeof tournamentListSchema>;
export type UpdateTournamentDetailsInput = z.infer<
   typeof updateTournamentDetailsSchema
>;
export type UpdateTournamentScheduleInput = z.infer<
   typeof updateTournamentScheduleSchema
>;
export type UpdateTournamentSettingsInput = z.infer<
   typeof updateTournamentSettingsSchema
>;
export type UpdateTournamentVisibilityInput = z.infer<
   typeof updateTournamentVisibilitySchema
>;
export type UpdateTournamentDiscordInput = z.infer<
   typeof updateTournamentDiscordSchema
>;
