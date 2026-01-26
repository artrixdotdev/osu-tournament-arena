<script lang="ts">
	import favicon from '$lib/assets/favicon.svg';

	import "@ota/tailwind-config/theme";
	import { Button } from "@ota/ui/components/button/index.ts"

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

{@render children?.()}
