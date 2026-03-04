// sqlite is a bit dumb and doesn't support boolean or timestamp columns natively

import { sql } from "drizzle-orm";
import { check, integer, text } from "drizzle-orm/sqlite-core";

export const boolean = () => integer({ mode: "boolean" });
export const timestamp = () => integer({ mode: "timestamp" });
export const json = <T>() => text({ mode: "json" }).$type<T>();
export const array = <T>() => json<T[]>();
export const enumurate = <const T extends Record<string, string>>(x: T) => {
   const values = Object.values(x) as [T[keyof T], ...T[keyof T][]];
   return text({ enum: values });
};

/**
 * Creates a check constraint ensuring a numeric value is positive (> 0)
 */
export const positiveCheck = (name: string, column: unknown) =>
   check(name, sql`${column} > 0`);

/**
 * Creates a check constraint ensuring a numeric value is non-negative (>= 0)
 */
export const nonNegativeCheck = (name: string, column: unknown) =>
   check(name, sql`${column} >= 0`);

/**
 * Creates a check constraint ensuring a value is within a range [min, max]
 */
export const rangeCheck = (
   name: string,
   column: unknown,
   min: number,
   max: number,
) =>
   check(
      name,
      sql`${column} >= ${sql.raw(`${min}`)} AND ${column} <= ${sql.raw(`${max}`)}`,
   );

/**
 * Audit timestamps for database entities
 */
export const auditTimestamps = {
   createdAt: timestamp()
      .notNull()
      .$default(() => new Date()),
   updatedAt: timestamp()
      .notNull()
      .$default(() => new Date())
      .$onUpdate(() => new Date()),
} as const;
