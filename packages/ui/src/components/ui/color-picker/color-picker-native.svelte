<script lang="ts">
   import { ColorPickerIcon } from "@hugeicons/core-free-icons";
   import { HugeiconsIcon } from "@hugeicons/svelte";
   import { tv } from "tailwind-variants";

   import { buttonVariants } from "@ota/ui/components/ui/button/button.svelte";
   import { cn } from "@ota/ui/utils.js";

   import type { ColorPickerProps } from "./color-picker.shared.ts";
   import { DEFAULT_COLOR, normalizeHex } from "./color-picker.shared.js";

   const colorPickerTriggerVariants = tv({
      base: "",
      variants: {
         variant: {
            default: `${buttonVariants({ variant: "outline", size: "icon" })} size-11 rounded-full p-0`,
            pill: `${buttonVariants({ variant: "outline", size: "default" })} h-18 w-11 rounded-full px-0 py-2`,
         },
      },
      defaultVariants: {
         variant: "default",
      },
   });

   let {
      ref = $bindable(null),
      value = $bindable(DEFAULT_COLOR),
      open = $bindable(false),
      label = "Color",
      name,
      variant = "default",
      id = undefined,
      onValueChange,
      class: className,
      disabled = false,
      type = "button",
      ...restProps
   }: ColorPickerProps = $props();

   let inputRef = $state<HTMLInputElement | null>(null);

   const previewColor = $derived(normalizeHex(value) ?? DEFAULT_COLOR);

   function setColor(nextValue: string) {
      const normalized = normalizeHex(nextValue) ?? DEFAULT_COLOR;
      value = normalized;
      onValueChange?.(normalized);
   }

   function openNativePicker() {
      const input = inputRef as
         | (HTMLInputElement & { showPicker?: () => void })
         | null;

      if (disabled || !input) {
         return;
      }

      open = true;
      if (typeof input.showPicker === "function") {
         input.showPicker();
      } else {
         HTMLInputElement.prototype.click.call(input);
      }
   }

   function closeNativePicker() {
      open = false;
   }

   function handleInput(event: Event) {
      setColor((event.currentTarget as HTMLInputElement).value);
   }

   function handleChange(event: Event) {
      setColor((event.currentTarget as HTMLInputElement).value);
      closeNativePicker();
   }
</script>

{#if name}
   <input type="hidden" {name} value={previewColor} />
{/if}

<input
   bind:this={inputRef}
   class="sr-only"
   type="color"
   value={previewColor}
   tabindex={-1}
   aria-hidden="true"
   oninput={handleInput}
   onchange={handleChange}
   onblur={closeNativePicker}
/>

<button
   bind:this={ref}
   {id}
   {disabled}
   {type}
   class={cn(colorPickerTriggerVariants({ variant }), className)}
   aria-label={`${label}: ${previewColor}`}
   onclick={openNativePicker}
   {...restProps}
>
   {#if variant === "pill"}
      <span class="flex flex-col items-center gap-1">
         <span
            class="block h-9 w-6 rounded-full border shadow-inner"
            style={`background:${previewColor}`}
         ></span>
         <HugeiconsIcon
            icon={ColorPickerIcon}
            class="text-muted-foreground size-3.5"
            strokeWidth={1.8}
         />
      </span>
   {:else}
      <span
         class="flex size-8 items-center justify-center rounded-full border shadow-inner"
         style={`background:${previewColor}`}
      >
         <HugeiconsIcon
            icon={ColorPickerIcon}
            class="size-3.5 text-white/90 mix-blend-difference"
            strokeWidth={1.8}
         />
      </span>
   {/if}
</button>
