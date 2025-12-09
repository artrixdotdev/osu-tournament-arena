import { sqliteTable, text } from "drizzle-orm/sqlite-core";

import { boolean, timestamp } from "../util";

export const user = sqliteTable("user", () => ({
   id: text().primaryKey(),
   name: text().notNull(),
   emailVerified: boolean().default(false),
   image: text(),
   email: text(),
   osuId: text(),
   discordId: text(),
   updatedAt: timestamp().notNull(),
   createdAt: timestamp().notNull(),
}));

export const session = sqliteTable("session", () => ({
   id: text().primaryKey(),
   expiresAt: timestamp().notNull(),
   token: text().notNull().unique(),
   createdAt: timestamp().notNull(),
   updatedAt: timestamp().notNull(),
   ipAddress: text(),
   userAgent: text(),
   userId: text()
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
}));

export const account = sqliteTable("account", (t) => ({
   id: text().primaryKey(),
   accountId: text().notNull(),
   providerId: text().notNull(),
   userId: t
      .text()
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
   accessToken: text(),
   refreshToken: text(),
   idToken: text(),
   accessTokenExpiresAt: timestamp(),
   refreshTokenExpiresAt: timestamp(),
   scope: text(),
   password: text(),
   createdAt: timestamp().notNull(),
   updatedAt: timestamp().notNull(),
}));

export const verification = sqliteTable("verification", () => ({
   id: text().primaryKey(),
   identifier: text().notNull(),
   value: text().notNull(),
   expiresAt: timestamp().notNull(),
   createdAt: timestamp(),
   updatedAt: timestamp(),
}));
