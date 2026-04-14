<script lang="ts" module>
   export type {
      ColorPickerProps,
      ColorPickerValue,
   } from "./color-picker.shared.js";
</script>

<script lang="ts">
   import { IsMobile } from "@ota/ui/hooks/is-mobile.svelte.js";

   import type { ColorPickerProps } from "./color-picker.shared.js";
   import NativeColorPicker from "./color-picker-native.svelte";
   import PopoverColorPicker from "./color-picker-popover.svelte";

   const isMobile = new IsMobile();

   let props: ColorPickerProps = $props();
   const popoverProps = $derived({
      ...props,
      type: props.type ?? undefined,
      id: props.id ?? undefined,
   });
</script>

{#if isMobile.current}
   <NativeColorPicker {...props} />
{:else}
   <PopoverColorPicker {...popoverProps} />
{/if}
