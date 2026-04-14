<script lang="ts">
   import { m } from "$i18n/messages";
   import {
      hexToHslToken,
      hslTokenToHex,
      TOURNAMENT_THEME_FIELDS,
   } from "$lib/tournament-theme";

   import type { TournamentThemeTokens } from "@ota/db/schema";
   import { Button } from "@ota/ui/components/button/index.ts";
   import { ColorPicker } from "@ota/ui/components/color-picker/index.ts";
   import * as Tooltip from "@ota/ui/components/tooltip/index.ts";

   interface Props {
      value?: Partial<TournamentThemeTokens>;
      disabled?: boolean;
   }

   let { value = $bindable({}), disabled = false }: Props = $props();

   function setThemeColor(
      key: keyof TournamentThemeTokens,
      nextValue?: string | null,
   ) {
      const normalized = nextValue?.trim();
      const nextTheme = { ...value };

      if (normalized) {
         nextTheme[key] = normalized;
      } else {
         delete nextTheme[key];
      }

      value = nextTheme;
   }

   function clearAll() {
      value = {};
   }
</script>

<Tooltip.Provider delayDuration={120}>
   <div class="space-y-4">
      <div class="flex items-start justify-between gap-3">
         <div class="space-y-1">
            <p class="text-sm font-medium">
               {m.tournamentDashboard_themeTokens_title()}
            </p>
            <p class="text-muted-foreground text-xs">
               {m.tournamentDashboard_themeTokens_description()}
            </p>
         </div>
         <Button
            variant="ghost"
            size="sm"
            onclick={clearAll}
            disabled={disabled || Object.keys(value).length === 0}
         >
            {m.common_clearAll()}
         </Button>
      </div>

      <div class="grid grid-cols-5 gap-2 sm:grid-cols-6">
         {#each TOURNAMENT_THEME_FIELDS as field (field.key)}
            <Tooltip.Root>
               <Tooltip.Trigger>
                  <ColorPicker
                     label={field.label}
                     variant="pill"
                     value={hslTokenToHex(value[field.key])}
                     onValueChange={(nextValue: `#${string}`) => {
                        setThemeColor(field.key, hexToHslToken(nextValue));
                     }}
                     {disabled}
                     class="h-14 w-full rounded-2xl"
                  />
               </Tooltip.Trigger>
               <Tooltip.Content side="top" sideOffset={8}>
                  <div class="space-y-0.5">
                     <p>{field.label}</p>
                     <p class="font-mono text-[10px]">
                        {value[field.key] ?? field.placeholder}
                     </p>
                  </div>
               </Tooltip.Content>
            </Tooltip.Root>
         {/each}
      </div>
   </div>
</Tooltip.Provider>
