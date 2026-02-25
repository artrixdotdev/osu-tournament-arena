import type { Locale } from "$paraglide/runtime";
import { type Component } from "svelte";
import * as Flags from "svelte-flag-icons";

export const localeFlags: Record<Locale, Component> = {
   en: Flags.Gb,
};

export * as flags from "svelte-flag-icons";
