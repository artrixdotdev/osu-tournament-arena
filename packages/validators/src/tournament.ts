import { createInsertSchema, createUpdateSchema } from "drizzle-zod";
import { z } from "zod";

import {
   StaffRole,
   TOURNAMENT_ACRONYM_MAX_LENGTH,
   TournamentDiscord,
   tournament as tournamentTable,
} from "@ota/db/schema";

const staffRoleLiteral = z.union([
   z.literal(StaffRole.ADMIN),
   z.literal(StaffRole.COMMENTATOR),
   z.literal(StaffRole.HOST),
   z.literal(StaffRole.POOLER),
   z.literal(StaffRole.REFEREE),
   z.literal(StaffRole.PLAYTESTER),
   z.literal("SPECTATOR"),
   z.literal("PLAYER"),
   z.literal("CAPTAIN"),
]);

const baseDiscordSchema: z.ZodType<TournamentDiscord> = z.object({
   serverId: z.string(),
   channels: z.object({
      matchResults: z.string(),
      matchPings: z.string(),
   }),
   roles: z.record(staffRoleLiteral, z.string()),
});

const baseIdSchema = z.object({
   id: z.string().min(1).describe("Tournament ID"),
});

const basePaginationSchema = z.object({
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

const baseRankSchema = z.object({
   minimumRank: z
      .number()
      .int()
      .positive()
      .optional()
      .describe("Minimum osu! rank allowed (inclusive)"),
   maximumRank: z
      .number()
      .int()
      .positive()
      .optional()
      .describe("Maximum osu! rank allowed (inclusive)"),
});

const baseRatingSchema = z.object({
   minimumRating: z
      .number()
      .int()
      .optional()
      .describe("Minimum OTR (osu! Tournament Rating) allowed (inclusive)"),
   maximumRating: z
      .number()
      .int()
      .optional()
      .describe("Maximum OTR (osu! Tournament Rating) allowed (inclusive)"),
});

export const createTournamentSchema = createInsertSchema(tournamentTable, {
   id: (schema) =>
      schema
         .min(1)
         .regex(
            /^[a-z0-9]+(?:-[a-z0-9]+)*$/i,
            "Tournament ID must be a valid slug",
         )
         .describe("Unique tournament identifier"),
   name: (schema) => schema.min(1).describe("Full tournament name"),
   acronym: (schema) =>
      schema
         .max(TOURNAMENT_ACRONYM_MAX_LENGTH)
         .describe(
            `Short acronym (up to ${TOURNAMENT_ACRONYM_MAX_LENGTH} characters)`,
         ),
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
}).refine((data) => data.startDate <= data.endDate, {
   message: "startDate must be less than or equal to endDate",
   path: ["endDate"],
});

export const updateTournamentSchema = createUpdateSchema(tournamentTable, {
   id: (schema) => schema.min(1).describe("Tournament ID to update"),
   name: (schema) => schema.min(1).optional().describe("Full tournament name"),
   acronym: (schema) =>
      schema
         .max(TOURNAMENT_ACRONYM_MAX_LENGTH)
         .optional()
         .describe(
            `Short acronym (up to ${TOURNAMENT_ACRONYM_MAX_LENGTH} characters)`,
         ),
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

export const tournamentIdSchema = baseIdSchema;

export const tournamentListSchema = basePaginationSchema;

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
   .required({ id: true })
   .refine(
      (data) =>
         data.startDate === undefined ||
         data.endDate === undefined ||
         data.startDate <= data.endDate,
      {
         message: "startDate must be less than or equal to endDate",
         path: ["endDate"],
      },
   );

export const updateTournamentSettingsSchema = updateTournamentSchema
   .pick({ id: true, lobbySize: true, teamSize: true })
   .required({ id: true });

export const updateTournamentVisibilitySchema = updateTournamentSchema
   .pick({ id: true, isPublic: true })
   .required({ id: true, isPublic: true });

export const updateTournamentDiscordSchema = updateTournamentSchema
   .pick({ id: true, discord: true })
   .required({ id: true });

export const updateTournamentScreeningRequirementsSchema = baseIdSchema
   .merge(
      z.object({
         allowedCountries: z
            .array(z.string().length(2))
            .nullable()
            .optional()
            .describe("Allowed country codes (null = no restriction)"),
         useBws: z
            .boolean()
            .optional()
            .describe("Enable Badge Weighted Seeding (BWS) for tournament"),
         minimumBadges: z
            .number()
            .int()
            .min(0)
            .optional()
            .describe("Minimum badge count required for BWS seeding"),
         bwsExponent: z
            .number()
            .gt(0)
            .lt(1)
            .optional()
            .describe("Exponent used in BWS calculation (typically 0.5-1.0)"),
      }),
   )
   .merge(baseRankSchema)
   .merge(baseRatingSchema)
   .refine(
      (data) =>
         data.minimumRank === undefined ||
         data.maximumRank === undefined ||
         data.minimumRank <= data.maximumRank,
      { message: "minimumRank must be less than or equal to maximumRank" },
   )
   .refine(
      (data) =>
         data.minimumRating === undefined ||
         data.maximumRating === undefined ||
         data.minimumRating <= data.maximumRating,
      { message: "minimumRating must be less than or equal to maximumRating" },
   );

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
export type UpdateTournamentScreeningRequirementsInput = z.infer<
   typeof updateTournamentScreeningRequirementsSchema
>;
