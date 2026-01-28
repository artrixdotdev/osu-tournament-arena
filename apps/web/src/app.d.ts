// See https://svelte.dev/docs/kit/types#app.d.ts
import type { session, user } from "@ota/db/schema";

type User = typeof user.$inferSelect;
type Session = typeof session.$inferSelect;

// for information about these interfaces
declare global {
   namespace App {
      // interface Error {}
      interface Locals {
         session?: Omit<Session, "ipAddress" | "userAgent" | "userId"> & {
            // Weird hacks to make typescript happy
            ipAddress?: string | null;
            userAgent?: string | null;
         };
         user?: Omit<User, "osuId", "discordId">;
      }
      // interface PageData {}
      // interface PageState {}
      // interface Platform {}
   }
}

export {};
