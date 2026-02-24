<script lang="ts">
   import type { Locale } from "$lib/paraglide/runtime.js";
   import { LanguageSquareIcon } from "@hugeicons/core-free-icons";
   import { HugeiconsIcon } from "@hugeicons/svelte";
   import { m } from "$lib/paraglide/messages";
   import { getLocale, locales, setLocale } from "$lib/paraglide/runtime.js";

   import * as Select from "@ota/ui/components/select/index.ts";

   let value = $state(getLocale());

   async function handleLocaleChange(locale: Locale) {
      await setLocale(locale);
   }
</script>

<Select.Root
   type="single"
   bind:value
   onValueChange={(v) => handleLocaleChange(v as Locale)}
>
   <Select.Trigger class="m-0 h-5! w-fit gap-1.5 border-none p-0 ">
      <HugeiconsIcon icon={LanguageSquareIcon} size={18} class="h-5! w-5!" />
   </Select.Trigger>
   <Select.Content class="mr-4">
      {#each locales as locale (locale)}
         <!-- Gets the locale name in its native language -->
         {@const localeName = m[`locale_${locale}`]({}, { locale })}
         <Select.Item value={locale} label={localeName}>
            {localeName}
         </Select.Item>
      {/each}
   </Select.Content>
</Select.Root>
