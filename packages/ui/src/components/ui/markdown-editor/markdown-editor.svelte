<script lang="ts">
   import Button from "../button/button.svelte";
   import Textarea from "../textarea/textarea.svelte";
   import { cn } from "@ota/ui/utils.js";

   import type { MarkdownEditorProps } from "./markdown-editor.shared.js";

   let {
      ref = $bindable(null),
      value = $bindable(""),
      previewHtml = "",
      placeholder = "Write markdown here...",
      previewPlaceholder = "Nothing to preview yet.",
      accept = "image/*,video/*,audio/*",
      rows = 14,
      disabled = false,
      writeLabel = "Write",
      previewLabel = "Preview",
      uploadLabel = "Upload files",
      dropLabel = "Drop files to upload and insert them into the markdown.",
      onPreviewRequest,
      onUploadFiles,
      class: className,
      ...restProps
   }: MarkdownEditorProps = $props();

   let textareaRef = $state<HTMLTextAreaElement | null>(null);
   let fileInputRef = $state<HTMLInputElement | null>(null);
   let activeTab = $state<"write" | "preview">("write");
   let dragDepth = $state(0);
   let previewLoading = $state(false);
   let uploadLoading = $state(false);
    let previewResponseHtml = $state<string | null>(null);
   let errorMessage = $state<string | null>(null);
   let previewRequestId = 0;
   const displayedPreviewHtml = $derived(
      onPreviewRequest ? (previewResponseHtml ?? previewHtml) : previewHtml,
   );

   $effect(() => {
      if (activeTab !== "preview" || !onPreviewRequest) {
         return;
      }

      const nextRequestId = ++previewRequestId;
      previewLoading = true;
      errorMessage = null;

      void onPreviewRequest(value)
         .then((nextHtml: string) => {
            if (nextRequestId !== previewRequestId) {
               return;
            }

            previewResponseHtml = nextHtml;
         })
         .catch((error: unknown) => {
            if (nextRequestId !== previewRequestId) {
               return;
            }

            console.error("Failed to render markdown preview:", error);
            errorMessage =
               error instanceof Error
                  ? error.message
                  : "Failed to render preview.";
         })
         .finally(() => {
            if (nextRequestId === previewRequestId) {
               previewLoading = false;
            }
         });
   });

   function setValue(nextValue: string) {
      value = nextValue;
   }

   function insertSnippets(snippets: string[]) {
      if (!snippets.length) {
         return;
      }

      const insertion = snippets.join("\n\n");
      const target = textareaRef;

      if (!target) {
         setValue(value ? `${value}\n\n${insertion}` : insertion);
         return;
      }

      const selectionStart = target.selectionStart ?? value.length;
      const selectionEnd = target.selectionEnd ?? value.length;
      const nextValue = `${value.slice(0, selectionStart)}${insertion}${value.slice(selectionEnd)}`;

      setValue(nextValue);

      queueMicrotask(() => {
         const nextPosition = selectionStart + insertion.length;
         target.focus();
         target.setSelectionRange(nextPosition, nextPosition);
      });
   }

   async function uploadFiles(files: File[]) {
      if (!files.length || !onUploadFiles || disabled || uploadLoading) {
         return;
      }

      uploadLoading = true;
      errorMessage = null;

      try {
         const snippets = await onUploadFiles({ files });
         insertSnippets(snippets);
      } catch (error: unknown) {
         console.error("Failed to upload markdown files:", error);
         errorMessage =
            error instanceof Error ? error.message : "Failed to upload files.";
      } finally {
         uploadLoading = false;
      }
   }

   async function handleFileInputChange(event: Event) {
      const input = event.currentTarget as HTMLInputElement;
      const files = Array.from(input.files ?? []);

      await uploadFiles(files);
      input.value = "";
   }

   async function handleDrop(event: DragEvent) {
      event.preventDefault();
      dragDepth = 0;

      const files = Array.from(event.dataTransfer?.files ?? []);
      await uploadFiles(files);
   }
</script>

<div
   bind:this={ref}
   class={cn("space-y-3", className)}
   ondragenter={(event) => {
      event.preventDefault();
      if (!disabled) {
         dragDepth += 1;
      }
   }}
   ondragover={(event) => {
      event.preventDefault();
   }}
   ondragleave={() => {
      dragDepth = Math.max(0, dragDepth - 1);
   }}
   ondrop={handleDrop}
   {...restProps}
>
   <div class="border-border bg-muted/20 overflow-hidden rounded-xl border">
      <div class="border-border bg-background/90 flex items-center justify-between gap-3 border-b px-3 py-2">
         <div class="inline-flex rounded-lg border p-1">
            <Button
               variant={activeTab === "write" ? "default" : "ghost"}
               size="sm"
               class="min-w-18"
               onclick={() => {
                  activeTab = "write";
               }}
               disabled={disabled}
            >
               {writeLabel}
            </Button>
            <Button
               variant={activeTab === "preview" ? "default" : "ghost"}
               size="sm"
               class="min-w-18"
               onclick={() => {
                  activeTab = "preview";
               }}
               disabled={disabled}
            >
               {previewLabel}
            </Button>
         </div>

         <div class="flex items-center gap-2">
            {#if uploadLoading}
               <span class="text-muted-foreground text-xs">Uploading...</span>
            {/if}
            {#if onUploadFiles}
               <div>
                  <input
                     bind:this={fileInputRef}
                     class="hidden"
                     type="file"
                     multiple
                     {accept}
                     onchange={handleFileInputChange}
                  />
                  <Button
                     variant="outline"
                     size="sm"
                     onclick={() => {
                        fileInputRef?.click();
                     }}
                     disabled={disabled || uploadLoading}
                  >
                     {uploadLabel}
                  </Button>
               </div>
            {/if}
         </div>
      </div>

      {#if activeTab === "write"}
         <div
            class={cn(
               "relative transition-colors",
               dragDepth > 0 ? "bg-primary/5 ring-primary/20 ring-4" : "",
            )}
         >
            <Textarea
               bind:ref={textareaRef}
               bind:value
               {disabled}
               {placeholder}
               {rows}
               class="min-h-[18rem] rounded-none border-0 bg-transparent px-4 py-4 shadow-none focus-visible:ring-0"
            />

            {#if !value.trim()}
               <div class="text-muted-foreground pointer-events-none absolute right-4 bottom-3 text-xs">
                  Markdown, embeds, tables, and media uploads
               </div>
            {/if}

            {#if dragDepth > 0}
               <div
                  class="bg-background/92 text-foreground absolute inset-3 flex items-center justify-center rounded-xl border text-center text-sm font-medium shadow-lg backdrop-blur-xs"
               >
                  {dropLabel}
               </div>
            {/if}
         </div>
      {:else}
         <div class="bg-background min-h-[18rem] px-4 py-4">
            {#if previewLoading}
               <p class="text-muted-foreground text-sm">Rendering preview...</p>
            {:else if errorMessage}
               <p class="text-destructive text-sm">{errorMessage}</p>
            {:else if displayedPreviewHtml.trim()}
               <div class="prose-content">
                  <!-- eslint-disable-next-line svelte/no-at-html-tags -->
                  {@html displayedPreviewHtml}
               </div>
            {:else}
               <p class="text-muted-foreground text-sm">{previewPlaceholder}</p>
            {/if}
         </div>
      {/if}
   </div>
</div>

<style>
   .prose-content :global(img),
   .prose-content :global(video),
   .prose-content :global(audio) {
      max-width: 100%;
      border-radius: 0.5rem;
      margin: 1rem 0;
   }

   .prose-content :global(pre) {
      overflow-x: auto;
   }
</style>
