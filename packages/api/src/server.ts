/**
 * oRPC Server Configuration
 *
 * This module defines the application router for both RPC and OpenAPI access.
 *
 * ## Route Types
 *
 * - **Public routes**: Accessible via both RPC (`/rpc`) and OpenAPI (`/api`)
 *   - Have explicit `.route()` metadata (method, path, summary, etc.)
 *   - Automatically exposed via OpenAPI
 *
 * - **Internal routes**: Only accessible via RPC (`/rpc`)
 *   - No route metadata (automatically excluded from OpenAPI)
 *   - Used for internal application communication
 *
 * @example
 * ```typescript
 * // RPC client (has access to all procedures)
 * const client = orpc({});
 * const user = await client.user.me();
 * await client.user.completeSignup();
 *
 * // OpenAPI (only routes with .route() metadata)
 * // GET /api/user/me
 * // PATCH /api/user/timezone
 * ```
 */

import { router } from "./orpc";
import { tournamentProcedures } from "./procedures/tournament";
import { userProcedures } from "./procedures/user";

/**
 * Application router - all procedures accessible via RPC.
 * Only procedures with `.route()` metadata are exposed via OpenAPI.
 *
 * ## Public Routes (OpenAPI + RPC)
 * - `tournament.get` - GET /tournament/:id
 * - `tournament.list` - GET /tournaments
 * - `user.me` - GET /user/me
 * - `user.updateTimezone` - PATCH /user/timezone
 *
 * ## Protected Routes (RPC Only)
 * - `tournament.create` - Create new tournament (requires HOST)
 * - `tournament.updateDetails` - Update display info (requires ADMIN)
 * - `tournament.updateSchedule` - Update dates (requires ADMIN)
 * - `tournament.updateSettings` - Update gameplay settings (requires HOST)
 * - `tournament.updateVisibility` - Update visibility (requires HOST)
 * - `tournament.updateDiscord` - Update Discord integration (requires ADMIN)
 * - `tournament.archive` - Archive tournament (requires ADMIN)
 * - `user.completeSignup` - Complete user signup
 * - `user.getSignupStatus` - Get signup status
 */
export const appRouter = router({
   tournament: tournamentProcedures,
   user: userProcedures,
});

export type AppRouter = typeof appRouter;
