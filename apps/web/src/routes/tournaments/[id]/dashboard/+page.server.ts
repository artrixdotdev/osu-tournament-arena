import { redirect } from "@sveltejs/kit";

import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ params }) => {
   redirect(307, `/tournament/${params.id}/dashboard`);
};
