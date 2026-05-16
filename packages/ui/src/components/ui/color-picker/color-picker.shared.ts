import type { HTMLButtonAttributes } from "svelte/elements";

import type { WithElementRef } from "@ota/ui/utils.js";

export type ColorPickerValue = `#${string}`;

export type ColorPickerProps = WithElementRef<
   Omit<HTMLButtonAttributes, "value">
> & {
   value?: ColorPickerValue;
   open?: boolean;
   label?: string;
   name?: string;
   variant?: "default" | "pill";
   swatches?: ColorPickerValue[];
   pickerWidth?: number;
   showAlpha?: boolean;
   contentClass?: string;
   pickerOptions?: Record<string, unknown>;
   onValueChange?: (value?: ColorPickerValue) => void;
};

export const DEFAULT_COLOR: ColorPickerValue = "#3b82f6";
export const TRANSPARENT_PREVIEW =
   "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 20 20'%3E%3Crect width='20' height='20' fill='%23161521'/%3E%3Cpath d='M0 0h10v10H0zm10 10h10v10H10z' fill='%23272335'/%3E%3C/svg%3E\")";
export const TRANSPARENT_LABEL = "transparent";

export const DEFAULT_SWATCHES = [
   "#f97316",
   "#facc15",
   "#22c55e",
   "#06b6d4",
   "#3b82f6",
   "#8b5cf6",
   "#ec4899",
   "#111827",
] as const satisfies readonly ColorPickerValue[];

export function normalizeHex(
   nextValue: string | undefined | null,
): ColorPickerValue | null {
   const trimmed = nextValue?.trim().toLowerCase();

   if (!trimmed) {
      return null;
   }

   return /^#(?:[\da-f]{3}|[\da-f]{4}|[\da-f]{6}|[\da-f]{8})$/i.test(trimmed)
      ? (trimmed as ColorPickerValue)
      : null;
}
