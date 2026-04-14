<script lang="ts">
   import type { Popover as PopoverPrimitive } from "bits-ui";
   import { onMount, tick } from "svelte";
   import {
      ColorPickerIcon,
      Copy01Icon,
      Refresh01Icon,
   } from "@hugeicons/core-free-icons";
   import { HugeiconsIcon } from "@hugeicons/svelte";
   import { tv } from "tailwind-variants";

   import { buttonVariants } from "@ota/ui/components/ui/button/button.svelte";
   import { Button } from "@ota/ui/components/ui/button/index.js";
   import { Input } from "@ota/ui/components/ui/input/index.js";
   import {
      Popover,
      PopoverContent,
      PopoverTrigger,
   } from "@ota/ui/components/ui/popover/index.js";
   import { cn } from "@ota/ui/utils.js";

   import type { ColorPickerValue } from "./color-picker.shared.js";
   import {
      DEFAULT_COLOR,
      DEFAULT_SWATCHES,
      normalizeHex,
      TRANSPARENT_LABEL,
      TRANSPARENT_PREVIEW,
   } from "./color-picker.shared.js";

   const colorPickerTriggerVariants = tv({
      base: "",
      variants: {
         variant: {
            default: cn(
               buttonVariants({ variant: "outline", size: "default" }),
               "h-12 w-full justify-between font-normal",
            ),
            pill: cn(
               buttonVariants({ variant: "outline", size: "default" }),
               "size-12 rounded-full p-0!",
            ),
         },
      },
      defaultVariants: {
         variant: "default",
      },
   });

   type PickerColor = {
      hexString: string;
      hsv: {
         h?: number;
         s?: number;
         v?: number;
      };
      set: (value: string) => void;
   };

   type PickerInstance = {
      color: PickerColor;
      on: (eventName: string, callback: (color: PickerColor) => void) => void;
      off: (eventName: string, callback: (color: PickerColor) => void) => void;
      resize: (width: number) => void;
      reset: () => void;
   };

   type Props = Omit<
      PopoverPrimitive.TriggerProps,
      "children" | "child" | "type"
   > & {
      value?: ColorPickerValue;
      open?: boolean;
      label?: string;
      name?: string;
      variant?: "default" | "pill";
      swatches?: ColorPickerValue[];
      pickerWidth?: number;
      showAlpha?: boolean;
      contentClass?: string;
      pickerOptions?: Record<string, unknown>;
      onValueChange?: (value?: ColorPickerValue) => void;
      type?: "button" | "submit" | "reset";
   };

   let {
      ref = $bindable(null),
      value = $bindable(),
      open = $bindable(false),
      label = "Color",
      name,
      variant = "default",
      id = undefined,
      swatches = [...DEFAULT_SWATCHES],
      pickerWidth,
      showAlpha = false,
      contentClass,
      pickerOptions = {},
      onValueChange,
      class: className,
      disabled = false,
      type = "button",
      ...restProps
   }: Props = $props();

   let inputValue = $state(value ?? "");
   let hsv = $state({ h: 217, s: 76, v: 96 });
   let pickerHost = $state<HTMLDivElement | null>(null);
   let picker = $state<PickerInstance | null>(null);
   let syncingFromPicker = $state(false);

   const previewColor = $derived(normalizeHex(value));
   const pickerColor = $derived(previewColor ?? DEFAULT_COLOR);

   function setColor(nextValue?: ColorPickerValue) {
      value = nextValue;
      inputValue = nextValue ?? "";
      onValueChange?.(nextValue);
   }

   function commitInputValue() {
      const normalized = normalizeHex(inputValue);

      if (!normalized) {
         inputValue = previewColor ?? "";
         return;
      }

      setColor(normalized);
   }

   async function copyValue() {
      if (
         typeof navigator === "undefined" ||
         !navigator.clipboard ||
         !previewColor
      ) {
         return;
      }

      await navigator.clipboard.writeText(previewColor);
   }

   function resetValue() {
      value = undefined;
      inputValue = "";
      onValueChange?.(undefined);
      picker?.reset();
   }

   function handlePresetClick(nextValue: ColorPickerValue) {
      setColor(nextValue);
   }

   function getHsvSnapshot(color: PickerColor) {
      return {
         h: Math.round(color.hsv.h ?? 0),
         s: Math.round(color.hsv.s ?? 0),
         v: Math.round(color.hsv.v ?? 0),
      };
   }

   function handlePickerChange(color: PickerColor) {
      const nextValue = normalizeHex(color.hexString) ?? DEFAULT_COLOR;
      syncingFromPicker = true;
      hsv = getHsvSnapshot(color);
      setColor(nextValue);
      syncingFromPicker = false;
   }

   function getPickerWidth() {
      return (
         pickerWidth ?? Math.max(240, Math.round(pickerHost?.clientWidth ?? 0))
      );
   }

   function destroyPicker() {
      if (!picker) {
         return;
      }

      picker.off("color:change", handlePickerChange);
      picker = null;
   }

   onMount(() => destroyPicker);

   $effect(() => {
      if (open) {
         return;
      }

      destroyPicker();
   });

   $effect(() => {
      if (!open || !pickerHost || picker) {
         return;
      }

      let cancelled = false;

      void tick().then(async () => {
         if (cancelled || !pickerHost || picker) {
            return;
         }

         const { default: iro } = await import("@jaames/iro");

         if (cancelled || !pickerHost || picker) {
            return;
         }

         const nextPicker = iro.ColorPicker(pickerHost, {
            width: getPickerWidth(),
            color: pickerColor,
            borderWidth: 1,
            borderColor: "var(--color-border)",
            handleRadius: 9,
            padding: 0,
            margin: 14,
            wheelLightness: false,
            transparency: showAlpha,
            layout: [
               { component: iro.ui.Wheel },
               {
                  component: iro.ui.Slider,
                  options: { sliderType: "hue" },
               },
               ...(showAlpha
                  ? [
                       {
                          component: iro.ui.Slider,
                          options: { sliderType: "alpha" },
                       },
                    ]
                  : []),
            ],
            ...pickerOptions,
         });

         nextPicker.on("color:change", handlePickerChange);
         picker = nextPicker;
         hsv = getHsvSnapshot(nextPicker.color);
      });

      return () => {
         cancelled = true;
         destroyPicker();
      };
   });

   $effect(() => {
      inputValue = value ?? "";

      if (!picker || syncingFromPicker) {
         return;
      }

      const normalized = normalizeHex(value);

      if (!normalized || picker.color.hexString.toLowerCase() === normalized) {
         return;
      }

      picker.color.set(normalized);
   });

   $effect(() => {
      if (!open || !picker) {
         return;
      }

      void tick().then(() => {
         picker?.resize(getPickerWidth());
      });
   });
</script>

{#if name}
   <input type="hidden" {name} value={previewColor ?? ""} />
{/if}

<Popover bind:open>
   <PopoverTrigger
      bind:ref
      {id}
      {disabled}
      {type}
      class={cn(colorPickerTriggerVariants({ variant }), className)}
      {...restProps}
   >
      {#if variant === "pill"}
         <span class="flex h-full w-full flex-col items-center gap-1">
            <span
               class="block h-full w-full rounded-full shadow-inner ring-1 ring-black/10"
               style={`background:${previewColor ?? TRANSPARENT_PREVIEW}; background-size: 20px 20px;`}
            ></span>
         </span>
      {:else}
         <span class="flex min-w-0 items-center gap-3">
            <span
               class="size-6 shrink-0 rounded-lg shadow-inner ring-1 ring-black/10"
               style={`background:${previewColor ?? TRANSPARENT_PREVIEW}; background-size: 20px 20px;`}
            ></span>
            <span class="min-w-0 text-left leading-none">
               <span
                  class="text-muted-foreground block text-[11px] font-medium tracking-[0.18em] uppercase"
               >
                  {label}
               </span>
               <span class="block truncate font-mono text-sm"
                  >{previewColor ?? TRANSPARENT_LABEL}</span
               >
            </span>
         </span>
         <HugeiconsIcon
            icon={ColorPickerIcon}
            class="text-muted-foreground size-4 shrink-0 opacity-80"
            strokeWidth={1.8}
         />
      {/if}
   </PopoverTrigger>

   <PopoverContent
      class={cn(
         "bg-popover/98 w-96 overflow-hidden rounded-[1.5rem] border-0 p-0 shadow-2xl shadow-black/25",
         contentClass,
      )}
      align="start"
   >
      <div class="bg-muted/35 px-4 py-4">
         <div class="flex items-center justify-between gap-3">
            <div>
               <p class="text-sm font-medium tracking-[0.01em]">{label}</p>
               <p class="text-muted-foreground max-w-44 text-xs leading-5">
                  Fine-tune hue, saturation, and value.
               </p>
            </div>
            <div
               class="bg-background/75 flex items-center gap-1 rounded-full px-2.5 py-1.5 font-mono text-[11px] shadow-sm"
            >
               <span>H {hsv.h}</span>
               <span class="text-border">/</span>
               <span>S {hsv.s}</span>
               <span class="text-border">/</span>
               <span>V {hsv.v}</span>
            </div>
         </div>
      </div>

      <div class="space-y-4 p-4">
         <div
            class="from-muted/45 to-background rounded-[1.25rem] bg-gradient-to-br p-3"
         >
            {#if open}
               <div bind:this={pickerHost} class="iro-picker-host"></div>
            {/if}
         </div>

         <div class="space-y-2">
            <div class="flex items-center justify-between gap-2">
               <p
                  class="text-muted-foreground text-xs font-medium tracking-[0.16em] uppercase"
               >
                  Hex value
               </p>
               <div class="flex items-center gap-1">
                  <Button
                     type="button"
                     variant="ghost"
                     size="icon-sm"
                     class="bg-background/70 hover:bg-background size-8"
                     onclick={copyValue}
                     aria-label="Copy color value"
                     disabled={!previewColor}
                  >
                     <HugeiconsIcon
                        icon={Copy01Icon}
                        class="size-3.5"
                        strokeWidth={1.8}
                     />
                  </Button>
                  <Button
                     type="button"
                     variant="ghost"
                     size="icon-sm"
                     class="bg-background/70 hover:bg-background size-8"
                     onclick={resetValue}
                     aria-label="Reset color value"
                  >
                     <HugeiconsIcon
                        icon={Refresh01Icon}
                        class="size-3.5"
                        strokeWidth={1.8}
                     />
                  </Button>
               </div>
            </div>

            <div class="relative">
               <span
                  class="pointer-events-none absolute inset-y-0 left-3 flex items-center"
               >
                  <span
                     class="size-4 rounded-full shadow-inner ring-1 ring-black/10"
                     style={`background:${previewColor ?? TRANSPARENT_PREVIEW}; background-size: 20px 20px;`}
                  ></span>
               </span>
               <Input
                  bind:value={inputValue}
                  class="pl-10 font-mono lowercase"
                  spellcheck="false"
                  autocapitalize="off"
                  autocorrect="off"
                  aria-label="Hex color value"
                  onblur={commitInputValue}
                  onkeydown={(event) => {
                     if (event.key === "Enter") {
                        event.preventDefault();
                        commitInputValue();
                     }
                  }}
               />
            </div>
         </div>

         {#if swatches.length > 0}
            <div class="space-y-2">
               <p
                  class="text-muted-foreground text-xs font-medium tracking-[0.16em] uppercase"
               >
                  Presets
               </p>
               <div class="flex flex-wrap gap-2">
                  {#each swatches as swatch (swatch)}
                     <button
                        type="button"
                        class={cn(
                           "focus-visible:border-ring focus-visible:ring-ring/50 size-7 rounded-full border transition-transform hover:scale-105 focus-visible:ring-[3px] focus-visible:outline-hidden",
                           swatch === previewColor &&
                              "ring-foreground/85 ring-2 ring-offset-2 ring-offset-[color:var(--color-popover)]",
                        )}
                        style={`background:${swatch}`}
                        aria-label={`Select ${swatch}`}
                        onclick={() => handlePresetClick(swatch)}
                     ></button>
                  {/each}
               </div>
            </div>
         {/if}
      </div>
   </PopoverContent>
</Popover>

<style>
   .iro-picker-host {
      min-height: 284px;
   }

   :global(.iro-picker-host .IroColorPicker) {
      width: 100%;
   }

   :global(.iro-picker-host .IroHandle circle) {
      stroke: white;
      stroke-width: 2px;
   }

   :global(.iro-picker-host .IroHandle rect) {
      stroke: white;
      stroke-width: 2px;
      rx: 999px;
   }

   :global(.iro-picker-host svg) {
      display: block;
      margin-inline: auto;
      overflow: visible;
   }
</style>
