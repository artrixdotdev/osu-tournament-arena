<script lang="ts">
   import { markdown } from "@codemirror/lang-markdown";
   import CodeMirror from "svelte-codemirror-editor";

   import { cn } from "@ota/ui/utils.js";

   import Button from "../button/button.svelte";

   interface UploadResult {
      snippets: string[];
   }

   interface MarkdownEditorProps {
      ref?: HTMLDivElement | null;
      value?: string;
      previewHtml?: string;
      placeholder?: string;
      previewPlaceholder?: string;
      accept?: string;
      disabled?: boolean;
      writeLabel?: string;
      previewLabel?: string;
      uploadLabel?: string;
      uploadingLabel?: string;
      renderingLabel?: string;
      emptyHint?: string;
      dropLabel?: string;
      class?: string;
      onPreviewRequest?: ((value: string) => Promise<string>) | undefined;
      onUploadFiles?:
         | ((input: { files: File[] }) => Promise<UploadResult>)
         | undefined;
   }

   let {
      ref = $bindable(null),
      value = $bindable(""),
      previewHtml = "",
      placeholder = "Write markdown here...",
      previewPlaceholder = "Nothing to preview yet.",
      accept = "image/*",
      disabled = false,
      writeLabel = "Write",
      previewLabel = "Preview",
      uploadLabel = "Upload image",
      uploadingLabel = "Uploading...",
      renderingLabel = "Rendering preview...",
      emptyHint = "Markdown and image embeds are supported.",
      dropLabel = "Drop images to upload and insert them into the markdown.",
      class: className,
      onPreviewRequest,
      onUploadFiles,
   }: MarkdownEditorProps = $props();

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

      const requestId = ++previewRequestId;
      previewLoading = true;
      errorMessage = null;

      void onPreviewRequest(value)
         .then((nextHtml) => {
            if (requestId !== previewRequestId) {
               return;
            }

            previewResponseHtml = nextHtml;
         })
         .catch((error: unknown) => {
            if (requestId !== previewRequestId) {
               return;
            }

            console.error("Failed to render markdown preview:", error);
            errorMessage =
               error instanceof Error
                  ? error.message
                  : "Failed to render preview.";
         })
         .finally(() => {
            if (requestId === previewRequestId) {
               previewLoading = false;
            }
         });
   });

   function insertSnippets(snippets: string[]) {
      if (!snippets.length) {
         return;
      }

      const insertion = snippets.join("\n\n");
      value = value.trim() ? `${value.trimEnd()}\n\n${insertion}` : insertion;
   }

   async function uploadFiles(files: File[]) {
      if (!files.length || !onUploadFiles || disabled || uploadLoading) {
         return;
      }

      uploadLoading = true;
      errorMessage = null;

      try {
         const result = await onUploadFiles({ files });
         insertSnippets(result.snippets);
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
   role="presentation"
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
>
   <div class="border-border bg-muted/20 overflow-hidden rounded-xl border">
      <div
         class="border-border bg-background/90 flex items-center justify-between gap-3 border-b px-3 py-2"
      >
         <div class="inline-flex rounded-lg border p-1">
            <Button
               variant={activeTab === "write" ? "default" : "ghost"}
               size="sm"
               class="min-w-18"
               onclick={() => {
                  activeTab = "write";
               }}
               {disabled}
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
               {disabled}
            >
               {previewLabel}
            </Button>
         </div>

         <div class="flex items-center gap-2">
            {#if uploadLoading}
               <span class="text-muted-foreground text-xs"
                  >{uploadingLabel}</span
               >
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
            <CodeMirror
               bind:value
               lang={markdown()}
               editable={!disabled}
               lineWrapping
               class="markdown-editor"
               {placeholder}
               styles={{
                  "&": {
                     minHeight: "22rem",
                     fontSize: "0.95rem",
                  },
                  ".cm-scroller": {
                     minHeight: "22rem",
                     fontFamily: "var(--font-mono)",
                  },
                  ".cm-content": {
                     padding: "1rem",
                  },
               }}
            />

            {#if !value.trim()}
               <div
                  class="text-muted-foreground pointer-events-none absolute right-4 bottom-3 text-xs"
               >
                  {emptyHint}
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
         <div class="bg-background min-h-[22rem] px-4 py-4">
            {#if previewLoading}
               <p class="text-muted-foreground text-sm">{renderingLabel}</p>
            {:else if errorMessage}
               <p class="text-destructive text-sm">{errorMessage}</p>
            {:else if displayedPreviewHtml.trim()}
               <div
                  class="prose prose-zinc dark:prose-invert prose-img:rounded-xl prose-pre:rounded-xl prose-code:before:hidden prose-code:after:hidden max-w-none"
               >
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
   :global(.markdown-editor .cm-editor) {
      border: 0;
      background: transparent;
      outline: none;
   }

   :global(.markdown-editor .cm-focused) {
      outline: none;
   }
</style>
