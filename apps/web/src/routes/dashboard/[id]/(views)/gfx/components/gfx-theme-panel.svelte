<script lang="ts">
   import { m } from "$i18n/messages";
   import TournamentThemeFields from "$lib/components/tournament-theme-fields.svelte";
   import { TOURNAMENT_FONT_OPTIONS } from "$lib/tournament-page";

   import { Button } from "@ota/ui/components/button/index.ts";
   import { Card } from "@ota/ui/components/card/index.ts";
   import { Input } from "@ota/ui/components/input/index.ts";
   import type { DashboardThemeState } from "@ota/validators";

   let {
      fontFamily = $bindable(""),
      radius = $bindable(""),
      themeMode = $bindable<"light" | "dark">("light"),
      lightTheme = $bindable<DashboardThemeState>({}),
      darkTheme = $bindable<DashboardThemeState>({}),
   }: {
      fontFamily: string;
      radius: string;
      themeMode: "light" | "dark";
      lightTheme: DashboardThemeState;
      darkTheme: DashboardThemeState;
   } = $props();
</script>

<Card as="article" variant="accent" class="space-y-5 p-6">
   <div class="space-y-2">
      <p class="text-muted-foreground text-xs tracking-[0.14em] uppercase">
         {m.common_branding()}
      </p>
      <h2 class="text-lg font-semibold tracking-[-0.03em]">
         {m.tournamentDashboard_gfx_themeTitle()}
      </h2>
      <p class="text-muted-foreground text-sm leading-6">
         {m.tournamentDashboard_gfx_themeDescription()}
      </p>
   </div>

   <div class="space-y-2">
      <label class="text-sm font-medium" for="font-family">
         {m.tournamentDashboard_field_font()}
      </label>
      <select
         id="font-family"
         bind:value={fontFamily}
         class="border-input bg-background h-11 w-full rounded-md border px-4 text-sm transition outline-none focus-visible:ring-ring/50 focus-visible:ring-[3px]"
      >
         <option value="">{m.locale_system()}</option>
         {#each TOURNAMENT_FONT_OPTIONS as font (font)}
            <option value={font}>{font}</option>
         {/each}
      </select>
   </div>

   <div class="space-y-2">
      <label class="text-sm font-medium" for="theme-radius">
         {m.common_radius()}
      </label>
      <Input
         id="theme-radius"
         bind:value={radius}
         inputmode="decimal"
         placeholder="1"
      />
   </div>

   <div class="space-y-3">
      <div class="bg-muted inline-flex rounded-md p-1 shadow-inner">
         <Button
            variant={themeMode === "light" ? "secondary" : "ghost"}
            size="sm"
            class="rounded-sm"
            onclick={() => {
               themeMode = "light";
            }}
         >
            {m.common_light()}
         </Button>
         <Button
            variant={themeMode === "dark" ? "secondary" : "ghost"}
            size="sm"
            class="rounded-sm"
            onclick={() => {
               themeMode = "dark";
            }}
         >
            {m.common_dark()}
         </Button>
      </div>

      {#if themeMode === "light"}
         <TournamentThemeFields bind:value={lightTheme} />
      {:else}
         <TournamentThemeFields bind:value={darkTheme} />
      {/if}
   </div>
</Card>
