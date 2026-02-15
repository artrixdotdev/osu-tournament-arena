import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = ({ locals }) => {
   return {
      user: locals.user ?? null,
      signupCompleted: locals.user?.signupCompletedAt ?? null,
   };
};
