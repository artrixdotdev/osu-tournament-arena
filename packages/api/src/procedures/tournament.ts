/* eslint-disable @typescript-eslint/no-unnecessary-condition */

import { randomUUID } from "node:crypto";

import { ORPCError } from "@orpc/server";
import { and, desc, DrizzleQueryError, eq, lt } from "drizzle-orm";

import { db } from "@ota/db/client";
import {
   screeningRequirements as screeningRequirementsTable,
   staff,
   StaffRole,
   tournament as tournamentTable,
   tournamentContent as tournamentContentTable,
} from "@ota/db/schema";
import { createS3Storage } from "@ota/storage";
import {
   createTournamentMediaUploadSchema,
   createTournamentSchema,
   tournamentIdSchema,
   tournamentListSchema,
   updateTournamentContentSchema,
   updateTournamentDetailsSchema,
   updateTournamentDiscordSchema,
   updateTournamentScheduleSchema,
   updateTournamentScreeningRequirementsSchema,
   updateTournamentSettingsSchema,
   updateTournamentVisibilitySchema,
} from "@ota/validators/tournament";

import { requireAdmin, requireHost } from "../middleware/staff";
import { authorized, base } from "../orpc";
import { renderSafeTournamentMarkdown } from "../utils/tournament-content";

const updateTournamentSettingsAndScreeningSchema =
   updateTournamentSettingsSchema.and(
      updateTournamentScreeningRequirementsSchema,
   );
const tournamentStorage = createS3Storage();
const TOURNAMENT_MEDIA_UPLOAD_URL_EXPIRES_SECONDS = 900;

function sanitizeFileName(fileName: string): string {
   const normalized = fileName.trim().toLowerCase();
   const sanitized = normalized
      .replace(/[^a-z0-9._-]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");

   return sanitized.slice(0, 120) || "file";
}

async function getTournamentById(id: string) {
   const [tournament] = await db
      .select()
      .from(tournamentTable)
      .where(and(eq(tournamentTable.id, id), eq(tournamentTable.isDeleted, false)))
      .limit(1);

   return tournament ?? null;
}

async function getTournamentContentById(id: string) {
   const [content] = await db
      .select()
      .from(tournamentContentTable)
      .where(eq(tournamentContentTable.tournamentId, id))
      .limit(1);

   return content ?? null;
}

/**
 * Applies a partial update to a tournament record.
 *
 * Skips the database call entirely if no fields are defined,
 * otherwise sets the provided fields on the matching row.
 *
 * @param id - Tournament ID to update
 * @param fields - Partial record of columns to set
 * @returns `{ updated: false }` when no-op, or `{ updated: true, tournament }` on success
 */
async function applyUpdate<T extends Record<string, unknown>>(
   id: string,
   fields: T,
) {
   const hasUpdates = Object.values(fields).some((v) => v !== undefined);

   if (!hasUpdates) {
      return { updated: false as const };
   }

   const [updated] = await db
      .update(tournamentTable)
      .set(fields)
      .where(eq(tournamentTable.id, id))
      .returning();

   if (!updated) {
      throw new ORPCError("NOT_FOUND", {
         message: "Tournament not found",
      });
   }

   return { updated: true as const, tournament: updated };
}

/**
 * Tournament procedures.
 *
 * ## Route Visibility
 *
 * - Public procedures (accessible via REST API and RPC):
 *   - `get` - GET /tournament/:id
 *   - `list` - GET /tournaments
 *
 * - Protected procedures (RPC only, requires authentication + staff role):
 *   - `create` - Create a new tournament (requires HOST role)
 *   - `updateDetails` - Update display info (requires ADMIN role)
 *   - `updateSchedule` - Update start/end dates (requires ADMIN role)
 *   - `updateSettings` - Update gameplay settings (requires HOST role)
 *   - `updateVisibility` - Update public visibility (requires HOST role)
 *   - `updateDiscord` - Update Discord integration (requires ADMIN role)
 *   - `archive` - Soft archive a tournament (requires ADMIN role)
 *
 * @example
 * ```typescript
 * // RPC client (all procedures)
 * const client = orpc({});
 *
 * // Public - GET single tournament
 * const tournament = await client.tournament.get({ id: "owc2026" });
 *
 * // Public - GET list of tournaments
 * const tournaments = await client.tournament.list({ limit: 10 });
 *
 * // Protected - Create tournament (requires HOST role)
 * await client.tournament.create({ ... });
 *
 * // Protected - Update display info (requires ADMIN role)
 * await client.tournament.updateDetails({ id: "owc2026", name: "New Name" });
 *
 * // Protected - Update schedule (requires ADMIN role)
 * await client.tournament.updateSchedule({ id: "owc2026", startDate: new Date() });
 *
 * // Protected - Update settings (requires HOST role)
 * await client.tournament.updateSettings({ id: "owc2026", lobbySize: 8 });
 *
 * // Protected - Update visibility (requires HOST role)
 * await client.tournament.updateVisibility({ id: "owc2026", isPublic: true });
 *
 * // Protected - Update Discord settings (requires ADMIN role)
 * await client.tournament.updateDiscord({ id: "owc2026", discord: { guildId: "..." } });
 *
 * // Protected - Archive tournament (requires ADMIN role)
 * await client.tournament.archive({ id: "owc2026" });
 * ```
 *
 * @example
 * ```bash
 * # REST API - Get single tournament
 * curl https://your-domain.com/api/tournament/owc2026
 *
 * # REST API - List public tournaments
 * curl "https://your-domain.com/api/tournaments?limit=10"
 * ```
 */
export const tournamentProcedures = {
   /**
    * Retrieves a single tournament by ID.
    *
    * **Access:** Public (no authentication required)
    * **OpenAPI:** GET /tournament/:id
    * **RPC:** Yes
    *
    * Only returns the tournament if it is public or archived.
    * Non-public, non-archived tournaments return null.
    *
    * @param input.id - The unique tournament identifier
    * @returns Tournament object or null if not found / not visible
    *
    * @example
    * ```bash
    * curl https://your-domain.com/api/tournament/owc2026
    * ```
    *
    * @example
    * ```typescript
    * const tournament = await orpc.tournament.get({ id: "owc2026" });
    * ```
    */
   get: base
      .route({
         method: "GET",
         path: "/tournament/{id}",
         summary: "Get tournament by ID",
         description:
            "Retrieves a single tournament by its unique identifier. Returns public tournaments without authentication.",
         tags: ["tournament"],
      })
      .input(tournamentIdSchema)
      .handler(async ({ input }) => {
         const result = await db
            .select()
            .from(tournamentTable)
            .where(
               and(
                  eq(tournamentTable.id, input.id),
                  eq(tournamentTable.isDeleted, false),
               ),
            )
            .limit(1);

         const tournament = result[0] ?? null;

         if (!tournament) {
            return null;
         }

         if (!tournament.isPublic && !tournament.isArchived) {
            return null;
         }

         return tournament;
      }),

   getContent: base
      .route({
         method: "GET",
         path: "/tournament/{id}/content",
         summary: "Get tournament page content",
         description:
            "Retrieves the tournament page content (markdown and customization settings) for public tournaments.",
         tags: ["tournament"],
      })
      .input(tournamentIdSchema)
      .handler(async ({ input }) => {
         const tournament = await getTournamentById(input.id);

         if (!tournament) {
            return null;
         }

         if (!tournament.isPublic && !tournament.isArchived) {
            return null;
         }

         const content = await getTournamentContentById(input.id);
         const body = content?.body ?? "";

         return {
            tournament,
            content: {
               body,
               renderedBody: await renderSafeTournamentMarkdown(body),
               fontFamily: content?.fontFamily ?? null,
               themeColors: content?.themeColors ?? null,
            },
         };
      }),

   getContentForStaff: authorized
      .input(tournamentIdSchema)
      .use(requireAdmin())
      .handler(async ({ input }) => {
         const tournament = await getTournamentById(input.id);

         if (!tournament) {
            throw new ORPCError("NOT_FOUND", {
               message: "Tournament not found",
            });
         }

         const content = await getTournamentContentById(input.id);
         const body = content?.body ?? "";

         return {
            tournament,
            content: {
               body,
               renderedBody: await renderSafeTournamentMarkdown(body),
               fontFamily: content?.fontFamily ?? null,
               themeColors: content?.themeColors ?? null,
            },
         };
      }),

   /**
    * Lists public tournaments with pagination.
    *
    * **Access:** Public (no authentication required)
    * **OpenAPI:** GET /tournaments
    * **RPC:** Yes
    *
    * Results are sorted by start date (newest first).
    * Uses cursor-based pagination for consistent results.
    *
    * @param input.limit - Maximum number of results (default: 20, max: 100)
    * @param input.cursor - Cursor for pagination (last tournament ID from previous response)
    * @returns Object with `tournaments` array and `nextCursor` (null when no more pages)
    *
    * @example
    * ```bash
    * curl "https://your-domain.com/api/tournaments?limit=10"
    * ```
    *
    * @example
    * ```bash
    * # Pagination example
    * curl "https://your-domain.com/api/tournaments?limit=10&cursor=owc2025"
    * ```
    *
    * @example
    * ```typescript
    * const result = await orpc.tournament.list({ limit: 10 });
    * // { tournaments: [...], nextCursor: "owc2024" }
    * ```
    */
   list: base
      .route({
         method: "GET",
         path: "/tournaments",
         summary: "List public tournaments",
         description:
            "Returns a paginated list of public tournaments. Results are sorted by start date (newest first).",
         tags: ["tournament"],
      })
      .input(tournamentListSchema)
      .handler(async ({ input }) => {
         const { limit, cursor } = input;

         const conditions = [
            eq(tournamentTable.isPublic, true),
            eq(tournamentTable.isDeleted, false),
         ];

         if (cursor) {
            conditions.push(lt(tournamentTable.id, cursor));
         }

         const result = await db
            .select()
            .from(tournamentTable)
            .where(and(...conditions))
            .orderBy(desc(tournamentTable.startDate))
            .limit(limit + 1);

         const hasMore = result.length > limit;
         const tournaments = hasMore ? result.slice(0, -1) : result;
         const nextCursor = hasMore
            ? tournaments[tournaments.length - 1]?.id
            : null;

         return {
            tournaments,
            nextCursor,
         };
      }),

   /**
    * Creates a new tournament.
    *
    * **Access:** Protected (requires authentication)
    * **OpenAPI:** Not exposed
    * **RPC:** Yes (only)
    *
    * The tournament ID must be provided upfront as part of the input.
    * The authenticated user must have HOST-level permissions.
    *
    * @param input - Tournament creation data matching `createTournamentSchema`
    * @returns The created tournament object
    *
    * @example
    * ```typescript
    * const newTournament = await orpc.tournament.create({
    *    id: "owc2026",
    *    name: "osu! World Cup 2026",
    *    acronym: "OWC",
    *    rendition: 16,
    *    description: "The premier osu! team tournament",
    *    startDate: new Date("2026-10-01"),
    *    endDate: new Date("2026-12-01"),
    *    isPublic: true,
    *    isArchived: false,
    *    lobbySize: 16,
    *    teamSize: 8,
    * });
    * ```
    */
   create: authorized
      .input(createTournamentSchema)
      .handler(async ({ input, context }) => {
         try {
            const tournament = await db.transaction(async (tx) => {
               const [createdTournament] = await tx
                  .insert(tournamentTable)
                  .values({
                     ...input,
                  })
                  .returning();

               if (!createdTournament) {
                  throw new ORPCError("INTERNAL_SERVER_ERROR", {
                     message: "Failed to create tournament",
                  });
               }

               await tx.insert(staff).values({
                  tournamentId: createdTournament.id,
                  userId: context.user.id,
                  roles: [StaffRole.HOST],
               });

               return createdTournament;
            });

            return tournament;
         } catch (error) {
            if (error instanceof DrizzleQueryError) {
               const sqlError: (Error & { code?: string }) | undefined =
                  error.cause;
               if (sqlError && sqlError.code === "SQLITE_CONSTRAINT") {
                  throw new ORPCError("CONFLICT", {
                     message: "This ID is already in use",
                  });
               }
            }
            throw error;
         }
      })
      .callable(),

   /**
    * Updates tournament display information.
    *
    * **Access:** Protected (requires authentication + ADMIN role or higher)
    * **OpenAPI:** Not exposed
    * **RPC:** Yes (only)
    *
    * All fields are optional. If no fields are provided, the handler
    * short-circuits and returns `{ updated: false }` without a database call.
    *
    * @param input.id - Tournament ID to update
    * @param input.name - New tournament name (1-100 chars)
    * @param input.acronym - New short identifier (max 6 chars)
    * @param input.rendition - New edition number (positive integer)
    * @param input.description - New description (max 255 chars)
    * @returns `{ updated: false }` if no fields provided, or `{ updated: true, tournament }` on success
    *
    * @example
    * ```typescript
    * // Update name only
    * await orpc.tournament.updateDetails({
    *    id: "owc2026",
    *    name: "osu! World Cup 2026 - Special Edition",
    * });
    *
    * // Update multiple fields
    * await orpc.tournament.updateDetails({
    *    id: "owc2026",
    *    name: "osu! World Cup 2026",
    *    acronym: "OWC",
    *    rendition: 17,
    *    description: "Updated description",
    * });
    * ```
    */
   updateDetails: authorized
      .input(updateTournamentDetailsSchema)
      .use(requireAdmin())
      .handler(async ({ input }) => {
         const { id, ...fields } = input;
         return applyUpdate(id, fields);
      }),

   /**
    * Updates tournament start and end dates.
    *
    * **Access:** Protected (requires authentication + ADMIN role or higher)
    * **OpenAPI:** Not exposed
    * **RPC:** Yes (only)
    *
    * Both fields are optional. When both are provided, `startDate` must be
    * before `endDate` (enforced by schema refinement). When only one date is
    * provided, the handler fetches the existing record and validates the
    * resulting date range.
    *
    * @param input.id - Tournament ID to update
    * @param input.startDate - New start date
    * @param input.endDate - New end date
    * @returns `{ updated: false }` if no fields provided, or `{ updated: true, tournament }` on success
    * @throws {ORPCError} BAD_REQUEST if the resulting date range is invalid
    *
    * @example
    * ```typescript
    * // Update both dates
    * await orpc.tournament.updateSchedule({
    *    id: "owc2026",
    *    startDate: new Date("2026-10-15"),
    *    endDate: new Date("2026-12-15"),
    * });
    *
    * // Update only start date (validated against existing end date)
    * await orpc.tournament.updateSchedule({
    *    id: "owc2026",
    *    startDate: new Date("2026-10-15"),
    * });
    * ```
    */
   updateSchedule: authorized
      .input(
         updateTournamentScheduleSchema.refine(
            (data) => {
               if (data.startDate && data.endDate) {
                  return data.startDate < data.endDate;
               }
               return true;
            },
            { message: "startDate must be before endDate" },
         ),
      )
      .use(requireAdmin())
      .handler(async ({ input }) => {
         const { id, ...fields } = input;

         const hasUpdates = Object.values(fields).some((v) => v !== undefined);

         if (!hasUpdates) {
            return { updated: false as const };
         }

         if (
            (fields.startDate && !fields.endDate) ||
            (!fields.startDate && fields.endDate)
         ) {
            const [existing] = await db
               .select({
                  startDate: tournamentTable.startDate,
                  endDate: tournamentTable.endDate,
               })
               .from(tournamentTable)
               .where(eq(tournamentTable.id, id))
               .limit(1);

            if (existing) {
               const start = fields.startDate ?? existing.startDate;
               const end = fields.endDate ?? existing.endDate;

               if (start >= end) {
                  throw new ORPCError("BAD_REQUEST", {
                     message: "startDate must be before endDate",
                  });
               }
            }
         }

         return applyUpdate(id, fields);
      }),

   /**
    * Updates tournament gameplay settings.
    *
    * **Access:** Protected (requires authentication + HOST role)
    * **OpenAPI:** Not exposed
    * **RPC:** Yes (only)
    *
    * Restricted to HOST because changing lobby size or team size
    * affects all downstream bracket and match logic.
    * All fields are optional.
    *
    * @param input.id - Tournament ID to update
    * @param input.lobbySize - New maximum players per lobby (positive integer)
    * @param input.teamSize - New maximum players per team (positive integer)
    * @returns `{ updated: false }` if no fields provided, or `{ updated: true, tournament }` on success
    *
    * @example
    * ```typescript
    * await orpc.tournament.updateSettings({
    *    id: "owc2026",
    *    lobbySize: 8,
    *    teamSize: 4,
    * });
    * ```
    */
   updateSettings: authorized
      .input(updateTournamentSettingsSchema)
      .use(requireHost())
      .handler(async ({ input }) => {
         const { id, ...fields } = input;
         return applyUpdate(id, fields);
      }),

   /**
    * Updates tournament settings and screening requirements atomically.
    *
    * **Access:** Protected (requires authentication + HOST role)
    * **OpenAPI:** Not exposed
    * **RPC:** Yes (only)
    */
   updateSettingsAndScreening: authorized
      .input(updateTournamentSettingsAndScreeningSchema)
      .use(requireHost())
      .handler(async ({ input }) => {
         const {
            id,
            lobbySize,
            teamSize,
            minimumRank,
            maximumRank,
            minimumRating,
            maximumRating,
            allowedCountries,
            useBws,
            minimumBadges,
            bwsExponent,
         } = input;

         const tournamentFields = { lobbySize, teamSize };
         const hasTournamentUpdates = Object.values(tournamentFields).some(
            (v) => v !== undefined,
         );
         const screeningFields = {
            minimumRank,
            maximumRank,
            minimumRating,
            maximumRating,
            allowedCountries,
            useBws,
            minimumBadges,
            bwsExponent,
         };
         const hasScreeningUpdates = Object.values(screeningFields).some(
            (v) => v !== undefined,
         );

         if (!hasTournamentUpdates && !hasScreeningUpdates) {
            return { updated: false as const };
         }

         const result = await db.transaction(async (tx) => {
            let tournament: typeof tournamentTable.$inferSelect | undefined;

            if (hasTournamentUpdates) {
               const [updatedTournament] = await tx
                  .update(tournamentTable)
                  .set(tournamentFields)
                  .where(eq(tournamentTable.id, id))
                  .returning();

               if (!updatedTournament) {
                  throw new ORPCError("NOT_FOUND", {
                     message: "Tournament not found",
                  });
               }

               tournament = updatedTournament;
            }

            let screeningRequirements:
               | typeof screeningRequirementsTable.$inferSelect
               | undefined;
            if (hasScreeningUpdates) {
               const [updatedScreeningRequirements] = await tx
                  .insert(screeningRequirementsTable)
                  .values({
                     tournamentId: id,
                     ...screeningFields,
                  })
                  .onConflictDoUpdate({
                     target: screeningRequirementsTable.tournamentId,
                     set: screeningFields,
                  })
                  .returning();

               screeningRequirements = updatedScreeningRequirements;
            }

            return { tournament, screeningRequirements };
         });

         return {
            updated: true as const,
            ...result,
         };
      }),

   /**
    * Updates tournament screening requirements.
    *
    * **Access:** Protected (requires authentication + HOST role)
    * **OpenAPI:** Not exposed
    * **RPC:** Yes (only)
    *
    * Updates (or creates) the tournament-level screening requirements record.
    * All fields are optional.
    *
    * @param input.id - Tournament ID to update
    * @param input.minimumRank - Minimum allowed rank (inclusive)
    * @param input.maximumRank - Maximum allowed rank (inclusive)
    * @param input.minimumRating - Minimum allowed OTR rating (inclusive)
    * @param input.maximumRating - Maximum allowed OTR rating (inclusive)
    * @param input.allowedCountries - Allowed ISO country codes (null = unrestricted)
    * @returns `{ updated: false }` if no fields provided, or `{ updated: true, screeningRequirements }` on success
    */
   updateScreeningRequirements: authorized
      .input(updateTournamentScreeningRequirementsSchema)
      .use(requireHost())
      .handler(async ({ input }) => {
         const { id, ...fields } = input;

         const hasUpdates = Object.values(fields).some((v) => v !== undefined);
         if (!hasUpdates) {
            return { updated: false as const };
         }

         const [screeningRequirements] = await db
            .insert(screeningRequirementsTable)
            .values({
               tournamentId: id,
               ...fields,
            })
            .onConflictDoUpdate({
               target: screeningRequirementsTable.tournamentId,
               set: fields,
            })
            .returning();

         return {
            updated: true as const,
            screeningRequirements,
         };
      }),

   /**
    * Updates tournament public visibility.
    *
    * **Access:** Protected (requires authentication + HOST role)
    * **OpenAPI:** Not exposed
    * **RPC:** Yes (only)
    *
    * Controls whether the tournament appears in public listings
    * and is accessible via the public `get` endpoint.
    * Restricted to HOST because visibility changes affect
    * all public-facing surfaces.
    *
    * @param input.id - Tournament ID to update
    * @param input.isPublic - Whether the tournament should be publicly visible
    * @returns `{ updated: true, tournament }` with the updated record
    *
    * @example
    * ```typescript
    * // Make tournament public
    * await orpc.tournament.updateVisibility({
    *    id: "owc2026",
    *    isPublic: true,
    * });
    *
    * // Hide tournament from public listings
    * await orpc.tournament.updateVisibility({
    *    id: "owc2026",
    *    isPublic: false,
    * });
    * ```
    */
   updateVisibility: authorized
      .input(updateTournamentVisibilitySchema)
      .use(requireHost())
      .handler(async ({ input }) => {
         const { id, ...fields } = input;
         return applyUpdate(id, fields);
      }),

   /**
    * Updates tournament Discord integration settings.
    *
    * **Access:** Protected (requires authentication + ADMIN role or higher)
    * **OpenAPI:** Not exposed
    * **RPC:** Yes (only)
    *
    * Configures the Discord bot integration for the tournament.
    * Pass `null` to remove the Discord configuration entirely.
    *
    * @param input.id - Tournament ID to update
    * @param input.discord - Discord configuration object, or null to remove
    * @returns `{ updated: true, tournament }` with the updated record
    *
    * @example
    * ```typescript
    * // Set Discord integration
    * await orpc.tournament.updateDiscord({
    *    id: "owc2026",
    *    discord: {
    *       guildId: "123456789",
    *       channelId: "987654321",
    *    },
    * });
    *
    * // Remove Discord integration
    * await orpc.tournament.updateDiscord({
    *    id: "owc2026",
    *    discord: null,
    * });
    * ```
    */
   updateDiscord: authorized
      .input(updateTournamentDiscordSchema)
      .use(requireAdmin())
      .handler(async ({ input }) => {
         const { id, ...fields } = input;
         return applyUpdate(id, fields);
      }),

   updateContent: authorized
      .input(updateTournamentContentSchema)
      .use(requireAdmin())
      .handler(async ({ input }) => {
         const { id, ...fields } = input;
         const hasUpdates = Object.values(fields).some((v) => v !== undefined);

         if (!hasUpdates) {
            return { updated: false as const };
         }

         const tournament = await getTournamentById(id);
         if (!tournament) {
            throw new ORPCError("NOT_FOUND", {
               message: "Tournament not found",
            });
         }

         const existingContent = await getTournamentContentById(id);
         const normalizedFontFamily =
            fields.fontFamily === "" ? null : fields.fontFamily;
         const nextBody = fields.body ?? existingContent?.body ?? "";
         const nextFontFamily =
            normalizedFontFamily === undefined
               ? existingContent?.fontFamily ?? null
               : normalizedFontFamily;
         const nextThemeColors =
            fields.themeColors === undefined
               ? existingContent?.themeColors ?? null
               : fields.themeColors;

         const [content] = existingContent
            ? await db
                 .update(tournamentContentTable)
                 .set({
                    body: nextBody,
                    fontFamily: nextFontFamily,
                    themeColors: nextThemeColors,
                 })
                 .where(eq(tournamentContentTable.tournamentId, id))
                 .returning()
            : await db
                 .insert(tournamentContentTable)
                 .values({
                    tournamentId: id,
                    body: nextBody,
                    fontFamily: nextFontFamily,
                    themeColors: nextThemeColors,
                 })
                 .returning();

         if (!content) {
            throw new ORPCError("INTERNAL_SERVER_ERROR", {
               message: "Failed to update tournament content",
            });
         }

         return {
            updated: true as const,
            content: {
               ...content,
               renderedBody: await renderSafeTournamentMarkdown(content.body),
            },
         };
      }),

   createContentMediaUpload: authorized
      .input(createTournamentMediaUploadSchema)
      .use(requireAdmin())
      .handler(async ({ input }) => {
         const tournament = await getTournamentById(input.id);
         if (!tournament) {
            throw new ORPCError("NOT_FOUND", {
               message: "Tournament not found",
            });
         }

         const safeName = sanitizeFileName(input.fileName);
         const key = `tournaments/${input.id}/${Date.now()}-${randomUUID()}-${safeName}`;

         const uploadUrl = await tournamentStorage.createPresignedPutUrl(
            "tournamentMedia",
            key,
            { expiresIn: TOURNAMENT_MEDIA_UPLOAD_URL_EXPIRES_SECONDS },
         );
         const publicUrl = tournamentStorage.getPublicUrl(
            "tournamentMedia",
            key,
         );

         return {
            key,
            uploadUrl,
            publicUrl,
            maxSizeBytes: 4 * 1024 * 1024,
            contentType: input.contentType,
         };
      }),

   /**
    * Soft archives a tournament.
    *
    * **Access:** Protected (requires authentication + ADMIN role or higher)
    * **OpenAPI:** Not exposed
    * **RPC:** Yes (only)
    *
    * Sets the `isArchived` flag to true, making the tournament read-only.
    * Archived tournaments remain visible via the public `get` endpoint
    * but are excluded from active tournament workflows.
    * Does not permanently delete any data.
    *
    * @param input.id - Tournament ID to archive
    * @returns Empty object on success
    *
    * @example
    * ```typescript
    * await orpc.tournament.archive({ id: "owc2026" });
    * // Returns: {}
    * ```
    */
   archive: authorized
      .input(tournamentIdSchema)
      .use(requireAdmin())
      .handler(async ({ input }) => {
         await db
            .update(tournamentTable)
            .set({ isArchived: true })
            .where(eq(tournamentTable.id, input.id));

         return {};
      })
      .callable(),
};
