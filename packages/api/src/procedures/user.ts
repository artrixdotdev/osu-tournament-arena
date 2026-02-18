import { z } from "zod";

import { eq } from "@ota/db";
import { db } from "@ota/db/client";
import { user } from "@ota/db/schema";

import { authorized } from "../orpc";

/**
 * Schema for validating timezone offsets.
 * Valid range is UTC-12 to UTC+14.
 */
const timezoneSchema = z.number().min(-12).max(14);

/**
 * User procedures accessible via both RPC and OpenAPI.
 * These have explicit route metadata for REST endpoints.
 */
export const publicUserProcedures = {
   /**
    * Returns the currently authenticated user.
    *
    * OpenAPI: GET /user/me
    *
    * @returns The user object from the session context
    * @throws {ORPCError} UNAUTHORIZED if no valid session exists
    */
   me: authorized
      .route({
         method: "GET",
         path: "/user/me",
         summary: "Get current user",
         description: "Returns the currently authenticated user's profile",
         tags: ["user"],
      })
      .handler(({ context }) => {
         return context.user;
      }),

   /**
    * Updates the user's timezone preference.
    *
    * OpenAPI: PATCH /user/timezone
    *
    * @param input.timezone - UTC offset from -12 to +14
    * @returns Object indicating success
    * @throws {ORPCError} UNAUTHORIZED if no valid session exists
    */
   updateTimezone: authorized
      .route({
         method: "PATCH",
         path: "/user/timezone",
         summary: "Update user timezone",
         description: "Updates the authenticated user's timezone preference",
         tags: ["user"],
      })
      .input(
         z.object({
            timezone: timezoneSchema.describe("UTC offset from -12 to +14"),
         }),
      )
      .handler(async ({ context, input }) => {
         await db
            .update(user)
            .set({
               timezone: input.timezone,
               updatedAt: new Date(),
            })
            .where(eq(user.id, context.user.id));
         return { success: true };
      }),
};

/**
 * User procedures only accessible via RPC (internal use).
 * These are not exposed through the OpenAPI endpoint.
 */
export const internalUserProcedures = {
   /**
    * Marks the user's signup process as complete.
    * Sets signupCompletedAt to the current timestamp.
    *
    * @returns Object indicating success
    * @throws {ORPCError} UNAUTHORIZED if no valid session exists
    */
   completeSignup: authorized.handler(async ({ context }) => {
      await db
         .update(user)
         .set({
            signupCompletedAt: new Date(),
            updatedAt: new Date(),
         })
         .where(eq(user.id, context.user.id));
      return { success: true };
   }),

   /**
    * Retrieves the user's signup status including Discord link and timezone.
    *
    * @returns Object with discordId, timezone, and signupCompletedAt fields
    * @throws {ORPCError} UNAUTHORIZED if no valid session exists
    */
   getSignupStatus: authorized.handler(async ({ context }) => {
      const result = await db
         .select({
            discordId: user.discordId,
            timezone: user.timezone,
            signupCompletedAt: user.signupCompletedAt,
         })
         .from(user)
         .where(eq(user.id, context.user.id))
         .limit(1);
      return result[0] ?? null;
   }),
};
