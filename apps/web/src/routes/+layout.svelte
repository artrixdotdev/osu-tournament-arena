<script lang="ts">
   import favicon from "$lib/assets/favicon.svg";

   import "@ota/tailwind-config/theme";
   import "@ota/tailwind-config/fonts";

   let { children } = $props();
</script>

<svelte:head>
   <link rel="icon" href={favicon} />
</svelte:head>

{@render children?.()}
