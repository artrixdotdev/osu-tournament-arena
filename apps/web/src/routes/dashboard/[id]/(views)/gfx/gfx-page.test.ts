import { fireEvent, render, screen, waitFor } from "@testing-library/svelte";
import { beforeEach, describe, expect, it, vi } from "vitest";

import Page from "./+page.svelte";

const { updateContent, toastSuccess, toastError } = vi.hoisted(() => ({
   updateContent: vi.fn(),
   toastSuccess: vi.fn(),
   toastError: vi.fn(),
}));

vi.mock("$lib/orpc", () => ({
   client: {
      tournament: {
         updateContent,
         previewMarkdown: vi.fn(),
         createContentImageUpload: vi.fn(),
      },
   },
}));

vi.mock("svelte-sonner", () => ({
   toast: {
      success: toastSuccess,
      error: toastError,
   },
}));

vi.mock("$i18n/messages", () => ({
   m: new Proxy(
      {},
      {
         get: (_, key) => () => String(key),
      },
   ),
}));

vi.mock("./components/gfx-editor-panel.svelte", async () => ({
   default: (
      await import("./test-stubs/gfx-editor-panel.stub.svelte")
   ).default,
}));

vi.mock("./components/gfx-preview-panel.svelte", async () => ({
   default: (
      await import("./test-stubs/gfx-preview-panel.stub.svelte")
   ).default,
}));

vi.mock("$lib/components/tournament-theme-fields.svelte", async () => ({
   default: (
      await import("./test-stubs/tournament-theme-fields.stub.svelte")
   ).default,
}));

describe("dashboard gfx page", () => {
   beforeEach(() => {
      updateContent.mockReset();
      updateContent.mockResolvedValue(undefined);
      toastSuccess.mockReset();
      toastError.mockReset();
   });

   it("saves updated theme values edited through the theme panel", async () => {
      render(Page, {
         props: {
            data: {
               dashboard: {
                  tournament: {
                     id: "tournament-1",
                  },
                  content: null,
               },
            } as never,
            form: undefined,
            params: {
               id: "tournament-1",
            },
         },
      });

      await fireEvent.input(await screen.findByLabelText("Background"), {
         target: { value: "0 100% 50%" },
      });

      await fireEvent.click(
         await screen.findByRole("button", {
            name: "Save changes",
         }),
      );

      await waitFor(() => {
         expect(updateContent).toHaveBeenCalledWith({
            id: "tournament-1",
            body: "",
            fontFamily: null,
            theme: {
               radius: null,
               light: {
                  background: "0 100% 50%",
               },
               dark: null,
            },
         });
      });
   });
});
