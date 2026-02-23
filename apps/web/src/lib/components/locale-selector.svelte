<script lang="ts">
   import { LanguageCircleIcon } from "@hugeicons/core-free-icons";
   import type { Locale } from "$lib/paraglide/runtime.js";
   import { HugeiconsIcon } from "@hugeicons/svelte";
   import { locales, setLocale } from "$lib/paraglide/runtime.js";

   import { Button } from "@ota/ui/components/button/index.ts";
   import * as DropdownMenu from "@ota/ui/components/dropdown-menu/index.ts";

   const localeConfig: Record<string, { name: string; flag: string }> = {
      en: { name: "English", flag: "🇺🇸" },
   };

   async function handleLocaleChange(locale: Locale) {
      await setLocale(locale);
   }
</script>

<DropdownMenu.Root>
   <DropdownMenu.Trigger>
      {#snippet child({ props })}
         <Button variant="ghost" size="icon" {...props}>
            <HugeiconsIcon icon={LanguageCircleIcon} size={20} />
         </Button>
      {/snippet}
   </DropdownMenu.Trigger>
   <DropdownMenu.Content align="end">
      {#each locales as locale (locale)}
         {@const config = localeConfig[locale]}
         <DropdownMenu.Item onSelect={() => handleLocaleChange(locale)}>
            <span class="mr-2">{config?.flag ?? "🌐"}</span>
            {config?.name ?? locale}
         </DropdownMenu.Item>
      {/each}
   </DropdownMenu.Content>
</DropdownMenu.Root>
