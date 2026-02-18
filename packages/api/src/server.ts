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
import { userProcedures } from "./procedures/user";

/**
 * Application router - all procedures accessible via RPC.
 * Only procedures with `.route()` metadata are exposed via OpenAPI.
 */
export const appRouter = router({
   user: userProcedures,
});

export type AppRouter = typeof appRouter;
