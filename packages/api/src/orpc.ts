import { os } from "@orpc/server";

/**
 * Initialization of oRPC backend
 */
export const router = os.router.bind(os);
export const publicProcedure = os;
