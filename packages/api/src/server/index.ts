import { publicProcedure, router } from "../orpc";

export const appRouter = router({
   user: {
      me: {
         user: publicProcedure.handler(() => {
            return { a: 1 };
         }),
      },
   },
});

export type AppRouter = typeof appRouter;
