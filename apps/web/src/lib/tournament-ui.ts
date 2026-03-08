import { isValid, parseISO } from "date-fns";

import type { TournamentThemeColors } from "@ota/db/schema";

const tournamentDateFormatter = new Intl.DateTimeFormat(undefined, {
   month: "short",
   day: "numeric",
   year: "numeric",
   timeZone: "UTC",
});

function toDate(value: Date | string | null | undefined): Date | null {
   if (!value) {
      return null;
   }
   if (value instanceof Date) {
      return value;
   }
   const parsed = parseISO(value);
   return isValid(parsed) ? parsed : null;
}

export function formatTournamentDate(value: Date | string | null | undefined) {
   const date = toDate(value);
   if (!date) {
      return "";
   }
   return tournamentDateFormatter.format(date);
}

export function formatTournamentDateRange(
   startDate: Date | string | null | undefined,
   endDate: Date | string | null | undefined,
) {
   const start = formatTournamentDate(startDate);
   const end = formatTournamentDate(endDate);

   if (!start || !end) {
      return "";
   }

   return start === end ? start : `${start} to ${end}`;
}

export function getTournamentFontHref(fontFamily?: string | null) {
   const family = fontFamily?.trim();

   if (!family) {
      return null;
   }

   return `https://fonts.googleapis.com/css2?family=${encodeURIComponent(family).replace(/%20/g, "+")}:wght@400;500;600;700&display=swap`;
}

export function getTournamentScopeStyle(
   themeColors?: Partial<TournamentThemeColors> | null,
   fontFamily?: string | null,
) {
   const styles: string[] = [];

   for (const [key, value] of Object.entries(
      (themeColors as Record<string, string | null> | null) ?? {},
   )) {
      const token = value?.trim();
      if (token) {
         styles.push(`--t-${key}:${token};`);
      }
   }

   if (fontFamily?.trim()) {
      const escapedFont = fontFamily.trim().replace(/'/g, "\\'");
      styles.push(`--t-font:'${escapedFont}', sans-serif;`);
   }

   return styles.join(" ");
}

export function getTournamentInitials(
   name: string | undefined | null,
   acronym?: string | null,
) {
   if (!name?.trim()) {
      return "";
   }

   const normalizedAcronym = acronym?.trim();
   if (normalizedAcronym) {
      return normalizedAcronym.slice(0, 2).toUpperCase();
   }

   return name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? "")
      .join("");
}

export function getTournamentWindowLabel(
   startDate: Date | string | null | undefined,
   endDate: Date | string | null | undefined,
) {
   const start = toDate(startDate);
   const end = toDate(endDate);

   if (!start || !end) {
      return "";
   }

   const now = Date.now();
   const startTime = start.getTime();
   const endTime = end.getTime();

   if (now < startTime) {
      return "Upcoming";
   }

   if (now > endTime) {
      return "Completed";
   }

   return "Active";
}

export function toDateInputValue(value: Date | string | null | undefined) {
   const date = toDate(value);
   if (!date) {
      return "";
   }
   return date.toLocaleDateString("en-CA", {
      timeZone: "UTC",
   });
}
