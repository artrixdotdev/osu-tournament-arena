<script lang="ts">
   import { Button } from "@ota/ui/components/button/index.ts";
   import { ColorPicker } from "@ota/ui/components/color-picker/index.ts";
   import * as Tooltip from "@ota/ui/components/tooltip/index.ts";

   import {
      hexToHslToken,
      hslTokenToHex,
      TOURNAMENT_THEME_FIELDS,
   } from "$lib/tournament-theme";

   import type { TournamentThemeColors } from "@ota/db/schema";

   interface Props {
      value?: Partial<TournamentThemeColors>;
      disabled?: boolean;
   }

   let { value = $bindable({}), disabled = false }: Props = $props();

   function setThemeColor(
      key: keyof TournamentThemeColors,
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
   <div class="space-y-3">
      <div class="flex items-center justify-between gap-3">
         <div>
            <p class="text-sm font-medium">Theme Tokens</p>
            <p class="text-muted-foreground text-xs">
               Pick only the colors you want to override.
            </p>
         </div>
         <Button
            variant="ghost"
            size="sm"
            onclick={clearAll}
            disabled={disabled || Object.keys(value).length === 0}
         >
            Clear all
         </Button>
      </div>

      <div class="flex flex-wrap gap-2">
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
                     disabled={disabled}
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
