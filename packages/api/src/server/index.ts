// import { db } from "@ota/db/client";

import { publicProcedure, router } from "../trpc";

export const appRouter = router({
   user: {
      me: {
         user: publicProcedure.query((_ok) => {
            return { a: 1 };
         }),
      },
   },
});

export type AppRouter = typeof appRouter;
