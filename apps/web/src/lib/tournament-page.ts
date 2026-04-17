import type { TournamentPageTheme } from "@ota/db/schema";
import { getNameInitials } from "@ota/ui/utils.js";

export const TOURNAMENT_FONT_OPTIONS = [
   "Readex Pro",
   "Lora",
   "JetBrains Mono",
   "Inter",
   "Manrope",
   "Poppins",
   "Space Grotesk",
   "Merriweather",
   "IBM Plex Sans",
   "Roboto Slab",
] as const;

const GOOGLE_FONT_FAMILIES = new Set([
   "Inter",
   "Manrope",
   "Poppins",
   "Space Grotesk",
   "Merriweather",
   "IBM Plex Sans",
   "Roboto Slab",
]);

function toCssVariableEntries(prefix: string, tokens?: object | null) {
   return Object.entries(tokens ?? {}).flatMap(([key, value]) => {
      if (typeof value !== "string" || !value) {
         return [];
      }

      return [[`--${prefix}-${key}`, value]];
   });
}

export function getTournamentThemeStyle(theme?: TournamentPageTheme | null) {
   const entries = [
      ...toCssVariableEntries("tp-light", theme?.light ?? undefined),
      ...toCssVariableEntries("tp-dark", theme?.dark ?? undefined),
   ];

   if (theme?.radius != null) {
      entries.push(["--tp-radius", `${theme.radius}rem`]);
   }

   return entries.map(([key, value]) => `${key}: ${value};`).join(" ");
}

export function getTournamentFontStylesheetHref(fontFamily?: string | null) {
   if (!fontFamily || !GOOGLE_FONT_FAMILIES.has(fontFamily)) {
      return null;
   }

   const family = fontFamily.trim().replace(/\s+/g, "+");
   return `https://fonts.googleapis.com/css2?family=${family}:wght@400;500;600;700;800&display=swap`;
}

export function getTournamentFontStack(fontFamily?: string | null) {
   if (!fontFamily) {
      return "var(--font-sans)";
   }

   const trimmed = fontFamily.trim();
   return `"${trimmed}", var(--font-sans)`;
}

export function getTournamentMonogram(tournament: {
   name: string;
   acronym?: string | null;
}) {
   return getNameInitials(tournament.acronym ?? tournament.name);
}

export function getTournamentPublicPath(tournamentId: string) {
   return `/tournament/${tournamentId}`;
}

export function stringifyTournamentTheme(theme?: TournamentPageTheme | null) {
   return theme ? JSON.stringify(theme, null, 2) : "";
}

export function parseTournamentTheme(themeJson: string) {
   const trimmed = themeJson.trim();

   if (!trimmed) {
      return null;
   }

   return JSON.parse(trimmed) as TournamentPageTheme;
}
