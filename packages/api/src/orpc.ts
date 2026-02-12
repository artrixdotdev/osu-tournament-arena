import { os } from "@orpc/server";

import type { RequestHeadersPluginContext } from "@orpc/server/plugins";

import { authMiddleware } from "./middleware/auth";

/* eslint-disable @typescript-eslint/no-empty-object-type */
export interface ORPCContext extends RequestHeadersPluginContext {}

/**
 * Initialization of oRPC backend
 */

export const router = os.router.bind(os);
export const base = os.$context<ORPCContext>();
export const authorized = base.use(authMiddleware);
