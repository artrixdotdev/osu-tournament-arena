import { z } from "zod/v4";

function normalizeNumericInputToString(value: unknown): string {
   if (value === undefined || value === null) {
      return "";
   }

   if (typeof value === "number") {
      return Number.isFinite(value) ? String(value) : "";
   }

   if (typeof value === "string") {
      return value;
   }

   return "";
}

export const numericInputAsStringSchema = z.preprocess(
   normalizeNumericInputToString,
   z.string(),
);

export function parseOptionalInt(value: unknown) {
   const trimmed = normalizeNumericInputToString(value).trim();
   if (!trimmed) {
      return undefined;
   }

   if (!/^[+-]?\d+$/.test(trimmed)) {
      return undefined;
   }

   const parsed = Number(trimmed);
   if (!Number.isInteger(parsed)) {
      return undefined;
   }

   return parsed;
}

export function parseOptionalFloat(value: unknown) {
   const trimmed = normalizeNumericInputToString(value).trim();
   if (!trimmed) {
      return undefined;
   }

   if (!/^[+-]?(?:\d+(?:\.\d+)?|\.\d+)(?:[eE][+-]?\d+)?$/.test(trimmed)) {
      return undefined;
   }

   const parsed = Number(trimmed);
   if (!Number.isFinite(parsed)) {
      return undefined;
   }

   return parsed;
}
