import { describe, expect, it } from "vitest";

import {
   getTournamentFontStack,
   getTournamentFontStylesheetHref,
} from "./tournament-page";

describe("tournament page typography", () => {
   it("falls back when the stored font family is not allowlisted", () => {
      expect(
         getTournamentFontStack(
            'Inter", var(--font-sans); background: red; --x: "a',
         ),
      ).toBe("var(--font-sans)");
   });

   it("builds stylesheet URLs only for hosted Google fonts", () => {
      expect(getTournamentFontStylesheetHref("Inter")).toBe(
         "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap",
      );
      expect(getTournamentFontStylesheetHref("Readex Pro")).toBeNull();
   });
});
