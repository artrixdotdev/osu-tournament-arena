<script lang="ts">
   import type { ButtonProps } from "@ota/ui/components/ui/button/index.js";
   import { Button } from "@ota/ui/components/ui/button/index.js";

   let { ref = $bindable(null), ...restProps }: ButtonProps = $props();
</script>

<Button bind:ref type="submit" {...restProps} />
