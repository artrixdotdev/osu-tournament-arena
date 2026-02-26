import { ORPCError } from "@orpc/server";

import type { TournamentIdInput } from "@ota/validators";
import { and, eq } from "@ota/db";
import { db } from "@ota/db/client";
import { StaffRole, staff as staffTable } from "@ota/db/schema";

import { base } from "../orpc";

/**
 * Role hierarchy for authorization.
 * Lower index = higher privilege.
 * A user with a role can perform actions requiring any role at or above their level.
 */
const ROLE_HIERARCHY: StaffRole[] = [
   StaffRole.HOST,
   StaffRole.ADMIN,
   StaffRole.POOLER,
   StaffRole.PLAYTESTER,
   StaffRole.REFEREE,
   StaffRole.COMMENTATOR,
];

/**
 * Checks if the user's role has sufficient permissions for the required role.
 */
function hasRolePermission(
   userRoles: StaffRole[],
   requiredRole: StaffRole,
): boolean {
   const requiredLevel = ROLE_HIERARCHY.indexOf(requiredRole);

   for (const userRole of userRoles) {
      const userLevel = ROLE_HIERARCHY.indexOf(userRole);
      if (userLevel !== -1 && userLevel <= requiredLevel) {
         return true;
      }
   }

   return false;
}

/**
 * Staff context added when user is a staff member of a tournament.
 */
export interface StaffContext {
   staff: {
      roles: StaffRole[];
   };
}

/**
 * Creates a staff authorization middleware that checks if the user has the required role
 * for a specific tournament.
 *
 * This middleware should be used AFTER the `authorized` middleware.
 *
 * @param requiredRole - The minimum role required to perform the action
 *
 * @example
 * ```typescript
 * // Require HOST role for tournament management
 * const requireTournamentHost = requireStaff(StaffRole.HOST);
 *
 * // In procedure:
 * update: authorized
 *    .use(requireTournamentHost)
 *    .input(...)
 *    .handler(...)
 * ```
 */
export function requireStaff(requiredRole: StaffRole) {
   return base
      .$context<{ user: { id: string } }>()
      .middleware(
         async ({ context, next }, { id: tournamentId }: TournamentIdInput) => {
            if (!tournamentId) {
               throw new ORPCError("BAD_REQUEST", {
                  message: "Tournament ID is required for this operation",
               });
            }

            const staffRecords = await db
               .select({
                  roles: staffTable.roles,
               })
               .from(staffTable)
               .where(
                  and(
                     eq(staffTable.tournamentId, tournamentId),
                     eq(staffTable.userId, context.user.id),
                  ),
               )
               .limit(1);

            const staffRecord = staffRecords[0];

            if (!staffRecord) {
               throw new ORPCError("FORBIDDEN", {
                  message: "User is not a staff member of this tournament",
               });
            }

            if (!hasRolePermission(staffRecord.roles, requiredRole)) {
               throw new ORPCError("FORBIDDEN", {
                  message: `This action requires ${requiredRole} role or higher`,
               });
            }

            return next({
               context: {
                  staff: {
                     roles: staffRecord.roles,
                  },
               },
            });
         },
      );
}

/**
 * Creates a middleware that checks if the user is the host of the tournament.
 *
 * @example
 * ```typescript
 * const requireTournamentHost = requireHost("owc2026");
 *
 * delete: authorized
 *    .use(requireTournamentHost)
 *    .handler(...)
 * ```
 */
export function requireHost() {
   return requireStaff(StaffRole.HOST);
}

/**
 * Creates a middleware that checks if the user is an admin or higher of the tournament.
 *
 * @example
 * ```typescript
 * const requireTournamentAdmin = requireAdmin("owc2026");
 *
 * update: authorized
 *    .use(requireTournamentAdmin)
 *    .handler(...)
 * ```
 */
export function requireAdmin() {
   return requireStaff(StaffRole.ADMIN);
}

/**
 * Creates a middleware that checks if the user is a pooler or higher of the tournament.
 *
 * @example
 * ```typescript
 * const requireMappooler = requirePooler("owc2026");
 *
 * updateMappool: authorized
 *    .use(requireMappooler)
 *    .handler(...)
 * ```
 */
export function requirePooler() {
   return requireStaff(StaffRole.POOLER);
}

/**
 * Creates a middleware that checks if the user is a playtester or higher of the tournament.
 *
 * @example
 * ```typescript
 * const requirePlaytester = requirePlaytester("owc2026");
 *
 * updateMap: authorized
 *    .use(requirePlaytester)
 *    .handler(...)
 * ```
 */
export function requirePlaytester() {
   return requireStaff(StaffRole.PLAYTESTER);
}

/**
 * Creates a middleware that checks if the user is a referee or higher of the tournament.
 *
 * @example
 * ```typescript
 * const requireReferee = requireReferee("owc2026");
 *
 * createMatch: authorized
 *    .use(requireReferee)
 *    .handler(...)
 * ```
 */
export function requireReferee() {
   return requireStaff(StaffRole.REFEREE);
}

/**
 * Creates a middleware that checks if the user is a commentator or higher of the tournament.
 *
 * @example
 * ```typescript
 * const requireCommentator = requireCommentator("owc2026");
 *
 * updateStream: authorized
 *    .use(requireCommentator)
 *    .handler(...)
 * ```
 */
export function requireCommentator() {
   return requireStaff(StaffRole.COMMENTATOR);
}
