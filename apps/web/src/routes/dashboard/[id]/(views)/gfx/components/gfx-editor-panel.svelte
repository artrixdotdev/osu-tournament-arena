<script lang="ts">
   import { m } from "$i18n/messages";

   import { Card } from "@ota/ui/components/card/index.ts";
   import { MarkdownEditor } from "@ota/ui/components/markdown-editor/index.ts";

   let {
      body = $bindable(""),
      onPreviewRequest,
      onUploadFiles,
   }: {
      body: string;
      onPreviewRequest: (body: string) => Promise<string>;
      onUploadFiles: (payload: {
         files: File[];
      }) => Promise<{ snippets: string[] }>;
   } = $props();
</script>

<Card as="article" variant="spotlight">
   <div class="px-5 py-5 sm:px-6">
      <div class="space-y-2">
         <p class="text-muted-foreground text-xs tracking-[0.14em] uppercase">
            {m.tournamentDashboard_customization_title()}
         </p>
         <h2 class="text-lg font-semibold tracking-[-0.03em]">
            {m.tournamentDashboard_gfx_frontPageTitle()}
         </h2>
         <p class="text-muted-foreground text-sm leading-6">
            {m.tournamentDashboard_gfx_frontPageDescription()}
         </p>
      </div>
   </div>

   <div class="px-4 pb-4 sm:px-6 sm:pb-6">
      <MarkdownEditor
         bind:value={body}
         class="[--tw-prose-body:hsl(var(--foreground)_/_0.9)] [--tw-prose-bold:hsl(var(--foreground))] [--tw-prose-bullets:hsl(var(--muted-foreground))] [--tw-prose-code:hsl(var(--foreground))] [--tw-prose-headings:hsl(var(--foreground))] [--tw-prose-hr:hsl(var(--border))] [--tw-prose-links:hsl(var(--foreground))] [--tw-prose-pre-bg:hsl(var(--muted))] [--tw-prose-pre-code:hsl(var(--foreground))] [--tw-prose-quote-borders:hsl(var(--border))] [--tw-prose-quotes:hsl(var(--foreground))] [--tw-prose-td-borders:hsl(var(--border))] [--tw-prose-th-borders:hsl(var(--border))]"
         placeholder={m.tournamentDashboard_markdownPlaceholder()}
         previewPlaceholder={m.tournamentDashboard_markdownPreviewEmpty()}
         writeLabel={m.common_write()}
         previewLabel={m.common_preview()}
         uploadLabel={m.tournamentDashboard_uploadImage()}
         uploadingLabel={m.tournamentDashboard_uploadingImage()}
         renderingLabel={m.tournamentDashboard_renderingPreview()}
         dropLabel={m.tournamentDashboard_dropImages()}
         emptyHint={m.tournamentDashboard_emptyHint()}
         {onPreviewRequest}
         {onUploadFiles}
      />
   </div>
</Card>
