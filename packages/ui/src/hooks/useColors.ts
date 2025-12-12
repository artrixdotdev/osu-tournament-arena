"use client";

import { useEffect, useState } from "react";

interface ThemeColors {
   primary: string;
   secondary: string;
   foreground: string;
   background: string;
}

const getColor = (variable: string) => {
   if (typeof window === "undefined") {
      return "lab(0, 0, 0)";
   }
   const color = getComputedStyle(document.body).getPropertyValue(
      `--${variable}`,
   );
   if (!color) {
      return "lab(0, 0, 0)";
   }
   return color.trim();
};

export const useThemeColors = (): ThemeColors => {
   const [colors, setColors] = useState<ThemeColors>({
      primary: getColor("primary"),
      secondary: getColor("secondary"),
      foreground: getColor("foreground"),
      background: getColor("background"),
   });

   useEffect(() => {
      const observer = new MutationObserver(() => {
         setColors({
            primary: getColor("primary"),
            secondary: getColor("secondary"),
            foreground: getColor("foreground"),
            background: getColor("background"),
         });
      });

      observer.observe(document.documentElement, {
         attributes: true,
         attributeFilter: ["class"],
      });

      return () => observer.disconnect();
   }, []);

   return colors;
};
