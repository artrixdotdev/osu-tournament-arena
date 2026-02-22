<script lang="ts">
   import {
      ArrowDown01Icon,
      PanelLeftCloseIcon,
      PanelLeftOpenIcon,
   } from "@hugeicons/core-free-icons";
   import { HugeiconsIcon } from "@hugeicons/svelte";
   import { m } from "$lib/paraglide/messages.js";
   import { getLocale, locales, setLocale } from "$lib/paraglide/runtime.js";

   import { Button } from "@ota/ui/components/button/index.ts";
   import * as DropdownMenu from "@ota/ui/components/dropdown-menu/index.ts";
   import { Separator } from "@ota/ui/components/separator/index.ts";
   import * as Sidebar from "@ota/ui/components/sidebar/index.ts";

   const sidebar = Sidebar.useSidebar();

   const localeNames: Record<string, string> = {
      en: m["locale.en"](),
   };

   function handleLocaleChange(locale: "en") {
      setLocale(locale);
   }
</script>

<header class="bg-sidebar fixed z-20 flex w-full items-center py-2 pr-4 pl-2">
   <div class="flex items-center gap-2">
      <button
         type="button"
         class="hover:bg-sidebar-accent hover:text-sidebar-accent-foreground ml-[1.5px] flex size-8 items-center justify-center rounded-md transition-colors"
         onclick={() => sidebar.toggle()}
      >
         {#if sidebar.state === "expanded"}
            <HugeiconsIcon
               icon={PanelLeftOpenIcon}
               size={20}
               strokeWidth={1.5}
            />
         {:else}
            <HugeiconsIcon
               icon={PanelLeftCloseIcon}
               size={20}
               strokeWidth={1.5}
            />
         {/if}
      </button>
      <Separator orientation="vertical" class="mr-2 h-4" />
      <a class="flex items-center gap-2" href="/">
         <div
            class="bg-primary flex size-7 items-center justify-center rounded-md text-xs font-bold text-white"
         >
            O
         </div>
         <span class="text-sm font-semibold tracking-wide">
            {m["common.appName"]()}
         </span>
      </a>
   </div>

   <div class="ml-auto flex items-center gap-2">
      <DropdownMenu.Root>
         <DropdownMenu.Trigger>
            {#snippet child({ props })}
               <Button variant="ghost" size="sm" {...props}>
                  <span class="text-sm"
                     >{localeNames[getLocale()] ?? getLocale()}</span
                  >
                  <HugeiconsIcon icon={ArrowDown01Icon} size={16} />
               </Button>
            {/snippet}
         </DropdownMenu.Trigger>
         <DropdownMenu.Content>
            {#each locales as locale}
               <DropdownMenu.Item onSelect={() => handleLocaleChange(locale)}>
                  {localeNames[locale] ?? locale}
               </DropdownMenu.Item>
            {/each}
         </DropdownMenu.Content>
      </DropdownMenu.Root>
   </div>
</header>
