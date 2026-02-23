<script lang="ts">
   import type { Locale } from "$lib/paraglide/runtime.js";
   import { LanguageSquareIcon } from "@hugeicons/core-free-icons";
   import { HugeiconsIcon } from "@hugeicons/svelte";
   import { m } from "$lib/paraglide/messages";
   import { getLocale, locales, setLocale } from "$lib/paraglide/runtime.js";

   import { Button } from "@ota/ui/components/button/index.ts";
   import * as Select from "@ota/ui/components/select/index.ts";

   const localeNames: Record<Locale, string> = {
      en: m.locale_en(),
   };

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
   <Select.Trigger class="h-8 w-fit gap-1.5 px-2">
      <HugeiconsIcon
         icon={LanguageSquareIcon}
         size={18}
         class="h-4.5! w-4.5!"
      />
   </Select.Trigger>
   <Select.Content class="mr-4">
      {#each locales as locale (locale)}
         <Select.Item value={locale} label={localeNames[locale] ?? locale}>
            {localeNames[locale] ?? locale}
         </Select.Item>
      {/each}
   </Select.Content>
</Select.Root>
