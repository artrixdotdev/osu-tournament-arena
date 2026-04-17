<script lang="ts">
   import { untrack } from "svelte";
   import { toast } from "svelte-sonner";

   import { m } from "$i18n/messages";
   import { client } from "$lib/orpc";

   import { uploadFile } from "@ota/storage/client";
   import type { DashboardThemeState } from "@ota/validators";

   import DashboardLazySection from "../shared/components/dashboard-lazy-section.svelte";

   import type { PageProps } from "./$types";

   let { data }: PageProps = $props();
   const dashboard = $derived(data.dashboard);
   const initialContent = untrack(() => data.dashboard.content);

   let body = $state(initialContent?.body ?? "");
   let fontFamily = $state(initialContent?.fontFamily ?? "");
   let radius = $state(initialContent?.theme?.radius?.toString() ?? "");
   let lightTheme = $state<DashboardThemeState>(
      initialContent?.theme?.light ?? {},
   );
   let darkTheme = $state<DashboardThemeState>(
      initialContent?.theme?.dark ?? {},
   );
   let themeMode = $state<"light" | "dark">("light");
   let saving = $state(false);

   function buildThemePayload() {
      const nextRadius = Number(radius);
      const normalizedRadius =
         radius.trim() && Number.isFinite(nextRadius) ? nextRadius : null;
      const normalizedLight =
         Object.keys(lightTheme).length > 0 ? lightTheme : null;
      const normalizedDark =
         Object.keys(darkTheme).length > 0 ? darkTheme : null;

      if (
         normalizedRadius === null &&
         normalizedLight === null &&
         normalizedDark === null
      ) {
         return null;
      }

      return {
         radius: normalizedRadius,
         light: normalizedLight,
         dark: normalizedDark,
      };
   }

   async function handleSave() {
      saving = true;

      try {
         await client.tournament.updateContent({
            id: dashboard.tournament.id,
            body,
            fontFamily: fontFamily || null,
            theme: buildThemePayload(),
         });

         toast.success(m.tournamentDashboard_success_saved());
      } catch (cause) {
         console.error("Failed to save tournament page settings:", cause);
         toast.error(m.tournamentDashboard_error_saveFailed());
      } finally {
         saving = false;
      }
   }

   async function handlePreviewRequest(nextBody: string) {
      const preview = await client.tournament.previewMarkdown({
         id: dashboard.tournament.id,
         body: nextBody,
      });

      return preview.html;
   }

   async function handleUploadFiles({ files }: { files: File[] }) {
      try {
         const snippets = await Promise.all(
            files.map(async (file) => {
               const upload = await client.tournament.createContentImageUpload({
                  id: dashboard.tournament.id,
                  fileName: file.name,
                  contentType: file.type,
                  sizeBytes: file.size,
               });
               const response = await uploadFile(upload.uploadUrl, file);

               if (!response.ok) {
                  throw new Error(`Upload failed for ${file.name}`);
               }

               return upload.markdown;
            }),
         );

         return { snippets };
      } catch (cause) {
         console.error("Failed to upload tournament page images:", cause);
         toast.error(m.tournamentDashboard_error_uploadFailed());
         throw cause;
      }
   }
</script>

<div class="grid gap-5 xl:grid-cols-[minmax(0,1.65fr)_minmax(22rem,0.8fr)]">
   <DashboardLazySection
      loader={() => import("./components/gfx-editor-panel.svelte")}
      componentProps={{
         body,
         onPreviewRequest: handlePreviewRequest,
         onUploadFiles: handleUploadFiles,
      }}
      loadingLabel={m.common_loading()}
      skeletonClass="min-h-[42rem]"
   />

   <div class="grid gap-4">
      <DashboardLazySection
         loader={() => import("./components/gfx-theme-panel.svelte")}
         componentProps={{
            fontFamily,
            radius,
            themeMode,
            lightTheme,
            darkTheme,
         }}
         loadingLabel={m.common_loading()}
         skeletonClass="min-h-[24rem]"
      />

      <DashboardLazySection
         loader={() => import("./components/gfx-preview-panel.svelte")}
         componentProps={{ dashboard, saving, onSave: handleSave }}
         loadingLabel={m.common_loading()}
         skeletonClass="min-h-[24rem]"
      />
   </div>
</div>
