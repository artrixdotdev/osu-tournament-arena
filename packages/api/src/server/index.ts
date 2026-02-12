import { base, router } from "../orpc";

export const appRouter = router({
   user: {
      me: {
         user: base.handler(() => {
            return { a: 1 };
         }),
      },
   },
});

export type AppRouter = typeof appRouter;
