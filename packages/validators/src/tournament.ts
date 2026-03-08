import { createInsertSchema, createUpdateSchema } from "drizzle-zod";
import { z } from "zod";

import {
   StaffRole,
   TOURNAMENT_ACRONYM_MAX_LENGTH,
   TOURNAMENT_BODY_MAX_LENGTH,
   TOURNAMENT_FONT_FAMILY_MAX_LENGTH,
   TOURNAMENT_LOGO_URL_MAX_LENGTH,
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

const tournamentIdValueSchema = z
   .string()
   .min(1)
   .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/i, "Tournament ID must be a valid slug")
   .describe("Tournament ID");

const baseIdSchema = z.object({
   id: tournamentIdValueSchema,
});

const hslColorTokenSchema = z
   .string()
   .trim()
   .regex(
      /^\d{1,3}(?:\.\d+)?\s+\d{1,3}(?:\.\d+)?%\s+\d{1,3}(?:\.\d+)?%$/,
      "Color values must be valid HSL tokens (e.g. 222.2 84% 4.9%)",
   );

const tournamentThemeColorsSchema = z.object({
   background: hslColorTokenSchema.optional(),
   foreground: hslColorTokenSchema.optional(),
   card: hslColorTokenSchema.optional(),
   cardForeground: hslColorTokenSchema.optional(),
   primary: hslColorTokenSchema.optional(),
   primaryForeground: hslColorTokenSchema.optional(),
   secondary: hslColorTokenSchema.optional(),
   secondaryForeground: hslColorTokenSchema.optional(),
   muted: hslColorTokenSchema.optional(),
   mutedForeground: hslColorTokenSchema.optional(),
   accent: hslColorTokenSchema.optional(),
   accentForeground: hslColorTokenSchema.optional(),
   border: hslColorTokenSchema.optional(),
   input: hslColorTokenSchema.optional(),
   ring: hslColorTokenSchema.optional(),
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
      .nullable()
      .optional()
      .describe("Minimum osu! rank allowed (inclusive)"),
   maximumRank: z
      .number()
      .int()
      .positive()
      .nullable()
      .optional()
      .describe("Maximum osu! rank allowed (inclusive)"),
});

const baseRatingSchema = z.object({
   minimumRating: z
      .number()
      .int()
      .nullable()
      .optional()
      .describe("Minimum OTR (osu! Tournament Rating) allowed (inclusive)"),
   maximumRating: z
      .number()
      .int()
      .nullable()
      .optional()
      .describe("Maximum OTR (osu! Tournament Rating) allowed (inclusive)"),
});

export const createTournamentSchema = createInsertSchema(tournamentTable, {
   id: () => tournamentIdValueSchema.describe("Unique tournament identifier"),
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
   logo: (schema) =>
      schema
         .max(TOURNAMENT_LOGO_URL_MAX_LENGTH)
         .describe("Optional tournament logo URL"),
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
   id: () => tournamentIdValueSchema.describe("Tournament ID to update"),
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
   logo: (schema) =>
      schema
         .max(TOURNAMENT_LOGO_URL_MAX_LENGTH)
         .optional()
         .describe("Optional tournament logo URL"),
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
      logo: true,
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
   .required({ id: true, discord: true });

export const updateTournamentScreeningRequirementsSchema = baseIdSchema
   .extend(
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
            .nullable()
            .optional()
            .describe("Minimum badge count required for BWS seeding"),
         bwsExponent: z
            .number()
            .gt(0)
            .lt(1)
            .optional()
            .describe("Exponent used in BWS calculation (typically 0.5-1.0)"),
      }).shape,
   )
   .extend(baseRankSchema.shape)
   .extend(baseRatingSchema.shape)
   .refine(
      (data) =>
         data.minimumRank == null ||
         data.maximumRank == null ||
         data.minimumRank <= data.maximumRank,
      { message: "minimumRank must be less than or equal to maximumRank" },
   )
   .refine(
      (data) =>
         data.minimumRating == null ||
         data.maximumRating == null ||
         data.minimumRating <= data.maximumRating,
      { message: "minimumRating must be less than or equal to maximumRating" },
   );

export const updateTournamentContentSchema = baseIdSchema.extend({
   body: z
      .string()
      .max(TOURNAMENT_BODY_MAX_LENGTH)
      .optional()
      .describe("Tournament markdown body content"),
   fontFamily: z
      .string()
      .trim()
      .max(TOURNAMENT_FONT_FAMILY_MAX_LENGTH)
      .nullable()
      .optional()
      .describe("Google font family for tournament page"),
   themeColors: tournamentThemeColorsSchema
      .nullable()
      .optional()
      .describe("Scoped tournament theme color tokens"),
});

export const createTournamentMediaUploadSchema = baseIdSchema.extend({
   fileName: z
      .string()
      .trim()
      .min(1)
      .max(255)
      .describe("Original file name"),
   contentType: z
      .string()
      .trim()
      .regex(
         /^(image|video|audio)\/[a-z0-9.+-]+$/i,
         "contentType must be image/*, video/*, or audio/*",
      )
      .describe("MIME content type"),
   sizeBytes: z
      .number()
      .int()
      .positive()
      .max(4 * 1024 * 1024)
      .describe("File size in bytes (max 4 MB)"),
});

export const previewTournamentMarkdownSchema = z.object({
   body: z
      .string()
      .max(TOURNAMENT_BODY_MAX_LENGTH)
      .describe("Markdown body to preview"),
});

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
export type UpdateTournamentContentInput = z.infer<
   typeof updateTournamentContentSchema
>;
export type CreateTournamentMediaUploadInput = z.infer<
   typeof createTournamentMediaUploadSchema
>;
export type PreviewTournamentMarkdownInput = z.infer<
   typeof previewTournamentMarkdownSchema
>;
