/**
 * oRPC Server Configuration
 *
 * This module defines the application routers for both RPC and OpenAPI access.
 *
 * ## Route Types
 *
 * - **Public routes**: Accessible via both RPC (`/rpc`) and OpenAPI (`/api`)
 *   - Have explicit route metadata (method, path, summary, etc.)
 *   - Designed for external API consumption
 *
 * - **Internal routes**: Only accessible via RPC (`/rpc`)
 *   - No route metadata (not exposed via OpenAPI)
 *   - Used for internal application communication
 *
 * @example
 * ```typescript
 * // RPC client (has access to all procedures)
 * const client = orpc({});
 * const user = await client.user.me();
 * await client.user.completeSignup();
 *
 * // OpenAPI (only public routes)
 * // GET /api/user/me
 * // PATCH /api/user/timezone
 * ```
 */

import { router } from "./orpc";
import {
   internalUserProcedures,
   publicUserProcedures,
} from "./procedures/user";

/**
 * Public API router - procedures exposed via OpenAPI.
 * Only procedures with explicit route metadata are included.
 *
 * This router is used by the OpenAPIHandler at `/api`.
 */
export const apiRouter = router({
   user: publicUserProcedures,
});

/**
 * Full application router - all procedures accessible via RPC.
 * Combines both public and internal procedures.
 *
 * This router is used by the RPCHandler at `/rpc`.
 */
export const appRouter = router({
   user: {
      ...publicUserProcedures,
      ...internalUserProcedures,
   },
});

export type AppRouter = typeof appRouter;
export type ApiRouter = typeof apiRouter;
