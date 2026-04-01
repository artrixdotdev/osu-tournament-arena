<script lang="ts">
   import {
      Delete02Icon,
      HelpCircleIcon,
      ImageAdd01Icon,
      ImageUploadIcon,
   } from "@hugeicons/core-free-icons";
   import { HugeiconsIcon } from "@hugeicons/svelte";
   import { toast } from "svelte-sonner";

   import { Button } from "@ota/ui/components/button/index.js";
   import { Progress } from "@ota/ui/components/progress/index.js";
   import * as Tooltip from "@ota/ui/components/tooltip/index.js";
   import { cn } from "@ota/ui/utils.js";

   type UploadFn = (file: File) => Promise<{
      publicUrl: string;
      previewUrl?: string;
   }>;
   type ImageUploadVariant = "standard" | "icon" | "banner";
   type AspectRatio = "square" | "video" | "wide";
   type IconSize = "sm" | "md" | "lg";

   interface Props {
      value?: string | null;
      selectedFile?: File | null;
      onChange?: (url: string | null) => void;
      label: string;
      description?: string;
      hint?: string;
      accept?: string;
      aspectRatio?: AspectRatio;
      maxSizeBytes?: number;
      disabled?: boolean;
      uploadFn?: UploadFn;
      uploadOnSelect?: boolean;
      variant?: ImageUploadVariant;
      iconSize?: IconSize;
   }

   let {
      value = $bindable(null),
      selectedFile = $bindable(null),
      onChange,
      label,
      description,
      hint,
      accept = "image/jpeg,image/png,image/webp",
      aspectRatio = "wide",
      maxSizeBytes = 5 * 1024 * 1024,
      disabled = false,
      uploadFn,
      uploadOnSelect = true,
      variant = "standard",
      iconSize = "md",
   }: Props = $props();

   let fileInput = $state<HTMLInputElement | null>(null);
   let isDragging = $state(false);
   let isUploading = $state(false);
   let uploadProgress = $state(0);
   let previewUrl = $state<string | null>(null);

   const displayedImage = $derived(previewUrl ?? value ?? null);

   const aspectRatioClasses: Record<AspectRatio, string> = {
      square: "aspect-square",
      video: "aspect-video",
      wide: "aspect-3/1",
   };

   const iconSizeClasses: Record<IconSize, string> = {
      sm: "size-20",
      md: "size-24",
      lg: "size-28",
   };

   function parseAcceptList(value: string): string[] {
      return value
         .split(",")
         .map((item) => item.trim().toLowerCase())
         .filter(Boolean);
   }

   function isAcceptedFile(file: File, acceptValue: string): boolean {
      const accepted = parseAcceptList(acceptValue);

      if (accepted.length === 0) return true;

      const mimeType = file.type.toLowerCase();
      const fileName = file.name.toLowerCase();

      return accepted.some((rule) => {
         if (rule.startsWith(".")) return fileName.endsWith(rule);
         if (rule.endsWith("/*")) return mimeType.startsWith(rule.slice(0, -1));
         return mimeType === rule;
      });
   }

   function formatMaxSize(bytes: number): string {
      return `${Math.round(bytes / 1024 / 1024)}MB`;
   }

   function cleanupPreviewUrl() {
      if (previewUrl?.startsWith("blob:")) {
         URL.revokeObjectURL(previewUrl);
      }

      previewUrl = null;
   }

   function openFilePicker() {
      if (disabled || isUploading) return;
      fileInput?.click();
   }

   function handleDragOver(event: DragEvent) {
      event.preventDefault();
      if (disabled || isUploading) return;
      isDragging = true;
   }

   function handleDragLeave(event: DragEvent) {
      event.preventDefault();
      isDragging = false;
   }

   function handleDrop(event: DragEvent) {
      event.preventDefault();
      isDragging = false;

      if (disabled || isUploading) return;

      const file = event.dataTransfer?.files?.[0];
      if (file) void handleFile(file);
   }

   function handleFileSelect(event: Event) {
      const input = event.currentTarget as HTMLInputElement;
      const file = input.files?.[0];

      if (file) void handleFile(file);

      input.value = "";
   }

   async function handleFile(file: File) {
      if (!isAcceptedFile(file, accept)) {
         toast.error(
            "Invalid file type. Please upload a JPEG, PNG, or WebP image.",
         );
         return;
      }

      if (file.size > maxSizeBytes) {
         toast.error(
            `File is too large. Maximum size is ${formatMaxSize(maxSizeBytes)}.`,
         );
         return;
      }

      cleanupPreviewUrl();
      previewUrl = URL.createObjectURL(file);
      selectedFile = file;

      if (!uploadOnSelect) {
         value = null;
         onChange?.(null);
         return;
      }

      if (!uploadFn) {
         cleanupPreviewUrl();
         selectedFile = null;
         toast.error("Upload is not configured for this field.");
         return;
      }

      isUploading = true;
      uploadProgress = 25;

      try {
         uploadProgress = 60;
         const result = await uploadFn(file);
         uploadProgress = 100;

         value = result.publicUrl;
         selectedFile = null;
         onChange?.(result.publicUrl);

         if (result.previewUrl) {
            cleanupPreviewUrl();
            previewUrl = result.previewUrl;
         } else {
            cleanupPreviewUrl();
         }
         toast.success("Image uploaded successfully.");
      } catch (error) {
         console.error("Upload failed:", error);
         cleanupPreviewUrl();
         toast.error("Failed to upload image. Please try again.");
      } finally {
         isUploading = false;
         uploadProgress = 0;
      }
   }

   function handleRemove() {
      cleanupPreviewUrl();
      selectedFile = null;
      value = null;
      onChange?.(null);
   }

   $effect(() => {
      return () => {
         cleanupPreviewUrl();
      };
   });
</script>

<div class="space-y-2">
   <div class="flex items-center gap-2">
      <span class="text-sm font-medium">{label}</span>

      {#if hint}
         <Tooltip.Root>
            <Tooltip.Trigger
               class="text-muted-foreground inline-flex items-center"
            >
               <HugeiconsIcon
                  icon={HelpCircleIcon}
                  size={14}
                  strokeWidth={1.7}
               />
            </Tooltip.Trigger>
            <Tooltip.Content>{hint}</Tooltip.Content>
         </Tooltip.Root>
      {/if}
   </div>

   {#if description}
      <p class="text-muted-foreground text-xs">{description}</p>
   {/if}

   <input
      bind:this={fileInput}
      type="file"
      {accept}
      onchange={handleFileSelect}
      class="hidden"
      disabled={disabled || isUploading}
   />

   {#if variant === "icon"}
      <div class="w-fit space-y-3">
         {#if displayedImage}
            <div
               class={cn(
                  "group bg-muted ring-border relative overflow-hidden rounded-full border ring-1",
                  iconSizeClasses[iconSize],
               )}
            >
               <img
                  src={displayedImage}
                  alt={label}
                  class="h-full w-full object-cover"
               />

               <div
                  class="absolute inset-0 flex items-center justify-center bg-black/45 opacity-0 transition-opacity group-hover:opacity-100"
               >
                  <div class="flex items-center gap-2">
                     <Button
                        type="button"
                        size="icon"
                        variant="secondary"
                        class="rounded-full"
                        onclick={openFilePicker}
                        disabled={disabled || isUploading}
                     >
                        <HugeiconsIcon icon={ImageAdd01Icon} size={16} />
                     </Button>

                     <Button
                        type="button"
                        size="icon"
                        variant="destructive"
                        class="rounded-full"
                        onclick={handleRemove}
                        disabled={disabled || isUploading}
                     >
                        <HugeiconsIcon icon={Delete02Icon} size={16} />
                     </Button>
                  </div>
               </div>
            </div>
         {:else}
            <button
               type="button"
               disabled={disabled || isUploading}
               onclick={openFilePicker}
               ondragover={handleDragOver}
               ondragleave={handleDragLeave}
               ondrop={handleDrop}
               class={cn(
                  "group relative flex items-center justify-center overflow-hidden rounded-full border-2 border-dashed transition-colors",
                  iconSizeClasses[iconSize],
                  isDragging
                     ? "border-primary bg-primary/10"
                     : "border-border hover:border-primary hover:bg-accent/50",
                  (disabled || isUploading) && "cursor-not-allowed opacity-50",
               )}
            >
               {#if isUploading}
                  <div class="flex flex-col items-center gap-2">
                     <HugeiconsIcon
                        icon={ImageUploadIcon}
                        size={22}
                        strokeWidth={1.7}
                        class="text-primary animate-pulse"
                     />
                  </div>
               {:else}
                  <HugeiconsIcon
                     icon={ImageUploadIcon}
                     size={22}
                     strokeWidth={1.7}
                     class="text-primary"
                  />
               {/if}
            </button>
         {/if}

         <div class="space-y-1">
            <p class="text-sm font-medium">Upload image</p>
            {#if isUploading}
               <div class="w-28">
                  <Progress value={uploadProgress} class="h-2 w-full" />
               </div>
            {:else}
               <p class="text-muted-foreground text-xs">PNG, JPG, WebP</p>
            {/if}
         </div>
      </div>
   {:else if displayedImage}
      <div
         class={cn(
            "group bg-muted relative overflow-hidden rounded-xl border",
            variant === "banner"
               ? "aspect-3/1"
               : aspectRatioClasses[aspectRatio],
         )}
      >
         <img
            src={displayedImage}
            alt={label}
            class="h-full w-full object-cover"
         />

         <div
            class="absolute inset-0 flex items-center justify-center bg-black/45 opacity-0 transition-opacity group-hover:opacity-100"
         >
            <div class="flex flex-wrap items-center justify-center gap-2 p-3">
               <Button
                  type="button"
                  variant="secondary"
                  onclick={openFilePicker}
                  disabled={disabled || isUploading}
               >
                  <HugeiconsIcon icon={ImageAdd01Icon} size={16} />
                  Change
               </Button>

               <Button
                  type="button"
                  variant="destructive"
                  onclick={handleRemove}
                  disabled={disabled || isUploading}
               >
                  <HugeiconsIcon icon={Delete02Icon} size={16} />
                  Remove
               </Button>
            </div>
         </div>
      </div>
   {:else}
      <button
         type="button"
         disabled={disabled || isUploading}
         onclick={openFilePicker}
         ondragover={handleDragOver}
         ondragleave={handleDragLeave}
         ondrop={handleDrop}
         class={cn(
            "group relative w-full overflow-hidden rounded-xl border-2 border-dashed transition-colors",
            variant === "banner"
               ? "aspect-3/1 min-h-40"
               : cn("min-h-52", aspectRatioClasses[aspectRatio]),
            isDragging
               ? "border-primary bg-primary/10"
               : "border-border hover:border-primary hover:bg-accent/50",
            (disabled || isUploading) && "cursor-not-allowed opacity-50",
         )}
      >
         <div
            class="flex h-full w-full flex-col items-center justify-center px-8 py-8 text-center"
         >
            {#if isUploading}
               <div class="w-full max-w-xs space-y-3">
                  <div class="flex justify-center">
                     <div
                        class="bg-primary/10 text-primary flex size-12 items-center justify-center rounded-full"
                     >
                        <HugeiconsIcon
                           icon={ImageUploadIcon}
                           size={24}
                           strokeWidth={1.7}
                           class="animate-pulse"
                        />
                     </div>
                  </div>

                  <div class="space-y-2">
                     <p class="text-sm font-medium">Uploading image...</p>
                     <Progress value={uploadProgress} class="w-full" />
                  </div>
               </div>
            {:else if variant === "banner"}
               <div class="space-y-4">
                  <div class="flex justify-center">
                     <div
                        class="bg-primary/10 text-primary flex size-12 items-center justify-center rounded-full"
                     >
                        <HugeiconsIcon
                           icon={ImageUploadIcon}
                           size={24}
                           strokeWidth={1.7}
                        />
                     </div>
                  </div>

                  <div class="space-y-1">
                     <p class="text-base font-medium">Upload a banner image</p>
                     <p class="text-muted-foreground text-sm">
                        Drag and drop, or click to choose a file
                     </p>
                     <p class="text-muted-foreground text-xs">
                        PNG, JPG or WebP, max {formatMaxSize(maxSizeBytes)}
                     </p>
                  </div>
               </div>
            {:else}
               <div class="space-y-3">
                  <div class="flex justify-center">
                     <div
                        class="bg-primary/10 text-primary flex size-12 items-center justify-center rounded-full"
                     >
                        <HugeiconsIcon
                           icon={ImageUploadIcon}
                           size={24}
                           strokeWidth={1.7}
                        />
                     </div>
                  </div>

                  <div class="space-y-1">
                     <p class="text-sm font-medium">
                        Click to upload or drag and drop
                     </p>
                     <p class="text-muted-foreground text-xs">
                        PNG, JPG or WebP, max {formatMaxSize(maxSizeBytes)}
                     </p>
                  </div>
               </div>
            {/if}
         </div>
      </button>
   {/if}
</div>
