import { describe, expect, it } from "vitest";

import {
   getSafeCssUrl,
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

describe("safe CSS URLs", () => {
   it("escapes characters that could break out of url()", () => {
      expect(getSafeCssUrl("https://example.com/banner).png")).toBe(
         'url("https://example.com/banner%29.png")',
      );
   });

   it("rejects non-http protocols", () => {
      expect(getSafeCssUrl("javascript:alert(1)")).toBe("");
   });
});
