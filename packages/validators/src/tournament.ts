import { createUpdateSchema } from "drizzle-zod";
import { z } from "zod";

import type { TournamentDiscord } from "@ota/db/schema";
import {
   StaffRole,
   TOURNAMENT_ACRONYM_MAX_LENGTH,
   TOURNAMENT_PAGE_BODY_MAX_LENGTH,
   TOURNAMENT_PAGE_FONT_MAX_LENGTH,
   tournament as tournamentTable,
} from "@ota/db/schema";

const tournamentPageBodyMaxLength = Number(TOURNAMENT_PAGE_BODY_MAX_LENGTH);
const tournamentPageFontMaxLength = Number(TOURNAMENT_PAGE_FONT_MAX_LENGTH);

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

const themeTokenSchema = z
   .string()
   .trim()
   .regex(
      /^\d{1,3}(?:\.\d+)?\s+\d{1,3}(?:\.\d+)?%\s+\d{1,3}(?:\.\d+)?%$/,
      "Theme tokens must be valid HSL values such as 222.2 47.4% 11.2%",
   );

export const tournamentThemeTokensSchema = z.object({
   background: themeTokenSchema.optional(),
   foreground: themeTokenSchema.optional(),
   card: themeTokenSchema.optional(),
   cardForeground: themeTokenSchema.optional(),
   popover: themeTokenSchema.optional(),
   popoverForeground: themeTokenSchema.optional(),
   primary: themeTokenSchema.optional(),
   primaryForeground: themeTokenSchema.optional(),
   secondary: themeTokenSchema.optional(),
   secondaryForeground: themeTokenSchema.optional(),
   muted: themeTokenSchema.optional(),
   mutedForeground: themeTokenSchema.optional(),
   accent: themeTokenSchema.optional(),
   accentForeground: themeTokenSchema.optional(),
   destructive: themeTokenSchema.optional(),
   border: themeTokenSchema.optional(),
   input: themeTokenSchema.optional(),
   ring: themeTokenSchema.optional(),
});

export const tournamentPageThemeSchema = z.object({
   radius: z.number().min(0).max(2).nullable().optional(),
   light: tournamentThemeTokensSchema.nullable().optional(),
   dark: tournamentThemeTokensSchema.nullable().optional(),
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

export const createTournamentSchema = z
   .object({
      id: tournamentIdValueSchema.describe("Unique tournament identifier"),
      name: z.string().min(1).describe("Full tournament name"),
      acronym: z
         .string()
         .max(TOURNAMENT_ACRONYM_MAX_LENGTH)
         .optional()
         .describe(
            `Short acronym (up to ${TOURNAMENT_ACRONYM_MAX_LENGTH} characters)`,
         ),
      rendition: z
         .number()
         .int()
         .positive()
         .optional()
         .describe("Edition number"),
      description: z.string().max(255).optional().describe("Brief description"),
      startDate: z.coerce.date().describe("Tournament start date"),
      endDate: z.coerce.date().describe("Tournament end date"),
      isPublic: z.boolean().describe("Whether tournament is visible to public"),
      isArchived: z.boolean().describe("Whether tournament is archived"),
      lobbySize: z
         .number()
         .int()
         .positive()
         .describe("Maximum players per lobby"),
      teamSize: z
         .number()
         .int()
         .positive()
         .describe("Maximum players per team"),
      discord: baseDiscordSchema
         .optional()
         .describe("Discord bot integration settings"),
      bannerUrl: z.string().url().optional().describe("Tournament banner URL"),
      iconUrl: z.string().url().optional().describe("Tournament icon URL"),
   })
   .refine((data) => data.startDate <= data.endDate, {
      message: "startDate must be less than or equal to endDate",
      path: ["endDate"],
   });

const updateTournamentSchemaBase = createUpdateSchema(tournamentTable, {
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

export const updateTournamentSchema = updateTournamentSchemaBase.extend({
   bannerUrl: z.string().url().optional().describe("Tournament banner URL"),
   iconUrl: z.string().url().optional().describe("Tournament icon URL"),
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
      bannerUrl: true,
      iconUrl: true,
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

export const updateTournamentContentSchema = baseIdSchema.extend({
   body: z
      .string()
      .max(tournamentPageBodyMaxLength)
      .optional()
      .describe("Tournament markdown body content"),
   fontFamily: z
      .string()
      .trim()
      .max(tournamentPageFontMaxLength)
      .nullable()
      .optional()
      .describe("Tournament page font family"),
   theme: tournamentPageThemeSchema
      .nullable()
      .optional()
      .describe("Serialized shadcn-style theme tokens"),
});

export const previewTournamentMarkdownSchema = baseIdSchema.extend({
   body: z
      .string()
      .max(tournamentPageBodyMaxLength)
      .describe("Markdown body to render"),
});

export const createTournamentContentImageUploadSchema = baseIdSchema.extend({
   fileName: z.string().trim().min(1).max(255).describe("Original file name"),
   contentType: z
      .string()
      .trim()
      .regex(/^image\/(jpeg|png|webp|gif)$/i, "Only image uploads are allowed")
      .describe("Image MIME type"),
   sizeBytes: z
      .number()
      .int()
      .positive()
      .max(5 * 1024 * 1024)
      .describe("Image size in bytes"),
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
export type PreviewTournamentMarkdownInput = z.infer<
   typeof previewTournamentMarkdownSchema
>;
export type CreateTournamentContentImageUploadInput = z.infer<
   typeof createTournamentContentImageUploadSchema
>;
