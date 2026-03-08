import type { TournamentThemeColors } from "@ota/db/schema";

export const TOURNAMENT_FONT_OPTIONS = [
   "Inter",
   "Manrope",
   "Poppins",
   "Space Grotesk",
   "Merriweather",
   "Bebas Neue",
   "IBM Plex Sans",
   "Roboto Slab",
   "Archivo",
   "Nunito Sans",
] as const;

export const TOURNAMENT_THEME_FIELDS = [
   { key: "background", label: "Background", placeholder: "210 40% 98%" },
   { key: "foreground", label: "Foreground", placeholder: "222.2 47.4% 11.2%" },
   { key: "card", label: "Card", placeholder: "0 0% 100%" },
   {
      key: "cardForeground",
      label: "Card Foreground",
      placeholder: "222.2 47.4% 11.2%",
   },
   { key: "primary", label: "Primary", placeholder: "221.2 83.2% 53.3%" },
   {
      key: "primaryForeground",
      label: "Primary Foreground",
      placeholder: "210 40% 98%",
   },
   { key: "secondary", label: "Secondary", placeholder: "210 40% 96.1%" },
   {
      key: "secondaryForeground",
      label: "Secondary Foreground",
      placeholder: "222.2 47.4% 11.2%",
   },
   { key: "muted", label: "Muted", placeholder: "210 40% 96.1%" },
   {
      key: "mutedForeground",
      label: "Muted Foreground",
      placeholder: "215.4 16.3% 46.9%",
   },
   { key: "accent", label: "Accent", placeholder: "210 40% 96.1%" },
   {
      key: "accentForeground",
      label: "Accent Foreground",
      placeholder: "222.2 47.4% 11.2%",
   },
   { key: "border", label: "Border", placeholder: "214.3 31.8% 91.4%" },
   { key: "input", label: "Input", placeholder: "214.3 31.8% 91.4%" },
   { key: "ring", label: "Ring", placeholder: "221.2 83.2% 53.3%" },
] as const satisfies readonly {
   key: keyof TournamentThemeColors;
   label: string;
   placeholder: string;
}[];

export type TournamentThemeFieldKey = (typeof TOURNAMENT_THEME_FIELDS)[number]["key"];

function clamp(value: number, min: number, max: number) {
   return Math.min(Math.max(value, min), max);
}

function hueToRgb(p: number, q: number, t: number) {
   let normalized = t;

   if (normalized < 0) {
      normalized += 1;
   }

   if (normalized > 1) {
      normalized -= 1;
   }

   if (normalized < 1 / 6) {
      return p + (q - p) * 6 * normalized;
   }

   if (normalized < 1 / 2) {
      return q;
   }

   if (normalized < 2 / 3) {
      return p + (q - p) * (2 / 3 - normalized) * 6;
   }

   return p;
}

function channelToHex(value: number) {
   return Math.round(clamp(value, 0, 255)).toString(16).padStart(2, "0");
}

export function hslTokenToHex(token?: string | null): `#${string}` | undefined {
   const trimmed = token?.trim();

   if (!trimmed) {
      return undefined;
   }

   const match = /^(\d{1,3}(?:\.\d+)?)\s+(\d{1,3}(?:\.\d+)?)%\s+(\d{1,3}(?:\.\d+)?)%$/.exec(
      trimmed,
   );

   if (!match) {
      return undefined;
   }

   const hue = ((Number(match[1]) % 360) + 360) % 360 / 360;
   const saturation = clamp(Number(match[2]) / 100, 0, 1);
   const lightness = clamp(Number(match[3]) / 100, 0, 1);

   if (saturation === 0) {
      const gray = lightness * 255;
      return `#${channelToHex(gray)}${channelToHex(gray)}${channelToHex(gray)}` as `#${string}`;
   }

   const q =
      lightness < 0.5
         ? lightness * (1 + saturation)
         : lightness + saturation - lightness * saturation;
   const p = 2 * lightness - q;
   const red = hueToRgb(p, q, hue + 1 / 3) * 255;
   const green = hueToRgb(p, q, hue) * 255;
   const blue = hueToRgb(p, q, hue - 1 / 3) * 255;

   return `#${channelToHex(red)}${channelToHex(green)}${channelToHex(blue)}` as `#${string}`;
}

export function hexToHslToken(hex: string) {
   const normalized = hex.trim().replace(/^#/, "");

   if (!/^[\da-f]{6}$/i.test(normalized)) {
      return undefined;
   }

   const red = Number.parseInt(normalized.slice(0, 2), 16) / 255;
   const green = Number.parseInt(normalized.slice(2, 4), 16) / 255;
   const blue = Number.parseInt(normalized.slice(4, 6), 16) / 255;
   const max = Math.max(red, green, blue);
   const min = Math.min(red, green, blue);
   const lightness = (max + min) / 2;
   const delta = max - min;

   let hue = 0;
   let saturation = 0;

   if (delta !== 0) {
      saturation =
         lightness > 0.5
            ? delta / (2 - max - min)
            : delta / (max + min);

      switch (max) {
         case red:
            hue = (green - blue) / delta + (green < blue ? 6 : 0);
            break;
         case green:
            hue = (blue - red) / delta + 2;
            break;
         default:
            hue = (red - green) / delta + 4;
      }

      hue /= 6;
   }

   return `${(hue * 360).toFixed(1).replace(/\.0$/, "")} ${(saturation * 100).toFixed(1).replace(/\.0$/, "")}% ${(lightness * 100).toFixed(1).replace(/\.0$/, "")}%`;
}
