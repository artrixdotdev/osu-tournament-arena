import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

import { auditTimestamps, boolean, timestamp } from "../util";

export const user = sqliteTable(
   "user",
   () => ({
      id: text().primaryKey(),
      name: text().notNull(),
      emailVerified: boolean().default(false),
      image: text(),
      email: text(),
      osuId: text().unique(),
      discordId: text().unique(),
      timezone: integer().notNull().default(0),
      signupCompletedAt: timestamp(),
      ...auditTimestamps,
   }),
   (table) => [
      index("user_email_idx").on(table.email),
      index("user_osuId_idx").on(table.osuId),
      index("user_discordId_idx").on(table.discordId),
   ],
);

export const session = sqliteTable("session", () => ({
   id: text().primaryKey(),
   expiresAt: timestamp().notNull(),
   token: text().notNull().unique(),
   ipAddress: text(),
   userAgent: text(),
   userId: text()
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
   ...auditTimestamps,
}));

export const account = sqliteTable(
   "account",
   (t) => ({
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
      ...auditTimestamps,
   }),
   (table) => [
      index("account_user_id_idx").on(table.userId),
      index("account_account_id_idx").on(table.accountId),
      index("account_provider_id_idx").on(table.providerId),
   ],
);

export const verification = sqliteTable("verification", () => ({
   id: text().primaryKey(),
   identifier: text().notNull(),
   value: text().notNull(),
   expiresAt: timestamp().notNull(),
   ...auditTimestamps,
}));
