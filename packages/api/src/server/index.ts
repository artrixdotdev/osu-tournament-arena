import { z } from "zod";

import { eq } from "@ota/db";
import { db } from "@ota/db/client";
import { user } from "@ota/db/schema";

import { authorized, router } from "../orpc";

/**
 * Schema for validating timezone offsets.
 * Valid range is UTC-12 to UTC+14.
 */
const timezoneSchema = z.number().min(-12).max(14);

/**
 * The main application router containing all API procedures.
 *
 * All user-related procedures require authentication and are nested under `user`.
 *
 * @example
 * ```typescript
 * const client = orpc({});
 * // Get current user
 * const user = await client.user.me();
 * // Update timezone
 * await client.user.updateTimezone({ timezone: -5 });
 * ```
 */
export const appRouter = router({
   user: {
      /**
       * Returns the currently authenticated user.
       *
       * @returns The user object from the session context
       * @throws {ORPCError} UNAUTHORIZED if no valid session exists
       */
      me: authorized.handler(({ context }) => {
         return context.user;
      }),
      /**
       * Updates the user's timezone preference.
       *
       * @param input.timezone - UTC offset from -12 to +14
       * @returns Object indicating success
       * @throws {ORPCError} UNAUTHORIZED if no valid session exists
       */
      updateTimezone: authorized
         .input(z.object({ timezone: timezoneSchema }))
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
   },
});

export type AppRouter = typeof appRouter;
