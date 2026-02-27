<script lang="ts">
   import { Combobox as ComboboxPrimitive } from "bits-ui";

   let { children, ...restProps }: ComboboxPrimitive.PortalProps = $props();
</script>

<ComboboxPrimitive.Portal {...restProps}>
   {@render children?.()}
</ComboboxPrimitive.Portal>
