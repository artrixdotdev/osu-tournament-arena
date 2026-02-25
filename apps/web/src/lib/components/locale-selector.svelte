<script lang="ts">
   import type { Locale } from "$paraglide/runtime.js";
   import { LanguageSquareIcon } from "@hugeicons/core-free-icons";
   import { HugeiconsIcon } from "@hugeicons/svelte";
   import { m } from "$paraglide/messages";
   import { getLocale, locales, setLocale } from "$paraglide/runtime.js";

   import { Button } from "@ota/ui/components/button/index.ts";
   import * as DropdownMenu from "@ota/ui/components/dropdown-menu/index.ts";

   let value = $state(getLocale());

   async function handleLocaleChange(locale: Locale) {
      await setLocale(locale);
   }
</script>

<DropdownMenu.Root>
   <DropdownMenu.Trigger>
      {#snippet child({ props })}
         <Button {...props} variant="ghost" size="icon-sm">
            <HugeiconsIcon icon={LanguageSquareIcon} class="size-5" />
         </Button>
      {/snippet}
   </DropdownMenu.Trigger>
   {#await import("$lib/flags").then(({ localeFlags }) => localeFlags) then localeFlags}
      <DropdownMenu.Content align="end" class="mt-4 min-w-60">
         <DropdownMenu.Label>{m.locale_selectLanguage()}</DropdownMenu.Label>
         <DropdownMenu.Separator />
         <DropdownMenu.RadioGroup bind:value>
            {#each locales as locale (locale)}
               {@const localeName = m[`locale_${locale}`]({}, { locale })}
               {@const FlagComponent = localeFlags[locale]}
               <DropdownMenu.RadioItem
                  value={locale}
                  onSelect={() => handleLocaleChange(locale)}
                  class="w-full"
               >
                  <div class="flex w-full items-center gap-2">
                     {#if FlagComponent}
                        <div
                           class="flex size-4.5 shrink-0 items-center justify-center overflow-hidden rounded-full shadow-sm"
                        >
                           <FlagComponent class="size-6" />
                        </div>
                     {/if}
                     <span>{localeName}</span>
                     <DropdownMenu.Shortcut class="ml-auto font-mono uppercase">
                        {locale}
                     </DropdownMenu.Shortcut>
                  </div>
               </DropdownMenu.RadioItem>
            {/each}
         </DropdownMenu.RadioGroup>
      </DropdownMenu.Content>
   {/await}
</DropdownMenu.Root>
