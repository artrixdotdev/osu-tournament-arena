import type { TournamentThemeColors } from "@ota/db/schema";

const tournamentDateFormatter = new Intl.DateTimeFormat(undefined, {
   month: "short",
   day: "numeric",
   year: "numeric",
   timeZone: "UTC",
});

function toDate(value: Date | string) {
   return value instanceof Date ? value : new Date(value);
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

   for (const [key, value] of Object.entries(themeColors ?? {})) {
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

export function getTournamentInitials(name: string, acronym?: string | null) {
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

export function formatTournamentDate(value: Date | string) {
   return tournamentDateFormatter.format(toDate(value));
}

export function formatTournamentDateRange(
   startDate: Date | string,
   endDate: Date | string,
) {
   const start = formatTournamentDate(startDate);
   const end = formatTournamentDate(endDate);

   return start === end ? start : `${start} to ${end}`;
}

export function getTournamentWindowLabel(
   startDate: Date | string,
   endDate: Date | string,
) {
   const now = Date.now();
   const start = toDate(startDate).getTime();
   const end = toDate(endDate).getTime();

   if (now < start) {
      return "Upcoming";
   }

   if (now > end) {
      return "Completed";
   }

   return "Active";
}

export function toDateInputValue(value: Date | string) {
   return toDate(value).toLocaleDateString("en-CA", {
      timeZone: "UTC",
   });
}
