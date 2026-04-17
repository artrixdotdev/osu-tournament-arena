import type { PageServerLoad } from "./$types";
import { createDashboardTabGuardLoad } from "$lib/server/dashboard";

export const load: PageServerLoad = createDashboardTabGuardLoad("gfx");
