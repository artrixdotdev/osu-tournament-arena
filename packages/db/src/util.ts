// sqlite is a bit dumb and doesn't support boolean or timestamp columns natively

import { integer, text } from "drizzle-orm/sqlite-core";

export const boolean = () => integer({ mode: "boolean" });
export const timestamp = () => integer({ mode: "timestamp" });
export const json = <T>() => text({ mode: "json" }).$type<T>();
export const array = <T>() => json<T[]>();
export const enumurate = <const T extends Record<string, string>>(x: T) => {
   const values = Object.values(x) as [T[keyof T], ...T[keyof T][]];
   return text({ enum: values });
};
